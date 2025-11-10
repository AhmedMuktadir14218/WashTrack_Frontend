import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, Visibility, Search, Refresh, Add } from '@mui/icons-material';
import { useWashTransaction } from '../../hooks/useWashTransaction';
import BulkTransactionModal from './BulkTransactionModal';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from '../../constants/transactionConstants';

const TransactionList = ({ workOrderId = null }) => {
  const navigate = useNavigate();
  const { getAll, getByWorkOrder, deleteTransaction, loading, data: transactions = [] } = useWashTransaction();

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (workOrderId) {
      await getByWorkOrder(workOrderId);
    } else {
      await getAll();
    }
  };

  useEffect(() => {
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
  }, [transactions, searchQuery, filterType]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    const result = await deleteTransaction(id);
    if (result.success) {
      loadTransactions();
    }
  };

  const getTypeColor = (type) => {
    return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
  };

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
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg font-medium"
          >
            <Add fontSize="small" />
            <span className="text-sm">Create Transaction</span>
          </button>

          <button
            onClick={loadTransactions}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50"
          >
            <Refresh fontSize="small" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 font-medium"
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
          description="No transaction records found. Click 'Create Transaction' to get started!"
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const typeColor = getTypeColor(transaction.transactionType);
                  const isReceive = transaction.transactionType === TRANSACTION_TYPES.RECEIVE;
                  const reference = isReceive ? transaction.batchNo : transaction.gatePassNo;

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

                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          {transaction.processStageName}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800 text-lg">
                          {transaction.quantity.toLocaleString()}
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

                      <td className="px-6 py-4">
                        {reference ? (
                          <span className="text-sm font-medium text-gray-700">{reference}</span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/transactions/${transaction.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                            title="View"
                          >
                            <Visibility fontSize="small" />
                          </button>

                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                            title="Delete"
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

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
          <span>
            Showing <strong>{filteredTransactions.length}</strong> of{' '}
            <strong>{transactions.length}</strong> transactions
          </span>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            Total Quantity: <strong>{filteredTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0).toLocaleString()}</strong> pcs
          </span>
        </div>
      )}
    </div>
  );
};

export default TransactionList;