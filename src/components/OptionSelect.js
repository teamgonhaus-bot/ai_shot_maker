import React from 'react';

export default function OptionSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`relative px-4 py-2.5 rounded-[20px] text-[13px] font-semibold transition-all duration-300 ${
                isSelected 
                  ? 'bg-black text-white shadow-md scale-105' 
                  : 'bg-[#F2F2F7] text-slate-600 hover:bg-[#E5E5EA]'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {Icon && <Icon className="w-4 h-4" />} {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
