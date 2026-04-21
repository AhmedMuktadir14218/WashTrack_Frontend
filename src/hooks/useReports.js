import { useState, useEffect, useRef, useCallback } from 'react';
import { reportApi } from '../api/reportApi';
import toast from 'react-hot-toast';

export const useReports = () => {
    // State
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Summary Stats
    const [summaryStats, setSummaryStats] = useState({
        totalWorkOrders: 0,
        totalTransactions: 0,
        totalReceiveQty: 0,
        totalDeliveryQty: 0,
        totalOrderQuantity: 0,
        balance: 0,
        stageBreakdown: {}
    });

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalRecords: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
    });

    // Filters
    const [filterOptions, setFilterOptions] = useState({
        buyers: [],
        factories: [],
        units: [],
        processStages: []
    });

    const abortControllerRef = useRef(null);

    // Initial Load (Options)
    useEffect(() => {
        loadFilterOptions();
    }, []);

    const loadFilterOptions = async () => {
        try {
            const response = await reportApi.getFilterOptions();
            // Robust unwrapping: Handle generic wrapped 'data' or direct response
            const data = response.data?.data || response.data || {};

            setFilterOptions({
                buyers: Array.isArray(data.buyers) ? data.buyers : [],
                factories: Array.isArray(data.factories) ? data.factories : [],
                units: Array.isArray(data.units) ? data.units : [],
                processStages: Array.isArray(data.processStages) ? data.processStages : []
            });
        } catch (err) {
            console.error('Failed to load filter options:', err);
            // Don't block UI for this, just log
        }
    };

    const fetchReportData = useCallback(async (params) => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            // Fetch Data & Summary in parallel
            const [reportRes, summaryRes] = await Promise.all([
                reportApi.getTransactionReport(params),
                reportApi.getSummary(params)
            ]);

            // 1. Handle Report Data
            const reportDataRaw = reportRes.data?.data || reportRes.data;
            if (Array.isArray(reportDataRaw)) {
                setReportData(reportDataRaw);
            } else {
                console.warn('Unexpected report data structure:', reportRes.data);
                setReportData([]);
            }

            // 2. Handle Pagination
            const paginationRaw = reportRes.data?.pagination || reportRes.data?.meta; // fallback to meta if API changes
            if (paginationRaw) {
                setPagination(prev => ({
                    ...prev,
                    ...paginationRaw
                }));
            }

            // 3. Handle Summary
            const summaryData = summaryRes.data?.data || summaryRes.data;
            if (summaryData) {
                setSummaryStats({
                    totalWorkOrders: Number(summaryData.totalWorkOrders) || 0,
                    totalTransactions: Number(summaryData.totalTransactions) || 0,
                    totalReceiveQty: Number(summaryData.totalReceiveQty) || 0,
                    totalDeliveryQty: Number(summaryData.totalDeliveryQty) || 0,
                    totalOrderQuantity: Number(summaryData.totalOrderQuantity) || 0,
                    balance: Number(summaryData.balance) || 0,
                    stageBreakdown: summaryData.stageBreakdown || {}
                });
            }

        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('Report fetch error:', err);
            setError(err.message || 'Failed to load report data');
            toast.error('Failed to update report data');
            setReportData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportData = async (params) => {
        try {
            const response = await reportApi.exportToCsv(params);

            // Trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transaction_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return true;
        } catch (err) {
            console.error('Export error:', err);
            throw err;
        }
    };

    const fetchUserWorkOrderSummary = useCallback(async (userId, params) => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportApi.getUserWorkOrderSummary(userId, params);
            return response.data?.data || [];
        } catch (err) {
            console.error('User Work Order Summary fetch error:', err);
            setError(err.message || 'Failed to load summary data');
            toast.error('Failed to load summary data');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserTransactions = useCallback(async (userId, params) => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportApi.getUserTransactions(userId, params);
            return response.data?.data || [];
        } catch (err) {
            console.error('User Transactions fetch error:', err);
            setError(err.message || 'Failed to load transaction history');
            toast.error('Failed to load transaction history');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        reportData,
        summaryStats,
        pagination,
        filterOptions,
        loading,
        error,
        fetchReportData,
        exportData,
        fetchUserWorkOrderSummary,
        fetchUserTransactions
    };
};
