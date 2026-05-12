import React from 'react';

export default function OptionSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`relative px-5 py-3 rounded-full text-sm font-bold transition-all border-2 ${
                isSelected 
                  ? 'text-white border-purple-600 bg-purple-600 shadow-md' 
                  : 'text-slate-600 border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5" />} {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
