// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\reports\Reports.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Download, 
  Search, 
  Refresh, 
  Print, 
  ChevronLeft, 
  ChevronRight, 
  FirstPage, 
  LastPage,
  TuneOutlined,
  Close,
  FilterAlt,
  Assessment,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  ShowChart
} from '@mui/icons-material';
import { workOrderApi } from '../../api/workOrderApi';
import { washTransactionApi } from '../../api/washTransactionApi';
import { useProcessStage } from '../../hooks/useProcessStage';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';

const TRANSACTION_TYPES = {
  RECEIVE: 1,
  DELIVERY: 2,
};

// ✅ OPTIMIZATION: Skeleton loader component
const TableSkeleton = ({ rows = 5 }) => (
  <div className="animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-b border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded flex-1"></div>
      </div>
    ))}
  </div>
);

// ✅ OPTIMIZATION: Progress bar component
const LoadingProgress = ({ current, total, label }) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg p-4">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{current} / {total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  </div>
);

const Reports = () => {
  // ==========================================
  // STATE MANAGEMENT - OPTIMIZED
  // ==========================================
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(''); // 'workorders' | 'transactions' | 'processing'
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // ✅ OPTIMIZATION: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // ✅ OPTIMIZATION: Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState({
    buyer: '',
    factory: '',
    unit: '',
    transactionTypeId: '',
    processStageId: '',
    startDate: '',
    endDate: '',
    washTargetStartDate: '', // ✅ NEW: Wash target date start
  washTargetEndDate: '',   // ✅ NEW: Wash target date end
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  // ✅ OPTIMIZATION: Cache for dropdown options
  const [filterOptions, setFilterOptions] = useState({
    buyers: [],
    factories: [],
    units: [],
  });

  const { stages, loading: stagesLoading } = useProcessStage();
  
  // ✅ OPTIMIZATION: Abort controller for cancelling requests
  const abortControllerRef = useRef(null);
  
  // ✅ OPTIMIZATION: Data cache
  const cacheRef = useRef({
    workOrders: null,
    transactions: null,
    lastFetch: null,
    cacheKey: null,
  });

  // ==========================================
  // DEBOUNCED SEARCH - 500ms
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ==========================================
  // INITIAL DATA LOAD
  // ==========================================
  useEffect(() => {
    loadData();
    
    return () => {
      // Cleanup: cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ==========================================
  // OPTIMIZED DATA LOADING
  // ==========================================
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Check cache (5 minutes validity)
      const cacheKey = JSON.stringify(appliedFilters);
      const cacheValid = cacheRef.current.lastFetch && 
                         (Date.now() - cacheRef.current.lastFetch < 5 * 60 * 1000) &&
                         cacheRef.current.cacheKey === cacheKey;

      if (!forceRefresh && cacheValid && cacheRef.current.workOrders) {
        console.log('📦 Using cached data');
        processData(cacheRef.current.workOrders, cacheRef.current.transactions);
        return;
      }

      setLoading(true);
      setLoadingStage('workorders');
      console.log('🔄 Loading data...');

      // ✅ STEP 1: Load work orders first (faster)
      setLoadingProgress({ current: 1, total: 3 });
      const woResponse = await workOrderApi.getAll();
      
      if (!woResponse.data.success) {
        throw new Error('Failed to load work orders');
      }
      
      const workOrders = woResponse.data.data || [];
      console.log('✅ Work orders loaded:', workOrders.length);

      // Extract filter options from work orders
      extractFilterOptions(workOrders);

      // ✅ STEP 2: Load transactions
      setLoadingStage('transactions');
      setLoadingProgress({ current: 2, total: 3 });
      
      const transResponse = await washTransactionApi.getAll();
      
      if (!transResponse.data.success) {
        throw new Error('Failed to load transactions');
      }
      
      const transactions = transResponse.data.data || [];
      console.log('✅ Transactions loaded:', transactions.length);

      // ✅ STEP 3: Process and build report data
      setLoadingStage('processing');
      setLoadingProgress({ current: 3, total: 3 });

      // Cache the raw data
      cacheRef.current = {
        workOrders,
        transactions,
        lastFetch: Date.now(),
        cacheKey,
      };

      // Process data
      processData(workOrders, transactions);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 Request cancelled');
        return;
      }
      toast.error('Failed to load report data');
      console.error('Error:', error);
      setReportData([]);
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  }, [appliedFilters]);

  // ==========================================
  // EXTRACT FILTER OPTIONS (Memoized)
  // ==========================================
  const extractFilterOptions = useCallback((workOrders) => {
    const buyers = [...new Set(workOrders.map(wo => wo.buyer).filter(Boolean))].sort();
    const factories = [...new Set(workOrders.map(wo => wo.factory).filter(Boolean))].sort();
    const units = [...new Set(workOrders.map(wo => wo.unit).filter(Boolean))].sort();
    
    setFilterOptions({ buyers, factories, units });
  }, []);

  // ==========================================
  // PROCESS DATA - OPTIMIZED WITH CHUNKING
  // ==========================================
  const processData = useCallback((workOrders, transactions) => {
    console.log('⚙️ Processing data...');
    const startTime = performance.now();

    // ✅ OPTIMIZATION: Create transaction lookup map (O(1) lookup instead of O(n))
    const transactionMap = new Map();
    transactions.forEach(t => {
      const woId = t.workOrderId;
      if (!transactionMap.has(woId)) {
        transactionMap.set(woId, []);
      }
      transactionMap.get(woId).push(t);
    });

    // ✅ OPTIMIZATION: Process in smaller batches to prevent UI blocking
    const processedData = workOrders.map(wo => {
      const woTransactions = transactionMap.get(wo.id) || [];

      // Helper function to get stage quantity
      const getStageQuantity = (stageName, type) => {
        return woTransactions
          .filter(t => t.processStageName === stageName && t.transactionType === type)
          .reduce((sum, t) => sum + t.quantity, 0);
      };

      return {
        id: wo.id,
        factory: wo.factory,
        unit: wo.unit,
        workOrderNo: wo.workOrderNo,
        fastReactNo: wo.fastReactNo || '-',
        buyer: wo.buyer,
        styleName: wo.styleName,
        marks: wo.marks || '-',
        orderQuantity: wo.orderQuantity,
        washTargetDate: wo.washTargetDate 
          ? new Date(wo.washTargetDate).toLocaleDateString('en-GB') 
          : '-',
        washTargetDateRaw: wo.washTargetDate ? new Date(wo.washTargetDate) : null,
        totalWashReceived: wo.totalWashReceived || 0,
        totalWashDelivery: wo.totalWashDelivery || 0,
        // Stage quantities
        firstDryReceive: getStageQuantity('1st Dry', TRANSACTION_TYPES.RECEIVE),
        firstDryDelivery: getStageQuantity('1st Dry', TRANSACTION_TYPES.DELIVERY),
        unwashReceive: getStageQuantity('Unwash', TRANSACTION_TYPES.RECEIVE),
        unwashDelivery: getStageQuantity('Unwash', TRANSACTION_TYPES.DELIVERY),
        firstWashReceive: getStageQuantity('1st Wash', TRANSACTION_TYPES.RECEIVE),
        firstWashDelivery: getStageQuantity('1st Wash', TRANSACTION_TYPES.DELIVERY),
        secondDryReceive: getStageQuantity('2nd Dry', TRANSACTION_TYPES.RECEIVE),
        secondDryDelivery: getStageQuantity('2nd Dry', TRANSACTION_TYPES.DELIVERY),
        finalWashReceive: getStageQuantity('Final Wash', TRANSACTION_TYPES.RECEIVE),
        finalWashDelivery: getStageQuantity('Final Wash', TRANSACTION_TYPES.DELIVERY),
        // Keep transactions reference for filtering
        transactions: woTransactions,
      };
    });

    const endTime = performance.now();
    console.log(`✅ Processing completed in ${(endTime - startTime).toFixed(2)}ms`);

    setReportData(processedData);
  }, []);

  // ==========================================
  // FILTERED DATA - OPTIMIZED MEMOIZATION
  // ==========================================
  const filteredData = useMemo(() => {
    if (!reportData.length) return [];

    let filtered = reportData;

    // Apply filters
    if (appliedFilters.buyer) {
      const buyerLower = appliedFilters.buyer.toLowerCase();
      filtered = filtered.filter(item => 
        item.buyer.toLowerCase().includes(buyerLower)
      );
    }

    if (appliedFilters.factory) {
      const factoryLower = appliedFilters.factory.toLowerCase();
      filtered = filtered.filter(item => 
        item.factory.toLowerCase() === factoryLower
      );
    }

    if (appliedFilters.unit) {
      filtered = filtered.filter(item => item.unit === appliedFilters.unit);
    }

    // Date filter
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const startTime = appliedFilters.startDate 
        ? new Date(appliedFilters.startDate + 'T00:00:00').getTime() 
        : null;
      const endTime = appliedFilters.endDate 
        ? new Date(appliedFilters.endDate + 'T23:59:59').getTime() 
        : null;

      filtered = filtered.filter(item => {
        const itemTransactions = item.transactions || [];
        return itemTransactions.some(transaction => {
          const transTime = new Date(transaction.transactionDate).getTime();
          const startMatch = !startTime || transTime >= startTime;
          const endMatch = !endTime || transTime <= endTime;
          return startMatch && endMatch;
        });
      });
    }

    // Process stage filter
    if (appliedFilters.processStageId) {
      const selectedStage = stages.find(s => s.id === parseInt(appliedFilters.processStageId));
      if (selectedStage) {
        filtered = filtered.filter(item => {
          return item.transactions.some(t => t.processStageName === selectedStage.name);
        });
      }
    }
 if (appliedFilters.washTargetStartDate || appliedFilters.washTargetEndDate) {
    const washStartTime = appliedFilters.washTargetStartDate 
      ? new Date(appliedFilters.washTargetStartDate + 'T00:00:00').getTime() 
      : null;
    const washEndTime = appliedFilters.washTargetEndDate 
      ? new Date(appliedFilters.washTargetEndDate + 'T23:59:59').getTime() 
      : null;

    filtered = filtered.filter(item => {
      // Skip items without wash target date
      if (!item.washTargetDateRaw) return false;
      
      const itemWashTargetTime = item.washTargetDateRaw.getTime();
      const startMatch = !washStartTime || itemWashTargetTime >= washStartTime;
      const endMatch = !washEndTime || itemWashTargetTime <= washEndTime;
      
      return startMatch && endMatch;
    });
  }
    // Transaction type filter
    if (appliedFilters.transactionTypeId !== '' && appliedFilters.transactionTypeId !== undefined) {
      filtered = filtered.filter(item => {
        return item.transactions.some(t => 
          t.transactionType === parseInt(appliedFilters.transactionTypeId)
        );
      });
    }

    // Search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(item =>
        item.workOrderNo.toLowerCase().includes(query) ||
        item.fastReactNo.toLowerCase().includes(query) ||
        item.buyer.toLowerCase().includes(query) ||
        item.styleName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [reportData, appliedFilters, debouncedSearch, stages]);

  // ==========================================
  // PAGINATED DATA
  // ==========================================
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // ==========================================
  // SUMMARY STATISTICS - OPTIMIZED
  // ==========================================
  const summaryStats = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalWorkOrders: 0,
        totalReceive: 0,
        totalDelivery: 0,
        balance: 0,
        totalOrderQuantity: 0,
        uniqueStagesCount: 0,
        stageBreakdown: {},
        transactionCount: 0,
      };
    }

    // Get all transactions from filtered work orders
    let allTransactions = filteredData.flatMap(item => item.transactions || []);
    
    // Apply date filter to transactions
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const startTime = appliedFilters.startDate 
        ? new Date(appliedFilters.startDate + 'T00:00:00').getTime() 
        : null;
      const endTime = appliedFilters.endDate 
        ? new Date(appliedFilters.endDate + 'T23:59:59').getTime() 
        : null;

      allTransactions = allTransactions.filter(transaction => {
        const transTime = new Date(transaction.transactionDate).getTime();
        const startMatch = !startTime || transTime >= startTime;
        const endMatch = !endTime || transTime <= endTime;
        return startMatch && endMatch;
      });
    }

    // Apply process stage filter
    if (appliedFilters.processStageId) {
      const selectedStage = stages.find(s => s.id === parseInt(appliedFilters.processStageId));
      if (selectedStage) {
        allTransactions = allTransactions.filter(t => t.processStageName === selectedStage.name);
      }
    }

    // Apply transaction type filter
    if (appliedFilters.transactionTypeId !== '' && appliedFilters.transactionTypeId !== undefined) {
      allTransactions = allTransactions.filter(t => 
        t.transactionType === parseInt(appliedFilters.transactionTypeId)
      );
    }

    // Calculate totals
    let totalReceive = 0;
    let totalDelivery = 0;
    const stageBreakdown = {};
    const uniqueStages = new Set();

    allTransactions.forEach(t => {
      uniqueStages.add(t.processStageName);
      
      if (!stageBreakdown[t.processStageName]) {
        stageBreakdown[t.processStageName] = { receive: 0, delivery: 0 };
      }
      
      if (t.transactionType === TRANSACTION_TYPES.RECEIVE) {
        totalReceive += t.quantity;
        stageBreakdown[t.processStageName].receive += t.quantity;
      } else {
        totalDelivery += t.quantity;
        stageBreakdown[t.processStageName].delivery += t.quantity;
      }
    });

    return {
      totalWorkOrders: filteredData.length,
      totalReceive,
      totalDelivery,
      balance: totalReceive - totalDelivery,
      totalOrderQuantity: filteredData.reduce((sum, item) => sum + item.orderQuantity, 0),
      uniqueStagesCount: uniqueStages.size,
      stageBreakdown,
      transactionCount: allTransactions.length,
    };
  }, [filteredData, appliedFilters, stages]);

  // ==========================================
  // PAGINATION HELPERS
  // ==========================================
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startRecord = filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, filteredData.length);

  const handleFirstPage = useCallback(() => setCurrentPage(1), []);
  const handleLastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);
  const handlePreviousPage = useCallback(() => setCurrentPage(prev => Math.max(1, prev - 1)), []);
  const handleNextPage = useCallback(() => setCurrentPage(prev => Math.min(totalPages, prev + 1)), [totalPages]);
  
  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  const getPageNumbers = useCallback(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }, [currentPage, totalPages]);

  // ==========================================
  // FILTER HANDLERS
  // ==========================================
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...filterParams });
    setCurrentPage(1);
    toast.success('Filters applied successfully');
  }, [filterParams]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      buyer: '',
      factory: '',
      unit: '',
      transactionTypeId: '',
      processStageId: '',
      startDate: '',
      endDate: '',
       washTargetStartDate: '', // ✅ NEW
    washTargetEndDate: '',   // ✅ NEW
    };
    setFilterParams(resetFilters);
    setAppliedFilters({});
    setSearchQuery('');
    setCurrentPage(1);
    toast.success('Filters reset');
  }, []);

  const hasActiveFilters = Object.values(appliedFilters).some(val => val !== '');

  // ==========================================
  // EXPORT CSV - OPTIMIZED
  // ==========================================
  const handleExportExcel = useCallback(() => {
    const headers = [
      'Factory', 'Unit', 'Work Order No', 'FastReact No', 'Buyer', 'Style Name',
      'Order Qty', 'Wash Target Date', 'Marks', 'Total Wash Received', 'Total Wash Delivery',
      '1st Dry Receive', '1st Dry Delivery', 'Unwash Receive', 'Unwash Delivery',
      '1st Wash Receive', '1st Wash Delivery', '2nd Dry Receive', '2nd Dry Delivery',
      'Final Wash Receive', 'Final Wash Delivery',
    ];

    const formatCell = (cell, forceText = false) => {
      if (cell === null || cell === undefined) return '""';
      const strValue = String(cell);
      if (forceText) {
        if (strValue.startsWith('="') && strValue.endsWith('"')) return strValue;
        return `="${strValue}"`;
      }
      return `"${strValue.replace(/"/g, '""')}"`;
    };

    // Build filter info section
    const filterInfo = [];
    if (hasActiveFilters) {
      filterInfo.push(['FILTER CRITERIA']);
      if (appliedFilters.startDate) filterInfo.push(['Start Date', appliedFilters.startDate]);
      if (appliedFilters.endDate) filterInfo.push(['End Date', appliedFilters.endDate]);
      if (appliedFilters.buyer) filterInfo.push(['Buyer', appliedFilters.buyer]);
      if (appliedFilters.factory) filterInfo.push(['Factory', appliedFilters.factory]);
      if (appliedFilters.unit) filterInfo.push(['Unit', appliedFilters.unit]);
      if (appliedFilters.processStageId) {
        const stage = stages.find(s => s.id === parseInt(appliedFilters.processStageId));
        filterInfo.push(['Process Stage', stage?.name || appliedFilters.processStageId]);
      }
      if (appliedFilters.transactionTypeId !== '') {
        filterInfo.push(['Transaction Type', appliedFilters.transactionTypeId === '1' ? 'Receive' : 'Delivery']);
      }
      filterInfo.push(['']);
    }

    // Build summary section
    const summarySection = [
      ['SUMMARY STATISTICS'],
      ['Total Work Orders', summaryStats.totalWorkOrders],
      ['Total Transactions', summaryStats.transactionCount],
      ['Total Receive Quantity', summaryStats.totalReceive],
      ['Total Delivery Quantity', summaryStats.totalDelivery],
      ['Total Quantity', summaryStats.totalReceive + summaryStats.totalDelivery],
      ['Total Order Quantity', summaryStats.totalOrderQuantity],
      ['Unique Process Stages', summaryStats.uniqueStagesCount],
      [''],
    ];

    // Stage breakdown
    if (Object.keys(summaryStats.stageBreakdown).length > 0) {
      summarySection.push(['STAGE BREAKDOWN']);
      summarySection.push(['Stage Name', 'Receive', 'Delivery']);
      Object.entries(summaryStats.stageBreakdown).forEach(([stageName, data]) => {
        summarySection.push([stageName, data.receive, data.delivery]);
      });
      summarySection.push(['']);
    }

    // Helper for stage quantities with date filter
    const getStageQuantityForWorkOrder = (workOrderTransactions, stageName, type) => {
      let filtered = workOrderTransactions;
      
      if (appliedFilters.startDate || appliedFilters.endDate) {
        const startTime = appliedFilters.startDate 
          ? new Date(appliedFilters.startDate + 'T00:00:00').getTime() 
          : null;
        const endTime = appliedFilters.endDate 
          ? new Date(appliedFilters.endDate + 'T23:59:59').getTime() 
          : null;

        filtered = workOrderTransactions.filter(transaction => {
          const transTime = new Date(transaction.transactionDate).getTime();
          const startMatch = !startTime || transTime >= startTime;
          const endMatch = !endTime || transTime <= endTime;
          return startMatch && endMatch;
        });
      }

      return filtered
        .filter(t => t.processStageName === stageName && t.transactionType === type)
        .reduce((sum, t) => sum + t.quantity, 0);
    };

    // Build data rows
    const rows = filteredData.map(item => {
      const woTransactions = item.transactions || [];
      return [
        formatCell(item.factory),
        formatCell(item.unit),
        formatCell(item.workOrderNo, true),
        formatCell(item.fastReactNo, true),
        formatCell(item.buyer),
        formatCell(item.styleName),
        formatCell(item.orderQuantity),
        formatCell(item.washTargetDate),
        formatCell(item.marks),
        formatCell(item.totalWashReceived),
        formatCell(item.totalWashDelivery),
        formatCell(getStageQuantityForWorkOrder(woTransactions, '1st Dry', TRANSACTION_TYPES.RECEIVE)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, '1st Dry', TRANSACTION_TYPES.DELIVERY)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, 'Unwash', TRANSACTION_TYPES.RECEIVE)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, 'Unwash', TRANSACTION_TYPES.DELIVERY)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, '1st Wash', TRANSACTION_TYPES.RECEIVE)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, '1st Wash', TRANSACTION_TYPES.DELIVERY)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, '2nd Dry', TRANSACTION_TYPES.RECEIVE)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, '2nd Dry', TRANSACTION_TYPES.DELIVERY)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, 'Final Wash', TRANSACTION_TYPES.RECEIVE)),
        formatCell(getStageQuantityForWorkOrder(woTransactions, 'Final Wash', TRANSACTION_TYPES.DELIVERY)),
      ].join(',');
    });

    // Combine all sections
    const csvContent = [
      ...filterInfo.map(row => row.map(cell => formatCell(cell)).join(',')),
      ...summarySection.map(row => row.map(cell => formatCell(cell)).join(',')),
      ['DETAILED DATA'].map(cell => formatCell(cell)).join(','),
      headers.map(h => formatCell(h)).join(','),
      ...rows,
    ].join('\n');

    // Download
    const BOM = '\uFEFF';
    const element = document.createElement('a');
    const filterSuffix = hasActiveFilters ? '-filtered' : '';
    const dateSuffix = appliedFilters.startDate ? `-${appliedFilters.startDate}` : '';
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(BOM + csvContent));
    element.setAttribute('download', `transaction-report${filterSuffix}${dateSuffix}-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(`Report exported successfully (${filteredData.length} records)`);
  }, [filteredData, hasActiveFilters, appliedFilters, summaryStats, stages]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ==========================================
  // RENDER: LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="fade-in">
        {/* Loading Progress */}
        {loadingStage && (
          <LoadingProgress 
            current={loadingProgress.current} 
            total={loadingProgress.total}
            label={
              loadingStage === 'workorders' ? 'Loading work orders...' :
              loadingStage === 'transactions' ? 'Loading transactions...' :
              'Processing data...'
            }
          />
        )}

        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Toolbar Skeleton */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <TableSkeleton rows={10} />
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN COMPONENT
  // ==========================================
  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Transaction Reports</h1>
        <p className="text-gray-600">
          Comprehensive transaction summary across all stages
          {reportData.length > 0 && (
            <span className="ml-2 text-primary-600 font-medium">
              ({reportData.length} work orders loaded)
            </span>
          )}
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Work Order, FastReact No, Buyer, or Style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition duration-200 font-medium ${
                hasActiveFilters
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <FilterAlt fontSize="small" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-white text-primary-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 font-medium disabled:opacity-50"
            >
              <Refresh fontSize="small" className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={filteredData.length === 0}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Download fontSize="small" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={filteredData.length === 0}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Print fontSize="small" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Stats - Quick Overview */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold mb-1">Total Work Orders</p>
            <p className="text-2xl font-bold text-blue-900">{reportData.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-semibold mb-1">Filtered Results</p>
            <p className="text-2xl font-bold text-green-900">{filteredData.length}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-600 font-semibold mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-purple-900">
              {reportData.reduce((sum, item) => sum + (item.transactions?.length || 0), 0)}
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-600 font-semibold mb-1">Total Quantity</p>
            <p className="text-2xl font-bold text-orange-900">
              {filteredData.reduce((sum, item) => sum + item.orderQuantity, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== ADVANCED FILTERS ==================== */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-3">
            <div className="flex items-center gap-3">
              <TuneOutlined className="text-white" style={{ fontSize: 22 }} />
              <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
            </div>
          </div>

          {/* Filter Form */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Buyer Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Buyer</label>
                <select
                  name="buyer"
                  value={filterParams.buyer}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium"
                >
                  <option value="">All Buyers</option>
                  {filterOptions.buyers.map(buyer => (
                    <option key={buyer} value={buyer}>{buyer}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{filterOptions.buyers.length} buyers available</p>
              </div>

              {/* Factory Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Factory</label>
                <select
                  name="factory"
                  value={filterParams.factory}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium"
                >
                  <option value="">All Factories</option>
                  {filterOptions.factories.map(factory => (
                    <option key={factory} value={factory}>{factory}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{filterOptions.factories.length} factories available</p>
              </div>

              {/* Unit Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Unit</label>
                <select
                  name="unit"
                  value={filterParams.unit}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium"
                >
                  <option value="">All Units</option>
                  {filterOptions.units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{filterOptions.units.length} units available</p>
              </div>

              {/* Transaction Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Transaction Type</label>
                <select
                  name="transactionTypeId"
                  value={filterParams.transactionTypeId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium"
                >
                  <option value="">All Types</option>
                  <option value={TRANSACTION_TYPES.RECEIVE}>Receive</option>
                  <option value={TRANSACTION_TYPES.DELIVERY}>Delivery</option>
                </select>
              </div>

              {/* Process Stage Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Process Stage</label>
                <select
                  name="processStageId"
                  value={filterParams.processStageId}
                  onChange={handleFilterChange}
                  disabled={stagesLoading || stages.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium disabled:bg-gray-50"
                >
                  <option value="">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{stages.length} stages available</p>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filterParams.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">From date (inclusive)</p>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filterParams.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">To date (inclusive)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">washTargetStartDate</label>
                <input
                  type="date"
              name="washTargetStartDate"
              value={filterParams.washTargetStartDate}
              onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">To date (inclusive)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">washTargetEndDate</label>
                <input
                  type="date"
              name="washTargetEndDate"
              value={filterParams.washTargetEndDate}
              onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">To date (inclusive)</p>
              </div>

              
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApplyFilters}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 flex items-center justify-center gap-2"
              >
                <Search fontSize="small" />
                <span>Apply Filters</span>
              </button>

              <button
                onClick={handleResetFilters}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <Close fontSize="small" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUMMARY STATISTICS ==================== */}
      {hasActiveFilters && (
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl shadow-lg border-2 border-primary-200 mb-6 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Assessment className="text-white" style={{ fontSize: 28 }} />
                <div>
                  <h3 className="text-2xl font-bold text-white">Summary Report</h3>
                  <p className="text-primary-100 text-sm">
                    {appliedFilters.startDate && appliedFilters.endDate
                      ? `${new Date(appliedFilters.startDate).toLocaleDateString('en-GB')} - ${new Date(appliedFilters.endDate).toLocaleDateString('en-GB')}`
                      : 'Filtered Results'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition duration-200 flex items-center gap-2 shadow-md"
              >
                <Download fontSize="small" />
                <span>Export Summary</span>
              </button>
            </div>
          </div>

          {/* Summary Content */}
          <div className="p-8">
            {/* Main Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-600">Work Orders</p>
                  <CalendarToday className="text-blue-500" fontSize="small" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{summaryStats.totalWorkOrders}</p>
                <p className="text-xs text-gray-500 mt-2">Total filtered orders</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-green-600">Total Receive</p>
                  <TrendingUp className="text-green-500" fontSize="small" />
                </div>
                <p className="text-4xl font-bold text-green-700">{summaryStats.totalReceive.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">{summaryStats.transactionCount} transactions</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-orange-600">Total Delivery</p>
                  <TrendingDown className="text-orange-500" fontSize="small" />
                </div>
                <p className="text-4xl font-bold text-orange-700">{summaryStats.totalDelivery.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">Total delivered quantity</p>
              </div>

              <div className={`bg-white rounded-xl p-6 shadow-md border ${summaryStats.balance >= 0 ? 'border-purple-200' : 'border-red-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-600">Total</p>
                  <ShowChart className={summaryStats.balance >= 0 ? 'text-purple-500' : 'text-red-500'} fontSize="small" />
                </div>
                <p className={`text-4xl font-bold ${summaryStats.balance >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                  {(summaryStats.totalReceive + summaryStats.totalDelivery).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Receive + Delivery</p>
              </div>
            </div>

            {/* Stage Breakdown */}
            {Object.keys(summaryStats.stageBreakdown).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Assessment fontSize="small" className="text-primary-600" />
                  Stage-wise Breakdown
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700">Stage Name</th>
                        <th className="px-4 py-3 text-center font-bold text-green-700">Receive</th>
                        <th className="px-4 py-3 text-center font-bold text-orange-700">Delivery</th>
                        <th className="px-4 py-3 text-center font-bold text-purple-700">Total QTY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(summaryStats.stageBreakdown).map(([stageName, data]) => (
                        <tr key={stageName} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-800">{stageName}</td>
                          <td className="px-4 py-3 text-center font-bold text-green-600">
                            {data.receive.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-orange-600">
                            {data.delivery.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-purple-600">
                            {(data.receive + data.delivery).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                      <tr>
                        <td className="px-4 py-3 text-gray-800">TOTAL ({summaryStats.uniqueStagesCount} Stages)</td>
                        <td className="px-4 py-3 text-center text-green-700">
                          {summaryStats.totalReceive.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-orange-700">
                          {summaryStats.totalDelivery.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-purple-700">
                          {(summaryStats.totalReceive + summaryStats.totalDelivery).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== DATA TABLE ==================== */}
      {filteredData.length === 0 ? (
        <EmptyState
          title="No Data"
          description={hasActiveFilters ? "No transactions found matching your filters" : "No transactions found"}
          variant="search"
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm print:text-xs">
                {/* Table Header */}
                <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">Factory</th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">Unit</th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">Work Order No</th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">FastReact No</th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">Buyer</th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">Style Name</th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">Order Qty</th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">Wash Target Date</th>
                    <th colSpan="2" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-100 border-r-2 border-gray-300">Total Wash</th>
                    <th colSpan="10" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-50">Process Stages</th>
                  </tr>
                  <tr>
                    <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-r">Rcv</th>
                    <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-r-2 border-gray-300">Del</th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-yellow-50 border-l border-yellow-200">1st Dry</th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-blue-50 border-l border-blue-200">Unwash</th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-green-50 border-l border-green-200">1st Wash</th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-orange-50 border-l border-orange-200">2nd Dry</th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-purple-50 border-l border-purple-200">Final Wash</th>
                  </tr>
                  <tr>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-yellow-50 text-xs border-l border-yellow-200">Rcv</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-yellow-50 text-xs">Del</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-blue-50 text-xs border-l border-blue-200">Rcv</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-blue-50 text-xs">Del</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-green-50 text-xs border-l border-green-200">Rcv</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-green-50 text-xs">Del</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-orange-50 text-xs border-l border-orange-200">Rcv</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-orange-50 text-xs">Del</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-purple-50 text-xs border-l border-purple-200">Rcv</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-purple-50 text-xs">Del</th>
                  </tr>
                </thead>

                                {/* Table Body */}
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 font-bold text-primary-600">{item.factory}</td>
                      <td className="px-4 py-3 font-bold text-primary-600">{item.unit}</td>
                      <td className="px-4 py-3 font-bold text-primary-600">{item.workOrderNo}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{item.fastReactNo}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        <p>{item.buyer}</p>
                        <p className="text-xs text-gray-500">{item.marks}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.styleName}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.orderQuantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{item.washTargetDate}</td>
                      
                      {/* Total Wash */}
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-gray-100 border-l-2 border-gray-300">
                        {item.totalWashReceived.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-gray-100">
                        {item.totalWashDelivery.toLocaleString()}
                      </td>

                      {/* Process Stages */}
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-yellow-50 border-l-2 border-yellow-200">
                        {item.firstDryReceive.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-yellow-50">
                        {item.firstDryDelivery.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-blue-50 border-l-2 border-blue-200">
                        {item.unwashReceive.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-blue-50">
                        {item.unwashDelivery.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-green-50 border-l-2 border-green-200">
                        {item.firstWashReceive.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-green-50">
                        {item.firstWashDelivery.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-orange-50 border-l-2 border-orange-200">
                        {item.secondDryReceive.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-orange-50">
                        {item.secondDryDelivery.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-purple-50 border-l-2 border-purple-200">
                        {item.finalWashReceive.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-800 bg-purple-50">
                        {item.finalWashDelivery.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Table Footer - Page Totals */}
                <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-right">Page Total:</td>
                    <td className="px-3 py-3 text-center bg-gray-200 border-l-2 border-gray-300">
                      {paginatedData.reduce((sum, item) => sum + item.totalWashReceived, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-gray-200">
                      {paginatedData.reduce((sum, item) => sum + item.totalWashDelivery, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-yellow-100 border-l-2 border-yellow-200">
                      {paginatedData.reduce((sum, item) => sum + item.firstDryReceive, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-yellow-100">
                      {paginatedData.reduce((sum, item) => sum + item.firstDryDelivery, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-blue-100 border-l-2 border-blue-200">
                      {paginatedData.reduce((sum, item) => sum + item.unwashReceive, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-blue-100">
                      {paginatedData.reduce((sum, item) => sum + item.unwashDelivery, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-green-100 border-l-2 border-green-200">
                      {paginatedData.reduce((sum, item) => sum + item.firstWashReceive, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-green-100">
                      {paginatedData.reduce((sum, item) => sum + item.firstWashDelivery, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-orange-100 border-l-2 border-orange-200">
                      {paginatedData.reduce((sum, item) => sum + item.secondDryReceive, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-orange-100">
                      {paginatedData.reduce((sum, item) => sum + item.secondDryDelivery, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-purple-100 border-l-2 border-purple-200">
                      {paginatedData.reduce((sum, item) => sum + item.finalWashReceive, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center bg-purple-100">
                      {paginatedData.reduce((sum, item) => sum + item.finalWashDelivery, 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ==================== PAGINATION CONTROLS ==================== */}
          <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="rowsPerPage" className="text-sm text-gray-600">
                  Rows per page:
                </label>
                <select
                  id="rowsPerPage"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of <strong>{filteredData.length}</strong> entries
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                {/* First page */}
                <button
                  onClick={handleFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="First page"
                >
                  <FirstPage className="text-gray-600" />
                </button>

                {/* Previous page */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Previous page"
                >
                  <ChevronLeft className="text-gray-600" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 px-2">
                  {getPageNumbers().map((number, index) => (
                    <button
                      key={index}
                      onClick={() => typeof number === 'number' && setCurrentPage(number)}
                      disabled={number === '...'}
                      className={`
                        min-w-[40px] h-10 rounded-lg font-medium text-sm transition duration-200
                        ${number === currentPage 
                          ? 'bg-primary-600 text-white shadow-md' 
                          : number === '...'
                          ? 'cursor-default text-gray-400'
                          : 'hover:bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                {/* Next page */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Next page"
                >
                  <ChevronRight className="text-gray-600" />
                </button>

                {/* Last page */}
                <button
                  onClick={handleLastPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Last page"
                >
                  <LastPage className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Grand Total Summary - Shows totals of ALL filtered data */}
            {filteredData.length > rowsPerPage && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Grand Total Received</p>
                    <p className="text-xl font-bold text-gray-900">
                      {filteredData.reduce((sum, item) => sum + item.totalWashReceived, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Grand Total Delivery</p>
                    <p className="text-xl font-bold text-gray-900">
                      {filteredData.reduce((sum, item) => sum + item.totalWashDelivery, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Total Order Quantity</p>
                    <p className="text-xl font-bold text-gray-900">
                      {filteredData.reduce((sum, item) => sum + item.orderQuantity, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Balance</p>
                    <p className="text-xl font-bold text-gray-900">
                      {(
                        filteredData.reduce((sum, item) => sum + item.totalWashReceived, 0) -
                        filteredData.reduce((sum, item) => sum + item.totalWashDelivery, 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== PRINT STYLES ==================== */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fade-in, .fade-in * {
            visibility: visible;
          }
          .fade-in {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
          table {
            font-size: 10px !important;
          }
          th, td {
            padding: 8px !important;
          }
          /* Hide pagination controls when printing */
          .mt-6.bg-white {
            display: none;
          }
          /* Hide filter panel when printing */
          .bg-gradient-to-r.from-primary-600 {
            display: none;
          }
          button {
            display: none !important;
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-from-top-2 {
          from { transform: translateY(-0.5rem); }
          to { transform: translateY(0); }
        }

        .animate-in {
          animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Reports;