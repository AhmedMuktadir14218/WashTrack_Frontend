import { useState, useCallback } from 'react';
import { washTransactionApi } from '../api/washTransactionApi';
import toast from 'react-hot-toast';

export const useWashTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // ✅ Always an array
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // ==========================================
  // CREATE RECEIVE TRANSACTION
  // ==========================================
  const createReceive = useCallback(async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('➕ Creating receive transaction...');
      const response = await washTransactionApi.createReceive(transactionData);

      if (response.data.success) {
        console.log('✅ Receive transaction created:', response.data.data);
        toast.success('Receive transaction created successfully');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create receive transaction';
      console.error('❌ Create receive error:', message);
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // CREATE DELIVERY TRANSACTION
  // ==========================================
  const createDelivery = useCallback(async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('➕ Creating delivery transaction...');
      const response = await washTransactionApi.createDelivery(transactionData);

      if (response.data.success) {
        console.log('✅ Delivery transaction created:', response.data.data);
        toast.success('Delivery transaction created successfully');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create delivery transaction';
      console.error('❌ Create delivery error:', message);
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET ALL TRANSACTIONS
  // ==========================================
  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Fetching all transactions...');
      const response = await washTransactionApi.getAll();

      if (response.data.success) {
        const transactions = response.data.data || [];
        setData(transactions);
        console.log('✅ Loaded', transactions.length, 'transactions');
        return { success: true, data: transactions };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load transactions';
      console.error('❌ Get all error:', message);
      setError(message);
      setData([]);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET BY WORK ORDER
  // ==========================================
  const getByWorkOrder = useCallback(async (workOrderId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📋 Fetching transactions for work order ${workOrderId}...`);
      const response = await washTransactionApi.getByWorkOrder(workOrderId);

      if (response.data.success) {
        const transactions = response.data.data || [];
        setData(transactions);
        console.log('✅ Loaded', transactions.length, 'transactions');
        return { success: true, data: transactions };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load transactions';
      console.error('❌ Get by work order error:', message);
      setError(message);
      setData([]);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET BY STAGE
  // ==========================================
  const getByStage = useCallback(async (processStageId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📋 Fetching transactions for stage ${processStageId}...`);
      const response = await washTransactionApi.getByStage(processStageId);

      if (response.data.success) {
        const transactions = response.data.data || [];
        setData(transactions);
        console.log('✅ Loaded', transactions.length, 'transactions');
        return { success: true, data: transactions };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load transactions';
      console.error('❌ Get by stage error:', message);
      setError(message);
      setData([]);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // FILTER TRANSACTIONS
  // ==========================================
  const filter = useCallback(async (filterParams) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Filtering transactions...', filterParams);
      const response = await washTransactionApi.filter(filterParams);

      if (response.data.success) {
        const transactions = response.data.data || [];
        setData(transactions);
        console.log('✅ Loaded', transactions.length, 'filtered transactions');
        return { success: true, data: transactions };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to filter transactions';
      console.error('❌ Filter error:', message);
      setError(message);
      setData([]);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET BALANCE
  // ==========================================
  const getBalance = useCallback(async (workOrderId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`💰 Fetching balance for work order ${workOrderId}...`);
      const response = await washTransactionApi.getBalance(workOrderId);

      if (response.data.success) {
        console.log('✅ Balance loaded');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load balance';
      console.error('❌ Get balance error:', message);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET WASH STATUS
  // ==========================================
  const getStatus = useCallback(async (workOrderId) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📊 Fetching status for work order ${workOrderId}...`);
      const response = await washTransactionApi.getStatus(workOrderId);

      if (response.data.success) {
        console.log('✅ Status loaded');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load status';
      console.error('❌ Get status error:', message);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET ALL STATUSES
  // ==========================================
  const getAllStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching all statuses...');
      const response = await washTransactionApi.getAllStatus();

      if (response.data.success) {
        console.log('✅ Statuses loaded');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load statuses';
      console.error('❌ Get all statuses error:', message);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET STAGE SUMMARY
  // ==========================================
  const getStageSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📈 Fetching stage summary...');
      const response = await washTransactionApi.getStageSummary();

      if (response.data.success) {
        console.log('✅ Summary loaded');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load summary';
      console.error('❌ Get summary error:', message);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // UPDATE TRANSACTION
  // ==========================================
  const update = useCallback(async (id, transactionData) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`✏️ Updating transaction ${id}...`);
      const response = await washTransactionApi.update(id, transactionData);

      if (response.data.success) {
        console.log('✅ Transaction updated:', response.data.data);
        toast.success('Transaction updated successfully');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update transaction';
      console.error('❌ Update error:', message);
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // DELETE TRANSACTION
  // ==========================================
  const deleteTransaction = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🗑️ Deleting transaction ${id}...`);
      const response = await washTransactionApi.delete(id);

      if (response.data.success) {
        console.log('✅ Transaction deleted');
        toast.success('Transaction deleted successfully');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete transaction';
      console.error('❌ Delete error:', message);
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET PAGINATED (with search & filters)
  // ==========================================
  const getPaginated = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📄 Fetching paginated transactions with params:', params);
      const response = await washTransactionApi.getPaginated(params);

      if (response.data.success) {
        const transactions = response.data.data || [];
        const paginationInfo = response.data.pagination;
        
        setData(transactions);
        setPagination(paginationInfo);
        
        console.log(`✅ Loaded ${transactions.length} transactions (Page ${paginationInfo.currentPage}/${paginationInfo.totalPages})`);
        
        return { 
          success: true, 
          data: transactions, 
          pagination: paginationInfo 
        };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load transactions';
      console.error('❌ Get paginated error:', message);
      setError(message);
      setData([]);
      setPagination(null);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET DATA FOR EXPORT
  // ==========================================
  const getDataForExport = useCallback(async (searchTerm = '', filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Getting data for export...', { searchTerm, filters });

      const response = await washTransactionApi.getAllForExport(searchTerm, filters);

      if (response.data.success) {
        const transactions = response.data.data || [];
        console.log(`✅ Fetched ${transactions.length} records for export`);
        return { success: true, data: transactions };
      }
      
      return { success: false, message: 'Failed to fetch data' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load data for export';
      console.error('❌ Get data for export error:', message);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // EXPORT TO CSV
  // ==========================================
  const exportToCSV = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 Exporting CSV with filters:', filters);

      const response = await washTransactionApi.exportToCSV(filters);

      console.log('✅ CSV response received:', {
        status: response.status,
        size: response.data.size,
        type: response.data.type
      });

      if (!response.data || response.data.size === 0) {
        throw new Error('Empty response from server');
      }

      // ✅ Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // ✅ Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `Transactions_${timestamp}.csv`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // ✅ Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log('✅ CSV export successful:', fileName);
      return { success: true, fileName };
    } catch (err) {
      console.error('❌ Export error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      });
      
      // ✅ Better error message
      let message = 'Failed to export CSV';
      if (err.response?.status === 500) {
        message = err.response?.data?.message || 'Server error during export';
      } else if (err.response?.status === 400) {
        message = err.response?.data?.message || 'No data to export';
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {    
    loading,
    data,
    error,    
    pagination,
    // ✅ All methods
    createReceive,
    createDelivery,
    getAll,
    getByWorkOrder,
    getByStage,
    filter,
    getBalance,
    getStatus,
    getAllStatus,
    getStageSummary,
    update,
    deleteTransaction,
    getPaginated,
    getDataForExport,
    exportToCSV
  };
};