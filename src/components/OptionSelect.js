import React from 'react';
import { motion } from 'framer-motion';

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
              className={`relative px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                isSelected 
                  ? 'text-white' 
                  : 'text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId={`${label}-bg`}
                  className="absolute inset-0 bg-black rounded-full -z-10 shadow-lg"
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
