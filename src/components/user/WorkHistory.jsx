// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\user\WorkHistory.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack, 
  Search, 
  CalendarToday,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FirstPage,
  LastPage,
  FilterList,
  AccessTime,
  Refresh
} from '@mui/icons-material';
import { useWashTransaction } from '../../hooks/useWashTransaction';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  TRANSACTION_TYPE_LABELS, 
  TRANSACTION_TYPE_COLORS, 
  TRANSACTION_TYPES 
} from '../../constants/transactionConstants';

const WorkHistory = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { getPaginated, loading, data: transactions = [], pagination } = useWashTransaction();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Load data on mount and when filters change
  useEffect(() => {
    if (user) { // Ensure user is loaded before fetching data
      loadData(1);
    }
  }, [user]);

  // Load data with debounce on search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) { // Ensure user is loaded before fetching data
        loadData(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filterType, user]);

  // Load transactions
  const loadData = async (page = 1) => {
    try {
      // Build filters
      const filterParams = {
        page,
        pageSize,
        searchTerm: searchQuery,
        sortBy: 'transactionDate',
        sortOrder: 'desc',
      };

      // Add user ID filter if not an admin
      if (user && !isAdmin()) {
        filterParams.userId = user.id; // Assuming user.id holds the user's ID
      }

      // Add transaction type filter if not 'all'
      if (filterType !== 'all') {
        filterParams.transactionTypeId = filterType;
      }

      await getPaginated(filterParams);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load work history');
    }
  };

  // Group transactions by date
  const groupedByDate = {};
  transactions.forEach(t => {
    const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(t);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b) - new Date(a)
  );

  // Pagination Handlers
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
      loadData(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    loadData(1);
  };

  const getTypeColor = (type) => {
    return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
  };

  const getTypeLabel = (type) => {
    return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm:ss');
    } catch (error) {
      return '-';
    }
  };

  if (loading && transactions.length === 0) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  if (!user) {
    return (
      <div className="fade-in max-w-7xl mx-auto p-6">
        <EmptyState 
          title="Please Log In"
          description="You need to be logged in to view your work history"
        />
      </div>
    );
  }

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/user/transactions')}
            className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            <ArrowBack className="text-gray-600" style={{ fontSize: 22 }} />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              {isAdmin() ? 'All Transactions' : 'My Work History'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {isAdmin() 
                ? 'All transactions in the system'
                : `Transactions created by ${user?.fullName || user?.username || user?.email}`}
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => loadData(currentPage)}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50 font-medium text-sm"
        >
          <Refresh fontSize="small" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Work Order, Style, Buyer, or Stage..."
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

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FilterList style={{ fontSize: 18 }} />
            <span>
              Showing <strong>{transactions.length}</strong> of <strong>{pagination?.totalRecords || 0}</strong> transactions
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Page <strong>{currentPage}</strong> of <strong>{pagination?.totalPages || 1}</strong>
          </span>
        </div>
      </div>

      {/* Content */}
      {transactions.length === 0 ? (
        <EmptyState 
          title="No Transactions"
          description={isAdmin() 
            ? "No transactions found" 
            : "You haven't created any transactions yet"}
          variant="search"
        />
      ) : (
        <>
          <div className="space-y-6">
            {sortedDates.map((dateKey) => {
              const dateTransactions = groupedByDate[dateKey];
              const totalQtyForDate = dateTransactions.reduce((sum, t) => sum + t.quantity, 0);
              const transactionCountForDate = dateTransactions.length;

              return (
                <div key={dateKey} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  
                  {/* Date Header */}
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-3 md:p-4 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CalendarToday style={{ fontSize: 18 }} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <h3 className="text-lg md:text-xl font-semibold">
                            {format(new Date(dateKey), 'dd MMMM yyyy')}
                          </h3>
                          <p className="text-xs opacity-90">
                            {transactionCountForDate} transaction{transactionCountForDate !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">Total Qty</p>
                        <p className="text-lg md:text-xl font-bold">{totalQtyForDate.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Type</th>
                          <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Work Order</th>
                          <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Style</th>
                          <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Buyer</th>
                          <th className="hidden md:table-cell px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Stage</th>
                          <th className="px-4 md:px-6 py-4 text-center font-bold text-gray-700 text-xs md:text-sm">Time</th>
                          <th className="px-4 md:px-6 py-4 text-center font-bold text-gray-700 text-xs md:text-sm">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dateTransactions.map((transaction) => {
                          const typeColor = getTypeColor(transaction.transactionType);

                          return (
                            <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
                              {/* Type */}
                              <td className="px-4 md:px-6 py-3 md:py-4">
                                <span className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
                                  <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
                                  <span className="hidden sm:inline">{getTypeLabel(transaction.transactionType)}</span>
                                  <span className="sm:hidden">{getTypeLabel(transaction.transactionType).charAt(0)}</span>
                                </span>
                              </td>

                              {/* Work Order No */}
                              <td className="px-4 md:px-6 py-3 md:py-4">
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 text-xs md:text-sm truncate">{transaction.workOrderNo}</p>
                                  <p className="text-xs text-gray-500 truncate">{transaction.factory}</p>
                                </div>
                              </td>

                              {/* Style */}
                              <td className="px-4 md:px-6 py-3 md:py-4">
                                <p className="text-xs md:text-sm text-gray-700 max-w-xs truncate" title={transaction.styleName}>
                                  {transaction.styleName}
                                </p>
                              </td>

                              {/* Buyer */}
                              <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4">
                                <p className="text-xs md:text-sm text-gray-700 truncate">{transaction.buyer}</p>
                              </td>

                              {/* Stage */}
                              <td className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                  {transaction.processStageName}
                                </span>
                              </td>

                              {/* Time */}
                              <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <AccessTime style={{ fontSize: 14 }} className="text-gray-400" />
                                  <span className="font-semibold text-xs md:text-sm text-gray-800">
                                    {formatDateTime(transaction.transactionDate)}
                                  </span>
                                </div>
                              </td>

                              {/* Quantity */}
                              <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                <span className="font-bold text-sm md:text-lg text-gray-900">
                                  {transaction.quantity.toLocaleString()}
                                </span>
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

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Page Size Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Show per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    disabled={loading}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Page Info */}
                <div className="text-sm text-gray-600 text-center">
                  <span>
                    Showing page <strong>{currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    ({pagination.totalRecords} total records)
                  </span>
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={!pagination.hasPrevious || loading}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="First Page"
                  >
                    <FirstPage style={{ fontSize: 20 }} />
                  </button>

                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevious || loading}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Previous Page"
                  >
                    <KeyboardArrowLeft style={{ fontSize: 20 }} />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
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
                          className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
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

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext || loading}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Next Page"
                  >
                    <KeyboardArrowRight style={{ fontSize: 20 }} />
                  </button>

                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={!pagination.hasNext || loading}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Last Page"
                  >
                    <LastPage style={{ fontSize: 20 }} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs md:text-sm text-blue-600 font-semibold mb-2">Total Records</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-900">{pagination?.totalRecords || 0}</p>
          </div>

          <div className="p-4 md:p-6 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-xs md:text-sm text-green-600 font-semibold mb-2">Page Quantity</p>
            <p className="text-2xl md:text-3xl font-bold text-green-900">
              {transactions.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()}
            </p>
          </div>

          <div className="p-4 md:p-6 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-xs md:text-sm text-purple-600 font-semibold mb-2">Pagination</p>
            <p className="text-2xl md:text-3xl font-bold text-purple-900">
              {currentPage} / {pagination?.totalPages || 1}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkHistory;









