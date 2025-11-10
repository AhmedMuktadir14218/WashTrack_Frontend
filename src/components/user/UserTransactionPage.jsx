import { useState, useEffect } from 'react';
import { useProcessStage } from '../../hooks/useProcessStage';
import { workOrderApi } from '../../api/workOrderApi';
import { washTransactionApi } from '../../api/washTransactionApi';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { Search, Save, Delete, SwapHoriz, LocalShipping, X, Remove, Info } from '@mui/icons-material';

const UserTransactionPage = () => {
  const { stages, loading: stagesLoading } = useProcessStage();
  const [step, setStep] = useState(1);
  const [transactionType, setTransactionType] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('workOrders');
  const [showMarks, setShowMarks] = useState({});

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
    setTransactionType(type);
    setStep(2);
    setSelectedStage(null);
    setSearchQuery('');
    setSelectedRows({});
    setActiveTab('workOrders');
    setShowMarks({});
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

  const toggleMarks = (workOrderId) => {
    setShowMarks(prev => ({
      ...prev,
      [workOrderId]: !prev[workOrderId]
    }));
  };

  const handleSave = async () => {
    if (!selectedStage) {
      toast.error('Please select a process stage');
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
        setSelectedStage(null);
        setSearchQuery('');
        setSelectedRows({});
        setActiveTab('workOrders');
        setShowMarks({});
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

  return (
    <div className="w-full h-[550px] bg-gray-50 overflow-hidden">
      {step === 1 ? (
        // ===== STEP 1: CHOOSE TYPE =====
        <div className="h-full flex flex-col">
          <div className="px-6 pt-6 pb-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Create Transaction
            </h1>
            <p className="text-sm text-gray-600">
              Select transaction type
            </p>
          </div>

          <div className="flex-1 px-6 pb-6 space-y-4">
            {/* Receive Option */}
            <button
              onClick={() => handleTypeSelect('receive')}
              className="w-full p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition duration-300 group text-left shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition duration-200">
                  <SwapHoriz className="text-green-600" style={{ fontSize: 24 }} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Receive Transaction
              </h3>
              <p className="text-sm text-gray-600">
                Add material received at washing stage
              </p>
            </button>

            {/* Delivery Option */}
            <button
              onClick={() => handleTypeSelect('delivery')}
              className="w-full p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition duration-300 group text-left shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition duration-200">
                  <LocalShipping className="text-blue-600" style={{ fontSize: 24 }} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delivery Transaction
              </h3>
              <p className="text-sm text-gray-600">
                Record material delivery from washing stage
              </p>
            </button>
          </div>
        </div>
      ) : (
        // ===== STEP 2: TAB VIEW =====
        <div className="h-full flex flex-col">
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
                <p className="text-xs text-gray-600">
                  {selectedStage ? stageName : 'Select process stage'}
                </p>
              </div>
            </div>

            {/* Stage Selection */}
            <div className="mb-3">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Process Stage:
              </label>
              {stagesLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <select
                  value={selectedStage || ''}
                  onChange={(e) => {
                    setSelectedStage(e.target.value ? parseInt(e.target.value) : null);
                    setSelectedRows({});
                    setSearchQuery('');
                    setShowMarks({});
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 text-sm"
                >
                  <option value="">Select a stage</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tabs */}
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
                {/* Search Bar */}
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

                {/* Work Orders List */}
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
                        variant="search"
                        size="sm"
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
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Marks</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Add Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredWorkOrders.map((wo) => {
                            const hasQuantity = selectedRows[wo.id];
                            const isMarksVisible = showMarks[wo.id];
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
                                  <div className="flex items-center gap-1">
           
                                    <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-700">
                                      {wo.marks}
                                    </div>
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
                {/* Summary Cards */}
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

                {/* Selected Items List */}
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
                            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Marks</th>
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
                              <td className="px-3 py-2">
                                {wo.marks ? (
                                  <div className="text-xs text-gray-600 truncate max-w-[100px]" title={wo.marks}>
                                    {wo.marks.substring(0, 20)}...
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
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

                {/* Save Button */}
                {selectedCount > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !selectedStage}
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
                    {!selectedStage && (
                      <p className="text-xs text-red-600 text-center mt-2">
                        Please select a process stage first
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add this CSS to hide scrollbars */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};

export default UserTransactionPage;