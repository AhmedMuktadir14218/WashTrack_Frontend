// D:\TusukaReact\WashRecieveDelivary_Frontend\src\api\plansApi.js
import axiosInstance from './axiosConfig';

export const plansApi = {
  // Get wash plans with filters & pagination
  getWashPlans: (params) => {
    return axiosInstance.get('/WashPlan/get-wash-plan', { params });
  },

  // Get machines for wash plan (Dashboard endpoint)
  getMachines: (plantId, unitId) => {
    return axiosInstance.get('/Dashboard/machines', { params: { plantId, unitId } });
  },

  // Create wash plan
  createWashPlan: (data) => {
    return axiosInstance.post('/WashPlan/CreateWashPlan', data);
  },

  // Get Plant-Unit list
  getPlantUnitList: () => {
    return axiosInstance.get('/Dashboard/PlantUnitList');
  },

  // ✅ NEW: Get wash plan modal data (work orders for plan creation)
  getWashPlanModal: (params) => {
    return axiosInstance.get('/WashPlan/get-wash-plan-modal', { params });
  },

  // ✅ NEW: Delete wash plan
  deleteWashPlan: (washPlanId, updatedBy) => {
    return axiosInstance.delete('/WashPlan/DeleteWashPlan', { 
      params: { washPlanId, UpdatedBy: updatedBy } 
    });
  }
};