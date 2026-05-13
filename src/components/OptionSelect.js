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
    <div className="flex flex-col mb-8">
      {label && <label className="ios-option-label">{label}</label>}
      <div className="flex flex-wrap" style={{ gap: '10px' }}>
        {options.map((opt) => {
          const active = isSelected(opt);
          return (
            <button
              key={opt}
              onClick={() => handleClick(opt)}
              className={`rounded-full text-[13px] font-medium transition-all border-none cursor-pointer ios-interact ${
                active 
                  ? `ios-selected-pill theme-${theme}` 
                  : 'bg-[#E9E9EB] text-[#3A3A3C] hover:bg-[#D1D1D6]'
              }`}
              style={{ 
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'fit-content'
              }}
            >
              <span className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />} {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
