import React from 'react';

export default function OptionSelect({ label, value, onChange, options, icon: Icon, multiSelect = false, theme = 'blue' }) {
  const isSelected = (opt) => {
    if (multiSelect) {
      return Array.isArray(value) && value.includes(opt);
    }
    return value === opt;
  };

  const handleClick = (opt) => {
    if (multiSelect) {
      const newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(opt)) {
        onChange(newValue.filter(v => v !== opt));
      } else {
        onChange([...newValue, opt]);
      }
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="flex flex-col ios-option-group">
      {label && <label className="ios-option-label">{label}</label>}
      <div className="flex flex-wrap" style={{ gap: '8px' }}>
        {options.map((opt) => {
          const active = isSelected(opt);
          return (
            <button
              key={opt}
              onClick={() => handleClick(opt)}
              className={`ios-pill ios-interact ${
                active ? `ios-selected-pill theme-${theme}` : ''
              }`}
            >
              <span className="flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5" />} {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
