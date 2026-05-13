import React from 'react';

export default function IOSToggle({ label, isOn, onToggle, activeColor = '#34C759' }) {
  return (
    <div className="flex justify-between items-center mb-8 px-1">
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '500', 
        color: '#000000' 
      }}>
        {label}
      </span>
      <button 
        onClick={onToggle}
        className="relative w-[50px] h-[28px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-none cursor-pointer"
        style={{ 
          backgroundColor: isOn ? activeColor : '#E9E9EB',
          boxShadow: isOn ? `0 4px 12px ${activeColor}40` : 'none'
        }}
      >
        <div 
          className="absolute top-[2px] left-[2px] w-[24px] h-[24px] bg-white rounded-full shadow-md transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ 
            transform: isOn ? 'translateX(22px)' : 'translateX(0)' 
          }}
        />
      </button>
    </div>
  );
}
