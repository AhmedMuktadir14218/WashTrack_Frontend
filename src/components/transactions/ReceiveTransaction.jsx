import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, CheckCircle, Add } from '@mui/icons-material';  // ✅ Changed 'Plus' to 'Add'
import { useWashTransaction } from '../../hooks/useWashTransaction';
import { useProcessStage } from '../../hooks/useProcessStage';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ReceiveTransaction = () => {
  const navigate = useNavigate();
  const { workOrderId } = useParams();
  const { createReceive, loading } = useWashTransaction();
  const { stages } = useProcessStage();

  const [formData, setFormData] = useState({
    workOrderId: parseInt(workOrderId) || '',
    processStageId: '',
    quantity: '',
    batchNo: '',
    remarks: '',
    receivedBy: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createReceive({
      workOrderId: parseInt(formData.workOrderId),
      processStageId: parseInt(formData.processStageId),
      quantity: parseInt(formData.quantity),
      transactionType: 1, // Receive
      batchNo: formData.batchNo || null,
      remarks: formData.remarks || null,
      receivedBy: formData.receivedBy || null,
      transactionDate: formData.transactionDate,
    });

    if (result.success) {
      setFormData({
        workOrderId: parseInt(workOrderId) || '',
        processStageId: '',
        quantity: '',
        batchNo: '',
        remarks: '',
        receivedBy: '',
        transactionDate: new Date().toISOString().split('T')[0],
      });
      
      // Redirect back after 1 second
      setTimeout(() => {
        navigate(`/work-orders/${workOrderId}`);
      }, 1000);
    }
  };

  const getStageColor = (stageName) => {
    const colors = {
      '1st Dry': 'border-l-4 border-l-yellow-500',
      'Unwash': 'border-l-4 border-l-blue-500',
      '2nd Dry': 'border-l-4 border-l-orange-500',
      '1st Wash': 'border-l-4 border-l-green-500',
      'Final Wash': 'border-l-4 border-l-purple-500',
    };
    return colors[stageName] || 'border-l-4 border-l-gray-500';
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
          <h1 className="text-3xl font-bold text-gray-800">Receive Transaction</h1>
          <p className="text-gray-600 text-sm mt-1">
            Record new material received at washing stage
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-white" style={{ fontSize: 32 }} />
              <div>
                <h2 className="text-xl font-bold text-white">New Receive Entry</h2>
                <p className="text-green-100 text-sm">Add material received at stage</p>
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
                      : 'border-gray-200 focus:border-green-500'
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

            {/* Quantity & Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quantity (pcs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter quantity"
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition duration-200 ${
                    errors.quantity
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-green-500'
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 transition duration-200"
                />
              </div>
            </div>

            {/* Batch No & Received By Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batch No */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Batch No / Lot
                </label>
                <input
                  type="text"
                  name="batchNo"
                  value={formData.batchNo}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g., BATCH-001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 transition duration-200"
                />
              </div>

              {/* Received By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Received By (Person)
                </label>
                <input
                  type="text"
                  name="receivedBy"
                  value={formData.receivedBy}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter receiver's name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 transition duration-200"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-green-500 transition duration-200 resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-semibold">📝 Note:</span> This receive transaction will add to the stage balance. The material will be available for delivery from this stage.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 px-8 py-6 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Add style={{ fontSize: 20 }} />
                  <span>Create Receive Transaction</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
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

export default ReceiveTransaction;