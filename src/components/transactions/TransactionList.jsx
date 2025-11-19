import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, Visibility, Search, Refresh, Add, FilterAlt, TuneOutlined, Close, Download } from '@mui/icons-material';
import { useWashTransaction } from '../../hooks/useWashTransaction';
import { useProcessStage } from '../../hooks/useProcessStage';
import { workOrderApi } from '../../api/workOrderApi'; // ✅ Import work order API
import { exportTransactionsToCSV } from '../../utils/csvExport'; // ✅ Import CSV export
import BulkTransactionModal from './BulkTransactionModal';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from '../../constants/transactionConstants';

const TransactionList = ({ workOrderId = null }) => {
  const navigate = useNavigate();
  const { 
    getAll, 
    getByWorkOrder, 
    deleteTransaction, 
    filter: filterTransactions,
    loading, 
    data: transactions = [] 
  } = useWashTransaction();
  const { stages, loading: stagesLoading } = useProcessStage();

  // ✅ Add work orders state
  const [workOrders, setWorkOrders] = useState([]);
  const [workOrdersLoading, setWorkOrdersLoading] = useState(false);

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState({
    workOrderId: '',
    transactionType: '',
    processStageId: '',
    startDate: '',
    endDate: '',
    batchNo: '',
  });
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  // Load initial data
  useEffect(() => {
    loadTransactions();
    loadWorkOrders(); // ✅ Load work orders
  }, []);

  // Load transactions
  const loadTransactions = async () => {
    try {
      if (workOrderId) {
        await getByWorkOrder(workOrderId);
      } else {
        await getAll();
      }
      setIsFilterApplied(false);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  // ✅ Load work orders
  const loadWorkOrders = async () => {
    try {
      setWorkOrdersLoading(true);
      const response = await workOrderApi.getAll();
      if (response.data.success) {
        setWorkOrders(response.data.data || []);
      } else {
        setWorkOrders(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load work orders:', error);
      setWorkOrders([]);
    } finally {
      setWorkOrdersLoading(false);
    }
  };

  // ✅ Helper function to get work order by ID
  const getWorkOrderById = (workOrderId) => {
    return workOrders.find(wo => wo.id === parseInt(workOrderId));
  };

  // ✅ Helper function to get stage name by ID
  const getStageNameById = (stageId) => {
    const stage = stages.find(s => s.id === parseInt(stageId));
    return stage?.name || 'Unknown Stage';
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters via API
  const handleApplyFilters = async () => {
    try {
      const params = {};
      
      if (filterParams.workOrderId) params.workOrderId = filterParams.workOrderId;
      if (filterParams.transactionType) params.transactionType = parseInt(filterParams.transactionType);
      if (filterParams.processStageId) params.processStageId = parseInt(filterParams.processStageId);
      if (filterParams.startDate) params.startDate = filterParams.startDate;
      if (filterParams.endDate) params.endDate = filterParams.endDate;
      if (filterParams.batchNo) params.batchNo = filterParams.batchNo;

      const result = await filterTransactions(params);
      
      if (result.success) {
        const transactionsWithStageNames = (result.data || []).map(transaction => ({
          ...transaction,
          processStageName: transaction.processStageName || getStageNameById(transaction.processStageId)
        }));
        
        setFilteredTransactions(transactionsWithStageNames);
        setIsFilterApplied(true);
        setShowFilters(false);
        toast.success(`Found ${transactionsWithStageNames.length} transactions`);
      }
    } catch (error) {
      console.error('Filter error:', error);
      toast.error('Failed to apply filters');
    }
  };

  // Reset filters
  const handleResetFilters = async () => {
    setFilterParams({
      workOrderId: '',
      transactionType: '',
      processStageId: '',
      startDate: '',
      endDate: '',
      batchNo: '',
    });
    await loadTransactions();
    setShowFilters(false);
    toast.success('Filters reset');
  };

  // ✅ Handle CSV download
  const handleDownloadCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to download');
      return;
    }
    exportTransactionsToCSV(filteredTransactions, workOrders);
    toast.success('CSV downloaded successfully');
  };

  // Calculate active filter count
  const activeFilterCount = Object.values(filterParams).filter(val => val !== '').length;

  // Search and filter effect
  useEffect(() => {
    if (isFilterApplied) return;

    const trans = Array.isArray(transactions) ? transactions : [];
    let filtered = trans;

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transactionType === parseInt(filterType));
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        Object.values(t).some(val =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filterType, isFilterApplied]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    const result = await deleteTransaction(id);
    if (result.success) {
      await loadTransactions();
      toast.success('Transaction deleted');
    }
  };

  // Get color for transaction type
  const getTypeColor = (type) => {
    return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
  };

  // Get label for transaction type
  const getTypeLabel = (type) => {
    return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
  };

  if (loading && filteredTransactions.length === 0) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="fade-in">
      {/* Modal */}
      <BulkTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadTransactions()}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {workOrderId ? 'Work Order Transactions' : 'All Transactions'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''} found
            {isFilterApplied && ' (Filtered)'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Download CSV Button */}
          <button
            onClick={handleDownloadCSV}
            disabled={loading || filteredTransactions.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download as CSV"
          >
            <Download fontSize="small" />
            <span>Download CSV</span>
          </button>

          {/* Filter Button */}
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

          {/* Create Transaction Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg font-medium text-sm"
          >
            <Add fontSize="small" />
            <span>Create Transaction</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadTransactions}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50 font-medium text-sm"
          >
            <Refresh fontSize="small" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-3">
            <div className="flex items-center gap-3">
              <TuneOutlined className="text-white" style={{ fontSize: 22 }} />
              <h3 className="text-xl font-bold text-white">Advanced Filters</h3> 
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Work Order ID</label>
                <input
                  type="text"
                  name="workOrderId"
                  value={filterParams.workOrderId}
                  onChange={handleFilterChange}
                  disabled={loading}
                  placeholder="e.g., WO-001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Transaction Type</label>
                <select
                  name="transactionType"
                  value={filterParams.transactionType}
                  onChange={handleFilterChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium disabled:bg-gray-50"
                >
                  <option value="">All Types</option>
                  <option value={TRANSACTION_TYPES.RECEIVE}>Receive</option>
                  <option value={TRANSACTION_TYPES.DELIVERY}>Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Process Stage</label>
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filterParams.startDate}
                  onChange={handleFilterChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filterParams.endDate}
                  onChange={handleFilterChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Batch No / Gate Pass</label>
                <input
                  type="text"
                  name="batchNo"
                  value={filterParams.batchNo}
                  onChange={handleFilterChange}
                  disabled={loading}
                  placeholder="Enter batch or gate pass"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleApplyFilters}
                disabled={loading || activeFilterCount === 0}
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
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Close fontSize="small" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isFilterApplied}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            disabled={isFilterApplied}
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Types</option>
            <option value={TRANSACTION_TYPES.RECEIVE}>Receive</option>
            <option value={TRANSACTION_TYPES.DELIVERY}>Delivery</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 ? (
        <EmptyState 
          title="No Transactions" 
          description={isFilterApplied ? "No transactions match your filters. Try adjusting your criteria." : "No transaction records found. Click 'Create Transaction' to get started!"}
          variant="search"
        />
      ) : (
        /* Table */
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Work Order</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">FastReact No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Wash Target Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const typeColor = getTypeColor(transaction.transactionType);
                  const workOrder = getWorkOrderById(transaction.workOrderId);

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
                          <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
                          {getTypeLabel(transaction.transactionType)}
                        </span>
                      </td>

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

                      {/* ✅ FastReact No */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {workOrder?.fastReactNo || '-'}
                        </span>
                      </td>

                      {/* ✅ Wash Target Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {workOrder?.washTargetDate 
                            ? format(new Date(workOrder.washTargetDate), 'dd MMM yyyy')
                            : '-'
                          }
                        </span>
                      </td>

                      {/* ✅ Marks */}
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

                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          {transaction.processStageName}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800 text-lg">
                          {transaction.quantity?.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">pcs</span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-medium">
                          {format(new Date(transaction.transactionDate), 'dd MMM yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(transaction.transactionDate), 'HH:mm')}
                        </p>
                      </td>

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
      )}

      {/* Summary Footer */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span>
            Showing <strong>{filteredTransactions.length}</strong> of{' '}
            <strong>{transactions.length}</strong> transactions
            {isFilterApplied && ' (Filtered Results)'}
          </span>
          <span className="text-xs bg-white px-3 py-2 rounded-full border border-gray-200">
            Total Quantity: <strong>{filteredTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0).toLocaleString()}</strong> pcs
          </span>
        </div>
      )}
    </div>
  );
};

export default TransactionList;