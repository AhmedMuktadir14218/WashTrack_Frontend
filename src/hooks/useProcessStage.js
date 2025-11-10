import { useState, useCallback, useEffect } from 'react';
import { processStageApi } from '../api/processStageApi';
import toast from 'react-hot-toast';

export const useProcessStage = () => {
  const [stages, setStages] = useState([]);  // ✅ Changed from [] to []
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all stages
  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await processStageApi.getAll();

      if (response.data.success) {
        setStages(response.data.data || []);  // ✅ Ensure it's always an array
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load stages';
      setError(message);
      setStages([]);  // ✅ Set empty array on error
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stages on mount
  useEffect(() => {
    getAll();
  }, [getAll]);

  // Create stage
  const create = useCallback(async (stageData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await processStageApi.create(stageData);

      if (response.data.success) {
        toast.success('Process stage created successfully');
        // Refresh list
        await getAll();
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create stage';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  // Update stage
  const update = useCallback(async (id, stageData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await processStageApi.update(id, stageData);

      if (response.data.success) {
        toast.success('Process stage updated successfully');
        await getAll();
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update stage';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  // Delete stage
  const deleteStage = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await processStageApi.delete(id);

      if (response.data.success) {
        toast.success('Process stage deleted successfully');
        await getAll();
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete stage';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [getAll]);

  return {
    stages,
    loading,
    error,
    getAll,
    create,
    update,
    deleteStage,
  };
};