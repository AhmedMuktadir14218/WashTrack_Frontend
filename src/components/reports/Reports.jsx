import { useState, useEffect, useMemo, useRef } from 'react';
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
  TrendingDown
} from '@mui/icons-material';
import { reportApi } from '../../api/reportApi';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';

const TRANSACTION_TYPES = {
  RECEIVE: 1,
  DELIVERY: 2,
};

const TableSkeleton = ({ rows = 5 }) => (
  <div className="animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-b border-gray-100 dark:border-slate-700">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded flex-1"></div>
      </div>
    ))}
  </div>
);

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [summaryStats, setSummaryStats] = useState({
    totalWorkOrders: 0,
    totalTransactions: 0,
    totalReceiveQty: 0,
    totalDeliveryQty: 0,
    totalOrderQuantity: 0,
    stageBreakdown: {}
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState({
    buyer: '',
    factory: '',
    unit: '',
    transactionTypeId: '',
    processStageId: '',
    startDate: '',
    endDate: '',
    washTargetStartDate: '',
    washTargetEndDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  const [filterOptions, setFilterOptions] = useState({
    buyers: [],
    factories: [],
    units: [],
    processStages: []
  });

  const abortControllerRef = useRef(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pagination.currentPage, pagination.pageSize, debouncedSearch, appliedFilters]);

  const loadFilterOptions = async () => {
    try {
      const response = await reportApi.getFilterOptions();
      const data = response.data?.data || response.data || {};
      
      setFilterOptions({
        buyers: Array.isArray(data.buyers) ? data.buyers : [],
        factories: Array.isArray(data.factories) ? data.factories : [],
        units: Array.isArray(data.units) ? data.units : [],
        processStages: Array.isArray(data.processStages) ? data.processStages : []
      });
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadData = async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);

      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        searchTerm: debouncedSearch,
        ...appliedFilters
      };

      const [reportResponse, summaryResponse] = await Promise.all([
        reportApi.getTransactionReport(params),
        reportApi.getSummary(params)
      ]);

      const reportDataRaw = reportResponse.data?.data || reportResponse.data || [];
      const reportPagination = reportResponse.data?.pagination;

      if (Array.isArray(reportDataRaw)) {
        setReportData(reportDataRaw);
      } else {
        setReportData([]);
      }
      
      if (reportPagination) {
        setPagination(prev => ({
          ...prev,
          ...reportPagination
        }));
      }

      const summaryData = summaryResponse.data?.data || summaryResponse.data;
      if (summaryData) {
        setSummaryStats({
            totalWorkOrders: Number(summaryData.totalWorkOrders) || 0,
            totalTransactions: Number(summaryData.totalTransactions) || 0,
            totalReceiveQty: Number(summaryData.totalReceiveQty) || 0,
            totalDeliveryQty: Number(summaryData.totalDeliveryQty) || 0,
            totalOrderQuantity: Number(summaryData.totalOrderQuantity) || 0,
            stageBreakdown: summaryData.stageBreakdown || {}
        });
      }

    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleRowsPerPageChange = (e) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize: Number(e.target.value), 
      currentPage: 1 
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterParams });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    toast.success('Filters applied');
  };

  const handleResetFilters = () => {
    const reset = {
      buyer: '',
      factory: '',
      unit: '',
      transactionTypeId: '',
      processStageId: '',
      startDate: '',
      endDate: '',
      washTargetStartDate: '',
      washTargetEndDate: '',
    };
    setFilterParams(reset);
    setAppliedFilters({});
    setSearchQuery('');
    setDebouncedSearch('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    toast.success('Filters reset');
  };

  const handleRefetch = () => {
    loadData();
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        searchTerm: debouncedSearch,
        ...appliedFilters
      };
      
      const response = await reportApi.exportToCsv(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transaction_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStageQty = (row, stageName, type) => {
    const stage = row.stageQuantities?.[stageName];
    if (!stage) return 0;
    return type === 'receive' ? (stage.receive || 0) : (stage.delivery || 0);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(val => val !== '');

  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
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
  };

  if (loading && reportData.length === 0) {
     return (
        <div className="fade-in p-6 dark:bg-slate-900 min-h-screen">
           <TableSkeleton rows={10} />
        </div>
     );
  }

  return (
    <div className="fade-in p-6 dark:bg-slate-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-slate-100 mb-2">Transaction Reports</h1>
        <p className="text-gray-600 dark:text-slate-400">
          Comprehensive transaction summary across all stages
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="flex-1 relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by Work Order, FastReact No, Buyer, or Style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition duration-200 font-medium ${
                hasActiveFilters
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                  : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'
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
              onClick={handleRefetch}
              disabled={loading}
              className="px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg flex items-center gap-2 transition duration-200 font-medium disabled:opacity-50"
            >
              <Refresh fontSize="small" className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={reportData.length === 0}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Download fontSize="small" />
              <span>Export CSV</span>
            </button>
             <button
              onClick={handlePrint}
              disabled={reportData.length === 0}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Print fontSize="small" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 mb-6 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-3">
            <div className="flex items-center gap-3">
              <TuneOutlined className="text-white" style={{ fontSize: 22 }} />
              <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
            </div>
          </div>
          <div className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Buyer</label>
                 <select name="buyer" value={filterParams.buyer} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200">
                    <option value="">All Buyers</option>
                    {filterOptions.buyers.map(b => <option key={b} value={b}>{b}</option>)}
                 </select>
              </div>
              
              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Factory</label>
                  <select name="factory" value={filterParams.factory} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200">
                   <option value="">All Factories</option>
                   {filterOptions.factories.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Unit</label>
                  <select name="unit" value={filterParams.unit} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200">
                   <option value="">All Units</option>
                   {filterOptions.units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              
              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Transaction Type</label>
                 <select name="transactionTypeId" value={filterParams.transactionTypeId} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200">
                    <option value="">All Types</option>
                    <option value={TRANSACTION_TYPES.RECEIVE}>Receive</option>
                    <option value={TRANSACTION_TYPES.DELIVERY}>Delivery</option>
                 </select>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Process Stage</label>
                 <select name="processStageId" value={filterParams.processStageId} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200">
                    <option value="">All Stages</option>
                    {filterOptions.processStages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>
              
              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Start Date</label>
                 <input type="date" name="startDate" value={filterParams.startDate} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200" />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">End Date</label>
                 <input type="date" name="endDate" value={filterParams.endDate} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200" />
              </div>

               <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Wash Target Start</label>
                  <input type="date" name="washTargetStartDate" value={filterParams.washTargetStartDate} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200" />
               </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Wash Target End</label>
                  <input type="date" name="washTargetEndDate" value={filterParams.washTargetEndDate} onChange={handleFilterChange} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-primary-500 dark:bg-slate-700 dark:text-slate-200" />
               </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-3">
               <button onClick={handleApplyFilters} className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2">
                 <Search fontSize="small" />
                 <span>Apply Filters</span>
               </button>
                <button onClick={handleResetFilters} className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-2">
                 <Close fontSize="small" />
                 <span>Reset</span>
               </button>
             </div>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="bg-gradient-to-br from-primary-50 dark:from-slate-800 to-blue-50 dark:to-slate-800 rounded-2xl shadow-lg border-2 border-primary-200 dark:border-slate-600 mb-6 overflow-hidden">
           <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4">
             <div className="flex items-center gap-3">
               <Assessment className="text-white" style={{ fontSize: 28 }} />
               <div>
                  <h3 className="text-2xl font-bold text-white">Summary Report</h3>
                  <p className="text-primary-100 text-sm">Filtered Results</p>
               </div>
             </div>
           </div>
           
           <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-md border border-gray-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                       <p className="text-sm font-semibold text-gray-600 dark:text-slate-400">Work Orders</p>
                       <CalendarToday className="text-blue-500" fontSize="small" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-slate-100">{summaryStats.totalWorkOrders}</p>
                 </div>
                 
                 <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-md border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-3">
                       <p className="text-sm font-semibold text-green-600 dark:text-green-400">Total Receive</p>
                       <TrendingUp className="text-green-500" fontSize="small" />
                    </div>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-400">{summaryStats.totalReceiveQty.toLocaleString()}</p>
                 </div>

                  <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-md border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-3">
                       <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Total Delivery</p>
                       <TrendingDown className="text-orange-500" fontSize="small" />
                    </div>
                    <p className="text-4xl font-bold text-orange-700 dark:text-orange-400">{summaryStats.totalDeliveryQty.toLocaleString()}</p>
                 </div>
              </div>

              {summaryStats.stageBreakdown && Object.keys(summaryStats.stageBreakdown).length > 0 && (
                <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-md border border-gray-200 dark:border-slate-600">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Assessment fontSize="small" className="text-primary-600" />
                    Stage-wise Breakdown
                  </h4>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-600 border-b-2 border-gray-200 dark:border-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200">Stage Name</th>
                          <th className="px-4 py-3 text-center font-bold text-green-700 dark:text-green-400">Receive</th>
                          <th className="px-4 py-3 text-center font-bold text-orange-700 dark:text-orange-400">Delivery</th>
                          <th className="px-4 py-3 text-center font-bold text-purple-700 dark:text-purple-400">Total QTY</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                        {Object.entries(summaryStats.stageBreakdown).map(([stageName, data]) => (
                          <tr key={stageName} className="hover:bg-gray-50 dark:hover:bg-slate-600">
                            <td className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200">{stageName}</td>
                            <td className="px-4 py-3 text-center font-bold text-green-600 dark:text-green-400">{(data.receive || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-center font-bold text-orange-600 dark:text-orange-400">{(data.delivery || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-center font-bold text-purple-600 dark:text-purple-400">{((data.receive || 0) + (data.delivery || 0)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
           <div className="p-4"><TableSkeleton rows={10} /></div>
        ) : reportData.length === 0 ? (
           <EmptyState title="No transactions found" description="Try adjusting your filters" />
        ) : (
           <div className="overflow-x-auto custom-scrollbar ">
              <table className="w-full text-sm">
                 <thead className="bg-gray-50 dark:bg-slate-700 border-b-2 border-gray-200 dark:border-slate-600 sticky top-0 z-10">
                    <tr>
                       <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600">Factory</th>
                       <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600">Unit</th>
                       <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600">Work Order No</th>
                       <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600">FastReact No</th>
                       <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600">Buyer</th>
                       <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600">Style Name</th>
                       <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600">Order Qty</th>
                       <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-slate-600">Wash Target Date</th>
                       <th colSpan="2" className="px-4 py-3 text-center font-bold text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-600 border-r-2 border-gray-300 dark:border-slate-500">Total Wash</th>
                       <th colSpan="30" className="px-4 py-3 text-center font-bold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700">Process Stages</th>
                    </tr>
                     <tr>
                        <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-600 text-xs border-r border-gray-200 dark:border-slate-500">Rcv</th>
                        <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-600 text-xs border-r-2 border-gray-300 dark:border-slate-500">Del</th>
                        
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-yellow-50 dark:bg-yellow-900/20 border-l border-yellow-200 dark:border-yellow-800">1st Dry</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-blue-50 dark:bg-blue-900/20 border-l border-blue-200 dark:border-blue-800">Unwash</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-green-50 dark:bg-green-900/20 border-l border-green-200 dark:border-green-800">1st Wash</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-orange-50 dark:bg-orange-900/20 border-l border-orange-200 dark:border-orange-800">2nd Dry</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">Final Wash</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">1st Dryer</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">2nd Dryer</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">Final Dryer</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">Cool Dryer</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">ReDryer</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">Laser</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">Acid Wash</th>
                        <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l border-purple-200 dark:border-purple-800">Ozon</th>
                     </tr>
                     <tr>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-yellow-50 dark:bg-yellow-900/20 text-xs border-l border-yellow-200 dark:border-yellow-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-yellow-50 dark:bg-yellow-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 text-xs border-l border-blue-200 dark:border-blue-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 text-xs border-l border-green-200 dark:border-green-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-orange-50 dark:bg-orange-900/20 text-xs border-l border-orange-200 dark:border-orange-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-orange-50 dark:bg-orange-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs border-l border-purple-200 dark:border-purple-800">Rcv</th>
                         <th className="px-3 py-2 text-center font-semibold text-gray-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 text-xs">Del</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {reportData.map((item, index) => (
                       <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-3 font-bold text-primary-600 dark:text-primary-400 border-r border-gray-200 dark:border-slate-700">{item.factory}</td>
                          <td className="px-4 py-3 font-bold text-primary-600 dark:text-primary-400 border-r border-gray-200 dark:border-slate-700">{item.unit}</td>
                          <td className="px-4 py-3 font-bold text-primary-600 dark:text-primary-400 border-r border-gray-200 dark:border-slate-700">{item.workOrderNo}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-slate-300 text-sm border-r border-gray-200 dark:border-slate-700">{item.fastReactNo}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-slate-300 font-medium border-r border-gray-200 dark:border-slate-700">
                            <p>{item.buyer}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{item.marks}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-700">{item.styleName}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-200 border-r border-gray-200 dark:border-slate-700">{item.orderQuantity?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-slate-400 text-xs border-r border-gray-200 dark:border-slate-700">
                             {item.washTargetDate ? new Date(item.washTargetDate).toLocaleDateString('en-GB') : '-'}
                          </td>
                          
                          <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-gray-100 dark:bg-slate-600 border-l-2 border-gray-300 dark:border-slate-500">
                            {(item.totalWashReceived || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-gray-100 dark:bg-slate-600">
                            {(item.totalWashDelivery || 0).toLocaleString()}
                          </td>

                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-200 dark:border-yellow-800">{getStageQty(item, '1st Dry', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-yellow-50 dark:bg-yellow-900/20">{getStageQty(item, '1st Dry', 'delivery').toLocaleString()}</td>
                           
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-200 dark:border-blue-800">{getStageQty(item, 'Unwash', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-blue-50 dark:bg-blue-900/20">{getStageQty(item, 'Unwash', 'delivery').toLocaleString()}</td>
                           
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-green-50 dark:bg-green-900/20 border-l-2 border-green-200 dark:border-green-800">{getStageQty(item, '1st Wash', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-green-50 dark:bg-green-900/20">{getStageQty(item, '1st Wash', 'delivery').toLocaleString()}</td>
                           
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-orange-50 dark:bg-orange-900/20 border-l-2 border-orange-200 dark:border-orange-800">{getStageQty(item, '2nd Dry', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-orange-50 dark:bg-orange-900/20">{getStageQty(item, '2nd Dry', 'delivery').toLocaleString()}</td>
                           
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Final Wash', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Final Wash', 'delivery').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, '1st Dryer', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, '1st Dryer', 'delivery').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, '2nd Dryer', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, '2nd Dryer', 'delivery').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Final Dryer', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Final Dryer', 'delivery').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Cool Dryer', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Cool Dryer', 'delivery').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'ReDryer', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'ReDryer', 'delivery').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Laser', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Laser', 'delivery').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Acid Wash', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Acid Wash', 'delivery').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Ozon', 'receive').toLocaleString()}</td>
                           <td className="px-3 py-3 text-center font-bold text-gray-800 dark:text-slate-200 bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-200 dark:border-purple-800">{getStageQty(item, 'Ozon', 'delivery').toLocaleString()}</td>

                       </tr>
                    ))}
                 </tbody>
                 <tfoot className="bg-gray-100 dark:bg-slate-600 border-t-2 border-gray-300 dark:border-slate-500 font-bold">
                    <tr>
                       <td colSpan="8" className="px-4 py-3 text-right text-gray-700 dark:text-slate-300">Page Total:</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-gray-200 dark:bg-slate-500 border-l-2 border-gray-300 dark:border-slate-400">{reportData.reduce((s, i) => s + (i.totalWashReceived||0), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-gray-200 dark:bg-slate-500">{reportData.reduce((s, i) => s + (i.totalWashDelivery||0), 0).toLocaleString()}</td>
                       
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-yellow-100 dark:bg-yellow-900/30 border-l-2 border-yellow-200 dark:border-yellow-800">{reportData.reduce((s, i) => s + getStageQty(i, '1st Dry', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-yellow-100 dark:bg-yellow-900/30">{reportData.reduce((s, i) => s + getStageQty(i, '1st Dry', 'delivery'), 0).toLocaleString()}</td>
                       
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-blue-100 dark:bg-blue-900/30 border-l-2 border-blue-200 dark:border-blue-800">{reportData.reduce((s, i) => s + getStageQty(i, 'Unwash', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-blue-100 dark:bg-blue-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Unwash', 'delivery'), 0).toLocaleString()}</td>
                       
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-green-100 dark:bg-green-900/30 border-l-2 border-green-200 dark:border-green-800">{reportData.reduce((s, i) => s + getStageQty(i, '1st Wash', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-green-100 dark:bg-green-900/30">{reportData.reduce((s, i) => s + getStageQty(i, '1st Wash', 'delivery'), 0).toLocaleString()}</td>
                       
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-orange-100 dark:bg-orange-900/30 border-l-2 border-orange-200 dark:border-orange-800">{reportData.reduce((s, i) => s + getStageQty(i, '2nd Dry', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-orange-100 dark:bg-orange-900/30">{reportData.reduce((s, i) => s + getStageQty(i, '2nd Dry', 'delivery'), 0).toLocaleString()}</td>
                       
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-200 dark:border-purple-800">{reportData.reduce((s, i) => s + getStageQty(i, 'Final Wash', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Final Wash', 'delivery'), 0).toLocaleString()}</td>

                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-200 dark:border-purple-800">{reportData.reduce((s, i) => s + getStageQty(i, '1st Dryer', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, '1st Dryer', 'delivery'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-200 dark:border-purple-800">{reportData.reduce((s, i) => s + getStageQty(i, '2nd Dryer', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, '2nd Dryer', 'delivery'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-200 dark:border-purple-800">{reportData.reduce((s, i) => s + getStageQty(i, 'Final Dryer', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Final Dryer', 'delivery'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-200 dark:border-purple-800">{reportData.reduce((s, i) => s + getStageQty(i, 'Cool Dryer', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Cool Dryer', 'delivery'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'ReDryer', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'ReDryer', 'delivery'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Laser', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Laser', 'delivery'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Acid Wash', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Acid Wash', 'delivery'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Ozon', 'receive'), 0).toLocaleString()}</td>
                       <td className="px-3 py-3 text-center text-gray-800 dark:text-slate-200 bg-purple-100 dark:bg-purple-900/30">{reportData.reduce((s, i) => s + getStageQty(i, 'Ozon', 'delivery'), 0).toLocaleString()}</td>
                    </tr>
                 </tfoot>
              </table>
           </div>
        )}
      </div>

       <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 px-6 py-4">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <label htmlFor="rowsPerPage" className="text-sm text-gray-600 dark:text-slate-400">Rows per page:</label>
             <select id="rowsPerPage" value={pagination.pageSize} onChange={handleRowsPerPageChange} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-700 dark:text-gray-200">
               <option value={10}>10</option>
               <option value={25}>25</option>
               <option value={50}>50</option>
               <option value={100}>100</option>
             </select>
           </div>
           
           <div className="text-sm text-gray-600 dark:text-gray-400">
             Showing <strong>{pagination.totalRecords === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1}</strong> to <strong>{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}</strong> of <strong>{pagination.totalRecords}</strong> entries
           </div>

           <div className="flex items-center gap-1">
             <button onClick={() => handlePageChange(1)} disabled={!pagination.hasPrevious} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"><FirstPage className="text-gray-600 dark:text-b" /></button>
             <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevious} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronLeft className="text-gray-600 dark:text-slate-300" /></button>
             
             <div className="flex items-center gap-1 px-2">
               {getPageNumbers().map((number, index) => (
                 <button key={index} onClick={() => typeof number === 'number' && handlePageChange(number)} disabled={number === '...'} className={`min-w-[40px] h-10 rounded-lg font-medium text-sm transition ${number === pagination.currentPage ? 'bg-primary-600 text-white shadow-md' : number === '...' ? 'cursor-default text-gray-400 dark:text-black' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-blue-600'}`}>
                   {number}
                 </button>
               ))}
             </div>

             <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"><ChevronRight className="text-gray-600 dark:text-slate-300" /></button>
             <button onClick={() => handlePageChange(pagination.totalPages)} disabled={!pagination.hasNext} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"><LastPage className="text-gray-600 dark:text-slate-300" /></button>
           </div>
         </div>
       </div>

       {reportData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                   <p className="text-xs text-gray-600 dark:text-slate-400 font-semibold mb-1">Grand Total Received</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{summaryStats.totalReceiveQty.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                   <p className="text-xs text-gray-600 dark:text-slate-400 font-semibold mb-1">Grand Total Delivery</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{summaryStats.totalDeliveryQty.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                   <p className="text-xs text-gray-600 dark:text-slate-400 font-semibold mb-1">Total Order Quantity</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{summaryStats.totalOrderQuantity.toLocaleString()}</p>
                </div>
              </div>
          </div>
       )}

       <style>{`
        @media print {
          body * { visibility: hidden; }
          .fade-in, .fade-in * { visibility: visible; }
          .fade-in { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 20px; }
          table { font-size: 10px !important; }
          th, td { padding: 8px !important; }
          .mt-6.bg-white, .bg-gradient-to-r, button, .shadow-md, .border-2 { box-shadow: none !important; border: 1px solid #ddd !important; }
          .bg-gradient-to-br, .bg-gradient-to-r { background: none !important; }
          .text-white { color: black !important; }
          button { display: none !important; }
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top-2 { from { transform: translateY(-0.5rem); } to { transform: translateY(0); } }
        .animate-in { animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .custom-scrollbar::-webkit-scrollbar-corner { background: transparent; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .dark .custom-scrollbar { scrollbar-color: #475569 transparent; }
      `}</style>
    </div>
  );
};

export default Reports;
