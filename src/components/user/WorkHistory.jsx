// // D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\user\WorkHistory.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   ArrowBack, 
//   Search, 
//   CalendarToday,
//   KeyboardArrowLeft,
//   KeyboardArrowRight,
//   FirstPage,
//   LastPage,
//   FilterList,
//   AccessTime,
//   Refresh
// } from '@mui/icons-material';
// import { useWashTransaction } from '../../hooks/useWashTransaction';
// import { useAuth } from '../../hooks/useAuth';
// import LoadingSpinner from '../common/LoadingSpinner';
// import EmptyState from '../common/EmptyState';
// import toast from 'react-hot-toast';
// import { format } from 'date-fns';
// import { 
//   TRANSACTION_TYPE_LABELS, 
//   TRANSACTION_TYPE_COLORS, 
//   TRANSACTION_TYPES 
// } from '../../constants/transactionConstants';

// const WorkHistory = () => {
//   const navigate = useNavigate();
//   const { user, isAdmin } = useAuth();
//   const { getPaginated, loading, data: transactions = [], pagination } = useWashTransaction();

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterType, setFilterType] = useState('all');

//   // Load data on mount and when filters change
//   useEffect(() => {
//     if (user) { // Ensure user is loaded before fetching data
//       loadData(1);
//     }
//   }, [user]);

//   // Load data with debounce on search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (user) { // Ensure user is loaded before fetching data
//         loadData(1);
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [searchQuery, filterType, user]);

//   // Load transactions
// // Load transactions
// const loadData = async (page = 1) => {
//   if (!user) {
//     console.warn('No user found');
//     return;
//   }

//   try {
//     // Build filters
//     const filterParams = {
//       page,
//       pageSize,
//       searchTerm: searchQuery,
//       sortBy: 'transactionDate',
//       sortOrder: 'desc',
//     };

//     // Add createdBy filter if not an admin
//     if (!isAdmin()) {
//       filterParams.createdBy = user.id; // Use createdBy instead of userId
//       console.log(`Filtering by createdBy: ${user.id} (${user.fullName})`);
//     } else {
//       console.log('Admin user - showing all transactions');
//     }

//     // Add transaction type filter if not 'all'
//     if (filterType !== 'all') {
//       filterParams.transactionTypeId = parseInt(filterType);
//     }

//     console.log('API Filter Params:', filterParams);

//     await getPaginated(filterParams);
//     setCurrentPage(page);
//   } catch (error) {
//     console.error('Error loading transactions:', error);
//     toast.error('Failed to load work history');
//   }
// };

//   // Group transactions by date
//   const groupedByDate = {};
//   transactions.forEach(t => {
//     const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');
//     if (!groupedByDate[dateKey]) {
//       groupedByDate[dateKey] = [];
//     }
//     groupedByDate[dateKey].push(t);
//   });

//   const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
//     new Date(b) - new Date(a)
//   );

//   // Pagination Handlers
//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
//       loadData(newPage);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handlePageSizeChange = (newSize) => {
//     setPageSize(newSize);
//     setCurrentPage(1);
//     loadData(1);
//   };

//   const getTypeColor = (type) => {
//     return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
//   };

//   const getTypeLabel = (type) => {
//     return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
//   };

//   const formatDateTime = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return format(date, 'HH:mm:ss');
//     } catch (error) {
//       return '-';
//     }
//   };

//   if (loading && transactions.length === 0) {
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
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate('/user/transactions')}
//             className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
//           >
//             <ArrowBack className="text-gray-600" style={{ fontSize: 22 }} />
//           </button>
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
//               {isAdmin() ? 'All Transactions' : 'My Work History'}
//             </h1>
//             <p className="text-gray-600 text-sm mt-1">
//               {isAdmin() 
//                 ? 'All transactions in the system'
//                 : `Transactions created by ${user?.fullName || user?.username || user?.email}`}
//             </p>
//           </div>
//         </div>

//         {/* Refresh Button */}
//         <button
//           onClick={() => loadData(currentPage)}
//           disabled={loading}
//           className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50 font-medium text-sm"
//         >
//           <Refresh fontSize="small" />
//           <span>Refresh</span>
//         </button>
//       </div>

//       {/* Search & Filter */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
//         <div className="flex flex-col sm:flex-row gap-4 mb-4">
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

//         {/* Results Summary */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-600">
//           <div className="flex items-center gap-2">
//             <FilterList style={{ fontSize: 18 }} />
//             <span>
//               Showing <strong>{transactions.length}</strong> of <strong>{pagination?.totalRecords || 0}</strong> transactions
//             </span>
//           </div>
//           <span className="text-xs text-gray-500">
//             Page <strong>{currentPage}</strong> of <strong>{pagination?.totalPages || 1}</strong>
//           </span>
//         </div>
//       </div>

//       {/* Content */}
//       {transactions.length === 0 ? (
//         <EmptyState 
//           title="No Transactions"
//           description={isAdmin() 
//             ? "No transactions found" 
//             : "You haven't created any transactions yet"}
//           variant="search"
//         />
//       ) : (
//         <>
//           <div className="space-y-6">
//             {sortedDates.map((dateKey) => {
//               const dateTransactions = groupedByDate[dateKey];
//               const totalQtyForDate = dateTransactions.reduce((sum, t) => sum + t.quantity, 0);
//               const transactionCountForDate = dateTransactions.length;

//               return (
//                 <div key={dateKey} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  
//                   {/* Date Header */}
//                   <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-3 md:p-4 text-white">
//                     <div className="flex items-center justify-between flex-wrap gap-3">
//                       <div className="flex items-center gap-3 flex-1 min-w-0">
//                         <CalendarToday style={{ fontSize: 18 }} className="flex-shrink-0" />
//                         <div className="min-w-0">
//                           <h3 className="text-lg md:text-xl font-semibold">
//                             {format(new Date(dateKey), 'dd MMMM yyyy')}
//                           </h3>
//                           <p className="text-xs opacity-90">
//                             {transactionCountForDate} transaction{transactionCountForDate !== 1 ? 's' : ''}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-xs opacity-75">Total Qty</p>
//                         <p className="text-lg md:text-xl font-bold">{totalQtyForDate.toLocaleString()}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Transactions Table */}
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead className="bg-gray-50 border-b-2 border-gray-200">
//                         <tr>
//                           <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Type</th>
//                           <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Work Order</th>
//                           <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Style</th>
//                           <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Buyer</th>
//                           <th className="hidden md:table-cell px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Stage</th>
//                           <th className="px-4 md:px-6 py-4 text-center font-bold text-gray-700 text-xs md:text-sm">Time</th>
//                           <th className="px-4 md:px-6 py-4 text-center font-bold text-gray-700 text-xs md:text-sm">Qty</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {dateTransactions.map((transaction) => {
//                           const typeColor = getTypeColor(transaction.transactionType);

//                           return (
//                             <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
//                               {/* Type */}
//                               <td className="px-4 md:px-6 py-3 md:py-4">
//                                 <span className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
//                                   <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
//                                   <span className="hidden sm:inline">{getTypeLabel(transaction.transactionType)}</span>
//                                   <span className="sm:hidden">{getTypeLabel(transaction.transactionType).charAt(0)}</span>
//                                 </span>
//                               </td>

//                               {/* Work Order No */}
//                               <td className="px-4 md:px-6 py-3 md:py-4">
//                                 <div className="min-w-0">
//                                   <p className="font-bold text-gray-900 text-xs md:text-sm truncate">{transaction.workOrderNo}</p>
//                                   <p className="text-xs text-gray-500 truncate">{transaction.factory}</p>
//                                 </div>
//                               </td>

//                               {/* Style */}
//                               <td className="px-4 md:px-6 py-3 md:py-4">
//                                 <p className="text-xs md:text-sm text-gray-700 max-w-xs truncate" title={transaction.styleName}>
//                                   {transaction.styleName}
//                                 </p>
//                               </td>

//                               {/* Buyer */}
//                               <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4">
//                                 <p className="text-xs md:text-sm text-gray-700 truncate">{transaction.buyer}</p>
//                               </td>

//                               {/* Stage */}
//                               <td className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4">
//                                 <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
//                                   {transaction.processStageName}
//                                 </span>
//                               </td>

//                               {/* Time */}
//                               <td className="px-4 md:px-6 py-3 md:py-4 text-center">
//                                 <div className="flex items-center justify-center gap-1">
//                                   <AccessTime style={{ fontSize: 14 }} className="text-gray-400" />
//                                   <span className="font-semibold text-xs md:text-sm text-gray-800">
//                                     {formatDateTime(transaction.transactionDate)}
//                                   </span>
//                                 </div>
//                               </td>

//                               {/* Quantity */}
//                               <td className="px-4 md:px-6 py-3 md:py-4 text-center">
//                                 <span className="font-bold text-sm md:text-lg text-gray-900">
//                                   {transaction.quantity.toLocaleString()}
//                                 </span>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Pagination Controls */}
//           {pagination && pagination.totalPages > 1 && (
//             <div className="mt-8 bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100">
//               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//                 {/* Page Size Selector */}
//                 <div className="flex items-center gap-3">
//                   <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Show per page:</span>
//                   <select
//                     value={pageSize}
//                     onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
//                     disabled={loading}
//                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
//                   >
//                     <option value={5}>5</option>
//                     <option value={10}>10</option>
//                     <option value={25}>25</option>
//                     <option value={50}>50</option>
//                     <option value={100}>100</option>
//                   </select>
//                 </div>

//                 {/* Page Info */}
//                 <div className="text-sm text-gray-600 text-center">
//                   <span>
//                     Showing page <strong>{currentPage}</strong> of <strong>{pagination.totalPages}</strong>
//                   </span>
//                   <span className="block text-xs text-gray-500 mt-1">
//                     ({pagination.totalRecords} total records)
//                   </span>
//                 </div>

//                 {/* Pagination Buttons */}
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => handlePageChange(1)}
//                     disabled={!pagination.hasPrevious || loading}
//                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     title="First Page"
//                   >
//                     <FirstPage style={{ fontSize: 20 }} />
//                   </button>

//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={!pagination.hasPrevious || loading}
//                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     title="Previous Page"
//                   >
//                     <KeyboardArrowLeft style={{ fontSize: 20 }} />
//                   </button>

//                   {/* Page Numbers */}
//                   <div className="flex items-center gap-1">
//                     {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (pagination.totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= pagination.totalPages - 2) {
//                         pageNum = pagination.totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }

//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           disabled={loading}
//                           className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
//                             currentPage === pageNum
//                               ? 'bg-primary-600 text-white'
//                               : 'border border-gray-300 hover:bg-gray-50'
//                           } disabled:opacity-50`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={!pagination.hasNext || loading}
//                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     title="Next Page"
//                   >
//                     <KeyboardArrowRight style={{ fontSize: 20 }} />
//                   </button>

//                   <button
//                     onClick={() => handlePageChange(pagination.totalPages)}
//                     disabled={!pagination.hasNext || loading}
//                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     title="Last Page"
//                   >
//                     <LastPage style={{ fontSize: 20 }} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Summary Stats */}
//       {transactions.length > 0 && (
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//           <div className="p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
//             <p className="text-xs md:text-sm text-blue-600 font-semibold mb-2">Total Records</p>
//             <p className="text-2xl md:text-3xl font-bold text-blue-900">{pagination?.totalRecords || 0}</p>
//           </div>

//           <div className="p-4 md:p-6 bg-green-50 border border-green-200 rounded-xl">
//             <p className="text-xs md:text-sm text-green-600 font-semibold mb-2">Page Quantity</p>
//             <p className="text-2xl md:text-3xl font-bold text-green-900">
//               {transactions.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()}
//             </p>
//           </div>

//           <div className="p-4 md:p-6 bg-purple-50 border border-purple-200 rounded-xl">
//             <p className="text-xs md:text-sm text-purple-600 font-semibold mb-2">Pagination</p>
//             <p className="text-2xl md:text-3xl font-bold text-purple-900">
//               {currentPage} / {pagination?.totalPages || 1}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WorkHistory;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   ArrowBack, 
//   Search, 
//   CalendarToday,
//   KeyboardArrowLeft,
//   KeyboardArrowRight,
//   FirstPage,
//   LastPage,
//   FilterList,
//   AccessTime,
//   Refresh,
//   MoreVert
// } from '@mui/icons-material';
// import { useWashTransaction } from '../../hooks/useWashTransaction';
// import { useAuth } from '../../hooks/useAuth';
// import LoadingSpinner from '../common/LoadingSpinner';
// import EmptyState from '../common/EmptyState';
// import toast from 'react-hot-toast';
// import { format } from 'date-fns';
// import { 
//   TRANSACTION_TYPE_LABELS, 
//   TRANSACTION_TYPE_COLORS, 
//   TRANSACTION_TYPES 
// } from '../../constants/transactionConstants';

// const WorkHistory = () => {
//   const navigate = useNavigate();
//   const { user, isAdmin } = useAuth();
  
//   const { 
//     getUserTransactionSummary, 
//     loading: hookLoading,
//     data: transactions = [],
//   } = useWashTransaction();

//   const [isLoading, setIsLoading] = useState(false);

//   // Date-wise pagination state
//   const [allTransactions, setAllTransactions] = useState([]);
//   const [groupedByDate, setGroupedByDate] = useState({});
//   const [sortedDates, setSortedDates] = useState([]);
//   const [currentDateIndex, setCurrentDateIndex] = useState(0);
  
//   // ✅ NEW: Date-level pagination
//   const [currentDatePageIndex, setCurrentDatePageIndex] = useState(0);
//   const TRANSACTIONS_PER_PAGE = 50; // ✅ Show 50 per page
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterType, setFilterType] = useState('all');
//   const [summaryData, setSummaryData] = useState(null);

//   // Get user ID
//   const getUserId = () => {
//     if (user?.id) return user.id;
    
//     try {
//       const userStr = localStorage.getItem('user');
//       if (userStr) {
//         const userData = JSON.parse(userStr);
//         return userData.id;
//       }
//     } catch (error) {
//       console.error('Error getting user from localStorage:', error);
//     }
//     return null;
//   };

//   const currentUserId = getUserId();

//   // Load data on mount
//   useEffect(() => {
//     if (currentUserId || isAdmin()) {
//       console.log('🚀 Initial load - User ID:', currentUserId);
//       loadData();
//     }
//   }, [currentUserId]);

//   // Load data with debounce on search/filter
//   useEffect(() => {
//     if (!currentUserId && !isAdmin()) return;
    
//     const timer = setTimeout(() => {
//       console.log('🔍 Search/Filter changed - Reloading data');
//       loadData();
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [searchQuery, filterType]);

//   // ✅ Reset date pagination when changing dates
//   useEffect(() => {
//     setCurrentDatePageIndex(0);
//   }, [currentDateIndex]);

//   // Load all data and group by date
//   const loadData = async () => {
//     if (!currentUserId && !isAdmin()) {
//       console.warn('⚠️ No user ID found and not admin');
//       toast.error('User ID not found. Please log in again.');
//       return;
//     }

//     try {
//       console.log('=== LOADING DATA ===');
//       setIsLoading(true);

//       // Load ALL transactions by making multiple requests if needed
//       let allTxns = [];
//       let page = 1;
//       let hasMore = true;

//       while (hasMore) {
//         console.log(`📄 Loading page ${page}...`);

//         const filterParams = {
//           page,
//           pageSize: 100,
//           searchTerm: searchQuery || undefined,
//           sortBy: 'transactionDate',
//           sortOrder: 'desc',
//           includeDayWiseBreakdown: false,
//         };

//         if (filterType !== 'all') {
//           filterParams.transactionTypeId = parseInt(filterType);
//         }

//         console.log('📤 Sending filter params:', filterParams);

//         const result = await getUserTransactionSummary(filterParams);
        
//         if (result && result.success) {
//           const txns = result.transactions || [];
//           console.log(`✅ Got ${txns.length} transactions on page ${page}`);
          
//           allTxns = [...allTxns, ...txns];

//           if (result.pagination && result.pagination.hasNext) {
//             page++;
//           } else {
//             hasMore = false;
//           }
//         } else {
//           console.error('❌ API call failed:', result?.message);
//           toast.error(result?.message || 'Failed to load work history');
//           hasMore = false;
//         }
//       }

//       console.log(`📊 Total transactions loaded: ${allTxns.length}`);

//       if (allTxns.length > 0) {
//         const firstResult = await getUserTransactionSummary({
//           page: 1,
//           pageSize: 100,
//           searchTerm: searchQuery || undefined,
//           sortBy: 'transactionDate',
//           sortOrder: 'desc',
//         });

//         setSummaryData(firstResult.data);
//         setAllTransactions(allTxns);

//         // Group by date
//         const grouped = {};
//         allTxns.forEach(t => {
//           try {
//             const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');
//             if (!grouped[dateKey]) {
//               grouped[dateKey] = [];
//             }
//             grouped[dateKey].push(t);
//           } catch (error) {
//             console.error('Error formatting date:', t.transactionDate, error);
//           }
//         });

//         // Sort dates in descending order (latest first)
//         const dates = Object.keys(grouped).sort((a, b) => 
//           new Date(b) - new Date(a)
//         );

//         console.log('📅 Grouped into', dates.length, 'dates');
//         dates.forEach(date => {
//           console.log(`   ${date}: ${grouped[date].length} transactions`);
//         });

//         setGroupedByDate(grouped);
//         setSortedDates(dates);
//         setCurrentDateIndex(0);
//         setCurrentDatePageIndex(0); // ✅ Reset page

//       } else {
//         console.warn('⚠️ No transactions found');
//         toast.info('No transactions found');
//         setAllTransactions([]);
//         setGroupedByDate({});
//         setSortedDates([]);
//         setCurrentDateIndex(0);
//         setCurrentDatePageIndex(0);
//       }

//     } catch (error) {
//       console.error('❌ Error loading transactions:', error);
//       toast.error('Failed to load work history');
//       setAllTransactions([]);
//       setGroupedByDate({});
//       setSortedDates([]);
//       setCurrentDateIndex(0);
//       setCurrentDatePageIndex(0);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Helper: Calculate totals for a date
//   const calculateDateTotals = (dateTransactions) => {
//     const received = dateTransactions
//       .filter(t => t.transactionTypeName === 'Receive')
//       .reduce((sum, t) => sum + t.quantity, 0);
    
//     const delivered = dateTransactions
//       .filter(t => t.transactionTypeName === 'Delivery')
//       .reduce((sum, t) => sum + t.quantity, 0);
    
//     return {
//       received,
//       delivered,
//       balance: received - delivered
//     };
//   };

//   // Get current date and its transactions
//   const currentDate = sortedDates[currentDateIndex];
//   const allCurrentDateTransactions = currentDate ? groupedByDate[currentDate] : [];
//   const currentTotals = calculateDateTotals(allCurrentDateTransactions);

//   // ✅ NEW: Paginate transactions within the date
//   const totalTransactionsInDate = allCurrentDateTransactions.length;
//   const totalPagesForDate = Math.ceil(totalTransactionsInDate / TRANSACTIONS_PER_PAGE);
//   const startIndex = currentDatePageIndex * TRANSACTIONS_PER_PAGE;
//   const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
//   const currentDateTransactions = allCurrentDateTransactions.slice(startIndex, endIndex);

//   console.log(`📊 Showing ${currentDateTransactions.length} of ${totalTransactionsInDate} transactions for ${currentDate}`);

//   // Date navigation handlers
//   const handleNextDate = () => {
//     if (currentDateIndex < sortedDates.length - 1) {
//       setCurrentDateIndex(currentDateIndex + 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handlePrevDate = () => {
//     if (currentDateIndex > 0) {
//       setCurrentDateIndex(currentDateIndex - 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handleFirstDate = () => {
//     setCurrentDateIndex(0);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleLastDate = () => {
//     setCurrentDateIndex(sortedDates.length - 1);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // ✅ NEW: Transaction-level pagination handlers
//   const handleNextTransactionPage = () => {
//     if (currentDatePageIndex < totalPagesForDate - 1) {
//       setCurrentDatePageIndex(currentDatePageIndex + 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handlePrevTransactionPage = () => {
//     if (currentDatePageIndex > 0) {
//       setCurrentDatePageIndex(currentDatePageIndex - 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const getTypeColor = (type) => {
//     return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
//   };

//   const getTypeLabel = (type) => {
//     return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
//   };

//   const formatDateTime = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return format(date, 'HH:mm:ss');
//     } catch (error) {
//       return '-';
//     }
//   };

//   if (isLoading && sortedDates.length === 0) {
//     return <LoadingSpinner size="lg" fullScreen />;
//   }

//   if (!currentUserId && !isAdmin()) {
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
//       {/* Debug Info */}
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//         <p className="text-sm font-mono">
//           <strong>🐛 Debug Info:</strong><br/>
//           User ID: <strong>{currentUserId}</strong><br/>
//           Is Admin: <strong>{isAdmin() ? 'Yes' : 'No'}</strong><br/>
//           Total Transactions: <strong>{allTransactions.length}</strong><br/>
//           Total Dates: <strong>{sortedDates.length}</strong><br/>
//           Current Date: <strong>{currentDateIndex + 1} / {sortedDates.length}</strong><br/>
//           {currentDate && <>
//             Transactions on this date: <strong>{totalTransactionsInDate}</strong><br/>
//             Current Page: <strong>{currentDatePageIndex + 1} / {totalPagesForDate}</strong><br/>
//             Showing: <strong>{currentDateTransactions.length} transactions</strong>
//           </>}
//           <br/>Loading: <strong>{isLoading ? 'Yes' : 'No'}</strong>
//         </p>
//       </div>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate('/user/transactions')}
//             className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
//           >
//             <ArrowBack className="text-gray-600" style={{ fontSize: 22 }} />
//           </button>
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
//               {isAdmin() ? 'All Transactions' : 'My Work History'}
//             </h1>
//             <p className="text-gray-600 text-sm mt-1">
//               {isAdmin() 
//                 ? 'All transactions in the system'
//                 : `Transactions created by ${user?.fullName || 'You'}`}
//             </p>
//           </div>
//         </div>

//         {/* Refresh Button */}
//         <button
//           onClick={() => loadData()}
//           disabled={isLoading}
//           className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50 font-medium text-sm"
//         >
//           <Refresh fontSize="small" />
//           <span>Refresh</span>
//         </button>
//       </div>

//       {/* Search & Filter */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
//         <div className="flex flex-col sm:flex-row gap-4 mb-4">
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

//         {/* Results Summary */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-600">
//           <div className="flex items-center gap-2">
//             <FilterList style={{ fontSize: 18 }} />
//             <span>
//               Total <strong>{allTransactions.length}</strong> transactions across{' '}
//               <strong>{sortedDates.length}</strong> dates
//             </span>
//           </div>
//           <span className="text-xs text-gray-500">
//             Date <strong>{currentDateIndex + 1}</strong> of <strong>{sortedDates.length}</strong>
//           </span>
//         </div>
//       </div>

//       {/* Content */}
//       {sortedDates.length === 0 ? (
//         <EmptyState 
//           title="No Transactions"
//           description={isAdmin() 
//             ? "No transactions found" 
//             : "You haven't created any transactions yet"}
//           variant="search"
//         />
//       ) : (
//         <>
//           {/* Current Date Table */}
//           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            
//             {/* ✅ Date Header with Summary */}
//             <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 md:p-6 text-white">
//               <div className="flex items-center justify-between flex-wrap gap-4">
//                 <div className="flex items-center gap-3 flex-1 min-w-0">
//                   <CalendarToday style={{ fontSize: 20 }} className="flex-shrink-0" />
//                   <div className="min-w-0">
//                     <h3 className="text-lg md:text-2xl font-semibold">
//                       {format(new Date(currentDate), 'dd MMMM yyyy (EEEE)')}
//                     </h3>
//                     <p className="text-sm opacity-90">
//                       {totalTransactionsInDate} total | Page {currentDatePageIndex + 1} of {totalPagesForDate}
//                     </p>
//                   </div>
//                 </div>
                
//                 {/* ✅ Date Summary Stats */}
//                 <div className="flex gap-4 md:gap-8">
//                   {/* Total Received */}
//                   <div className="text-right">
//                     <p className="text-xs opacity-75 mb-1">Received Qty</p>
//                     <p className="text-xl md:text-2xl font-bold text-green-200">
//                       {currentTotals.received.toLocaleString()}
//                     </p>
//                   </div>
                  
//                   {/* Total Delivered */}
//                   <div className="text-right">
//                     <p className="text-xs opacity-75 mb-1">Delivered Qty</p>
//                     <p className="text-xl md:text-2xl font-bold text-orange-200">
//                       {currentTotals.delivered.toLocaleString()}
//                     </p>
//                   </div>
                  
//                   {/* Net Balance */}
//                   <div className="text-right">
//                     <p className="text-xs opacity-75 mb-1">Net Balance</p>
//                     <p className={`text-xl md:text-2xl font-bold ${
//                       currentTotals.balance >= 0 ? 'text-blue-200' : 'text-red-200'
//                     }`}>
//                       {currentTotals.balance.toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Transactions Table */}
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b-2 border-gray-200">
//                   <tr>
//                     <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Type</th>
//                     <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Work Order</th>
//                     <th className="px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Style</th>
//                     <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Buyer</th>
//                     <th className="hidden md:table-cell px-4 md:px-6 py-4 text-left font-bold text-gray-700 text-xs md:text-sm">Stage</th>
//                     <th className="px-4 md:px-6 py-4 text-center font-bold text-gray-700 text-xs md:text-sm">Time</th>
//                     <th className="px-4 md:px-6 py-4 text-center font-bold text-gray-700 text-xs md:text-sm">Qty</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {currentDateTransactions.map((transaction) => {
//                     const typeColor = getTypeColor(transaction.transactionType);

//                     return (
//                       <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
//                         <td className="px-4 md:px-6 py-3 md:py-4">
//                           <span className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
//                             <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
//                             <span className="hidden sm:inline">{getTypeLabel(transaction.transactionType)}</span>
//                             <span className="sm:hidden">{getTypeLabel(transaction.transactionType).charAt(0)}</span>
//                           </span>
//                         </td>

//                         <td className="px-4 md:px-6 py-3 md:py-4">
//                           <div className="min-w-0">
//                             <p className="font-bold text-gray-900 text-xs md:text-sm truncate">{transaction.workOrderNo}</p>
//                             <p className="text-xs text-gray-500 truncate">{transaction.factory}</p>
//                           </div>
//                         </td>

//                         <td className="px-4 md:px-6 py-3 md:py-4">
//                           <p className="text-xs md:text-sm text-gray-700 max-w-xs truncate" title={transaction.styleName}>
//                             {transaction.styleName}
//                           </p>
//                         </td>

//                         <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4">
//                           <p className="text-xs md:text-sm text-gray-700 truncate">{transaction.buyer}</p>
//                         </td>

//                         <td className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4">
//                           <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
//                             {transaction.processStageName}
//                           </span>
//                         </td>

//                         <td className="px-4 md:px-6 py-3 md:py-4 text-center">
//                           <div className="flex items-center justify-center gap-1">
//                             <AccessTime style={{ fontSize: 14 }} className="text-gray-400" />
//                             <span className="font-semibold text-xs md:text-sm text-gray-800">
//                               {formatDateTime(transaction.transactionDate)}
//                             </span>
//                           </div>
//                         </td>

//                         <td className="px-4 md:px-6 py-3 md:py-4 text-center">
//                           <span className="font-bold text-sm md:text-lg text-gray-900">
//                             {transaction.quantity.toLocaleString()}
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* ✅ NEW: Transaction-level Pagination (if date has many transactions) */}
//             {totalPagesForDate > 1 && (
//               <div className="bg-gray-50 border-t border-gray-200 p-4">
//                 <div className="flex items-center justify-between gap-4 flex-wrap">
//                   <div className="text-sm text-gray-600">
//                     Showing <strong>{startIndex + 1}</strong>-<strong>{Math.min(endIndex, totalTransactionsInDate)}</strong> of{' '}
//                     <strong>{totalTransactionsInDate}</strong> transactions
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={handlePrevTransactionPage}
//                       disabled={currentDatePageIndex === 0}
//                       className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                       title="Previous"
//                     >
//                       <KeyboardArrowLeft style={{ fontSize: 20 }} />
//                     </button>
//                     <span className="px-4 py-2 text-sm font-semibold text-gray-700">
//                       Page {currentDatePageIndex + 1} / {totalPagesForDate}
//                     </span>
//                     <button
//                       onClick={handleNextTransactionPage}
//                       disabled={currentDatePageIndex === totalPagesForDate - 1}
//                       className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                       title="Next"
//                     >
//                       <KeyboardArrowRight style={{ fontSize: 20 }} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Date Navigation Pagination */}
//           {sortedDates.length > 1 && (
//             <div className="mt-8 bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100">
//               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
//                 {/* Date Info */}
//                 <div className="text-sm text-gray-600 text-center flex-1">
//                   <span>
//                     Showing date <strong>{currentDateIndex + 1}</strong> of <strong>{sortedDates.length}</strong>
//                   </span>
//                   <span className="block text-xs text-gray-500 mt-1">
//                     {totalTransactionsInDate} total transactions on this date
//                   </span>
//                 </div>

//                 {/* Date Navigation Buttons */}
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={handleFirstDate}
//                     disabled={currentDateIndex === 0}
//                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     title="First Date"
//                   >
//                     <FirstPage style={{ fontSize: 20 }} />
//                   </button>

//                   <button
//                     onClick={handlePrevDate}
//                     disabled={currentDateIndex === 0}
//                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     title="Previous Date"
//                   >
//                     <KeyboardArrowLeft style={{ fontSize: 20 }} />
//                   </button>

//                   <div className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-gray-50 min-w-max">
//                     {format(new Date(currentDate), 'dd MMM yyyy')}
//                   </div>

//                   <button
//                     onClick={handleNextDate}
//                     disabled={currentDateIndex === sortedDates.length - 1}
//                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     title="Next Date"
//                   >
//                     <KeyboardArrowRight style={{ fontSize: 20 }} />
//                   </button>

//                   <button
//                     onClick={handleLastDate}
//                     disabled={currentDateIndex === sortedDates.length - 1}
//                     className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                     title="Last Date"
//                   >
//                     <LastPage style={{ fontSize: 20 }} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Overall Summary Stats */}
//       {summaryData && allTransactions.length > 0 && (
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
//           <div className="p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl">
//             <p className="text-xs md:text-sm text-blue-600 font-semibold mb-2">Total Transactions</p>
//             <p className="text-2xl md:text-3xl font-bold text-blue-900">
//               {summaryData.totalTransactions || 0}
//             </p>
//           </div>

//           <div className="p-4 md:p-6 bg-green-50 border border-green-200 rounded-xl">
//             <p className="text-xs md:text-sm text-green-600 font-semibold mb-2">Total Received Qty</p>
//             <p className="text-2xl md:text-3xl font-bold text-green-900">
//               {(summaryData.totalReceivedQty || 0).toLocaleString()}
//             </p>
//           </div>

//           <div className="p-4 md:p-6 bg-orange-50 border border-orange-200 rounded-xl">
//             <p className="text-xs md:text-sm text-orange-600 font-semibold mb-2">Total Delivered Qty</p>
//             <p className="text-2xl md:text-3xl font-bold text-orange-900">
//               {(summaryData.totalDeliveredQty || 0).toLocaleString()}
//             </p>
//           </div>

//           <div className="p-4 md:p-6 bg-purple-50 border border-purple-200 rounded-xl">
//             <p className="text-xs md:text-sm text-purple-600 font-semibold mb-2">Net Balance</p>
//             <p className={`text-2xl md:text-3xl font-bold ${summaryData.netBalance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
//               {(summaryData.netBalance || 0).toLocaleString()}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WorkHistory;

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack, 
  Search, 
  CalendarToday,
  KeyboardArrowLeft, 
  KeyboardArrowRight, 
  Refresh,
  AccessTime,
  ArrowDropDown
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
  
  // Ref for the scrollable table container
  const tableContainerRef = useRef(null);

  const { 
    getUserTransactionSummary, 
    loading: hookLoading,
  } = useWashTransaction();

  const [isLoading, setIsLoading] = useState(false);

  // Date-wise pagination state
  const [allTransactions, setAllTransactions] = useState([]);
  const [groupedByDate, setGroupedByDate] = useState({});
  const [sortedDates, setSortedDates] = useState([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  
  // Date-level pagination (inside a specific date)
  const [currentDatePageIndex, setCurrentDatePageIndex] = useState(0);
  const TRANSACTIONS_PER_PAGE = 50; 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Helper Functions
  const getTypeColor = (type) => {
    return TRANSACTION_TYPE_COLORS[type] || TRANSACTION_TYPE_COLORS[TRANSACTION_TYPES.RECEIVE];
  };

  const getTypeLabel = (type) => {
    return TRANSACTION_TYPE_LABELS[type] || 'Unknown';
  };

const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    // 12‑hour format with AM/PM
    return format(date, 'hh:mm a');   // e.g., "03:45 PM"
  } catch (error) {
    return '-';
  }
};

  // Get user ID
  const getUserId = () => {
    if (user?.id) return user.id;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData.id;
      }
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
    }
    return null;
  };

  const currentUserId = getUserId();

  // Load data on mount
  useEffect(() => {
    if (currentUserId || isAdmin()) {
      loadData();
    }
  }, [currentUserId]);

  // Load data with debounce on search/filter
  useEffect(() => {
    if (!currentUserId && !isAdmin()) return;
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filterType]);

  // Reset page when date changes
  useEffect(() => {
    setCurrentDatePageIndex(0);
    scrollToTop();
  }, [currentDateIndex]);

  // Helper to scroll table to top
  const scrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  const loadData = async () => {
    if (!currentUserId && !isAdmin()) {
      toast.error('User ID not found. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);

      let allTxns = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const filterParams = {
          page,
          pageSize: 100,
          searchTerm: searchQuery || undefined,
          sortBy: 'transactionDate',
          sortOrder: 'desc',
          includeDayWiseBreakdown: false,
        };

        if (filterType !== 'all') {
          filterParams.transactionTypeId = parseInt(filterType);
        }

        const result = await getUserTransactionSummary(filterParams);
        
        if (result && result.success) {
          const txns = result.transactions || [];
          allTxns = [...allTxns, ...txns];

          if (result.pagination && result.pagination.hasNext) {
            page++;
          } else {
            hasMore = false;
          }
        } else {
          toast.error(result?.message || 'Failed to load work history');
          hasMore = false;
        }
      }

      if (allTxns.length > 0) {
        setAllTransactions(allTxns);

        // Group by date
        const grouped = {};
        allTxns.forEach(t => {
          try {
            const dateKey = format(new Date(t.transactionDate), 'yyyy-MM-dd');
            if (!grouped[dateKey]) {
              grouped[dateKey] = [];
            }
            grouped[dateKey].push(t);
          } catch (error) {
            console.error('Error formatting date:', t.transactionDate);
          }
        });

        // Sort dates descending
        const dates = Object.keys(grouped).sort((a, b) => 
          new Date(b) - new Date(a)
        );

        setGroupedByDate(grouped);
        setSortedDates(dates);
        setCurrentDateIndex(0);
        setCurrentDatePageIndex(0);

      } else {
        setAllTransactions([]);
        setGroupedByDate({});
        setSortedDates([]);
      }

    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load work history');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Calculate totals for a date
  const calculateDateTotals = (dateTransactions) => {
    const received = dateTransactions
      .filter(t => t.transactionTypeName === 'Receive')
      .reduce((sum, t) => sum + t.quantity, 0);
    
    const delivered = dateTransactions
      .filter(t => t.transactionTypeName === 'Delivery')
      .reduce((sum, t) => sum + t.quantity, 0);
    
    return {
      received,
      delivered,
      balance: received - delivered
    };
  };

  // Get current date and its transactions
  const currentDate = sortedDates[currentDateIndex];
  const allCurrentDateTransactions = currentDate ? groupedByDate[currentDate] : [];
  const currentTotals = calculateDateTotals(allCurrentDateTransactions);

  // Paginate transactions within the date
  const totalTransactionsInDate = allCurrentDateTransactions.length;
  const totalPagesForDate = Math.ceil(totalTransactionsInDate / TRANSACTIONS_PER_PAGE);
  const startIndex = currentDatePageIndex * TRANSACTIONS_PER_PAGE;
  const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
  const currentDateTransactions = allCurrentDateTransactions.slice(startIndex, endIndex);

  // Date navigation handlers
  const handleNextDate = () => {
    if (currentDateIndex < sortedDates.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };

  const handlePrevDate = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
    }
  };

  const handleDateSelect = (e) => {
    const newIndex = parseInt(e.target.value);
    setCurrentDateIndex(newIndex);
  };

  // Transaction page navigation handlers
  const handleNextTransactionPage = () => {
    if (currentDatePageIndex < totalPagesForDate - 1) {
      setCurrentDatePageIndex(currentDatePageIndex + 1);
      scrollToTop();
    }
  };

  const handlePrevTransactionPage = () => {
    if (currentDatePageIndex > 0) {
      setCurrentDatePageIndex(currentDatePageIndex - 1);
      scrollToTop();
    }
  };

  if (isLoading && sortedDates.length === 0) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  return (
    // ✅ Main Container
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-50/50">
      
      {/* 1. TOP SECTION (Fixed) */}
      <div className="flex-none p-3 md:p-6 pb-2 max-w-7xl mx-auto w-full">
        {/* Header Title */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => navigate('/user/transactions')}
              className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              <ArrowBack className="text-gray-600" style={{ fontSize: 20 }} />
            </button>
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">
              {isAdmin() ? 'All Transactions' : 'Work History'}
            </h1>
          </div>

          <button
            onClick={() => loadData()}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white border hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-1 shadow-sm transition duration-200 disabled:opacity-50 text-xs md:text-sm"
          >
            <Refresh fontSize="small" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-2 md:p-4 border border-gray-100 mb-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize: 18}} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 text-xs md:text-sm"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2 md:px-4 py-2 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-primary-500 transition duration-200 font-medium text-xs md:text-sm w-24 md:w-auto"
            >
              <option value="all">All</option>
              <option value={TRANSACTION_TYPES.RECEIVE}>Rcv</option>
              <option value={TRANSACTION_TYPES.DELIVERY}>Dlv</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. TABLE AREA (Grows & Scrolls) */}
      <div className="flex-1 min-h-0 flex flex-col max-w-7xl mx-auto w-full px-2 md:px-6 pb-2">
        {sortedDates.length === 0 ? (
          <EmptyState 
            title="No Transactions"
            description="No data found"
            variant="search"
          />
        ) : (
          <div className="flex flex-col h-full bg-white rounded-t-xl shadow-lg border border-gray-100 overflow-hidden">
            
            {/* ✅ NEW HEADER: Date Picker & Stats */}
            <div className="flex-none bg-gradient-to-r from-primary-600 to-primary-700 p-2 md:p-4 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                
{/* DATE NAVIGATOR & PICKER */}
<div className="flex items-center justify-between w-full md:w-auto gap-2 order-2 md:order-1 bg-white/10 rounded-lg p-1">
  
  {/* Prev Button */}
  <button 
    onClick={handlePrevDate} 
    disabled={currentDateIndex === 0}
    // Added: bg-transparent, border-none, outline-none, text-white
    className="p-1.5 rounded bg-transparent border-none outline-none text-white hover:bg-white/20 disabled:opacity-30 transition"
  >
    <KeyboardArrowLeft />
  </button>
  
  {/* Date Select Dropdown */}
  <div className="relative flex items-center justify-center flex-1 px-2 group cursor-pointer">
    <CalendarToday style={{ fontSize: 16 }} className="text-white opacity-90 absolute left-0 pointer-events-none" />
    
    <select 
      value={currentDateIndex}
      onChange={handleDateSelect}
      className="appearance-none bg-transparent text-white font-bold text-sm md:text-lg pl-6 pr-6 outline-none cursor-pointer text-center w-full border-none focus:ring-0"
    >
      {sortedDates.map((date, index) => (
        <option key={date} value={index} className="text-gray-800">
          {format(new Date(date), 'dd MMM yyyy')}
        </option>
      ))}
    </select>

    <ArrowDropDown className="text-white opacity-90 absolute right-0 pointer-events-none" />
  </div>

  {/* Next Button */}
  <button 
    onClick={handleNextDate} 
    disabled={currentDateIndex === sortedDates.length - 1}
    // Added: bg-transparent, border-none, outline-none, text-white
    className="p-1.5 rounded bg-transparent border-none outline-none text-white hover:bg-white/20 disabled:opacity-30 transition"
  >
    <KeyboardArrowRight />
  </button>
</div>
                {/* Stats Summary */}
                <div className="flex w-full md:w-auto justify-between md:justify-end gap-2 md:gap-6 text-xs md:text-sm order-1 md:order-2 border-b md:border-b-0 border-white/20 pb-2 md:pb-0 mb-2 md:mb-0">
                  <div className="text-center md:text-right">
                    <span className="opacity-75 text-[10px] md:text-xs block">Rcv</span>
                    <span className="font-bold text-green-200">{currentTotals.received.toLocaleString()}</span>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <span className="opacity-75 text-[10px] md:text-xs block">Dlv</span>
                    <span className="font-bold text-orange-200">{currentTotals.delivered.toLocaleString()}</span>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="opacity-75 text-[10px] md:text-xs block">Total</span>
                    <span className="font-bold text-orange-200">{(currentTotals.received + currentTotals.delivered).toLocaleString()}</span>
                  </div>
                  
                  {/* <div className="text-center md:text-right">
                    <span className="opacity-75 text-[10px] md:text-xs block">Net</span>
                    <span className={`font-bold ${
                      currentTotals.balance >= 0 ? 'text-blue-200' : 'text-red-200'
                    }`}>
                      {currentTotals.balance.toLocaleString()}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>

            {/* ✅ SCROLLABLE TABLE AREA - PROFESSIONAL MOBILE VIEW */}
            <div 
              ref={tableContainerRef} 
              className="flex-1 overflow-y-auto custom-scrollbar"
            >
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-3 py-3 text-left font-bold w-[40px] md:w-auto">Type</th>
                    <th className="px-2 md:px-6 py-3 text-left font-bold">Details (WO/Style)</th>
                    <th className="px-2 md:px-6 py-3 text-left font-bold w-[25%] md:w-auto">Info (Buyer/Stage)</th>
                    <th className="px-3 py-3 text-right font-bold w-[60px] md:w-auto">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentDateTransactions.map((transaction) => {
                    const typeColor = getTypeColor(transaction.transactionType);

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition duration-150">
                        
                        {/* 1. TYPE Column: Dot on Mobile, Badge on Desktop */}
                        <td className="px-3 py-3 align-top md:align-middle">
                          <div className="flex items-center justify-center md:justify-start pt-1 md:pt-0">
                             {/* Mobile Dot */}
                            <div className={`w-3 h-3 rounded-full md:hidden ${typeColor.badge}`} title={getTypeLabel(transaction.transactionType)}></div>
                            {/* Desktop Badge */}
                            <span className={`hidden md:inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold ${typeColor.bg} ${typeColor.text}`}>
                              <span className={`w-2 h-2 rounded-full ${typeColor.badge}`} />
                              {getTypeLabel(transaction.transactionType)}
                            </span>
                          </div>
                        </td>

                        {/* 2. DETAILS Column: Stacked Data for Mobile */}
                        <td className="px-2 md:px-6 py-2 md:py-3 align-top md:align-middle">
                          <div className="flex flex-col gap-0.5">
                            {/* Work Order */}
                            <span className="font-bold text-gray-900 text-sm">
                              {transaction.workOrderNo}
                            </span>
                            
                            {/* Factory Name */}
                            <span className="text-[11px] md:text-xs text-gray-500 font-medium">
                              {transaction.factory}
                            </span>

                            {/* Style Name (Stacked on Mobile) */}
                            <span className="text-xs text-gray-700 mt-0.5 block md:hidden">
                              <span className="text-gray-400 text-[10px]">Style: </span>
                              {transaction.styleName}
                            </span>
                             {/* Style Name (Separate line/hidden on desktop if column exists, but here we stack) */}
                             <span className="hidden md:block text-sm text-gray-700 mt-1">
                              {transaction.styleName}
                            </span>
                          </div>
                        </td>

                        {/* 3. INFO Column: Stacked Buyer/Stage */}
                        <td className="px-2 md:px-6 py-2 md:py-3 align-top md:align-middle">
                          <div className="flex flex-col items-start gap-1">
                            {/* Stage Badge */}
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] md:text-xs border border-blue-100 font-medium whitespace-nowrap">
                              {transaction.processStageName}
                            </span>
                            
                            {/* Buyer Name */}
                            <span className="text-[11px] md:text-sm text-gray-600 truncate max-w-[100px] md:max-w-xs">
                              {transaction.buyer}
                            </span>

                             {/* Time (Desktop Only) */}
                             <div className="hidden md:flex items-center gap-1 mt-1 text-gray-400">
                                <AccessTime style={{ fontSize: 12 }} />
                                <span className="text-xs">{formatDateTime(transaction.transactionDate)}</span>
                             </div>
                          </div>
                        </td>

                        {/* 4. QTY Column */}
                        <td className="px-3 py-2 md:py-3 text-right align-top md:align-middle">
                          <span className="font-bold text-gray-900 text-sm md:text-base">
                            {transaction.quantity.toLocaleString()}
                          </span>
                          {/* Time (Mobile Only - Small under Qty) */}
                          <div className="md:hidden text-[10px] text-gray-400 mt-1">
                            {formatDateTime(transaction.transactionDate)}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ Transaction Page Pagination (Fixed at bottom) */}
            {totalPagesForDate > 1 && (
              <div className="flex-none bg-gray-50 border-t border-gray-200 p-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-500 hidden sm:inline pl-2">
                    Showing <strong>{startIndex + 1}</strong>-<strong>{Math.min(endIndex, totalTransactionsInDate)}</strong> of{' '}
                    <strong>{totalTransactionsInDate}</strong>
                  </span>
                  
                  <div className="flex items-center gap-2 mx-auto sm:mx-0 w-full justify-center sm:justify-end">
                    <button
                      onClick={handlePrevTransactionPage}
                      disabled={currentDatePageIndex === 0}
                      className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <KeyboardArrowLeft />
                    </button>
                    <span className="font-medium text-gray-700">
                      Page {currentDatePageIndex + 1} / {totalPagesForDate}
                    </span>
                    <button
                      onClick={handleNextTransactionPage}
                      disabled={currentDatePageIndex === totalPagesForDate - 1}
                      className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <KeyboardArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkHistory;