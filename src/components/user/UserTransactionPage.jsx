// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\user\UserTransactionPage.jsx
import { useState, useEffect } from 'react';
import { useProcessStage } from '../../hooks/useProcessStage';
import { useAuth } from '../../hooks/useAuth';
import { workOrderApi } from '../../api/workOrderApi';
import { washTransactionApi } from '../../api/washTransactionApi';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { Search, Save, SwapHoriz, LocalShipping, X, Remove, Info, Lock } from '@mui/icons-material'; 
const UserTransactionPage = () => {
  const { stages, loading: stagesLoading } = useProcessStage();
  const { getFirstStageAccess, isAdmin } = useAuth();  // ✅ Add isAdmin
  
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
  // ✅ Auto-select stage based on user's process stage access
  useEffect(() => {
    if (isAdmin()) {
      // Admin doesn't use this page
      return;
    }

    try {
      const firstStageAccess = getFirstStageAccess();
      
      console.log('First Stage Access:', firstStageAccess);
      console.log('All Stages:', stages);

      if (!firstStageAccess) {
        toast.error('No process stage access assigned');
        setSetupDone(true);
        return;
      }

      if (!firstStageAccess.canView) {
        toast.error('You do not have view access to assigned stage');
        setSetupDone(true);
        return;
      }

      setUserStageAccess(firstStageAccess);

      // Find matching process stage by ID
      if (stages.length > 0) {
        const matchingStage = stages.find(s => s.id === firstStageAccess.processStageId);
        console.log('Matching Stage:', matchingStage);
        
        if (matchingStage) {
          setSelectedStage(matchingStage.id);
          setSetupDone(true);
        } else {
          toast.error(`Process stage not found`);
          setSetupDone(true);
        }
      }
    } catch (error) {
      console.error('Error setting up user stage access:', error);
      toast.error('Failed to setup user access');
      setSetupDone(true);
    }
  }, [stages, getFirstStageAccess, isAdmin]);

  // Fetch work orders
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const response = await workOrderApi.getAll();
        if (response.data.success) {
          setWorkOrders(response.data.data || []);
        }
      } catch (error) {
        toast.error('Failed to load work orders');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkOrders();
  }, []);

  const filteredWorkOrders = workOrders.filter(wo => {
    const searchLower = searchQuery.toLowerCase();
    return (
      wo.workOrderNo?.toLowerCase().includes(searchLower) ||
      wo.styleName?.toLowerCase().includes(searchLower) ||
      wo.fastReactNo?.toLowerCase().includes(searchLower) ||
      wo.buyer?.toLowerCase().includes(searchLower) ||
      wo.marks?.toLowerCase().includes(searchLower)
    );
  });

  const handleTypeSelect = (type) => {
    if (!userStageAccess?.canView) {
      toast.error(`You don't have access to ${userStageAccess?.processStageName}`);
      return;
    }

    setTransactionType(type);
    setStep(2);
    setSearchQuery('');
    setSelectedRows({});
    setActiveTab('workOrders');
  };

  const handleQuantityChange = (workOrderId, quantity) => {
    if (quantity === '' || parseInt(quantity) <= 0) {
      const newRows = { ...selectedRows };
      delete newRows[workOrderId];
      setSelectedRows(newRows);
    } else {
      setSelectedRows({
        ...selectedRows,
        [workOrderId]: parseInt(quantity),
      });
    }
  };

  const handleRemoveRow = (workOrderId) => {
    const newRows = { ...selectedRows };
    delete newRows[workOrderId];
    setSelectedRows(newRows);
  };

  const handleSave = async () => {
    if (!selectedStage) {
      toast.error('Process stage not configured');
      return;
    }

    if (!userStageAccess?.canView) {
      toast.error('You do not have permission to perform this action');
      return;
    }

    const selectedWorkOrderIds = Object.keys(selectedRows);
    if (selectedWorkOrderIds.length === 0) {
      toast.error('Please add at least one transaction');
      return;
    }

    try {
      setIsSaving(true);

      const results = await Promise.all(
        selectedWorkOrderIds.map(workOrderId =>
          transactionType === 'receive'
            ? washTransactionApi.createReceive({
                workOrderId: parseInt(workOrderId),
                processStageId: selectedStage,
                quantity: selectedRows[workOrderId],
                transactionType: 1,
                transactionDate: new Date().toISOString().split('T')[0],
              })
            : washTransactionApi.createDelivery({
                workOrderId: parseInt(workOrderId),
                processStageId: selectedStage,
                quantity: selectedRows[workOrderId],
                transactionType: 2,
                transactionDate: new Date().toISOString().split('T')[0],
              })
        )
      );

      const successCount = results.filter(r => r.data?.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          `${successCount} transaction${successCount !== 1 ? 's' : ''} created successfully${
            failureCount > 0 ? `, ${failureCount} failed` : ''
          }`
        );
        setStep(1);
        setTransactionType(null);
        setSearchQuery('');
        setSelectedRows({});
        setActiveTab('workOrders');
      }
    } catch (error) {
      toast.error('Error creating transactions');
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const stageName = stages.find(s => s.id === selectedStage)?.name;
  const selectedCount = Object.keys(selectedRows).length;
  const totalQuantity = Object.values(selectedRows).reduce((sum, qty) => sum + qty, 0);

  const selectedWorkOrders = workOrders.filter(wo => selectedRows[wo.id]);

  // Show loading while setting up
  if (!setupDone) {
    return (
      <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show access denied
  if (!userStageAccess || !userStageAccess.canView) {
    return (
      <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-red-100 rounded-full">
              <Lock className="text-red-600" style={{ fontSize: 40 }} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 overflow-hidden rounded-xl shadow-md">
      {step === 1 ? (
        // ===== STEP 1: CHOOSE TYPE =====
     <div className="h-screen min-h-[550px] flex flex-col bg-white">
      {/* <div className="px-6 pt-2 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mt-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            📦 {userStageAccess?.processStageName}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            ✓ Can Access
          </span>
        </div>
      </div> */}

  <div className="flex-1 px-6 pb-6 space-y-8 flex flex-col justify-center items-center">
    
     <div className="flex-1 px-6 pb-6 space-y-8 flex flex-col justify-center items-center">
    
    {/* Delivery/Send Option - Big Circle (Light Red) */}
    <button
      onClick={() => handleTypeSelect('delivery')}
      className="flex flex-col items-center justify-center p-8 w-48 h-48 bg-red-50 border-2 border-red-200 rounded-full hover:border-red-500 hover:bg-red-100 transition duration-300 group text-center shadow-lg hover:shadow-xl cursor-pointer"
    >
      {/* Change: Icon size increased from w-16 h-16 to w-24 h-24 */}
      <UpArrowIcon className="text-red-600 mb-1 w-24 h-24" />
      
      {/* Change: Text size decreased from text-2xl to text-xl */}
      <h3 className="text-lg font-bold text-red-700">
        Delivery
      </h3>
    </button>

    {/* Receive Option - Big Circle (Light Green) */}
    <button
      onClick={() => handleTypeSelect('receive')}
      className="flex flex-col items-center justify-center p-8 w-48 h-48 bg-green-50 border-2 border-green-200 rounded-full hover:border-green-500 hover:bg-green-100 transition duration-300 group text-center shadow-lg hover:shadow-xl cursor-pointer"
    >
      {/* Change: Icon size increased from w-16 h-16 to w-24 h-24 */}
      <DownArrowIcon className="text-green-600 mb-1 w-24 h-24" />

      {/* Change: Text size decreased from text-2xl to text-xl */}
      <h3 className="text-lg font-bold text-green-700">
        RECEIVE
      </h3>
    </button>

  </div>

  </div>
    </div>
      ) : (
        // ===== STEP 2: TAB VIEW ===== (same as before - copy from previous code)
        <div className="min-h-[550px] flex flex-col">
          {/* Header */}
          <div className="px-6 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setStep(1)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200 text-sm font-medium"
              >
                ← Back
              </button>
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-800">
                  {transactionType === 'receive' ? 'Receive' : 'Delivery'} Transactions
                </h1>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    {stageName}
                  </span>
                </div>
              </div>
            </div>

             

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('workOrders')}
                className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 transition duration-200 ${
                  activeTab === 'workOrders'
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Work Orders ({filteredWorkOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('selected')}
                className={`flex-1 px-4 py-2 text-sm font-semibold border-b-2 transition duration-200 ${
                  activeTab === 'selected'
                    ? 'border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Selected ({selectedCount})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'workOrders' && (
              <div className="h-full flex flex-col p-4 pt-2">
                <div className="mb-3 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
                  <input
                    type="text"
                    placeholder="Search WO No, Style, FastReact, Marks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 text-sm"
                  />
                </div>

                <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : filteredWorkOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <EmptyState 
                        title="No Work Orders"
                        description="No work orders found matching your search"
                      />
                    </div>
                  ) : (
                    <div className="h-full max-h-[280px] overflow-y-auto scrollbar-hide">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">WO No</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Style</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Order Qty</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Add Qty</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredWorkOrders.map((wo) => {
                            const hasQuantity = selectedRows[wo.id];
                            return (
                              <tr
                                key={wo.id}
                                className={`hover:bg-gray-50 transition duration-150 ${
                                  hasQuantity ? 'bg-green-50' : ''
                                }`}
                              >
                                <td className="px-3 py-2">
                                  <div>
                                    <div className="font-semibold text-gray-800 text-xs">{wo.workOrderNo}</div>
                                    <div className="text-xs text-gray-500">{wo.fastReactNo || '-'}</div>
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs font-medium text-gray-700">{wo.styleName}</div>
                                  <div className="text-xs text-gray-500">{wo.buyer || '-'}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="font-semibold text-gray-800 text-xs">
                                    {wo.orderQuantity.toLocaleString()}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      value={selectedRows[wo.id] || ''}
                                      onChange={(e) => handleQuantityChange(wo.id, e.target.value)}
                                      placeholder="0"
                                      min="1"
                                      max={wo.orderQuantity}
                                      className="w-16 px-2 py-1 border border-gray-300 rounded outline-none focus:border-primary-500 transition duration-200 text-center text-xs font-semibold"
                                    />
                                    {hasQuantity && (
                                      <button
                                        onClick={() => handleRemoveRow(wo.id)}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                                      >
                                        <X style={{ fontSize: 16 }} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-700 max-h-12 overflow-hidden">
                                    {wo.marks || '-'}
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
              </div>
            )}

            {activeTab === 'selected' && (
              <div className="h-full flex flex-col p-4 pt-2">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Selected Items</p>
                    <p className="text-lg font-bold text-blue-900">{selectedCount}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-semibold mb-1">Total Quantity</p>
                    <p className="text-lg font-bold text-green-900">{totalQuantity}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white">
                  {selectedCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                      <Remove style={{ fontSize: 32, marginBottom: 8 }} />
                      <p className="text-sm font-medium">No items selected</p>
                      <p className="text-xs">Go to Work Orders tab to add items</p>
                    </div>
                  ) : (
                    <div className="h-full max-h-[200px] overflow-y-auto scrollbar-hide">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">WO No</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Style</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Quantity</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedWorkOrders.map((wo) => (
                            <tr key={wo.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <div className="font-semibold text-gray-800 text-xs">{wo.workOrderNo}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-700">{wo.styleName}</div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="font-bold text-green-700 text-xs">
                                  {selectedRows[wo.id].toLocaleString()}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveRow(wo.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                                >
                                  <X style={{ fontSize: 16 }} />
                                </button>
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
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving {selectedCount} items...</span>
                        </>
                      ) : (
                        <>
                          <Save style={{ fontSize: 18 }} />
                          <span>Save {selectedCount} {transactionType} Transaction(s)</span>
                        </>
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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default UserTransactionPage;