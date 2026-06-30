import axiosInstance from './axiosConfig';

const API_BASE_URL = 'http://192.168.136.53:5000/api';

const buildWashDhuParams = (params) => {
  const queryParams = {};
  if (params.fromDate) queryParams.FromDate = params.fromDate;
  if (params.toDate) queryParams.ToDate = params.toDate;
  if (params.plantIds && params.plantIds.length > 0) queryParams.PlantId = params.plantIds;
  if (params.unitIds && params.unitIds.length > 0) queryParams.UnitId = params.unitIds;
  if (params.processModuleIds && params.processModuleIds.length > 0) queryParams.ProcessModuleId = params.processModuleIds;
  if (params.washProcessIds && params.washProcessIds.length > 0) queryParams.WashProcessId = params.washProcessIds;
  if (params.shifts && params.shifts.length > 0) queryParams.Shift = params.shifts;
  return queryParams;
};

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && data.success && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

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
          indexes: null,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
      throw error;
    }
  },

  getDryProcessSummary: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/WashDhu/GetDryProcessSummary`, {
        params: buildWashDhuParams(params),
        paramsSerializer: { indexes: null },
      });
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching dry process summary:', error);
      return [];
    }
  },

  getWetProcessSummary: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/WashDhu/GetWetProcessSummary`, {
        params: buildWashDhuParams(params),
        paramsSerializer: { indexes: null },
      });
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching wet process summary:', error);
      return [];
    }
  },

  getTopIssues: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/WashDhu/GetTopIssues`, {
        params: buildWashDhuParams(params),
        paramsSerializer: { indexes: null },
      });
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching top issues:', error);
      return [];
    }
  },

  getWetTopIssues: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/WashDhu/GetWetTopIssues`, {
        params: buildWashDhuParams(params),
        paramsSerializer: { indexes: null },
      });
      return extractArray(response.data);
    } catch (error) {
      console.error('Error fetching wet top issues:', error);
      return [];
    }
  },

  getWashDelivery: async (params = {}) => {
    try {
      const queryParams = {};
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.plant && params.plant.length > 0) queryParams.plant = params.plant;
      if (params.washUnit && params.washUnit.length > 0) queryParams.washUnit = params.washUnit;

      const response = await axiosInstance.get(`${API_BASE_URL}/TusukaExtreme/get-wash-delivery`, {
        params: queryParams,
        paramsSerializer: { indexes: null },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wash delivery:', error);
      return { success: false, data: [] };
    }
  },

  getWashDeliveryDetails: async (params = {}) => {
    try {
      const queryParams = {};
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.plant && params.plant.length > 0) queryParams.plant = params.plant;
      if (params.washUnit && params.washUnit.length > 0) queryParams.washUnit = params.washUnit;
      if (params.pageNumber) queryParams.pageNumber = params.pageNumber;
      if (params.pageSize) queryParams.pageSize = params.pageSize;

      const response = await axiosInstance.get(`${API_BASE_URL}/TusukaExtreme/get-wash-delivery-details`, {
        params: queryParams,
        paramsSerializer: { indexes: null },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wash delivery details:', error);
      return { success: false, data: [], pagination: null };
    }
  },
};