import { InfoOutlined } from '@mui/icons-material';  // ✅ Changed from AlertCircle

const EmptyState = ({ 
  title = 'No Data', 
  description = 'No data available', 
  icon: Icon = InfoOutlined  // ✅ Default to InfoOutlined
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-gray-400 mb-4 p-4 bg-gray-100 rounded-full">
        <Icon style={{ fontSize: 64 }} />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md">{description}</p>
    </div>
  );
};

export default EmptyState;