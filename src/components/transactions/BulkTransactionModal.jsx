import { useState, useEffect } from 'react';
import { Close, Search, Save,  Delete, CheckCircle, LocalShipping } from '@mui/icons-material';
import { useProcessStage } from '../../hooks/useProcessStage';
import { workOrderApi } from '../../api/workOrderApi';
import { washTransactionApi } from '../../api/washTransactionApi';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const BulkTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const { stages, loading: stagesLoading } = useProcessStage();

  // Step 1: Choose type (Receive/Delivery)
  const [step, setStep] = useState(1); // 1: Choose Type, 2: Select Stage & Add Quantities
  const [transactionType, setTransactionType] = useState(null); // 'receive' or 'delivery'

  // Step 2: Modal content
  const [selectedStage, setSelectedStage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState({}); // { workOrderId: quantity }
  const [isSaving, setIsSaving] = useState(false);

  // Load work orders on mount
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

    if (isOpen) {
      fetchWorkOrders();
    }
  }, [isOpen]);

  // Filter work orders based on search
  const filteredWorkOrders = workOrders.filter(wo => {
    const searchLower = searchQuery.toLowerCase();
    return (
      wo.workOrderNo?.toLowerCase().includes(searchLower) ||
      wo.styleName?.toLowerCase().includes(searchLower) ||
      wo.fastReactNo?.toLowerCase().includes(searchLower) ||
      wo.buyer?.toLowerCase().includes(searchLower)
    );
  });

  // Handle type selection
  const handleTypeSelect = (type) => {
    setTransactionType(type);
    setStep(2);
    setSelectedStage(null);
    setSearchQuery('');
    setSelectedRows({});
  };

  // Handle quantity input
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

  // Validate and save
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
        onSuccess();
        handleClose();
      }
    } catch (error) {
      toast.error('Error creating transactions');
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setTransactionType(null);
    setSelectedStage(null);
    setSearchQuery('');
    setSelectedRows({});
    onClose();
  };

  if (!isOpen) return null;

  const stageName = stages.find(s => s.id === selectedStage)?.name;
  const selectedCount = Object.keys(selectedRows).length;
  const totalQuantity = Object.values(selectedRows).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        
        {/* Modal Header */}
        <div className={`px-8 py-6 flex items-center justify-between text-white ${
          transactionType === 'receive'
            ? 'bg-gradient-to-r from-green-500 to-green-600'
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
        }`}>
          <div className="flex items-center gap-3">
            {transactionType === 'receive' ? (
              <CheckCircle style={{ fontSize: 28 }} />
            ) : (
              <LocalShipping style={{ fontSize: 28 }} />
            )}
            <div>
              <h2 className="text-xl font-bold">
                {step === 1 ? 'Create Transaction' : `Add ${transactionType === 'receive' ? 'Receive' : 'Delivery'} Transactions`}
              </h2>
              <p className="text-sm opacity-90">
                {step === 1 ? 'Choose transaction type' : `Step 2: Select stage and add quantities`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-opacity-20 hover:bg-white rounded-lg transition duration-200"
          >
            <Close style={{ fontSize: 24 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 ? (
            // Step 1: Choose Type
            <div>
              <p className="text-gray-700 text-center mb-6 font-medium">
                Select the type of transaction you want to create
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Receive Option */}
                <button
                  onClick={() => handleTypeSelect('receive')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition duration-200 group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition duration-200">
                      <CheckCircle className="text-green-600" style={{ fontSize: 32 }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Receive Transaction
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add material received at washing stage
                      </p>
                    </div>
                  </div>
                </button>

                {/* Delivery Option */}
                <button
                  onClick={() => handleTypeSelect('delivery')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition duration-200 group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition duration-200">
                      <LocalShipping className="text-blue-600" style={{ fontSize: 32 }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Delivery Transaction
                      </h3>
                      <p className="text-sm text-gray-600">
                        Record material delivery from washing stage
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Select Stage & Add Quantities
            <div className="space-y-6">
              {/* Stage Selection */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Select Process Stage</h3>
                {stagesLoading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {stages.map(stage => (
                      <button
                        key={stage.id}
                        onClick={() => {
                          setSelectedStage(stage.id);
                          setSelectedRows({}); // Reset when changing stage
                          setSearchQuery('');
                        }}
                        className={`p-3 rounded-lg border-2 transition duration-200 font-medium text-sm ${
                          selectedStage === stage.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {stage.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedStage && (
                <div>
                  {/* Search Bar */}
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Search & Select Work Orders ({stageName})
                  </h3>
                  
                  <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by Work Order No, Style Name, FastReact No..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200"
                    />
                  </div>

                  {/* Work Orders Table with Quantity Input */}
                  {loading ? (
                    <LoadingSpinner size="md" />
                  ) : filteredWorkOrders.length === 0 ? (
                    <EmptyState 
                      title="No Work Orders"
                      description="No work orders found matching your search"
                      variant="search"
                    />
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">WO ID</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Work Order No</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">FastReact No</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Style Name</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">TOD</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Order Qty</th>
                            <th className="px-4 py-3 text-left font-bold text-gray-700">Marks</th>
                            <th className="px-4 py-3 text-center font-bold text-gray-700">Quantity</th>
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
                                <td className="px-4 py-3 font-bold text-primary-600">{wo.id}</td>
                                <td className="px-4 py-3 font-semibold text-gray-700">{wo.workOrderNo}</td>
                                <td className="px-4 py-3 text-gray-600 text-xs">{wo.fastReactNo || '-'}</td>
                                <td className="px-4 py-3 text-gray-600 font-medium">{wo.styleName}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  {wo.tod ? format(new Date(wo.tod), 'dd MMM') : '-'}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-700">
                                  {wo.orderQuantity.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[150px]" title={wo.marks}>
                                  {wo.marks ? wo.marks.substring(0, 25) + '...' : '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="number"
                                    value={selectedRows[wo.id] || ''}
                                    onChange={(e) => handleQuantityChange(wo.id, e.target.value)}
                                    placeholder="Qty"
                                    min="1"
                                    max={wo.orderQuantity}
                                    className="w-20 px-2 py-1 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 text-center font-semibold"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Summary */}
                  {selectedCount > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-semibold mb-1">Selected Items</p>
                          <p className="text-2xl font-bold text-blue-900">{selectedCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 font-semibold mb-1">Total Quantity</p>
                          <p className="text-2xl font-bold text-blue-900">{totalQuantity.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 font-semibold mb-1">Stage</p>
                          <p className="text-lg font-bold text-blue-900">{stageName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition duration-200 disabled:opacity-50"
            >
              Back
            </button>
          )}

          {step === 2 && selectedStage && selectedCount > 0 && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save fontSize="small" />
                  <span>Save {selectedCount} Transactions</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkTransactionModal;