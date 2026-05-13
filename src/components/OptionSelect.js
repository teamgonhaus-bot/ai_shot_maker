import React from 'react';

export default function OptionSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="flex flex-col mb-4">
      <div className="mb-[12px]">
        <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-widest m-0">
          {label}
        </p>
      </div>
      <div className="flex flex-wrap" style={{ gap: '8px' }}>
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`rounded-full text-[14px] font-medium flex items-center justify-center transition-colors border-none cursor-pointer ios-interact ${
                isSelected 
                  ? 'bg-black text-white' 
                  : 'bg-[#E9E9EB] text-black hover:bg-[#D1D1D6]'
              }`}
              style={{ padding: '10px 16px' }}
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
