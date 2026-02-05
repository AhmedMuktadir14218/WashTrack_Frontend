// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\workorders\WorkOrderForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { workOrderApi } from '../../api/workOrderApi';
import toast from 'react-hot-toast';

const WorkOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    factory: '',
    line: '',
    unit: '',
    buyer: '',
    buyerDepartment: '',
    styleName: '',
    fastReactNo: '',
    color: '',
    workOrderNo: '',
    washType: '',
    orderQuantity: '',
    cutQty: '',
    tod: '',
    sewingCompDate: '',
    firstRCVDate: '',
    washApprovalDate: '',
    washTargetDate: '',
    totalWashReceived: '',
    totalWashDelivery: '',
    washBalance: '',
    fromReceived: '',
    marks: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch work order data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchWorkOrder();
    }
  }, [id]);

  const fetchWorkOrder = async () => {
    try {
      setLoadingData(true);
      const response = await workOrderApi.getById(id);
      if (response.data.success) {
        const data = response.data.data;
        setFormData({
          factory: data.factory || '',
          line: data.line || '',
          unit: data.unit || '',
          buyer: data.buyer || '',
          buyerDepartment: data.buyerDepartment || '',
          styleName: data.styleName || '',
          fastReactNo: data.fastReactNo || '',
          color: data.color || '',
          workOrderNo: data.workOrderNo || '',
          washType: data.washType || '',
          orderQuantity: data.orderQuantity || '',
          cutQty: data.cutQty || '',
          tod: data.tod ? data.tod.split('T')[0] : '',
          sewingCompDate: data.sewingCompDate ? data.sewingCompDate.split('T')[0] : '',
          firstRCVDate: data.firstRCVDate ? data.firstRCVDate.split('T')[0] : '',
          washApprovalDate: data.washApprovalDate ? data.washApprovalDate.split('T')[0] : '',
          washTargetDate: data.washTargetDate ? data.washTargetDate.split('T')[0] : '',
          totalWashReceived: data.totalWashReceived || '',
          totalWashDelivery: data.totalWashDelivery || '',
          washBalance: data.washBalance || '',
          fromReceived: data.fromReceived || '',
          marks: data.marks || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load work order');
      console.error('Error fetching work order:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.factory.trim()) newErrors.factory = 'Factory is required';
    if (!formData.line.trim()) newErrors.line = 'Line is required';
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    if (!formData.buyer.trim()) newErrors.buyer = 'Buyer is required';
    if (!formData.styleName.trim()) newErrors.styleName = 'Style name is required';
    if (!formData.workOrderNo.trim()) newErrors.workOrderNo = 'Work order number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Convert empty strings to null for date fields
      const dataToSubmit = {
        ...formData,
        tod: formData.tod || null,
        sewingCompDate: formData.sewingCompDate || null,
        firstRCVDate: formData.firstRCVDate || null,
        washApprovalDate: formData.washApprovalDate || null,
        washTargetDate: formData.washTargetDate || null,
        orderQuantity: parseInt(formData.orderQuantity) || 0,
        cutQty: parseInt(formData.cutQty) || 0,
        totalWashReceived: parseInt(formData.totalWashReceived) || 0,
        totalWashDelivery: parseInt(formData.totalWashDelivery) || 0,
        washBalance: parseInt(formData.washBalance) || 0,
        fromReceived: parseInt(formData.fromReceived) || 0,
      };

      let response;
      if (isEditMode) {
        response = await workOrderApi.update(id, dataToSubmit);
      } else {
        response = await workOrderApi.create(dataToSubmit);
      }

      if (response.data.success) {
        toast.success(
          isEditMode
            ? 'Work order updated successfully'
            : 'Work order created successfully'
        );
        navigate('/work-orders');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
      console.error('Error saving work order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/work-orders')}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <ArrowBack />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Edit Work Order' : 'Create Work Order'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {isEditMode
              ? 'Update work order information'
              : 'Add a new work order to the system'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Factory */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Factory <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="factory"
                  value={formData.factory}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 ${
                    errors.factory ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter factory name"
                />
                {errors.factory && (
                  <p className="text-red-500 text-xs mt-1">{errors.factory}</p>
                )}
              </div>

              {/* Line */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="line"
                  value={formData.line}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 ${
                    errors.line ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter line"
                />
                {errors.line && (
                  <p className="text-red-500 text-xs mt-1">{errors.line}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 ${
                    errors.unit ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter unit"
                />
                {errors.unit && (
                                   <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
                )}
              </div>

              {/* Buyer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buyer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="buyer"
                  value={formData.buyer}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 ${
                    errors.buyer ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter buyer name"
                />
                {errors.buyer && (
                  <p className="text-red-500 text-xs mt-1">{errors.buyer}</p>
                )}
              </div>

              {/* Buyer Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Buyer Department
                </label>
                <input
                  type="text"
                  name="buyerDepartment"
                  value={formData.buyerDepartment}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="Enter buyer department"
                />
              </div>

              {/* Work Order No */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Work Order No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="workOrderNo"
                  value={formData.workOrderNo}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 ${
                    errors.workOrderNo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter work order number"
                />
                {errors.workOrderNo && (
                  <p className="text-red-500 text-xs mt-1">{errors.workOrderNo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Product Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Style Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Style Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="styleName"
                  value={formData.styleName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 ${
                    errors.styleName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter style name"
                />
                {errors.styleName && (
                  <p className="text-red-500 text-xs mt-1">{errors.styleName}</p>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="Enter color"
                />
              </div>

              {/* FastReact No */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  FastReact No
                </label>
                <input
                  type="text"
                  name="fastReactNo"
                  value={formData.fastReactNo}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="Enter FastReact number"
                />
              </div>

              {/* Wash Type */}
              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wash Type
                </label>
                <input
                  type="text"
                  name="washType"
                  value={formData.washType}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="e.g., Acid Wash"
                />
              </div> */}
            </div>
          </div>

          {/* Quantities */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Quantities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Order Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Quantity
                </label>
                <input
                  type="number"
                  name="orderQuantity"
                  value={formData.orderQuantity}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="0"
                />
              </div>

              {/* Cut Qty */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cut Qty
                </label>
                <input
                  type="number"
                  name="cutQty"
                  value={formData.cutQty}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="0"
                />
              </div>

              {/* Total Wash Received */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Wash Received
                </label>
                <input
                  type="number"
                  name="totalWashReceived"
                  value={formData.totalWashReceived}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="0"
                />
              </div>

              {/* Total Wash Delivery */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Wash Delivery
                </label>
                <input
                  type="number"
                  name="totalWashDelivery"
                  value={formData.totalWashDelivery}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="0"
                />
              </div>

              {/* Wash Balance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wash Balance
                </label>
                <input
                  type="number"
                  name="washBalance"
                  value={formData.washBalance}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="0"
                />
              </div>

              {/* From Received */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From Received
                </label>
                <input
                  type="number"
                  name="fromReceived"
                  value={formData.fromReceived}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Important Dates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* TOD */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  TOD (Target Order Date)
                </label>
                <input
                  type="date"
                  name="tod"
                  value={formData.tod}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>

              {/* Sewing Comp Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sewing Comp Date
                </label>
                <input
                  type="date"
                  name="sewingCompDate"
                  value={formData.sewingCompDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>

              {/* First RCV Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1st RCV Date
                </label>
                <input
                  type="date"
                  name="firstRCVDate"
                  value={formData.firstRCVDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>

              {/* Wash Approval Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wash Approval Date
                </label>
                <input
                  type="date"
                  name="washApprovalDate"
                  value={formData.washApprovalDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>

              {/* Wash Target Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wash Target Date
                </label>
                <input
                  type="date"
                  name="washTargetDate"
                  value={formData.washTargetDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Additional Information
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marks / Remarks
              </label>
              <textarea
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                disabled={loading}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
                placeholder="Enter any additional notes or remarks..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save fontSize="small" />
                  <span>{isEditMode ? 'Update Work Order' : 'Create Work Order'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/work-orders')}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WorkOrderForm;