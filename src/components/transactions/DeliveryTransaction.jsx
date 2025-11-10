import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, LocalShipping, Add } from '@mui/icons-material';  // ✅ Changed 'Plus' to 'Add'
import { useWashTransaction } from '../../hooks/useWashTransaction';
import { useProcessStage } from '../../hooks/useProcessStage';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const DeliveryTransaction = () => {
  const navigate = useNavigate();
  const { workOrderId } = useParams();
  const { createDelivery, loading, getBalance } = useWashTransaction();
  const { stages } = useProcessStage();

  const [formData, setFormData] = useState({
    workOrderId: parseInt(workOrderId) || '',
    processStageId: '',
    quantity: '',
    gatePassNo: '',
    remarks: '',
    deliveredTo: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});
  const [stageBalance, setStageBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Fetch balance when stage is selected
    if (name === 'processStageId' && value) {
      setBalanceLoading(true);
      const result = await getBalance(workOrderId);
      if (result.success) {
        const balances = result.data;
        const selectedStageBalance = balances.find(
          b => b.processStageId === parseInt(value)
        );
        setStageBalance(selectedStageBalance);
      }
      setBalanceLoading(false);
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.workOrderId) newErrors.workOrderId = 'Work Order is required';
    if (!formData.processStageId) newErrors.processStageId = 'Process Stage is required';
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    // Check balance
    if (stageBalance && parseInt(formData.quantity) > stageBalance.currentBalance) {
      newErrors.quantity = `Insufficient balance. Available: ${stageBalance.currentBalance}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please check the form for errors');
      return;
    }

    const result = await createDelivery({
      workOrderId: parseInt(formData.workOrderId),
      processStageId: parseInt(formData.processStageId),
      quantity: parseInt(formData.quantity),
      transactionType: 2, // Delivery
      gatePassNo: formData.gatePassNo || null,
      remarks: formData.remarks || null,
      deliveredTo: formData.deliveredTo || null,
      transactionDate: formData.transactionDate,
    });

    if (result.success) {
      setFormData({
        workOrderId: parseInt(workOrderId) || '',
        processStageId: '',
        quantity: '',
        gatePassNo: '',
        remarks: '',
        deliveredTo: '',
        transactionDate: new Date().toISOString().split('T')[0],
      });
      setStageBalance(null);

      setTimeout(() => {
        navigate(`/work-orders/${workOrderId}`);
      }, 1000);
    }
  };

  const getBalanceColor = (balance) => {
    if (balance === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (balance < 100) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <ArrowBack className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Delivery Transaction</h1>
          <p className="text-gray-600 text-sm mt-1">
            Record material delivery from washing stage
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <LocalShipping className="text-white" style={{ fontSize: 32 }} />
              <div>
                <h2 className="text-xl font-bold text-white">New Delivery Entry</h2>
                <p className="text-blue-100 text-sm">Record material shipped from stage</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Work Order & Stage Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Work Order ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Work Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="workOrderId"
                  value={formData.workOrderId}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700 font-medium"
                />
              </div>

              {/* Process Stage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Process Stage <span className="text-red-500">*</span>
                </label>
                <select
                  name="processStageId"
                  value={formData.processStageId}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition duration-200 font-medium ${
                    errors.processStageId
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select a stage...</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
                {errors.processStageId && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.processStageId}
                  </p>
                )}
              </div>
            </div>

            {/* Current Balance */}
            {stageBalance && (
              <div className={`p-4 border-2 rounded-lg ${getBalanceColor(stageBalance.currentBalance)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold opacity-75 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold">{stageBalance.currentBalance.toLocaleString()} pcs</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">Total Received: {stageBalance.totalReceived.toLocaleString()}</p>
                    <p className="text-xs opacity-75">Total Delivered: {stageBalance.totalDelivered.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Delivery Quantity (pcs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  disabled={loading || balanceLoading}
                  placeholder="Enter quantity to deliver"
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition duration-200 ${
                    errors.quantity
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.quantity}
                  </p>
                )}
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Transaction Date
                </label>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 transition duration-200"
                />
              </div>
            </div>

            {/* Gate Pass & Delivered To Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gate Pass No */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Gate Pass No
                </label>
                <input
                  type="text"
                  name="gatePassNo"
                  value={formData.gatePassNo}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g., GP-001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 transition duration-200"
                />
              </div>

              {/* Delivered To */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Delivered To (Department/Vendor)
                </label>
                <input
                  type="text"
                  name="deliveredTo"
                  value={formData.deliveredTo}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter destination"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 transition duration-200"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                disabled={loading}
                placeholder="Add any additional notes or remarks..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 transition duration-200 resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">🚚 Note:</span> This delivery will reduce the stage balance. The system will validate that sufficient quantity is available before confirming.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-8 py-6 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || balanceLoading}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Add style={{ fontSize: 20 }} />
                  <span>Create Delivery Transaction</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading || balanceLoading}
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DeliveryTransaction;