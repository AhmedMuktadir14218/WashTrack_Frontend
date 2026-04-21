// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\dashboard\Dashboard.jsx

import React, { useState } from 'react';

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


  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    unit: '3',
    shift: '',
    plant: '',
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({ fromDate: '', toDate: '', unit: '', shift: '', plant: '' });
  };

  return (
    <>
      <style>{`
        .MuiBox-root {
          padding: 0 !important;
        }
      `}</style>
      <div
        className={`min-h-screen w-full p-0 m-0 ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-blue-100 via-sky-100 to-blue-50'
        }`}
        style={{ margin: 0, padding: 0 }}
      >
      <div className="max-w-[1600px] mx-auto flex flex-col gap-2">
        {/* Header */}
        {/* <Header /> */}

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          isDarkMode={isDarkMode}
        />

        {/* Top Summary Cards */}
        <TopSummaryCards isDarkMode={isDarkMode} />

        {/* DHU Section Label */}
        <SectionLabel title="DHU Summary" color="blue" isDarkMode={isDarkMode} />

        {/* DHU 1st & Final Wash Panels */}
        <DHUSections isDarkMode={isDarkMode} />

        {/* Dry Section Details */}
        <DrySectionDetails isDarkMode={isDarkMode} />

        {/* Dryer Production Summary Label */}
        <SectionLabel title="Dryer Production Summary" color="sky" isDarkMode={isDarkMode} />

        {/* Dryer Production Cards */}
        <DryerProductionSummary isDarkMode={isDarkMode} />
      </div>
      </div>
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
const FilterPanel = ({ filters, onFilterChange, onReset, isDarkMode }) => (
  <div className="overflow-visible">
    <div
      className={`backdrop-blur-sm border-2 rounded-xl shadow-lg p-3 mt-4 mb-2 ${
        isDarkMode
          ? 'bg-slate-800/95 border-blue-500/30'
          : 'bg-white/95 border-blue-200'
      }`}
    > 

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
            className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm focus:border-blue-400 ${
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
            className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          />
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
            className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="">-- Select Unit --</option>
            {[1, 2, 3, 4, 5].map((u) => (
              <option key={u} value={String(u)}>
                Unit {u}
              </option>
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
            className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="">-- Select Shift --</option>
            <option value="A">Shift A (06:00–14:00)</option>
            <option value="B">Shift B (14:00–22:00)</option>
            <option value="C">Shift C (22:00–06:00)</option>
          </select>
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
            className={`w-full border-2 rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all shadow-sm cursor-pointer focus:border-blue-400 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="">-- Select Plant --</option>
            <option value="Plant1">Plant 1</option>
            <option value="Plant2">Plant 2</option>
            <option value="Plant3">Plant 3</option>
          </select>
        </div>
      </div>

      {/* <div className="flex justify-end mt-3 gap-2">
        <button
          onClick={onReset}
          className={`px-4 py-2 rounded-lg border-2 text-xs font-bold transition cursor-pointer ${
            isDarkMode
              ? 'border-slate-600 text-slate-400 hover:bg-slate-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Reset
        </button>
        <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 cursor-pointer">
          Apply Filter
        </button>
      </div> */}
    </div>
  </div>
);

// ============ TOP SUMMARY CARDS ============
const TopSummaryCards = ({ isDarkMode }) => {
  const cards = [
    {
      title: '1st Dry Section',
      type: 'blue',
      icon: 'chart',
      received: 500,
      delivery: 500,
      showBoth: true,
    },
    {
      title: 'UnWash Godown',
      type: 'blue',
      icon: 'home',
      mainValue: 980,
      showChart: true,
    },
    {
      title: '1st Wash Section',
      type: 'blue',
      icon: 'water',
      delivery: 600,
      showDeliveryOnly: true,
    },
    {
      title: '2nd Dry Section',
      type: 'blue',
      icon: 'fire',
      received: 450,
      delivery: 800,
      showBoth: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
      {cards.map((card, index) => (
        <TopCard key={index} card={card} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
};

const TopCard = ({ card, isDarkMode }) => {
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
      className={`border-2 rounded-2xl p-3 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
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
      <div className="flex justify-between items-center mb-2">
        <h2
          className={`font-bold text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
        >
          {card.title}
        </h2>
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
              label="Received"
              value={card.received}
              trend="up"
              isDarkMode={isDarkMode}
            />
            <div
              className={`w-px ${isOrange ? 'bg-orange-200' : 'bg-blue-200'}`}
            />
            <StatBox
              label="Delivery"
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
              className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Delivery
            </p>
            <span
              className={`text-xl font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
            >
              {card.delivery}
            </span>
          </div>
        </div>
      )}

      {card.showChart && (
        <div className="flex items-end justify-between gap-2">
          <div className="text-center">
            <span
              className={`text-xl font-black block leading-none ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {card.mainValue}
            </span>
            <span
              className={`text-[9px] font-bold uppercase mt-0.5 block leading-tight ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Unwash
              <br />
              Delivery
            </span>
          </div>
          <MiniBarChart isDarkMode={isDarkMode} />
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, trend, isGreen, isDarkMode }) => (
  <div className="text-center">
    <p
      className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${
        isDarkMode ? 'text-slate-400' : 'text-slate-500'
      }`}
    >
      {label}
    </p>
    <div className="flex items-center gap-0.5 justify-center">
      <span
        className={`text-lg font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
      >
        {value}
      </span>
      {trend === 'up' ? (
        <IconTrendingUp className={`w-2.5 h-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
      ) : (
        <IconTrendingDown className={`w-2.5 h-2.5 ${isGreen ? 'text-green-500' : 'text-orange-500'}`} />
      )}
    </div>
  </div>
);

const CardIcon = ({ type }) => (
  <div
    className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
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
        className="rounded-full bg-cyan-100 border-[1.5px] border-cyan-600"
      />
    ))}
  </div>
);

const MiniBarChart = ({ isDarkMode }) => {
  const bars = [
    { value: 900, height: '55%', active: false, label: 'Rec' },
    { value: 950, height: '70%', active: false, label: 'Nov' },
    { value: 950, height: '70%', active: true, label: 'Rec' },
    { value: 980, height: '90%', active: true, highlight: true, label: 'Dec' },
  ];

  return (
    <div className="flex items-end gap-0.5 h-10">
      {bars.map((bar, i) => {
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
            <span className={`text-[7px] font-bold ${textColor}`}>{bar.value}</span>
            <div
              className={`w-[13px] ${barColor} rounded-t`}
              style={{ height: bar.height }}
            />
            <span className={`text-[7px] font-semibold ${textColor}`}>{bar.label}</span>
          </div>
        );
      })}
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
      <h2
        className={`text-base font-black uppercase tracking-wide ${
          isDarkMode ? 'text-slate-200' : 'text-slate-800'
        }`}
      >
        {title}
      </h2>
      <div
        className={`flex-1 h-px bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-200' : 'from-sky-200'
        } to-transparent`}
      />
    </div>
  );
};

// ============ DHU SECTIONS ============
const DHUSections = ({ isDarkMode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <DHUPanel
      title="1st Wash Section"
      type="blue"
      outputQty={400}
      defectQty={360}
      dhuPercent={2.6}
      dhuStatus="good"
      defects={['design mis match', 'chemical issue', 'skill issue']}
      isDarkMode={isDarkMode}
    />
    <DHUPanel
      title="Final Wash Section"
      type="blue"
      outputQty={900}
      defectQty={506}
      dhuPercent={9.6}
      dhuStatus="action"
      defects={['design mis match', 'chemical issue', 'skill issue']}
      isDarkMode={isDarkMode}
    />
  </div>
);

const DHUPanel = ({
  title,
  type,
  outputQty,
  defectQty,
  dhuPercent,
  dhuStatus,
  defects,
  isDarkMode,
}) => {
  const isOrange = type === 'orange';

  return (
    <div
      className={`border-[2.5px] rounded-2xl overflow-hidden shadow-lg ${
        isOrange
          ? 'border-orange-700 shadow-orange-200/30'
          : 'border-blue-600 shadow-blue-200/30'
      }`}
    >
      {/* Header */}
      <div
        className={`text-white font-bold text-center py-2 text-xs tracking-wide uppercase flex items-center justify-center gap-1.5 ${
          isOrange
            ? 'bg-gradient-to-r from-orange-700 to-orange-600'
            : 'bg-gradient-to-r from-blue-600 to-blue-500'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isOrange ? 'bg-orange-300' : 'bg-blue-300'
          }`}
        />
        {title}
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isOrange ? 'bg-orange-300' : 'bg-blue-300'
          }`}
        />
      </div>

      {/* Content */}
      <div
        className={`p-2 grid grid-cols-3 gap-2 ${
          isDarkMode
            ? isOrange
              ? 'bg-orange-500/5'
              : 'bg-blue-500/5'
            : isOrange
              ? 'bg-orange-50'
              : 'bg-blue-50/50'
        }`}
      >
        {/* Column 1 - Output & Defect */}
        <div className="flex flex-col gap-2">
          <InnerCard isOrange={isOrange} isDarkMode={isDarkMode}>
            <p
              className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Output Qty
            </p>
            <GaugeSmall value={75} />
            <span
              className={`text-lg font-black block mt-0.5 ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {outputQty}
            </span>
          </InnerCard>
          <InnerCard isOrange={isOrange} isDarkMode={isDarkMode}>
            <p
              className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Defect Qty
            </p>
            <span
              className={`text-lg font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
            >
              {defectQty}
            </span>
          </InnerCard>
        </div>

        {/* Column 2 - DHU Gauge */}
        <div
          className={`p-2 text-center flex flex-col justify-center items-center rounded-xl border-2 ${
            dhuStatus === 'good'
              ? isDarkMode
                ? 'bg-green-500/10 border-green-400/50'
                : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
              : isDarkMode
                ? 'bg-orange-500/10 border-orange-400/50'
                : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
          }`}
        >
          <p
            className={`font-bold text-xs mb-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
          >
            DHU%
          </p>
          <DHUGauge value={dhuPercent} status={dhuStatus} isDarkMode={isDarkMode} />
          <span
            className={`font-bold text-xs mt-0.5 ${
              dhuStatus === 'good' ? 'text-green-600' : 'text-orange-600'
            }`}
          >
            {dhuStatus === 'good' ? '● Good' : '⚠ Action Needed'}
          </span>
        </div>

        {/* Column 3 - Defect Qty & Top 3 */}
        <div className="flex flex-col gap-2">
          <InnerCard isOrange={isOrange} isDarkMode={isDarkMode}>
            <p
              className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Defect Qty
            </p>
            <span
              className={`text-lg font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
            >
              {defectQty}
            </span>
          </InnerCard>
          <InnerCard isOrange={isOrange} isDarkMode={isDarkMode} className="flex-1">
            <p
              className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Top 3 Defects
            </p>
            {defects.map((defect, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${
                    isOrange
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {defect}
                </span>
              </div>
            ))}
          </InnerCard>
        </div>
      </div>
    </div>
  );
};

const InnerCard = ({ children, isOrange, isDarkMode, className = '' }) => (
  <div
    className={`rounded-xl p-2 text-center shadow-sm ${
      isDarkMode
        ? isOrange
          ? 'bg-slate-800/50 border border-orange-500/20'
          : 'bg-slate-800/50 border border-blue-500/20'
        : isOrange
          ? 'bg-white border-[1.5px] border-orange-200'
          : 'bg-white border-[1.5px] border-blue-100'
    } ${className}`}
  >
    {children}
  </div>
);

const GaugeSmall = ({ value }) => (
  <div className="w-14 h-7 mx-auto relative">
    <svg viewBox="0 0 100 50" className="w-full h-full">
      <path
        d="M10 50 A40 40 0 0 1 90 50"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M10 50 A40 40 0 0 1 90 50"
        fill="none"
        stroke="#22c55e"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="125"
        strokeDashoffset={125 - (value / 100) * 125}
      />
      <line
        x1="50"
        y1="50"
        x2="75"
        y2="22"
        stroke="#0f172a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="5" fill="#0f172a" />
    </svg>
  </div>
);

const DHUGauge = ({ value, status, isDarkMode }) => {
  const color = status === 'good' ? '#5b90b1' : '#dc2626';
  const circumference = 2 * Math.PI * 38;
  const normalizedValue = Math.min(value, 15) / 15;
  const offset = circumference - normalizedValue * circumference;

  return (
    <div className="w-20 h-20 relative">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke={isDarkMode ? '#334155' : '#e2e8f0'}
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span
          className={`text-xl font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
        >
          {value}%
        </span>
      </div>
    </div>
  );
};

// ============ DRY SECTION DETAILS ============
const DrySectionDetails = ({ isDarkMode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <DryDetailPanel
      title="1st Dry Section Details"
      type="teal"
      outputQty={988}
      defectQty={880}
      dhuPercent={5.5}
      dhuStatus="good"
      defects={['over-drying marks', 'uneven dryness', 'handling issue']}
      isDarkMode={isDarkMode}
    />
    <DryDetailPanel
      title="2nd Dry Section Details"
      type="teal"
      outputQty={560}
      defectQty={566}
      dhuPercent={6.6}
      dhuStatus="action"
      defects={['surface pilling', 'temperature variation', 'fabric type error']}
      isDarkMode={isDarkMode}
    />
  </div>
);

const DryDetailPanel = ({
  title,
  type,
  outputQty,
  defectQty,
  dhuPercent,
  dhuStatus,
  defects,
  isDarkMode,
}) => {
  const isAmber = type === 'amber';

  return (
    <div
      className={`border-[2.5px] rounded-2xl overflow-hidden shadow-lg ${
        isAmber
          ? 'border-amber-500 shadow-amber-200/30'
          : 'border-teal-600 shadow-teal-200/30'
      }`}
    >
      {/* Header */}
      <div
        className={`text-white font-bold text-center py-2 text-xs tracking-wide uppercase flex items-center justify-center gap-1.5 ${
          isAmber
            ? 'bg-gradient-to-r from-amber-600 to-amber-500'
            : 'bg-gradient-to-r from-teal-600 to-teal-500'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isAmber ? 'bg-yellow-300' : 'bg-teal-300'
          }`}
        />
        {title}
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            isAmber ? 'bg-yellow-300' : 'bg-teal-300'
          }`}
        />
      </div>

      {/* Content */}
      <div
        className={`p-2 grid grid-cols-3 gap-2 ${
          isDarkMode
            ? isAmber
              ? 'bg-amber-500/5'
              : 'bg-teal-500/5'
            : isAmber
              ? 'bg-amber-50'
              : 'bg-teal-50'
        }`}
      >
        {/* DHU % */}
        <div
          className={`p-2 text-center flex flex-col justify-center items-center rounded-xl border-2 ${
            dhuStatus === 'good'
              ? isDarkMode
                ? 'bg-green-500/10 border-green-400/50'
                : 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
              : isDarkMode
                ? 'bg-amber-500/10 border-amber-400/50'
                : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300'
          }`}
        >
          <p
            className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            DHU %
          </p>
          <span
            className={`text-2xl font-black leading-none mt-0.5 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            {dhuPercent}%
          </span>
          <span
            className={`font-bold text-[10px] mt-1 text-center leading-tight ${
              dhuStatus === 'good' ? 'text-green-600' : 'text-amber-600'
            }`}
          >
            {dhuStatus === 'good' ? '● Good' : '⚠ Action Needed'}
          </span>
        </div>

        {/* Output & Defect */}
        <div className="flex flex-col gap-2">
          <div
            className={`rounded-xl p-2 text-center shadow-sm flex-1 flex flex-col justify-center border-[1.5px] ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-600/30'
                : isAmber
                  ? 'bg-white border-amber-100'
                  : 'bg-white border-teal-100'
            }`}
          >
            <p
              className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Output Qty
            </p>
            <span
              className={`text-lg font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
            >
              {outputQty}
            </span>
          </div>
          <div
            className={`rounded-xl p-2 text-center shadow-sm flex-1 flex flex-col justify-center border-[1.5px] ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-600/30'
                : isAmber
                  ? 'bg-white border-amber-100'
                  : 'bg-white border-teal-100'
            }`}
          >
            <p
              className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Defect Qty
            </p>
            <span
              className={`text-lg font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
            >
              {defectQty}
            </span>
          </div>
        </div>

        {/* Top 3 Defects */}
        <div
          className={`rounded-xl p-2 shadow-sm border-[1.5px] ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-600/30'
              : isAmber
                ? 'bg-white border-amber-100'
                : 'bg-white border-teal-100'
          }`}
        >
          <p
            className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Top 3 Defects
          </p>
          {defects.map((defect, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${
                  isAmber
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-teal-100 text-teal-700'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {defect}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ DRYER PRODUCTION SUMMARY ============
const DryerProductionSummary = ({ isDarkMode }) => {
  const dryers = [
    { name: '1st Wash Dryer', delivery: 400 },
    { name: 'Final Wash Dryer', delivery: 880 },
    { name: 'Cool Dryer', delivery: 980 },
    { name: 'Re-Dryer', delivery: 500 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {dryers.map((dryer, index) => (
        <DryerCard key={index} dryer={dryer} />
      ))}
    </div>
  );
};

const DryerCard = ({ dryer }) => (
  <div className="
    bg-white 
    rounded-xl 
    border border-blue-100 
    shadow-sm 
    hover:shadow-md 
    transition-all 
    duration-300
    p-4
    flex 
    items-center 
    gap-4
  ">

    {/* Icon Section */}
    <div className="
      w-14 
      h-14 
      rounded-lg 
      bg-blue-50 
      flex 
      items-center 
      justify-center
      border border-blue-100
    ">
      <DryerIcon />
    </div>

    {/* Content */}
    <div className="flex flex-col flex-1">

      {/* Title */}
      <h4 className="
        text-sm 
        font-semibold 
        text-gray-600
        mb-1
      ">
        {dryer.name}
      </h4>

      {/* Delivery Value */}
      <div className="flex items-end gap-2">

        <span className="
          text-2xl 
          font-bold 
          text-blue-600
          leading-none
        ">
          {dryer.delivery}
        </span>

        <span className="
          text-xs 
          text-gray-400 
          font-medium
          pb-1
        ">
          Delivery
        </span>

      </div>

      {/* Bottom Accent Line */}
      <div className="
        mt-2 
        h-1 
        w-10 
        bg-blue-200 
        rounded-full
      " />

    </div>

  </div>
);

const DryerIcon = () => (
  <div className="w-10 h-10">
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <rect
        x="6"
        y="6"
        width="52"
        height="54"
        rx="7"
        fill="#bfdbfe"
        stroke="#1d4ed8"
        strokeWidth="2.5"
      />
      <rect x="6" y="6" width="52" height="13" rx="7" fill="#1e3a8a" />
      <rect x="6" y="13" width="52" height="6" fill="#1e3a8a" />
      <circle cx="14" cy="12" r="2.5" fill="#60a5fa" />
      <circle cx="20" cy="12" r="2.5" fill="#34d399" />
      <rect x="34" y="8" width="18" height="7" rx="3" fill="#1d4ed8" />
      <circle cx="38" cy="11.5" r="1.2" fill="#93c5fd" />
      <circle cx="43" cy="11.5" r="1.2" fill="#93c5fd" />
      <circle cx="48" cy="11.5" r="1.2" fill="#93c5fd" />
      <circle cx="32" cy="38" r="16" fill="white" stroke="#1d4ed8" strokeWidth="2.5" />
      <circle cx="32" cy="38" r="11" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
      <path
        d="M21 40 Q26.5 35.5 32 40 T43 40 L43 47 A11 11 0 0 1 21 47Z"
        fill="#3b82f6"
        opacity="0.7"
      />
      <circle cx="32" cy="38" r="3" fill="#1e40af" />
    </svg>
  </div>
);

 
export default Dashboard;