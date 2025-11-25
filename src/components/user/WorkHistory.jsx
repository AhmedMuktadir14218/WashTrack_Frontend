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
  FilterList
} from '@mui/icons-material';
import { washTransactionApi } from '../../api/washTransactionApi';
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

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // ✅ NEW: Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const transResponse = await washTransactionApi.getAll();
      
      if (transResponse.data.success) {
        let userTransactions = transResponse.data.data || [];
        
        if (!isAdmin()) {
          userTransactions = userTransactions.filter(t => t.createdBy === user?.id);
        }

        userTransactions.sort((a, b) => 
          new Date(b.transactionDate) - new Date(a.transactionDate)
        );

        setTransactions(userTransactions);
      }
    } catch (error) {
      toast.error('Failed to load work history');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter & Search Logic
  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      t.workOrderNo?.toLowerCase().includes(searchLower) ||
      t.processStageName?.toLowerCase().includes(searchLower) ||
      t.styleName?.toLowerCase().includes(searchLower) ||
      t.buyer?.toLowerCase().includes(searchLower);

    const matchType = filterType === 'all' || t.transactionType === parseInt(filterType);

    return matchSearch && matchType;
  });

  // ✅ Pagination Logic
  const totalRecords = filteredTransactions.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  useEffect(() => {
    setTotalPages(Math.ceil(totalRecords / pageSize));
  }, [totalRecords, pageSize]);

  useEffect(() => {
    // Reset to page 1 when search/filter changes
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  // ✅ Group by date
  const groupedByDate = {};
  paginatedTransactions.forEach(t => {
    const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(t);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b) - new Date(a)
  );

  // ✅ Pagination Handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const getTypeColor = (type) => {
    return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
  };

  const getTypeLabel = (type) => {
    return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
  };

  if (loading) {
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
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/user/transactions')}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <ArrowBack className="text-gray-600" style={{ fontSize: 22 }} />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            {isAdmin() ? 'All Transactions' : 'My Work History'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin() 
              ? 'All transactions in the system'
              : `All transactions created by ${user?.fullName || user?.username || user?.email}`}
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

        {/* ✅ Results Summary */}
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <FilterList style={{ fontSize: 18 }} />
          <span>
            Showing <strong>{paginatedTransactions.length}</strong> of <strong>{totalRecords}</strong> transactions
          </span>
        </div>
      </div>

      {/* Content */}
      {filteredTransactions.length === 0 ? (
        <EmptyState 
          title="No Transactions"
          description={isAdmin() 
            ? "No transactions found in the system" 
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
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-2 md:p-3 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <CalendarToday style={{ fontSize: 16 }} className="flex-shrink-0" />
                        <div className="min-w-0 leading-tight">
                          <h3 className="text-base md:text-lg font-semibold">
                            {format(new Date(dateKey), 'dd MMMM yyyy')}
                          </h3>
                          <p className="text-xs opacity-90">
                            {transactionCountForDate} transaction{transactionCountForDate !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right leading-tight">
                        <p className="text-xs opacity-75">Total Qty</p>
                        <p className="text-base md:text-lg font-bold">{totalQtyForDate.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Type</th>
                          <th className="px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Work Order</th>
                          <th className="px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Style</th>
                          <th className="hidden sm:table-cell px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Buyer</th>
                          <th className="hidden md:table-cell px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Stage</th>
                                                    <th className="px-3 md:px-6 py-4 text-center font-bold text-gray-700 text-xs md:text-sm">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dateTransactions.map((transaction) => {
                          const typeColor = getTypeColor(transaction.transactionType);

                          return (
                            <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
                              {/* Type */}
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <span className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
                                  <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
                                  <span className="hidden sm:inline">{getTypeLabel(transaction.transactionType)}</span>
                                  <span className="sm:hidden">{getTypeLabel(transaction.transactionType).charAt(0)}</span>
                                </span>
                              </td>

                              {/* Work Order No */}
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 text-xs md:text-sm truncate">{transaction.workOrderNo}</p>
                                  <p className="text-xs text-gray-500 truncate">{transaction.factory}</p>
                                </div>
                              </td>

                              {/* Style */}
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <p className="text-xs md:text-sm text-gray-700 max-w-xs md:max-w-sm truncate">{transaction.styleName}</p>
                              </td>

                              {/* Buyer - Hidden on mobile */}
                              <td className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4">
                                <p className="text-xs md:text-sm text-gray-700 truncate">{transaction.buyer}</p>
                              </td>

                              {/* Stage - Hidden on tablet */}
                              <td className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4">
                                <span className="inline-block px-2 md:px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                  {transaction.processStageName}
                                </span>
                              </td>

                              {/* Quantity */}
                              <td className="px-3 md:px-6 py-3 md:py-4 text-center">
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

          {/* ✅ NEW: Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Show:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    per page
                  </span>
                </div>

                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(endIndex, totalRecords)}</strong> of <strong>{totalRecords}</strong> results
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="First Page"
                  >
                    <FirstPage style={{ fontSize: 20 }} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Previous Page"
                  >
                    <KeyboardArrowLeft style={{ fontSize: 20 }} />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                              currentPage === page
                                ? 'bg-primary-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Next Page"
                  >
                    <KeyboardArrowRight style={{ fontSize: 20 }} />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
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
      {filteredTransactions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs md:text-sm text-blue-600 font-semibold mb-2">Total Transactions</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-900">{totalRecords}</p>
          </div>

          <div className="p-4 md:p-6 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-xs md:text-sm text-green-600 font-semibold mb-2">Total Quantity</p>
            <p className="text-2xl md:text-3xl font-bold text-green-900">
              {filteredTransactions.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()}
            </p>
          </div>

          <div className="p-4 md:p-6 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-xs md:text-sm text-purple-600 font-semibold mb-2">Current Page</p>
            <p className="text-2xl md:text-3xl font-bold text-purple-900">
              {currentPage} / {totalPages}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkHistory;

// // D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\user\WorkHistory.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowBack, Search, CalendarToday } from '@mui/icons-material';
// import { washTransactionApi } from '../../api/washTransactionApi';
// import { useAuth } from '../../hooks/useAuth';
// import LoadingSpinner from '../common/LoadingSpinner';
// import EmptyState from '../common/EmptyState';
// import toast from 'react-hot-toast';
// import { format } from 'date-fns';
// import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS, TRANSACTION_TYPES } from '../../constants/transactionConstants';

// const WorkHistory = () => {
//   const navigate = useNavigate();
//   const { user, isAdmin } = useAuth();

//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterType, setFilterType] = useState('all');

//   useEffect(() => {
//     loadData();
//   }, [user]);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const transResponse = await washTransactionApi.getAll();
      
//       if (transResponse.data.success) {
//         let userTransactions = transResponse.data.data || [];
        
//         if (!isAdmin()) {
//           userTransactions = userTransactions.filter(t => t.createdBy === user?.id);
//         }

//         userTransactions.sort((a, b) => 
//           new Date(b.transactionDate) - new Date(a.transactionDate)
//         );

//         setTransactions(userTransactions);
//       }
//     } catch (error) {
//       toast.error('Failed to load work history');
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredTransactions = transactions.filter(t => {
//     const searchLower = searchQuery.toLowerCase();
//     const matchSearch =
//       t.workOrderNo?.toLowerCase().includes(searchLower) ||
//       t.processStageName?.toLowerCase().includes(searchLower) ||
//       t.styleName?.toLowerCase().includes(searchLower) ||
//       t.buyer?.toLowerCase().includes(searchLower);

//     const matchType = filterType === 'all' || t.transactionType === parseInt(filterType);

//     return matchSearch && matchType;
//   });

//   // Group by date
//   const groupedByDate = {};
//   filteredTransactions.forEach(t => {
//     const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');
//     if (!groupedByDate[dateKey]) {
//       groupedByDate[dateKey] = [];
//     }
//     groupedByDate[dateKey].push(t);
//   });

//   const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
//     new Date(b) - new Date(a)
//   );

//   const getTypeColor = (type) => {
//     return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
//   };

//   const getTypeLabel = (type) => {
//     return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
//   };

//   if (loading) {
//     return <LoadingSpinner size="lg" fullScreen />;
//   }

//   if (!user) {
//     return (
//       <div className="fade-in max-w-7xl mx-auto p-6">
//         <EmptyState 
//           title="Please Log In"
//           description="You need to be logged in to view your work history"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="fade-in max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <button
//           onClick={() => navigate('/user/transactions')}
//           className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
//         >
//           <ArrowBack className="text-gray-600" style={{ fontSize: 22 }} />
//         </button>
//         <div>
//           <h1 className="text-4xl font-bold text-gray-800">
//             {isAdmin() ? 'All Transactions' : 'My Work History'}
//           </h1>
//           <p className="text-gray-600 mt-1">
//             {isAdmin() 
//               ? 'All transactions in the system'
//               : `All transactions created by ${user?.fullName || user?.username || user?.email}`}
//           </p>
//         </div>
//       </div>

//       {/* Search & Filter */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by Work Order, Style, Buyer, or Stage..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
//             />
//           </div>

//           <select
//             value={filterType}
//             onChange={(e) => setFilterType(e.target.value)}
//             className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200 font-medium"
//           >
//             <option value="all">All Types</option>
//             <option value={TRANSACTION_TYPES.RECEIVE}>Receive</option>
//             <option value={TRANSACTION_TYPES.DELIVERY}>Delivery</option>
//           </select>
//         </div>
//       </div>
//       {/* Content */}
//       {filteredTransactions.length === 0 ? (
//         <EmptyState 
//           title="No Transactions"
//           description={isAdmin() 
//             ? "No transactions found in the system" 
//             : "You haven't created any transactions yet"}
//           variant="search"
//         />
//       ) : (
//         <div className="space-y-6">
//           {sortedDates.map((dateKey) => {
//             const dateTransactions = groupedByDate[dateKey];
//             const totalQtyForDate = dateTransactions.reduce((sum, t) => sum + t.quantity, 0);
//             const transactionCountForDate = dateTransactions.length;
//             const receiveQty = dateTransactions
//               .filter(t => t.transactionType === TRANSACTION_TYPES.RECEIVE)
//               .reduce((sum, t) => sum + t.quantity, 0);
//             const deliveryQty = dateTransactions
//               .filter(t => t.transactionType === TRANSACTION_TYPES.DELIVERY)
//               .reduce((sum, t) => sum + t.quantity, 0);

//             return (
//               <div key={dateKey} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                
//                 {/* Date Header */}
// <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-2 md:p-3 text-white">
//   <div className="flex items-center justify-between flex-wrap gap-2">
//     <div className="flex items-center gap-2 flex-1 min-w-0">
//       <CalendarToday style={{ fontSize: 16 }} className="flex-shrink-0" />
//       <div className="min-w-0 leading-tight">
//         <h3 className="text-base md:text-lg font-semibold">
//           {format(new Date(dateKey), ' dd MMMM yyyy')}
//         </h3>
//         <p className="text-xs opacity-90">
//           {transactionCountForDate} transaction{transactionCountForDate !== 1 ? 's' : ''}
//         </p>
//       </div>
//     </div>
//     <div className="text-right leading-tight">
//       <p className="text-xs opacity-75">Total Qty</p>
//       <p className="text-base md:text-lg font-bold">{totalQtyForDate.toLocaleString()}</p>
//     </div>
//   </div>
// </div>


//                 {/* Transactions Table */}
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-50 border-b-2 border-gray-200">
//                       <tr>
//                         <th className="px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Type</th>
//                         <th className="px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Work Order</th>
//                         <th className="px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Style</th>
//                         <th className="hidden sm:table-cell px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Buyer</th>
//                         <th className="hidden md:table-cell px-3 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Stage</th>
//                         <th className="px-3 md:px-6 py-4 text-center font-bold text-gray-700 text-xs md:text-sm">Qty</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {dateTransactions.map((transaction) => {
//                         const typeColor = getTypeColor(transaction.transactionType);

//                         return (
//                           <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
//                             {/* Type */}
//                             <td className="px-3 md:px-6 py-3 md:py-4">
//                               <span className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
//                                 <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
//                                 <span className="hidden sm:inline">{getTypeLabel(transaction.transactionType)}</span>
//                                 <span className="sm:hidden">{getTypeLabel(transaction.transactionType).charAt(0)}</span>
//                               </span>
//                             </td>

//                             {/* Work Order No */}
//                             <td className="px-3 md:px-6 py-3 md:py-4">
//                               <div className="min-w-0">
//                                 <p className="font-bold text-gray-900 text-xs md:text-sm truncate">{transaction.workOrderNo}</p>
//                                 <p className="text-xs text-gray-500 truncate">{transaction.factory}</p>
//                               </div>
//                             </td>

//                             {/* Style */}
//                             <td className="px-3 md:px-6 py-3 md:py-4">
//                               <p className="text-xs md:text-sm text-gray-700 max-w-xs md:max-w-sm truncate">{transaction.styleName}</p>
//                             </td>

//                             {/* Buyer - Hidden on mobile */}
//                             <td className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4">
//                               <p className="text-xs md:text-sm text-gray-700 truncate">{transaction.buyer}</p>
//                             </td>

//                             {/* Stage - Hidden on tablet */}
//                             <td className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4">
//                               <span className="inline-block px-2 md:px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
//                                 {transaction.processStageName}
//                               </span>
//                             </td>

//                             {/* Quantity */}
//                             <td className="px-3 md:px-6 py-3 md:py-4 text-center">
//                               <span className="font-bold text-sm md:text-lg text-gray-900">
//                                 {transaction.quantity.toLocaleString()}
//                               </span>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Summary Stats */}
//       {filteredTransactions.length > 0 && (
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//           <div className="p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
//             <p className="text-xs md:text-sm text-blue-600 font-semibold mb-2">Total Transactions</p>
//             <p className="text-2xl md:text-3xl font-bold text-blue-900">{filteredTransactions.length}</p>
//           </div>

//           <div className="p-4 md:p-6 bg-green-50 border border-green-200 rounded-xl">
//             <p className="text-xs md:text-sm text-green-600 font-semibold mb-2">Total Quantity</p>
//             <p className="text-2xl md:text-3xl font-bold text-green-900">
//               {filteredTransactions.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()}
//             </p>
//           </div>

//           <div className="p-4 md:p-6 bg-purple-50 border border-purple-200 rounded-xl">
//             <p className="text-xs md:text-sm text-purple-600 font-semibold mb-2">Unique Dates</p>
//             <p className="text-2xl md:text-3xl font-bold text-purple-900">{sortedDates.length}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WorkHistory;