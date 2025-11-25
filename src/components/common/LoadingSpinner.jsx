const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  // Define sizes in pixels
  const sizes = {
    sm: 20,
    md: 40,
    lg: 60
  };
  
  const spinnerSize = sizes[size] || sizes.md;
  const borderWidth = Math.max(2, Math.floor(spinnerSize / 10));
  const spinnerStyle = {
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
    border: `${borderWidth}px solid #e5e7eb`, // light gray
    borderTop: `${borderWidth}px solid #3b82f6`, // blue
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  // Add keyframes to document if not already present
  if (!document.querySelector('#spinner-keyframes')) {
    const style = document.createElement('style');
    style.id = 'spinner-keyframes';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  const spinner = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={spinnerStyle} />
    </div>
  );

  if (fullScreen) {
    const fullScreenStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    };
    
    return (
      <div style={fullScreenStyle}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;