// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\user\UserTransactionPage.jsx
import { useState, useEffect } from 'react';
import { useProcessStage } from '../../hooks/useProcessStage';
import { useAuth } from '../../hooks/useAuth';
import { workOrderApi } from '../../api/workOrderApi';
import { washTransactionApi } from '../../api/washTransactionApi';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { 
  Search, 
  Save, 
  X, 
  Remove, 
  Lock,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FirstPage,
  LastPage
} from '@mui/icons-material';

// ✅ Icons outside component - prevents re-creation
const UpArrowIcon = ({ className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} fill="currentColor" {...props}>
    <path d="M50 25 L75 50 L62 50 L62 75 L38 75 L38 50 L25 50 Z" />
  </svg>
);

const DownArrowIcon = ({ className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} fill="currentColor" {...props}>
    <path transform="rotate(180 50 50)" d="M50 25 L75 50 L62 50 L62 75 L38 75 L38 50 L25 50 Z" />
  </svg>
);

const UserTransactionPage = () => {
  const { stages } = useProcessStage();
  const { getFirstStageAccess, isAdmin } = useAuth();
  
  const [step, setStep] = useState(1);
  const [transactionType, setTransactionType] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [userStageAccess, setUserStageAccess] = useState(null);
  const [setupDone, setSetupDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('workOrders');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Setup user stage access
  useEffect(() => {
    if (isAdmin()) return;

    const firstStageAccess = getFirstStageAccess();
    if (!firstStageAccess?.canView) {
      toast.error('No access');
      setSetupDone(true);
      return;
    }

    setUserStageAccess(firstStageAccess);
    const matchingStage = stages.find(s => s.id === firstStageAccess.processStageId);
    if (matchingStage) setSelectedStage(matchingStage.id);
    setSetupDone(true);
  }, [stages, getFirstStageAccess, isAdmin]);

  // Fetch Work Orders
  useEffect(() => {
    if (step !== 2) return;

    const fetchWorkOrders = async () => {
      setLoading(true);
      try {
        const response = await workOrderApi.getPaginated({
          page: currentPage,
          pageSize,
          searchTerm: searchQuery,
          sortBy: 'CreatedAt',
          sortOrder: 'desc',
        });

        if (response.data.success) {
          setWorkOrders(response.data.data || []);
          setTotalRecords(response.data.pagination.totalRecords);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch {
        toast.error('Failed to load');
        setWorkOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, [currentPage, pageSize, searchQuery, step]);

  // ✅ INSTANT - No setTimeout delay!
  const handleTypeSelect = (type) => {
    if (!userStageAccess?.canView) {
      toast.error("No access");
      return;
    }
    setTransactionType(type);
    setStep(2);
    setSearchQuery('');
    setSelectedRows({});
    setActiveTab('workOrders');
    setCurrentPage(1);
  };

  // ✅ Simple inline calculation
  const handleQuantityChange = (workOrderId, quantity) => {
    if (quantity === '' || parseInt(quantity) <= 0) {
      const newRows = { ...selectedRows };
      delete newRows[workOrderId];
      setSelectedRows(newRows);
      return;
    }

    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return;

    const enteredQty = parseInt(quantity);
    const twr = wo.totalWashReceived || 0;
    
    // ✅ Get stage balance directly from work order
    const stageBalance = wo.stageBalances?.find(sb => sb.processStageId === selectedStage);
    const stageReceived = stageBalance?.totalReceived || 0;
    const stageDelivered = stageBalance?.totalDelivered || 0;

    // ✅ Calculate available
    const availableQty = transactionType === 'delivery'
      ? twr - stageDelivered
      : twr - stageReceived;

    if (enteredQty > availableQty) {
      toast.error(
        transactionType === 'delivery'
          ? `ডেলিভারি সীমা: ${availableQty} (TWR:${twr} - Del:${stageDelivered})`
          : `রিসিভ সীমা: ${availableQty} (TWR:${twr} - Rcv:${stageReceived})`
      );
      return;
    }

    setSelectedRows({ ...selectedRows, [workOrderId]: enteredQty });
  };

  const handleRemoveRow = (workOrderId) => {
    const newRows = { ...selectedRows };
    delete newRows[workOrderId];
    setSelectedRows(newRows);
  };

  const handleSave = async () => {
    const ids = Object.keys(selectedRows);
    if (!ids.length) {
      toast.error('Select at least one');
      return;
    }

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const results = await Promise.all(
        ids.map(id => {
          const payload = {
            workOrderId: parseInt(id),
            processStageId: selectedStage,
            quantity: selectedRows[id],
            transactionType: transactionType === 'receive' ? 1 : 2,
            transactionDate: today,
          };
          return transactionType === 'receive'
            ? washTransactionApi.createReceive(payload)
            : washTransactionApi.createDelivery(payload);
        })
      );

      const success = results.filter(r => r.data?.success).length;
      if (success > 0) {
        toast.success(`${success} saved`);
        setStep(1);
        setTransactionType(null);
        setSelectedRows({});
        setCurrentPage(1);
      }
    } catch {
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  // Helpers
  const stageName = stages.find(s => s.id === selectedStage)?.name || '';
  const selectedCount = Object.keys(selectedRows).length;
  const totalQuantity = Object.values(selectedRows).reduce((a, b) => a + b, 0);
  const selectedWorkOrders = workOrders.filter(wo => selectedRows[wo.id]);

  // ✅ Inline function to get available qty for display
  const getAvailableQty = (wo) => {
    const twr = wo.totalWashReceived || 0;
    const stageBalance = wo.stageBalances?.find(sb => sb.processStageId === selectedStage);
    const stageVal = transactionType === 'delivery' 
      ? (stageBalance?.totalDelivered || 0)
      : (stageBalance?.totalReceived || 0);
    return Math.max(0, twr - stageVal);
  };

  // ✅ Inline function to get stage value for display
  const getStageVal = (wo) => {
    const stageBalance = wo.stageBalances?.find(sb => sb.processStageId === selectedStage);
    return transactionType === 'delivery'
      ? (stageBalance?.totalDelivered || 0)
      : (stageBalance?.totalReceived || 0);
  };

  // Loading
  if (!setupDone) {
    return <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!userStageAccess?.canView) {
    return (
      <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <Lock className="text-red-600 mx-auto mb-4" style={{ fontSize: 40 }} />
          <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 overflow-hidden rounded-xl shadow-md">
      {step === 1 ? (
        <div className="h-screen min-h-[550px] flex flex-col bg-white">
          <div className="flex-1 px-6 pb-6 space-y-8 flex flex-col justify-center items-center">
            <button
              onClick={() => handleTypeSelect('delivery')}
              className="flex flex-col items-center justify-center p-8 w-48 h-48 bg-red-50 border-2 border-red-200 rounded-full hover:border-red-500 hover:bg-red-100 transition shadow-lg cursor-pointer"
            >
              <UpArrowIcon className="text-red-600 mb-1 w-24 h-24" />
              <h3 className="text-lg font-bold text-red-700">Delivery</h3>
            </button>

            <button
              onClick={() => handleTypeSelect('receive')}
              className="flex flex-col items-center justify-center p-8 w-48 h-48 bg-green-50 border-2 border-green-200 rounded-full hover:border-green-500 hover:bg-green-100 transition shadow-lg cursor-pointer"
            >
              <DownArrowIcon className="text-green-600 mb-1 w-24 h-24" />
              <h3 className="text-lg font-bold text-green-700">RECEIVE</h3>
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-[550px] flex flex-col">
          {/* Header */}
          <div className="px-6 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setStep(1)} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                ← Back
              </button>
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-800">
                  {transactionType === 'receive' ? 'Receive' : 'Delivery'}
                </h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{stageName}</span>
              </div>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('workOrders')}
                className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 ${activeTab === 'workOrders' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-500'}`}
              >
                Work Orders ({totalRecords})
              </button>
              <button
                onClick={() => setActiveTab('selected')}
                className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 ${activeTab === 'selected' ? 'border-primary-500 text-primary-700' : 'border-transparent text-gray-500'}`}
              >
                Selected ({selectedCount})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'workOrders' && (
              <div className="h-full flex flex-col p-4 pt-2">
                {/* Search */}
                <div className="mb-3 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 14 }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 text-sm"
                  />
                </div>

                {/* Table */}
                <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white">
                  {loading ? (
                    <div className="flex items-center justify-center h-32"><LoadingSpinner size="md" /></div>
                  ) : workOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-32"><EmptyState title="No Data" /></div>
                  ) : (
                    <div className="h-full max-h-[280px] overflow-y-auto scrollbar-hide">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-100 sticky top-0 text-blue-700">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-xs">WO No</th>
                            <th className="px-3 py-2 text-left font-semibold text-xs">Style</th>
                            <th className="px-3 py-2 text-left font-semibold text-xs">Order Qty</th>
                            <th className="px-3 py-2 text-center font-semibold text-xs">Add Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {workOrders.map((wo) => {
                            const hasQty = selectedRows[wo.id];
                            const availQty = getAvailableQty(wo);
                            const stageVal = getStageVal(wo);
                            const isDelivery = transactionType === 'delivery';

                            return (
                              <tr key={wo.id} className={`hover:bg-gray-50 ${hasQty ? 'bg-green-50' : ''} ${availQty <= 0 ? 'bg-red-50' : ''}`}>
                                <td className="px-3 py-2">
                                  <div className="font-semibold text-gray-800 text-xs">{wo.workOrderNo}</div>
                                  <div className="text-xs text-gray-500">{wo.fastReactNo || '-'}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs font-medium text-gray-700">{wo.styleName}</div>
                                  <div className="text-xs text-gray-500">{wo.marks || '-'}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="font-semibold text-gray-800 text-xs">{wo.orderQuantity.toLocaleString()}</div>
                                  <div className={`text-xs mt-0.5 ${isDelivery ? 'text-orange-600' : 'text-green-600'}`}>
                                    TWR:{wo.totalWashReceived || 0} | {isDelivery ? 'D' : 'R'}:{stageVal}
                                  </div>
                                </td>
                                <td className="px-2 py-2">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${availQty > 0 ? (isDelivery ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700') : 'bg-red-100 text-red-500'}`}>
                                      {availQty > 0 ? `Avl:${availQty}` : 'No Stock'}
                                    </span>
                                    {availQty > 0 ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          value={selectedRows[wo.id] || ''}
                                          onChange={(e) => handleQuantityChange(wo.id, e.target.value)}
                                          placeholder="0"
                                          min="1"
                                          max={availQty}
                                          className="w-14 px-1.5 py-1.5 border-2 border-blue-400 rounded outline-none focus:border-blue-600 text-center text-xs font-bold text-blue-700 bg-blue-50"
                                        />
                                        {hasQty && (
                                          <button onClick={() => handleRemoveRow(wo.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                            <X style={{ fontSize: 14 }} />
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-red-400">{isDelivery ? 'Done' : 'Full'}</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {!loading && workOrders.length > 0 && (
                  <div className="mt-3 flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border rounded text-xs">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-xs text-gray-600">of {totalRecords}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><FirstPage style={{ fontSize: 18 }} /></button>
                      <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><KeyboardArrowLeft style={{ fontSize: 18 }} /></button>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded font-semibold text-xs">{currentPage}/{totalPages}</span>
                      <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><KeyboardArrowRight style={{ fontSize: 18 }} /></button>
                      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"><LastPage style={{ fontSize: 18 }} /></button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'selected' && (
              <div className="h-full flex flex-col p-4 pt-2">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Items</p>
                    <p className="text-lg font-bold text-blue-900">{selectedCount}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-semibold mb-1">Total Qty</p>
                    <p className="text-lg font-bold text-green-900">{totalQuantity.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden border rounded-lg bg-white">
                  {selectedCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                      <Remove style={{ fontSize: 32 }} />
                      <p className="text-sm font-medium mt-2">No items selected</p>
                    </div>
                  ) : (
                    <div className="h-full max-h-[200px] overflow-y-auto scrollbar-hide">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-xs">WO No</th>
                            <th className="px-3 py-2 text-left font-semibold text-xs">Style</th>
                            <th className="px-3 py-2 text-center font-semibold text-xs">Qty</th>
                            <th className="px-3 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedWorkOrders.map((wo) => (
                            <tr key={wo.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-semibold text-gray-800 text-xs">{wo.workOrderNo}</td>
                              <td className="px-3 py-2 text-xs text-gray-700">{wo.styleName}</td>
                              <td className="px-3 py-2 text-center font-bold text-green-700 text-xs">{selectedRows[wo.id]?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center">
                                <button onClick={() => handleRemoveRow(wo.id)} className="p-1 text-red-600 hover:bg-red-100 rounded"><X style={{ fontSize: 16 }} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {selectedCount > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-sm rounded-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Saving...</span></>
                      ) : (
                        <><Save style={{ fontSize: 18 }} /><span>Save {selectedCount} {transactionType}</span></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default UserTransactionPage;




// // // D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\user\UserTransactionPage.jsx 
// import { useState, useEffect } from 'react';
// import { useProcessStage } from '../../hooks/useProcessStage';
// import { useAuth } from '../../hooks/useAuth';
// import { workOrderApi } from '../../api/workOrderApi';
// import { washTransactionApi } from '../../api/washTransactionApi';
// import LoadingSpinner from '../common/LoadingSpinner';
// import EmptyState from '../common/EmptyState';
// import toast from 'react-hot-toast';
// import { 
//   Search, 
//   Save, 
//   X, 
//   Remove, 
//   Lock,
//   KeyboardArrowLeft,
//   KeyboardArrowRight,
//   FirstPage,
//   LastPage
// } from '@mui/icons-material';

// const UserTransactionPage = () => {
//   const { stages, loading: stagesLoading } = useProcessStage();
//   const { getFirstStageAccess, isAdmin } = useAuth();
  
//   const [step, setStep] = useState(1);
//   const [transactionType, setTransactionType] = useState(null);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [userStageAccess, setUserStageAccess] = useState(null);
//   const [setupDone, setSetupDone] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [workOrders, setWorkOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedRows, setSelectedRows] = useState({});
//   const [isSaving, setIsSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState('workOrders');
//   const [isLoadingStep2, setIsLoadingStep2] = useState(false);

//   // ✅ All transactions for validation
//   const [allTransactions, setAllTransactions] = useState([]);
//   const [transactionsLoading, setTransactionsLoading] = useState(false);

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const [sortBy, setSortBy] = useState('CreatedAt');
//   const [sortOrder, setSortOrder] = useState('desc');

//   // Custom Arrow Icons
//   const UpArrowIcon = ({ className, ...props }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} fill="currentColor" {...props}>
//       <path d="M50 25 L75 50 L62 50 L62 75 L38 75 L38 50 L25 50 Z" />
//     </svg>
//   );

//   const DownArrowIcon = ({ className, ...props }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} fill="currentColor" {...props}>
//       <path transform="rotate(180 50 50)" d="M50 25 L75 50 L62 50 L62 75 L38 75 L38 50 L25 50 Z" />
//     </svg>
//   );

//   // ✅ Fetch All Transactions when step changes to 2
//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         setTransactionsLoading(true);
//         const response = await washTransactionApi.getAll();
//         if (response.data.success) {
//           setAllTransactions(response.data.data || []);
//         }
//       } catch (error) {
//         console.error('Failed to fetch transactions:', error);
//         setAllTransactions([]);
//       } finally {
//         setTransactionsLoading(false);
//       }
//     };

//     if (step === 2) {
//       fetchTransactions();
//     }
//   }, [step]);

//   // ✅ CORRECTED: Calculate available quantity for a work order
//   // Delivery: totalWashReceived - (Delivered in THIS STAGE)
//   // Receive: orderQuantity - (Received in THIS STAGE)
//   const getAvailableQuantity = (workOrderId) => {
//     const workOrder = workOrders.find(wo => wo.id === workOrderId);
//     if (!workOrder) return 0;

//     // Get current stage name
//     const currentStageName = stages.find(s => s.id === selectedStage)?.name;
//     if (!currentStageName) return 0;

//     // ✅ Filter transactions for this work order AND this stage ONLY
//     const stageTransactions = allTransactions.filter(
//       t => t.workOrderId === workOrderId && t.processStageName === currentStageName
//     );

//     // Calculate receive and delivery for THIS STAGE ONLY
//     const stageReceived = stageTransactions
//       .filter(t => t.transactionType === 1)
//       .reduce((sum, t) => sum + t.quantity, 0);

//     const stageDelivered = stageTransactions
//       .filter(t => t.transactionType === 2)
//       .reduce((sum, t) => sum + t.quantity, 0);

//     if (transactionType === 'delivery') {
//       // ✅ For Delivery: Available = totalWashReceived - (Delivered in THIS STAGE)
//       return Math.max(0, (workOrder.totalWashReceived || 0) - stageDelivered);
//     } else {
//       // ✅ For Receive: Available = orderQuantity - (Received in THIS STAGE)
//       return Math.max(0, (workOrder.orderQuantity || 0) - stageReceived);
//     }
//   };

//   // ✅ CORRECTED: Get stage transaction summary for display
//   const getStageTransactionSummary = (workOrderId) => {
//     const workOrder = workOrders.find(wo => wo.id === workOrderId);
//     if (!workOrder) return null;

//     const currentStageName = stages.find(s => s.id === selectedStage)?.name;
//     if (!currentStageName) return null;

//     // ✅ Filter transactions for this work order AND this stage ONLY
//     const stageTransactions = allTransactions.filter(
//       t => t.workOrderId === workOrderId && t.processStageName === currentStageName
//     );

//     const stageReceived = stageTransactions
//       .filter(t => t.transactionType === 1)
//       .reduce((sum, t) => sum + t.quantity, 0);

//     const stageDelivered = stageTransactions
//       .filter(t => t.transactionType === 2)
//       .reduce((sum, t) => sum + t.quantity, 0);

//     return {
//       stageName: currentStageName,
//       stageReceived,
//       stageDelivered,
//       totalWashReceived: workOrder.totalWashReceived || 0,
//       orderQuantity: workOrder.orderQuantity || 0,
//       availableForDelivery: Math.max(0, (workOrder.totalWashReceived || 0) - stageDelivered),
//       availableForReceive: Math.max(0, (workOrder.orderQuantity || 0) - stageReceived),
//     };
//   };

//   // Setup user stage access
//   useEffect(() => {
//     if (isAdmin()) {
//       return;
//     }

//     try {
//       const firstStageAccess = getFirstStageAccess();
      
//       if (!firstStageAccess) {
//         toast.error('No process stage access assigned');
//         setSetupDone(true);
//         return;
//       }

//       if (!firstStageAccess.canView) {
//         toast.error('You do not have view access to assigned stage');
//         setSetupDone(true);
//         return;
//       }

//       setUserStageAccess(firstStageAccess);

//       if (stages.length > 0) {
//         const matchingStage = stages.find(s => s.id === firstStageAccess.processStageId);
        
//         if (matchingStage) {
//           setSelectedStage(matchingStage.id);
//           setSetupDone(true);
//         } else {
//           toast.error(`Process stage not found`);
//           setSetupDone(true);
//         }
//       }
//     } catch (error) {
//       console.error('Error setting up user stage access:', error);
//       toast.error('Failed to setup user access');
//       setSetupDone(true);
//     }
//   }, [stages, getFirstStageAccess, isAdmin]);

//   // Fetch Work Orders with Pagination
//   useEffect(() => {
//     const fetchWorkOrders = async () => {
//       try {
//         setLoading(true);
//         const response = await workOrderApi.getPaginated({
//           page: currentPage,
//           pageSize: pageSize,
//           searchTerm: searchQuery,
//           sortBy: sortBy,
//           sortOrder: sortOrder,
//         });

//         if (response.data.success) {
//           setWorkOrders(response.data.data || []);
//           setTotalRecords(response.data.pagination.totalRecords);
//           setTotalPages(response.data.pagination.totalPages);
//         }
//       } catch (error) {
//         toast.error('Failed to load work orders');
//         setWorkOrders([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (step === 2) {
//       fetchWorkOrders();
//     }
//   }, [currentPage, pageSize, searchQuery, sortBy, sortOrder, step]);

//   const handleTypeSelect = (type) => {
//     if (!userStageAccess?.canView) {
//       toast.error(`You don't have access to ${userStageAccess?.processStageName}`);
//       return;
//     }

//     setIsLoadingStep2(true);
    
//     setTimeout(() => {
//       setTransactionType(type);
//       setStep(2);
//       setSearchQuery('');
//       setSelectedRows({});
//       setActiveTab('workOrders');
//       setCurrentPage(1);  
//       setIsLoadingStep2(false);
//     }, 800);
//   };

//   // ✅ CORRECTED: handleQuantityChange with proper validation
//   const handleQuantityChange = (workOrderId, quantity) => {
//     const workOrder = workOrders.find(wo => wo.id === workOrderId);
    
//     if (quantity === '' || parseInt(quantity) <= 0) {
//       const newRows = { ...selectedRows };
//       delete newRows[workOrderId];
//       setSelectedRows(newRows);
//       return;
//     }

//     const enteredQty = parseInt(quantity);
//     const summary = getStageTransactionSummary(workOrderId);
//     const availableQty = getAvailableQuantity(workOrderId);

//     if (transactionType === 'delivery') {
//       // ✅ For Delivery: Check against (totalWashReceived - stageDelivered)
//       if (enteredQty > availableQty) {
//         toast.error(
//           `ডেলিভারি সীমা অতিক্রম! 
// স্টেজ: ${summary?.stageName || 'Unknown'}
// মোট ওয়াশ রিসিভড: ${summary?.totalWashReceived?.toLocaleString() || 0}
// এই স্টেজে ডেলিভারড: ${summary?.stageDelivered?.toLocaleString() || 0}
// ডেলিভারি করা যাবে: ${availableQty.toLocaleString()}`
//         );
//         return;
//       }
//     } else {
//       // ✅ For Receive: Check against (orderQuantity - stageReceived)
//       if (enteredQty > availableQty) {
//         toast.error(
//           `রিসিভ সীমা অতিক্রম! 
// স্টেজ: ${summary?.stageName || 'Unknown'}
// অর্ডার কোয়ান্টিটি: ${summary?.orderQuantity?.toLocaleString() || 0}
// এই স্টেজে রিসিভড: ${summary?.stageReceived?.toLocaleString() || 0}
// রিসিভ করা যাবে: ${availableQty.toLocaleString()}`
//         );
//         return;
//       }
//     }

//     setSelectedRows({
//       ...selectedRows,
//       [workOrderId]: enteredQty,
//     });
//   };

//   const handleRemoveRow = (workOrderId) => {
//     const newRows = { ...selectedRows };
//     delete newRows[workOrderId];
//     setSelectedRows(newRows);
//   };

//   const handleSave = async () => {
//     if (!selectedStage) {
//       toast.error('Process stage not configured');
//       return;
//     }

//     if (!userStageAccess?.canView) {
//       toast.error('You do not have permission to perform this action');
//       return;
//     }

//     const selectedWorkOrderIds = Object.keys(selectedRows);
//     if (selectedWorkOrderIds.length === 0) {
//       toast.error('Please add at least one transaction');
//       return;
//     }

//     try {
//       setIsSaving(true);

//       const results = await Promise.all(
//         selectedWorkOrderIds.map(workOrderId =>
//           transactionType === 'receive'
//             ? washTransactionApi.createReceive({
//                 workOrderId: parseInt(workOrderId),
//                 processStageId: selectedStage,
//                 quantity: selectedRows[workOrderId],
//                 transactionType: 1,
//                 transactionDate: new Date().toISOString().split('T')[0],
//               })
//             : washTransactionApi.createDelivery({
//                 workOrderId: parseInt(workOrderId),
//                 processStageId: selectedStage,
//                 quantity: selectedRows[workOrderId],
//                 transactionType: 2,
//                 transactionDate: new Date().toISOString().split('T')[0],
//               })
//         )
//       );

//       const successCount = results.filter(r => r.data?.success).length;
//       const failureCount = results.length - successCount;

//       if (successCount > 0) {
//         toast.success(
//           `${successCount} transaction${successCount !== 1 ? 's' : ''} created successfully${
//             failureCount > 0 ? `, ${failureCount} failed` : ''
//           }`
//         );
//         setStep(1);
//         setTransactionType(null);
//         setSearchQuery('');
//         setSelectedRows({});
//         setActiveTab('workOrders');
//         setCurrentPage(1);
//       }
//     } catch (error) {
//       toast.error('Error creating transactions');
//       console.error('Error:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Pagination Handlers
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   const handlePageSizeChange = (e) => {
//     setPageSize(parseInt(e.target.value));
//     setCurrentPage(1);
//   };

//   // Search Handler
//   const handleSearchChange = (value) => {
//     setSearchQuery(value);
//     setCurrentPage(1);
//   };

//   const stageName = stages.find(s => s.id === selectedStage)?.name;
//   const selectedCount = Object.keys(selectedRows).length;
//   const totalQuantity = Object.values(selectedRows).reduce((sum, qty) => sum + qty, 0);
//   const selectedWorkOrders = workOrders.filter(wo => selectedRows[wo.id]);

//   // Loading states
//   if (!setupDone) {
//     return (
//       <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (isLoadingStep2) {
//     return (
//       <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <LoadingSpinner size="lg" />
//           <p className="text-gray-600 mt-4 font-semibold">Please Wait...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!userStageAccess || !userStageAccess.canView) {
//     return (
//       <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
//           <div className="mb-4 flex justify-center">
//             <div className="p-4 bg-red-100 rounded-full">
//               <Lock className="text-red-600" style={{ fontSize: 40 }} />
//             </div>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
//           <p className="text-gray-600">
//             You don't have permission to access this page.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-gray-50 overflow-hidden rounded-xl shadow-md">
//       {step === 1 ? (
//         // Step 1: Select Transaction Type
//         <div className="h-screen min-h-[550px] flex flex-col bg-white">
//           <div className="flex-1 px-6 pb-6 space-y-8 flex flex-col justify-center items-center">
//             <button
//               onClick={() => handleTypeSelect('delivery')}
//               className="flex flex-col items-center justify-center p-8 w-48 h-48 bg-red-50 border-2 border-red-200 rounded-full hover:border-red-500 hover:bg-red-100 transition duration-300 group text-center shadow-lg hover:shadow-xl cursor-pointer"
//             >
//               <UpArrowIcon className="text-red-600 mb-1 w-24 h-24" />
//               <h3 className="text-lg font-bold text-red-700">Delivery</h3>
//             </button>

//             <button
//               onClick={() => handleTypeSelect('receive')}
//               className="flex flex-col items-center justify-center p-8 w-48 h-48 bg-green-50 border-2 border-green-200 rounded-full hover:border-green-500 hover:bg-green-100 transition duration-300 group text-center shadow-lg hover:shadow-xl cursor-pointer"
//             >
//               <DownArrowIcon className="text-green-600 mb-1 w-24 h-24" />
//               <h3 className="text-lg font-bold text-green-700">RECEIVE</h3>
//             </button>
//           </div>
//         </div>
//       ) : (
//         // Step 2: Work Orders List
//         <div className="min-h-[550px] flex flex-col">
//           {/* Header */}
//           <div className="px-6 pt-4 pb-2 flex-shrink-0">
//             <div className="flex items-center justify-between mb-3">
//               <button
//                 onClick={() => setStep(1)}
//                 className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200 text-sm font-medium"
//               >
//                 ← Back
//               </button>
//               <div className="text-right">
//                 <h1 className="text-xl font-bold text-gray-800">
//                   {transactionType === 'receive' ? 'Receive' : 'Delivery'} Transactions
//                 </h1>
//                 <div className="flex items-center gap-2 mt-1 justify-end">
//                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
//                     {stageName}
//                   </span>
//                   {transactionsLoading && (
//                     <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold animate-pulse">
//                       Loading...
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Tabs */}
//             <div className="flex border-b border-gray-200">
//               <button
//                 onClick={() => setActiveTab('workOrders')}
//                 className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 transition duration-200 ${
//                   activeTab === 'workOrders'
//                     ? 'border-primary-500 text-primary-700'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Work Orders ({totalRecords})
//               </button>
//               <button
//                 onClick={() => setActiveTab('selected')}
//                 className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 transition duration-200 ${
//                   activeTab === 'selected'
//                     ? 'border-primary-500 text-primary-700'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Selected ({selectedCount})
//               </button>
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="flex-1 overflow-hidden">
//             {/* Work Orders Tab */}
//             {activeTab === 'workOrders' && (
//               <div className="h-full flex flex-col p-4 pt-2">
//                 {/* Search Bar */}
//                 <div className="mb-3 relative">
//                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 14 }} />
//                   <input
//                     type="text"
//                     placeholder="Search WO No, Style, Buyer, Color..."
//                     value={searchQuery}
//                     onChange={(e) => handleSearchChange(e.target.value)}
//                     className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 text-sm"
//                   />
//                 </div>

//                 {/* Work Orders Table */}
//                 <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white">
//                   {loading || transactionsLoading ? (
//                     <div className="flex items-center justify-center h-32">
//                       <LoadingSpinner size="md" />
//                     </div>
//                   ) : workOrders.length === 0 ? (
//                     <div className="flex items-center justify-center h-32">
//                       <EmptyState 
//                         title="No Work Orders"
//                         description="No work orders found matching your search"
//                       />
//                     </div>
//                   ) : (
//                     <div className="h-full max-h-[280px] overflow-y-auto scrollbar-hide">
//                       <table className="w-full text-sm">
//                         <thead className="bg-blue-100 border border-blue-100 sticky top-0 text-blue-700">
//                           <tr>
//                             <th className="px-3 py-2 text-left font-semibold text-xs">WO No</th>
//                             <th className="px-3 py-2 text-left font-semibold text-xs">Style</th>
//                             <th className="px-3 py-2 text-left font-semibold text-xs">Order Qty
//                               {/* {transactionType === 'delivery' ? 'Wash Rcv' : 'Order Qty'} */}
//                             </th>
//                             <th className="px-3 py-2 text-center font-semibold text-xs">Add Qty</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200 border border-blue-100">
//                           {workOrders.map((wo) => {
//                             const hasQuantity = selectedRows[wo.id];
//                             const availableQty = getAvailableQuantity(wo.id);
//                             const summary = getStageTransactionSummary(wo.id);
                            
//                             return (
//                               <tr
//                                 key={wo.id}
//                                 className={`hover:bg-gray-50 transition duration-150 ${
//                                   hasQuantity ? 'bg-green-50' : ''
//                                 } ${availableQty <= 0 ? 'bg-red-50 opacity-60' : ''}`}
//                               >
//                                 <td className="px-3 py-2">
//                                   <div>
//                                     <div className="font-semibold text-gray-800 text-xs break-words">
//                                       {wo.workOrderNo}
//                                     </div>
//                                     <div className="text-xs text-gray-500 break-words">
//                                       {wo.fastReactNo || '-'}
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td className="px-3 py-2"> 
//                                   <div className="text-xs font-medium text-gray-700">{wo.styleName}</div>
//                                   <div className="text-xs text-gray-500">{wo.marks || '-'}</div>
//                                 </td>
//                                 <td className="px-3 py-2">
//                                   <div className="font-semibold text-gray-800 text-xs">
//                                     {/* {transactionType === 'delivery' 
//                                       ? (wo.totalWashReceived || 0).toLocaleString()
//                                       : wo.orderQuantity.toLocaleString()
//                                     } */}
//                                     {wo.orderQuantity.toLocaleString()}
//                                   </div>
//                                   {/* Stage summary */}
//                                   {summary && (
//                                     <div className="text-xs mt-1">
//                                       {transactionType === 'delivery' ? (
//                                         <span className="text-orange-600" title={`${stageName} এ Delivered`}>
//                                           TWR:{wo.totalWashReceived} Del:{summary.stageDelivered.toLocaleString()}
//                                         </span>
//                                       ) : (
//                                         <span className="text-green-600" title={`${stageName} এ Received`}>
//                                           TWR:{wo.totalWashReceived} Rcv: {summary.stageReceived.toLocaleString()}
//                                         </span>
//                                       )}
//                                     </div>
//                                   )}
//                                 </td>
//                                 <td className="px-3 py-2">
//                                   <div className="flex flex-col items-center gap-1">
//                                     {/* Available quantity badge */}
//                                     <div className={`text-xs font-semibold ${
//                                       availableQty > 0 
//                                         ? transactionType === 'delivery' ? 'text-green-600' : 'text-blue-600'
//                                         : 'text-red-500'
//                                     }`}>
//                                       {availableQty > 0 
//                                         ? `Avl: ${availableQty.toLocaleString()}` 
//                                         : 'No Stock'}
//                                     </div>
                                    
//                                     {availableQty > 0 ? (
//                                       <div className="flex items-center gap-1">
//                                         <input
//                                           type="number"
//                                           value={selectedRows[wo.id] || ''}
//                                           onChange={(e) => handleQuantityChange(wo.id, e.target.value)}
//                                           placeholder="0"
//                                           min="1"
//                                           max={availableQty}
//                                           className="w-16 px-2 py-1.5 border-2 border-blue-400 rounded outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition duration-200 text-center text-xs font-bold text-blue-700 bg-blue-50"
//                                         />
//                                         {hasQuantity && (
//                                           <button
//                                             onClick={() => handleRemoveRow(wo.id)}
//                                             className="p-1.5 text-red-600 hover:bg-red-100 rounded transition shadow-md"
//                                           >
//                                             <X style={{ fontSize: 16 }} />
//                                           </button>
//                                         )}
//                                       </div>
//                                     ) : (
//                                       <span className="text-xs text-red-400 italic">
//                                         {transactionType === 'delivery' ? 'সব ডেলিভারি হয়েছে' : 'সব রিসিভ হয়েছে'}
//                                       </span>
//                                     )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>

//                 {/* Pagination Controls */}
//                 {!loading && workOrders.length > 0 && (
//                   <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
//                     {/* Page Size Selector */}
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs text-gray-600 font-medium">Show:</span>
//                       <select
//                         value={pageSize}
//                         onChange={handlePageSizeChange}
//                         className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
//                       >
//                         <option value={5}>5</option>
//                         <option value={10}>10</option>
//                         <option value={25}>25</option>
//                         <option value={50}>50</option>
//                       </select>
//                       <span className="text-xs text-gray-600">
//                         of {totalRecords} records
//                       </span>
//                     </div>

//                     {/* Pagination Buttons */}
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => handlePageChange(1)}
//                         disabled={currentPage === 1}
//                         className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                         title="First Page"
//                       >
//                         <FirstPage style={{ fontSize: 18 }} />
//                       </button>
//                       <button
//                         onClick={() => handlePageChange(currentPage - 1)}
//                         disabled={currentPage === 1}
//                         className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                         title="Previous Page"
//                       >
//                         <KeyboardArrowLeft style={{ fontSize: 18 }} />
//                       </button>

//                       <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded font-semibold text-xs">
//                         {currentPage} / {totalPages}
//                       </span>

//                       <button
//                         onClick={() => handlePageChange(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                         className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                         title="Next Page"
//                       >
//                         <KeyboardArrowRight style={{ fontSize: 18 }} />
//                       </button>
//                       <button
//                         onClick={() => handlePageChange(totalPages)}
//                         disabled={currentPage === totalPages}
//                         className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
//                         title="Last Page"
//                       >
//                         <LastPage style={{ fontSize: 18 }} />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Selected Tab */}
//             {activeTab === 'selected' && (
//               <div className="h-full flex flex-col p-4 pt-2">
//                 {/* Summary Cards */}
//                 <div className="grid grid-cols-2 gap-3 mb-3">
//                   <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//                     <p className="text-xs text-blue-600 font-semibold mb-1">Selected Items</p>
//                     <p className="text-lg font-bold text-blue-900">{selectedCount}</p>
//                   </div>
//                   <div className="p-3 bg-green-50 rounded-lg border border-green-200">
//                     <p className="text-xs text-green-600 font-semibold mb-1">Total Quantity</p>
//                     <p className="text-lg font-bold text-green-900">{totalQuantity.toLocaleString()}</p>
//                   </div>
//                 </div>

//                 {/* Selected Items Table */}
//                 <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white">
//                   {selectedCount === 0 ? (
//                     <div className="flex flex-col items-center justify-center h-32 text-gray-500">
//                       <Remove style={{ fontSize: 32, marginBottom: 8 }} />
//                       <p className="text-sm font-medium">No items selected</p>
//                       <p className="text-xs">Go to Work Orders tab to add items</p>
//                     </div>
//                   ) : (
//                     <div className="h-full max-h-[200px] overflow-y-auto scrollbar-hide">
//                       <table className="w-full text-sm">
//                         <thead className="bg-blue-100 border-b border-gray-200 sticky top-0">
//                           <tr>
//                             <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">WO No</th>
//                             <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Style</th>
//                             <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Quantity</th>
//                             <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Action</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200">
//                           {selectedWorkOrders.map((wo) => (
//                             <tr key={wo.id} className="hover:bg-gray-50">
//                               <td className="px-3 py-2">
//                                 <div className="font-semibold text-gray-800 text-xs">{wo.workOrderNo}</div>
//                               </td>
//                               <td className="px-3 py-2">
//                                 <div className="text-xs text-gray-700">{wo.styleName}</div>
//                               </td>
//                               <td className="px-3 py-2 text-center">
//                                 <span className="font-bold text-green-700 text-xs">
//                                   {selectedRows[wo.id].toLocaleString()}
//                                 </span>
//                               </td>
//                               <td className="px-3 py-2 text-center">
//                                 <button
//                                   onClick={() => handleRemoveRow(wo.id)}
//                                   className="p-1 text-red-600 hover:bg-red-100 rounded transition"
//                                 >
//                                   <X style={{ fontSize: 16 }} />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>

//                 {/* Save Button */}
//                 {selectedCount > 0 && (
//                   <div className="mt-3">
//                     <button
//                       onClick={handleSave}
//                       disabled={isSaving}
//                       className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
//                     >
//                       {isSaving ? (
//                         <>
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                           <span>Saving {selectedCount} items...</span>
//                         </>
//                       ) : (
//                         <>
//                           <Save style={{ fontSize: 18 }} />
//                           <span>Save {selectedCount} {transactionType} Transaction(s)</span>
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Custom Scrollbar Styles */}
//       <style jsx>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default UserTransactionPage;

// import { useState, useEffect } from 'react';
// import { useProcessStage } from '../../hooks/useProcessStage';
// import { useAuth } from '../../hooks/useAuth';
// import { workOrderApi } from '../../api/workOrderApi';
// import { washTransactionApi } from '../../api/washTransactionApi';
// import LoadingSpinner from '../common/LoadingSpinner';
// import EmptyState from '../common/EmptyState';
// import toast from 'react-hot-toast';
// import { Search, Save, SwapHoriz, LocalShipping, X, Remove, Info, Lock } from '@mui/icons-material'; 

// const UserTransactionPage = () => {
//   const { stages, loading: stagesLoading } = useProcessStage();
//   const { getFirstStageAccess, isAdmin } = useAuth();  
  
//   const [step, setStep] = useState(1);
//   const [transactionType, setTransactionType] = useState(null);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [userStageAccess, setUserStageAccess] = useState(null);
//   const [setupDone, setSetupDone] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [workOrders, setWorkOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedRows, setSelectedRows] = useState({});
//   const [isSaving, setIsSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState('workOrders');
//   const [isLoadingStep2, setIsLoadingStep2] = useState(false);  // ✅ ADD THIS

//   const UpArrowIcon = ({ className, ...props }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} fill="currentColor" {...props}>
//       <path d="M50 25 L75 50 L62 50 L62 75 L38 75 L38 50 L25 50 Z" />
//     </svg>
//   );

//   const DownArrowIcon = ({ className, ...props }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} fill="currentColor" {...props}>
//       <path transform="rotate(180 50 50)" d="M50 25 L75 50 L62 50 L62 75 L38 75 L38 50 L25 50 Z" />
//     </svg>
//   );

//   useEffect(() => {
//     if (isAdmin()) {
//       return;
//     }

//     try {
//       const firstStageAccess = getFirstStageAccess();
      
//       if (!firstStageAccess) {
//         toast.error('No process stage access assigned');
//         setSetupDone(true);
//         return;
//       }

//       if (!firstStageAccess.canView) {
//         toast.error('You do not have view access to assigned stage');
//         setSetupDone(true);
//         return;
//       }

//       setUserStageAccess(firstStageAccess);

//       if (stages.length > 0) {
//         const matchingStage = stages.find(s => s.id === firstStageAccess.processStageId);
        
//         if (matchingStage) {
//           setSelectedStage(matchingStage.id);
//           setSetupDone(true);
//         } else {
//           toast.error(`Process stage not found`);
//           setSetupDone(true);
//         }
//       }
//     } catch (error) {
//       console.error('Error setting up user stage access:', error);
//       toast.error('Failed to setup user access');
//       setSetupDone(true);
//     }
//   }, [stages, getFirstStageAccess, isAdmin]);

//   useEffect(() => {
//     const fetchWorkOrders = async () => {
//       try {
//         setLoading(true);
//         const response = await workOrderApi.getAll();
//         if (response.data.success) {
//           setWorkOrders(response.data.data || []);
//         }
//       } catch (error) {
//         toast.error('Failed to load work orders');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchWorkOrders();
//   }, []);

//   const filteredWorkOrders = workOrders.filter(wo => {
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       wo.workOrderNo?.toLowerCase().includes(searchLower) ||
//       wo.styleName?.toLowerCase().includes(searchLower) ||
//       wo.fastReactNo?.toLowerCase().includes(searchLower) ||
//       wo.buyer?.toLowerCase().includes(searchLower) ||
//       wo.marks?.toLowerCase().includes(searchLower)
//     );
//   });

//   const handleTypeSelect = (type) => {
//     if (!userStageAccess?.canView) {
//       toast.error(`You don't have access to ${userStageAccess?.processStageName}`);
//       return;
//     }

//     // ✅ Show loading spinner
//     setIsLoadingStep2(true);
    
//     // ✅ Simulate loading time then proceed
//     setTimeout(() => {
//       setTransactionType(type);
//       setStep(2);
//       setSearchQuery('');
//       setSelectedRows({});
//       setActiveTab('workOrders');
//       setIsLoadingStep2(false);
//     }, 800); // Adjust time as needed
//   };

//   // const handleQuantityChange = (workOrderId, quantity) => {
//   //   if (quantity === '' || parseInt(quantity) <= 0) {
//   //     const newRows = { ...selectedRows };
//   //     delete newRows[workOrderId];
//   //     setSelectedRows(newRows);
//   //   } else {
//   //     setSelectedRows({
//   //       ...selectedRows,
//   //       [workOrderId]: parseInt(quantity),
//   //     });
//   //   }
//   // };
// const handleQuantityChange = (workOrderId, quantity) => {
//   const workOrder = workOrders.find(wo => wo.id === workOrderId);
  
//   if (quantity === '' || parseInt(quantity) <= 0) {
//     const newRows = { ...selectedRows };
//     delete newRows[workOrderId];
//     setSelectedRows(newRows);
//   } else if (parseInt(quantity) > workOrder.totalWashReceived) {
//     // ✅ Prevent exceeding totalWashReceived
//     toast.error(`Cannot exceed total wash received: ${workOrder.totalWashReceived}`);
//   } else {
//     setSelectedRows({
//       ...selectedRows,
//       [workOrderId]: parseInt(quantity),
//     });
//   }
// };
//   const handleRemoveRow = (workOrderId) => {
//     const newRows = { ...selectedRows };
//     delete newRows[workOrderId];
//     setSelectedRows(newRows);
//   };

//   const handleSave = async () => {
//     if (!selectedStage) {
//       toast.error('Process stage not configured');
//       return;
//     }

//     if (!userStageAccess?.canView) {
//       toast.error('You do not have permission to perform this action');
//       return;
//     }

//     const selectedWorkOrderIds = Object.keys(selectedRows);
//     if (selectedWorkOrderIds.length === 0) {
//       toast.error('Please add at least one transaction');
//       return;
//     }

//     try {
//       setIsSaving(true);

//       const results = await Promise.all(
//         selectedWorkOrderIds.map(workOrderId =>
//           transactionType === 'receive'
//             ? washTransactionApi.createReceive({
//                 workOrderId: parseInt(workOrderId),
//                 processStageId: selectedStage,
//                 quantity: selectedRows[workOrderId],
//                 transactionType: 1,
//                 transactionDate: new Date().toISOString().split('T')[0],
//               })
//             : washTransactionApi.createDelivery({
//                 workOrderId: parseInt(workOrderId),
//                 processStageId: selectedStage,
//                 quantity: selectedRows[workOrderId],
//                 transactionType: 2,
//                 transactionDate: new Date().toISOString().split('T')[0],
//               })
//         )
//       );

//       const successCount = results.filter(r => r.data?.success).length;
//       const failureCount = results.length - successCount;

//       if (successCount > 0) {
//         toast.success(
//           `${successCount} transaction${successCount !== 1 ? 's' : ''} created successfully${
//             failureCount > 0 ? `, ${failureCount} failed` : ''
//           }`
//         );
//         setStep(1);
//         setTransactionType(null);
//         setSearchQuery('');
//         setSelectedRows({});
//         setActiveTab('workOrders');
//       }
//     } catch (error) {
//       toast.error('Error creating transactions');
//       console.error('Error:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const stageName = stages.find(s => s.id === selectedStage)?.name;
//   const selectedCount = Object.keys(selectedRows).length;
//   const totalQuantity = Object.values(selectedRows).reduce((sum, qty) => sum + qty, 0);

//   const selectedWorkOrders = workOrders.filter(wo => selectedRows[wo.id]);

//   // Show loading while setting up
//   if (!setupDone) {
//     return (
//       <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   // ✅ SHOW LOADING SPINNER WHEN TRANSITIONING TO STEP 2
//   if (isLoadingStep2) {
//     return (
//       <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <LoadingSpinner size="lg" />
//           <p className="text-gray-600 mt-4 font-semibold">Please Wait 
//             {/* {transactionType === 'receive' ? 'Receive' : 'Delivery'}  */}
                       
//             ...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show access denied
//   if (!userStageAccess || !userStageAccess.canView) {
//     return (
//       <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
//           <div className="mb-4 flex justify-center">
//             <div className="p-4 bg-red-100 rounded-full">
//               <Lock className="text-red-600" style={{ fontSize: 40 }} />
//             </div>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
//           <p className="text-gray-600">
//             You don't have permission to access this page.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-gray-50 overflow-hidden rounded-xl shadow-md">
//       {step === 1 ? (
//         // ===== STEP 1: CHOOSE TYPE =====
//         <div className="h-screen min-h-[550px] flex flex-col bg-white">
//           <div className="flex-1 px-6 pb-6 space-y-8 flex flex-col justify-center items-center">
//             {/* Delivery/Send Option */}
//             <button
//               onClick={() => handleTypeSelect('delivery')}
//               className="flex flex-col items-center justify-center p-8 w-48 h-48 bg-red-50 border-2 border-red-200 rounded-full hover:border-red-500 hover:bg-red-100 transition duration-300 group text-center shadow-lg hover:shadow-xl cursor-pointer"
//             >
//               <UpArrowIcon className="text-red-600 mb-1 w-24 h-24" />
//               <h3 className="text-lg font-bold text-red-700">
//                 Delivery
//               </h3>
//             </button>

//             {/* Receive Option */}
//             <button
//               onClick={() => handleTypeSelect('receive')}
//               className="flex flex-col items-center justify-center p-8 w-48 h-48 bg-green-50 border-2 border-green-200 rounded-full hover:border-green-500 hover:bg-green-100 transition duration-300 group text-center shadow-lg hover:shadow-xl cursor-pointer"
//             >
//               <DownArrowIcon className="text-green-600 mb-1 w-24 h-24" />
//               <h3 className="text-lg font-bold text-green-700">
//                 RECEIVE
//               </h3>
//             </button>
//           </div>
//         </div>
//       ) : (
//         // ===== STEP 2: TAB VIEW =====
//         <div className="min-h-[550px] flex flex-col">
//           {/* Header */}
//           <div className="px-6 pt-4 pb-2 flex-shrink-0">
//             <div className="flex items-center justify-between mb-3">
//               <button
//                 onClick={() => setStep(1)}
//                 className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200 text-sm font-medium"
//               >
//                 ← Back
//               </button>
//               <div className="text-right">
//                 <h1 className="text-xl font-bold text-gray-800">
//                   {transactionType === 'receive' ? 'Receive' : 'Delivery'} Transactions
//                 </h1>
//                 <div className="flex items-center gap-2 mt-1 justify-end">
//                   <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
//                     {stageName}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex border-b border-gray-200">
//               <button
//                 onClick={() => setActiveTab('workOrders')}
//                 className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 transition duration-200 ${
//                   activeTab === 'workOrders'
//                     ? 'border-primary-500 text-primary-700'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Work Orders ({filteredWorkOrders.length})
//               </button>
//               <button
//                 onClick={() => setActiveTab('selected')}
//                 className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 transition duration-200 ${
//                   activeTab === 'selected'
//                     ? 'border-primary-500 text-primary-700'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Selected ({selectedCount})
//               </button>
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="flex-1 overflow-hidden">
//             {activeTab === 'workOrders' && (
//               <div className="h-full flex flex-col p-4 pt-2">
//                 <div className="mb-3 relative">
//                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 14 }} />
//                   <input
//                     type="text"
//                     placeholder="Search WO No, Style, FastReact, Marks..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 text-sm"
//                   />
//                 </div>

//                 <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white">
//                   {loading ? (
//                     <div className="flex items-center justify-center h-32">
//                       <LoadingSpinner size="md" />
//                     </div>
//                   ) : filteredWorkOrders.length === 0 ? (
//                     <div className="flex items-center justify-center h-32">
//                       <EmptyState 
//                         title="No Work Orders"
//                         description="No work orders found matching your search"
//                       />
//                     </div>
//                   ) : (
//                     <div className="h-full max-h-[280px] overflow-y-auto scrollbar-hide">
//                       <table className="w-full text-sm">
//                         <thead className="bg-blue-100 border border-blue-100 sticky top-0 text-blue-700">
//                           <tr>
//                             <th className="px-3 py-2 text-left font-semibold text-xs max-w-[120px] sm:max-w-none">WO No</th>
//                             <th className="px-3 py-2 text-left font-semibold text-xs">Style</th>
//                             <th className="px-3 py-2 text-left font-semibold text-xs">Order Qty</th> 
//                             <th className="px-3 py-2 text-center font-semibold text-xs">Add Qty</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200 border border-blue-100">
//                           {filteredWorkOrders.map((wo) => {
//                             const hasQuantity = selectedRows[wo.id];
//                             return (
//                               <tr
//                                 key={wo.id}
//                                 className={`hover:bg-gray-50 transition duration-150 ${
//                                   hasQuantity ? 'bg-green-50' : ''
//                                 }`}
//                               >
//                                 <td className="px-3 py-2 max-w-[120px] sm:max-w-none">
//                                   <div>
//                                     <div className="font-semibold text-gray-800 text-xs break-words">{wo.workOrderNo}</div>
//                                     <div className="text-xs text-gray-500 break-words">{wo.fastReactNo || '-'}</div>
//                                   </div>
//                                 </td>
//                                 <td className="px-3 py-2">
//                                   <div className="text-xs font-medium text-gray-700">{wo.styleName}</div>
//                                   <div className="text-xs text-gray-500">{wo.marks || '-'}</div>
//                                 </td>
//                                 <td className="px-3 py-2">
//                                   <div className="font-semibold text-gray-800 text-xs">
//                                     {wo.orderQuantity.toLocaleString()}
//                                   </div>
//                                 </td> 
//                                 <td className="px-3 py-2">
//                                   <div className="flex items-center justify-center gap-1">
//                                     {/* <input
//                                       type="number"
//                                       value={selectedRows[wo.id] || ''}
//                                       onChange={(e) => handleQuantityChange(wo.id, e.target.value)}
//                                       placeholder="0"
//                                       min="1"
//                                       max={wo.orderQuantity}
//                                       className="w-16 px-2 py-1.5 border-2 border-blue-400 rounded outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition duration-200 text-center text-xs font-bold text-blue-700 bg-blue-50"
//                                     /> */}
//                                     <input
//   type="number"
//   value={selectedRows[wo.id] || ''}
//   onChange={(e) => handleQuantityChange(wo.id, e.target.value)}
//   placeholder="0"
//   min="1"
//   max={wo.totalWashReceived}  // ✅ Changed from wo.orderQuantity
//   className="w-16 px-2 py-1.5 border-2 border-blue-400 rounded outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition duration-200 text-center text-xs font-bold text-blue-700 bg-blue-50"
// />
//                                     {hasQuantity && (
//                                       <button
//                                         onClick={() => handleRemoveRow(wo.id)}
//                                         className="p-1.5 text-red-600 hover:bg-red-100 rounded transition shadow-md"
//                                       >
//                                         <X style={{ fontSize: 16 }} />
//                                       </button>
//                                     )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === 'selected' && (
//               <div className="h-full flex flex-col p-4 pt-2">
//                 <div className="grid grid-cols-2 gap-3 mb-3">
//                   <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//                     <p className="text-xs text-blue-600 font-semibold mb-1">Selected Items</p>
//                     <p className="text-lg font-bold text-blue-900">{selectedCount}</p>
//                   </div>
//                   <div className="p-3 bg-green-50 rounded-lg border border-green-200">
//                     <p className="text-xs text-green-600 font-semibold mb-1">Total Quantity</p>
//                     <p className="text-lg font-bold text-green-900">{totalQuantity}</p>
//                   </div>
//                 </div>

//                 <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white">
//                   {selectedCount === 0 ? (
//                     <div className="flex flex-col items-center justify-center h-32 text-gray-500">
//                       <Remove style={{ fontSize: 32, marginBottom: 8 }} />
//                       <p className="text-sm font-medium">No items selected</p>
//                       <p className="text-xs">Go to Work Orders tab to add items</p>
//                     </div>
//                   ) : (
//                     <div className="h-full max-h-[200px] overflow-y-auto scrollbar-hide">
//                       <table className="w-full text-sm">
//                         <thead className="bg-blue-100 border-b border-gray-200 sticky top-0">
//                           <tr>
//                             <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">WO No</th>
//                             <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Style</th>
//                             <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Quantity</th>
//                             <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Action</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200">
//                           {selectedWorkOrders.map((wo) => (
//                             <tr key={wo.id} className="hover:bg-gray-50">
//                               <td className="px-3 py-2">
//                                 <div className="font-semibold text-gray-800 text-xs">{wo.workOrderNo}</div>
//                               </td>
//                               <td className="px-3 py-2">
//                                 <div className="text-xs text-gray-700">{wo.styleName}</div>
//                               </td>
//                               <td className="px-3 py-2 text-center">
//                                 <span className="font-bold text-green-700 text-xs">
//                                   {selectedRows[wo.id].toLocaleString()}
//                                 </span>
//                               </td>
//                               <td className="px-3 py-2 text-center">
//                                 <button
//                                   onClick={() => handleRemoveRow(wo.id)}
//                                   className="p-1 text-red-600 hover:bg-red-100 rounded transition"
//                                 >
//                                   <X style={{ fontSize: 16 }} />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>

//                 {selectedCount > 0 && (
//                   <div className="mt-3">
//                     <button
//                       onClick={handleSave}
//                       disabled={isSaving}
//                       className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
//                     >
//                       {isSaving ? (
//                         <>
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                           <span>Saving {selectedCount} items...</span>
//                         </>
//                       ) : (
//                         <>
//                           <Save style={{ fontSize: 18 }} />
//                           <span>Save {selectedCount} {transactionType} Transaction(s)</span>
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default UserTransactionPage;