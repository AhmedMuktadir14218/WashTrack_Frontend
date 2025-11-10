const StatCard = ({ label, value, icon: Icon, color = 'primary', trend = null }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600',
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-br from-red-500 to-red-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl shadow-md p-6 text-white relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white opacity-10 rounded-full" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm opacity-90 font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.up ? 'text-green-200' : 'text-red-200'}`}>
              {trend.up ? '↑' : '↓'} {trend.value}% from last month
            </p>
          )}
        </div>
        {Icon && <Icon className="opacity-80" style={{ fontSize: 40 }} />}
      </div>
    </div>
  );
};

export default StatCard;