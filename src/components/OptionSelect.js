import React from 'react';
import { motion } from 'framer-motion';

export default function OptionSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="space-y-4">
      {label && <label className="text-[10px] font-extrabold tracking-[0.2em] text-zinc-400 uppercase px-1">{label}</label>}
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`relative px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                isSelected 
                  ? 'text-white shadow-lg' 
                  : 'text-slate-500 bg-slate-50 border-2 border-transparent hover:border-slate-200'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId={`${label}-bg`}
                  className="absolute inset-0 rounded-xl -z-10"
                  style={{ backgroundColor: 'var(--current-theme, #ff6b00)' }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
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
