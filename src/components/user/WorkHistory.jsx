// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\user\WorkHistory.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Search } from '@mui/icons-material';  // ✅ Removed Eye
import { washTransactionApi } from '../../api/washTransactionApi';
import { workOrderApi } from '../../api/workOrderApi';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS, TRANSACTION_TYPES } from '../../constants/transactionConstants';

const WorkHistory = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [workOrdersMap, setWorkOrdersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get all transactions
      const transResponse = await washTransactionApi.getAll();
      if (transResponse.data.success) {
        setTransactions(transResponse.data.data || []);
      }

      // Get all work orders for reference
      const woResponse = await workOrderApi.getAll();
      if (woResponse.data.success) {
        const woMap = {};
        woResponse.data.data.forEach(wo => {
          woMap[wo.id] = wo;
        });
        setWorkOrdersMap(woMap);
      }
    } catch (error) {
      toast.error('Failed to load work history');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      t.workOrderNo?.toLowerCase().includes(searchLower) ||
      t.processStageName?.toLowerCase().includes(searchLower) ||
      t.styleName?.toLowerCase().includes(searchLower);

    const matchType = filterType === 'all' || t.transactionType === parseInt(filterType);

    return matchSearch && matchType;
  });

  const getTypeColor = (type) => {
    return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
  };

  const getTypeLabel = (type) => {
    return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
  };

  // Group transactions by work order
  const groupedByWorkOrder = {};
  filteredTransactions.forEach(t => {
    if (!groupedByWorkOrder[t.workOrderId]) {
      groupedByWorkOrder[t.workOrderId] = [];
    }
    groupedByWorkOrder[t.workOrderId].push(t);
  });

  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/user/transactions')}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <ArrowBack className="text-gray-600" style={{ fontSize: 28 }} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Work History</h1>
          <p className="text-gray-600 mt-1">
            All transactions you have created
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Work Order, Style Name, or Stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 font-medium"
          >
            <option value="all">All Types</option>
            <option value={TRANSACTION_TYPES.RECEIVE}>Receive</option>
            <option value={TRANSACTION_TYPES.DELIVERY}>Delivery</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {filteredTransactions.length === 0 ? (
        <EmptyState 
          title="No Transactions"
          description="You haven't created any transactions yet"
          variant="search"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByWorkOrder).map(([woId, woTransactions]) => {
            const workOrder = workOrdersMap[woId];
            const totalQty = woTransactions.reduce((sum, t) => sum + t.quantity, 0);

            return (
              <div
                key={woId}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition duration-200"
              >
                {/* Work Order Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{workOrder?.workOrderNo}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm opacity-90">
                        <div>
                          <p className="text-primary-100">Style</p>
                          <p className="font-semibold">{workOrder?.styleName}</p>
                        </div>
                        <div>
                          <p className="text-primary-100">Buyer</p>
                          <p className="font-semibold">{workOrder?.buyer}</p>
                        </div>
                        <div>
                          <p className="text-primary-100">Factory</p>
                          <p className="font-semibold">{workOrder?.factory}</p>
                        </div>
                        <div>
                          <p className="text-primary-100">Order Qty</p>
                          <p className="font-semibold">{workOrder?.orderQuantity?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-75">Total Quantity</p>
                      <p className="text-4xl font-bold">{totalQty.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-gray-700">Type</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700">Stage</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700">Quantity</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700">Reference</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-700">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {woTransactions.map((transaction) => {
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
                              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                {transaction.processStageName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-lg text-gray-800">
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
                            <td className="px-6 py-4">
                              {transaction.remarks ? (
                                <span className="text-sm text-gray-700" title={transaction.remarks}>
                                  {transaction.remarks.substring(0, 30)}...
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-600 font-semibold mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-blue-900">{filteredTransactions.length}</p>
          </div>
          <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-600 font-semibold mb-2">Total Quantity</p>
            <p className="text-3xl font-bold text-green-900">
              {filteredTransactions.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-sm text-purple-600 font-semibold mb-2">Work Orders</p>
            <p className="text-3xl font-bold text-purple-900">{Object.keys(groupedByWorkOrder).length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkHistory;