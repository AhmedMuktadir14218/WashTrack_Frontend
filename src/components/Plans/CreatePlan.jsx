import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansApi } from '../../api/plansApi';
import toast from 'react-hot-toast';

const WASH_STAGE_IDS = [4, 5]; // 1st Wash, Final Wash
const DRY_STAGE_IDS = [1, 3]; // 1st Dry, 2nd Dry

const CreatePlan = () => {
  const navigate = useNavigate();

  // ── State ──
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedProcessStage, setSelectedProcessStage] = useState(null);

  const [planDate, setPlanDate] = useState('');
  const [shift, setShift] = useState('');
  const [plantId, setPlantId] = useState('');
  const [unitId, setUnitId] = useState('');

  const [plantUnitList, setPlantUnitList] = useState([]);
  const [machines, setMachines] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [planItems, setPlanItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [machineSearchTerms, setMachineSearchTerms] = useState({});
  const [openDropdownFor, setOpenDropdownFor] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [activeTab, setActiveTab] = useState('workOrders');

  const [modalPagination, setModalPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalRecords: 0
  });

  // Wash plans for dry-only permission users
  const [washPlans, setWashPlans] = useState([]);
  const [washPlansLoading, setWashPlansLoading] = useState(false);
  const [plannedPagination, setPlannedPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalRecords: 0
  });

  const [plannedFilters, setPlannedFilters] = useState({
    planDate: new Date().toISOString().split('T')[0],
    shift: '',
    plantId: '',
    unitId: ''
  });

  const dropdownBtnRefs = useRef({});
  const searchTimerRef = useRef(null);
  const tableScrollRef = useRef(null);

  // ── Permission Logic ──
  const hasWashPermission = user?.processStageAccesses?.some(s => WASH_STAGE_IDS.includes(s.processStageId));
  const hasDryPermission = user?.processStageAccesses?.some(s => DRY_STAGE_IDS.includes(s.processStageId));
  const isWashStage = WASH_STAGE_IDS.includes(selectedProcessStage?.processStageId);
  const isDryStage = DRY_STAGE_IDS.includes(selectedProcessStage?.processStageId);
  const showPlannedTab = !hasWashPermission && hasDryPermission;

  // ── Calculation Logic ──
  const calculateBaseTarget = (shiftVal, machineQty, cycleTime, batchQty) => {
    if (!shiftVal || machineQty === 0 || !cycleTime || !batchQty) return 0;
    const shiftHours = parseInt(shiftVal)=== 1 ? 11 : 12;
    return Math.floor((((shiftHours*60)/ cycleTime) * batchQty) * machineQty);
    // return (((shiftHours * 60) * machineQty) / cycleTime) * batchQty;
    // return (shiftHours*60)
     
  };
 



  const calculateAdjusted = (base, percentage) => {
    return base - Math.floor(base * (percentage / 100));
  };

  // ── Helpers ──
  const getPlanItem = (woNo) => planItems.find(i => i.workOrderNo === woNo);
  const isInPlan = (woNo) => !!getPlanItem(woNo);

  // ── Init ──
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      if (parsed.userAssigns?.length > 0) {
        const first = parsed.userAssigns[0];
        setPlantId(first.plantId.toString());
        setUnitId(first.unitId.toString());
      }
    }
    setPlanDate(new Date().toISOString().split('T')[0]);
    fetchPlantUnitList();
  }, []);

  useEffect(() => {
    if (plantId && unitId) fetchMachines();
    else setMachines([]);
  }, [plantId, unitId]);

  // Fetch wash plans when planned tab is shown and stage is selected
  useEffect(() => {
    if (showPlannedTab && selectedProcessStage && isDryStage && plannedFilters.planDate) {
      fetchWashPlans();
    }
  }, [showPlannedTab, selectedProcessStage, plannedFilters]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!openDropdownFor) return;
      const btnRef = dropdownBtnRefs.current[openDropdownFor];
      const dropdownEl = document.getElementById('machine-dropdown');
      if (btnRef && !btnRef.contains(e.target) && dropdownEl && !dropdownEl.contains(e.target)) {
        setOpenDropdownFor(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdownFor]);

  // Close dropdown on table scroll
  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    const handler = () => { if (openDropdownFor) setOpenDropdownFor(null); };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [openDropdownFor]);

  // ── API Calls ──
  const fetchPlantUnitList = async () => {
    try {
      const response = await plansApi.getPlantUnitList();
      setPlantUnitList(response.data || []);
    } catch (error) {
      console.error('Error fetching plant/unit list:', error);
    }
  };

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await plansApi.getMachines(plantId, unitId);
      setMachines(response.data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast.error('Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  const fetchWashPlans = async () => {
    try {
      setWashPlansLoading(true);
      const params = {};
      if (plannedFilters.planDate) {
        params.FromDate = plannedFilters.planDate;
        params.ToDate = plannedFilters.planDate;
      }
      if (plannedFilters.shift) params.Shift = parseInt(plannedFilters.shift);
      if (plannedFilters.plantId) params.PlantId = parseInt(plannedFilters.plantId);
      if (plannedFilters.unitId) params.UnitId = parseInt(plannedFilters.unitId);
      
      if (selectedProcessStage) {
        params.ProcessStageId = selectedProcessStage.processStageId;
      }
      
      params.PageNumber = 1;
      params.PageSize = 100;

      const response = await plansApi.getWashPlans(params);
      if (response.data?.success) {
        const records = response.data.data.records || [];
        const filtered = records.filter(r => 
          r.processStageId === selectedProcessStage?.processStageId &&
          !(r.finalTargetQty > 0)
        );
        
        setWashPlans(filtered);
        setPlannedPagination({
          pageNumber: response.data.data.pageNumber || 1,
          pageSize: response.data.data.pageSize || 100,
          totalRecords: response.data.data.totalRecords || 0
        });
      }
    } catch (error) {
      console.error('Error fetching wash plans:', error);
    } finally {
      setWashPlansLoading(false);
    }
  };

  const searchWorkOrders = useCallback(async (term, page = 1) => {
    try {
      setSearchLoading(true);
      const params = { Search: term?.trim() || '', PageNumber: page, PageSize: modalPagination.pageSize };
      const response = await plansApi.getWashPlanModal(params);
      const result = response?.data?.data || response?.data || {};
      const records = result.records || [];
      if (page === 1) setWorkOrders(records);
      else setWorkOrders(prev => [...prev, ...records]);
      setModalPagination(prev => ({
        ...prev,
        pageNumber: result.pageNumber || page,
        totalRecords: result.totalRecords || 0
      }));
    } catch (error) {
      console.error('Error searching work orders:', error);
      toast.error('Failed to search work orders');
    } finally {
      setSearchLoading(false);
    }
  }, [modalPagination.pageSize]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length === 0) { setWorkOrders([]); return; }
    searchTimerRef.current = setTimeout(() => {
      setModalPagination(prev => ({ ...prev, pageNumber: 1 }));
      searchWorkOrders(value, 1);
    }, 500);
  };

  const handleLoadMore = () => {
    searchWorkOrders(searchTerm, modalPagination.pageNumber + 1);
  };

  // ── Plan Item Handlers ──
  const ensureInPlan = (order) => {
    if (isInPlan(order.workOrderNo)) return;

    let baseTargetDefault = 0;
    let cycleTimeValue = 0;
    let batchQtyValue = 0;

    if (isWashStage) {
      const processStageId = selectedProcessStage?.processStageId;
      if (processStageId === 4) {
        cycleTimeValue = order.firstWashBatchTime || 0;
        batchQtyValue = order.firstWashBatchQty || 0;
      } else if (processStageId === 5) {
        cycleTimeValue = order.secondWashBatchTime || 0;
        batchQtyValue = order.secondWashBatchQty || 0;
      }
      if (cycleTimeValue && batchQtyValue && shift) {
        const machineQty = 0;
        baseTargetDefault = calculateBaseTarget(shift, machineQty, cycleTimeValue, batchQtyValue);
      }
    }

    if (showPlannedTab) {
      const matchingWashPlan = washPlans.find(wp => wp.workOrderNo === order.workOrderNo);
      if (matchingWashPlan) {
        baseTargetDefault = matchingWashPlan.baseTargetQty || matchingWashPlan.finalTargetQty || 0;
      }
    }

    const newItem = {
      workOrderId: order.workOrderId || order.id || null,
      workOrderNo: order.workOrderNo,
      styleName: order.styleName || '',
      buyer: order.buyer || '',
      color: order.color || '',
      unit: order.unit || '',
      orderQuantity: order.orderQuantity || 0,
      washBalance: order.washBalance || 0,
      marks: order.marks || '',
      machineIds: [],
      selectedMachines: [],
      cycleTime: cycleTimeValue,
      batchQty: batchQtyValue,
      baseTargetQty: baseTargetDefault,
      percentage: 0,
      finalTargetQty: 0,
      adjustedTargetQty: 0,
      remarks: ''
    };

    setPlanItems(prev => [...prev, newItem]);
    toast.success(`${order.workOrderNo} added`, { icon: '✅', duration: 1500, style: { background: '#10B981', color: '#fff' } });
  };

  const addFromPlanned = (wp) => {
    if (isInPlan(wp.workOrderNo)) return;

    const newItem = {
      workOrderId: wp.workOrderId || wp.id || null,
      workOrderNo: wp.workOrderNo,
      styleName: wp.styleName || '',
      buyer: wp.buyer || wp.buyerDepartment || '',
      color: wp.color || '',
      unit: wp.unit || '',
      orderQuantity: wp.orderQuantity || 0,
      washBalance: wp.washBalance || 0,
      marks: wp.marks || '',
      machineIds: [],
      selectedMachines: [],
      cycleTime: wp.cycleTime || 0,
      batchQty: wp.batchQty || 0,
      baseTargetQty: wp.baseTargetQty || 0,
      percentage: 0,
      finalTargetQty: wp.finalTargetQty || 0,
      adjustedTargetQty: wp.finalTargetQty || 0,
      remarks: ''
    };

    setPlanItems(prev => [...prev, newItem]);
    toast.success(`${wp.workOrderNo} added`, { icon: '✅', duration: 1500, style: { background: '#10B981', color: '#fff' } });
  };

  const handleRemoveFromPlan = (woNo) => {
    setPlanItems(prev => prev.filter(i => i.workOrderNo !== woNo));
    if (openDropdownFor === woNo) setOpenDropdownFor(null);
    toast.success('Removed', { icon: '🗑️', duration: 1500, style: { background: '#EF4444', color: '#fff' } });
  };

  // const handleBaseTargetChange = (woNo, value) => {
  //   const val = parseInt(value) || 0;
  //   if (isDryStage && hasWashPermission) {
  //     setPlanItems(prev => prev.map(item => {
  //       if (item.workOrderNo !== woNo) return item;
  //       return { ...item, baseTargetQty: val, finalTargetQty: val, percentage: 0, adjustedTargetQty: val };
  //     }));
  //   } else if (isDryStage && showPlannedTab) {
  //     return;
  //   } else {
  //     // Wash Stage (Now editable manually too)
  //     setPlanItems(prev => prev.map(item => {
  //       if (item.workOrderNo !== woNo) return item;
  //       const adjusted = calculateAdjusted(val, item.percentage);
  //       return { ...item, baseTargetQty: val, adjustedTargetQty: adjusted };
  //     }));
  //   }
  // };

    const handleBaseTargetChange = (woNo, value) => {
    const val = parseInt(value) || 0;
    if (isDryStage && hasWashPermission) {
      setPlanItems(prev => prev.map(item => {
        if (item.workOrderNo !== woNo) return item;
        // ✅ FIX: Removed finalTargetQty & adjustedTargetQty so they don't copy the base value
        return { ...item, baseTargetQty: val, percentage: 0 };
      }));
    } else if (isDryStage && showPlannedTab) {
      return;
    } else {
      // Wash Stage (Now editable manually too)
      setPlanItems(prev => prev.map(item => {
        if (item.workOrderNo !== woNo) return item;
        const adjusted = calculateAdjusted(val, item.percentage);
        return { ...item, baseTargetQty: val, adjustedTargetQty: adjusted };
      }));
    }
  };

  const handlePercentageChange = (woNo, value) => {
    const val = parseFloat(value) || 0;
    setPlanItems(prev => prev.map(item => {
      if (item.workOrderNo !== woNo) return item;
      const machineQty = item.machineIds?.length || 0;
      const base = calculateBaseTarget(shift, machineQty, item.cycleTime, item.batchQty);
      const adjusted = calculateAdjusted(base, val);
      return { 
        ...item, 
        percentage: val, 
        baseTargetQty: base, 
        adjustedTargetQty: adjusted
        // Final Target stays independent - NOT auto-copied from adjusted
      };
    }));
  };

  const handleAdjustedTargetChange = (woNo, value) => {
    const val = parseInt(value) || 0;
    setPlanItems(prev => prev.map(item => {
      if (item.workOrderNo !== woNo) return item;
      return { ...item, adjustedTargetQty: val };
    }));
  };

  const handleFinalTargetChange = (woNo, value) => {
    setPlanItems(prev => prev.map(item => {
      if (item.workOrderNo !== woNo) return item;
      return { ...item, finalTargetQty: parseInt(value) || 0 };
    }));
  };

  // ── Machine Handlers ──
  const toggleMachine = (woNo, machine) => {
    setPlanItems(prev => prev.map(item => {
      if (item.workOrderNo !== woNo) return item;
      const isSelected = item.machineIds.includes(machine.id);
      const newMachineIds = isSelected ? item.machineIds.filter(id => id !== machine.id) : [...item.machineIds, machine.id];
      const newSelectedMachines = isSelected ? item.selectedMachines.filter(m => m.id !== machine.id) : [...item.selectedMachines, { id: machine.id, machineCode: machine.machineCode }];
      const updated = {
        ...item,
        machineIds: newMachineIds,
        selectedMachines: newSelectedMachines
      };
      if (isWashStage) {
        const machineQty = newMachineIds.length;
        const base = calculateBaseTarget(shift, machineQty, updated.cycleTime, updated.batchQty);
        const adjusted = calculateAdjusted(base, updated.percentage);
        updated.baseTargetQty = base;
        updated.adjustedTargetQty = adjusted;
        // Final Target stays independent - NOT auto-copied from base/adjusted
      }
      return updated;
    }));
  };

  const removeMachineTag = (woNo, machineId) => {
    setPlanItems(prev => prev.map(item => {
      if (item.workOrderNo !== woNo) return item;
      const newMachineIds = item.machineIds.filter(id => id !== machineId);
      const newSelectedMachines = item.selectedMachines.filter(m => m.id !== machineId);
      const updated = { ...item, machineIds: newMachineIds, selectedMachines: newSelectedMachines };
      if (isWashStage) {
        const machineQty = newMachineIds.length;
        const base = calculateBaseTarget(shift, machineQty, updated.cycleTime, updated.batchQty);
        const adjusted = calculateAdjusted(base, updated.percentage);
        updated.baseTargetQty = base;
        updated.adjustedTargetQty = adjusted;
        // Final Target stays independent - NOT auto-copied from base/adjusted
      }
      return updated;
    }));
  };

  const selectAllMachines = (woNo) => {
    setPlanItems(prev => prev.map(item => {
      if (item.workOrderNo !== woNo) return item;
      const newMachineIds = machines.map(m => m.id);
      const newSelectedMachines = machines.map(m => ({ id: m.id, machineCode: m.machineCode }));
      const updated = { ...item, machineIds: newMachineIds, selectedMachines: newSelectedMachines };
      if (isWashStage) {
        const machineQty = newMachineIds.length;
        const base = calculateBaseTarget(shift, machineQty, updated.cycleTime, updated.batchQty);
        const adjusted = calculateAdjusted(base, updated.percentage);
        updated.baseTargetQty = base;
        updated.adjustedTargetQty = adjusted;
        // Final Target stays independent - NOT auto-copied from base/adjusted
      }
      return updated;
    }));
  };

  const clearAllMachines = (woNo) => {
    setPlanItems(prev => prev.map(item => {
      if (item.workOrderNo !== woNo) return item;
      const updated = { ...item, machineIds: [], selectedMachines: [] };
      if (isWashStage) {
        const base = calculateBaseTarget(shift, 0, updated.cycleTime, updated.batchQty);
        const adjusted = calculateAdjusted(base, updated.percentage);
        updated.baseTargetQty = base;
        updated.adjustedTargetQty = adjusted;
        // Final Target stays independent - NOT auto-copied from base/adjusted
      }
      return updated;
    }));
  };

  const toggleDropdown = (woNo, e) => {
    if (openDropdownFor === woNo) {
      setOpenDropdownFor(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < dropdownHeight
      ? rect.top - dropdownHeight - 4
      : rect.bottom + 4;

    setDropdownPos({ top, left: rect.left });
    setOpenDropdownFor(woNo);
  };

  const getFilteredMachines = (woNo) => {
    const term = machineSearchTerms[woNo] || '';
    if (!term) return machines;
    const lower = term.toLowerCase();
    return machines.filter(m =>
      m.machineCode?.toLowerCase().includes(lower) ||
      m.brand?.toLowerCase().includes(lower) ||
      m.model?.toLowerCase().includes(lower)
    );
  };

  useEffect(() => {
    if (isWashStage && shift && planItems.length > 0) {
      setPlanItems(prev => prev.map(item => {
        const machineQty = item.machineIds?.length || 0;
        const base = calculateBaseTarget(shift, machineQty, item.cycleTime, item.batchQty);
        const adjusted = calculateAdjusted(base, item.percentage);
        return { ...item, baseTargetQty: base, adjustedTargetQty: adjusted };
      }));
    }
  }, [shift, isWashStage]);

  // ── Submit ──
  const handleSubmit = async () => {
    if (!selectedProcessStage) return toast.error('Select a process stage');
    if (!planDate) return toast.error('Select a plan date');
    if (!shift) return toast.error('Select a shift');
    if (!plantId) return toast.error('Select a plant');
    if (!unitId) return toast.error('Select a unit');
    if (planItems.length === 0) return toast.error('Add at least one work order');

    for (const item of planItems) {
      // if (!isDryStage) {
      //   // Wash Stage: Machines and Base Target required
      //   if (item.machineIds.length === 0) {
      //     return toast.error(`Select machine(s) for ${item.workOrderNo}`);
      //   }
      //   if (!item.baseTargetQty || item.baseTargetQty <= 0) {
      //     return toast.error(`Enter base target for ${item.workOrderNo}`);
      //   }
      // }
            if (!isDryStage) {
        // Wash Stage: Machines and Final Target required
        if (item.machineIds.length === 0) {
          return toast.error(`Select machine(s) for ${item.workOrderNo}`);
        }
        // ✅ FIX: Base target এর বদলে Final target ভ্যালিডেশন 
        if (!item.finalTargetQty || item.finalTargetQty <= 0) {
          return toast.error(`Enter final target for ${item.workOrderNo}`);
        }
      }
      if (!item.workOrderId) {
        return toast.error(`WorkOrderId missing for ${item.workOrderNo}`);
      }
    }

    try {
      setSubmitting(true);
      const planData = planItems.map(item => {
               // For wash stage: send all values (defaulting optional ones to 0)
        return {
          workOrderId: item.workOrderId,
          processStageId: selectedProcessStage.processStageId,
          planDate,
          shift: parseInt(shift),
          plantId: parseInt(plantId),
          unitId: parseInt(unitId),
          machineIds: item.machineIds,
          // ✅ FIX: Base, Percentage, Adjusted না দিলে ডিফল্ট 0 যাবে
          baseTargetQty: item.baseTargetQty || 0,
          percentage: item.percentage || 0,
          finalTargetQty: item.finalTargetQty, // এটি Required, তাই যা আছে তাই যাবে
          adjustedTargetQty: item.adjustedTargetQty || 0, 
          remarks: item.remarks || '',
          isDeleted: false,
          createdBy: user?.id || 0,
          createdAt: new Date().toISOString()
        };
        // if (isDryStage) {
        //   return {
        //     workOrderId: item.workOrderId,
        //     processStageId: selectedProcessStage.processStageId,
        //     planDate,
        //     shift: parseInt(shift),
        //     plantId: parseInt(plantId),
        //     unitId: parseInt(unitId),
        //     machineIds: [], // ✅ NO Machine IDs sent for Dry Stage
        //     baseTargetQty: item.baseTargetQty || 0,
        //     percentage: 0,
        //     // ✅ FIX: Removed fallback to item.baseTargetQty. It will now save as 0 if left blank.
        //     finalTargetQty: item.finalTargetQty || 0,
        //     adjustedTargetQty: item.finalTargetQty || 0, 
        //     remarks: item.remarks || '',
        //     isDeleted: false,
        //     createdBy: user?.id || 0,
        //     createdAt: new Date().toISOString()
        //   };
        // }
        // For wash stage: send all values
        return {
          workOrderId: item.workOrderId,
          processStageId: selectedProcessStage.processStageId,
          planDate,
          shift: parseInt(shift),
          plantId: parseInt(plantId),
          unitId: parseInt(unitId),
          machineIds: item.machineIds,
          baseTargetQty: item.baseTargetQty,
          percentage: item.percentage,
          finalTargetQty: item.finalTargetQty,
          adjustedTargetQty: item.adjustedTargetQty || item.finalTargetQty,
          remarks: item.remarks || '',
          isDeleted: false,
          createdBy: user?.id || 0,
          createdAt: new Date().toISOString()
        };
      });

      await plansApi.createWashPlan(planData);
      toast.success('Plan created successfully!', { duration: 4000, style: { background: '#10B981', color: '#fff', fontSize: '16px' } });
      navigate('/plans');
    } catch (error) {
      console.error('Error creating plan:', error);
      const msg = error.response?.data?.message || error.response?.data?.title || error.message || 'Failed to create plan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Computed ──
  const uniquePlants = Array.from(new Map(plantUnitList.map(p => [p.plantId, p])).values());
  const filteredUnits = plantUnitList.filter(p => p.plantId === parseInt(plantId));
  const plannedFilteredUnits = plantUnitList.filter(p => p.plantId === parseInt(plannedFilters.plantId));
  const selectedCount = planItems.length;
  const totalBaseTarget = planItems.reduce((s, i) => s + (i.baseTargetQty || 0), 0);
  const totalFinalTarget = planItems.reduce((s, i) => s + (i.finalTargetQty || 0), 0);
  const totalAdjusted = planItems.reduce((s, i) => s + (i.adjustedTargetQty || 0), 0);

  // Validation adapts to user permission/stage
  const hasIncompleteItems = planItems.some(i => {
    if (isDryStage) return false; // ✅ Dry Stage completely optional to submit
    // return (!i.machineIds || i.machineIds.length === 0) || !i.baseTargetQty || i.baseTargetQty <= 0;
     return (!i.machineIds || i.machineIds.length === 0) || !i.finalTargetQty || i.finalTargetQty <= 0;
  });

  const hasMoreResults = workOrders.length < modalPagination.totalRecords;

  // ✅ Filter Wash Plans strictly
  const filteredWashPlans = washPlans;

  // ════════════════════════════════════════════════════════
  // STEP 1 - Select Process Stage
  // ════════════════════════════════════════════════════════
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <button onClick={() => navigate('/plans')} className="group inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-all">
              <svg className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Plans
            </button>
          </div>
        </div>
        <div className="px-6 py-8 sm:py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Create Wash Plan</h1>
            <p className="text-gray-500 text-lg">Select a process stage to continue</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              Available Process Stages
            </h2>
            {user?.processStageAccesses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {user.processStageAccesses.map((stage) => (
                  <button key={stage.processStageId} onClick={() => { setSelectedProcessStage(stage); setStep(2); }}
                    className="group p-6 rounded-xl border-2 border-gray-100 hover:border-indigo-300 bg-white hover:bg-indigo-50/50 transition-all text-left hover:shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-lg">{stage.processStageId}</span>
                      </div>
                      <svg className="w-6 h-6 text-gray-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-700">{stage.processStageName}</h3>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-50 mb-4">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <p className="text-xl font-semibold text-gray-800 mb-1">No Process Stages Available</p>
                <p className="text-gray-500">Contact your administrator for access</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 2 - Tab-Based Layout
  // ════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/plans')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-indigo-600 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                Create Wash Plan
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  {selectedProcessStage?.processStageName}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* {isDryStage && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Base Target & Final Target Optional
                </span>
              )} */}
              <button onClick={() => { setStep(1); setPlanItems([]); setActiveTab('workOrders'); }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Change Stage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full width content */}
      <div className="px-4 sm:px-6 py-3 space-y-3">

        {/* ── Configuration ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Process Stage</label>
              <input type="text" value={selectedProcessStage?.processStageName || ''} disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Plan Date</label>
              <input type="date" value={planDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setPlanDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Shift</label>
              <select value={shift} onChange={(e) => setShift(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white">
                <option value="">Select</option>
                <option value="1">Day (11h)</option>
                <option value="2">Night (12h)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Plant</label>
              <select value={plantId} onChange={(e) => { setPlantId(e.target.value); setUnitId(''); setMachines([]); setPlanItems([]); }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white">
                <option value="">Select Plant</option>
                {uniquePlants.map(p => <option key={p.plantId} value={p.plantId}>{p.plantName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Unit</label>
              <select value={unitId} onChange={(e) => { setUnitId(e.target.value); setPlanItems([]); }} disabled={!plantId} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                <option value="">Select Unit</option>
                {filteredUnits.map(u => <option key={u.unitId} value={u.unitId}>{u.unitName}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Tab Card ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>

          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            <button onClick={() => setActiveTab('workOrders')}
              className={`flex-1 px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'workOrders' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Work Orders
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'workOrders' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{workOrders.length}</span>
            </button>

            {showPlannedTab && (
              <button onClick={() => setActiveTab('planned')}
                className={`flex-1 px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'planned' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Planned
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'planned' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{filteredWashPlans.length}</span>
              </button>
            )}

            <button onClick={() => setActiveTab('selected')}
              className={`flex-1 px-6 py-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'selected' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Selected
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'selected' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{selectedCount}</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* TAB 1: WORK ORDERS                         */}
          {/* ═══════════════════════════════════════════ */}
          {activeTab === 'workOrders' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search WO, Style, Color, Buyer..." value={searchTerm} onChange={handleSearchChange} disabled={!plantId || !unitId}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed placeholder:text-gray-400" />
                  {searchLoading && (
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  )}
                </div>
              </div>

              {!plantId || !unitId ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-14 h-14 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <p className="text-sm font-semibold text-gray-600">Select Plant & Unit first</p>
                  </div>
                </div>
              ) : searchLoading && workOrders.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              ) : workOrders.length > 0 ? (
                <>
                  <div ref={tableScrollRef} className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-sm" style={{ minWidth: isWashStage ? '1010px' : '810px' }}>
                       <thead className="bg-gray-50 sticky top-0 z-10">
                         <tr>
                           <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-8"></th>
                           <th className="px-2 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-14">WO/PO No</th>
                           <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-28">Style / Color</th>
                           <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-28">Buyer / Marks</th>
                           <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-14">Plant / Unit</th>
                           <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">Ord Qty</th>
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">Balance</th>
                          {/* ✅ Machine Column ONLY in Wash Stage */}
                          {!isDryStage && (
                            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-48">Machines</th>
                          )}
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20">Base Tgt</th>
                          {isWashStage && (
                            <>
                              <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">%</th>
                              <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20">Adjusted</th>
                            </>
                          )}
                          {((isWashStage) || (!isWashStage && showPlannedTab)) && (
                            <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20">Final Tgt</th>
                          )}
                          
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-14">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {workOrders.map((order, idx) => {
                          const added = isInPlan(order.workOrderNo);
                          const item = getPlanItem(order.workOrderNo);
                          return (
                            <tr key={`${order.workOrderNo}-${idx}`} className={`transition-colors ${added ? 'bg-indigo-50/40' : 'hover:bg-gray-50'}`}>
                              <td className="px-3 py-2 text-center">
                                <input type="checkbox" checked={added}
                                  onChange={() => { if (added) handleRemoveFromPlan(order.workOrderNo); else ensureInPlan(order); }}
                                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" />
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-bold text-indigo-600 text-xs">{order.workOrderNo}</div>
                                <div className=" text-gray-900 text-xs">{order.fastReactNo}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-900 font-medium break-words">{order.styleName}</div>
                                <div className="text-[10px] text-gray-500 mt-0.5 break-words">{order.color}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-700 break-words">{order.buyer}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5 break-words">{order.marks || '-'}</div>
                              </td>
                              <td className="px-3 py-2 text-center text-xs text-gray-700 font-medium">
                                <div>{order.unit || '-'}</div>
                                <div>{order.plant || order.plant ||  '-'}</div>
                                </td>
                              
                              <td className="px-3 py-2 text-center text-xs text-gray-700">{order.orderQuantity?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${(order.washBalance ?? 0) > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                  {(order.washBalance ?? 0).toLocaleString()}
                                </span>
                              </td>

                              {/* ✅ Machine Dropdown ONLY in Wash Stage */}
                              {!isDryStage && (
                                <td className="px-3 py-1.5">
                                  <button type="button" ref={el => { dropdownBtnRefs.current[order.workOrderNo] = el; }}
                                    onClick={(e) => { ensureInPlan(order); toggleDropdown(order.workOrderNo, e); }}
                                    className={`w-full border rounded px-2 py-1 text-left text-[11px] font-medium transition-colors flex items-center justify-between gap-1 ${
                                      added && item?.machineIds?.length > 0 ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-indigo-300'
                                    }`}>
                                    <span className="truncate">
                                      {added && item?.selectedMachines?.length > 0 ? item.selectedMachines.map(m => m.machineCode).join(', ') : 'Select...'}
                                    </span>
                                    <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                  </button>
                                  {added && item?.selectedMachines?.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 mt-1">
                                      {item.selectedMachines.map(m => (
                                        <span key={m.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-semibold">
                                          {m.machineCode}
                                          <button type="button" onClick={() => removeMachineTag(order.workOrderNo, m.id)} className="ml-0.5 text-indigo-400 hover:text-indigo-600">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              )}

                               {/* Base Target - Now always an editable input unless viewing in Planned Tab specifically */}
                              <td className="px-3 py-1.5">
                                {showPlannedTab ? (
                                  <div className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-center font-bold text-blue-700 bg-blue-50 cursor-not-allowed min-h-[26px] flex items-center justify-center">
                                    {item?.baseTargetQty || 0}
                                  </div>
                                ) : (
                                  <input type="number" min="0" value={added ? (item?.baseTargetQty || '') : ''}
                                    onChange={(e) => { ensureInPlan(order); handleBaseTargetChange(order.workOrderNo, e.target.value); }}
                                    onFocus={() => ensureInPlan(order)} placeholder="0"
                                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-center font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-gray-300 transition-colors" />
                                )}
                              </td>

                              {isWashStage && (
                                <>
                                  <td className="px-3 py-1.5">
                                    <input type="number" min="0" max="200" step="1" value={added ? (item?.percentage || '') : ''}
                                      onChange={(e) => { ensureInPlan(order); handlePercentageChange(order.workOrderNo, e.target.value); }}
                                      onFocus={() => ensureInPlan(order)} placeholder="0"
                                      className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-center font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-gray-300 transition-colors" />
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <input type="number" min="0" value={added ? (item?.adjustedTargetQty || '') : ''}
                                      onChange={(e) => { ensureInPlan(order); handleAdjustedTargetChange(order.workOrderNo, e.target.value); }}
                                      onFocus={() => ensureInPlan(order)} placeholder="0"
                                      className="w-full border border-amber-200 rounded px-1.5 py-1 text-xs text-center font-bold text-amber-700 bg-amber-50 focus:outline-none focus:ring-1 focus:ring-amber-500 hover:border-amber-300 transition-colors" />
                                  </td>
                                </>
                              )}

                              {/* Final Target Input for Wash OR Dry-Only Users */}
                              {((isWashStage) || (!isWashStage && showPlannedTab)) && (
                                <td className="px-3 py-1.5">
                                  <input type="number" min="0" value={item?.finalTargetQty || ''}
                                    onChange={(e) => { ensureInPlan(order); handleFinalTargetChange(order.workOrderNo, e.target.value); }}
                                    onFocus={() => ensureInPlan(order)} placeholder="0"
                                    className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-center font-bold text-green-700 bg-green-50 focus:outline-none focus:ring-1 focus:ring-green-500 hover:border-green-300 transition-colors" />
                                </td>
                              )}
                              
                             
                              <td className="px-3 py-2 text-center">
                                {added ? (
                                  <button onClick={() => handleRemoveFromPlan(order.workOrderNo)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors" title="Remove">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                ) : (
                                  <button onClick={() => ensureInPlan(order)} className="px-2 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors">ADD</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Bar */}
                  <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {modalPagination.totalRecords > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-medium text-gray-600">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          {workOrders.length} / {modalPagination.totalRecords}
                        </span>
                      )}
                      {hasMoreResults && (
                        <button onClick={handleLoadMore} disabled={searchLoading}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-indigo-200 rounded-lg text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          {searchLoading ? (
                            <><svg className="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading</>
                          ) : (
                            <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Load More</>
                          )}
                        </button>
                      )}
                    </div>
                    {selectedCount > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-600">
                          <span className="font-bold text-indigo-600">{selectedCount}</span> selected
                          <span className="mx-1">•</span>
                          {isWashStage ? (
                            <>
                              <span className="font-bold text-green-600">{totalFinalTarget.toLocaleString()}</span> final
                              <span className="mx-1">•</span>
                              <span className="font-bold text-amber-600">{totalAdjusted.toLocaleString()}</span> adj
                            </>
                          ) : (
                            <span className="font-bold text-blue-600">{totalBaseTarget.toLocaleString()}</span>  
                          )}
                        </span>
                        <button onClick={() => setActiveTab('selected')}
                          className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
                          Review & Submit
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : searchTerm ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-14 h-14 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm font-semibold text-gray-600">No results found</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <p className="text-base font-semibold text-gray-600">Type to search work orders</p>
                    <p className="text-xs text-gray-400 mt-1">WO No, Style, Color, or Buyer</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* TAB: PLANNED (dry-only permission users)    */}
          {/* ═══════════════════════════════════════════ */}
          {activeTab === 'planned' && showPlannedTab && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50/50 flex-shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">Process Stage</label>
                    <input type="text" value={selectedProcessStage?.processStageName || ''} disabled
                      className="w-full bg-gray-100 border border-gray-200 rounded px-2 py-1.5 text-[11px] font-semibold text-gray-700 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">Plan Date</label>
                    <input type="date" value={plannedFilters.planDate}
                      onChange={(e) => setPlannedFilters(prev => ({ ...prev, planDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">Shift</label>
                    <select value={plannedFilters.shift}
                      onChange={(e) => setPlannedFilters(prev => ({ ...prev, shift: e.target.value }))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
                      <option value="">All Shifts</option>
                      <option value="1">Day</option>
                      <option value="2">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">Plant</label>
                    <select value={plannedFilters.plantId}
                      onChange={(e) => setPlannedFilters(prev => ({ ...prev, plantId: e.target.value, unitId: '' }))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
                      <option value="">All Plants</option>
                      {uniquePlants.map(p => <option key={p.plantId} value={p.plantId}>{p.plantName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">Unit</label>
                    <select value={plannedFilters.unitId}
                      onChange={(e) => setPlannedFilters(prev => ({ ...prev, unitId: e.target.value }))}
                      disabled={!plannedFilters.plantId}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                      <option value="">All Units</option>
                      {plannedFilteredUnits.map(u => <option key={u.unitId} value={u.unitId}>{u.unitName}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {washPlansLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : filteredWashPlans.length > 0 ? (
                <>
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-sm" style={{ minWidth: '850px' }}>
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-8"></th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20">WO/PO No</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-28">Style / Color</th>
                          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-24">Buyer</th>
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-14">Unit / Plant</th>
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">Ord Qty</th>
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20">Base Tgt</th>
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-20">Final Tgt</th>
                          <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-14">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredWashPlans.map((wp, idx) => {
                          const alreadyAdded = isInPlan(wp.workOrderNo);
                          const item = getPlanItem(wp.workOrderNo);
                          return (
                            <tr key={`${wp.id || wp.workOrderId}-${idx}`} className={`${alreadyAdded ? 'bg-green-50/50' : 'hover:bg-gray-50'} transition-colors`}>
                              <td className="px-3 py-2 text-center">
                                <input type="checkbox" checked={alreadyAdded}
                                  onChange={() => { if (!alreadyAdded) addFromPlanned(wp); else handleRemoveFromPlan(wp.workOrderNo); }}
                                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" />
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-bold text-indigo-600 text-xs">{wp.workOrderNo}</div>
                                <div className="text-gray-900 text-xs">{wp.fastReactNo || ''}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-900 font-medium break-words">{wp.styleName}</div>
                                <div className="text-[10px] text-gray-500 mt-0.5 break-words">{wp.color}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-700 break-words">{wp.buyer || wp.buyerDepartment || '-'}</div>
                              </td>
                              <td className="px-3 py-2 text-center text-xs text-gray-700 font-medium">
                                <div>{wp.unitName || '-'}</div>
                                <div>{wp.plantName || '-'}</div>
                                </td>
                              <td className="px-3 py-2 text-center text-xs text-gray-700">{wp.orderQuantity?.toLocaleString() || '-'}</td>
                              <td className="px-3 py-2 text-center text-xs font-bold text-blue-700 bg-blue-50/30">{wp.baseTargetQty?.toLocaleString() || '-'}</td>
                              <td className="px-3 py-1.5">
                                <input type="number" min="0" value={item?.finalTargetQty || ''}
                                  onChange={(e) => { addFromPlanned(wp); handleFinalTargetChange(wp.workOrderNo, e.target.value); }}
                                  onFocus={() => addFromPlanned(wp)} placeholder="0"
                                  className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-center font-bold text-green-700 bg-green-50 focus:outline-none focus:ring-1 focus:ring-green-500 hover:border-green-300 transition-colors" />
                              </td>
                              <td className="px-3 py-2 text-center">
                                {alreadyAdded ? (
                                  <button onClick={() => handleRemoveFromPlan(wp.workOrderNo)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors" title="Remove">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                ) : (
                                  <button onClick={() => addFromPlanned(wp)} className="px-2 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors">ADD</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
                    <div className="text-xs text-gray-500">
                      Showing {filteredWashPlans.length} wash plan(s)
                    </div>
                    {selectedCount > 0 && (
                      <button onClick={() => setActiveTab('selected')}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
                        Review & Submit ({selectedCount})
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-14 h-14 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <p className="text-sm font-semibold text-gray-600">No wash plans found</p>
                    <p className="text-xs text-gray-400 mt-1">Select Plan Date & Shift to see matching wash plans</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* TAB 3: SELECTED                             */}
          {/* ═══════════════════════════════════════════ */}
          {activeTab === 'selected' && (
            <div className="flex flex-col flex-1 min-h-0 p-4">

              {/* Stats */}
              <div className={`${isWashStage ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'} gap-2 mb-3 flex-shrink-0 grid`}>
                <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-[9px] font-bold text-indigo-600 uppercase">Items</p>
                  <p className="text-xl font-bold text-indigo-900">{selectedCount}</p>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-[9px] font-bold text-blue-600 uppercase">Base Target</p>
                  <p className="text-xl font-bold text-blue-900">{totalBaseTarget.toLocaleString()}</p>
                </div>
                {isWashStage && (
                  <>
                    <div className="p-2.5 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-[9px] font-bold text-green-600 uppercase">Final Target</p>
                      <p className="text-xl font-bold text-green-900">{totalFinalTarget.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-[9px] font-bold text-amber-600 uppercase">Adjusted</p>
                      <p className="text-xl font-bold text-amber-900">{totalAdjusted.toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>

              {selectedCount === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <svg className="w-14 h-14 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <p className="font-semibold text-gray-600 mb-1">No items selected</p>
                  <p className="text-xs text-gray-400 mb-3">
                    {showPlannedTab ? 'Add items from Planned or Work Orders tab' : 'Add items from Work Orders tab'}
                  </p>
                  <button onClick={() => setActiveTab(showPlannedTab ? 'planned' : 'workOrders')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                    Go to {showPlannedTab ? 'Planned' : 'Work Orders'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-auto custom-scrollbar border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">WO No</th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase w-28">Style / Color</th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase w-16">Bal</th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">Base</th>
                          {isWashStage && (
                            <>
                              <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase w-16">%</th>
                              <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase w-16">Adj</th>
                            </>
                          )}
                          {(!isWashStage && showPlannedTab) && (
                            <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">Final</th>
                          )}
                          {isWashStage && (
                            <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">Final</th>
                          )}
                          
                          {/* ✅ Show Machines header ONLY for Wash Stage */}
                          {!isDryStage && (
                            <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Machines</th>
                          )}
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {planItems.map(item => {
                          const incomplete = !isDryStage && ((!item.machineIds || item.machineIds.length === 0) || !item.baseTargetQty || item.baseTargetQty <= 0);

                          return (
                            <tr key={item.workOrderNo} className={`${incomplete ? 'bg-amber-50/50' : 'hover:bg-gray-50'} transition-colors`}>
                              <td className="px-3 py-2"><span className="font-bold text-indigo-600 text-xs">{item.workOrderNo}</span></td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-900 font-medium break-words">{item.styleName}</div>
                                <div className="text-[10px] text-gray-500">{item.color}</div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`text-xs font-bold ${(item.washBalance ?? 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>{item.washBalance?.toLocaleString()}</span>
                              </td>
                              <td className="px-3 py-2 text-center text-xs font-semibold">{item.baseTargetQty?.toLocaleString() || <span className="text-gray-400">-</span>}</td>
                              {isWashStage && (
                                <>
                                  <td className="px-3 py-2 text-center text-xs text-gray-600">{item.percentage}%</td>
                                  <td className="px-3 py-2 text-center text-xs font-bold text-amber-700">{item.adjustedTargetQty?.toLocaleString() || '0'}</td>
                                </>
                              )}
                              
                              {((isWashStage) || (!isWashStage && showPlannedTab)) && (
                                <td className="px-3 py-2 text-center text-xs font-bold text-green-700">{item.finalTargetQty?.toLocaleString() || <span className="text-gray-400">-</span>}</td>
                              )}

                              {/* ✅ Show Machines data ONLY for Wash Stage */}
                              {!isDryStage && (
                                <td className="px-3 py-2">
                                  {item.selectedMachines.length > 0 ? (
                                    <div className="flex flex-wrap gap-0.5">{item.selectedMachines.map(m => (
                                      <span key={m.id} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-semibold">{m.machineCode}</span>
                                    ))}</div>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-red-500">No machine</span>
                                  )}
                                </td>
                              )}

                              <td className="px-3 py-2 text-center">
                                <button onClick={() => handleRemoveFromPlan(item.workOrderNo)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {hasIncompleteItems && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      <p className="text-xs font-semibold text-amber-800">
  Incomplete items — go back to Work Orders tab to fill missing fields (Final Target or Machines).
</p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-3 flex-shrink-0">
                    <button onClick={() => setActiveTab(showPlannedTab ? 'planned' : 'workOrders')} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      &larr; Back to Edit
                    </button>
                    <button onClick={handleSubmit} disabled={submitting || hasIncompleteItems}
                      className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                      {submitting ? (
                        <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Create Plan ({selectedCount} Items)</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed Position Machine Dropdown ── */}
      {openDropdownFor && !isDryStage && (
        <div id="machine-dropdown" className="fixed z-[9999] w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden" style={{ top: dropdownPos.top, left: dropdownPos.left }}>
          <div className="p-2 bg-gray-50 border-b border-gray-200">
            <input type="text" placeholder="Filter machines..."
              value={machineSearchTerms[openDropdownFor] || ''}
              onChange={(e) => setMachineSearchTerms(prev => ({ ...prev, [openDropdownFor]: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" autoFocus />
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
            <button type="button" onClick={() => selectAllMachines(openDropdownFor)} className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold">Select All</button>
            <button type="button" onClick={() => clearAllMachines(openDropdownFor)} className="text-[10px] text-red-500 hover:text-red-600 font-bold">Clear All</button>
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {machines.length === 0 ? (
              <div className="px-3 py-6 text-xs text-gray-400 text-center">
                <svg className="w-6 h-6 mx-auto mb-1.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                No machines available for this plant/unit
              </div>
            ) : getFilteredMachines(openDropdownFor).length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">No machines match your filter</div>
            ) : (
              getFilteredMachines(openDropdownFor).map(machine => {
                const item = getPlanItem(openDropdownFor);
                const checked = item?.machineIds?.includes(machine.id) || false;
                return (
                  <label key={machine.id} className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${checked ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleMachine(openDropdownFor, machine)}
                      className="h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2.5 flex-shrink-0" />
                    <span className={`text-xs font-medium ${checked ? 'text-indigo-700' : 'text-gray-700'}`}>{machine.machineCode}</span>
                    <span className="text-[10px] text-gray-400 ml-1.5">{machine.brand}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
};

export default CreatePlan;


