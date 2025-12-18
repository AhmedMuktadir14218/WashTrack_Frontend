// // D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\reports\Reports.jsx
// // D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\reports\Reports.jsx
// import { useState, useEffect, useMemo } from 'react';
// import { Download, Search, Refresh, Print, ChevronLeft, ChevronRight, FirstPage, LastPage } from '@mui/icons-material';
// import { workOrderApi } from '../../api/workOrderApi';
// import { washTransactionApi } from '../../api/washTransactionApi';
// import LoadingSpinner from '../common/LoadingSpinner';
// import EmptyState from '../common/EmptyState';
// import toast from 'react-hot-toast';

// const Reports = () => {
//   const [workOrders, setWorkOrders] = useState([]);
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredData, setFilteredData] = useState([]);
  
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [paginatedData, setPaginatedData] = useState([]);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);

//       // Fetch work orders
//       const woResponse = await workOrderApi.getAll();
//       if (woResponse.data.success) {
//         setWorkOrders(woResponse.data.data || []);
//       }

//       // Fetch all transactions
//       const transResponse = await washTransactionApi.getAll();
//       if (transResponse.data.success) {
//         setTransactions(transResponse.data.data || []);
//       }
//     } catch (error) {
//       toast.error('Failed to load report data');
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reportData = useMemo(() => {
//     return workOrders.map(wo => {
//       const woTransactions = transactions.filter(t => t.workOrderId === wo.id);

//       const getStageQuantity = (stageName, type) => {
//         const stageTransactions = woTransactions.filter(
//           t => t.processStageName === stageName && t.transactionType === type
//         );
//         return stageTransactions.reduce((sum, t) => sum + t.quantity, 0);
//       };

//       return {
//         id: wo.id,
//         factory: wo.factory,
//         unit: wo.unit,
//         workOrderNo: wo.workOrderNo,
//         fastReactNo: wo.fastReactNo || '-',
//         buyer: wo.buyer,
//         styleName: wo.styleName,
//         marks: wo.marks || '-',
//         orderQuantity: wo.orderQuantity,
//         WashTargetDate: wo.washTargetDate ? new Date(wo.washTargetDate).toLocaleDateString('en-GB') : '-', 
//         TotalWashReceived: wo.totalWashReceived || 0,
//         TotalWashDelivery: wo.totalWashDelivery || 0,
//         firstDryReceive: getStageQuantity('1st Dry', 1),
//         firstDryDelivery: getStageQuantity('1st Dry', 2),
//         unwashReceive: getStageQuantity('Unwash', 1),
//         unwashDelivery: getStageQuantity('Unwash', 2),
//         firstWashReceive: getStageQuantity('1st Wash', 1),
//         firstWashDelivery: getStageQuantity('1st Wash', 2),
//         secondDryReceive: getStageQuantity('2nd Dry', 1),
//         secondDryDelivery: getStageQuantity('2nd Dry', 2),
//         finalWashReceive: getStageQuantity('Final Wash', 1),
//         finalWashDelivery: getStageQuantity('Final Wash', 2),
//       };
//     });
//   }, [workOrders, transactions]);

//   useEffect(() => {
//     if (searchQuery.trim() === '') {
//       setFilteredData(reportData);
//     } else {
//       const query = searchQuery.toLowerCase();
//       const filtered = reportData.filter(
//         item =>
//           item.workOrderNo.toLowerCase().includes(query) ||
//           item.fastReactNo.toLowerCase().includes(query) ||
//           item.buyer.toLowerCase().includes(query) ||
//           item.styleName.toLowerCase().includes(query)
//       );
//       setFilteredData(filtered);
//     }
//     setCurrentPage(1); // Reset to first page when search changes
//   }, [searchQuery, reportData]);

//   // Calculate pagination
//   useEffect(() => {
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     const endIndex = startIndex + rowsPerPage;
//     setPaginatedData(filteredData.slice(startIndex, endIndex));
//   }, [currentPage, rowsPerPage, filteredData]);

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredData.length / rowsPerPage);
//   const startRecord = filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
//   const endRecord = Math.min(currentPage * rowsPerPage, filteredData.length);

//   // Pagination handlers
//   const handleFirstPage = () => setCurrentPage(1);
//   const handleLastPage = () => setCurrentPage(totalPages);
//   const handlePreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
//   const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
//   const handleRowsPerPageChange = (e) => {
//     setRowsPerPage(Number(e.target.value));
//     setCurrentPage(1);
//   };

//   // Generate page numbers to display
//   const getPageNumbers = () => {
//     const delta = 2;
//     const range = [];
//     const rangeWithDots = [];
//     let l;

//     for (let i = 1; i <= totalPages; i++) {
//       if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
//         range.push(i);
//       }
//     }

//     range.forEach((i) => {
//       if (l) {
//         if (i - l === 2) {
//           rangeWithDots.push(l + 1);
//         } else if (i - l !== 1) {
//           rangeWithDots.push('...');
//         }
//       }
//       rangeWithDots.push(i);
//       l = i;
//     });

//     return rangeWithDots;
//   };

//   const handleExportExcel = () => {
//     const headers = [
//       'Factory',
//       'Unit',
//       'Work Order No',
//       'FastReact No',
//       'Buyer',
//       'Style Name',
//       'Order Qty',
//       'Wash Target Date',
//       'Marks',
//       'Total Wash Received',
//       'Total Wash Delivery',
//       '1st Dry Receive',
//       '1st Dry Delivery',
//       'Unwash Receive',
//       'Unwash Delivery',
//       '1st Wash Receive',
//       '1st Wash Delivery',
//       '2nd Dry Receive',
//       '2nd Dry Delivery',
//       'Final Wash Receive',
//       'Final Wash Delivery',
//     ];

//     // Export ALL filtered data, not just paginated
//     const rows = filteredData.map(item => [
//       item.factory,
//       item.unit,
//       item.workOrderNo,
//       item.fastReactNo,
//       item.buyer,
//       item.styleName,
//       item.orderQuantity,
//       item.WashTargetDate,
//       item.marks,
//       item.TotalWashReceived,
//       item.TotalWashDelivery,
//       item.firstDryReceive,
//       item.firstDryDelivery,
//       item.unwashReceive,
//       item.unwashDelivery,
//       item.firstWashReceive,
//       item.firstWashDelivery,
//       item.secondDryReceive,
//       item.secondDryDelivery,
//       item.finalWashReceive,
//       item.finalWashDelivery,
//     ]);

//     const csvContent = [
//       headers.join(','),
//       ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
//     ].join('\n');

//     const element = document.createElement('a');
//     element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
//     element.setAttribute('download', `transaction-report-${new Date().toISOString().split('T')[0]}.csv`);
//     element.style.display = 'none';
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);

//     toast.success('Report exported successfully');
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   if (loading) {
//     return <LoadingSpinner size="lg" fullScreen />;
//   }

//   return (
//     <div className="fade-in">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold text-gray-800 mb-2">Transaction Reports</h1>
//         <p className="text-gray-600">
//           Comprehensive transaction summary across all stages
//         </p>
//       </div>

//       {/* Toolbar */}
//       <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
//         <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//           {/* Search */}
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by Work Order, FastReact No, Buyer, or Style..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
//             />
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-2 flex-wrap">
//             <button
//               onClick={loadData}
//               disabled={loading}
//               className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 font-medium disabled:opacity-50"
//             >
//               <Refresh fontSize="small" />
//               <span>Refresh</span>
//             </button>

//             <button
//               onClick={handleExportExcel}
//               disabled={filteredData.length === 0}
//               className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
//             >
//               <Download fontSize="small" />
//               <span>Export CSV</span>
//             </button>

//             <button
//               onClick={handlePrint}
//               disabled={filteredData.length === 0}
//               className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
//             >
//               <Print fontSize="small" />
//               <span>Print</span>
//             </button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
//           <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//             <p className="text-xs text-blue-600 font-semibold mb-1">Total Work Orders</p>
//             <p className="text-2xl font-bold text-blue-900">{workOrders.length}</p>
//           </div>
//           <div className="p-3 bg-green-50 rounded-lg border border-green-200">
//             <p className="text-xs text-green-600 font-semibold mb-1">Filtered Results</p>
//             <p className="text-2xl font-bold text-green-900">{filteredData.length}</p>
//           </div>
//           <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
//             <p className="text-xs text-purple-600 font-semibold mb-1">Total Transactions</p>
//             <p className="text-2xl font-bold text-purple-900">{transactions.length}</p>
//           </div>
//           <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
//             <p className="text-xs text-orange-600 font-semibold mb-1">Total Quantity</p>
//             <p className="text-2xl font-bold text-orange-900">
//               {filteredData.reduce((sum, item) => sum + item.orderQuantity, 0).toLocaleString()}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       {filteredData.length === 0 ? (
//         <EmptyState
//           title="No Data"
//           description="No transactions found matching your search"
//           variant="search"
//         />
//       ) : (
//         <>
//           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm print:text-xs">
//                 {/* Table Header - Same as before */}
//                 <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
//                   {/* Main Header Row - Level 1 */}
//                   <tr>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
//                       Factory
//                     </th>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
//                       Unit
//                     </th>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
//                       Work Order No
//                     </th>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
//                       FastReact No
//                                         </th>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
//                       Buyer
//                     </th>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
//                       Style Name
//                     </th>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
//                       Order Qty
//                     </th>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
//                       Wash Target Date
//                     </th>
//                     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r-2 border-gray-300">
//                       Marks
//                     </th>
//                     <th colSpan="2" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-100 border-r-2 border-gray-300">
//                       Total Wash
//                     </th>
//                     <th colSpan="10" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-50">
//                       Process Stages
//                     </th>
//                   </tr>

//                   {/* Secondary Header Row - Level 2 */}
//                   <tr>
//                     <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-r">
//                       Rcv
//                     </th>
//                     <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-r-2 border-gray-300">
//                       Del
//                     </th>
//                     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-yellow-50 border-l border-yellow-200">
//                       1st Dry
//                     </th>
//                     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-blue-50 border-l border-blue-200">
//                       Unwash
//                     </th>
//                     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-green-50 border-l border-green-200">
//                       1st Wash
//                     </th>
//                     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-orange-50 border-l border-orange-200">
//                       2nd Dry
//                     </th>
//                     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-purple-50 border-l border-purple-200">
//                       Final Wash
//                     </th>
//                   </tr>

//                   {/* Sub-headers Row - Level 3 */}
//                   <tr>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-yellow-50 text-xs border-l border-yellow-200">Rcv</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-yellow-50 text-xs">Del</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-blue-50 text-xs border-l border-blue-200">Rcv</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-blue-50 text-xs">Del</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-green-50 text-xs border-l border-green-200">Rcv</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-green-50 text-xs">Del</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-orange-50 text-xs border-l border-orange-200">Rcv</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-orange-50 text-xs">Del</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-purple-50 text-xs border-l border-purple-200">Rcv</th>
//                     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-purple-50 text-xs">Del</th>
//                   </tr>
//                 </thead>

//                 {/* TABLE BODY - Using paginated data */}
//                 <tbody className="divide-y divide-gray-200">
//                   {paginatedData.map((item, index) => (
//                     <tr key={item.id} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
//                       <td className="px-4 py-3 font-bold text-primary-600">{item.factory}</td>
//                       <td className="px-4 py-3 font-bold text-primary-600">{item.unit}</td>
//                       <td className="px-4 py-3 font-bold text-primary-600">{item.workOrderNo}</td>
//                       <td className="px-4 py-3 text-gray-700 text-sm">{item.fastReactNo}</td>
//                       <td className="px-4 py-3 text-gray-700 font-medium">{item.buyer}</td>
//                       <td className="px-4 py-3 text-gray-700">{item.styleName}</td>
//                       <td className="px-4 py-3 font-semibold text-gray-800">
//                         {item.orderQuantity.toLocaleString()}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600 text-xs" title={item.WashTargetDate}>
//                         {item.WashTargetDate}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[120px]" title={item.marks}>
//                         {item.marks}
//                       </td>
                      
//                       {/* Total Wash */}
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-gray-100 border-l-2 border-gray-300">
//                         {item.TotalWashReceived.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-gray-100">
//                         {item.TotalWashDelivery.toLocaleString()}
//                       </td>

//                       {/* Process Stages */}
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-yellow-50 border-l-2 border-yellow-200">
//                         {item.firstDryReceive.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-yellow-50">
//                         {item.firstDryDelivery.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-blue-50 border-l-2 border-blue-200">
//                         {item.unwashReceive.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-blue-50">
//                         {item.unwashDelivery.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-green-50 border-l-2 border-green-200">
//                         {item.firstWashReceive.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-green-50">
//                         {item.firstWashDelivery.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-orange-50 border-l-2 border-orange-200">
//                         {item.secondDryReceive.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-orange-50">
//                         {item.secondDryDelivery.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-purple-50 border-l-2 border-purple-200">
//                         {item.finalWashReceive.toLocaleString()}
//                       </td>
//                       <td className="px-3 py-3 text-center font-bold text-gray-800 bg-purple-50">
//                         {item.finalWashDelivery.toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>

//                 {/* TOTALS FOOTER - Shows totals for current page */}
//                 <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold">
//                   <tr>
//                     <td colSpan="9" className="px-4 py-3 text-right">
//                       Page Total:
//                     </td>
//                     <td className="px-3 py-3 text-center bg-gray-200 border-l-2 border-gray-300">
//                       {paginatedData.reduce((sum, item) => sum + item.TotalWashReceived, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-gray-200">
//                       {paginatedData.reduce((sum, item) => sum + item.TotalWashDelivery, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-yellow-100 border-l-2 border-yellow-200">
//                       {paginatedData.reduce((sum, item) => sum + item.firstDryReceive, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-yellow-100">
//                       {paginatedData.reduce((sum, item) => sum + item.firstDryDelivery, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-blue-100 border-l-2 border-blue-200">
//                       {paginatedData.reduce((sum, item) => sum + item.unwashReceive, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-blue-100">
//                       {paginatedData.reduce((sum, item) => sum + item.unwashDelivery, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-green-100 border-l-2 border-green-200">
//                       {paginatedData.reduce((sum, item) => sum + item.firstWashReceive, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-green-100">
//                       {paginatedData.reduce((sum, item) => sum + item.firstWashDelivery, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-orange-100 border-l-2 border-orange-200">
//                       {paginatedData.reduce((sum, item) => sum + item.secondDryReceive, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-orange-100">
//                       {paginatedData.reduce((sum, item) => sum + item.secondDryDelivery, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-purple-100 border-l-2 border-purple-200">
//                       {paginatedData.reduce((sum, item) => sum + item.finalWashReceive, 0).toLocaleString()}
//                     </td>
//                     <td className="px-3 py-3 text-center bg-purple-100">
//                       {paginatedData.reduce((sum, item) => sum + item.finalWashDelivery, 0).toLocaleString()}
//                     </td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//           </div>

//           {/* Pagination Controls */}
//           <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 px-6 py-4">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               {/* Rows per page selector */}
//               <div className="flex items-center gap-2">
//                 <label htmlFor="rowsPerPage" className="text-sm text-gray-600">
//                   Rows per page:
//                 </label>
//                 <select
//                   id="rowsPerPage"
//                   value={rowsPerPage}
//                   onChange={handleRowsPerPageChange}
//                   className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={25}>25</option>
//                   <option value={50}>50</option>
//                   <option value={100}>100</option>
//                 </select>
//               </div>

//               {/* Page info */}
//               <div className="text-sm text-gray-600">
//                 Showing {startRecord} to {endRecord} of {filteredData.length} entries
//               </div>

//               {/* Pagination buttons */}
//               <div className="flex items-center gap-1">
//                 {/* First page */}
//                 <button
//                   onClick={handleFirstPage}
//                   disabled={currentPage === 1}
//                   className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//                   title="First page"
//                 >
//                   <FirstPage className="text-gray-600" />
//                 </button>

//                 {/* Previous page */}
//                 <button
//                   onClick={handlePreviousPage}
//                   disabled={currentPage === 1}
//                   className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//                   title="Previous page"
//                 >
//                   <ChevronLeft className="text-gray-600" />
//                 </button>

//                 {/* Page numbers */}
//                 <div className="flex items-center gap-1 px-2">
//                   {getPageNumbers().map((number, index) => (
//                     <button
//                       key={index}
//                       onClick={() => typeof number === 'number' && setCurrentPage(number)}
//                       disabled={number === '...'}
//                       className={`
//                         min-w-[40px] h-10 rounded-lg font-medium text-sm transition duration-200
//                         ${number === currentPage 
//                           ? 'bg-primary-600 text-white shadow-md' 
//                           : number === '...'
//                           ? 'cursor-default text-gray-400'
//                           : 'hover:bg-gray-100 text-gray-700'
//                         }
//                       `}
//                     >
//                       {number}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Next page */}
//                 <button
//                   onClick={handleNextPage}
//                   disabled={currentPage === totalPages}
//                   className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//                                     title="Next page"
//                 >
//                   <ChevronRight className="text-gray-600" />
//                 </button>

//                 {/* Last page */}
//                 <button
//                   onClick={handleLastPage}
//                   disabled={currentPage === totalPages}
//                   className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//                   title="Last page"
//                 >
//                   <LastPage className="text-gray-600" />
//                 </button>
//               </div>
//             </div>

//             {/* Grand Total Summary - Always shows total of ALL filtered data */}
//             {filteredData.length > rowsPerPage && (
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                   <div className="p-3 bg-gray-50 rounded-lg">
//                     <p className="text-xs text-gray-600 font-semibold mb-1">Grand Total Received</p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {filteredData.reduce((sum, item) => sum + item.TotalWashReceived, 0).toLocaleString()}
//                     </p>
//                   </div>
//                   <div className="p-3 bg-gray-50 rounded-lg">
//                     <p className="text-xs text-gray-600 font-semibold mb-1">Grand Total Delivery</p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {filteredData.reduce((sum, item) => sum + item.TotalWashDelivery, 0).toLocaleString()}
//                     </p>
//                   </div>
//                   <div className="p-3 bg-gray-50 rounded-lg">
//                     <p className="text-xs text-gray-600 font-semibold mb-1">Total Order Quantity</p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {filteredData.reduce((sum, item) => sum + item.orderQuantity, 0).toLocaleString()}
//                     </p>
//                   </div>
//                   <div className="p-3 bg-gray-50 rounded-lg">
//                     <p className="text-xs text-gray-600 font-semibold mb-1">Balance</p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {(
//                         filteredData.reduce((sum, item) => sum + item.TotalWashReceived, 0) -
//                         filteredData.reduce((sum, item) => sum + item.TotalWashDelivery, 0)
//                       ).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* Print Styles */}
//       <style>{`
//         @media print {
//           body * {
//             visibility: hidden;
//           }
//           .fade-in, .fade-in * {
//             visibility: visible;
//           }
//           .fade-in {
//             position: absolute;
//             left: 0;
//             top: 0;
//             width: 100%;
//             background: white;
//             padding: 20px;
//           }
//           table {
//             font-size: 10px !important;
//           }
//           th, td {
//             padding: 8px !important;
//           }
//           /* Hide pagination controls when printing */
//           .mt-6.bg-white {
//             display: none;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Reports;



// // import { useState, useEffect, useMemo } from 'react';
// // import { Download, Search, Refresh, Print } from '@mui/icons-material';
// // import { workOrderApi } from '../../api/workOrderApi';
// // import { washTransactionApi } from '../../api/washTransactionApi';
// // import LoadingSpinner from '../common/LoadingSpinner';
// // import EmptyState from '../common/EmptyState';
// // import toast from 'react-hot-toast';

// // const Reports = () => {
// //   const [workOrders, setWorkOrders] = useState([]);
// //   const [transactions, setTransactions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [filteredData, setFilteredData] = useState([]);
// // // console.log('Render Reports Component',workOrders);
// //   useEffect(() => {
// //     loadData();
// //   }, []);

// //   const loadData = async () => {
// //     try {
// //       setLoading(true);

// //       // Fetch work orders
// //       const woResponse = await workOrderApi.getAll();
// //       if (woResponse.data.success) {
// //         setWorkOrders(woResponse.data.data || []);
// //       }

// //       // Fetch all transactions
// //       const transResponse = await washTransactionApi.getAll();
// //       if (transResponse.data.success) {
// //         setTransactions(transResponse.data.data || []);
// //       }
// //     } catch (error) {
// //       toast.error('Failed to load report data');
// //       console.error('Error:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// // // console.log('Render Reports Component',workOrders);
// // const reportData = useMemo(() => {
// //   return workOrders.map(wo => {
// //     const woTransactions = transactions.filter(t => t.workOrderId === wo.id);

// //     const getStageQuantity = (stageName, type) => {
// //       const stageTransactions = woTransactions.filter(
// //         t => t.processStageName === stageName && t.transactionType === type
// //       );
// //       return stageTransactions.reduce((sum, t) => sum + t.quantity, 0);
// //     };

// //     return {
// //       id: wo.id,
// //       factory: wo.factory,
// //       unit: wo.unit,
// //       workOrderNo: wo.workOrderNo,
// //       fastReactNo: wo.fastReactNo || '-',
// //       buyer: wo.buyer,
// //       styleName: wo.styleName,
// //       marks: wo.marks || '-',
// //       orderQuantity: wo.orderQuantity,
// //       WashTargetDate: wo.washTargetDate ? new Date(wo.washTargetDate).toLocaleDateString('en-GB') : '-', 
// //       TotalWashReceived: wo.totalWashReceived || 0,
// //       TotalWashDelivery: wo.totalWashDelivery || 0,
// //       firstDryReceive: getStageQuantity('1st Dry', 1),
// //       firstDryDelivery: getStageQuantity('1st Dry', 2),
// //       unwashReceive: getStageQuantity('Unwash', 1),
// //       unwashDelivery: getStageQuantity('Unwash', 2),
// //       firstWashReceive: getStageQuantity('1st Wash', 1),
// //       firstWashDelivery: getStageQuantity('1st Wash', 2),
// //       secondDryReceive: getStageQuantity('2nd Dry', 1),
// //       secondDryDelivery: getStageQuantity('2nd Dry', 2),
// //       // secondWashReceive: getStageQuantity('2nd Wash', 1),
// //       // secondWashDelivery: getStageQuantity('2nd Wash', 2),
// //       finalWashReceive: getStageQuantity('Final Wash', 1),
// //       finalWashDelivery: getStageQuantity('Final Wash', 2),
// //     };
// //   });
// // }, [workOrders, transactions]);

// //   useEffect(() => {
// //     if (searchQuery.trim() === '') {
// //       setFilteredData(reportData);
// //     } else {
// //       const query = searchQuery.toLowerCase();
// //       const filtered = reportData.filter(
// //         item =>
// //           item.workOrderNo.toLowerCase().includes(query) ||
// //           item.fastReactNo.toLowerCase().includes(query) ||
// //           item.buyer.toLowerCase().includes(query) ||
// //           item.styleName.toLowerCase().includes(query)
// //       );
// //       setFilteredData(filtered);
// //     }
// //   }, [searchQuery, reportData]);

// //   const handleExportExcel = () => {
// //     const headers = [
// //       'Factory',
// //       'Unit',
// //       'Work Order No',
// //       'FastReact No',
// //       'Buyer',
// //       'Style Name',
// //       'Order Qty',
// //       'Wash Target Date',
// //       'Marks',
// //       'Total Wash Received',
// //       'Total Wash Delivery',
// //       '1st Dry Receive',
// //       '1st Dry Delivery',
// //       'Unwash Receive',
// //       'Unwash Delivery',
// //       '1st Wash Receive',
// //       '1st Wash Delivery',
// //       '2nd Dry Receive',
// //       '2nd Dry Delivery',
// //       // '2nd Wash Receive',
// //       // '2nd Wash Delivery',
// //       'Final Wash Receive',
// //       'Final Wash Delivery',
// //     ];

// //     const rows = filteredData.map(item => [
// //       item.factory,
// //       item.unit,
// //       item.workOrderNo,
// //       item.fastReactNo,
// //       item.buyer,
// //       item.styleName,
// //       item.orderQuantity,
// //       item.WashTargetDate,
// //       item.marks,
// //       item.TotalWashReceived,
// //       item.TotalWashDelivery,
// //       item.firstDryReceive,
// //       item.firstDryDelivery,
// //       item.unwashReceive,
// //       item.unwashDelivery,
// //       item.firstWashReceive,
// //       item.firstWashDelivery,
// //       item.secondDryReceive,
// //       item.secondDryDelivery,
// //       // item.secondWashReceive,
// //       // item.secondWashDelivery,
// //       item.finalWashReceive,
// //       item.finalWashDelivery,
// //     ]);

// //     const csvContent = [
// //       headers.join(','),
// //       ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
// //     ].join('\n');

// //     const element = document.createElement('a');
// //     element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
// //     element.setAttribute('download', `transaction-report-${new Date().toISOString().split('T')[0]}.csv`);
// //     element.style.display = 'none';
// //     document.body.appendChild(element);
// //     element.click();
// //     document.body.removeChild(element);

// //     toast.success('Report exported successfully');
// //   };

// //   const handlePrint = () => {
// //     window.print();
// //   };

// //   if (loading) {
// //     return <LoadingSpinner size="lg" fullScreen />;
// //   }

// //   return (
// //     <div className="fade-in">
// //       {/* Header */}
// //       <div className="mb-8">
// //         <h1 className="text-4xl font-bold text-gray-800 mb-2">Transaction Reports</h1>
// //         <p className="text-gray-600">
// //           Comprehensive transaction summary across all stages
// //         </p>
// //       </div>

// //       {/* Toolbar */}
// //       <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
// //         <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
// //           {/* Search */}
// //           <div className="flex-1 relative">
// //             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
// //             <input
// //               type="text"
// //               placeholder="Search by Work Order, FastReact No, Buyer, or Style..."
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
// //             />
// //           </div>

// //           {/* Action Buttons */}
// //           <div className="flex gap-2 flex-wrap">
// //             <button
// //               onClick={loadData}
// //               disabled={loading}
// //               className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 font-medium disabled:opacity-50"
// //             >
// //               <Refresh fontSize="small" />
// //               <span>Refresh</span>
// //             </button>

// //             <button
// //               onClick={handleExportExcel}
// //               disabled={filteredData.length === 0}
// //               className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
// //             >
// //               <Download fontSize="small" />
// //               <span>Export CSV</span>
// //             </button>

// //             <button
// //               onClick={handlePrint}
// //               disabled={filteredData.length === 0}
// //               className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
// //             >
// //               <Print fontSize="small" />
// //               <span>Print</span>
// //             </button>
// //           </div>
// //         </div>

// //         {/* Stats */}
// //         <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
// //           <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
// //             <p className="text-xs text-blue-600 font-semibold mb-1">Total Work Orders</p>
// //             <p className="text-2xl font-bold text-blue-900">{workOrders.length}</p>
// //           </div>
// //           <div className="p-3 bg-green-50 rounded-lg border border-green-200">
// //             <p className="text-xs text-green-600 font-semibold mb-1">Filtered Results</p>
// //             <p className="text-2xl font-bold text-green-900">{filteredData.length}</p>
// //           </div>
// //           <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
// //             <p className="text-xs text-purple-600 font-semibold mb-1">Total Transactions</p>
// //             <p className="text-2xl font-bold text-purple-900">{transactions.length}</p>
// //           </div>
// //           <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
// //             <p className="text-xs text-orange-600 font-semibold mb-1">Total Quantity</p>
// //             <p className="text-2xl font-bold text-orange-900">
// //               {filteredData.reduce((sum, item) => sum + item.orderQuantity, 0).toLocaleString()}
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Table */}
// //       {filteredData.length === 0 ? (
// //         <EmptyState
// //           title="No Data"
// //           description="No transactions found matching your search"
// //           variant="search"
// //         />
// //       ) : (
// //         <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
// //           <div className="overflow-x-auto">
// //             <table className="w-full text-sm print:text-xs">
// //               {/* FIXED HEADER STRUCTURE */}
// // {/* FIXED HEADER STRUCTURE */}
// // {/* FIXED HEADER STRUCTURE */}
// // <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
// //   {/* Main Header Row - Level 1 */}
// //   <tr>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
// //       Factory
// //     </th>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
// //       Unit
// //     </th>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
// //       Work Order No
// //     </th>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
// //       FastReact No
// //     </th>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
// //       Buyer
// //     </th>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
// //       Style Name
// //     </th>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
// //       Order Qty
// //     </th>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
// //       Wash Target Date
// //     </th>
// //     <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r-2 border-gray-300">
// //       Marks
// //     </th>
// //     <th colSpan="2" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-100 border-r-2 border-gray-300">
// //       Total Wash
// //     </th>
// //     <th colSpan="10" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-50">
// //       Process Stages
// //     </th>
// //   </tr>

// //   {/* Secondary Header Row - Level 2 */}
// //   <tr>
// //     {/* Total Wash - spans to next row */}
// //     <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-r">
// //       Rcv
// //     </th>
// //     <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-r-2 border-gray-300">
// //       Del
// //     </th>

// //     {/* Process Stage Headers */}
// //     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-yellow-50 border-l border-yellow-200">
// //       1st Dry
// //     </th>
// //     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-blue-50 border-l border-blue-200">
// //       Unwash
// //     </th>
// //     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-green-50 border-l border-green-200">
// //       1st Wash
// //     </th>
// //     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-orange-50 border-l border-orange-200">
// //       2nd Dry
// //     </th>
// //     <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-purple-50 border-l border-purple-200">
// //       Final Wash
// //     </th>
// //   </tr>

// //   {/* Sub-headers Row - Level 3 */}
// //   <tr>
// //     {/* Process Stage Sub-headers */}
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-yellow-50 text-xs border-l border-yellow-200">Rcv</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-yellow-50 text-xs">Del</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-blue-50 text-xs border-l border-blue-200">Rcv</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-blue-50 text-xs">Del</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-green-50 text-xs border-l border-green-200">Rcv</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-green-50 text-xs">Del</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-orange-50 text-xs border-l border-orange-200">Rcv</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-orange-50 text-xs">Del</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-purple-50 text-xs border-l border-purple-200">Rcv</th>
// //     <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-purple-50 text-xs">Del</th>
// //   </tr>
// // </thead>

// //               {/* TABLE BODY */}
// //               <tbody className="divide-y divide-gray-200">
// //                 {filteredData.map((item, index) => (
// //                   <tr key={item.id} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
// //                     {/* Basic Information */}
                    
// //                     <td className="px-4 py-3 font-bold text-primary-600">{item.factory}</td>
// //                     <td className="px-4 py-3 font-bold text-primary-600">{item.unit}</td>
// //                     <td className="px-4 py-3 font-bold text-primary-600">{item.workOrderNo}</td>
// //                     <td className="px-4 py-3 text-gray-700 text-sm">{item.fastReactNo}</td>
// //                     <td className="px-4 py-3 text-gray-700 font-medium">{item.buyer}</td>
// //                     <td className="px-4 py-3 text-gray-700">{item.styleName}</td>
// //                     <td className="px-4 py-3 font-semibold text-gray-800">
// //                       {item.orderQuantity.toLocaleString()}
// //                     </td>
// //                     <td className="px-4 py-3 text-gray-600 text-xs" title={item.WashTargetDate}>
// //                       {item.WashTargetDate}
// //                     </td>
// //                     <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[120px]" title={item.marks}>
// //                       {item.marks}
// //                     </td>
                    
// //                     {/* Total Wash */}
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-gray-100 border-l-2 border-gray-300">
// //                       {item.TotalWashReceived.toLocaleString()}
// //                     </td>
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-gray-100">
// //                       {item.TotalWashDelivery.toLocaleString()}
// //                     </td>

// //                     {/* Process Stages */}
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-yellow-50 border-l-2 border-yellow-200">
// //                       {item.firstDryReceive.toLocaleString()}
// //                     </td>
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-yellow-50">
// //                       {item.firstDryDelivery.toLocaleString()}
// //                     </td>

// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-blue-50 border-l-2 border-blue-200">
// //                       {item.unwashReceive.toLocaleString()}
// //                     </td>
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-blue-50">
// //                       {item.unwashDelivery.toLocaleString()}
// //                     </td>

// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-green-50 border-l-2 border-green-200">
// //                       {item.firstWashReceive.toLocaleString()}
// //                     </td>
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-green-50">
// //                       {item.firstWashDelivery.toLocaleString()}
// //                     </td>

// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-orange-50 border-l-2 border-orange-200">
// //                       {item.secondDryReceive.toLocaleString()}
// //                     </td>
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-orange-50">
// //                       {item.secondDryDelivery.toLocaleString()}
// //                     </td>

// //                     {/* <td className="px-3 py-3 text-center font-bold text-gray-800 bg-pink-50 border-l-2 border-pink-200">
// //                       {item.secondWashReceive.toLocaleString()}
// //                     </td>
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-pink-50">
// //                       {item.secondWashDelivery.toLocaleString()}
// //                     </td> */}

// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-purple-50 border-l-2 border-purple-200">
// //                       {item.finalWashReceive.toLocaleString()}
// //                     </td>
// //                     <td className="px-3 py-3 text-center font-bold text-gray-800 bg-purple-50">
// //                       {item.finalWashDelivery.toLocaleString()}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>

// //               {/* TOTALS FOOTER */}
// //               <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold">
// //                 <tr>
// //                   <td colSpan="7" className="px-4 py-3 text-right">
// //                     TOTAL:
// //                   </td>
                  
// //                   {/* Total Wash Totals */}
// //                   <td className="px-3 py-3 text-center bg-gray-200 border-l-2 border-gray-300">
// //                     {filteredData.reduce((sum, item) => sum + item.TotalWashReceived, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-gray-200">
// //                     {filteredData.reduce((sum, item) => sum + item.TotalWashDelivery, 0).toLocaleString()}
// //                   </td>

// //                   {/* Process Stage Totals */}
// //                   <td className="px-3 py-3 text-center bg-yellow-100 border-l-2 border-yellow-200">
// //                     {filteredData.reduce((sum, item) => sum + item.firstDryReceive, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-yellow-100">
// //                     {filteredData.reduce((sum, item) => sum + item.firstDryDelivery, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-blue-100 border-l-2 border-blue-200">
// //                     {filteredData.reduce((sum, item) => sum + item.unwashReceive, 0).toLocaleString()}
// //                   </td>
// //                                   <td className="px-3 py-3 text-center bg-blue-100">
// //                     {filteredData.reduce((sum, item) => sum + item.unwashDelivery, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-green-100 border-l-2 border-green-200">
// //                     {filteredData.reduce((sum, item) => sum + item.firstWashReceive, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-green-100">
// //                     {filteredData.reduce((sum, item) => sum + item.firstWashDelivery, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-orange-100 border-l-2 border-orange-200">
// //                     {filteredData.reduce((sum, item) => sum + item.secondDryReceive, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-orange-100">
// //                     {filteredData.reduce((sum, item) => sum + item.secondDryDelivery, 0).toLocaleString()}
// //                   </td>
// //                   {/* <td className="px-3 py-3 text-center bg-pink-100 border-l-2 border-pink-200">
// //                     {filteredData.reduce((sum, item) => sum + item.secondWashReceive, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-pink-100">
// //                     {filteredData.reduce((sum, item) => sum + item.secondWashDelivery, 0).toLocaleString()}
// //                   </td> */}
// //                   <td className="px-3 py-3 text-center bg-purple-100 border-l-2 border-purple-200">
// //                     {filteredData.reduce((sum, item) => sum + item.finalWashReceive, 0).toLocaleString()}
// //                   </td>
// //                   <td className="px-3 py-3 text-center bg-purple-100">
// //                     {filteredData.reduce((sum, item) => sum + item.finalWashDelivery, 0).toLocaleString()}
// //                   </td>
// //                 </tr>
// //               </tfoot>
// //             </table>
// //           </div>
// //         </div>
// //       )}

// //       {/* Print Styles */}
// //       <style>{`
// //         @media print {
// //           body * {
// //             visibility: hidden;
// //           }
// //           .fade-in, .fade-in * {
// //             visibility: visible;
// //           }
// //           .fade-in {
// //             position: absolute;
// //             left: 0;
// //             top: 0;
// //             width: 100%;
// //             background: white;
// //             padding: 20px;
// //           }
// //           table {
// //             font-size: 10px !important;
// //           }
// //           th, td {
// //             padding: 8px !important;
// //           }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default Reports;


// // import { useState, useEffect, useMemo } from 'react';
// // import { Download, Search, Refresh, Print, ChevronLeft, ChevronRight } from '@mui/icons-material';
// // import { workOrderApi } from '../../api/workOrderApi';
// // import { useWashTransaction } from '../../hooks/useWashTransaction';
// // import LoadingSpinner from '../common/LoadingSpinner';
// // import EmptyState from '../common/EmptyState';
// // import toast from 'react-hot-toast';

// // const Reports = () => {
// //   const [workOrders, setWorkOrders] = useState([]);
// //   const { getPaginated, loading, data: transactions = [], pagination } = useWashTransaction();
  
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [pageSize, setPageSize] = useState(10);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [filteredData, setFilteredData] = useState([]);
// //   const [loadingWO, setLoadingWO] = useState(true);

// //   // Load work orders
// //   useEffect(() => {
// //     loadWorkOrders();
// //   }, []);

// //   // Load transactions with pagination
// //   useEffect(() => {
// //     loadTransactions(1);
// //   }, []);

// //   // Load work orders
// //   const loadWorkOrders = async () => {
// //     try {
// //       const woResponse = await workOrderApi.getAll();
// //       if (woResponse.data.success) {
// //         setWorkOrders(woResponse.data.data || []);
// //       }
// //     } catch (error) {
// //       toast.error('Failed to load work orders');
// //       console.error('Error:', error);
// //     } finally {
// //       setLoadingWO(false);
// //     }
// //   };

// //   // Load transactions with pagination
// //   const loadTransactions = async (page = 1) => {
// //     try {
// //       const params = {
// //         page,
// //         pageSize,
// //         searchTerm: searchQuery,
// //         sortBy: 'transactionDate',
// //         sortOrder: 'desc',
// //       };

// //       await getPaginated(params);
// //       setCurrentPage(page);
// //     } catch (error) {
// //       toast.error('Failed to load transactions');
// //       console.error('Error:', error);
// //     }
// //   };

// //   // Handle search with debounce
// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       loadTransactions(1);
// //     }, 500);

// //     return () => clearTimeout(timer);
// //   }, [searchQuery]);

// //   // Generate report data
// //   const reportData = useMemo(() => {
// //     return transactions.map(t => {
// //       const wo = workOrders.find(w => w.id === t.workOrderId);
      
// //       if (!wo) return null;

// //       const woTransactions = transactions.filter(tx => tx.workOrderId === wo.id);

// //       const getStageQuantity = (stageName, type) => {
// //         const stageTransactions = woTransactions.filter(
// //           tx => tx.processStageName === stageName && tx.transactionType === type
// //         );
// //         return stageTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
// //       };

// //       return {
// //         id: wo.id,
// //         factory: wo.factory,
// //         unit: wo.unit,
// //         workOrderNo: wo.workOrderNo,
// //         fastReactNo: wo.fastReactNo || '-',
// //         buyer: wo.buyer,
// //         styleName: wo.styleName,
// //         marks: wo.marks || '-',
// //         orderQuantity: wo.orderQuantity,
// //         WashTargetDate: wo.washTargetDate ? new Date(wo.washTargetDate).toLocaleDateString('en-GB') : '-',
// //         TotalWashReceived: wo.totalWashReceived || 0,
// //         TotalWashDelivery: wo.totalWashDelivery || 0,
// //         firstDryReceive: getStageQuantity('1st Dry', 1),
// //         firstDryDelivery: getStageQuantity('1st Dry', 2),
// //         unwashReceive: getStageQuantity('Unwash', 1),
// //         unwashDelivery: getStageQuantity('Unwash', 2),
// //         firstWashReceive: getStageQuantity('1st Wash', 1),
// //         firstWashDelivery: getStageQuantity('1st Wash', 2),
// //         secondDryReceive: getStageQuantity('2nd Dry', 1),
// //         secondDryDelivery: getStageQuantity('2nd Dry', 2),
// //         finalWashReceive: getStageQuantity('Final Wash', 1),
// //         finalWashDelivery: getStageQuantity('Final Wash', 2),
// //       };
// //     }).filter(Boolean); // Remove null entries
// //   }, [transactions, workOrders]);

// //   // Filter by search
// //   useEffect(() => {
// //     if (searchQuery.trim() === '') {
// //       setFilteredData(reportData);
// //     } else {
// //       const query = searchQuery.toLowerCase();
// //       const filtered = reportData.filter(
// //         item =>
// //           item.workOrderNo?.toLowerCase().includes(query) ||
// //           item.fastReactNo?.toLowerCase().includes(query) ||
// //           item.buyer?.toLowerCase().includes(query) ||
// //           item.styleName?.toLowerCase().includes(query)
// //       );
// //       setFilteredData(filtered);
// //     }
// //   }, [searchQuery, reportData]);

// //   // Handle pagination
// //   const handlePageChange = (newPage) => {
// //     if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
// //       loadTransactions(newPage);
// //       window.scrollTo({ top: 0, behavior: 'smooth' });
// //     }
// //   };

// //   const handlePageSizeChange = (newSize) => {
// //     setPageSize(newSize);
// //     loadTransactions(1);
// //   };

// //   const handleExportExcel = () => {
// //     const headers = [
// //       'Factory', 'Unit', 'Work Order No', 'FastReact No', 'Buyer', 'Style Name',
// //       'Order Qty', 'Wash Target Date', 'Marks', 'Total Wash Received', 'Total Wash Delivery',
// //       '1st Dry Receive', '1st Dry Delivery', 'Unwash Receive', 'Unwash Delivery',
// //       '1st Wash Receive', '1st Wash Delivery', '2nd Dry Receive', '2nd Dry Delivery',
// //       'Final Wash Receive', 'Final Wash Delivery',
// //     ];

// //     const rows = filteredData.map(item => [
// //       item.factory, item.unit, item.workOrderNo, item.fastReactNo, item.buyer, item.styleName,
// //       item.orderQuantity, item.WashTargetDate, item.marks, item.TotalWashReceived, item.TotalWashDelivery,
// //       item.firstDryReceive, item.firstDryDelivery, item.unwashReceive, item.unwashDelivery,
// //       item.firstWashReceive, item.firstWashDelivery, item.secondDryReceive, item.secondDryDelivery,
// //       item.finalWashReceive, item.finalWashDelivery,
// //     ]);

// //     const csvContent = [
// //       headers.join(','),
// //       ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
// //     ].join('\n');

// //     const element = document.createElement('a');
// //     element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
// //     element.setAttribute('download', `transaction-report-${new Date().toISOString().split('T')[0]}.csv`);
// //     element.style.display = 'none';
// //     document.body.appendChild(element);
// //     element.click();
// //     document.body.removeChild(element);

// //     toast.success('Report exported successfully');
// //   };

// //   const handlePrint = () => {
// //     window.print();
// //   };

// //   if (loadingWO || (loading && transactions.length === 0)) {
// //     return <LoadingSpinner size="lg" fullScreen />;
// //   }

// //   return (
// //     <div className="fade-in">
// //       {/* Header */}
// //       <div className="mb-8">
// //         <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Transaction Reports</h1>
// //         <p className="text-gray-600 text-sm sm:text-base">
// //           Comprehensive transaction summary across all stages
// //         </p>
// //       </div>

// //       {/* Toolbar */}
// //       <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 mb-6">
// //         <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
// //           {/* Search */}
// //           <div className="flex-1 relative w-full lg:w-auto">
// //             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
// //             <input
// //               type="text"
// //               placeholder="Search by Work Order, FastReact, Buyer, Style..."
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 text-sm"
// //             />
// //           </div>

// //           {/* Action Buttons */}
// //           <div className="flex gap-2 flex-wrap w-full lg:w-auto">
// //             <button
// //               onClick={() => loadWorkOrders()}
// //               disabled={loading || loadingWO}
// //               className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 font-medium text-sm disabled:opacity-50 whitespace-nowrap"
// //             >
// //               <Refresh fontSize="small" />
// //               <span className="hidden sm:inline">Refresh</span>
// //             </button>

// //             <button
// //               onClick={handleExportExcel}
// //               disabled={filteredData.length === 0 || loading}
// //               className="px-3 sm:px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50 whitespace-nowrap"
// //             >
// //               <Download fontSize="small" />
// //               <span className="hidden sm:inline">Export</span>
// //             </button>

// //             <button
// //               onClick={handlePrint}
// //               disabled={filteredData.length === 0}
// //               className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition duration-200 font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50 whitespace-nowrap"
// //             >
// //               <Print fontSize="small" />
// //               <span className="hidden sm:inline">Print</span>
// //             </button>
// //           </div>
// //         </div>

// //         {/* Stats */}
// //         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
// //           <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
// //             <p className="text-xs text-blue-600 font-semibold mb-1">Total Records</p>
// //             <p className="text-xl sm:text-2xl font-bold text-blue-900">{pagination?.totalRecords || 0}</p>
// //           </div>
// //           <div className="p-3 bg-green-50 rounded-lg border border-green-200">
// //             <p className="text-xs text-green-600 font-semibold mb-1">On Page</p>
// //             <p className="text-xl sm:text-2xl font-bold text-green-900">{filteredData.length}</p>
// //           </div>
// //           <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
// //             <p className="text-xs text-purple-600 font-semibold mb-1">Total Work Orders</p>
// //             <p className="text-xl sm:text-2xl font-bold text-purple-900">{workOrders.length}</p>
// //           </div>
// //           <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
// //             <p className="text-xs text-orange-600 font-semibold mb-1">Page Qty</p>
// //             <p className="text-xl sm:text-2xl font-bold text-orange-900">
// //               {filteredData.reduce((sum, item) => sum + item.orderQuantity, 0).toLocaleString()}
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Table */}
// //       {filteredData.length === 0 ? (
// //         <EmptyState
// //           title="No Data"
// //           description="No transactions found matching your search"
// //           variant="search"
// //         />
// //       ) : (
// //         <>
// //           <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
// //             <table className="w-full text-xs sm:text-sm print:text-xs">
// //               <thead className="bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-gray-300 sticky top-0 z-10">
// //                 {/* Row 1 - Main Headers */}
// //                 <tr>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap min-w-max">Factory</th>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap min-w-max">Unit</th>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap min-w-max">Work Order</th>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap min-w-max">FastReact</th>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap min-w-max">Buyer</th>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap min-w-max">Style</th>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-center font-bold text-gray-700 whitespace-nowrap">Order Qty</th>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-center font-bold text-gray-700 whitespace-nowrap">Target Date</th>
// //                   <th rowSpan="3" className="px-2 sm:px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap min-w-[100px]">Marks</th>
// //                   <th colSpan="2" className="px-2 sm:px-3 py-2 text-center font-bold text-gray-700 bg-gray-100 border-l border-gray-300">Total Wash</th>
// //                   <th colSpan="10" className="px-2 sm:px-3 py-2 text-center font-bold text-gray-700 bg-gray-50 border-l border-gray-300">Process Stages</th>
// //                 </tr>

// //                 {/* Row 2 - Stage Headers */}
// //                 <tr>
// //                   <th rowSpan="2" className="px-2 sm:px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs whitespace-nowrap">Rcv</th>
// //                   <th rowSpan="2" className="px-2 sm:px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs whitespace-nowrap border-r border-gray-300">Del</th>

// //                   <th colSpan="2" className="px-2 py-1 text-center font-bold text-gray-700 bg-yellow-50 text-xs border-l border-yellow-200">1st Dry</th>
// //                   <th colSpan="2" className="px-2 py-1 text-center font-bold text-gray-700 bg-blue-50 text-xs border-l border-blue-200">Unwash</th>
// //                   <th colSpan="2" className="px-2 py-1 text-center font-bold text-gray-700 bg-green-50 text-xs border-l border-green-200">1st Wash</th>
// //                   <th colSpan="2" className="px-2 py-1 text-center font-bold text-gray-700 bg-orange-50 text-xs border-l border-orange-200">2nd Dry</th>
// //                   <th colSpan="2" className="px-2 py-1 text-center font-bold text-gray-700 bg-purple-50 text-xs border-l border-purple-200">Final Wash</th>
// //                 </tr>

// //                 {/* Row 3 - Sub Headers */}
// //                 <tr>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-yellow-50 text-xs whitespace-nowrap border-l border-yellow-200">Rcv</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-yellow-50 text-xs whitespace-nowrap">Del</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-blue-50 text-xs whitespace-nowrap border-l border-blue-200">Rcv</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-blue-50 text-xs whitespace-nowrap">Del</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-green-50 text-xs whitespace-nowrap border-l border-green-200">Rcv</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-green-50 text-xs whitespace-nowrap">Del</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-orange-50 text-xs whitespace-nowrap border-l border-orange-200">Rcv</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-orange-50 text-xs whitespace-nowrap">Del</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-purple-50 text-xs whitespace-nowrap border-l border-purple-200">Rcv</th>
// //                   <th className="px-2 py-1 text-center font-semibold text-gray-600 bg-purple-50 text-xs whitespace-nowrap">Del</th>
// //                 </tr>
// //               </thead>

// //               {/* TABLE BODY */}
// //               <tbody className="divide-y divide-gray-200">
// //                 {filteredData.map((item, index) => (
// //                   <tr key={item.id} className={`hover:bg-blue-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
// //                     <td className="px-2 sm:px-3 py-2 font-semibold text-primary-600 whitespace-nowrap">{item.factory}</td>
// //                     <td className="px-2 sm:px-3 py-2 font-semibold text-primary-600 whitespace-nowrap">{item.unit}</td>
// //                     <td className="px-2 sm:px-3 py-2 font-semibold text-primary-600 whitespace-nowrap">{item.workOrderNo}</td>
// //                     <td className="px-2 sm:px-3 py-2 text-gray-700 text-xs whitespace-nowrap">{item.fastReactNo}</td>
// //                     <td className="px-2 sm:px-3 py-2 text-gray-700 font-medium whitespace-nowrap">{item.buyer}</td>
// //                     <td className="px-2 sm:px-3 py-2 text-gray-700 text-xs truncate max-w-[120px]" title={item.styleName}>{item.styleName}</td>
// //                     <td className="px-2 sm:px-3 py-2 font-semibold text-gray-800 text-center whitespace-nowrap">{item.orderQuantity.toLocaleString()}</td>
// //                     <td className="px-2 sm:px-3 py-2 text-gray-600 text-xs text-center whitespace-nowrap">{item.WashTargetDate}</td>
// //                     <td className="px-2 sm:px-3 py-2 text-gray-600 text-xs truncate max-w-[100px]" title={item.marks}>{item.marks}</td>

// //                     {/* Total Wash */}
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-gray-100 border-l border-gray-300 text-xs whitespace-nowrap">{item.TotalWashReceived.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-gray-100 text-xs whitespace-nowrap">{item.TotalWashDelivery.toLocaleString()}</td>

// //                     {/* Process Stages */}
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-yellow-50 border-l border-yellow-200 text-xs whitespace-nowrap">{item.firstDryReceive.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-yellow-50 text-xs whitespace-nowrap">{item.firstDryDelivery.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50 border-l border-blue-200 text-xs whitespace-nowrap">{item.unwashReceive.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-blue-50 text-xs whitespace-nowrap">{item.unwashDelivery.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-green-50 border-l border-green-200 text-xs whitespace-nowrap">{item.firstWashReceive.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-green-50 text-xs whitespace-nowrap">{item.firstWashDelivery.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-orange-50 border-l border-orange-200 text-xs whitespace-nowrap">{item.secondDryReceive.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-orange-50 text-xs whitespace-nowrap">{item.secondDryDelivery.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-purple-50 border-l border-purple-200 text-xs whitespace-nowrap">{item.finalWashReceive.toLocaleString()}</td>
// //                     <td className="px-2 py-2 text-center font-bold text-gray-800 bg-purple-50 text-xs whitespace-nowrap">{item.finalWashDelivery.toLocaleString()}</td>
// //                   </tr>
// //                 ))}
// //               </tbody>

// //               {/* TOTALS FOOTER */}
// //               <tfoot className="bg-gradient-to-b from-gray-100 to-gray-200 border-t-2 border-gray-300 font-bold">
// //                 <tr>
// //                   <td colSpan="9" className="px-2 sm:px-3 py-2 text-right text-sm">TOTAL:</td>

// //                   {/* Total Wash Totals */}
// //                   <td className="px-2 py-2 text-center bg-gray-300 border-l border-gray-400 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.TotalWashReceived, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-gray-300 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.TotalWashDelivery, 0).toLocaleString()}</td>

// //                   {/* Process Stage Totals */}
// //                   <td className="px-2 py-2 text-center bg-yellow-200 border-l border-yellow-300 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.firstDryReceive, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-yellow-200 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.firstDryDelivery, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-blue-200 border-l border-blue-300 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.unwashReceive, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-blue-200 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.unwashDelivery, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-green-200 border-l border-green-300 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.firstWashReceive, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-green-200 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.firstWashDelivery, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-orange-200 border-l border-orange-300 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.secondDryReceive, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-orange-200 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.secondDryDelivery, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-purple-200 border-l border-purple-300 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.finalWashReceive, 0).toLocaleString()}</td>
// //                   <td className="px-2 py-2 text-center bg-purple-200 text-xs whitespace-nowrap">{filteredData.reduce((sum, item) => sum + item.finalWashDelivery, 0).toLocaleString()}</td>
// //                 </tr>
// //               </tfoot>
// //             </table>
// //           </div>

// //           {/* Pagination Controls */}
// //           {pagination && pagination.totalPages > 1 && (
// //             <div className="mt-6 bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
// //               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
// //                 {/* Page Size Selector */}
// //                 <div className="flex items-center gap-3">
// //                   <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Per page:</span>
// //                   <select
// //                     value={pageSize}
// //                     onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
// //                     disabled={loading}
// //                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
// //                   >
// //                     <option value={5}>5</option>
// //                     <option value={10}>10</option>
// //                     <option value={25}>25</option>
// //                     <option value={50}>50</option>
// //                   </select>
// //                 </div>

// //                 {/* Page Info */}
// //                 <div className="text-sm text-gray-600 text-center">
// //                   <span>Page <strong>{currentPage}</strong> of <strong>{pagination.totalPages}</strong></span>
// //                   <span className="block text-xs text-gray-500 mt-1">({pagination.totalRecords} total records)</span>
// //                 </div>

// //                 {/* Pagination Buttons */}
// //                 <div className="flex items-center gap-2">
// //                   <button
// //                     onClick={() => handlePageChange(currentPage - 1)}
// //                     disabled={!pagination.hasPrevious || loading}
// //                     className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
// //                   >
// //                     <ChevronLeft fontSize="small" />
// //                   </button>

// //                   {/* Page Numbers */}
// //                   <div className="flex items-center gap-1">
// //                     {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
// //                       let pageNum;
// //                       if (pagination.totalPages <= 5) {
// //                         pageNum = i + 1;
// //                       } else if (currentPage <= 3) {
// //                         pageNum = i + 1;
// //                       } else if (currentPage >= pagination.totalPages - 2) {
// //                         pageNum = pagination.totalPages - 4 + i;
// //                       } else {
// //                         pageNum = currentPage - 2 + i;
// //                       }

// //                       return (
// //                         <button
// //                           key={pageNum}
// //                           onClick={() => handlePageChange(pageNum)}
// //                           disabled={loading}
// //                           className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
// //                             currentPage === pageNum
// //                               ? 'bg-primary-600 text-white'
// //                               : 'border border-gray-300 hover:bg-gray-50'
// //                           } disabled:opacity-50`}
// //                         >
// //                           {pageNum}
// //                         </button>
// //                       );
// //                     })}
// //                   </div>

// //                   <button
// //                     onClick={() => handlePageChange(currentPage + 1)}
// //                     disabled={!pagination.hasNext || loading}
// //                     className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
// //                   >
// //                     <ChevronRight fontSize="small" />
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           )}
// //         </>
// //       )}

// //       {/* Print Styles */}
// //       <style>{`
// //         @media print {
// //           body * {
// //             visibility: hidden;
// //           }
// //           .fade-in, .fade-in * {
// //             visibility: visible;
// //           }
// //           .fade-in {
// //             position: absolute;
// //             left: 0;
// //             top: 0;
// //             width: 100%;
// //             background: white;
// //             padding: 10px;
// //           }
// //           table {
// //             font-size: 9px !important;
// //             width: 100%;
// //           }
// //           th, td {
// //             padding: 4px !important;
// //           }
// //           .bg-white, .bg-gray-50 {
// //             background: white !important;
// //           }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default Reports;


// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\reports\Reports.jsx
// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\reports\Reports.jsx
import { useState, useEffect, useMemo } from 'react';
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

// Transaction type constants
const TRANSACTION_TYPES = {
  RECEIVE: 1,
  DELIVERY: 2,
};

const Reports = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState({
    buyer: '',
    factory: '',
    unit: '',
    transactionTypeId: '',
    processStageId: '',
    startDate: '',
    endDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  // Get process stages
  const { stages, loading: stagesLoading } = useProcessStage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch work orders
      const woResponse = await workOrderApi.getAll();
      if (woResponse.data.success) {
        setWorkOrders(woResponse.data.data || []);
      }

      // Fetch all transactions
      const transResponse = await washTransactionApi.getAll();
      if (transResponse.data.success) {
        setTransactions(transResponse.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load report data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique units from work orders
  const uniqueUnits = useMemo(() => {
    const units = [...new Set(workOrders.map(wo => wo.unit))].filter(Boolean);
    return units.sort();
  }, [workOrders]);

  // Get unique buyers
  const uniqueBuyers = useMemo(() => {
    const buyers = [...new Set(workOrders.map(wo => wo.buyer))].filter(Boolean);
    return buyers.sort();
  }, [workOrders]);

  // Get unique factories
  const uniqueFactories = useMemo(() => {
    const factories = [...new Set(workOrders.map(wo => wo.factory))].filter(Boolean);
    return factories.sort();
  }, [workOrders]);

  // Build report data with transactions
  const reportData = useMemo(() => {
    return workOrders.map(wo => {
      const woTransactions = transactions.filter(t => t.workOrderId === wo.id);

      const getStageQuantity = (stageName, type) => {
        const stageTransactions = woTransactions.filter(
          t => t.processStageName === stageName && t.transactionType === type
        );
        return stageTransactions.reduce((sum, t) => sum + t.quantity, 0);
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
        washTargetDate: wo.washTargetDate ? new Date(wo.washTargetDate).toLocaleDateString('en-GB') : '-',
        washTargetDateRaw: wo.washTargetDate ? new Date(wo.washTargetDate) : null,
        totalWashReceived: wo.totalWashReceived || 0,
        totalWashDelivery: wo.totalWashDelivery || 0,
        firstDryReceive: getStageQuantity('1st Dry', 1),
        firstDryDelivery: getStageQuantity('1st Dry', 2),
        unwashReceive: getStageQuantity('Unwash', 1),
        unwashDelivery: getStageQuantity('Unwash', 2),
        firstWashReceive: getStageQuantity('1st Wash', 1),
        firstWashDelivery: getStageQuantity('1st Wash', 2),
        secondDryReceive: getStageQuantity('2nd Dry', 1),
        secondDryDelivery: getStageQuantity('2nd Dry', 2),
        finalWashReceive: getStageQuantity('Final Wash', 1),
        finalWashDelivery: getStageQuantity('Final Wash', 2),
        transactions: woTransactions,
      };
    });
  }, [workOrders, transactions]);

  // ✅ FIXED: Apply filters to report data with correct date comparison
  const applyFilters = (data, filters) => {
    let filtered = [...data];

    // Buyer filter
    if (filters.buyer) {
      filtered = filtered.filter(item => 
        item.buyer.toLowerCase().includes(filters.buyer.toLowerCase())
      );
    }

    // Factory filter
    if (filters.factory) {
      filtered = filtered.filter(item => 
        item.factory.toLowerCase() === filters.factory.toLowerCase()
      );
    }

    // Unit filter
    if (filters.unit) {
      filtered = filtered.filter(item => item.unit === filters.unit);
    }

    // ✅ FIXED: Date range filter - Use timestamp comparison
    if (filters.startDate || filters.endDate) {
      const startTime = filters.startDate 
        ? new Date(filters.startDate + 'T00:00:00').getTime() 
        : null;
      const endTime = filters.endDate 
        ? new Date(filters.endDate + 'T23:59:59').getTime() 
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

    // Process Stage filter
    if (filters.processStageId) {
      const selectedStage = stages.find(s => s.id === parseInt(filters.processStageId));
      if (selectedStage) {
        filtered = filtered.filter(item => {
          const itemTransactions = item.transactions || [];
          return itemTransactions.some(t => t.processStageName === selectedStage.name);
        });
      }
    }

    // Transaction Type filter
    if (filters.transactionTypeId !== '') {
      filtered = filtered.filter(item => {
        const itemTransactions = item.transactions || [];
        return itemTransactions.some(t => t.transactionType === parseInt(filters.transactionTypeId));
      });
    }

    return filtered;
  };

  // ✅ FIXED: Calculate summary statistics for filtered data with correct date comparison
  const summaryStats = useMemo(() => {
    const filtered = applyFilters(reportData, appliedFilters);
    
    // Collect all transactions from filtered work orders
    const allTransactions = filtered.flatMap(item => item.transactions || []);
    
    // ✅ FIXED: Apply date filter to transactions - Use timestamp comparison
    let filteredTransactions = allTransactions;
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const startTime = appliedFilters.startDate 
        ? new Date(appliedFilters.startDate + 'T00:00:00').getTime() 
        : null;
      const endTime = appliedFilters.endDate 
        ? new Date(appliedFilters.endDate + 'T23:59:59').getTime() 
        : null;

      filteredTransactions = allTransactions.filter(transaction => {
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
        filteredTransactions = filteredTransactions.filter(t => t.processStageName === selectedStage.name);
      }
    }

    // Apply transaction type filter
    if (appliedFilters.transactionTypeId !== '') {
      filteredTransactions = filteredTransactions.filter(t => 
        t.transactionType === parseInt(appliedFilters.transactionTypeId)
      );
    }

    const totalReceive = filteredTransactions
      .filter(t => t.transactionType === TRANSACTION_TYPES.RECEIVE)
      .reduce((sum, t) => sum + t.quantity, 0);

    const totalDelivery = filteredTransactions
      .filter(t => t.transactionType === TRANSACTION_TYPES.DELIVERY)
      .reduce((sum, t) => sum + t.quantity, 0);

    // Count unique process stages in filtered transactions
    const uniqueStages = [...new Set(filteredTransactions.map(t => t.processStageName))];

    // Count transactions by stage
    const stageBreakdown = {};
    filteredTransactions.forEach(t => {
      if (!stageBreakdown[t.processStageName]) {
        stageBreakdown[t.processStageName] = { receive: 0, delivery: 0 };
      }
      if (t.transactionType === TRANSACTION_TYPES.RECEIVE) {
        stageBreakdown[t.processStageName].receive += t.quantity;
      } else {
        stageBreakdown[t.processStageName].delivery += t.quantity;
      }
    });

    return {
      totalWorkOrders: filtered.length,
      totalReceive,
      totalDelivery,
      balance: totalReceive - totalDelivery,
      totalOrderQuantity: filtered.reduce((sum, item) => sum + item.orderQuantity, 0),
      uniqueStagesCount: uniqueStages.length,
      stageBreakdown,
      transactionCount: filteredTransactions.length,
    };
  }, [reportData, appliedFilters, stages]);

  // Apply search query and filters
  useEffect(() => {
    let filtered = reportData;

    // Apply filters first
    if (Object.keys(appliedFilters).length > 0) {
      filtered = applyFilters(filtered, appliedFilters);
    }

    // Then apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.workOrderNo.toLowerCase().includes(query) ||
          item.fastReactNo.toLowerCase().includes(query) ||
          item.buyer.toLowerCase().includes(query) ||
          item.styleName.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters/search changes
  }, [searchQuery, reportData, appliedFilters]);

  // Calculate pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, rowsPerPage, filteredData]);

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterParams });
    toast.success('Filters applied successfully');
  };

  const handleResetFilters = () => {
    const resetFilters = {
      buyer: '',
      factory: '',
      unit: '',
      transactionTypeId: '',
      processStageId: '',
      startDate: '',
      endDate: '',
    };
    setFilterParams(resetFilters);
    setAppliedFilters({});
    toast.success('Filters reset');
  };

  const hasActiveFilters = Object.values(appliedFilters).some(val => val !== '');

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startRecord = filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, filteredData.length);

  // Pagination handlers
  const handleFirstPage = () => setCurrentPage(1);
  const handleLastPage = () => setCurrentPage(totalPages);
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers
  const getPageNumbers = () => {
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
const handleExportExcel = () => {
  const headers = [
    'Factory',
    'Unit',
    'Work Order No',
    'FastReact No',
    'Buyer',
    'Style Name',
    'Order Qty',
    'Wash Target Date',
    'Marks',
    'Total Wash Received',
    'Total Wash Delivery',
    '1st Dry Receive',
    '1st Dry Delivery',
    'Unwash Receive',
    'Unwash Delivery',
    '1st Wash Receive',
    '1st Wash Delivery',
    '2nd Dry Receive',
    '2nd Dry Delivery',
    'Final Wash Receive',
    'Final Wash Delivery',
  ];

  // ✅ Helper function to preserve leading zeros in Excel
  const preserveLeadingZeros = (value) => {
    if (value === null || value === undefined || value === '-') {
      return value;
    }
    const strValue = String(value);
    // Check if it's a numeric string that might have leading zeros
    if (/^\d+$/.test(strValue) && strValue.startsWith('0') && strValue.length > 1) {
      return `="${strValue}"`; // Excel formula format to force text
    }
    return strValue;
  };

  // ✅ Helper function to format cell for CSV
  const formatCell = (cell, forceText = false) => {
    if (cell === null || cell === undefined) {
      return '""';
    }
    const strValue = String(cell);
    
    // If forceText is true, use Excel formula format
    if (forceText) {
      // Already has the formula format
      if (strValue.startsWith('="') && strValue.endsWith('"')) {
        return strValue;
      }
      return `="${strValue}"`;
    }
    
    // Regular escaping - escape quotes and wrap in quotes
    return `"${strValue.replace(/"/g, '""')}"`;
  };

  // Add filter information header
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
    filterInfo.push(['']); // Empty row
  }

  // Summary section
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
      summarySection.push([
        stageName,
        data.receive,
        data.delivery
      ]);
    });
    summarySection.push(['']); // Empty row
  }

  // Helper: Get stage quantity for work order with date filter
  const getStageQuantityForWorkOrder = (workOrderTransactions, stageName, type) => {
    let filteredTransactions = workOrderTransactions;
    
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const startTime = appliedFilters.startDate 
        ? new Date(appliedFilters.startDate + 'T00:00:00').getTime() 
        : null;
      const endTime = appliedFilters.endDate 
        ? new Date(appliedFilters.endDate + 'T23:59:59').getTime() 
        : null;

      filteredTransactions = workOrderTransactions.filter(transaction => {
        const transTime = new Date(transaction.transactionDate).getTime();
        const startMatch = !startTime || transTime >= startTime;
        const endMatch = !endTime || transTime <= endTime;
        return startMatch && endMatch;
      });
    }

    const stageTransactions = filteredTransactions.filter(
      t => t.processStageName === stageName && t.transactionType === type
    );
    
    return stageTransactions.reduce((sum, t) => sum + t.quantity, 0);
  };

  // ✅ FIXED: Export filtered data with preserved leading zeros
  const rows = filteredData.map(item => {
    const workOrderTransactions = item.transactions || [];

    return {
      factory: item.factory,
      unit: item.unit,
      workOrderNo: item.workOrderNo,        // ✅ Will be formatted specially
      fastReactNo: item.fastReactNo,        // ✅ Will be formatted specially
      buyer: item.buyer,
      styleName: item.styleName,
      orderQuantity: item.orderQuantity,
      washTargetDate: item.washTargetDate,
      marks: item.marks,
      totalWashReceived: item.totalWashReceived,
      totalWashDelivery: item.totalWashDelivery,
      firstDryReceive: getStageQuantityForWorkOrder(workOrderTransactions, '1st Dry', 1),
      firstDryDelivery: getStageQuantityForWorkOrder(workOrderTransactions, '1st Dry', 2),
      unwashReceive: getStageQuantityForWorkOrder(workOrderTransactions, 'Unwash', 1),
      unwashDelivery: getStageQuantityForWorkOrder(workOrderTransactions, 'Unwash', 2),
      firstWashReceive: getStageQuantityForWorkOrder(workOrderTransactions, '1st Wash', 1),
      firstWashDelivery: getStageQuantityForWorkOrder(workOrderTransactions, '1st Wash', 2),
      secondDryReceive: getStageQuantityForWorkOrder(workOrderTransactions, '2nd Dry', 1),
      secondDryDelivery: getStageQuantityForWorkOrder(workOrderTransactions, '2nd Dry', 2),
      finalWashReceive: getStageQuantityForWorkOrder(workOrderTransactions, 'Final Wash', 1),
      finalWashDelivery: getStageQuantityForWorkOrder(workOrderTransactions, 'Final Wash', 2),
    };
  });

  // ✅ Build CSV content with proper formatting
  const csvRows = rows.map(row => {
    return [
      formatCell(row.factory),
      formatCell(row.unit),
      formatCell(row.workOrderNo, true),    // ✅ Force text to preserve leading zeros
      formatCell(row.fastReactNo, true),    // ✅ Force text to preserve leading zeros
      formatCell(row.buyer),
      formatCell(row.styleName),
      formatCell(row.orderQuantity),
      formatCell(row.washTargetDate),
      formatCell(row.marks),
      formatCell(row.totalWashReceived),
      formatCell(row.totalWashDelivery),
      formatCell(row.firstDryReceive),
      formatCell(row.firstDryDelivery),
      formatCell(row.unwashReceive),
      formatCell(row.unwashDelivery),
      formatCell(row.firstWashReceive),
      formatCell(row.firstWashDelivery),
      formatCell(row.secondDryReceive),
      formatCell(row.secondDryDelivery),
      formatCell(row.finalWashReceive),
      formatCell(row.finalWashDelivery),
    ].join(',');
  });

  const csvContent = [
    ...filterInfo.map(row => row.map(cell => formatCell(cell)).join(',')),
    ...summarySection.map(row => row.map(cell => formatCell(cell)).join(',')),
    ['DETAILED DATA'].map(cell => formatCell(cell)).join(','),
    headers.map(h => formatCell(h)).join(','),
    ...csvRows,
  ].join('\n');

  // Add BOM for proper UTF-8 encoding in Excel
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
};
//   const handleExportExcel = () => {
//   const headers = [
//     'Factory',
//     'Unit',
//     'Work Order No',
//     'FastReact No',
//     'Buyer',
//     'Style Name',
//     'Order Qty',
//     'Wash Target Date',
//     'Marks',
//     'Total Wash Received',
//     'Total Wash Delivery',
//     '1st Dry Receive',
//     '1st Dry Delivery',
//     'Unwash Receive',
//     'Unwash Delivery',
//     '1st Wash Receive',
//     '1st Wash Delivery',
//     '2nd Dry Receive',
//     '2nd Dry Delivery',
//     'Final Wash Receive',
//     'Final Wash Delivery',
//   ];

//   // Add filter information header
//   const filterInfo = [];
//   if (hasActiveFilters) {
//     filterInfo.push(['FILTER CRITERIA']);
//     if (appliedFilters.startDate) filterInfo.push(['Start Date', appliedFilters.startDate]);
//     if (appliedFilters.endDate) filterInfo.push(['End Date', appliedFilters.endDate]);
//     if (appliedFilters.buyer) filterInfo.push(['Buyer', appliedFilters.buyer]);
//     if (appliedFilters.factory) filterInfo.push(['Factory', appliedFilters.factory]);
//     if (appliedFilters.unit) filterInfo.push(['Unit', appliedFilters.unit]);
//     if (appliedFilters.processStageId) {
//       const stage = stages.find(s => s.id === parseInt(appliedFilters.processStageId));
//       filterInfo.push(['Process Stage', stage?.name || appliedFilters.processStageId]);
//     }
//     if (appliedFilters.transactionTypeId !== '') {
//       filterInfo.push(['Transaction Type', appliedFilters.transactionTypeId === '1' ? 'Receive' : 'Delivery']);
//     }
//     filterInfo.push(['']); // Empty row
//   }

//   // ✅ FIXED: Add summary section - WITHOUT BALANCE
//   const summarySection = [
//     ['SUMMARY STATISTICS'],
//     ['Total Work Orders', summaryStats.totalWorkOrders],
//     ['Total Transactions', summaryStats.transactionCount],
//     ['Total Receive Quantity', summaryStats.totalReceive],
//     ['Total Delivery Quantity', summaryStats.totalDelivery],
//     ['Total Quantity', summaryStats.totalReceive + summaryStats.totalDelivery],
//     ['Total Order Quantity', summaryStats.totalOrderQuantity],
//     ['Unique Process Stages', summaryStats.uniqueStagesCount],
//     [''], 
//   ];

//   // ✅ FIXED: Add stage breakdown - WITHOUT BALANCE
//   if (Object.keys(summaryStats.stageBreakdown).length > 0) {
//     summarySection.push(['STAGE BREAKDOWN']);
//     summarySection.push(['Stage Name', 'Receive', 'Delivery']);
//     Object.entries(summaryStats.stageBreakdown).forEach(([stageName, data]) => {
//       summarySection.push([
//         stageName,
//         data.receive,
//         data.delivery
//       ]);
//     });
//     summarySection.push(['']); // Empty row
//   }

//   // ✅ HELPER: Get stage quantity for PER WORK ORDER with date filter
//   const getStageQuantityForWorkOrder = (workOrderTransactions, stageName, type) => {
//     // Apply date filter to this work order's transactions only
//     let filteredTransactions = workOrderTransactions;
    
//     if (appliedFilters.startDate || appliedFilters.endDate) {
//       const startTime = appliedFilters.startDate 
//         ? new Date(appliedFilters.startDate + 'T00:00:00').getTime() 
//         : null;
//       const endTime = appliedFilters.endDate 
//         ? new Date(appliedFilters.endDate + 'T23:59:59').getTime() 
//         : null;

//       filteredTransactions = workOrderTransactions.filter(transaction => {
//         const transTime = new Date(transaction.transactionDate).getTime();
//         const startMatch = !startTime || transTime >= startTime;
//         const endMatch = !endTime || transTime <= endTime;
//         return startMatch && endMatch;
//       });
//     }

//     // Filter by stage and type
//     const stageTransactions = filteredTransactions.filter(
//       t => t.processStageName === stageName && t.transactionType === type
//     );
    
//     return stageTransactions.reduce((sum, t) => sum + t.quantity, 0);
//   };

//   // ✅ FIXED: Export filtered data - Calculate PER ROW
//   const rows = filteredData.map(item => {
//     // Get this work order's transactions
//     const workOrderTransactions = item.transactions || [];

//     // Calculate totals for THIS work order
//     const totalReceived = 
//       getStageQuantityForWorkOrder(workOrderTransactions, '1st Dry', 1) +
//       getStageQuantityForWorkOrder(workOrderTransactions, 'Unwash', 1) +
//       getStageQuantityForWorkOrder(workOrderTransactions, '1st Wash', 1) +
//       getStageQuantityForWorkOrder(workOrderTransactions, '2nd Dry', 1) +
//       getStageQuantityForWorkOrder(workOrderTransactions, 'Final Wash', 1);

//     const totalDelivered = 
//       getStageQuantityForWorkOrder(workOrderTransactions, '1st Dry', 2) +
//       getStageQuantityForWorkOrder(workOrderTransactions, 'Unwash', 2) +
//       getStageQuantityForWorkOrder(workOrderTransactions, '1st Wash', 2) +
//       getStageQuantityForWorkOrder(workOrderTransactions, '2nd Dry', 2) +
//       getStageQuantityForWorkOrder(workOrderTransactions, 'Final Wash', 2);

//     return [
//       item.factory,
//       item.unit,
//       item.workOrderNo,
//       item.fastReactNo,
//       item.buyer,
//       item.styleName,
//       item.orderQuantity,
//       item.washTargetDate,
//       item.marks,
//       // totalReceived,   // ✅ Per work order total
//       // totalDelivered,  // ✅ Per work order total

//       item.totalWashReceived,  // Original totals from work order
//       item.totalWashDelivery,  // Original totals from work order
//       getStageQuantityForWorkOrder(workOrderTransactions, '1st Dry', 1),
//       getStageQuantityForWorkOrder(workOrderTransactions, '1st Dry', 2),
//       getStageQuantityForWorkOrder(workOrderTransactions, 'Unwash', 1),
//       getStageQuantityForWorkOrder(workOrderTransactions, 'Unwash', 2),
//       getStageQuantityForWorkOrder(workOrderTransactions, '1st Wash', 1),
//       getStageQuantityForWorkOrder(workOrderTransactions, '1st Wash', 2),
//       getStageQuantityForWorkOrder(workOrderTransactions, '2nd Dry', 1),
//       getStageQuantityForWorkOrder(workOrderTransactions, '2nd Dry', 2),
//       getStageQuantityForWorkOrder(workOrderTransactions, 'Final Wash', 1),
//       getStageQuantityForWorkOrder(workOrderTransactions, 'Final Wash', 2),
//     ];
//   });

//   const csvContent = [
//     ...filterInfo.map(row => row.map(cell => `"${cell}"`).join(',')),
//     ...summarySection.map(row => row.map(cell => `"${cell}"`).join(',')),
//     ['DETAILED DATA'],
//     headers.join(','),
//     ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
//   ].join('\n');

//   const element = document.createElement('a');
//   const filterSuffix = hasActiveFilters ? '-filtered' : '';
//   const dateSuffix = appliedFilters.startDate ? `-${appliedFilters.startDate}` : '';
//   element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
//   element.setAttribute('download', `transaction-report${filterSuffix}${dateSuffix}-${new Date().toISOString().split('T')[0]}.csv`);
//   element.style.display = 'none';
//   document.body.appendChild(element);
//   element.click();
//   document.body.removeChild(element);

//   toast.success(`Report exported successfully (${filteredData.length} records)`);
// };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  } 
  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Transaction Reports</h1>
        <p className="text-gray-600">
          Comprehensive transaction summary across all stages
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
              onClick={loadData}
              disabled={loading}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 font-medium disabled:opacity-50"
            >
              <Refresh fontSize="small" />
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
            <p className="text-2xl font-bold text-blue-900">{workOrders.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-semibold mb-1">Filtered Results</p>
            <p className="text-2xl font-bold text-green-900">{filteredData.length}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-600 font-semibold mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-purple-900">{transactions.length}</p>
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
              
              {/* ==================== BUYER FILTER ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Buyer
                </label>
                <select
                  name="buyer"
                  value={filterParams.buyer}
                  onChange={handleFilterChange}
                  disabled={loading || uniqueBuyers.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium disabled:bg-gray-50"
                >
                  <option value="">All Buyers</option>
                  {uniqueBuyers.map(buyer => (
                    <option key={buyer} value={buyer}>
                      {buyer}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{uniqueBuyers.length} buyers available</p>
              </div>

              {/* ==================== FACTORY FILTER ==================== */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Factory
                </label>
                <select
                  name="factory"
                  value={filterParams.factory}
                  onChange={handleFilterChange}
                  disabled={loading || uniqueFactories.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-medium disabled:bg-gray-50"
                >
                  <option value="">All Factories</option>
                  {uniqueFactories.map(factory => (
                    <option key={factory} value={factory}>
                      {factory}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{uniqueFactories.length} factories available</p>
              </div>

              {/* ==================== UNIT FILTER ==================== */}
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
                <p className="text-xs text-gray-500 mt-1">Filter by transaction type</p>
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

      {/* ==================== SUMMARY STATISTICS SECTION ==================== */}
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
              {/* Total Work Orders */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-600">Work Orders</p>
                  <CalendarToday className="text-blue-500" fontSize="small" />
                </div>
                <p className="text-4xl font-bold text-gray-900">{summaryStats.totalWorkOrders}</p>
                <p className="text-xs text-gray-500 mt-2">Total filtered orders</p>
              </div>

              {/* Total Receive */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-green-600">Total Receive</p>
                  <TrendingUp className="text-green-500" fontSize="small" />
                </div>
                <p className="text-4xl font-bold text-green-700">{summaryStats.totalReceive.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">{summaryStats.transactionCount} transactions</p>
              </div>

              {/* Total Delivery */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-orange-600">Total Delivery</p>
                  <TrendingDown className="text-orange-500" fontSize="small" />
                </div>
                <p className="text-4xl font-bold text-orange-700">{summaryStats.totalDelivery.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">Total delivered quantity</p>
              </div>

              {/* Balance */}
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
                        {/* <th className="px-4 py-3 text-center font-bold text-gray-700">% Completion</th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(summaryStats.stageBreakdown).map(([stageName, data]) => {
                        const Total = data.receive + data.delivery;
                        const completion = data.receive > 0 ? ((data.delivery / data.receive) * 100).toFixed(1) : 0;
                        
                        return (
                          <tr key={stageName} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-gray-800">{stageName}</td>
                            <td className="px-4 py-3 text-center font-bold text-green-600">
                              {data.receive.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-orange-600">
                              {data.delivery.toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 text-center font-bold ${Total >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                              {(data.receive + data.delivery).toLocaleString()}
                            </td>
                            {/* <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary-600 transition-all duration-300"
                                    style={{ width: `${Math.min(completion, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-gray-600">{completion}%</span>
                              </div>
                            </td> */}
                          </tr>
                        );
                      })}
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
                        <td className={'px-4 py-3 text-center  text-purple-700 '}>
                          {(summaryStats.totalReceive + summaryStats.totalDelivery).toLocaleString()}
                        </td>
                        {/* <td className="px-4 py-3 text-center text-gray-700">
                          {summaryStats.uniqueStagesCount} Stages
                        </td> */}
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
          description={hasActiveFilters ? "No transactions found matching your filters" : "No transactions found matching your search"}
          variant="search"
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm print:text-xs">
                {/* Table Header */}
                <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                  {/* Main Header Row - Level 1 */}
                  <tr>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
                      Factory
                    </th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
                      Unit
                    </th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
                      Work Order No
                    </th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
                      FastReact No
                    </th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
                      Buyer
                    </th> 
                                        <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
                      Style Name
                    </th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
                      Order Qty
                    </th>
                    <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r">
                      Wash Target Date
                    </th>
                    {/* <th rowSpan="3" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 border-r-2 border-gray-300">
                      Marks
                    </th> */}
                    <th colSpan="2" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-100 border-r-2 border-gray-300">
                      Total Wash
                    </th>
                    <th colSpan="10" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-50">
                      Process Stages
                    </th>
                  </tr>

                  {/* Secondary Header Row - Level 2 */}
                  <tr>
                    <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-r">
                      Rcv
                    </th>
                    <th rowSpan="2" className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-r-2 border-gray-300">
                      Del
                    </th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-yellow-50 border-l border-yellow-200">
                      1st Dry
                    </th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-blue-50 border-l border-blue-200">
                      Unwash
                    </th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-green-50 border-l border-green-200">
                      1st Wash
                    </th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-orange-50 border-l border-orange-200">
                      2nd Dry
                    </th>
                    <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-purple-50 border-l border-purple-200">
                      Final Wash
                    </th>
                  </tr>

                  {/* Sub-headers Row - Level 3 */}
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

                {/* TABLE BODY - Using paginated data */}
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((item, index) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-bold text-primary-600">{item.factory}</td>
                      <td className="px-4 py-3 font-bold text-primary-600">{item.unit}</td>
                      <td className="px-4 py-3 font-bold text-primary-600">{item.workOrderNo}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{item.fastReactNo}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        <p>{item.buyer}</p>
                        <p> {item.marks}</p>
                        </td>
                      <td className="px-4 py-3 text-gray-700">{item.styleName}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.orderQuantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs" title={item.washTargetDate}>
                        {item.washTargetDate}
                      </td>
                      {/* <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[120px]" title={item.marks}>
                        {item.marks}
                      </td> */}
                      
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

                {/* TOTALS FOOTER - Shows totals for current page */}
                <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-right">
                      Page Total:
                    </td>
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

          {/* Pagination Controls */}
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
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                Showing {startRecord} to {endRecord} of {filteredData.length} entries
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
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Next page"
                >
                  <ChevronRight className="text-gray-600" />
                </button>

                {/* Last page */}
                <button
                  onClick={handleLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  title="Last page"
                >
                  <LastPage className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Grand Total Summary - Always shows total of ALL filtered data */}
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

      {/* Print Styles */}
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-from-top-2 {
          from {
            transform: translateY(-0.5rem);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fade-in 0.2s ease-out, slide-in-from-top-2 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Reports;