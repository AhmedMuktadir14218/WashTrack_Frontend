import axiosInstance from './axiosConfig';

const API_BASE_URL = 'http://192.168.136.53:5000/api';

export const dashboardApi = {
  getDashboardSummary: async (params) => {
    try {
      const queryParams = {
        fromDate: params.fromDate,
        toDate: params.toDate,
        plant: params.plant,
        unit: params.unit,
      };
      if (params.shift) {
        queryParams.shift = params.shift;
      }

      const response = await axiosInstance.get(`${API_BASE_URL}/Dashboard/DasboardSummery`, {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  getDashboardDetails: async (params) => {
    try {
      const queryParams = {};
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.factory) queryParams.factory = params.factory;
      if (params.unit) queryParams.unit = params.unit;
      if (params.shift) queryParams.shift = params.shift;
      if (params.processStageIds && params.processStageIds.length > 0) {
        queryParams.processStageIds = params.processStageIds;
      }
      if (params.search) queryParams.search = params.search;
      if (params.page) queryParams.page = params.page;
      if (params.pageSize) queryParams.pageSize = params.pageSize;

      const response = await axiosInstance.get(`${API_BASE_URL}/Dashboard/DasboardDetails`, {
        params: queryParams,
        paramsSerializer: {
          indexes: null, // processStageIds=1&processStageIds=2
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
      throw error;
    }
  },
};