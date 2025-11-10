import { useState } from 'react';
import { Search, Close, TuneOutlined, FilterAlt } from '@mui/icons-material';
import { useWashTransaction } from '../../hooks/useWashTransaction';
import { useProcessStage } from '../../hooks/useProcessStage';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from './../../constants/transactionConstants';

const TransactionFilter = () => {
  const { filter, loading, data: filteredData = [] } = useWashTransaction();
  const { stages } = useProcessStage();

  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState({
    workOrderId: '',
    transactionType: '',
    processStageId: '',
    startDate: '',
    endDate: '',
    batchNo: '',
  });

  const [hasFiltered, setHasFiltered] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = async () => {
    // Build filter object with only non-empty values
    const activeFilters = Object.entries(filterParams).reduce((acc, [key, value]) => {
      if (value) {
        // Convert numeric fields
        if (['workOrderId', 'transactionType', 'processStageId'].includes(key)) {
          acc[key] = parseInt(value);
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    if (Object.keys(activeFilters).length === 0) {
      toast.error('Please select at least one filter');
      return;
    }

    const result = await filter(activeFilters);
    if (result.success) {
      setHasFiltered(true);
      toast.success(`Found ${result.data.length} transaction(s)`);
    }
  };

  const handleResetFilters = () => {
    setFilterParams({
      workOrderId: '',
      transactionType: '',
      processStageId: '',
      startDate: '',
      endDate: '',
      batchNo: '',
    });
    setHasFiltered(false);
  };

  const getTypeColor = (type) => {
    return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
  };

  const getTypeLabel = (type) => {
    return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
  };

  const activeFilterCount = Object.values(filterParams).filter(val => val).length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Advanced Search</h2>
          <p className="text-gray-600 text-sm mt-1">
            Find transactions with multiple filter criteria
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 font-medium ${
            showFilters
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FilterAlt fontSize="small" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <TuneOutlined className="text-white" style={{ fontSize: 28 }} />
              <div>
                <h3 className="text-xl font-bold text-white">Filter Options</h3>
                <p className="text-primary-100 text-sm">Refine your search with multiple criteria</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Work Order ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Work Order ID
                </label>
                <input
                  type="number"
                  name="workOrderId"
                  value={filterParams.workOrderId}
                  onChange={handleFilterChange}
                  disabled={loading}
                  placeholder="Enter work order ID"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                />
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Transaction Type
                </label>
                <select
                  name="transactionType"
                  value={filterParams.transactionType}
                  onChange={handleFilterChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium"
                >
                  <option value="">All Types</option>
                  <option value={TRANSACTION_TYPES.RECEIVE}>Receive</option>
                  <option value={TRANSACTION_TYPES.DELIVERY}>Delivery</option>
                </select>
              </div>

              {/* Process Stage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Process Stage
                </label>
                <select
                  name="processStageId"
                  value={filterParams.processStageId}
                  onChange={handleFilterChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium"
                >
                  <option value="">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                />
              </div>

              {/* End Date */}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                />
              </div>

              {/* Batch No */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Batch No / Gate Pass
                </label>
                <input
                  type="text"
                  name="batchNo"
                  value={filterParams.batchNo}
                  onChange={handleFilterChange}
                  disabled={loading}
                  placeholder="Enter batch or gate pass"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Tip:</span> You can combine multiple filters for more specific results. Leave fields empty to search by all values in that category.
              </p>
            </div>

            {/* Action Buttons */}
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
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Close fontSize="small" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {hasFiltered && (
        <div className="fade-in">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              title="No Results"
              description="No transactions found matching your filters. Try adjusting your criteria."
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Results: {filteredData.length} transaction{filteredData.length !== 1 ? 's' : ''}
                </h3>
                <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full font-medium">
                  Total Qty: {filteredData.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()} pcs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Work Order
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Created By
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-200">
                    {filteredData.map((transaction) => {
                      const typeColor = getTypeColor(transaction.transactionType);
                      const isReceive = transaction.transactionType === TRANSACTION_TYPES.RECEIVE;
                      const reference = isReceive ? transaction.batchNo : transaction.gatePassNo;

                      return (
                        <tr
                          key={transaction.id}
                          className="hover:bg-gray-50 transition duration-150"
                        >
                          {/* Type */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
                              <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
                              {getTypeLabel(transaction.transactionType)}
                            </span>
                          </td>

                          {/* Work Order */}
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800 text-sm">
                              {transaction.workOrderNo}
                            </p>
                          </td>

                          {/* Stage */}
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                              {transaction.processStageName}
                            </span>
                          </td>

                          {/* Quantity */}
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-800">
                              {transaction.quantity.toLocaleString()}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 font-medium">
                              {format(new Date(transaction.transactionDate), 'dd MMM yyyy')}
                            </span>
                          </td>

                          {/* Reference */}
                          <td className="px-6 py-4">
                            {reference ? (
                              <span className="text-sm font-medium text-gray-700">
                                {reference}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">-</span>
                            )}
                          </td>

                          {/* Created By */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700">
                              {transaction.createdByUsername}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;