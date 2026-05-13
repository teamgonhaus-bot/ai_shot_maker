import React from 'react';

export default function IOSToggle({ label, isOn, onToggle, activeColor = '#34C759' }) {
  return (
    <div className="ios-toggle-row">
      <span style={{ 
        fontSize: '15px', 
        fontWeight: '700', 
        color: '#1C1C1E' 
      }}>
        {label}
      </span>
      <div 
        onClick={onToggle}
        className="ios-switch"
        style={{ 
          backgroundColor: isOn ? activeColor : '#D1D1D6'
        }}
      >
        <div 
          className="ios-switch-handle"
          style={{ 
            transform: isOn ? 'translateX(18px)' : 'translateX(0)' 
          }}
        />
      </div>
    </div>
  );
}
