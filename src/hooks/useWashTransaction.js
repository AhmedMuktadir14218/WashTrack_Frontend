// D:\TusukaReact\WashRecieveDelivary_Frontend\src\hooks\useWashTransaction.js
import { useState, useCallback } from 'react';
import { washTransactionApi } from '../api/washTransactionApi';
import toast from 'react-hot-toast';

export const useWashTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);  // ✅ Changed from null to []
  const [error, setError] = useState(null);

  // Create receive transaction
  const createReceive = useCallback(async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.createReceive(transactionData);

      if (response.data.success) {
        toast.success('Receive transaction created successfully');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create receive transaction';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create delivery transaction
  const createDelivery = useCallback(async (transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.createDelivery(transactionData);

      if (response.data.success) {
        toast.success('Delivery transaction created successfully');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create delivery transaction';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all transactions
  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.getAll();

      if (response.data.success) {
        setData(response.data.data || []);  // ✅ Ensure it's always an array
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load transactions';
      setError(message);
      setData([]);  // ✅ Set empty array on error
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get by work order
  const getByWorkOrder = useCallback(async (workOrderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.getByWorkOrder(workOrderId);

      if (response.data.success) {
        setData(response.data.data || []);  // ✅ Ensure it's always an array
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load transactions';
      setError(message);
      setData([]);  // ✅ Set empty array on error
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get by stage
  const getByStage = useCallback(async (processStageId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.getByStage(processStageId);

      if (response.data.success) {
        setData(response.data.data || []);  // ✅ Ensure it's always an array
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load transactions';
      setError(message);
      setData([]);  // ✅ Set empty array on error
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter transactions
  const filter = useCallback(async (filterParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.filter(filterParams);

      if (response.data.success) {
        setData(response.data.data || []);  // ✅ Ensure it's always an array
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to filter transactions';
      setError(message);
      setData([]);  // ✅ Set empty array on error
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get balance
  const getBalance = useCallback(async (workOrderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.getBalance(workOrderId);

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load balance';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get wash status
  const getStatus = useCallback(async (workOrderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.getStatus(workOrderId);

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load status';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all statuses
  const getAllStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.getAllStatus();

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load statuses';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get stage summary
  const getStageSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.getStageSummary();

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load summary';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update transaction
  const update = useCallback(async (id, transactionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.update(id, transactionData);

      if (response.data.success) {
        toast.success('Transaction updated successfully');
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update transaction';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await washTransactionApi.delete(id);

      if (response.data.success) {
        toast.success('Transaction deleted successfully');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete transaction';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    data,
    error,
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
  };
};