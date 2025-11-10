// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\workorders\BulkUpload.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import {
  Upload,
  Download,
  ArrowBack,
  CheckCircle,
  Error as ErrorIcon,
  CloudUpload
} from '@mui/icons-material';
import { workOrderApi } from '../../api/workOrderApi';
import toast from 'react-hot-toast';

const BulkUpload = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        droppedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(droppedFile);
        setUploadResult(null);
      } else {
        toast.error('Please drop a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      const response = await workOrderApi.bulkUpload(file);

      if (response.data.success) {
        setUploadResult(response.data);
        toast.success('Bulk upload completed successfully');
        setFile(null);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Upload failed';
      toast.error(message);
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await workOrderApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'WorkOrder_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Error downloading template:', error);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/work-orders')}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <ArrowBack />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bulk Upload Work Orders</h1>
          <p className="text-gray-600 text-sm mt-1">
            Upload multiple work orders using an Excel file
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📝 Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Download the Excel template by clicking the button below</li>
          <li>Fill in the work order details in the template</li>
          <li>Save the file and upload it using the upload area</li>
          <li>Review the upload results and check for any errors</li>
        </ol>

        <button
          onClick={handleDownloadTemplate}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg"
        >
          <Download fontSize="small" />
          <span className="text-sm font-medium">Download Excel Template</span>
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Upload Excel File
        </h3>

        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition duration-200 ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <CloudUpload
              className="mx-auto text-gray-400 mb-4"
              style={{ fontSize: 64 }}
            />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {file ? file.name : 'Choose a file or drag it here'}
            </p>
            <p className="text-sm text-gray-500">
              Supports: .xlsx, .xls files
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              disabled={uploading}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <CircularProgress size={20} color="inherit" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload fontSize="small" />
              <span>Upload and Process</span>
            </>
          )}
        </button>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Upload Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Total Records</p>
              <p className="text-2xl font-bold text-blue-900">
                {uploadResult.totalRecords}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-600 font-medium mb-1">Success</p>
              <p className="text-2xl font-bold text-green-900">
                {uploadResult.successCount}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium mb-1">Updated</p>
              <p className="text-2xl font-bold text-yellow-900">
                {uploadResult.updatedCount}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 font-medium mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-900">
                {uploadResult.failedCount}
              </p>
            </div>
          </div>

          {uploadResult.message && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <p className="text-sm text-gray-700">{uploadResult.message}</p>
            </div>
          )}

          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <ErrorIcon fontSize="small" />
                Errors ({uploadResult.errors.length})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {uploadResult.errors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate('/work-orders')}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              Go to Work Orders List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;