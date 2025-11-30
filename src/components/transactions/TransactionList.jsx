import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Delete, 
  Visibility, 
  Search, 
  Refresh, 
  Add, 
  FilterAlt, 
  TuneOutlined, 
  Close, 
  Download, 
  ChevronLeft, 
  ChevronRight 
} from '@mui/icons-material';
import { useWashTransaction } from '../../hooks/useWashTransaction';
import { useProcessStage } from '../../hooks/useProcessStage';
import { workOrderApi } from '../../api/workOrderApi';
import BulkTransactionModal from './BulkTransactionModal';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from '../../constants/transactionConstants';

const TransactionList = ({ workOrderId = null }) => {
  const navigate = useNavigate();
  const { 
    getPaginated,
    exportToCSV,
    deleteTransaction, 
    loading, 
    data: transactions = [],
    pagination
  } = useWashTransaction();
  const { stages, loading: stagesLoading } = useProcessStage();

  const [workOrders, setWorkOrders] = useState([]);
  const [workOrdersLoading, setWorkOrdersLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [uniqueUnits, setUniqueUnits] = useState([]); // ✅ ADDED: Store unique units

  // ==========================================
  // PAGINATION & SEARCH STATE
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // ==========================================
  // ADVANCED FILTER PARAMETERS
 
const [filterParams, setFilterParams] = useState({
  buyer: '',
  factory: '',
  unit: '',  
  processStageId: '',
  transactionTypeId: '',
  startDate: '',  
  endDate: '',  
});
  // ==========================================
  // LOAD INITIAL DATA
  // ==========================================
  useEffect(() => {
    loadTransactions();
    loadWorkOrders();
  }, []);

  // ==========================================
  // EXTRACT UNIQUE UNITS FROM WORK ORDERS
  // ==========================================
  useEffect(() => {
    if (workOrders.length > 0) {
      const units = [...new Set(workOrders.map(wo => wo.unit).filter(Boolean))].sort();
      setUniqueUnits(units);
      console.log('📦 Unique units loaded:', units);
    }
  }, [workOrders]);

  // ==========================================
  // LOAD TRANSACTIONS WITH PAGINATION & SEARCH
  // ==========================================
// ==========================================
// LOAD TRANSACTIONS WITH PAGINATION & SEARCH (FIXED)
// ==========================================
const loadTransactions = async (page = 1, search = '', filters = {}) => {
  try {
    console.log('🔄 Loading transactions...', { page, search, filters });

    // ✅ Build params object
    const params = {
      page,
      pageSize,
      sortBy: 'transactionDate',
      sortOrder: 'desc',
    };

    // ✅ Add search if provided
    if (search && search.trim()) {
      params.searchTerm = search.trim();
    }

    // ✅ Add filters only if they have values
    if (filters.buyer) params.buyer = filters.buyer;
    if (filters.factory) params.factory = filters.factory;
    if (filters.unit) params.unit = filters.unit; // ✅ ADDED
    if (filters.processStageId) params.processStageId = parseInt(filters.processStageId);
    if (filters.transactionTypeId !== '' && filters.transactionTypeId !== undefined) {
      params.transactionTypeId = parseInt(filters.transactionTypeId);
    }
    // ✅ CRITICAL: Use startDate/endDate (not fromDate/toDate)
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    console.log('📤 Request params:', params);

    await getPaginated(params);
    setCurrentPage(page);
    console.log('✅ Transactions loaded');
  } catch (error) {
    console.error('❌ Failed to load transactions:', error);
    toast.error('Failed to load transactions');
  }
};

  // ==========================================
  // LOAD WORK ORDERS
  // ==========================================
  const loadWorkOrders = async () => {
    try {
      setWorkOrdersLoading(true);
      console.log('🔄 Loading work orders...');
      const response = await workOrderApi.getAll();
      
      if (response.data.success) {
        const woData = response.data.data || [];
        setWorkOrders(woData);
        console.log('✅ Loaded', woData.length, 'work orders');
      }
    } catch (error) {
      console.error('❌ Failed to load work orders:', error);
      setWorkOrders([]);
      toast.error('Failed to load work orders');
    } finally {
      setWorkOrdersLoading(false);
    }
  };

  // ==========================================
  // HANDLE SEARCH WITH DEBOUNCE
  // ==========================================
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔍 Search triggered:', searchQuery);
      loadTransactions(1, searchQuery, filterParams);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ==========================================
  // HANDLE FILTER CHANGES
  // ==========================================
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`🎛️ Filter changed: ${name} = ${value}`);
    
    setFilterParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ==========================================
  // APPLY FILTERS
  // ==========================================
  const handleApplyFilters = async () => {
    console.log('✅ Applying filters:', filterParams);
    setCurrentPage(1);
    await loadTransactions(1, searchQuery, filterParams);
    setShowFilters(false);
    toast.success('Filters applied');
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================
// ==========================================
// RESET FILTERS (FIXED)
// ==========================================
const handleResetFilters = async () => {
  console.log('🔄 Resetting filters...');
  setFilterParams({
    buyer: '',
    factory: '',
    unit: '',
    processStageId: '',
    transactionTypeId: '',
    startDate: '', // ✅ CHANGED
    endDate: '', // ✅ CHANGED
  });
  setSearchQuery('');
  setCurrentPage(1);
  await loadTransactions(1, '', {});
  setShowFilters(false);
  toast.success('Filters reset');
};
  // ==========================================
  // HANDLE PAGE CHANGE
  // ==========================================
  const handlePageChange = (newPage) => {
    console.log(`📄 Page changed to: ${newPage}`);
    if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
      loadTransactions(newPage, searchQuery, filterParams);
    }
  };

  // ==========================================
  // HANDLE PAGE SIZE CHANGE
  // ==========================================
  const handlePageSizeChange = (newSize) => {
    console.log(`📊 Page size changed to: ${newSize}`);
    setPageSize(newSize);
    setCurrentPage(1);
    loadTransactions(1, searchQuery, filterParams);
  };

  // ==========================================
  // GET WORK ORDER BY ID
  // ==========================================
  const getWorkOrderById = (workOrderId) => {
    return workOrders.find(wo => wo.id === parseInt(workOrderId));
  };

  // ==========================================
  // GET STAGE NAME BY ID
  // ==========================================
  const getStageNameById = (stageId) => {
    const stage = stages.find(s => s.id === parseInt(stageId));
    return stage?.name || 'Unknown Stage';
  };

  // ==========================================
  // GET TYPE COLOR
  // ==========================================
  const getTypeColor = (type) => {
    return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
  };

  // ==========================================
  // GET TYPE LABEL
  // ==========================================
  const getTypeLabel = (type) => {
    return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
  };

  // ==========================================
  // CALCULATE ACTIVE FILTER COUNT
  // ==========================================
  const activeFilterCount = Object.values(filterParams).filter(val => val !== '').length;

  // ==========================================
  // HANDLE DOWNLOAD CSV
  // ==========================================
  const handleDownloadCSV = async () => {
    try {
      if (!pagination || pagination.totalRecords === 0) {
        toast.error('No transactions to download');
        return;
      }

      setIsExporting(true);
      
      // ✅ Show loading toast with record count
      const loadingToast = toast.loading(
        `Downloading ${pagination.totalRecords} record${pagination.totalRecords !== 1 ? 's' : ''}...`
      );

      console.log('📥 CSV Export initiated');
      console.log('📊 Total records to export:', pagination.totalRecords);

      // ✅ BUILD EXPORT FILTERS - ONLY NON-EMPTY VALUES
      const exportFilters = {};
      
      if (searchQuery && searchQuery.trim()) {
        exportFilters.searchTerm = searchQuery.trim();
        console.log('🔍 Search term added:', searchQuery);
      }
      
      if (filterParams.buyer) {
        exportFilters.buyer = filterParams.buyer;
        console.log('🏢 Buyer filter added:', filterParams.buyer);
      }
      
      if (filterParams.factory) {
        exportFilters.factory = filterParams.factory;
        console.log('🏭 Factory filter added:', filterParams.factory);
      }

      if (filterParams.unit) { // ✅ ADDED: Unit filter
        exportFilters.unit = filterParams.unit;
        console.log('📦 Unit filter added:', filterParams.unit);
      }
      
      if (filterParams.processStageId) {
        exportFilters.processStageId = parseInt(filterParams.processStageId);
        console.log('📍 Stage filter added:', filterParams.processStageId);
      }
      
      if (filterParams.transactionTypeId !== '' && filterParams.transactionTypeId !== undefined) {
        exportFilters.transactionTypeId = parseInt(filterParams.transactionTypeId);
        console.log('📋 Transaction type filter added:', filterParams.transactionTypeId);
      }
      
      if (filterParams.startDate) {
        exportFilters.startDate = filterParams.startDate;
        console.log('📅 Start date filter added:', filterParams.startDate);
      }
      
      if (filterParams.endDate) {
        exportFilters.endDate = filterParams.endDate;
        console.log('📅 End date filter added:', filterParams.endDate);
      }

      console.log('📤 Final export filters:', exportFilters);

      // ✅ Call export API
      const result = await exportToCSV(exportFilters);

      if (result.success) {
        toast.dismiss(loadingToast);
        const hasFilters = Object.keys(exportFilters).length > 0;
        const filterText = hasFilters ? ' (Filtered)' : '';
        
        toast.success(
          `✅ CSV downloaded (${pagination.totalRecords} records)${filterText}`
        );
        
        console.log('✅ CSV export successful');
        console.log('📥 Downloaded file:', result.fileName);
      } else {
        toast.dismiss(loadingToast);
        toast.error(result.message || 'Download failed');
        console.error('❌ Export failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Export error:', error);
      toast.error(`Download failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================
  // HANDLE DELETE
  // ==========================================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    console.log('🗑️ Deleting transaction:', id);
    const result = await deleteTransaction(id);
    
    if (result.success) {
      await loadTransactions(currentPage, searchQuery, filterParams);
      toast.success('Transaction deleted');
    }
  };

  // ==========================================
  // RENDER LOADING STATE
  // ==========================================
  if (loading && transactions.length === 0) {
    return <LoadingSpinner size="lg" />;
  }

  // ==========================================
  // RENDER MAIN COMPONENT
  // ==========================================
  return (
    <div className="fade-in">
      {/* ==================== MODAL ==================== */}
      <BulkTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadTransactions(currentPage, searchQuery, filterParams)}
      />

      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            All Transactions
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {pagination?.totalRecords || 0} total record{pagination?.totalRecords !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* ==================== DOWNLOAD CSV BUTTON ==================== */}
          <button
            onClick={handleDownloadCSV}
            disabled={isExporting || pagination?.totalRecords === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              isExporting 
                ? 'Preparing download...' 
                : activeFilterCount > 0 
                  ? `Download ${pagination?.totalRecords || 0} filtered records as CSV`
                  : `Download all ${pagination?.totalRecords || 0} records as CSV`
            }
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download fontSize="small" />
                <span>
                  Download 
                  {activeFilterCount > 0 && ' (Filtered)'}
                </span>
              </>
            )}
          </button>

          {/* ==================== FILTER BUTTON ==================== */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 font-medium text-sm ${
              showFilters
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FilterAlt fontSize="small" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* ==================== CREATE TRANSACTION BUTTON ==================== */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg font-medium text-sm"
          >
            <Add fontSize="small" />
            <span>Create</span>
          </button>

          {/* ==================== REFRESH BUTTON ==================== */}
          <button
            onClick={() => loadTransactions(currentPage, searchQuery, filterParams)}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50 font-medium text-sm"
          >
            <Refresh fontSize="small" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ==================== FILTER PANEL ==================== */}
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
              
              {/* ==================== BUYER FILTER ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Buyer
                </label>
                <input
                  type="text"
                  name="buyer"
                  value={filterParams.buyer}
                  onChange={handleFilterChange}
                  disabled={loading}
                  placeholder="e.g., Zara"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Partial match (case-insensitive)</p>
              </div>

              {/* ==================== FACTORY FILTER ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Factory
                </label>
                <input
                  type="text"
                  name="factory"
                  value={filterParams.factory}
                  onChange={handleFilterChange}
                  disabled={loading}
                  placeholder="e.g., TSL-2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Exact match (case-insensitive)</p>
              </div>

              {/* ==================== UNIT FILTER - ADDED ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Unit
                </label>
                <select
                  name="unit"
                  value={filterParams.unit}
                  onChange={handleFilterChange}
                  disabled={loading || uniqueUnits.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium disabled:bg-gray-50"
                >
                  <option value="">All Units</option>
                  {uniqueUnits.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{uniqueUnits.length} units available</p>
              </div>

              {/* ==================== TRANSACTION TYPE FILTER ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Transaction Type
                </label>
                <select
                  name="transactionTypeId"
                  value={filterParams.transactionTypeId}
                  onChange={handleFilterChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium disabled:bg-gray-50"
                >
                  <option value="">All Types</option>
                  <option value={TRANSACTION_TYPES.RECEIVE}>Receive</option>
                  <option value={TRANSACTION_TYPES.DELIVERY}>Delivery</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">0 = Receive, 1 = Delivery</p>
              </div>

              {/* ==================== PROCESS STAGE FILTER ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Process Stage
                </label>
                <select
                  name="processStageId"
                  value={filterParams.processStageId}
                  onChange={handleFilterChange}
                  disabled={loading || stagesLoading || stages.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium disabled:bg-gray-50"
                >
                  <option value="">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{stages.length} stages available</p>
              </div>

              {/* ==================== START DATE FILTER ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filterParams.startDate}
                  onChange={handleFilterChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">From date (inclusive)</p>
              </div>

              {/* ==================== END DATE FILTER ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filterParams.endDate}
                  onChange={handleFilterChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">To date (inclusive)</p>
              </div>
            </div>

            {/* ==================== FILTER ACTIONS ==================== */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search fontSize="small" />
                    <span>Apply Filters</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetFilters}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Close fontSize="small" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== QUICK SEARCH BAR ==================== */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Work Order, Buyer, Style, Batch No, Gate Pass..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
            />
          </div>
        </div>
      </div>

      {/* ==================== EMPTY STATE ==================== */}
      {transactions.length === 0 ? (
        <EmptyState 
          title="No Transactions" 
          description="No transaction records found. Click 'Create' to get started!"
          variant="search"
        />
      ) : (
        <>
          {/* ==================== TABLE ==================== */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* ==================== TABLE HEADER ==================== */}
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Order</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">FastReact No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Wash Target</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Marks</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                {/* ==================== TABLE BODY ==================== */}
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => {
                    const typeColor = getTypeColor(transaction.transactionType);
                    const workOrder = getWorkOrderById(transaction.workOrderId);

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
                        {/* ==================== TYPE COLUMN ==================== */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
                            <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
                            {getTypeLabel(transaction.transactionType)}
                          </span>
                        </td>

                        {/* ==================== WORK ORDER COLUMN ==================== */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                              {transaction.workOrderNo?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{transaction.workOrderNo}</p>
                              <p className="text-xs text-gray-500">{transaction.styleName}</p>
                            </div>
                          </div>
                        </td>

                        {/* ==================== FAST REACT NO COLUMN ==================== */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            {workOrder?.fastReactNo || '-'}
                          </span>
                        </td>

                        {/* ==================== UNIT COLUMN - ADDED ==================== */}
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                            {workOrder?.unit || '-'}
                          </span>
                        </td>

                        {/* ==================== WASH TARGET DATE COLUMN ==================== */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700">
                            {workOrder?.washTargetDate 
                              ? format(new Date(workOrder.washTargetDate), 'dd MMM yyyy')
                              : '-'
                            }
                          </span>
                        </td>

                        {/* ==================== MARKS COLUMN ==================== */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs">
                            {workOrder?.marks ? (
                              <span title={workOrder.marks} className="line-clamp-2">
                                {workOrder.marks}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">-</span>
                            )}
                          </div>
                        </td>

                        {/* ==================== STAGE COLUMN ==================== */}
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                            {transaction.processStageName}
                          </span>
                        </td>

                        {/* ==================== QUANTITY COLUMN ==================== */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800 text-lg">
                            {transaction.quantity?.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">pcs</span>
                        </td>

                        {/* ==================== CREATED AT COLUMN - CHANGED ==================== */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 font-medium">
                            {format(new Date(transaction.createdAt), 'dd MMM yyyy')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(transaction.createdAt), 'HH:mm:ss')}
                          </p>
                        </td>

                        {/* ==================== ACTIONS COLUMN ==================== */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/transactions/${transaction.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                              title="View Details"
                            >
                              <Visibility fontSize="small" />
                            </button>

                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                              title="Delete Transaction"
                            >
                              <Delete fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================== PAGINATION FOOTER ==================== */}
          {pagination && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
              {/* ==================== PAGE INFO ==================== */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">
                  Page <strong>{currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                </span>
                <span className="text-sm text-gray-600">
                  ({pagination.totalRecords} total records)
                </span>
              </div>

              {/* ==================== PAGE NAVIGATION ==================== */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevious || loading}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Previous Page"
                >
                  <ChevronLeft fontSize="small" />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`w-9 h-9 rounded-lg font-semibold transition duration-200 ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Next Page"
                >
                  <ChevronRight fontSize="small" />
                </button>
              </div>

              {/* ==================== PAGE SIZE SELECTOR ==================== */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 font-medium">
                  Items per page:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  disabled={loading}
                  className="px-3 py-1 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionList;