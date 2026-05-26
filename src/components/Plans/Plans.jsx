// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\Plans\Plans.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansApi } from '../../api/plansApi';

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [plantUnitList, setPlantUnitList] = useState([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalRecords: 0
  });
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    plantId: '',
    unitId: '',
    shift: '',
    processStageId: '', // ✅ Added processStageId filter
    search: ''
  });

  useEffect(() => {
    fetchPlantUnitList();
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [pagination.pageNumber]);

  const fetchPlantUnitList = async () => {
    try {
      const response = await plansApi.getPlantUnitList();
      setPlantUnitList(response.data || []);
    } catch (error) {
      console.error('Error fetching plant/unit list:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = {
        PageNumber: pagination.pageNumber,
        PageSize: pagination.pageSize,
      };
      if (filters.fromDate) params.FromDate = filters.fromDate;
      if (filters.toDate) params.ToDate = filters.toDate;
      if (filters.plantId) params.PlantId = parseInt(filters.plantId);
      if (filters.unitId) params.UnitId = parseInt(filters.unitId);
      if (filters.shift) params.Shift = parseInt(filters.shift);
      if (filters.processStageId) params.ProcessStageId = parseInt(filters.processStageId); // ✅ Send ProcessStageId
      if (filters.search) params.Search = filters.search;

      const response = await plansApi.getWashPlans(params);

      if (response.data?.success) {
        const rawRecords = response.data.data.records || [];
        
        setPlans(rawRecords);
        setPagination(prev => ({
          ...prev,
          totalRecords: response.data.data.totalRecords || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      
      const params = {
        PageNumber: 1,
        PageSize: pagination.totalRecords > 0 ? pagination.totalRecords : 10000, 
      };
      
      if (filters.fromDate) params.FromDate = filters.fromDate;
      if (filters.toDate) params.ToDate = filters.toDate;
      if (filters.plantId) params.PlantId = parseInt(filters.plantId);
      if (filters.unitId) params.UnitId = parseInt(filters.unitId);
      if (filters.shift) params.Shift = parseInt(filters.shift);
      if (filters.processStageId) params.ProcessStageId = parseInt(filters.processStageId); // ✅ Send ProcessStageId
      if (filters.search) params.Search = filters.search;

      const response = await plansApi.getWashPlans(params);

      if (response.data?.success) {
        const rawRecords = response.data.data.records || [];

        if (rawRecords.length === 0) {
          alert('No data available to export.');
          return;
        }

        // ✅ Updated CSV Headers to match requested order
        const headers = [
          'Plan Date', 'Unit', 'Work Order', 'Buyer', 'Style', 'Color', 'PO',
          'Shift', 'Process Stage', 'Machines QTY', 'Order Qty', 'Wash Balance',
          'Base Target', 'Final Target'
        ];

        const csvRows = [headers.join(',')];

        rawRecords.forEach(plan => {
          const buyer = plan.buyer || plan.buyerDepartment || '';
          const machineQty = plan.machines ? plan.machines.length : 0; // ✅ Machine QTY
          
          const row = [
            plan.planDate || '',
            `"${(plan.unitName || '').replace(/"/g, '""')}"`,
            plan.workOrderNo || '',
            `"${buyer.replace(/"/g, '""')}"`,
            `"${(plan.styleName || '').replace(/"/g, '""')}"`,
            `"${(plan.color || '').replace(/"/g, '""')}"`,
            `"${(plan.washType || '').replace(/"/g, '""')}"`,
            plan.shift === 1 ? 'Day' : 'Night',
            plan.processStageName || '',
            machineQty,
            plan.orderQuantity || 0,
            plan.washBalance || 0,
            plan.baseTargetQty || 0,
            plan.finalTargetQty || 0
          ];
          
          csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Wash_Plans_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePlantChange = (e) => {
    setFilters(prev => ({ ...prev, plantId: e.target.value, unitId: '' }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
    fetchPlans();
  };

  const handleClearFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      plantId: '',
      unitId: '',
      shift: '',
      processStageId: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };

  const uniquePlants = Array.from(new Map(plantUnitList.map(p => [p.plantId, p])).values());
  const filteredUnits = plantUnitList.filter(p => p.plantId === parseInt(filters.plantId));
  const totalPages = Math.ceil(pagination.totalRecords / pagination.pageSize);

  return (
    <div className="p-6 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Wash Plans</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">View and manage wash production plans</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={exporting || pagination.totalRecords === 0}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            {exporting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <button
            onClick={() => navigate('/plans/create')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Plan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Shift</label>
            <select
              value={filters.shift}
              onChange={(e) => handleFilterChange('shift', e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="">All Shifts</option>
              <option value="1">Day</option>
              <option value="2">Night</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Process Stage</label>
            <select
              value={filters.processStageId}
              onChange={(e) => handleFilterChange('processStageId', e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="">All Stages</option>
              <option value="1">1st Dry</option>
              <option value="2">Unwash</option>
              <option value="3">2nd Dry</option>
              <option value="4">1st Wash</option>
              <option value="5">Final Wash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Plant</label>
            <select
              value={filters.plantId}
              onChange={handlePlantChange}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="">All Plants</option>
              {uniquePlants.map(plant => (
                <option key={plant.plantId} value={plant.plantId}>{plant.plantName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Unit</label>
            <select
              value={filters.unitId}
              onChange={(e) => handleFilterChange('unitId', e.target.value)}
              disabled={!filters.plantId}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200 disabled:bg-gray-100 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              <option value="">All Units</option>
              {filteredUnits.map(unit => (
                <option key={unit.unitId} value={unit.unitId}>{unit.unitName}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Search</label>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="WO, Style..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col" style={{ maxHeight: 'calc(100vh - 380px)' }}>
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Plan Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Work Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Buyer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Style</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Color</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">PO</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Process Stage</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Machines QTY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Order Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Wash Balance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Base Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Final Target</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                    <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    <svg className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="font-medium">No wash plans found</p>
                    <p className="text-sm mt-1">Adjust filters or create a new plan</p>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={`${plan.id || plan.workOrderId}-${plan.processStageId}`} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200 font-medium">
                      {plan.planDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300">
                      {plan.unitName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {plan.workOrderNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400 max-w-[100px] truncate" title={plan.buyer || plan.buyerDepartment}>
                      {plan.buyer || plan.buyerDepartment} 
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-200 max-w-[140px] truncate" title={plan.styleName}>
                      {plan.styleName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-300 max-w-[100px] truncate" title={plan.color}>
                      {plan.color}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-slate-400">
                      {plan.washType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${plan.shift === 1 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {plan.shift === 1 ? 'Day' : 'Night'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {plan.processStageName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm font-bold text-gray-700 dark:text-slate-300">
                      {plan.machines ? plan.machines.length : 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                      {plan.orderQuantity?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`font-medium ${plan.washBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {plan.washBalance?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200 font-medium">
                      {plan.baseTargetQty?.toLocaleString() || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700 dark:text-green-400 font-semibold">
                      {plan.finalTargetQty?.toLocaleString() || '-'}
                    </td>                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalRecords > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Showing {(pagination.pageNumber - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalRecords)} of{' '}
              {pagination.totalRecords} records
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.pageNumber === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={pagination.pageNumber === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                {pagination.pageNumber} / {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={pagination.pageNumber >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={pagination.pageNumber >= totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .dark .custom-scrollbar {
          scrollbar-color: #475569 transparent;
        }
      `}</style>
    </div>
  );
};

export default Plans;






// GET
// /api/WashPlan/get-wash-plan


// Parameters
// Try it out
// Name	Description
// FromDate
// string($date)
// (query)
// FromDate
// ToDate
// string($date)
// (query)
// ToDate
// PlantId
// integer($int32)
// (query)
// PlantId
// UnitId
// integer($int32)
// (query)
// UnitId
// Shift
// integer($int32)
// (query)
// Shift
// ProcessStageId
// integer($int32)
// (query)
// ProcessStageId
// Search
// string
// (query)
// Search
// PageNumber
// integer($int32)
// (query)
// PageNumber
// PageSize
// integer($int32)
// (query)
// PageSize
// Responses
// Code	Description	Links
// 200	
// OK
// http://192.168.136.53:5000/api/WashPlan/get-wash-plan?PageNumber=1&PageSize=20&FromDate=2026-05-06&ToDate=2026-05-06
// {"success":true,"message":"Wash plan fetched successfully","data":{"totalRecords":3,"pageNumber":1,"pageSize":20,"records":[{"id":38,"workOrderId":7732,"workOrderNo":"00066902","planDate":"2026-05-06","plantId":1,"plantName":"TPL","unitId":1,"unitName":"Unit 1","shift":1,"factory":"TFL","line":"Line D","buyer":"","buyerDepartment":"LPP::LPP","styleName":"889IU","fastReactNo":"11322532::50J Light Blue Jeans::260126","color":"50J Light Blue Jeans","washType":"Fancy Wash","orderQuantity":1700.00,"cutQty":1823.00,"tod":"2026-01-26T00:00:00","sewingCompDate":"2026-01-26T00:00:00","firstRCVDate":"2026-01-25T00:00:00","washApprovalDate":"2026-01-27T00:00:00","washTargetDate":"2026-02-03T00:00:00","totalWashReceived":1820.00,"totalWashDelivery":1796.00,"washBalance":24.00,"marks":"","processStageId":1,"processStageName":"1st Dry","machines":[],"finalTargetQty":125.00,"baseTargetQty":580.00},{"id":39,"workOrderId":34459,"workOrderNo":"00069878","planDate":"2026-05-06","plantId":1,"plantName":"TPL","unitId":1,"unitName":"Unit 1","shift":1,"factory":"TSL-2","line":"Line S2C","buyer":"GROUPE DYNAMITE::GROUPE DYNAMITE","buyerDepartment":"GROUPE DYNAMITE::GROUPE DYNAMITE","styleName":"100103130","fastReactNo":"553123::632 Marine::030526","color":"632 Marine","washType":"553123::632 Marine::030526","orderQuantity":998.00,"cutQty":1116.00,"tod":"2026-05-03T00:00:00","sewingCompDate":"2026-04-18T00:00:00","firstRCVDate":"2026-04-18T00:00:00","washApprovalDate":"2026-01-29T00:00:00","washTargetDate":"2026-04-30T00:00:00","totalWashReceived":1112.00,"totalWashDelivery":1039.00,"washBalance":73.00,"marks":"কালো সোনালী সুতা HEM Cut-179","processStageId":4,"processStageName":"1st Wash","machines":[{"machineId":27,"machineCode":"Tonello-03"},{"machineId":28,"machineCode":"Tolkar-04"}],"finalTargetQty":1659.00,"baseTargetQty":2860.00},{"id":40,"workOrderId":7732,"workOrderNo":"00066902","planDate":"2026-05-06","plantId":1,"plantName":"TPL","unitId":1,"unitName":"Unit 1","shift":1,"factory":"TFL","line":"Line D","buyer":"","buyerDepartment":"LPP::LPP","styleName":"889IU","fastReactNo":"11322532::50J Light Blue Jeans::260126","color":"50J Light Blue Jeans","washType":"Fancy Wash","orderQuantity":1700.00,"cutQty":1823.00,"tod":"2026-01-26T00:00:00","sewingCompDate":"2026-01-26T00:00:00","firstRCVDate":"2026-01-25T00:00:00","washApprovalDate":"2026-01-27T00:00:00","washTargetDate":"2026-02-03T00:00:00","totalWashReceived":1820.00,"totalWashDelivery":1796.00,"washBalance":24.00,"marks":"","processStageId":2,"processStageName":"Unwash","machines":[{"machineId":25,"machineCode":"Tonello-01"},{"machineId":26,"machineCode":"Tonello-02"}],"finalTargetQty":0.00,"baseTargetQty":1230.00}]}}
 

// amar wash and dry both jokhon access thakbe tokhon user dryer process stage gulay just date, shift, baseTargetQty quantiry add korbe ar kono field add kora mandatory na
// and jokhon process stage dryer thakbe tokhon baseTargetQty add korte parbe na final target add korbe machine select korbe all field add kore submit dibe

// and planned tab a wash user je baseTargetQty value add kora chilo seta dekhte parbe and finalTargetQty value add kore other machine and others field add kore submit korte parbe







