import React from 'react';

export default function IOSToggle({ label, isOn, onToggle, activeColor = '#34C759' }) {
  return (
    <div className="flex justify-between items-center ios-bg-card ios-shadow px-5 py-4 ios-rounded-xl mb-4 cursor-pointer" onClick={onToggle}>
      <span style={{ 
        fontSize: '15px', 
        fontWeight: '700', 
        color: '#000000' 
      }}>
        {label}
      </span>
      <button 
        className="relative rounded-full transition-all duration-300 border-none cursor-pointer"
        style={{ 
          width: '52px',
          height: '32px',
          backgroundColor: isOn ? activeColor : '#E9E9EB',
          boxShadow: isOn ? `0 4px 12px ${activeColor}40` : 'none',
          padding: 0
        }}
      >
        <div 
          className="absolute bg-white rounded-full shadow-md transition-transform duration-300"
          style={{ 
            width: '28px',
            height: '28px',
            top: '2px',
            left: '2px',
            transform: isOn ? 'translateX(20px)' : 'translateX(0)' 
          }}
        />
      </button>
    </div>
  );
}
