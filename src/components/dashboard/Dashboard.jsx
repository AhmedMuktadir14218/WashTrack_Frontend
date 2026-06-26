// // D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\dashboard\Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { dashboardApi } from '../../api/dashboardApi';
// import DashboardTableModal from './DashboardTableModal';
// import { useAuth } from '../../hooks/useAuth';

// // ============ CUSTOM SVG ICONS ============
// const IconFilter = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
//   </svg>
// );

// const IconTrendingUp = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
//     <polyline points="17 6 23 6 23 12" />
//   </svg>
// );

// const IconTrendingDown = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
//     <polyline points="17 18 23 18 23 12" />
//   </svg>
// );

// const IconBarChart = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <line x1="12" y1="20" x2="12" y2="10" />
//     <line x1="18" y1="20" x2="18" y2="4" />
//     <line x1="6" y1="20" x2="6" y2="16" />
//   </svg>
// );

// const IconHome = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
//     <polyline points="9 22 9 12 15 12 15 22" />
//   </svg>
// );

// const IconWaterDrop = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
//   </svg>
// );

// const IconFire = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
//   </svg>
// );

// const IconCalendar = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
//     <line x1="16" y1="2" x2="16" y2="6" />
//     <line x1="8" y1="2" x2="8" y2="6" />
//     <line x1="3" y1="10" x2="21" y2="10" />
//   </svg>
// );

// const IconBuilding = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
//     <path d="M9 22V12h6v10" />
//     <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M8 18h.01" />
//   </svg>
// );

// const IconClock = ({ className = '' }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="12" cy="12" r="10" />
//     <polyline points="12 6 12 12 16 14" />
//   </svg>
// );


// // ============ MAIN DASHBOARD ============
// const Dashboard = ({ isDarkMode }) => {
//   const { user, isAdmin, isIncharge, isPlanner } = useAuth();
//  useEffect(() => {
//     console.log('========== DASHBOARD DEBUG ==========');
//     console.log('👤 User object:', user);
//     console.log('🎭 User Roles:', user?.roles);
//     console.log('🏭 User Assigns:', user?.userAssigns);
//     console.log('📋 Process Stage Accesses:', user?.processStageAccesses);
//     console.log('✅ isAdmin():', isAdmin());
//     console.log('✅ isIncharge():', isIncharge());
//     console.log('✅ isPlanner():', isPlanner());
//     console.log('=====================================');
//   }, [user]);

//   const today = new Date();
//   const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

//   const plantUnits = {
//     TPL: ['TPL Dry Unit', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'],
//     TWL: ['Unit TWL'],
//   };

//   const allUnits = ['TPL Dry Unit', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit TWL'];

//   const PLANT_NAME_TO_ID = { TPL: 1, TWL: 2 };
//   const UNIT_NAME_TO_ID = { 'TPL Dry Unit': 1, 'Unit 1': 2, 'Unit 2': 3, 'Unit 3': 4, 'Unit 4': 5, 'Unit 5': 6, 'Unit TWL': 7 };

// // ============ FIXED FUNCTIONS ============

// const getAccessiblePlants = () => {
//   // ✅ Check if user exists AND has assignments
//   if (user && user.userAssigns && user.userAssigns.length > 0) {
//     // ✅ Use plantName (not plantId)
//     const uniquePlants = [...new Set(user.userAssigns.map(assignment => assignment.plantName))];
//     return uniquePlants;
//   }
  
//   // ✅ Only return default plants if truly no restrictions
//   // For normal users with no assignments, return empty
//   if (!isAdmin() && !isIncharge() && !isPlanner()) {
//     return [];
//   }
  
//   // ✅ Super admin with no specific assignments gets all
//   return ['TPL', 'TWL'];
// };

// const getAccessibleUnits = (plantId) => {
//   // ✅ Check if user exists AND has assignments
//   if (user && user.userAssigns && user.userAssigns.length > 0) {
//     const units = user.userAssigns
//       .filter(assignment => assignment.plantName === plantId) // ✅ Match by name
//       .map(assignment => assignment.unitName); // ✅ Return unitName
//     return [...new Set(units)];
//   }
  
//   // ✅ Fallback to predefined units if no assignments
//   if (plantUnits[plantId]) {
//     return plantUnits[plantId];
//   }
  
//   return [];
// };
//   const accessiblePlants = getAccessiblePlants();

//   const getDefaultFilters = () => {
//     return {
//       fromDate: todayStr,
//       toDate: todayStr,
//       unit: '',
//       shift: '',
//       plant: '',
//     };
//   };

//   const [filters, setFilters] = useState(getDefaultFilters);

//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalConfig, setModalConfig] = useState({ processStageIds: [], modalTitle: '', mode: 'process' });

//   const [dhuData, setDhuData] = useState({
//     drySummary: [],
//     wetSummary: [],
//     dryIssues1: [],
//     dryIssues3: [],
//     wetIssues2: [],
//     wetIssues4: [],
//   });

//   const openModal = (config) => {
//     setModalConfig(config);
//     setIsModalOpen(true);
//   };

//   const processDashboardData = (data) => {
//     if (!data || data.length === 0) return null;

//     const aggregated = {
//       '1st Dry': { delivery: 0, receive: 0 },
//       'Unwash': { delivery: 0, receive: 0 },
//       '2nd Dry': { delivery: 0, receive: 0 },
//       '1st Wash': { delivery: 0, receive: 0 },
//       'Final Wash': { delivery: 0, receive: 0 },
//       '1st Dryer': { delivery: 0 },
//       '2nd Dryer': { delivery: 0 },
//       'Final Dryer': { delivery: 0 },
//       'Cool Dryer': { delivery: 0 },
//       'ReDryer': { delivery: 0 },
//     };

//     data.forEach((item) => {
//       const stage = item.processStageName;
//       const type = item.transactionType.toLowerCase();
//       const qty = item.totalQuantity || 0;

//       if (aggregated[stage]) {
//         if (type === 'delivery') {
//           aggregated[stage].delivery += qty;
//         } else if (type === 'receive' && aggregated[stage].receive !== undefined) {
//           aggregated[stage].receive += qty;
//         }
//       }
//     });

//     return aggregated;
//   };

//   const fetchDashboardData = async () => {
//     if (!filters.fromDate || !filters.toDate) {
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       let allData = [];

//       if (filters.plant) {
//         if (filters.unit) {
//           const payload = {
//             fromDate: filters.fromDate,
//             toDate: filters.toDate,
//             plant: filters.plant,
//             unit: filters.unit,
//             shift: filters.shift ? Number(filters.shift) : undefined,
//           };
//           const response = await dashboardApi.getDashboardSummary(payload);
//           if (response.success && response.data) {
//             allData = response.data;
//           }
//         } else {
//           const accessibleUnitsForPlant = getAccessibleUnits(filters.plant);
          
//           if (accessibleUnitsForPlant.length > 0) {
//             const promises = accessibleUnitsForPlant.map(async (unit) => {
//               const payload = {
//                 fromDate: filters.fromDate,
//                 toDate: filters.toDate,
//                 plant: filters.plant,
//                 unit: unit,
//                 shift: filters.shift ? Number(filters.shift) : undefined,
//               };
//               const response = await dashboardApi.getDashboardSummary(payload);
//               return response.success && response.data ? response.data : [];
//             });
            
//             const results = await Promise.all(promises);
//             allData = results.flat();
//           } else {
//             const payload = {
//               fromDate: filters.fromDate,
//               toDate: filters.toDate,
//               plant: filters.plant,
//               shift: filters.shift ? Number(filters.shift) : undefined,
//             };
//             const response = await dashboardApi.getDashboardSummary(payload);
//             if (response.success && response.data) {
//               allData = response.data;
//             }
//           }
//         }
//       } else {
//         const plantsToFetch = accessiblePlants.length > 0 ? accessiblePlants : ['TPL', 'TWL'];
        
//         const promises = plantsToFetch.map(async (plant) => {
//           const accessibleUnitsForPlant = getAccessibleUnits(plant);
          
//           if (accessibleUnitsForPlant.length > 0) {
//             const unitPromises = accessibleUnitsForPlant.map(async (unit) => {
//               const payload = {
//                 fromDate: filters.fromDate,
//                 toDate: filters.toDate,
//                 plant: plant,
//                 unit: unit,
//                 shift: filters.shift ? Number(filters.shift) : undefined,
//               };
//               const response = await dashboardApi.getDashboardSummary(payload);
//               return response.success && response.data ? response.data : [];
//             });
            
//             const unitResults = await Promise.all(unitPromises);
//             return unitResults.flat();
//           } else {
//             const payload = {
//               fromDate: filters.fromDate,
//               toDate: filters.toDate,
//               plant: plant,
//               shift: filters.shift ? Number(filters.shift) : undefined,
//             };
//             const response = await dashboardApi.getDashboardSummary(payload);
//             return response.success && response.data ? response.data : [];
//           }
//         });

//         const results = await Promise.all(promises);
//         allData = results.flat();
//       }

//       setDashboardData(processDashboardData(allData));
//     } catch (err) {
//       setError(err.message || 'Failed to fetch dashboard data');
//       console.error('Dashboard data fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const buildDhuParams = () => {
//     const params = {
//       fromDate: filters.fromDate,
//       toDate: filters.toDate || filters.fromDate,
//     };
//     if (filters.plant && PLANT_NAME_TO_ID[filters.plant]) {
//       params.plantIds = [PLANT_NAME_TO_ID[filters.plant]];
//     }
//     if (filters.unit && UNIT_NAME_TO_ID[filters.unit]) {
//       params.unitIds = [UNIT_NAME_TO_ID[filters.unit]];
//     }
//     if (filters.shift) {
//       params.shifts = [Number(filters.shift)];
//     }
//     return params;
//   };

//   const fetchDHUData = async () => {
//     if (!filters.fromDate) return;
//     try {
//       const baseParams = buildDhuParams();

//       const [drySummary, wetSummary, dryIssues1, dryIssues3, wetIssues2, wetIssues4] = await Promise.all([
//         dashboardApi.getDryProcessSummary(baseParams),
//         dashboardApi.getWetProcessSummary(baseParams),
//         dashboardApi.getTopIssues({ ...baseParams, processModuleIds: [1] }),
//         dashboardApi.getTopIssues({ ...baseParams, processModuleIds: [3] }),
//         dashboardApi.getWetTopIssues({ ...baseParams, processModuleIds: [2] }),
//         dashboardApi.getWetTopIssues({ ...baseParams, processModuleIds: [4] }),
//       ]);

//       setDhuData({
//         drySummary: Array.isArray(drySummary) ? drySummary : (drySummary?.data && Array.isArray(drySummary.data) ? drySummary.data : []),
//         wetSummary: Array.isArray(wetSummary) ? wetSummary : (wetSummary?.data && Array.isArray(wetSummary.data) ? wetSummary.data : []),
//         dryIssues1: Array.isArray(dryIssues1) ? dryIssues1 : (dryIssues1?.data && Array.isArray(dryIssues1.data) ? dryIssues1.data : []),
//         dryIssues3: Array.isArray(dryIssues3) ? dryIssues3 : (dryIssues3?.data && Array.isArray(dryIssues3.data) ? dryIssues3.data : []),
//         wetIssues2: Array.isArray(wetIssues2) ? wetIssues2 : (wetIssues2?.data && Array.isArray(wetIssues2.data) ? wetIssues2.data : []),
//         wetIssues4: Array.isArray(wetIssues4) ? wetIssues4 : (wetIssues4?.data && Array.isArray(wetIssues4.data) ? wetIssues4.data : []),
//       });
//     } catch (err) {
//       console.error('DHU data fetch error:', err);
//     }
//   };

//   const getSectionDHU = (processModuleId) => {
//     const isDry = [1, 3].includes(processModuleId);
//     const summary = isDry
//       ? dhuData.drySummary.filter(d => d.processModuleId === processModuleId)
//       : dhuData.wetSummary.filter(d => d.processModuleId === processModuleId);

//     let topIssues = [];
//     if (processModuleId === 1) topIssues = dhuData.dryIssues1;
//     else if (processModuleId === 3) topIssues = dhuData.dryIssues3;
//     else if (processModuleId === 2) topIssues = dhuData.wetIssues2;
//     else if (processModuleId === 4) topIssues = dhuData.wetIssues4;

//     const totalPassQty = summary.reduce((s, d) => s + (d.passQty || 0), 0);
//     const totalDefectQty = summary.reduce((s, d) => s + (d.defectQty || 0), 0);
//     const totalRejectQty = summary.reduce((s, d) => s + (d.rejectQty || 0), 0);
//     const totalIssueQty = summary.reduce((s, d) => s + (d.issueQty || 0), 0);
//     const overallDhu = (totalPassQty + totalDefectQty) > 0
//       ? parseFloat(((totalDefectQty / (totalPassQty + totalDefectQty)) * 100).toFixed(2))
//       : 0;

//     return {
//       processes: summary,
//       totalPassQty,
//       totalDefectQty,
//       totalRejectQty,
//       totalIssueQty,
//       overallDhu,
//       dhuStatus: overallDhu <= 10 ? 'good' : 'action',
//       topIssues: (topIssues || []).slice(0, 3),
//     };
//   };

//   useEffect(() => {
//     fetchDashboardData();
//     fetchDHUData();
//   }, [filters]);

//   const formatNumber = (num) => {
//     if (num === null || num === undefined) return '0';
//     return num.toLocaleString();
//   };

//   const handleFilterChange = (field, value) => {
//     if (field === 'plant') {
//       setFilters((prev) => ({ ...prev, [field]: value, unit: '' }));
//     } else {
//       setFilters((prev) => ({ ...prev, [field]: value }));
//     }
//   };

//   const getAvailableUnits = () => {
//     if (filters.plant && getAccessibleUnits(filters.plant).length > 0) {
//       return getAccessibleUnits(filters.plant);
//     }
//     if (filters.plant && plantUnits[filters.plant]) {
//       return plantUnits[filters.plant];
//     }
//     return allUnits;
//   };

//   const resetFilters = () => {
//     setFilters({
//       fromDate: todayStr,
//       toDate: todayStr,
//       unit: '',
//       shift: '',
//       plant: '',
//     });
//   };

//   return (
//     <>
//       <style>{`
//         .MuiBox-root {
//           padding: 0 !important;
//         }
//       `}</style>
//       <div
//         className={`min-h-screen w-full p-0 m-0 ${
//           isDarkMode
//             ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
//             : 'bg-gradient-to-br from-blue-100 via-sky-100 to-blue-50'
//         }`}
//         style={{ margin: 0, padding: 0 }}
//       >
//       <div className="max-w-[1600px] mx-auto flex flex-col gap-2">
//         {/* Header */}
//         {/* <Header /> */}

//         {/* Filter Panel */}
//         <FilterPanel
//           filters={filters}
//           onFilterChange={handleFilterChange}
//           onReset={resetFilters}
//           isDarkMode={isDarkMode}
//           plantUnits={plantUnits}
//           allUnits={allUnits}
//           getAvailableUnits={getAvailableUnits}
//           accessiblePlants={accessiblePlants}
//           isAdmin={isAdmin}
//           isIncharge={isIncharge}
//           isPlanner={isPlanner}
//           user={user}
//         />

//         {/* Loading State */}
//         {loading && (
//           <div className="flex items-center justify-center py-8">
//             <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-blue-500' : 'border-blue-600'}`}></div>
//           </div>
//         )}

//         {/* Error State */}
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
//             <strong>Error:</strong> {error}
//           </div>
//         )}

//         {/* Top Summary Cards */}
//         {!loading && !error && (
//           <TopSummaryCards isDarkMode={isDarkMode} dashboardData={dashboardData} onCardClick={openModal} />
//         )}


//         {/* DHU Summary */}
//         {!loading && !error && (
//           <SectionLabel title="DHU Summary" color="blue" isDarkMode={isDarkMode} />
//         )}

//         {!loading && !error && (
//           <DHUOverviewGrid isDarkMode={isDarkMode} getSectionDHU={getSectionDHU} />
//         )}

//         {/* Dryer Production Summary Label */}
//         {!loading && !error && (
//           <SectionLabel title="Dryer Production Summary" color="sky" isDarkMode={isDarkMode} />
//         )}

//         {/* Dryer Production Cards */}
//         {!loading && !error && (
//           <DryerProductionSummary isDarkMode={isDarkMode} dashboardData={dashboardData} onCardClick={openModal} />
//         )}
//       </div>
//       </div>

//       {/* Dashboard Details Modal */}
//       <DashboardTableModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         isDarkMode={isDarkMode}
//         filters={filters}
//         onFilterChange={handleFilterChange}
//         processStageIds={modalConfig.processStageIds}
//         modalTitle={modalConfig.modalTitle}
//         mode={modalConfig.mode}
//       />
//     </>
//   );
// };

// // ============ HEADER ============
// const Header = () => (
//   <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-blue-900/30">
//     <div className="flex items-center gap-3">
//       {/* Logo bars */}
//       <div className="flex gap-1">
//         <div className="w-[5px] h-4 bg-blue-400 rounded-sm -skew-x-[15deg]" />
//         <div className="w-[8px] h-4 bg-blue-300 rounded-sm -skew-x-[15deg]" />
//         <div className="w-[5px] h-4 bg-white/80 rounded-sm -skew-x-[15deg]" />
//       </div>
//       <div>
//         <h1 className="text-white text-sm md:text-lg font-black italic uppercase tracking-tight leading-tight">
//           Processwise Delivery Summary Dashboard
//         </h1>
//         <p className="text-blue-300 text-[10px] font-semibold uppercase tracking-widest">
//           DHU & Dryer Analytics • Live Report
//         </p>
//       </div>
//     </div>
//   </header>
// );

// // ============ FILTER PANEL ============
// const FilterPanel = ({ filters, onFilterChange, onReset, isDarkMode, plantUnits, allUnits, getAvailableUnits, accessiblePlants, isAdmin, isIncharge, user, isPlanner }) => (
//   <div className="overflow-visible">
//     <div
//       className={`backdrop-blur-sm border-2 rounded-xl shadow-lg p-3 mt-4 mb-2 ${
//         isDarkMode
//           ? 'bg-slate-800/95 border-blue-500/30'
//           : 'bg-white/95 border-blue-200'
//       }`}
//     >

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//         {/* From Date */}
//         <div className="space-y-1.5">
//           <label
//             className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
//               isDarkMode ? 'text-slate-400' : 'text-slate-500'
//             }`}
//           >
//             <IconCalendar className="w-3 h-3 text-blue-500" />
//             From Date
//           </label>
//           <input
//             type="date"
//             value={filters.fromDate}
//             onChange={(e) => onFilterChange('fromDate', e.target.value)}
//             className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm focus:border-blue-400 ${
//               isDarkMode
//                 ? 'bg-slate-900/50 border-slate-600 text-slate-200'
//                 : 'bg-slate-50 border-slate-200 text-slate-700'
//             }`}
//           />
//         </div>

//         {/* To Date */}
//         <div className="space-y-1.5">
//           <label
//             className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
//               isDarkMode ? 'text-slate-400' : 'text-slate-500'
//             }`}
//           >
//             <IconCalendar className="w-3 h-3 text-blue-500" />
//             To Date
//           </label>
//           <input
//             type="date"
//             value={filters.toDate}
//             onChange={(e) => onFilterChange('toDate', e.target.value)}
//             className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm focus:border-blue-400 ${
//               isDarkMode
//                 ? 'bg-slate-900/50 border-slate-600 text-slate-200'
//                 : 'bg-slate-50 border-slate-200 text-slate-700'
//             }`}
//           />
//         </div>
//                 {/* Select Plant */}
//         <div className="space-y-1.5">
//           <label
//             className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
//               isDarkMode ? 'text-slate-400' : 'text-slate-500'
//             }`}
//           >
//             <IconBuilding className="w-3 h-3 text-blue-500" />
//             Select Plant
//           </label>
//           <select
//             value={filters.plant}
//             onChange={(e) => onFilterChange('plant', e.target.value)}
//             className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
//               isDarkMode
//                 ? 'bg-slate-900/50 border-slate-600 text-slate-200'
//                 : 'bg-slate-50 border-slate-200 text-slate-700'
//             }`}
//           >
//            <option value="">All Plants</option>
//   {/* ✅ SIMPLIFIED LOGIC: Just show accessible plants */}
//   {accessiblePlants.map((plant) => (
//     <option key={plant} value={plant}>{plant}</option>
//   ))}
//           </select>
//         </div>

//         {/* Select Unit */}
//         <div className="space-y-1.5">
//           <label
//             className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
//               isDarkMode ? 'text-slate-400' : 'text-slate-500'
//             }`}
//           >
//             <IconBuilding className="w-3 h-3 text-blue-500" />
//             Select Unit
//           </label>
//           <select
//             value={filters.unit}
//             onChange={(e) => onFilterChange('unit', e.target.value)}
//             disabled={!filters.plant}
//             className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
//               isDarkMode
//                 ? 'bg-slate-900/50 border-slate-600 text-slate-200'
//                 : 'bg-slate-50 border-slate-200 text-slate-700'
//             } ${!filters.plant ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             <option value="">All Units</option>
//             {getAvailableUnits().map((unit) => (
//               <option key={unit} value={unit}>{unit}</option>
//             ))}
//           </select>
//         </div>

//         {/* Select Shift */}
//         <div className="space-y-1.5">
//           <label
//             className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
//               isDarkMode ? 'text-slate-400' : 'text-slate-500'
//             }`}
//           >
//             <IconClock className="w-3 h-3 text-blue-500" />
//             Select Shift
//           </label>
//           <select
//             value={filters.shift}
//             onChange={(e) => onFilterChange('shift', e.target.value)}
//             className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
//               isDarkMode
//                 ? 'bg-slate-900/50 border-slate-600 text-slate-200'
//                 : 'bg-slate-50 border-slate-200 text-slate-700'
//             }`}
//           >
//             <option value="">-- Select Shift --</option>
//             <option value="1">Day</option>
//             <option value="2">Night</option>
//           </select>
//         </div>


//       </div>

//       {/* <div className="flex justify-end mt-3 gap-2">
//         <button
//           onClick={onReset}
//           className={`px-4 py-2 rounded-lg border-2 text-xs font-bold transition cursor-pointer ${
//             isDarkMode
//               ? 'border-slate-600 text-slate-400 hover:bg-slate-700'
//               : 'border-slate-200 text-slate-600 hover:bg-slate-50'
//           }`}
//         >
//           Reset
//         </button>
//         <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 cursor-pointer">
//           Apply Filter
//         </button>
//       </div> */}
//     </div>
//   </div>
// );

// // ============ TOP SUMMARY CARDS ============
// const PROCESS_STAGE_IDS = {
//   '1st Dry Section': [1],
//   'UnWash Godown': [2],
//   '1st Wash Section': [4],
//   '2nd Dry Section': [3],
// };

// const DRYER_STAGE_IDS = {
//   '1st Wash Dryer': [6],
//   '2nd Dryer': [7],
//   'Final Dryer': [8],
//   'Cool Dryer': [9],
//   'ReDryer': [10],
// };

// const TopSummaryCards = ({ isDarkMode, dashboardData, onCardClick }) => {
//   const cards = [
//     {
//       title: '1st Dry Section',
//       type: 'blue',
//       icon: 'chart',
//       received: dashboardData?.['1st Dry']?.receive || 0,
//       delivery: dashboardData?.['1st Dry']?.delivery || 0,
//       showBoth: true,
//     },
//     {
//       title: 'UnWash Godown',
//       type: 'blue',
//       icon: 'home',
//       // mainValue: dashboardData?.['Unwash']?.delivery || 0,
//       delivery: dashboardData?.['Unwash']?.delivery || 0,
//       showChart: true,
//     },
//     {
//       title: '1st Wash Section',
//       type: 'blue',
//       icon: 'water',
//       delivery: dashboardData?.['1st Wash']?.delivery || 0,
//       showDeliveryOnly: true,
//     },
//     {
//       title: '2nd Dry Section',
//       type: 'blue',
//       icon: 'fire',
//       received: dashboardData?.['2nd Dry']?.receive || 0,
//       delivery: dashboardData?.['2nd Dry']?.delivery || 0,
//       showBoth: true,
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
//       {cards.map((card, index) => (
//         <TopCard
//           key={index}
//           card={card}
//           isDarkMode={isDarkMode}
//           onCardClick={() => onCardClick({
//             processStageIds: PROCESS_STAGE_IDS[card.title] || [1],
//             modalTitle: card.title,
//             mode: 'process',
//           })}
//         />
//       ))}
//     </div>
//   );
// };

// const TopCard = ({ card, isDarkMode, onCardClick }) => {
//   const isOrange = card.type === 'orange';

//   const getIcon = () => {
//     const iconClass = `w-4 h-4 ${isOrange ? 'text-orange-500' : 'text-blue-500'}`;
//     switch (card.icon) {
//       case 'chart':
//         return <IconBarChart className={iconClass} />;
//       case 'home':
//         return <IconHome className={iconClass} />;
//       case 'water':
//         return <IconWaterDrop className={iconClass} />;
//       case 'fire':
//         return <IconFire className={iconClass} />;
//       default:
//         return <IconBarChart className={iconClass} />;
//     }
//   };

//   return (
//     <div
//       onClick={onCardClick}
//       className={`border-2 rounded-2xl p-3 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
//         isDarkMode
//           ? isOrange
//             ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-400/30 hover:shadow-orange-500/20'
//             : 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/30 hover:shadow-blue-500/20'
//           : isOrange
//             ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-300 hover:shadow-orange-200/50'
//             : 'bg-gradient-to-br from-white to-blue-50 border-blue-200 hover:shadow-blue-200/50'
//       }`}
//     >
//       {/* Header */}
//       <div className="flex justify-between items-center mb-1">
//         <h2
//           className={`font-bold text-base leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
//         >
//           {card.title}
//         </h2>
//         <div
//           className={`p-1 rounded-lg border ${
//             isOrange
//               ? isDarkMode
//                 ? 'bg-orange-500/20 border-orange-400/30'
//                 : 'bg-orange-50 border-orange-200'
//               : isDarkMode
//                 ? 'bg-blue-500/20 border-blue-400/30'
//                 : 'bg-blue-50 border-blue-100'
//           }`}
//         >
//           {getIcon()}
//         </div>
//       </div>

//       {/* Content */}
//       {card.showBoth && (
//         <div className="flex items-center justify-between">
//           <CardIcon type={card.type} />
//           <div className="flex gap-3">
//             <StatBox
//               label="Received"
//               value={card.received}
//               trend="up"
//               isDarkMode={isDarkMode}
//             />
//             <div
//               className={`w-px ${isOrange ? 'bg-orange-200' : 'bg-blue-200'}`}
//             />
//             <StatBox
//               label="Delivery"
//               value={card.delivery}
//               trend="down"
//               isGreen
//               isDarkMode={isDarkMode}
//             />
//           </div>
//         </div>
//       )}

//       {card.showDeliveryOnly && (
//         <div className="flex items-center justify-between">
//           <WashIcon />
//           <div className="text-center">
//             <p
//               className={`text-xs font-bold uppercase tracking-wider mb-0 ${
//                 isDarkMode ? 'text-slate-400' : 'text-slate-500'
//               }`}
//             >
//               Delivery
//             </p>
//             <span
//               className={`text-3xl font-black leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
//             >
//               {card.delivery?.toLocaleString()}
//             </span>
//           </div>
//         </div>
//       )}

//       {card.showChart && (
//         <div className="flex items-center justify-between">
//           <WashIcon2 />
//           <div className="text-center">
//             <p
//               className={`text-xs font-bold uppercase tracking-wider mb-0 ${
//                 isDarkMode ? 'text-slate-400' : 'text-slate-500'
//               }`}
//             > 
//                Delivery
//             </p>
//             <span
//               className={`text-3xl font-black leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
//             >
//               {card.delivery?.toLocaleString()}
//             </span>
//           </div>
//         </div>
//         // <div className="flex items-end justify-between gap-2">
//         //   <div className="text-center">
//         //     <span
//         //       className={`text-3xl font-black block leading-none ${
//         //         isDarkMode ? 'text-slate-200' : 'text-slate-800'
//         //       }`}
//         //     >
//         //       {card.delivery?.toLocaleString()}
//         //     </span>
//         //     <span
//         //       className={`text-xs font-bold uppercase mt-0.5 block leading-tight ${
//         //         isDarkMode ? 'text-slate-400' : 'text-slate-500'
//         //       }`}
//         //     >
//         //       Unwash
//         //       <br />
//         //       Delivery
//         //     </span>
//         //   </div>
//         //   <MiniBarChart isDarkMode={isDarkMode} />
//         // </div>
//       )}
//     </div>
//   );
// };

// const StatBox = ({ label, value, trend, isGreen, isDarkMode }) => {
//   const formatNumber = (num) => {
//     if (num === null || num === undefined) return '0';
//     return num.toLocaleString();
//   };

//   return (
//     <div className="text-center">
//       <p
//         className={`text-xs font-bold uppercase tracking-wider mb-0 ${
//           isDarkMode ? 'text-slate-400' : 'text-slate-500'
//         }`}
//       >
//         {label}
//       </p>
//       <div className="flex items-center gap-0.5 justify-center">
//         <span
//           className={`text-2xl font-black leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
//         >
//           {formatNumber(value)}
//         </span>
//         {/* {trend === 'up' ? (
//           <IconTrendingUp className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
//         ) : (
//           <IconTrendingDown className={`w-3 h-3 ${isGreen ? 'text-green-500' : 'text-orange-500'}`} />
//         )} */}
//       </div>
//     </div>
//   );
// };

// const CardIcon = ({ type }) => (
//   <div
//     className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
//       type === 'orange'
//         ? 'bg-orange-200 border-orange-600'
//         : 'bg-blue-200 border-blue-500'
//     }`}
//   >
//     {type === 'orange' ? (
//       <IconFire className="text-orange-700 w-5 h-5" />
//     ) : (
//       <IconBarChart className="text-blue-600 w-5 h-5" />
//     )}
//   </div>
// );

// const WashIcon = () => (
//   <div className="flex gap-1">
//     {[13, 9, 6, 4].map((size, i) => (
//       <div
//         key={i}
//         style={{ width: size, height: size }}
//         className="rounded-full bg-cyan-300 border-[1.5px] border-cyan-600"
//       />
//     ))}
//   </div>
// );
// const WashIcon2 = () => (
//   <div className="flex gap-1">
//     {[13, 9, 6, 4].map((size, i) => (
//       <div
//         key={i}
//         style={{ width: size, height: size }}
//         className="rounded-full bg-gray-300 border-[1.5px] border-gray-600"
//       />
//     ))}
//   </div>
// );

// const MiniBarChart = ({ isDarkMode }) => {
//   // const bars = [
//   //   { value: 900, height: '55%', active: false, label: 'Rec' },
//   //   { value: 950, height: '70%', active: false, label: 'Nov' },
//   //   { value: 950, height: '70%', active: true, label: 'Rec' },
//   //   { value: 980, height: '90%', active: true, highlight: true, label: 'Dec' },
//   // ];

//   return (
//     <div className="flex items-end gap-0.5 h-10">
//       {/* {bars.map((bar, i) => {
//         const barColor = bar.highlight
//           ? 'bg-blue-600'
//           : bar.active
//             ? 'bg-blue-400'
//             : isDarkMode
//               ? 'bg-slate-600'
//               : 'bg-slate-300';
//         const textColor = bar.highlight
//           ? 'text-blue-600'
//           : bar.active
//             ? 'text-blue-400'
//             : isDarkMode
//               ? 'text-slate-500'
//               : 'text-slate-400';

//         return (
//           <div key={i} className="flex flex-col items-center gap-0.5">
//             <span className={`text-[9px] font-bold ${textColor}`}>{bar.value}</span>
//             <div
//               className={`w-[13px] ${barColor} rounded-t`}
//               style={{ height: bar.height }}
//             />
//             <span className={`text-[9px] font-semibold ${textColor}`}>{bar.label}</span>
//           </div>
//         );
//       })} */}
//     </div>
//   );
// };

// // ============ SECTION LABEL ============
// const SectionLabel = ({ title, color, isDarkMode }) => {
//   const colorClasses = {
//     blue: 'bg-blue-600',
//     sky: 'bg-sky-500',
//   };
//   const colorClassesLight = {
//     blue: 'bg-blue-400',
//     sky: 'bg-sky-300',
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <div className="flex gap-0.5">
//         <div className={`w-1 h-5 ${colorClasses[color]} rounded-full`} />
//         <div className={`w-0.5 h-5 ${colorClassesLight[color]} rounded-full`} />
//       </div>
//       <h2
//         className={`text-base font-black uppercase tracking-wide ${
//           isDarkMode ? 'text-slate-200' : 'text-slate-800'
//         }`}
//       >
//         {title}
//       </h2>
//       <div
//         className={`flex-1 h-px bg-gradient-to-r ${
//           color === 'blue' ? 'from-blue-200' : 'from-sky-200'
//         } to-transparent`}
//       />
//     </div>
//   );
// };

 
// // ============ DHU OVERVIEW GRID ============
// const DHUOverviewGrid = ({ isDarkMode, getSectionDHU }) => {
//   const firstDryData = getSectionDHU(1);
//   const firstWashData = getSectionDHU(2);
//   const secondDryData = getSectionDHU(3);
//   const finalWashData = getSectionDHU(4);

//   return (
//     // 12-column grid. Dry gets 7 cols, Wash gets 5 cols. Extremely tight gaps to save height.
//     <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
      
//       {/* ROW 1 */}
//       <div className="lg:col-span-7">
//         <DrySectionPanel title="### 1st DRY SECTION" sectionData={firstDryData} isDarkMode={isDarkMode} />
//       </div>
//       <div className="lg:col-span-5">
//         <WashSectionPanel title="### 1st WASH SECTION" sectionData={firstWashData} isDarkMode={isDarkMode} />
//       </div>

//       {/* ROW 2 */}
//       <div className="lg:col-span-7">
//         <DrySectionPanel title="### 2nd DRY SECTION" sectionData={secondDryData} isDarkMode={isDarkMode} />
//       </div>
//       <div className="lg:col-span-5">
//         <WashSectionPanel title="FINAL WASH SECTION" sectionData={finalWashData} isDarkMode={isDarkMode} isFinal />
//       </div>

//     </div>
//   );
// };

// // ============ DRY SECTION COMPONENTS ============
// const DrySectionPanel = ({ title, sectionData, isDarkMode }) => {
//   const { processes, topIssues } = sectionData || {};

//   return (
//     <div className={`flex flex-col rounded-xl overflow-hidden shadow-sm border h-full ${
//       isDarkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-blue-200'
//     }`}>
//       {/* Ultra Compact Header */}
//       <div className={`px-3 py-1 font-black text-[11px] tracking-widest uppercase flex items-center gap-1.5 ${
//         isDarkMode ? 'bg-slate-800 text-blue-400 border-b border-slate-700' : 'bg-blue-50 text-blue-700 border-b border-blue-200'
//       }`}>
//         <IconTrendingUp className="w-3.5 h-3.5" />
//         {title}
//       </div>

//       {/* Process Cards Grid (3 columns to sit side by side) */}
//       <div className="p-1.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 h-full items-stretch">
//         {processes && processes.length > 0 ? (
//           processes.map((proc, i) => {
//             // Filter top issues to match exactly this process ID
//             const processIssues = (topIssues || []).filter(issue => issue.washProcessId === proc.washProcessId);
//             return (
//               <DryProcessSubCard 
//                 key={i} 
//                 process={proc} 
//                 isDarkMode={isDarkMode} 
//                 topIssues={processIssues} 
//               />
//             );
//           })
//         ) : (
//           <div className={`p-2 col-span-full text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
//             No process data.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const DryProcessSubCard = ({ process, topIssues, isDarkMode }) => {
//   const dhu = process.dhu || 0;
//   const isGood = dhu <= 10;
//   const formatNum = (num) => (num || 0).toLocaleString();

//   return (
//     <div className={`rounded-lg border p-1.5 flex flex-col gap-1.5 ${
//       isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50/80 border-slate-200'
//     }`}>
//       {/* Header: Name & DHU */}
//       <div className={`flex items-center justify-between pb-1 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
//         <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1 truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
//           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
//           <span className="truncate">{process.processName}</span>
//         </h4>
//         <div className="flex items-center gap-0.5 shrink-0">
//           <span className={`text-[9px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>DHU%</span>
//           <span className={`text-sm font-black flex items-center gap-0.5 ${isGood ? 'text-green-500' : 'text-orange-500'}`}>
//             {dhu}%
//             {isGood ? <IconTrendingDown className="w-3 h-3" /> : <IconTrendingUp className="w-3 h-3" />}
//           </span>
//         </div>
//       </div>

//       {/* Body Layout: Metrics | Rings | Defects */}
//       <div className="flex justify-between items-start gap-1">
        
//         {/* Column 1: Metrics */}
//         <div className="flex flex-col gap-0.5 w-[35%]">
//           <MetricRow label="Output" value={formatNum(process.passQty)} isDarkMode={isDarkMode} />
//           <MetricRow label="Target" value={formatNum(process.dayTarget)} isDarkMode={isDarkMode} />
//           <MetricRow label="Defect" value={formatNum(process.defectQty)} isDarkMode={isDarkMode} isAlert />
//           <MetricRow label="Manpower" value={(process.manPower || 0).toFixed(1)} isDarkMode={isDarkMode} />
//         </div>

//         {/* Column 2: Eff% Rings */}
//         <div className="flex flex-col gap-1 items-center justify-center w-[25%] pt-1">
//           <RingProgress value={process.planEff || 0} label="TGT EFF" color="#3b82f6" isDarkMode={isDarkMode} />
//           <RingProgress value={process.actualEff || 0} label="ACT EFF" color="#22c55e" isDarkMode={isDarkMode} />
//         </div>

//         {/* Column 3: Top 3 Defects */}
//         <div className={`flex flex-col w-[40%] rounded bg-red/50 p-1 border ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'border-slate-200/60'}`}>
//           <span className={`text-[9px] font-bold uppercase mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Top Defects</span>
//           <div className="space-y-0.5">
//             {(topIssues || []).slice(0, 3).map((issue, i) => (
//               <div key={i} className="flex items-center justify-between text-[10px] leading-none">
//                 <div className="flex items-center gap-1 overflow-hidden">
//                   <span className={`w-3 h-3 rounded flex items-center justify-center text-[8px] font-black shrink-0 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{i + 1}</span>
//                   <span className={`truncate font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} title={issue.issueName}>
//                     {issue.issueName.split(' ')[0]} {/* Trimmed name to fit */}
//                   </span>
//                 </div>
//                 <span className={`font-bold ml-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{issue.issueQty || issue.defectQty || 0}</span>
//               </div>
//             ))}
//             {(!topIssues || topIssues.length === 0) && <span className={`text-[9px] italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No data</span>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const MetricRow = ({ label, value, isDarkMode, isAlert }) => (
//   <div className="flex justify-between items-center text-[10px] leading-tight border-b border-transparent last:border-0 hover:border-slate-200 dark:hover:border-slate-700">
//     <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{label}</span>
//     <span className={`font-bold ${isAlert ? 'text-red-500' : isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{value}</span>
//   </div>
// );

// // ============ WASH SECTION COMPONENTS ============
// const WashSectionPanel = ({ title, sectionData, isDarkMode, isFinal }) => {
//   const { totalPassQty, totalDefectQty, overallDhu, dhuStatus, topIssues, processes } = sectionData || {};
//   const isGood = dhuStatus === 'good';
//   const formatNum = (num) => (num || 0).toLocaleString();

//   // Aggregate Wash Data (since Wash might be 1 block instead of split sub-blocks)
//   const targetQty = processes?.reduce((sum, p) => sum + (p.dayTarget || 0), 0) || 0;
//   const manPower = processes?.reduce((sum, p) => sum + (p.manPower || 0), 0) || 0;
//   const avgPlanEff = processes?.length ? processes.reduce((sum, p) => sum + (p.planEff || 0), 0) / processes.length : 0;
//   const avgActEff = processes?.length ? processes.reduce((sum, p) => sum + (p.actualEff || 0), 0) / processes.length : 0;

//   return (
//     <div className={`flex flex-col rounded-xl overflow-hidden shadow-sm border h-full ${
//       isDarkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-blue-200'
//     }`}>
//       {/* Ultra Compact Header */}
//       <div className={`px-3 py-1 font-black text-[11px] tracking-widest uppercase flex items-center justify-between ${
//         isDarkMode ? 'bg-slate-800 text-sky-400 border-b border-slate-700' : 'bg-sky-50 text-sky-700 border-b border-sky-200'
//       }`}>
//         <div className="flex items-center gap-1.5">
//           <IconWaterDrop className="w-3.5 h-3.5" />
//           {title}
//         </div>
//         {!isFinal && <IconTrendingUp className="w-3.5 h-3.5 opacity-50" />}
//       </div>

//       {/* Body: High Density Layout */}
//       <div className="p-2 flex h-full gap-2 items-center">
        
//         {/* Left: 2x2 Metrics Grid */}
//         <div className="grid grid-cols-2 gap-1.5 w-[35%] shrink-0">
//           <WashMetricBox label="Output" value={formatNum(totalPassQty)} isDarkMode={isDarkMode} highlight />
//           <WashMetricBox label="Target" value={formatNum(targetQty)} isDarkMode={isDarkMode} />
//           <WashMetricBox label="Defect" value={formatNum(totalDefectQty)} isDarkMode={isDarkMode} isAlert />
//           <WashMetricBox label="Manpower" value={manPower.toFixed(1)} isDarkMode={isDarkMode} />
//         </div>

//         {/* Center: DHU and Rings */}
//         <div className="flex flex-col items-center justify-center w-[25%] shrink-0 gap-1 border-x border-dashed px-2 border-slate-200 dark:border-slate-700">
//           <div className="text-center w-full">
//             <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>DHU%</span>
//             <div className={`text-xl font-black flex items-center justify-center gap-0.5 ${isGood ? 'text-green-500' : 'text-orange-500'}`}>
//               {overallDhu || 0}%
//             </div>
//           </div>
//           <div className="flex gap-2 w-full justify-center">
//             <RingProgress value={avgPlanEff} label="TGT" color="#3b82f6" isDarkMode={isDarkMode} />
//             <RingProgress value={avgActEff} label="ACT" color="#22c55e" isDarkMode={isDarkMode} />
//           </div>
//         </div>

//         {/* Right: Top 3 Defects */}
//         <div className="flex-1 pl-1">
//           <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
//             Top 3 Defects
//           </h4>
//           <div className="space-y-1">
//             {(topIssues || []).slice(0, 3).map((issue, i) => (
//               <div key={i} className="flex items-center justify-between text-[11px] leading-tight">
//                 <div className="flex items-center gap-1.5 overflow-hidden">
//                   <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
//                     isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-sky-100 text-sky-700'
//                   }`}>{i + 1}</span>
//                   <span className={`font-semibold truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} title={issue.issueName}>
//                     {issue.issueName}
//                   </span>
//                 </div>
//                 <span className={`font-bold tabular-nums ml-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
//                   {issue.issueQty || issue.defectQty || 0}
//                 </span>
//               </div>
//             ))}
//             {(!topIssues || topIssues.length === 0) && (
//                <span className={`text-[11px] italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No defect data</span>
//             )}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// const WashMetricBox = ({ label, value, isDarkMode, highlight, isAlert }) => (
//   <div className={`rounded p-1.5 border flex flex-col items-center justify-center text-center ${
//     isAlert 
//       ? isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'
//       : highlight
//         ? isDarkMode ? 'bg-sky-500/10 border-sky-500/20' : 'bg-sky-50 border-sky-100'
//         : isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50/80 border-slate-200'
//   }`}>
//     <span className={`text-[9px] font-bold uppercase tracking-wider ${
//       isAlert ? 'text-red-400' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
//     }`}>{label}</span>
//     <span className={`text-[13px] leading-none font-black tabular-nums mt-0.5 ${
//       isAlert ? 'text-red-500' : highlight ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : (isDarkMode ? 'text-slate-200' : 'text-slate-700')
//     }`}>{value}</span>
//   </div>
// );

// // ============ UI UTILITIES ============
// const RingProgress = ({ value, label, color, isDarkMode }) => {
//   // Ultra compact ring mapping
//   const rawValue = typeof value === 'number' ? value.toFixed(0) : '0';
//   const displayValue = rawValue.length > 3 ? `${rawValue.substring(0, 3)}..` : rawValue; 
  
//   // Cap dash offset math to prevent SVG breakages if PlanEff is 21000%
//   const normalizedValue = Math.min(Math.max(Number(rawValue), 0), 100);
//   const radius = 14; 
//   const circumference = 2 * Math.PI * radius;
//   const offset = circumference - (normalizedValue / 100) * circumference;

//   return (
//     <div className="flex flex-col items-center">
//       <div className="relative w-8 h-8 shrink-0">
//         <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
//           <circle cx="20" cy="20" r={radius} fill="none" stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeWidth="4" />
//           <circle 
//             cx="20" cy="20" r={radius} 
//             fill="none" stroke={color} 
//             strokeWidth="4" 
//             strokeLinecap="round" 
//             strokeDasharray={circumference} 
//             strokeDashoffset={offset} 
//             style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
//           />
//         </svg>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <span className={`text-[8px] font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
//             {displayValue}%
//           </span>
//         </div>
//       </div>
//       <span className={`text-[8px] font-bold uppercase tracking-tight mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
//         {label}
//       </span>
//     </div>
//   );
// };

// // ============ DRYER PRODUCTION SUMMARY ============
// const DryerProductionSummary = ({ isDarkMode, dashboardData, onCardClick }) => {
//   const dryers = [
//     { name: '1st Wash Dryer', delivery: dashboardData?.['1st Dryer']?.delivery || 0 },
//     { name: '2nd Dryer', delivery: dashboardData?.['2nd Dryer']?.delivery || 0 },
//     { name: 'Final Dryer', delivery: dashboardData?.['Final Dryer']?.delivery || 0 },
//     { name: 'Cool Dryer', delivery: dashboardData?.['Cool Dryer']?.delivery || 0 },
//     { name: 'ReDryer', delivery: dashboardData?.['ReDryer']?.delivery || 0 },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
//       {dryers.map((dryer, index) => (
//         <DryerCard
//           key={index}
//           dryer={dryer}
//           isDarkMode={isDarkMode}
//           onCardClick={() => onCardClick({
//             processStageIds: DRYER_STAGE_IDS[dryer.name] || [6, 7, 8, 9, 10],
//             modalTitle: dryer.name,
//             mode: 'dryer',
//           })}
//         />
//       ))}
//     </div>
//   );
// };

// const DryerCard = ({ dryer, isDarkMode, onCardClick }) => {
//   const formatNumber = (num) => {
//     if (num === null || num === undefined) return '0';
//     return num.toLocaleString();
//   };

//   return (
//     <div
//       onClick={onCardClick}
//       className={`border-2 rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl flex items-center gap-4 ${
//         isDarkMode
//           ? 'bg-gradient-to-br from-sky-500/10 to-sky-600/5 border-sky-400/30 hover:shadow-sky-500/20'
//           : 'bg-gradient-to-br from-white to-sky-50 border-sky-200 hover:shadow-sky-200/50'
//       }`}
//     >

//       {/* Icon Section */}
//       <div
//         className={`w-14 h-14 rounded-lg flex items-center justify-center border ${
//           isDarkMode
//             ? 'bg-sky-500/15 border-sky-500/30'
//             : 'bg-sky-50 border-sky-100'
//         }`}
//       >
//         <DryerIcon isDarkMode={isDarkMode} />
//       </div>

//       {/* Content */}
//       <div className="flex flex-col flex-1">

//         {/* Title */}
//         <h4 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
//           {dryer.name}
//         </h4>

//         {/* Delivery Value */}
//         <div className="flex items-end gap-2">
//           <span className={`text-3xl font-bold leading-none ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
//             {formatNumber(dryer.delivery)}
//           </span>
//           <span className={`text-sm font-medium pb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
//             Delivery
//           </span>
//         </div>

//         {/* Bottom Accent Line */}
//         <div className={`mt-2 h-1 w-10 rounded-full ${isDarkMode ? 'bg-sky-500/30' : 'bg-sky-200'}`} />

//       </div>

//     </div>
//   );
// };

// const DryerIcon = ({ isDarkMode }) => (
//   <div className="w-10 h-10">
//     <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
//       <rect
//         x="6"
//         y="6"
//         width="52"
//         height="54"
//         rx="7"
//         fill={isDarkMode ? '#0c4a6e' : '#bae6fd'}
//         stroke={isDarkMode ? '#0ea5e9' : '#0284c7'}
//         strokeWidth="2.5"
//       />
//       <rect x="6" y="6" width="52" height="13" rx="7" fill={isDarkMode ? '#0c4a6e' : '#0369a1'} />
//       <rect x="6" y="13" width="52" height="6" fill={isDarkMode ? '#0c4a6e' : '#0369a1'} />
//       <circle cx="14" cy="12" r="2.5" fill="#38bdf8" />
//       <circle cx="20" cy="12" r="2.5" fill="#34d399" />
//       <rect x="34" y="8" width="18" height="7" rx="3" fill={isDarkMode ? '#0284c7' : '#075985'} />
//       <circle cx="38" cy="11.5" r="1.2" fill="#7dd3fc" />
//       <circle cx="43" cy="11.5" r="1.2" fill="#7dd3fc" />
//       <circle cx="48" cy="11.5" r="1.2" fill="#7dd3fc" />
//       <circle cx="32" cy="38" r="16" fill={isDarkMode ? '#164e63' : 'white'} stroke={isDarkMode ? '#0ea5e9' : '#0284c7'} strokeWidth="2.5" />
//       <circle cx="32" cy="38" r="11" fill={isDarkMode ? '#0c4a6e' : '#e0f2fe'} stroke={isDarkMode ? '#0ea5e9' : '#0ea5e9'} strokeWidth="1.5" />
//       <path
//         d="M21 40 Q26.5 35.5 32 40 T43 40 L43 47 A11 11 0 0 1 21 47Z"
//         fill="#0ea5e9"
//         opacity="0.7"
//       />
//       <circle cx="32" cy="38" r="3" fill={isDarkMode ? '#7dd3fc' : '#075985'} />
//     </svg>
//   </div>
// );

// export default Dashboard;







// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\dashboard\Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import DashboardTableModal from './DashboardTableModal';
import { useAuth } from '../../hooks/useAuth';

const AUTO_REFRESH_INTERVAL_MS = 1 * 60 * 1000;

const formatDashboardNumber = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';

  const abs = Math.abs(num);

  if (abs >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
  }

  if (abs >= 1000) {
    return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  }

  return `${num}`;
};
// ============ CUSTOM SVG ICONS ============
const IconFilter = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const IconTrendingUp = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconTrendingDown = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const IconBarChart = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const IconHome = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconWaterDrop = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const IconFire = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const IconCalendar = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconBuilding = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22V12h6v10" />
    <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M8 18h.01" />
  </svg>
);

const IconClock = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);


// ============ MAIN DASHBOARD ============
const Dashboard = ({ isDarkMode }) => {
  const { user, isAdmin, isIncharge, isPlanner } = useAuth();
 useEffect(() => {
    console.log('========== DASHBOARD DEBUG ==========');
    console.log('👤 User object:', user);
    console.log('🎭 User Roles:', user?.roles);
    console.log('🏭 User Assigns:', user?.userAssigns);
    console.log('📋 Process Stage Accesses:', user?.processStageAccesses);
    console.log('✅ isAdmin():', isAdmin());
    console.log('✅ isIncharge():', isIncharge());
    console.log('✅ isPlanner():', isPlanner());
    console.log('=====================================');
  }, [user]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const plantUnits = {
    TPL: ['TPL Dry Unit', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'],
    TWL: ['Unit TWL'],
  };

  const allUnits = ['TPL Dry Unit', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit TWL'];

  const PLANT_NAME_TO_ID = { TPL: 1, TWL: 2 };
  const UNIT_NAME_TO_ID = { 'TPL Dry Unit': 1, 'Unit 1': 2, 'Unit 2': 3, 'Unit 3': 4, 'Unit 4': 5, 'Unit 5': 7, 'Unit TWL': 6 };

// ============ FIXED FUNCTIONS ============

const getAccessiblePlants = () => {
  // ✅ Check if user exists AND has assignments
  if (user && user.userAssigns && user.userAssigns.length > 0) {
    // ✅ Use plantName (not plantId)
    const uniquePlants = [...new Set(user.userAssigns.map(assignment => assignment.plantName))];
    return uniquePlants;
  }
  
  // ✅ Only return default plants if truly no restrictions
  // For normal users with no assignments, return empty
  if (!isAdmin() && !isIncharge() && !isPlanner()) {
    return [];
  }
  
  // ✅ Super admin with no specific assignments gets all
  return ['TPL', 'TWL'];
};

const getAccessibleUnits = (plantId) => {
  // ✅ Check if user exists AND has assignments
  if (user && user.userAssigns && user.userAssigns.length > 0) {
    const units = user.userAssigns
      .filter(assignment => assignment.plantName === plantId) // ✅ Match by name
      .map(assignment => assignment.unitName); // ✅ Return unitName
    return [...new Set(units)];
  }
  
  // ✅ Fallback to predefined units if no assignments
  if (plantUnits[plantId]) {
    return plantUnits[plantId];
  }
  
  return [];
};
  const accessiblePlants = getAccessiblePlants();

  const getDefaultFilters = () => {
    return {
      fromDate: todayStr,
      toDate: todayStr,
      unit: '',
      shift: '',
      plant: '',
    };
  };

  const [filters, setFilters] = useState(getDefaultFilters);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ processStageIds: [], modalTitle: '', mode: 'process' });

  const [dhuLoading, setDhuLoading] = useState(false);
  const [dhuData, setDhuData] = useState({
    drySummary: [],
    wetSummary: [],
    dryIssues1: [],
    dryIssues3: [],
    wetIssues2: [],
    wetIssues4: [],
  });

  const openModal = (config) => {
    setModalConfig(config);
    setIsModalOpen(true);
  };

  const processDashboardData = (data) => {
    if (!data || data.length === 0) return null;

    const aggregated = {
      '1st Dry': { delivery: 0, receive: 0 },
      'Unwash': { delivery: 0, receive: 0 },
      '2nd Dry': { delivery: 0, receive: 0 },
      '1st Wash': { delivery: 0, receive: 0 },
      'Final Wash': { delivery: 0, receive: 0 },
      '1st Dryer': { delivery: 0 },
      '2nd Dryer': { delivery: 0 },
      'Final Dryer': { delivery: 0 },
      'Cool Dryer': { delivery: 0 },
      'ReDryer': { delivery: 0 },
      'Laser': { delivery: 0, receive: 0 },
      'Acid Wash': { delivery: 0, receive: 0 },
      'Ozone': { delivery: 0 },
    };

    data.forEach((item) => {
      const stage = item.processStageName;
      const type = item.transactionType.toLowerCase();
      const qty = item.totalQuantity || 0;

      if (aggregated[stage]) {
        if (type === 'delivery') {
          aggregated[stage].delivery += qty;
        } else if (type === 'receive' && aggregated[stage].receive !== undefined) {
          aggregated[stage].receive += qty;
        }
      }
    });

    return aggregated;
  };

  const getSummaryRows = (response) => {
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to fetch dashboard summary ');
    }

    return Array.isArray(response.data) ? response.data : [];
  };

  const fetchDashboardData = async ({ showLoading = true } = {}) => {
    if (!filters.fromDate || !filters.toDate) {
      return;
    }

    if (showLoading) {
      setLoading(true);
      setError(null);
    }

    try {
      let allData = [];

      if (filters.plant) {
        if (filters.unit) {
          const payload = {
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            plant: filters.plant,
            unit: filters.unit,
            shift: filters.shift ? Number(filters.shift) : undefined,
          };
          const response = await dashboardApi.getDashboardSummary(payload);
          allData = getSummaryRows(response);
        } else {
          const accessibleUnitsForPlant = getAccessibleUnits(filters.plant);
          
          if (accessibleUnitsForPlant.length > 0) {
            const promises = accessibleUnitsForPlant.map(async (unit) => {
              const payload = {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                plant: filters.plant,
                unit: unit,
                shift: filters.shift ? Number(filters.shift) : undefined,
              };
              const response = await dashboardApi.getDashboardSummary(payload);
              return getSummaryRows(response);
            });
            
            const results = await Promise.all(promises);
            allData = results.flat();
          } else {
            const payload = {
              fromDate: filters.fromDate,
              toDate: filters.toDate,
              plant: filters.plant,
              shift: filters.shift ? Number(filters.shift) : undefined,
            };
            const response = await dashboardApi.getDashboardSummary(payload);
            allData = getSummaryRows(response);
          }
        }
      } else {
        const plantsToFetch = accessiblePlants.length > 0 ? accessiblePlants : ['TPL', 'TWL'];
        
        const promises = plantsToFetch.map(async (plant) => {
          const accessibleUnitsForPlant = getAccessibleUnits(plant);
          
          if (accessibleUnitsForPlant.length > 0) {
            const unitPromises = accessibleUnitsForPlant.map(async (unit) => {
              const payload = {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                plant: plant,
                unit: unit,
                shift: filters.shift ? Number(filters.shift) : undefined,
              };
              const response = await dashboardApi.getDashboardSummary(payload);
              return getSummaryRows(response);
            });
            
            const unitResults = await Promise.all(unitPromises);
            return unitResults.flat();
          } else {
            const payload = {
              fromDate: filters.fromDate,
              toDate: filters.toDate,
              plant: plant,
              shift: filters.shift ? Number(filters.shift) : undefined,
            };
            const response = await dashboardApi.getDashboardSummary(payload);
            return getSummaryRows(response);
          }
        });

        const results = await Promise.all(promises);
        allData = results.flat();
      }

      if (!showLoading && allData.length === 0) {
        return;
      }

      setDashboardData(processDashboardData(allData));
    } catch (err) {
      if (showLoading) {
        setError(err.message || 'Failed to fetch dashboard data');
      }
      console.error('Dashboard data fetch error:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const buildDhuParams = () => {
    const params = {
      fromDate: filters.fromDate,
      toDate: filters.toDate || filters.fromDate,
    };
    if (filters.plant && PLANT_NAME_TO_ID[filters.plant]) {
      params.plantIds = [PLANT_NAME_TO_ID[filters.plant]];
    }
    if (filters.unit && UNIT_NAME_TO_ID[filters.unit]) {
      params.unitIds = [UNIT_NAME_TO_ID[filters.unit]];
    }
    if (filters.shift) {
      params.shifts = [Number(filters.shift)];
    }
    return params;
  };

  const fetchDHUData = async ({ showLoading = true } = {}) => {
    if (!filters.fromDate) return;
    if (showLoading) {
      setDhuLoading(true);
    }
    try {
      const baseParams = buildDhuParams();
      const dryParams = { ...baseParams };
      delete dryParams.unitIds;

      const [drySummary, wetSummary, dryIssues1, dryIssues3, wetIssues2, wetIssues4] = await Promise.all([
        dashboardApi.getDryProcessSummary(dryParams),
        dashboardApi.getWetProcessSummary(baseParams),
        dashboardApi.getTopIssues({ ...dryParams, processModuleIds: [1] }),
        dashboardApi.getTopIssues({ ...dryParams, processModuleIds: [3] }),
        dashboardApi.getWetTopIssues({ ...baseParams, processModuleIds: [2] }),
        dashboardApi.getWetTopIssues({ ...baseParams, processModuleIds: [4] }),
      ]);

      setDhuData({
        drySummary: Array.isArray(drySummary) ? drySummary : (drySummary?.data && Array.isArray(drySummary.data) ? drySummary.data : []),
        wetSummary: Array.isArray(wetSummary) ? wetSummary : (wetSummary?.data && Array.isArray(wetSummary.data) ? wetSummary.data : []),
        dryIssues1: Array.isArray(dryIssues1) ? dryIssues1 : (dryIssues1?.data && Array.isArray(dryIssues1.data) ? dryIssues1.data : []),
        dryIssues3: Array.isArray(dryIssues3) ? dryIssues3 : (dryIssues3?.data && Array.isArray(dryIssues3.data) ? dryIssues3.data : []),
        wetIssues2: Array.isArray(wetIssues2) ? wetIssues2 : (wetIssues2?.data && Array.isArray(wetIssues2.data) ? wetIssues2.data : []),
        wetIssues4: Array.isArray(wetIssues4) ? wetIssues4 : (wetIssues4?.data && Array.isArray(wetIssues4.data) ? wetIssues4.data : []),
      });
    } catch (err) {
      console.error('DHU data fetch error:', err);
    } finally {
      if (showLoading) {
        setDhuLoading(false);
      }
    }
  };

   const PROCESS_DISPLAY_NAME = {
    'First Dry Final': '1st Dry Final',
    'Handbrush': 'Hand Brush',
    'Whisker': 'Whisker',
    '2nd Dry Final': '2nd Dry Final',
    'PP Spray': 'PP Spray',
    'Laser': 'Laser',
    'Final Wash': 'Final Wash',
    '1st Wash': '1st Wash',
  };

  const PROCESS_ORDER = {
    1: ['Whisker', 'Handbrush', 'First Dry Final'],
    2: ['1st Wash'],
    3: ['PP Spray', 'Laser', '2nd Dry Final'],
    4: ['Final Wash'],
  };

  const getProcessDisplayName = (name) => PROCESS_DISPLAY_NAME[name] || name;

  const getSectionDHU = (processModuleId) => {
    const isDry = [1, 3].includes(processModuleId);

    const rawSummary = isDry
      ? dhuData.drySummary.filter(d => d.processModuleId === processModuleId)
      : dhuData.wetSummary.filter(d => d.processModuleId === processModuleId);

    let rawIssues = [];
    if (processModuleId === 1) rawIssues = dhuData.dryIssues1;
    else if (processModuleId === 3) rawIssues = dhuData.dryIssues3;
    else if (processModuleId === 2) rawIssues = dhuData.wetIssues2;
    else if (processModuleId === 4) rawIssues = dhuData.wetIssues4;

    const orderList = PROCESS_ORDER[processModuleId] || [];

    const processes = [...rawSummary].sort((a, b) => {
      const aIndex = orderList.indexOf(a.processName);
      const bIndex = orderList.indexOf(b.processName);
      const safeA = aIndex === -1 ? 999 : aIndex;
      const safeB = bIndex === -1 ? 999 : bIndex;
      return safeA - safeB;
    });

    const mappedIssues = (rawIssues || [])
      .map(issue => ({
        ...issue,
        qty: issue.issueQty ?? issue.defectQty ?? 0,
      }))
      .sort((a, b) => (b.qty || 0) - (a.qty || 0));

    const topIssuesByProcess = mappedIssues.reduce((acc, issue) => {
      const key = issue.processName || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        issueName: issue.issueName,
        qty: issue.qty || 0,
      });
      return acc;
    }, {});

    Object.keys(topIssuesByProcess).forEach((key) => {
      topIssuesByProcess[key] = topIssuesByProcess[key].slice(0, 3);
    });

    const totalPassQty = processes.reduce((s, d) => s + (d.passQty || 0), 0);
    const totalDefectQty = processes.reduce((s, d) => s + (d.defectQty || 0), 0);
    const totalRejectQty = processes.reduce((s, d) => s + (d.rejectQty || 0), 0);
    const totalIssueQty = processes.reduce((s, d) => s + (d.issueQty || 0), 0);
    const totalTargetQty = processes.reduce((s, d) => s + (d.dayTarget || 0), 0);
    const totalManPower = processes.reduce((s, d) => s + (d.manPower || 0), 0);

    const overallDhu =
      totalPassQty + totalDefectQty > 0
        ? parseFloat(((totalDefectQty / (totalPassQty + totalDefectQty)) * 100).toFixed(2))
        : 0;

    const achievementPct =
      totalTargetQty > 0
        ? parseFloat(Math.min((totalPassQty / totalTargetQty) * 100, 999).toFixed(1))
        : 0;

    return {
      processes,
      totalPassQty,
      totalDefectQty,
      totalRejectQty,
      totalIssueQty,
      totalTargetQty,
      totalManPower,
      overallDhu,
      achievementPct,
      dhuStatus: overallDhu <= 10 ? 'good' : 'action',
      topIssues: mappedIssues.slice(0, 3),
      topIssuesByProcess,
      getProcessDisplayName,
    };
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const refreshDashboard = (options) => {
      fetchDashboardData(options);
      fetchDHUData(options);
    };

    refreshDashboard();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshDashboard({ showLoading: false });
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshDashboard({ showLoading: false });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [filters, user]);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return formatDashboardNumber(num);
  };

  const handleFilterChange = (field, value) => {
    if (field === 'plant') {
      setFilters((prev) => ({ ...prev, [field]: value, unit: '' }));
    } else {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }
  };

  const getAvailableUnits = () => {
    if (filters.plant && getAccessibleUnits(filters.plant).length > 0) {
      return getAccessibleUnits(filters.plant);
    }
    if (filters.plant && plantUnits[filters.plant]) {
      return plantUnits[filters.plant];
    }
    return allUnits;
  };

  const resetFilters = () => {
    setFilters({
      fromDate: todayStr,
      toDate: todayStr,
      unit: '',
      shift: '',
      plant: '',
    });
  };

  return (
    <>
<style>{`
  html,
  body,
  #root {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    min-height: 100% !important;
    background: #0f172a !important;
    overflow-x: hidden !important;
  }

  body {
    background: #0f172a !important;
  }

  .MuiBox-root {
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
  }

  .dashboard-page {
    width: 100% !important;
    min-height: 100dvh !important;
    height: auto !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }

  .dashboard-container {
    width: 100% !important;
    max-width: 1800px !important;
    margin: 0 auto !important;
    padding: 6px !important;
  }

  .dashboard-container * {
    box-sizing: border-box !important;
  }

  .dashboard-container span,
  .dashboard-container div,
  .dashboard-container p {
    min-width: 0 !important;
  }

  .dashboard-container .truncate {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* Mobile only: 320px - 767px */
  @media (max-width: 767px) {
    html,
    body,
    #root {
      width: 100% !important;
      min-height: 100dvh !important;
      background: #0f172a !important;
      overflow-x: hidden !important;
    }

    .dashboard-page {
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 100dvh !important;
      height: auto !important;
      background: #0f172a !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
    }

    .dashboard-container {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 8px !important;
      gap: 10px !important;
    }

    .dashboard-container .top-summary-grid,
    .dashboard-container .dryer-summary-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 8px !important;
      width: 100% !important;
    }

    .dashboard-container .md\\:grid-cols-12 {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 10px !important;
      width: 100% !important;
    }

    .dashboard-container .md\\:col-span-8,
    .dashboard-container .md\\:col-span-4 {
      grid-column: auto !important;
    }

    .dashboard-container .lg\\:grid-cols-3,
    .dashboard-container .md\\:grid-cols-2 {
      grid-template-columns: 1fr !important;
    }

    .dashboard-container .grid-cols-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 6px !important;
    }

    .dashboard-container .grid-cols-\\[1\\.1fr_0\\.9fr\\] {
      grid-template-columns: 1fr !important;
      gap: 8px !important;
    }

    .dashboard-container .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 6px !important;
    }

    .dashboard-container .grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 6px !important;
    }

    .dashboard-container input,
    .dashboard-container select {
      width: 100% !important;
      height: 38px !important;
      font-size: 12px !important;
      border-radius: 10px !important;
    }

    .dashboard-container label {
      font-size: 9px !important;
    }

    .dashboard-container .rounded-2xl {
      border-radius: 14px !important;
    }

    .dashboard-container .rounded-xl {
      border-radius: 12px !important;
    }

    .dashboard-container .rounded-lg {
      border-radius: 10px !important;
    }

    .dashboard-container .p-3,
    .dashboard-container .md\\:p-3 {
      padding: 9px !important;
    }

    .dashboard-container .p-2,
    .dashboard-container .md\\:p-2,
    .dashboard-container .p-2\\.5,
    .dashboard-container .md\\:p-2\\.5,
    .dashboard-container .p-1\\.5,
    .dashboard-container .p-1 {
      padding: 8px !important;
    }

    .dashboard-container .px-4,
    .dashboard-container .md\\:px-4,
    .dashboard-container .px-3,
    .dashboard-container .md\\:px-3,
    .dashboard-container .px-2,
    .dashboard-container .md\\:px-2 {
      padding-left: 8px !important;
      padding-right: 8px !important;
    }

    .dashboard-container .py-3,
    .dashboard-container .py-2,
    .dashboard-container .md\\:py-2,
    .dashboard-container .py-1\\.5,
    .dashboard-container .md\\:py-1\\.5,
    .dashboard-container .py-1 {
      padding-top: 7px !important;
      padding-bottom: 7px !important;
    }

    .dashboard-container .text-3xl,
    .dashboard-container .md\\:text-3xl {
      font-size: 21px !important;
    }

    .dashboard-container .text-2xl,
    .dashboard-container .md\\:text-2xl {
      font-size: 19px !important;
    }

    .dashboard-container .text-xl,
    .dashboard-container .md\\:text-xl,
    .dashboard-container .lg\\:text-xl,
    .dashboard-container .lg\\:text-\\[18px\\] {
      font-size: 16px !important;
    }

    .dashboard-container .text-lg,
    .dashboard-container .text-base,
    .dashboard-container .md\\:text-base {
      font-size: 14px !important;
    }

    .dashboard-container .text-sm,
    .dashboard-container .md\\:text-sm,
    .dashboard-container .lg\\:text-\\[15px\\],
    .dashboard-container .lg\\:text-\\[13px\\],
    .dashboard-container .lg\\:text-\\[12px\\] {
      font-size: 12px !important;
    }

    .dashboard-container .text-xs,
    .dashboard-container .md\\:text-xs,
    .dashboard-container .text-\\[11px\\],
    .dashboard-container .md\\:text-\\[11px\\],
    .dashboard-container .text-\\[10px\\],
    .dashboard-container .md\\:text-\\[10px\\] {
      font-size: 10px !important;
    }

    .dashboard-container svg {
      width: 16px !important;
      height: 16px !important;
    }

    .dashboard-container .w-14,
    .dashboard-container .md\\:w-14,
    .dashboard-container .h-14,
    .dashboard-container .md\\:h-14 {
      width: 42px !important;
      height: 42px !important;
    }

    .dashboard-container .w-10,
    .dashboard-container .md\\:w-10,
    .dashboard-container .h-10,
    .dashboard-container .md\\:h-10 {
      width: 34px !important;
      height: 34px !important;
    }

    .dashboard-container .w-8,
    .dashboard-container .h-8 {
      width: 30px !important;
      height: 30px !important;
    }

    .dashboard-container .w-6,
    .dashboard-container .h-6,
    .dashboard-container .w-5,
    .dashboard-container .h-5 {
      width: 22px !important;
      height: 22px !important;
    }

    .dashboard-container .border-2 {
      border-width: 1px !important;
    }

    .dashboard-container .font-black {
      font-weight: 800 !important;
    }

    .dashboard-container .tracking-wide,
    .dashboard-container .tracking-wider,
    .dashboard-container .tracking-widest {
      letter-spacing: 0.02em !important;
    }
  }

  /* Tablet portrait: 768px - 899px */
  @media (min-width: 768px) and (max-width: 899px) {
    .dashboard-page {
      min-height: 100dvh !important;
      overflow-y: auto !important;
    }

    .dashboard-container {
      padding: 6px !important;
    }

    .dashboard-container .grid {
      gap: 6px !important;
    }

    .dashboard-container .md\\:grid-cols-12 {
      grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    }

    .dashboard-container .md\\:col-span-8,
    .dashboard-container .md\\:col-span-4 {
      grid-column: span 12 / span 12 !important;
    }

    .dashboard-container .text-3xl,
    .dashboard-container .md\\:text-3xl {
      font-size: 20px !important;
    }

    .dashboard-container .text-2xl,
    .dashboard-container .md\\:text-2xl {
      font-size: 18px !important;
    }

    .dashboard-container .text-xl,
    .dashboard-container .md\\:text-xl {
      font-size: 16px !important;
    }

    .dashboard-container input,
    .dashboard-container select {
      height: 32px !important;
      font-size: 11px !important;
    }
  }

  /* iPad 4 landscape / 1024x768 compact */
  @media (min-width: 900px) and (max-width: 1100px) and (max-height: 820px) {
    .dashboard-page {
      min-height: 100dvh !important;
      height: auto !important;
      overflow-y: auto !important;
    }

    .dashboard-container {
      max-width: 100% !important;
      padding: 3px 6px !important;
      gap: 4px !important;
    }

    .dashboard-container * {
      line-height: 1.04 !important;
    }

    .dashboard-container .grid {
      gap: 4px !important;
    }

    .dashboard-container .rounded-2xl {
      border-radius: 10px !important;
    }

    .dashboard-container .rounded-xl {
      border-radius: 8px !important;
    }

    .dashboard-container .rounded-lg {
      border-radius: 6px !important;
    }

    .dashboard-container .p-3,
    .dashboard-container .md\\:p-3 {
      padding: 5px !important;
    }

    .dashboard-container .p-2,
    .dashboard-container .md\\:p-2,
    .dashboard-container .p-2\\.5,
    .dashboard-container .md\\:p-2\\.5 {
      padding: 4px !important;
    }

    .dashboard-container .p-1,
    .dashboard-container .p-1\\.5 {
      padding: 3px !important;
    }

    .dashboard-container .px-4,
    .dashboard-container .md\\:px-4,
    .dashboard-container .px-3,
    .dashboard-container .md\\:px-3 {
      padding-left: 5px !important;
      padding-right: 5px !important;
    }

    .dashboard-container .py-2,
    .dashboard-container .md\\:py-2,
    .dashboard-container .py-1\\.5,
    .dashboard-container .md\\:py-1\\.5 {
      padding-top: 3px !important;
      padding-bottom: 3px !important;
    }

    .dashboard-container .text-3xl,
    .dashboard-container .md\\:text-3xl {
      font-size: 15px !important;
    }

    .dashboard-container .text-2xl,
    .dashboard-container .md\\:text-2xl {
      font-size: 14px !important;
    }

    .dashboard-container .text-xl,
    .dashboard-container .md\\:text-xl,
    .dashboard-container .lg\\:text-xl,
    .dashboard-container .lg\\:text-\\[18px\\] {
      font-size: 12px !important;
    }

    .dashboard-container .text-lg,
    .dashboard-container .text-base,
    .dashboard-container .md\\:text-base {
      font-size: 11px !important;
    }

    .dashboard-container .text-sm,
    .dashboard-container .md\\:text-sm,
    .dashboard-container .lg\\:text-\\[15px\\],
    .dashboard-container .lg\\:text-\\[13px\\],
    .dashboard-container .lg\\:text-\\[12px\\] {
      font-size: 9.5px !important;
    }

    .dashboard-container .text-xs,
    .dashboard-container .md\\:text-xs,
    .dashboard-container .text-\\[11px\\],
    .dashboard-container .md\\:text-\\[11px\\],
    .dashboard-container .text-\\[10px\\],
    .dashboard-container .md\\:text-\\[10px\\] {
      font-size: 7.5px !important;
    }

    .dashboard-container input,
    .dashboard-container select {
      height: 25px !important;
      font-size: 9px !important;
      padding: 2px 5px !important;
    }

    .dashboard-container label {
      font-size: 7.5px !important;
    }

    .dashboard-container svg {
      width: 12px !important;
      height: 12px !important;
    }

    .dashboard-container .w-14,
    .dashboard-container .md\\:w-14,
    .dashboard-container .h-14,
    .dashboard-container .md\\:h-14 {
      width: 30px !important;
      height: 30px !important;
    }

    .dashboard-container .w-10,
    .dashboard-container .md\\:w-10,
    .dashboard-container .h-10,
    .dashboard-container .md\\:h-10 {
      width: 24px !important;
      height: 24px !important;
    }

    .dashboard-container .w-8,
    .dashboard-container .h-8 {
      width: 22px !important;
      height: 22px !important;
    }

    .dashboard-container .w-6,
    .dashboard-container .h-6,
    .dashboard-container .w-5,
    .dashboard-container .h-5 {
      width: 16px !important;
      height: 16px !important;
    }

    .dashboard-container .font-black {
      font-weight: 800 !important;
    }

    .dashboard-container .tracking-wide,
    .dashboard-container .tracking-wider,
    .dashboard-container .tracking-widest {
      letter-spacing: 0.015em !important;
    }

    .dashboard-container .border-2 {
      border-width: 1px !important;
    }
  }
`}</style>
      <div
          className={`dashboard-page  w-full p-0 m-0 ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-blue-100 via-sky-100 to-blue-50'
        }`}
        style={{ margin: 0, padding: 0 }}
      >
     <div className="
      dashboard-container
      max-w-[1800px] 
      mx-auto 
      flex flex-col gap-2">
        {/* Header */}
        {/* <Header /> */}

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          isDarkMode={isDarkMode}
          plantUnits={plantUnits}
          allUnits={allUnits}
          getAvailableUnits={getAvailableUnits}
          accessiblePlants={accessiblePlants}
          isAdmin={isAdmin}
          isIncharge={isIncharge}
          isPlanner={isPlanner}
          user={user}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-blue-500' : 'border-blue-600'}`}></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Top Summary Cards */}
        {!loading && !error && (
          <TopSummaryCards isDarkMode={isDarkMode} dashboardData={dashboardData} onCardClick={openModal} />
        )}


        {/* DHU Summary */}
        {!error && (
          <SectionLabel title="DHU Summary" color="blue" isDarkMode={isDarkMode} />
        )}

        {dhuLoading && !error && (
          <DHUOverviewGridSkeleton isDarkMode={isDarkMode} />
        )}

        {!dhuLoading && !error && (
          <DHUOverviewGrid isDarkMode={isDarkMode} getSectionDHU={getSectionDHU} />
        )}

        {/* Dryer Production Summary Label */}
        {!loading && !error && (
          <SectionLabel title="Dryer Production Summary" color="sky" isDarkMode={isDarkMode} />
        )}

        {/* Dryer Production Cards */}
        {!loading && !error && (
          <DryerProductionSummary isDarkMode={isDarkMode} dashboardData={dashboardData} onCardClick={openModal} />
        )}
      </div>
      </div>

      {/* Dashboard Details Modal */}
      <DashboardTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDarkMode={isDarkMode}
        filters={filters}
        onFilterChange={handleFilterChange}
        processStageIds={modalConfig.processStageIds}
        modalTitle={modalConfig.modalTitle}
        mode={modalConfig.mode}
      />
    </>
  );
};

// ============ HEADER ============
const Header = () => (
  <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-blue-900/30">
    <div className="flex items-center gap-3">
      {/* Logo bars */}
      <div className="flex gap-1">
        <div className="w-[5px] h-4 bg-blue-400 rounded-sm -skew-x-[15deg]" />
        <div className="w-[8px] h-4 bg-blue-300 rounded-sm -skew-x-[15deg]" />
        <div className="w-[5px] h-4 bg-white/80 rounded-sm -skew-x-[15deg]" />
      </div>
      <div>
        <h1 className="text-white text-sm md:text-lg font-black italic uppercase tracking-tight leading-tight">
          Processwise Delivery Summary Dashboard
        </h1>
        <p className="text-blue-300 text-[10px] font-semibold uppercase tracking-widest">
          DHU & Dryer Analytics • Live Report
        </p>
      </div>
    </div>
  </header>
);

// ============ FILTER PANEL ============
const FilterPanel = ({ filters, onFilterChange, onReset, isDarkMode, plantUnits, allUnits, getAvailableUnits, accessiblePlants, isAdmin, isIncharge, user, isPlanner }) => (
  <div className="overflow-visible">
    <div
      className={`backdrop-blur-sm border-2 rounded-xl shadow-lg p-1 mt-1 mb-0 ${
        isDarkMode
          ? 'bg-slate-800/95 border-blue-500/30'
          : 'bg-white/95 border-blue-200'
      }`}
    >

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
        {/* From Date */}
        <div className="space-y-1.5">
          <label
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <IconCalendar className="w-3 h-3 text-blue-500" />
            From Date
          </label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => onFilterChange('fromDate', e.target.value)}
            className={`w-full border-2 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs font-medium outline-none transition-all shadow-sm focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          />
        </div>

        {/* To Date */}
        <div className="space-y-1.5">
          <label
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <IconCalendar className="w-3 h-3 text-blue-500" />
            To Date
          </label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onFilterChange('toDate', e.target.value)}
            className={`w-full border-2 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs font-medium outline-none transition-all shadow-sm focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          />
        </div>
                {/* Select Plant */}
        <div className="space-y-1.5">
          <label
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <IconBuilding className="w-3 h-3 text-blue-500" />
            Select Plant
          </label>
          <select
            value={filters.plant}
            onChange={(e) => onFilterChange('plant', e.target.value)}
            className={`w-full border-2 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
           <option value="">All Plants</option>
  {/* ✅ SIMPLIFIED LOGIC: Just show accessible plants */}
  {accessiblePlants.map((plant) => (
    <option key={plant} value={plant}>{plant}</option>
  ))}
          </select>
        </div>

        {/* Select Unit */}
        <div className="space-y-1.5">
          <label
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <IconBuilding className="w-3 h-3 text-blue-500" />
            Select Unit
          </label>
          <select
            value={filters.unit}
            onChange={(e) => onFilterChange('unit', e.target.value)}
            disabled={!filters.plant}
            className={`w-full border-2 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            } ${!filters.plant ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">All Units</option>
            {getAvailableUnits().map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Select Shift */}
        <div className="space-y-1.5">
          <label
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <IconClock className="w-3 h-3 text-blue-500" />
            Select Shift

          </label>
          <select
            value={filters.shift}
            onChange={(e) => onFilterChange('shift', e.target.value)}
            className={`w-full border-2 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="">-- Select Shift --</option>
            <option value="1">Day</option>
            <option value="2">Night</option>
          </select>
        </div>


      </div>

    </div>
  </div>
);

// ============ TOP SUMMARY CARDS ============
const PROCESS_STAGE_IDS = {
  '1st Dry': [1],
  'UnWash Godown': [2],
  '1st Wash': [4],
  '2nd Dry': [3],
  'Laser & Acid Wash': [11, 12],
};

const DRYER_STAGE_IDS = {
  '1st Wash Dryer': [6],
  '2nd Dryer': [7],
  'Final Dryer': [8],
  'Cool Dryer': [9],
  'ReDryer': [10],
  'Ozone': [13],
};

const TopSummaryCards = ({ isDarkMode, dashboardData, onCardClick }) => {
  const cards = [
    {
      title: '1st Dry  ',
      type: 'blue',
      icon: 'chart',
      received: dashboardData?.['1st Dry']?.receive || 0,
      delivery: dashboardData?.['1st Dry']?.delivery || 0,
      showBoth: true,
    },
    {
      title: 'UnWash Godown',
      type: 'blue',
      icon: 'home',
      // mainValue: dashboardData?.['Unwash']?.delivery || 0,
      delivery: dashboardData?.['Unwash']?.delivery || 0,
      showChart: true,
    },
    {
      title: '1st Wash  ',
      type: 'blue',
      icon: 'water',
      delivery: dashboardData?.['1st Wash']?.delivery || 0,
      showDeliveryOnly: true,
    },
    {
      title: '2nd Dry  ',
      type: 'blue',
      icon: 'fire',
      received: dashboardData?.['2nd Dry']?.receive || 0,
      delivery: dashboardData?.['2nd Dry']?.delivery || 0,
      showBoth: true,
    }, 
    {
      title: 'Laser & Acid Wash',
      type: 'blue',
      icon: 'chart',
      received: dashboardData?.['Laser']?.delivery || 0,
      delivery: dashboardData?.['Acid Wash']?.delivery || 0,
      leftLabel: 'Laser',
      rightLabel: 'Acid Wash',
      showBoth: true,
    },
    {
      title: 'Comming Soon',
      type: 'blue',
      icon: 'chart',
      received: dashboardData?.['Laser']?.delivery || 0,
      delivery: dashboardData?.['Acid Wash']?.delivery || 0,
      leftLabel: 'Laser',
      rightLabel: 'Acid Wash',
      showBoth: true,
    },
  ];

  return (
    <div className="top-summary-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
      {cards.map((card, index) => (
        <TopCard
          key={index}
          card={card}
          isDarkMode={isDarkMode}
          onCardClick={() => onCardClick({
            processStageIds: PROCESS_STAGE_IDS[card.title.trim()] || [1],
            modalTitle: card.title.trim(),
            mode: 'process',
          })}
        />
      ))}
    </div>
  );
};

const TopCard = ({ card, isDarkMode, onCardClick }) => {
  const isOrange = card.type === 'orange';

  const getIcon = () => {
    const iconClass = `w-4 h-4 ${isOrange ? 'text-orange-500' : 'text-blue-500'}`;
    switch (card.icon) {
      case 'chart':
        return <IconBarChart className={iconClass} />;
      case 'home':
        return <IconHome className={iconClass} />;
      case 'water':
        return <IconWaterDrop className={iconClass} />;
      case 'fire':
        return <IconFire className={iconClass} />;
      default:
        return <IconBarChart className={iconClass} />;
    }
  };

  return (
    <div
      onClick={onCardClick}
      className={`border-2 rounded-2xl p-1.5 md:p-2 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
        isDarkMode
          ? isOrange
            ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-400/30 hover:shadow-orange-500/20'
            : 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/30 hover:shadow-blue-500/20'
          : isOrange
            ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-300 hover:shadow-orange-200/50'
            : 'bg-gradient-to-br from-white to-blue-50 border-blue-200 hover:shadow-blue-200/50'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div
          className={`font-bold text-sm md:text-base leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
        >
          {card.title}
        </div>
        <div
          className={`p-1 rounded-lg border ${
            isOrange
              ? isDarkMode
                ? 'bg-orange-500/20 border-orange-400/30'
                : 'bg-orange-50 border-orange-200'
              : isDarkMode
                ? 'bg-blue-500/20 border-blue-400/30'
                : 'bg-blue-50 border-blue-100'
          }`}
        >
          {getIcon()}
        </div>
      </div>

      {/* Content */}
      {card.showBoth && (
        <div className="flex items-center justify-between">
          <CardIcon type={card.type} />
          <div className="flex gap-3">
          <StatBox
              label={card.leftLabel || 'Received'}
              value={card.received}
              trend="up"
              isDarkMode={isDarkMode}
            /> 
            <div
              className={`w-px ${isOrange ? 'bg-orange-200' : 'bg-blue-200'}`}
            />
            <StatBox
              label={card.rightLabel || 'Delivery'}
              value={card.delivery}
              trend="down"
              isGreen
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {card.showDeliveryOnly && (
        <div className="flex items-center justify-between">
          <WashIcon />
          <div className="text-center">
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-0 mt-0 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Delivery
            </p>
            <span
              className={`text-2xl md:text-3xl font-black leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
            >
              {formatDashboardNumber(card.delivery)}
            </span>
          </div>
        </div>
      )}

      {card.showChart && (
        <div className="flex items-center justify-between">
          <WashIcon2 />
          <div className="text-center">
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-0 mt-0 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            > 
               Delivery
            </p>
            <span
              className={`text-2xl md:text-3xl font-black leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
            >
              {formatDashboardNumber(card.delivery)}
            </span>
          </div>
        </div>
        // <div className="flex items-end justify-between gap-2">
        //   <div className="text-center">
        //     <span
        //       className={`text-3xl font-black block leading-none ${
        //         isDarkMode ? 'text-slate-200' : 'text-slate-800'
        //       }`}
        //     >
        //       {card.delivery?.toLocaleString()}
        //     </span>
        //     <span
        //       className={`text-xs font-bold uppercase mt-0.5 block leading-tight ${
        //         isDarkMode ? 'text-slate-400' : 'text-slate-500'
        //       }`}
        //     >
        //       Unwash
        //       <br />
        //       Delivery
        //     </span>
        //   </div>
        //   <MiniBarChart isDarkMode={isDarkMode} />
        // </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, trend, isGreen, isDarkMode }) => {
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return formatDashboardNumber(num);
  };

  return (
    <div className="text-center">
      <p
        className={`text-xs font-bold uppercase tracking-wider mb-0 mt-0 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        {label}
      </p>
      <div className="flex items-center gap-0.5 justify-center">
        <span
          className={`text-xl md:text-2xl font-black leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
        >
          {formatNumber(value)}
        </span>
        {/* {trend === 'up' ? (
          <IconTrendingUp className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        ) : (
          <IconTrendingDown className={`w-3 h-3 ${isGreen ? 'text-green-500' : 'text-orange-500'}`} />
        )} */}
      </div>
    </div>
  );
};

const CardIcon = ({ type }) => (
  <div
    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border-2 ${
      type === 'orange'
        ? 'bg-orange-200 border-orange-600'
        : 'bg-blue-200 border-blue-500'
    }`}
  >
    {type === 'orange' ? (
      <IconFire className="text-orange-700 w-5 h-5" />
    ) : (
      <IconBarChart className="text-blue-600 w-5 h-5" />
    )}
  </div>
);

const WashIcon = () => (
  <div className="flex gap-1">
    {[13, 9, 6, 4].map((size, i) => (
      <div
        key={i}
        style={{ width: size, height: size }}
        className="rounded-full bg-cyan-300 border-[1.5px] border-cyan-600"
      />
    ))}
  </div>
);
const WashIcon2 = () => (
  <div className="flex gap-1">
    {[13, 9, 6, 4].map((size, i) => (
      <div
        key={i}
        style={{ width: size, height: size }}
        className="rounded-full bg-gray-300 border-[1.5px] border-gray-600"
      />
    ))}
  </div>
);

const MiniBarChart = ({ isDarkMode }) => {
  // const bars = [
  //   { value: 900, height: '55%', active: false, label: 'Rec' },
  //   { value: 950, height: '70%', active: false, label: 'Nov' },
  //   { value: 950, height: '70%', active: true, label: 'Rec' },
  //   { value: 980, height: '90%', active: true, highlight: true, label: 'Dec' },
  // ];

  return (
    <div className="flex items-end gap-0.5 h-10">
      {/* {bars.map((bar, i) => {
        const barColor = bar.highlight
          ? 'bg-blue-600'
          : bar.active
            ? 'bg-blue-400'
            : isDarkMode
              ? 'bg-slate-600'
              : 'bg-slate-300';
        const textColor = bar.highlight
          ? 'text-blue-600'
          : bar.active
            ? 'text-blue-400'
            : isDarkMode
              ? 'text-slate-500'
              : 'text-slate-400';

        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className={`text-[9px] font-bold ${textColor}`}>{bar.value}</span>
            <div
              className={`w-[13px] ${barColor} rounded-t`}
              style={{ height: bar.height }}
            />
            <span className={`text-[9px] font-semibold ${textColor}`}>{bar.label}</span>
          </div>
        );
      })} */}
    </div>
  );
};

// ============ SECTION LABEL ============
const SectionLabel = ({ title, color, isDarkMode }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    sky: 'bg-sky-500',
  };
  const colorClassesLight = {
    blue: 'bg-blue-400',
    sky: 'bg-sky-300',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        <div className={`w-1 h-5 ${colorClasses[color]} rounded-full`} />
        <div className={`w-0.5 h-5 ${colorClassesLight[color]} rounded-full`} />
      </div>
      <div
        className={`text-sm md:text-base font-black uppercase tracking-wide py-0 ${
          isDarkMode ? 'text-slate-200' : 'text-slate-800'
        }`}
      >
        {title}
      </div>
      <div
        className={`flex-1 h-px bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-200' : 'from-sky-200'
        } to-transparent`}
      />
    </div>
  );
};

// ============ DHU SKELETON ============
const PulseBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded ${className}`} />
);

const DHUOverviewGridSkeleton = ({ isDarkMode }) => {
  const barClass = isDarkMode ? 'bg-slate-700/60' : 'bg-slate-200/80';

  const DrySkeleton = () => (
    <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700/40' : 'bg-white border-blue-200'}`}>
      <div className={`px-4 py-1 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
        <PulseBlock className={`h-4 w-4 ${barClass}`} />
        <PulseBlock className={`h-3 w-40 ${barClass}`} />
      </div>
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`rounded-xl border p-3 ${isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-gray-100 border-slate-200'}`}>
            <div className="flex justify-between mb-3">
              <PulseBlock className={`h-4 w-20 ${barClass}`} />
              <PulseBlock className={`h-6 w-14 rounded-lg ${barClass}`} />
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className={`rounded-lg p-1.5 border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <PulseBlock className={`h-2 w-10 mb-1 ${barClass}`} />
                  <PulseBlock className={`h-4 w-12 ${barClass}`} />
                </div>
              ))}
            </div>
            <div className={`rounded-xl border p-2.5 ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'}`}>
              <PulseBlock className={`h-3 w-24 mb-2 ${barClass}`} />
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <PulseBlock className={`h-5 w-5 rounded-full ${barClass}`} />
                    <PulseBlock className={`h-3 w-20 ${barClass}`} />
                  </div>
                  <PulseBlock className={`h-3 w-8 ${barClass}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const WashSkeleton = () => (
    <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-sky-500/20' : 'bg-white border-sky-200'}`}>
      <div className={`px-4 py-1 border-b flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-sky-50 border-sky-100'}`}>
        <PulseBlock className={`h-4 w-4 ${barClass}`} />
        <PulseBlock className={`h-3 w-36 ${barClass}`} />
      </div>
      <div className="px-3 py-2 grid grid-cols-[1.1fr_0.9fr] gap-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`rounded-xl p-2 border ${isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-gray-100 border-slate-200'}`}>
                <PulseBlock className={`h-2 w-12 mb-1 ${barClass}`} />
                <PulseBlock className={`h-5 w-16 ${barClass}`} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-xl p-2 border flex flex-col items-center ${isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-gray-100 border-slate-200'}`}>
                <PulseBlock className={`h-14 w-14 rounded-full mb-1 ${barClass}`} />
                <PulseBlock className={`h-2 w-8 ${barClass}`} />
              </div>
            ))}
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${isDarkMode ? 'bg-slate-800/70 border-slate-700' : 'bg-gray-100 border-slate-200'}`}>
          <PulseBlock className={`h-3 w-24 mb-3 ${barClass}`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PulseBlock className={`h-6 w-6 rounded-full ${barClass}`} />
                <PulseBlock className={`h-3 w-24 ${barClass}`} />
              </div>
              <PulseBlock className={`h-3 w-8 ${barClass}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
      <div className="md:col-span-8"><DrySkeleton /></div>
      <div className="md:col-span-4"><WashSkeleton /></div>
      <div className="md:col-span-8"><DrySkeleton /></div>
      <div className="md:col-span-4"><WashSkeleton /></div>
    </div>
  );
};

  
// ============ DHU OVERVIEW GRID ============
const DHUOverviewGrid = ({ isDarkMode, getSectionDHU }) => {
  const firstDryData = getSectionDHU(1);
  const firstWashData = getSectionDHU(2);
  const secondDryData = getSectionDHU(3);
  const finalWashData = getSectionDHU(4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
      <div className="md:col-span-8">
        <DryDHUPanel
          title="1ST DRY SECTION"
          sectionData={firstDryData}
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="md:col-span-4">
        <WashDHUPanel
          title="1ST WASH SECTION"
          sectionData={firstWashData}
          isDarkMode={isDarkMode}
          accent="blue"
        />
      </div>

      <div className="md:col-span-8">
        <DryDHUPanel
          title="2ND DRY SECTION"
          sectionData={secondDryData}
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="md:col-span-4">
        <WashDHUPanel
          title="FINAL WASH SECTION"
          sectionData={finalWashData}
          isDarkMode={isDarkMode}
          accent="sky"
        />
      </div>
    </div>
  );
};

// ============ DRY PANELS ============
const DryDHUPanel = ({ title, sectionData, isDarkMode }) => {
  const {
    processes = [],
    topIssuesByProcess = {},
    getProcessDisplayName,
  } = sectionData || {};

  const gridClass =
    processes.length >= 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : processes.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1';

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden ${
        isDarkMode
          ? 'bg-slate-900 border-teal-500/20'
          : 'bg-white border-blue-200'
      }`}
    >
      <div
        className={`px-3 md:px-4 py-1 border-b flex items-center justify-between ${
          isDarkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-gradient-to-r from-blue-50 to-slate-50 border-blue-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <IconTrendingUp className="w-4 h-4 text-blue-500" />
          <div
            className={`text-sm md:text-base font-black tracking-wider uppercase ${
              isDarkMode ? 'text-slate-100' : 'text-blue-700'
            }`}
          >
            {title}
          </div>
        </div>
      </div>





      <div className={`p-2 md:p-3 grid ${gridClass} gap-2`}>
        {processes.length > 0 ? (
          processes.map((proc, index) => (
            <DryProcessCard
              key={index}
              process={proc}
              processName={getProcessDisplayName(proc.processName)}
              topIssues={topIssuesByProcess[proc.processName] || []}
              isDarkMode={isDarkMode}
            />
          ))
        ) : (
          <div className={`text-center py-8 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            No process data
          </div>
        )}
      </div>
    </div>
  );
};

const DryProcessCard = ({ process, processName, topIssues, isDarkMode }) => {
  const dhu = process?.dhu || 0;
  const passQty = process?.passQty || 0;
  const defectQty = process?.defectQty || 0;
  const rejectQty = process?.rejectQty || 0;
  const targetQty = process?.dayTarget || 0;
  const manPower = process?.manPower || 0;

  const dhuGood = dhu <= 10;

  const achievementPct =
    targetQty > 0
      ? parseFloat(Math.min((passQty / targetQty) * 100, 999).toFixed(1))
      : 0;

  const defectRatio =
    passQty + defectQty > 0
      ? parseFloat(Math.min((defectQty / (passQty + defectQty)) * 100, 100).toFixed(1))
      : 0;

  return (
    <div
      className={`rounded-xl border p-1 ${
        isDarkMode
          ? 'bg-slate-800/70 border-slate-700'
          : 'bg-gray-100 border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-[2px]">
        <div
          className={`px-2 py-1 text-sm lg:text-[15px] font-black leading-tight ${
            isDarkMode ? 'text-slate-100' : 'text-slate-800'
          }`}
        >
          {processName}
        </div>

        <div
          className={`px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap ${
            dhuGood
              ? isDarkMode
                ? 'bg-green-500/15 text-green-400'
                : 'bg-green-50 text-green-700'
              : isDarkMode
              ? 'bg-orange-500/15 text-orange-400'
              : 'bg-orange-50 text-orange-700'
          }`}
        >
          DHU {dhu}%
        </div>
      </div>

      {/* KPI + Rings */}
      {/* <div className="grid grid-cols-[1.35fr_0.95fr] gap-3 items-start"> */}
        <div className="grid grid-cols-4 gap-2">
          <MiniInfoTile label="Target" value={targetQty} isDarkMode={isDarkMode} />
          <MiniInfoTile label="Output" value={passQty} isDarkMode={isDarkMode} />
          <MiniInfoTile label="Defect" value={defectQty} isDarkMode={isDarkMode} danger />
          <MiniInfoTile label="Manpower" value={manPower.toFixed(0)} isDarkMode={isDarkMode} />
        </div>

        {/* <div className="flex items-center justify-center gap-2">
          <MiniDonut
            value={achievementPct}
            label="Achv"
            color="#2563eb"
            isDarkMode={isDarkMode}
          />
          <MiniDonut
            value={defectRatio}
            label="Def"
            color={dhuGood ? '#16a34a' : '#ea580c'}
            isDarkMode={isDarkMode}
          />
        </div> */}
      {/* </div> */}

      {/* Bottom defects */}
      <div
        className={`mt-2 rounded-xl border p-2 md:p-2.5 ${
          isDarkMode
            ? 'bg-slate-900/60 border-slate-700'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[10px] md:text-xs font-black tracking-wider uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Top 3 Defects
          </span>
          <span className={`text-[10px] md:text-[11px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Reject {formatDashboardNumber(rejectQty)}
          </span>
        </div>

        {topIssues.length > 0 ? (
          <div className="space-y-1">
            {topIssues.slice(0, 3).map((issue, i) => (
              <div key={i} className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black shrink-0 ${
                      isDarkMode
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-xs lg:text-[12px] font-semibold truncate ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-700'
                    }`}
                    title={issue.issueName}
                  >
                    {issue.issueName}
                  </span>
                </div>

                <span className={`text-xs lg:text-[13px] font-black shrink-0 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  {formatDashboardNumber(issue.qty)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            No defect data
          </div>
        )}
      </div>
    </div>
  );
};

// ============ WASH PANELS ============
const WashDHUPanel = ({ title, sectionData, isDarkMode, accent = 'blue' }) => {
  const {
    totalPassQty = 0,
    totalDefectQty = 0,
    totalRejectQty = 0,
    totalTargetQty = 0,
    totalManPower = 0,
    overallDhu = 0,
    achievementPct = 0,
    topIssues = [],
  } = sectionData || {};

  const dhuGood = overallDhu <= 10;

  const defectRatio =
    totalPassQty + totalDefectQty > 0
      ? parseFloat(Math.min((totalDefectQty / (totalPassQty + totalDefectQty)) * 100, 100).toFixed(1))
      : 0;

  const accentHeader =
    accent === 'sky'
      ? isDarkMode
        ? 'bg-slate-800 border-slate-700'
        : 'bg-gradient-to-r from-sky-50 to-slate-50 border-sky-100'
      : isDarkMode
      ? 'bg-slate-800 border-slate-700'
      : 'bg-gradient-to-r from-blue-50 to-slate-50 border-blue-100';

  const accentText =
    accent === 'sky'
      ? isDarkMode ? 'text-slate-100' : 'text-sky-700'
      : isDarkMode ? 'text-slate-100' : 'text-blue-700';

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden ${
        isDarkMode
          ? 'bg-slate-900 border-sky-500/20'
          : 'bg-white border-sky-200'
      }`}
    >
      <div className={`px-3 md:px-4 py-1 border-b flex items-center gap-2 ${accentHeader}`}>
        <IconWaterDrop className="w-4 h-4 text-sky-500" />
        <div className={`text-sm md:text-base font-black tracking-wider uppercase ${accentText}`}>
          {title}
        </div>
      </div>

      <div className="px-2 md:px-3 py-2 grid grid-cols-[1.1fr_0.9fr] gap-2">
        {/* Left */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5 md:gap-2">
            <BigInfoTile label="Output" value={totalPassQty} isDarkMode={isDarkMode} color="blue" />
            <BigInfoTile label="Target" value={totalTargetQty || '-'} isDarkMode={isDarkMode} />
            <BigInfoTile label="Defect" value={totalDefectQty} isDarkMode={isDarkMode} color="red" />
            <BigInfoTile label="Manpower" value={totalManPower ? totalManPower.toFixed(1) : '-'} isDarkMode={isDarkMode} />
          </div>

          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            <SummaryDonutCard
              title="Achv"
              value={achievementPct}
              color="#2563eb"
              isDarkMode={isDarkMode}
            />
            <SummaryDonutCard
              title="Def"
              value={defectRatio}
              color={dhuGood ? '#16a34a' : '#ea580c'}
              isDarkMode={isDarkMode}
            />
            <div
              className={`rounded-xl border px-2 py-3 flex flex-col items-center justify-center ${
                dhuGood
                  ? isDarkMode
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-green-50 border-green-100'
                  : isDarkMode
                  ? 'bg-orange-500/10 border-orange-500/20'
                  : 'bg-orange-50 border-orange-100'
              }`}
            >
              <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                DHU
              </span>
              <span className={`text-xl lg:text-2xl font-black ${dhuGood ? 'text-green-600' : 'text-orange-600'}`}>
                {overallDhu}%
              </span>
              <span className={`text-[10px] md:text-[11px] font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Reject {formatDashboardNumber(totalRejectQty)}
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div
          className={`rounded-xl border p-2 md:p-3 ${
            isDarkMode
              ? 'bg-slate-800/70 border-slate-700'
              : 'bg-gray-100 border-slate-200'
          }`}
        >
          <h4 className={`text-xs md:text-sm font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            Top 3 Defects
          </h4>

          {topIssues.length > 0 ? (
            <div className="space-y-1.5">
              {topIssues.slice(0, 3).map((issue, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-[11px] font-black shrink-0 ${
                        isDarkMode
                          ? 'bg-slate-700 text-slate-100'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`text-sm lg:text-[15px] font-semibold truncate ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}
                      title={issue.issueName}
                    >
                      {issue.issueName}
                    </span>
                  </div>

                  <span className={`text-sm lg:text-[15px] font-black shrink-0 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    {formatDashboardNumber(issue.qty)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              No defect data
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ SMALL UI BLOCKS ============
const MiniInfoTile = ({ label, value, isDarkMode, danger = false }) => {
  return (
    <div
      className={`rounded-lg px-1 py-0.5 border ${
        danger
          ? isDarkMode
            ? 'bg-red-500/10 border-red-500/20'
            : 'bg-red-50 border-red-100'
          : isDarkMode
          ? 'bg-slate-900/70 border-slate-700'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className={`text-sm lg:text-[18px] font-black mt-1 ${danger ? 'text-red-500' : isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
        {typeof value === 'number' ? formatDashboardNumber(value) : value}
      </div>
    </div>
  );
};

const BigInfoTile = ({ label, value, isDarkMode, color = 'default' }) => {
  const colorClass =
    color === 'red'
      ? 'text-red-500'
      : color === 'blue'
      ? isDarkMode ? 'text-sky-400' : 'text-blue-600'
      : isDarkMode
      ? 'text-slate-100'
      : 'text-slate-800';

  return (
    <div
      className={`rounded-xl px-1.5 md:px-2 py-1 md:py-[7px] border ${
        isDarkMode
          ? 'bg-slate-800/70 border-slate-700'
          : 'bg-gray-100 border-slate-200'
      }`}
    >
      <div className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className={`text-lg lg:text-xl font-black mt-1 ${colorClass}`}>
        {typeof value === 'number' ? formatDashboardNumber(value) : value}
      </div>
    </div>
  );
};

const MiniDonut = ({ value, label, color, isDarkMode }) => {
  const safeValue = Math.max(0, Math.min(value || 0, 100));
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={isDarkMode ? '#334155' : '#e2e8f0'}
            strokeWidth="4"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[11px] font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {safeValue}%
          </span>
        </div>
      </div>
      <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  );
};

const SummaryDonutCard = ({ title, value, color, isDarkMode }) => {
  return (
    <div
      className={`rounded-xl border px-1.5 md:px-2 py-1.5 md:py-2 flex flex-col items-center justify-center ${
        isDarkMode
          ? 'bg-slate-800/70 border-slate-700'
          : 'bg-gray-100 border-slate-200'
      }`}
    >
      <MiniDonut value={value} label={title} color={color} isDarkMode={isDarkMode} />
    </div>
  );
};

// ============ DRYER PRODUCTION SUMMARY ============
const DryerProductionSummary = ({ isDarkMode, dashboardData, onCardClick }) => {
  const dryers = [
    { name: '1st Wash Dryer', delivery: dashboardData?.['1st Dryer']?.delivery || 0 },
    { name: '2nd Dryer', delivery: dashboardData?.['2nd Dryer']?.delivery || 0 },
    { name: 'Final Dryer', delivery: dashboardData?.['Final Dryer']?.delivery || 0 },
    { name: 'Cool Dryer', delivery: dashboardData?.['Cool Dryer']?.delivery || 0 },
    { name: 'ReDryer', delivery: dashboardData?.['ReDryer']?.delivery || 0 },
    { name: 'Ozone', delivery: dashboardData?.['Ozone']?.delivery || 0 },
  ];

  return (
    <div className="dryer-summary-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
      {dryers.map((dryer, index) => (
        <DryerCard
          key={index}
          dryer={dryer}
          isDarkMode={isDarkMode}
          onCardClick={() => onCardClick({
            processStageIds: DRYER_STAGE_IDS[dryer.name] || [6, 7, 8, 9, 10],
            modalTitle: dryer.name,
            mode: 'dryer',
          })}
        />
      ))}
    </div>
  );
};

const DryerCard = ({ dryer, isDarkMode, onCardClick }) => {
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return formatDashboardNumber(num);
  };

  return (
    <div
      onClick={onCardClick}
      className={`border-2 rounded-2xl p-1.5 md:p-2 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl flex items-center gap-2 md:gap-4 ${
        isDarkMode
          ? 'bg-gradient-to-br from-sky-500/10 to-sky-600/5 border-sky-400/30 hover:shadow-sky-500/20'
          : 'bg-gradient-to-br from-white to-sky-50 border-sky-200 hover:shadow-sky-200/50'
      }`}
    >

      {/* Icon Section */}
      <div
        className={`w-10 h-10 md:w-14 md:h-14 rounded-lg flex items-center justify-center border ${
          isDarkMode
            ? 'bg-sky-500/15 border-sky-500/30'
            : 'bg-sky-50 border-sky-100'
        }`}
      >
        <DryerIcon isDarkMode={isDarkMode} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">

        {/* Title */}
        <h4 className={`text-xs md:text-base font-semibold mb-0.5 md:mb-1 mt-[2px] md:mt-[5px] ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
          {dryer.name}
        </h4>

        {/* Delivery Value */}
        <div className="flex items-end gap-1 md:gap-2">
          <span className={`text-xl md:text-3xl font-bold leading-none ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`}>
            {formatNumber(dryer.delivery)}
          </span>
          <span className={`text-xs md:text-sm font-medium pb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
            Delivery
          </span>
        </div>

        {/* Bottom Accent Line */}
        <div className={`mt-1 md:mt-2 h-1 w-8 md:w-10 rounded-full ${isDarkMode ? 'bg-sky-500/30' : 'bg-sky-200'}`} />

      </div>

    </div>
  );
};

const DryerIcon = ({ isDarkMode }) => (
  <div className="w-7 h-7 md:w-10 md:h-10">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect
        x="6"
        y="6"
        width="52"
        height="54"
        rx="7"
        fill={isDarkMode ? '#0c4a6e' : '#bae6fd'}
        stroke={isDarkMode ? '#0ea5e9' : '#0284c7'}
        strokeWidth="2.5"
      />
      <rect x="6" y="6" width="52" height="13" rx="7" fill={isDarkMode ? '#0c4a6e' : '#0369a1'} />
      <rect x="6" y="13" width="52" height="6" fill={isDarkMode ? '#0c4a6e' : '#0369a1'} />
      <circle cx="14" cy="12" r="2.5" fill="#38bdf8" />
      <circle cx="20" cy="12" r="2.5" fill="#34d399" />
      <rect x="34" y="8" width="18" height="7" rx="3" fill={isDarkMode ? '#0284c7' : '#075985'} />
      <circle cx="38" cy="11.5" r="1.2" fill="#7dd3fc" />
      <circle cx="43" cy="11.5" r="1.2" fill="#7dd3fc" />
      <circle cx="48" cy="11.5" r="1.2" fill="#7dd3fc" />
      <circle cx="32" cy="38" r="16" fill={isDarkMode ? '#164e63' : 'white'} stroke={isDarkMode ? '#0ea5e9' : '#0284c7'} strokeWidth="2.5" />
      <circle cx="32" cy="38" r="11" fill={isDarkMode ? '#0c4a6e' : '#e0f2fe'} stroke={isDarkMode ? '#0ea5e9' : '#0ea5e9'} strokeWidth="1.5" />
      <path
        d="M21 40 Q26.5 35.5 32 40 T43 40 L43 47 A11 11 0 0 1 21 47Z"
        fill="#0ea5e9"
        opacity="0.7"
      />
      <circle cx="32" cy="38" r="3" fill={isDarkMode ? '#7dd3fc' : '#075985'} />
    </svg>
  </div>
); 

export default Dashboard;
