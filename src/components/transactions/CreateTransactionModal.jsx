import { useState } from 'react';
import { Close, SwapHoriz, LocalShipping, CheckCircle } from '@mui/icons-material';

const CreateTransactionModal = ({ isOpen, onClose, onSelectType }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleSelectType = (type) => {
    setSelectedType(type);
    onSelectType(type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SwapHoriz className="text-white" style={{ fontSize: 28 }} />
            <div>
              <h2 className="text-xl font-bold text-white">Create Transaction</h2>
              <p className="text-primary-100 text-sm">Choose transaction type</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-500 rounded-lg transition duration-200"
          >
            <Close className="text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          <p className="text-gray-700 text-center mb-6 font-medium">
            Select the type of transaction you want to create
          </p>

          <div className="space-y-4">
            {/* Receive Option */}
            <button
              onClick={() => handleSelectType('receive')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition duration-200 group text-left"
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
              onClick={() => handleSelectType('delivery')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition duration-200 group text-left"
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

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Tip:</span> You can add multiple transactions of the same type by selecting the stage and work orders.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTransactionModal;