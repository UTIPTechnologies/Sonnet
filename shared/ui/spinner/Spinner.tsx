import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { width: '24px', height: '24px', borderWidth: '3px' },
    md: { width: '32px', height: '32px', borderWidth: '4px' },
    lg: { width: '48px', height: '48px', borderWidth: '5px' },
  };

  const sizeStyle = sizeMap[size];

  return (
    <div
      style={{
        ...sizeStyle,
        borderRadius: '50%',
        border: `${sizeStyle.borderWidth} solid currentColor`,
        borderTopColor: 'transparent',
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
      }}
      className={className}
      role="status"
      aria-label="Loading"
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
        Loading...
      </span>
    </div>
  );
};
