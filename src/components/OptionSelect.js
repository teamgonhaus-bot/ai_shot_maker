import React from 'react';

export default function OptionSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="space-y-4">
      <div className="ios-divider">
        <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest pb-2">
          {label}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`relative px-5 py-3 ios-rounded-xl text-[14px] font-semibold flex items-center justify-center ios-interact border-none ${
                isSelected 
                  ? 'ios-black-btn shadow-none' 
                  : 'ios-bg-card ios-shadow text-black'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />} {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
