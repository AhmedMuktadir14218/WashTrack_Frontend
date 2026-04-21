import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack, 
  Search, 
  CalendarToday, 
  Refresh,
  Layers,
  ShoppingBag,
  Business,
  PrecisionManufacturing,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Clear,
  FilterList,
  Tune,
  Close,
  AccountBalanceWallet
} from '@mui/icons-material';
import { 
  Box,
  Typography, 
  Card, 
  Grid,
  TextField, 
  MenuItem, 
  Button, 
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  Badge,
  Drawer,
  Chip,
  Stack
} from '@mui/material';
import { useReports } from '../../hooks/useReports';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { format } from 'date-fns';

const UserWorkOrderSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchUserWorkOrderSummary, filterOptions, loading } = useReports();
  const tableContainerRef = useRef(null);

  const [summaryData, setSummaryData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    buyer: '',
    factory: '',
    unit: '',
    processStageId: ''
  });

  const [expandedRows, setExpandedRows] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);

  // Check if dates are different from today
  const isDateFiltered = filters.startDate !== format(new Date(), 'yyyy-MM-dd') || 
                        filters.endDate !== format(new Date(), 'yyyy-MM-dd');

  const loadData = useCallback(async () => {
    if (user?.id) {
      const data = await fetchUserWorkOrderSummary(user.id, filters);
      setSummaryData(data || []);
    }
  }, [user?.id, filters, fetchUserWorkOrderSummary]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (received, delivered) => {
    if (received === 0 && delivered === 0) return 'text-gray-400';
    if (received > delivered) return 'text-amber-600';
    return 'text-green-600';
  };

  // Filter data by search query
  const filteredData = summaryData.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.workOrderNo?.toLowerCase().includes(query) ||
      item.styleName?.toLowerCase().includes(query) ||
      item.buyer?.toLowerCase().includes(query) ||
      item.factory?.toLowerCase().includes(query)
    );
  });

  const totalOrderQty = summaryData.reduce((sum, o) => sum + (o.orderQuantity || 0), 0);
  const totalReceived = summaryData.reduce((sum, o) => sum + (o.totalRecieveQuantity || 0), 0);
  const totalDelivered = summaryData.reduce((sum, o) => sum + (o.totalDelivaryQuantity || 0), 0);

  if (loading && summaryData.length === 0) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-50/50">
      
      {/* 1. TOP SECTION (Fixed) */}
      <div className="flex-none p-3 md:p-6 pb-2 max-w-7xl mx-auto w-full">
        {/* Header */}
        {/* Mobile-First Header & Search Row */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconButton
                onClick={() => navigate('/user/transactions')}
                size="small"
                className="bg-white shadow-sm border border-gray-100"
              >
                <ArrowBack className="text-gray-600" fontSize="small" />
              </IconButton>
              <Typography variant="h6" className="font-black text-gray-800 tracking-tight">
                Work Orders
              </Typography>
            </div>
            
            <Button
              onClick={loadData}
              disabled={loading}
              variant="contained"
              size="small"
              className="bg-white text-primary-600 hover:bg-gray-50 shadow-sm border border-primary-100"
              sx={{ minWidth: 40, p: 1, borderRadius: '12px', color: 'primary.main', bgcolor: 'white' }}
            >
              <Refresh fontSize="small" className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>

          {/* Search row with Filter Toggle */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" style={{fontSize: 20}} />
              <input
                type="text"
                placeholder="Search order, style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 text-sm"
              />
              {searchQuery && (
                <Clear 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  style={{ fontSize: 20 }} 
                />
              )}
            </div>
            
            <Badge variant="dot" invisible={!isDateFiltered} color="primary" overlap="circular">
              <IconButton 
                onClick={() => setShowDateFilters(!showDateFilters)}
                className={`w-11 h-11 rounded-xl border transition-all duration-200 ${showDateFilters ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                <Tune />
              </IconButton>
            </Badge>
          </div>

          {/* Collapsible Date Filters */}
          <Collapse in={showDateFilters}>
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <Typography variant="overline" className="text-gray-400 font-bold tracking-widest">Select Date Range</Typography>
                {isDateFiltered && (
                  <Button 
                    size="small" 
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      startDate: format(new Date(), 'yyyy-MM-dd'),
                      endDate: format(new Date(), 'yyyy-MM-dd')
                    }))}
                    sx={{ textTransform: 'none', fontSize: '10px', p: 0 }}
                  >
                    Reset to Today
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500 ml-1">FROM</span>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-2">
                    <input 
                      type="date" 
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full border-none outline-none text-xs font-bold text-gray-700 bg-transparent"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500 ml-1">TO</span>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-2">
                    <input 
                      type="date" 
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full border-none outline-none text-xs font-bold text-gray-700 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </div>

      {/* 2. MAIN AREA (Scrollable) */}
      <div className="flex-1 min-h-0 flex flex-col max-w-7xl mx-auto w-full px-2 md:px-6 pb-2">
        {filteredData.length === 0 ? (
          <EmptyState 
            title="No Data Found"
            description="Adjust your filters or search query"
            variant="search"
          />
        ) : (
          <div className="flex flex-col h-full bg-white rounded-t-xl shadow-lg border border-gray-100 overflow-hidden">
            
            {/* Sticky Summary Header (Gradient like WorkHistory) */}
            <div className="flex-none bg-gradient-to-r from-primary-600 to-primary-700 p-3 md:p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag sx={{ fontSize: 20 }} className="opacity-80" />
                  <span className="font-bold text-sm md:text-lg">Daywise Summary</span>
                </div>
                <div className="flex gap-4 md:gap-8 text-xs md:text-sm">
                  <div className="text-right">
                    <span className="opacity-75 block text-[10px] md:text-xs">Total Rcv</span>
                    <span className="font-bold text-green-200">{totalReceived.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="opacity-75 block text-[10px] md:text-xs">Total Dlv</span>
                    <span className="font-bold text-orange-200">{totalDelivered.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable List Area */}
            <div 
              ref={tableContainerRef}
              className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-4 space-y-3"
            >
              {filteredData.map((order) => (
                <div 
                  key={order.workOrderId}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Row Header */}
                  <div 
                    onClick={() => toggleRow(order.workOrderId)}
                    className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/50"
                  >
                    {/* Details (Stacked on Mobile) */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${expandedRows[order.workOrderId] ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                        {expandedRows[order.workOrderId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm md:text-base">{order.workOrderNo}</span>
                          <span className="px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] font-bold border border-primary-100">
                            {order.fastReactNo || 'N/A'}
                          </span>
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-bold tracking-wider">
                            {order.buyer}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          Style: <span className="text-gray-700 font-medium">{order.styleName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stats for this order */}
                    <div className="flex w-full md:w-auto justify-between md:justify-end gap-3 md:gap-10 border-t md:border-t-0 pt-2 md:pt-0 overflow-x-auto">
                      <div className="text-center md:text-right min-w-[70px]">
                        <span className="text-[9px] md:text-[10px] text-gray-400 block uppercase font-bold">Order Qty</span>
                        <span className="text-xs md:text-sm font-bold text-gray-700">{order.orderQuantity?.toLocaleString()}</span>
                      </div>
                      <div className="text-center md:text-right min-w-[70px]">
                        <span className="text-[9px] md:text-[10px] text-gray-400 block uppercase font-bold">Received</span>
                        <span className="text-xs md:text-sm font-bold text-green-600">{order.totalRecieveQuantity?.toLocaleString()}</span>
                      </div>
                      <div className="text-center md:text-right min-w-[70px]">
                        <span className="text-[9px] md:text-[10px] text-gray-400 block uppercase font-bold">Delivered</span>
                        <span className="text-xs md:text-sm font-bold text-orange-600">{order.totalDelivaryQuantity?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content (Stage Breakdown) */}
                  <Collapse in={expandedRows[order.workOrderId]} timeout="auto">
                    <div className="bg-gray-50/50 p-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Layers sx={{ fontSize: 16 }} className="text-primary-500" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Process Stage Breakdown</span>
                      </div>

                      <Grid container spacing={2}>
                        {order.stageData && order.stageData.map((stage, idx) => (
                          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-800 truncate pr-2" title={stage.stage}>
                                  {stage.stage}
                                </span>
                                <Badge 
                                  variant="dot" 
                                  color={stage.recieve > stage.delivary ? "warning" : "success"}
                                />
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[9px] text-gray-400 block uppercase">Receive</span>
                                  <span className="text-sm font-bold text-green-600">{stage.recieve?.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-gray-400 block uppercase">Delivery</span>
                                  <span className="text-sm font-bold text-orange-600">{stage.delivary?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </Grid>
                        ))}
                      </Grid>

                      {/* Footer Info */}
                      <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-gray-200/50">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Business sx={{ fontSize: 14 }} /> <span>Factory: <strong className="text-gray-700">{order.factory}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <PrecisionManufacturing sx={{ fontSize: 14 }} /> <span>Unit: <strong className="text-gray-700">{order.unit}</strong></span>
                        </div>
                        {order.washTargetDate && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarToday sx={{ fontSize: 14 }} /> <span>Target: <strong className="text-gray-700">{format(new Date(order.washTargetDate), 'dd MMM yyyy')}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">
                            Total Wash Rcv: {order.workOrderTotalReceived?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Collapse>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTttom STATS (Fixed) */}
      {/* <div className="flex-none bg-white border-t border-gray-200 p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <AccountBalanceWallet fontSize="small" />
             </div>
             <div className="hidden sm:block">
               <p className="text-[10px] text-gray-400 font-bold uppercase">Total Work Orders</p>
               <p className="text-sm font-bold text-gray-800">{summaryData.length}</p>
             </div>
          </div>

          <div className="flex gap-6 md:gap-12">
             <div className="text-center">
               <p className="text-[10px] text-gray-400 font-bold uppercase">Total Order Qty</p>
               <p className="text-sm md:text-lg font-black text-gray-900">{totalOrderQty.toLocaleString()}</p>
             </div>
             <div className="text-center">
               <p className="text-[10px] text-gray-400 font-bold uppercase">Total Rcv</p>
               <p className="text-sm md:text-lg font-black text-green-600">{totalReceived.toLocaleString()}</p>
             </div>
             <div className="text-center">
               <p className="text-[10px] text-gray-400 font-bold uppercase">Total Dlv</p>
               <p className="text-sm md:text-lg font-black text-orange-600">{totalDelivered.toLocaleString()}</p>
             </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default UserWorkOrderSummary;
