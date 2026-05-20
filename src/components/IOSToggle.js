import React from 'react';

export default function IOSToggle({ label, isOn, onToggle }) {
  return (
    <div className="ios-toggle-row">
      <span className="ios-toggle-label">
        {label}
      </span>
      <div 
        onClick={onToggle}
        className={`ios-switch ${isOn ? 'active' : 'inactive'}`}
      >
        <div className="ios-switch-handle" />
      </div>
    </div>
  );
}
