// src/components/dashboard/DashboardTableModal.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { useAuth } from '../../hooks/useAuth';

// ============ PROCESS STAGE CONFIG ============
export const PROCESS_STAGE_MAP = {
  1: '1st Dry',
  2: 'Unwash',
  3: '2nd Dry',
  4: '1st Wash',
  5: 'Final Wash',
  6: '1st Dryer',
  7: '2nd Dryer',
  8: 'Final Dryer',
  9: 'Cool Dryer',
  10: 'ReDryer',
  11: 'Laser',
  12: 'Acid Wash',
  13: 'Ozon',
};

// Reverse map: stageName -> stageId
const STAGE_NAME_TO_ID = {};
Object.entries(PROCESS_STAGE_MAP).forEach(([id, name]) => {
  STAGE_NAME_TO_ID[name] = Number(id);
});

// All wash process stage IDs and their column info
const WASH_STAGE_IDS = [1, 2, 3, 4];
const WASH_STAGE_COLUMNS = WASH_STAGE_IDS.map(id => ({
  key: `stage_${id}`,
  label: PROCESS_STAGE_MAP[id],
  align: 'text-right',
  isStage: true,
}));

// All dryer process stage IDs and their column info
const DRYER_STAGE_IDS = [6, 7, 8, 9, 10];
const DRYER_STAGE_COLUMNS = DRYER_STAGE_IDS.map(id => ({
  key: `stage_${id}`,
  label: PROCESS_STAGE_MAP[id],
  align: 'text-right',
  isStage: true,
}));

// ============ COLUMN DEFINITIONS ============
// Summary (Process) mode columns - NO processStageName, NO transactionType
const SUMMARY_COLUMNS = [
  { key: 'factory', label: 'Factory', width: 'min-w-[80px]' },
  { key: 'unit', label: 'Unit', width: 'min-w-[90px]' },
  { key: 'workOrderNo', label: 'Work Order No', width: 'min-w-[120px]' },
  { key: 'buyerDepartment', label: 'Buyer', width: 'min-w-[150px]' },
  { key: 'styleName', label: 'Style Name', width: 'min-w-[180px]' },
  { key: 'fastReactNo', label: 'FastReact No', width: 'min-w-[220px]' },
  { key: 'orderQuantity', label: 'Order Qty', width: 'min-w-[90px]', align: 'text-right' },
  { key: 'washTargetDate', label: 'Wash Target Date', width: 'min-w-[120px]' },
  { key: 'totalWashReceived', label: 'Total Wash Received', width: 'min-w-[130px]', align: 'text-right' },
  { key: 'totalWashDelivery', label: 'Total Wash Delivery', width: 'min-w-[130px]', align: 'text-right' },
  ...WASH_STAGE_COLUMNS,
];

// Dryer mode columns
const DRYER_COLUMNS = [
  { key: 'factory', label: 'Factory', width: 'min-w-[80px]' },
  { key: 'unit', label: 'Unit', width: 'min-w-[90px]' },
  { key: 'workOrderNo', label: 'Work Order No', width: 'min-w-[120px]' },
  { key: 'buyerDepartment', label: 'Buyer', width: 'min-w-[150px]' },
  { key: 'styleName', label: 'Style Name', width: 'min-w-[180px]' },
  { key: 'fastReactNo', label: 'FastReact No', width: 'min-w-[220px]' },
  { key: 'orderQuantity', label: 'Order Qty', width: 'min-w-[90px]', align: 'text-right' },
  { key: 'washTargetDate', label: 'Wash Target Date', width: 'min-w-[120px]' },
  { key: 'totalWashReceived', label: 'Total Revd Qty', width: 'min-w-[120px]', align: 'text-right' },
  { key: 'totalWashDelivery', label: 'Total Dlv', width: 'min-w-[100px]', align: 'text-right' },
  ...DRYER_STAGE_COLUMNS,
];

// Wash Delivery mode columns (from /api/TusukaExtreme/get-wash-delivery-details)
const WASH_DELIVERY_COLUMNS = [
  { key: 'factory', label: 'Factory', width: 'min-w-[80px]' },
  { key: 'unit', label: 'Unit', width: 'min-w-[90px]' },
  { key: 'workOrderNo', label: 'Work Order No', width: 'min-w-[120px]' },
  { key: 'buyerDepartment', label: 'Buyer', width: 'min-w-[150px]' },
  { key: 'styleName', label: 'Style Name', width: 'min-w-[180px]' },
  { key: 'fastReactNo', label: 'FastReact No', width: 'min-w-[220px]' },
  { key: 'color', label: 'Color', width: 'min-w-[120px]' },
  { key: 'orderQuantity', label: 'Order Qty', width: 'min-w-[90px]', align: 'text-right' },
  { key: 'washTargetDate', label: 'Target Date', width: 'min-w-[120px]' },
  { key: 'tod', label: 'TOD', width: 'min-w-[120px]' },
  { key: 'receive', label: 'Receive', width: 'min-w-[100px]', align: 'text-right', isStage: true },
  { key: 'delivery', label: 'Delivery', width: 'min-w-[100px]', align: 'text-right', isStage: true },
  { key: 'totalWashReceived', label: 'Total Recv', width: 'min-w-[110px]', align: 'text-right' },
  { key: 'totalWashDelivery', label: 'Total Delv', width: 'min-w-[110px]', align: 'text-right' },
];

// ============ CUSTOM SVG ICONS ============
const IconX = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconSearch = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconFilter = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconChevronLeft = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconChevronsLeft = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
  </svg>
);
const IconChevronsRight = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
  </svg>
);
const IconRefresh = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconDownload = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ============ HELPERS ============
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'null') return '\u2014';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '\u2014';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  const value = Number(num || 0);
  if (!Number.isFinite(value)) return '0';

  if (Math.abs(value) >= 1000000) {
    const millionValue = value / 1000000;
    const formatted = Number.isInteger(millionValue)
      ? millionValue.toFixed(0)
      : millionValue.toFixed(1);

    return `${formatted}M`;
  }

  return value.toLocaleString();
};

// ============ MAIN MODAL ============
const DashboardTableModal = ({
  isOpen,
  onClose,
  isDarkMode,
  filters = {},
  onFilterChange = null,
  modalTitle = 'Dashboard Details',
  mode = 'process',
  processStageIds = null,
}) => {
  const { user, isAdmin, isIncharge, isPlanner } = useAuth();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const displayTitle = modalTitle || (mode === 'dryer' ? 'Dryer-wise Details' : mode === 'wash-delivery' ? 'Total Wash Delivery Details' : 'Process wise Details');

  const isWashDelivery = mode === 'wash-delivery';

  const activeStageIds = processStageIds || (mode === 'dryer' ? DRYER_STAGE_IDS : WASH_STAGE_IDS);

  const activeStageColumns = mode === 'process'
    ? activeStageIds.flatMap(id => [
        { key: `stage_${id}_RCV`, label: `${PROCESS_STAGE_MAP[id]} RCV`, align: 'text-right', isStage: true },
        { key: `stage_${id}_DLV`, label: `${PROCESS_STAGE_MAP[id]} DLV`, align: 'text-right', isStage: true },
      ])
    : activeStageIds.map(id => ({
        key: `stage_${id}`,
        label: PROCESS_STAGE_MAP[id],
        align: 'text-right',
        isStage: true,
      }));

  const processBaseColumns = [
    { key: 'factory', label: 'Factory', width: 'min-w-[80px]' },
    { key: 'unit', label: 'Unit', width: 'min-w-[90px]' },
    { key: 'workOrderNo', label: 'Work Order No', width: 'min-w-[120px]' },
    { key: 'buyerDepartment', label: 'Buyer', width: 'min-w-[150px]' },
    { key: 'styleName', label: 'Style Name', width: 'min-w-[180px]' },
    { key: 'fastReactNo', label: 'FastReact No', width: 'min-w-[220px]' },
    { key: 'orderQuantity', label: 'Order Qty', width: 'min-w-[90px]', align: 'text-right' },
    { key: 'washTargetDate', label: 'Wash Target Date', width: 'min-w-[120px]' },
    { key: 'totalWashReceived', label: mode === 'dryer' ? 'Total Revd Qty' : 'Total Wash Received', width: mode === 'dryer' ? 'min-w-[120px]' : 'min-w-[130px]', align: 'text-right' },
    { key: 'totalWashDelivery', label: mode === 'dryer' ? 'Total Dlv' : 'Total Wash Delivery', width: mode === 'dryer' ? 'min-w-[100px]' : 'min-w-[130px]', align: 'text-right' },
    ...activeStageColumns,
  ];

  const columns = isWashDelivery ? WASH_DELIVERY_COLUMNS : processBaseColumns;

  // Local filter state for modal-specific filters
  const [localFilters, setLocalFilters] = useState({
    search: '',
    transactionType: isWashDelivery ? '' : 'Delivery',
  });

  // Combined filters - use Dashboard's filters + modal's local filters
  const combinedFilters = {
    fromDate: filters.fromDate || todayStr,
    toDate: filters.toDate || todayStr,
    factory: filters.plant || '',
    unit: filters.unit || '',
    shift: filters.shift || '',
    search: localFilters.search,
    transactionType: localFilters.transactionType,
  };

  const [rawData, setRawData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 100; // Larger page to get enough raw data for aggregation

// ============ FIXED FUNCTIONS IN MODAL ============

// Get accessible plants based on user assignments
const getAccessiblePlants = () => {
  // ✅ First priority: User's actual assignments
  if (user && user.userAssigns && user.userAssigns.length > 0) {
    const uniquePlants = [...new Set(user.userAssigns.map(assignment => assignment.plantName))];
    return uniquePlants;
  }
  
  // ✅ Normal users with no assignments get nothing
  if (!isAdmin() && !isIncharge() && !isPlanner()) {
    return [];
  }
  
  // ✅ Only super admins without assignments get all plants
  return ['TPL', 'TWL'];
};

// Get accessible units for a specific plant
const getAccessibleUnits = (plantId) => {
  // ✅ First priority: User's actual assignments
  if (user && user.userAssigns && user.userAssigns.length > 0) {
    const units = user.userAssigns
      .filter(assignment => assignment.plantName === plantId) // ✅ Match by plantName
      .map(assignment => assignment.unitName); // ✅ Return unitName
    return [...new Set(units)];
  }
  
  // ✅ Fallback for super admins
  if (isAdmin() || isIncharge() || isPlanner()) {
    return ['Unit 1', 'Unit 5', 'Unit 2', 'Unit 4', 'Unit 3', 'Unit TWL'];
  }
  
  return [];
};

  const accessiblePlants = getAccessiblePlants();

  // Refetch data when Dashboard's filters change
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      fetchData();
    }
  }, [filters.plant, filters.unit, filters.fromDate, filters.toDate, filters.shift, isOpen]);

  // ============ AGGREGATE DATA BY WORK ORDER ============
  const aggregatedData = useMemo(() => {
    if (isWashDelivery) {
      return rawData.map(row => ({
        ...row,
        buyerDepartment: row.buyer || row.buyerDepartment || '',
      }));
    }

    const groups = {};

    rawData.forEach(row => {
      const stageId = STAGE_NAME_TO_ID[row.stageName];
      if (stageId === undefined || !activeStageIds.includes(stageId)) return;

      if (mode === 'dryer' && combinedFilters.transactionType && row.transactionType !== combinedFilters.transactionType) return;

      const key = `${row.factory}|${row.unit}|${row.workOrderNo}|${row.buyerDepartment}|${row.styleName}|${row.fastReactNo}`;

      if (!groups[key]) {
        groups[key] = {
          factory: row.factory,
          unit: row.unit,
          workOrderNo: row.workOrderNo,
          buyerDepartment: row.buyerDepartment,
          styleName: row.styleName,
          fastReactNo: row.fastReactNo,
          orderQuantity: row.orderQuantity,
          washTargetDate: row.washTargetDate,
          totalWashReceived: row.totalWashReceived,
          totalWashDelivery: row.totalWashDelivery,
        };
        if (mode === 'process') {
          activeStageIds.forEach(id => {
            groups[key][`stage_${id}_RCV`] = 0;
            groups[key][`stage_${id}_DLV`] = 0;
          });
        } else {
          activeStageIds.forEach(id => {
            groups[key][`stage_${id}`] = 0;
          });
        }
      }

      if (mode === 'process') {
        if (row.transactionType === 'Receive' && groups[key][`stage_${stageId}_RCV`] !== undefined) {
          groups[key][`stage_${stageId}_RCV`] += row.quantity || 0;
        } else if (row.transactionType === 'Delivery' && groups[key][`stage_${stageId}_DLV`] !== undefined) {
          groups[key][`stage_${stageId}_DLV`] += row.quantity || 0;
        }
      } else {
        if (groups[key][`stage_${stageId}`] !== undefined) {
          groups[key][`stage_${stageId}`] += row.quantity || 0;
        }
      }
    });

    return Object.values(groups);
  }, [rawData, combinedFilters.transactionType, activeStageIds, mode, isWashDelivery]);

  // Reset page when filters change (server-side filters)
  useEffect(() => {
    setCurrentPage(1);
  }, [combinedFilters.fromDate, combinedFilters.toDate, combinedFilters.factory, combinedFilters.unit, combinedFilters.shift, combinedFilters.search]);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isWashDelivery) {
        const queryParams = {
          fromDate: combinedFilters.fromDate,
          toDate: combinedFilters.toDate,
          pageNumber: currentPage,
          pageSize: pageSize,
        };

        if (combinedFilters.factory) {
          queryParams.plant = [combinedFilters.factory];
        }
        if (combinedFilters.unit) {
          queryParams.washUnit = [combinedFilters.unit];
        }

        const response = await dashboardApi.getWashDeliveryDetails(queryParams);
        if (response && response.data) {
          setRawData(response.data || []);
          setPagination({
            currentPage: response.pageNumber || 1,
            totalPages: response.totalPages || 1,
            pageSize: response.pageSize || 20,
            totalRecords: response.totalRecords || 0,
            hasNext: response.pageNumber < response.totalPages,
            hasPrevious: response.pageNumber > 1,
          });
        } else {
          setRawData([]);
          setPagination(null);
        }
        return;
      }

      const buildPayload = (unit) => {
        const payload = {
          fromDate: combinedFilters.fromDate,
          toDate: combinedFilters.toDate,
          page: currentPage,
          pageSize: pageSize,
          processStageIds: activeStageIds,
        };

        if (combinedFilters.factory) {
          payload.factory = combinedFilters.factory;
        }

        if (unit) {
          payload.unit = unit;
        }

        if (combinedFilters.shift) {
          payload.shift = Number(combinedFilters.shift);
        }

        if (combinedFilters.search) {
          payload.search = combinedFilters.search;
        }

        return payload;
      };

      if (combinedFilters.factory && !combinedFilters.unit) {
        const accessibleUnitsForFactory = getAccessibleUnits(combinedFilters.factory);

        if (accessibleUnitsForFactory.length > 0) {
          const promises = accessibleUnitsForFactory.map(async (unit) => {
            const payload = buildPayload(unit);
            try {
              const response = await dashboardApi.getDashboardDetails(payload);
              if (response.success && response.data) {
                return response.data.data || [];
              }
            } catch (err) {
              console.error(`Error fetching details for unit ${unit}:`, err);
            }
            return [];
          });

          const results = await Promise.all(promises);
          const allData = results.flat();
          setRawData(allData);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            pageSize: allData.length,
            totalRecords: allData.length,
            hasNext: false,
            hasPrevious: false,
          });
        } else {
          const payload = buildPayload('');
          const response = await dashboardApi.getDashboardDetails(payload);
          if (response.success && response.data) {
            setRawData(response.data.data || []);
            setPagination(response.data.pagination || null);
          }
        }
      } else {
        const payload = buildPayload(combinedFilters.unit);
        const response = await dashboardApi.getDashboardDetails(payload);
        if (response.success && response.data) {
          setRawData(response.data.data || []);
          setPagination(response.data.pagination || null);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
      setRawData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [combinedFilters.fromDate, combinedFilters.toDate, combinedFilters.factory, combinedFilters.unit, combinedFilters.shift, combinedFilters.search, combinedFilters.transactionType, currentPage, activeStageIds, isWashDelivery]);

  const handleResetFilters = () => {
    setLocalFilters({
      search: '',
      transactionType: isWashDelivery ? '' : 'Delivery',
    });
  };

  const handleFilterChange = (field, value) => {
    if (field === 'search' || field === 'transactionType') {
      setLocalFilters((prev) => ({ ...prev, [field]: value }));
    } else if (onFilterChange) {
      if (field === 'factory') {
        onFilterChange('plant', value);
        onFilterChange('unit', '');
      } else {
        onFilterChange(field, value);
      }
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && pagination && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExportCSV = () => {
    const headers = columns.map((col) => col.label);
    const rows = aggregatedData.map((row) =>
      columns.map((col) => {
        let val = row[col.key];
        if (col.key === 'washTargetDate') val = formatDate(val);
        if (typeof val === 'string') val = val.replace(/,/g, ';');
        return val ?? 0;
      })
    );
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-details-${combinedFilters.fromDate}-to-${combinedFilters.toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Escape to close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mode badge color
  const modeColor = mode === 'dryer'
    ? { bg: isDarkMode ? 'bg-sky-500/20' : 'bg-sky-100', border: isDarkMode ? 'border-sky-400/40' : 'border-sky-300', text: isDarkMode ? 'text-sky-400' : 'text-sky-700' }
    : mode === 'wash-delivery'
    ? { bg: isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100', border: isDarkMode ? 'border-emerald-400/40' : 'border-emerald-300', text: isDarkMode ? 'text-emerald-400' : 'text-emerald-700' }
    : { bg: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100', border: isDarkMode ? 'border-blue-400/40' : 'border-blue-300', text: isDarkMode ? 'text-blue-400' : 'text-blue-700' };

  // Stage columns count (for mobile card)
  const stageColumns = columns.filter(c => c.isStage);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-2 sm:p-4 md:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-[98vw] max-h-[96vh] flex flex-col rounded-2xl shadow-2xl border-2 overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-blue-500/30 text-slate-200' : 'bg-white border-blue-200 text-slate-800'
        }`}
        style={{ maxWidth: '1600px', maxHeight: '94vh', animation: 'modalSlideIn 0.25s ease-out' }}
      >
        <style>{`
          @keyframes modalSlideIn { from { opacity:0; transform:translateY(-20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
          .tbl-row:hover td { background-color: ${isDarkMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)'} !important; }
          .scr-thin::-webkit-scrollbar { width:6px; height:6px; }
          .scr-thin::-webkit-scrollbar-track { background:transparent; }
          .scr-thin::-webkit-scrollbar-thumb { border-radius:3px; background:${isDarkMode ? '#475569' : '#cbd5e1'}; }
          .stage-header { position: sticky; top: 0; z-index: 10; }
        `}</style>

        {/* ====== HEADER ====== */}
        <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${isDarkMode ? 'bg-gradient-to-r from-slate-800 to-slate-800/95 border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 ${isDarkMode ? 'bg-blue-500/20 border-blue-400/40' : 'bg-blue-100 border-blue-300'}`}>
              <IconFilter className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-sm sm:text-base font-black uppercase tracking-wide leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {displayTitle}
                </h2>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${modeColor.bg} ${modeColor.border} ${modeColor.text}`}>
                  {mode === 'dryer' ? 'Dryer' : mode === 'wash-delivery' ? 'Wash Delivery' : 'Process'}
                </span>
              </div>
              <p className={`text-[10px] font-semibold tracking-wider uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {pagination && <span>({isWashDelivery ? rawData.length : aggregatedData.length} records of {pagination.totalRecords.toLocaleString()})</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all cursor-pointer ${isDarkMode ? 'border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'}`}>
              <IconDownload className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={onClose} className={`p-2 rounded-xl border-2 transition-all cursor-pointer hover:scale-110 ${isDarkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
              <IconX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ====== FILTER & SEARCH BAR ====== */}
        <div className={`px-4 py-3 border-b shrink-0 ${isDarkMode ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
          {/* Search + Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
            <div className="relative flex-1">
              <IconSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search by WO No, Buyer, Style..."
                value={combinedFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border-2 text-xs font-medium outline-none transition-all shadow-sm focus:border-blue-400 focus:ring-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500/20' : 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:ring-blue-200'}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[11px] font-bold transition-all cursor-pointer ${showFilters ? (isDarkMode ? 'border-blue-400 bg-blue-500/20 text-blue-400' : 'border-blue-400 bg-blue-50 text-blue-600') : (isDarkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}`}>
                <IconFilter className="w-3.5 h-3.5" /> Filters
              </button>
              <button onClick={fetchData} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[11px] font-bold transition-all cursor-pointer ${isDarkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <IconRefresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={handleResetFilters} className={`px-3 py-2 rounded-xl border-2 text-[11px] font-bold transition-all cursor-pointer ${isDarkMode ? 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}`}>
                Reset
              </button>
            </div>
          </div>

          {/* Expandable Filter Row */}
          {showFilters && (
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <FilterInput label="From Date" type="date" value={combinedFilters.fromDate} onChange={(v) => handleFilterChange('fromDate', v)} isDarkMode={isDarkMode} />
              <FilterInput label="To Date" type="date" value={combinedFilters.toDate} onChange={(v) => handleFilterChange('toDate', v)} isDarkMode={isDarkMode} />
              <FilterInput label="Factory" type="select" value={combinedFilters.factory} onChange={(v) => handleFilterChange('factory', v)} isDarkMode={isDarkMode}
                options={[
                  { value: '', label: 'All Plants' },
                  ...accessiblePlants.map((plant) => ({ value: plant, label: plant }))
                ]}
              />
              <FilterInput label="Unit" type="select" value={combinedFilters.unit} onChange={(v) => handleFilterChange('unit', v)} isDarkMode={isDarkMode} disabled={!combinedFilters.factory}
                options={[
                  { value: '', label: 'All Units' },
                  ...getAccessibleUnits(combinedFilters.factory).map((unit) => ({ value: unit, label: unit }))
                ]}
              />
              <FilterInput label="Shift" type="select" value={combinedFilters.shift} onChange={(v) => handleFilterChange('shift', v)} isDarkMode={isDarkMode}
                options={[{ value: '', label: 'All Shifts' }, { value: '1', label: 'Day' }, { value: '2', label: 'Night' }]}
              />
              {!isWashDelivery && (
              <FilterInput label="Transaction" type="select" value={combinedFilters.transactionType} onChange={(v) => handleFilterChange('transactionType', v)} isDarkMode={isDarkMode}
                options={[{ value: '', label: 'All' }, { value: 'Receive', label: 'Receive' }, { value: 'Delivery', label: 'Delivery' }]}
              />
              )}

            </div>
          )}
        </div>

        {/* ====== TABLE SECTION ====== */}
        <div className="flex-1 overflow-auto scr-thin relative">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
              <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${isDarkMode ? 'bg-slate-800/95' : 'bg-white/95'} shadow-xl`}>
                <div className={`w-8 h-8 rounded-full animate-spin ${isDarkMode ? 'border-blue-400 border-t-transparent' : 'border-blue-600 border-t-transparent'}`} style={{ borderWidth: '3px' }} />
                <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading data...</span>
              </div>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full text-xs">
              <thead>
                <tr className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gradient-to-r from-slate-800 to-slate-800/95' : 'bg-gradient-to-r from-blue-50 to-sky-50'}`}>
                  {columns.map((col) => (
                    <th key={col.key} className={`px-3 py-2.5 text-left font-black uppercase tracking-wider text-[10px] ${isDarkMode ? 'text-slate-400 border-b border-slate-700' : 'text-slate-500 border-b border-blue-100'} ${col.align || ''} ${col.isStage ? (isDarkMode ? 'bg-slate-800/80' : 'bg-amber-50/60') : ''}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aggregatedData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={columns.length} className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      <div className="flex flex-col items-center gap-2">
                        <IconFilter className={`w-8 h-8 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className="text-sm font-semibold">No data found</p>
                        <p className="text-[11px]">Try adjusting your filters or search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  aggregatedData.map((row, rowIdx) => (
                    <tr key={rowIdx} className={`tbl-row transition-colors duration-150 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-100'} ${rowIdx % 2 !== 0 ? (isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50/30') : ''}`}>
                      {columns.map((col) => (
                        <td key={col.key} className={`px-3 py-2.5 font-medium whitespace-nowrap ${col.align || 'text-left'} ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} ${col.isStage ? 'font-bold tabular-nums' : ''}`}>
                          <CellRenderer row={row} colKey={col.key} isDarkMode={isDarkMode} isStage={col.isStage} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden p-3 space-y-2">
            {aggregatedData.length === 0 && !loading ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <IconFilter className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className="text-sm font-semibold">No data found</p>
              </div>
            ) : (
              aggregatedData.map((row, rowIdx) => (
                <div key={rowIdx} className={`rounded-xl border-2 p-3 transition-all ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{row.workOrderNo || '\u2014'}</span>
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{row.factory} | {row.unit}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <MobileField label="Style" value={row.styleName} isDarkMode={isDarkMode} />
                    <MobileField label="Buyer" value={row.buyerDepartment} isDarkMode={isDarkMode} />
                    <MobileField label="Order Qty" value={formatNumber(row.orderQuantity)} isDarkMode={isDarkMode} />
                    <MobileField label="Target Date" value={formatDate(row.washTargetDate)} isDarkMode={isDarkMode} />
                    {isWashDelivery ? (
                      <>
                        <MobileField label="Color" value={row.color} isDarkMode={isDarkMode} />
                        <MobileField label="TOD" value={formatDate(row.tod)} isDarkMode={isDarkMode} />
                        <MobileField label="Receive" value={formatNumber(row.receive)} isDarkMode={isDarkMode} />
                        <MobileField label="Delivery" value={formatNumber(row.delivery)} isDarkMode={isDarkMode} />
                        <MobileField label="Total Recv" value={formatNumber(row.totalWashReceived)} isDarkMode={isDarkMode} />
                        <MobileField label="Total Delv" value={formatNumber(row.totalWashDelivery)} isDarkMode={isDarkMode} />
                      </>
                    ) : (
                      <>
                        <MobileField label={mode === 'dryer' ? 'Total Revd' : 'Total Recv'} value={formatNumber(row.totalWashReceived)} isDarkMode={isDarkMode} />
                        <MobileField label={mode === 'dryer' ? 'Total Dlv' : 'Total Delv'} value={formatNumber(row.totalWashDelivery)} isDarkMode={isDarkMode} />
                      </>
                    )}
                  </div>
                  {/* Process Stage Quantities */}
                  {!isWashDelivery && stageColumns.length > 0 && (
                    <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {mode === 'dryer' ? 'Dryer Process Qty' : 'Process Stage Qty'}
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {stageColumns.map(sc => (
                          <div key={sc.key} className={`flex items-center justify-between rounded-lg px-2 py-1 ${isDarkMode ? 'bg-slate-700/30' : 'bg-blue-50/50'}`}>
                            <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{sc.label}</span>
                            <span className={`text-[11px] font-black ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                              {formatNumber(row[sc.key])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ====== PAGINATION FOOTER ====== */}
        {pagination && pagination.totalPages > 1 && (
          <div className={`flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t shrink-0 gap-2 ${isDarkMode ? 'border-slate-700/50 bg-slate-800/80' : 'border-slate-100 bg-slate-50/80'}`}>
            <div className={`text-[11px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Page <span className="font-black text-blue-500">{pagination.currentPage}</span> of <span className="font-black">{pagination.totalPages}</span>
              <span className="mx-2">|</span>
              {((pagination.currentPage - 1) * pagination.pageSize) + 1}\u2013{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of {pagination.totalRecords.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <PageButton onClick={() => goToPage(1)} disabled={!pagination.hasPrevious} isDarkMode={isDarkMode}><IconChevronsLeft className="w-3.5 h-3.5" /></PageButton>
              <PageButton onClick={() => goToPage(currentPage - 1)} disabled={!pagination.hasPrevious} isDarkMode={isDarkMode}><IconChevronLeft className="w-3.5 h-3.5" /></PageButton>
              <PageNumbers currentPage={currentPage} totalPages={pagination.totalPages} goToPage={goToPage} isDarkMode={isDarkMode} />
              <PageButton onClick={() => goToPage(currentPage + 1)} disabled={!pagination.hasNext} isDarkMode={isDarkMode}><IconChevronRight className="w-3.5 h-3.5" /></PageButton>
              <PageButton onClick={() => goToPage(pagination.totalPages)} disabled={!pagination.hasNext} isDarkMode={isDarkMode}><IconChevronsRight className="w-3.5 h-3.5" /></PageButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ SUB-COMPONENTS ============
const FilterInput = ({ label, type, value, onChange, isDarkMode, options, disabled }) => (
  <div className="space-y-1">
    <label className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
    {type === 'select' ? (
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        disabled={disabled}
        className={`w-full border-2 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${isDarkMode ? 'bg-slate-900/60 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full border-2 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none transition-all shadow-sm focus:border-blue-400 ${isDarkMode ? 'bg-slate-900/60 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`} />
    )}
  </div>
);

const MobileField = ({ label, value, isDarkMode }) => (
  <div className="flex flex-col">
    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
    <span className={`text-[11px] font-bold truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{value || '\u2014'}</span>
  </div>
);

const PageButton = ({ children, onClick, disabled, isDarkMode }) => (
  <button onClick={onClick} disabled={disabled} className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 text-xs transition-all cursor-pointer ${disabled ? (isDarkMode ? 'border-slate-700 text-slate-600 cursor-not-allowed' : 'border-slate-200 text-slate-300 cursor-not-allowed') : (isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-blue-500/20 hover:border-blue-400 hover:text-blue-400' : 'border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600')}`}>
    {children}
  </button>
);

const PageNumbers = ({ currentPage, totalPages, goToPage, isDarkMode }) => {
  const getPages = () => {
    const p = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) p.push(i); }
    else if (currentPage <= 3) { for (let i = 1; i <= 5; i++) p.push(i); p.push('...', totalPages); }
    else if (currentPage >= totalPages - 2) { p.push(1, '...'); for (let i = totalPages - 4; i <= totalPages; i++) p.push(i); }
    else { p.push(1, '...'); for (let i = currentPage - 1; i <= currentPage + 1; i++) p.push(i); p.push('...', totalPages); }
    return p;
  };
  return (
    <div className="flex items-center gap-0.5">
      {getPages().map((pg, idx) =>
        pg === '...' ? (
          <span key={`e${idx}`} className={`w-8 h-8 flex items-center justify-center text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>...</span>
        ) : (
          <button key={pg} onClick={() => goToPage(pg)} className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 text-xs font-bold transition-all cursor-pointer ${pg === currentPage ? (isDarkMode ? 'bg-blue-500/30 border-blue-400 text-blue-300' : 'bg-blue-100 border-blue-400 text-blue-700') : (isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-blue-500/20 hover:border-blue-400' : 'border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300')}`}>
            {pg}
          </button>
        )
      )}
    </div>
  );
};

// ============ CELL RENDERER ============
const CellRenderer = ({ row, colKey, isDarkMode, isStage }) => {
  if (isStage) {
    // Process stage quantity column
    const val = row[colKey] || 0;
    return (
      <span className={`font-black tabular-nums ${val > 0 ? (isDarkMode ? 'text-cyan-400' : 'text-cyan-700') : (isDarkMode ? 'text-slate-600' : 'text-slate-300')}`}>
        {formatNumber(val)}
      </span>
    );
  }
  switch (colKey) {
    case 'workOrderNo':
      return <span className="font-black text-blue-500">{row[colKey] || '\u2014'}</span>;
    case 'buyerDepartment':
    case 'styleName':
      return <span className="truncate max-w-[160px] block" title={row[colKey]}>{row[colKey] || '\u2014'}</span>;
    case 'fastReactNo':
      return <span className="truncate max-w-[200px] block text-[11px]" title={row[colKey]}>{row[colKey] || '\u2014'}</span>;
    case 'color':
      return <span className="truncate max-w-[120px] block text-[11px]" title={row[colKey]}>{row[colKey] || '\u2014'}</span>;
    case 'tod':
      return formatDate(row[colKey]);
    case 'receive':
    case 'delivery':
      return (
        <span className={`font-bold tabular-nums ${row[colKey] > 0 ? (isDarkMode ? 'text-cyan-400' : 'text-cyan-700') : (isDarkMode ? 'text-slate-600' : 'text-slate-300')}`}>
          {formatNumber(row[colKey])}
        </span>
      );
    case 'orderQuantity':
    case 'totalWashReceived':
    case 'totalWashDelivery':
      return <span className="font-bold tabular-nums">{formatNumber(row[colKey])}</span>;
    case 'washTargetDate':
      return formatDate(row[colKey]);
    default:
      return row[colKey] || '\u2014';
  }
};

export default DashboardTableModal;
