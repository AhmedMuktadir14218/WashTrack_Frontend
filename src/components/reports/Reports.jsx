import { useState, useEffect, useMemo } from 'react';
import { Download, Search, Refresh, Print } from '@mui/icons-material';
import { workOrderApi } from '../../api/workOrderApi';
import { washTransactionApi } from '../../api/washTransactionApi';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';

const Reports = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
// console.log('Render Reports Component',workOrders);
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
      workOrderNo: wo.workOrderNo,
      fastReactNo: wo.fastReactNo || '-',
      buyer: wo.buyer,
      styleName: wo.styleName,
      marks: wo.marks || '-',
      orderQuantity: wo.orderQuantity,
      WashTargetDate: wo.washTargetDate ? new Date(wo.washTargetDate).toLocaleDateString('en-GB') : '-', 
      TotalWashReceived: wo.totalWashReceived || 0,
      TotalWashDelivery: wo.totalWashDelivery || 0,
      firstDryReceive: getStageQuantity('1st Dry', 1),
      firstDryDelivery: getStageQuantity('1st Dry', 2),
      unwashReceive: getStageQuantity('Unwash', 1),
      unwashDelivery: getStageQuantity('Unwash', 2),
      firstWashReceive: getStageQuantity('1st Wash', 1),
      firstWashDelivery: getStageQuantity('1st Wash', 2),
      secondDryReceive: getStageQuantity('2nd Dry', 1),
      secondDryDelivery: getStageQuantity('2nd Dry', 2),
      // secondWashReceive: getStageQuantity('2nd Wash', 1),
      // secondWashDelivery: getStageQuantity('2nd Wash', 2),
      finalWashReceive: getStageQuantity('Final Wash', 1),
      finalWashDelivery: getStageQuantity('Final Wash', 2),
    };
  });
}, [workOrders, transactions]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(reportData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = reportData.filter(
        item =>
          item.workOrderNo.toLowerCase().includes(query) ||
          item.fastReactNo.toLowerCase().includes(query) ||
          item.buyer.toLowerCase().includes(query) ||
          item.styleName.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, reportData]);

  const handleExportExcel = () => {
    const headers = [
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
      // '2nd Wash Receive',
      // '2nd Wash Delivery',
      'Final Wash Receive',
      'Final Wash Delivery',
    ];

    const rows = filteredData.map(item => [
      item.workOrderNo,
      item.fastReactNo,
      item.buyer,
      item.styleName,
      item.orderQuantity,
      item.WashTargetDate,
      item.marks,
      item.TotalWashReceived,
      item.TotalWashDelivery,
      item.firstDryReceive,
      item.firstDryDelivery,
      item.unwashReceive,
      item.unwashDelivery,
      item.firstWashReceive,
      item.firstWashDelivery,
      item.secondDryReceive,
      item.secondDryDelivery,
      // item.secondWashReceive,
      // item.secondWashDelivery,
      item.finalWashReceive,
      item.finalWashDelivery,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `transaction-report-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Report exported successfully');
  };

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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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

        {/* Stats */}
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

      {/* Table */}
      {filteredData.length === 0 ? (
        <EmptyState
          title="No Data"
          description="No transactions found matching your search"
          variant="search"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm print:text-xs">
              {/* FIXED HEADER STRUCTURE */}
              <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                {/* Main Header Row */}
                <tr>
                  <th colSpan="7" className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50">
                    Basic Information
                  </th>
                  <th colSpan="2" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-50 border-l-2 border-gray-300">
                    Total Wash
                  </th>
                  <th colSpan="12" className="px-4 py-3 text-center font-bold text-gray-700 bg-gray-50 border-l-2 border-gray-300">
                    Process Stages
                  </th>
                </tr>

                {/* Secondary Header Row */}
                <tr>
                  {/* Basic Info Columns */}
                  <th className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 min-w-[120px]">
                    Work Order No
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 min-w-[120px]">
                    FastReact No
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 min-w-[100px]">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 min-w-[150px]">
                    Style Name
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 min-w-[100px]">
                    Order Qty
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 min-w-[120px]">
                    Wash Target Date
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 min-w-[100px]">
                    Marks
                  </th>

                  {/* Total Wash Columns */}
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-l-2 border-gray-300">
                    Received
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs">
                    Delivered
                  </th>

                  {/* Process Stage Headers */}
                  <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-yellow-50 border-l-2 border-yellow-200">
                    1st Dry
                  </th>
                  <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-blue-50 border-l-2 border-blue-200">
                    Unwash
                  </th>
                  <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-green-50 border-l-2 border-green-200">
                    1st Wash
                  </th>
                  <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-orange-50 border-l-2 border-orange-200">
                    2nd Dry
                  </th>
                    {/*  <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-pink-50 border-l-2 border-pink-200">
                    2nd Wash
                  </th>*/}
                  <th colSpan="2" className="px-4 py-2 text-center font-bold text-gray-700 bg-purple-50 border-l-2 border-purple-200">
                    Final Wash
                  </th>
                </tr>

                {/* Sub-headers for Process Stages */}
                <tr>
                  <th colSpan="7"></th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs border-l-2 border-gray-300">
                    Rcv
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-gray-100 text-xs">
                    Del
                  </th>
                  
                  {/* Process Stage Sub-headers */}
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-yellow-50 text-xs border-l-2 border-yellow-200">Rcv</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-yellow-50 text-xs">Del</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-blue-50 text-xs border-l-2 border-blue-200">Rcv</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-blue-50 text-xs">Del</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-green-50 text-xs border-l-2 border-green-200">Rcv</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-green-50 text-xs">Del</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-orange-50 text-xs border-l-2 border-orange-200">Rcv</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-orange-50 text-xs">Del</th>
                  {/* <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-pink-50 text-xs border-l-2 border-pink-200">Rcv</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-pink-50 text-xs">Del</th> */}
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-purple-50 text-xs border-l-2 border-purple-200">Rcv</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 bg-purple-50 text-xs">Del</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={item.id} className={`hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    {/* Basic Information */}
                    <td className="px-4 py-3 font-bold text-primary-600">{item.workOrderNo}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{item.fastReactNo}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{item.buyer}</td>
                    <td className="px-4 py-3 text-gray-700">{item.styleName}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {item.orderQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs" title={item.WashTargetDate}>
                      {item.WashTargetDate}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[120px]" title={item.marks}>
                      {item.marks}
                    </td>
                    
                    {/* Total Wash */}
                    <td className="px-3 py-3 text-center font-bold text-gray-800 bg-gray-100 border-l-2 border-gray-300">
                      {item.TotalWashReceived.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800 bg-gray-100">
                      {item.TotalWashDelivery.toLocaleString()}
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

                    {/* <td className="px-3 py-3 text-center font-bold text-gray-800 bg-pink-50 border-l-2 border-pink-200">
                      {item.secondWashReceive.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800 bg-pink-50">
                      {item.secondWashDelivery.toLocaleString()}
                    </td> */}

                    <td className="px-3 py-3 text-center font-bold text-gray-800 bg-purple-50 border-l-2 border-purple-200">
                      {item.finalWashReceive.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800 bg-purple-50">
                      {item.finalWashDelivery.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* TOTALS FOOTER */}
              <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                <tr>
                  <td colSpan="7" className="px-4 py-3 text-right">
                    TOTAL:
                  </td>
                  
                  {/* Total Wash Totals */}
                  <td className="px-3 py-3 text-center bg-gray-200 border-l-2 border-gray-300">
                    {filteredData.reduce((sum, item) => sum + item.TotalWashReceived, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-gray-200">
                    {filteredData.reduce((sum, item) => sum + item.TotalWashDelivery, 0).toLocaleString()}
                  </td>

                  {/* Process Stage Totals */}
                  <td className="px-3 py-3 text-center bg-yellow-100 border-l-2 border-yellow-200">
                    {filteredData.reduce((sum, item) => sum + item.firstDryReceive, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-yellow-100">
                    {filteredData.reduce((sum, item) => sum + item.firstDryDelivery, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-blue-100 border-l-2 border-blue-200">
                    {filteredData.reduce((sum, item) => sum + item.unwashReceive, 0).toLocaleString()}
                  </td>
                                  <td className="px-3 py-3 text-center bg-blue-100">
                    {filteredData.reduce((sum, item) => sum + item.unwashDelivery, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-green-100 border-l-2 border-green-200">
                    {filteredData.reduce((sum, item) => sum + item.firstWashReceive, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-green-100">
                    {filteredData.reduce((sum, item) => sum + item.firstWashDelivery, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-orange-100 border-l-2 border-orange-200">
                    {filteredData.reduce((sum, item) => sum + item.secondDryReceive, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-orange-100">
                    {filteredData.reduce((sum, item) => sum + item.secondDryDelivery, 0).toLocaleString()}
                  </td>
                  {/* <td className="px-3 py-3 text-center bg-pink-100 border-l-2 border-pink-200">
                    {filteredData.reduce((sum, item) => sum + item.secondWashReceive, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-pink-100">
                    {filteredData.reduce((sum, item) => sum + item.secondWashDelivery, 0).toLocaleString()}
                  </td> */}
                  <td className="px-3 py-3 text-center bg-purple-100 border-l-2 border-purple-200">
                    {filteredData.reduce((sum, item) => sum + item.finalWashReceive, 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-center bg-purple-100">
                    {filteredData.reduce((sum, item) => sum + item.finalWashDelivery, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
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
        }
      `}</style>
    </div>
  );
};

export default Reports;