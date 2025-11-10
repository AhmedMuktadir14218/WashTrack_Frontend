import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Search, Save,  Delete } from '@mui/icons-material';
import { useProcessStage } from '../../hooks/useProcessStage';
import { workOrderApi } from '../../api/workOrderApi';
import { washTransactionApi } from '../../api/washTransactionApi';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SelectStageAndWorkOrders = ({ transactionType }) => {
  const navigate = useNavigate();
  const { stages, loading: stagesLoading } = useProcessStage();

  const [selectedStage, setSelectedStage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Get all work orders
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

  const handleAddRow = (workOrder) => {
    const alreadyExists = selectedItems.some(item => item.workOrderId === workOrder.id);
    
    if (alreadyExists) {
      toast.error('This work order is already added');
      return;
    }

    const newItem = {
      workOrderId: workOrder.id,
      workOrder: workOrder,
      quantity: '',
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const handleQuantityChange = (index, quantity) => {
    const updated = [...selectedItems];
    updated[index].quantity = quantity;
    setSelectedItems(updated);
  };

  const handleRemoveRow = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const validateAndSave = async () => {
    // Validate stage selection
    if (!selectedStage) {
      toast.error('Please select a process stage');
      return;
    }

    // Validate all rows have quantity
    const invalidRows = selectedItems.filter(item => !item.quantity || parseInt(item.quantity) <= 0);
    if (invalidRows.length > 0) {
      toast.error('Please enter valid quantity for all rows');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please add at least one transaction');
      return;
    }

    try {
      setIsSaving(true);

      // Create all transactions
      const results = await Promise.all(
        selectedItems.map(item =>
          transactionType === 'receive'
            ? washTransactionApi.createReceive({
                workOrderId: item.workOrderId,
                processStageId: selectedStage,
                quantity: parseInt(item.quantity),
                transactionType: 1,
                transactionDate: new Date().toISOString().split('T')[0],
              })
            : washTransactionApi.createDelivery({
                workOrderId: item.workOrderId,
                processStageId: selectedStage,
                quantity: parseInt(item.quantity),
                transactionType: 2,
                transactionDate: new Date().toISOString().split('T')[0],
              })
        )
      );

      const successCount = results.filter(r => r.data?.success).length;
      const failureCount = results.length - successCount;

      toast.success(
        `${successCount} transaction${successCount !== 1 ? 's' : ''} created successfully${
          failureCount > 0 ? `, ${failureCount} failed` : ''
        }`
      );

      // Redirect back
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (error) {
      toast.error('Error creating transactions');
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const stageName = stages.find(s => s.id === selectedStage)?.name;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/transactions')}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <ArrowBack className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bulk {transactionType === 'receive' ? 'Receive' : 'Delivery'} Transactions
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Select stage and add multiple work orders
          </p>
        </div>
      </div>

      {/* Stage Selection */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Step 1: Select Process Stage</h2>
        
        {stagesLoading ? (
          <LoadingSpinner size="md" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {stages.map(stage => (
              <button
                key={stage.id}
                onClick={() => {
                  setSelectedStage(stage.id);
                  setSelectedItems([]); // Reset selected items when stage changes
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
        <div className="space-y-6">
          {/* Work Orders Search & Selection */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Step 2: Select Work Orders ({stageName})
            </h2>

            {/* Search */}
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

            {/* Work Orders Table */}
            {loading ? (
              <LoadingSpinner size="md" />
            ) : filteredWorkOrders.length === 0 ? (
              <EmptyState 
                title="No Work Orders"
                description="No work orders found matching your search"
                variant="search"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">WO ID</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Work Order No</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">FastReact No</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Style Name</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Order Qty</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">TOD</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Marks</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWorkOrders.map((wo) => {
                      const isAlreadyAdded = selectedItems.some(item => item.workOrderId === wo.id);
                      return (
                        <tr
                          key={wo.id}
                          className={`hover:bg-gray-50 transition duration-150 ${
                            isAlreadyAdded ? 'bg-green-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-bold text-primary-600">{wo.id}</td>
                          <td className="px-4 py-3 font-semibold text-gray-700">{wo.workOrderNo}</td>
                          <td className="px-4 py-3 text-gray-600">{wo.fastReactNo || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{wo.styleName}</td>
                          <td className="px-4 py-3 font-semibold">{wo.orderQuantity.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {wo.tod ? format(new Date(wo.tod), 'dd MMM') : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                            {wo.marks ? (
                              <span title={wo.marks} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {wo.marks.substring(0, 30)}...
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleAddRow(wo)}
                              disabled={isAlreadyAdded}
                              className={`p-2 rounded-lg transition duration-200 ${
                                isAlreadyAdded
                                  ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                              title={isAlreadyAdded ? 'Already added' : 'Add to transaction'}
                            >
                                +
                              {/* <Plus fontSize="small" /> */}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Step 3: Enter Quantities ({selectedItems.length} items)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Work Order</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Style Name</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">Order Qty</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700">
                        {transactionType === 'receive' ? 'Receive Qty' : 'Delivery Qty'}
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-primary-600">{item.workOrder.workOrderNo}</p>
                          <p className="text-xs text-gray-500">{item.workOrder.buyer}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.workOrder.styleName}</td>
                        <td className="px-4 py-3 font-semibold text-gray-700">
                          {item.workOrder.orderQuantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            placeholder="Enter quantity"
                            min="1"
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-primary-500 transition duration-200 font-semibold"
                          />
                          {item.quantity && parseInt(item.quantity) > item.workOrder.orderQuantity && (
                            <p className="text-xs text-red-600 mt-1">⚠ Exceeds order quantity</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveRow(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition duration-200"
                            title="Remove"
                          >
                            <Delete fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Total Items</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedItems.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-semibold mb-1">Total Quantity</p>
                    <p className="text-2xl font-bold text-green-900">
                      {selectedItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold mb-1">Stage</p>
                    <p className="text-2xl font-bold text-purple-900">{stageName}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={validateAndSave}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save fontSize="small" />
                        <span>Save All Transactions</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate('/transactions')}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectStageAndWorkOrders;