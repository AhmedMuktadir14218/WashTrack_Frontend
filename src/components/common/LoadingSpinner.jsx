const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  const spinner = (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;