import React from 'react';
import { motion } from 'framer-motion';

export default function OptionSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2 px-1">
          {Icon && <Icon className="w-3 h-3" />} {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`relative px-4 py-2 rounded-2xl text-xs font-medium transition-all border ${
                isSelected 
                  ? 'text-white border-transparent' 
                  : 'text-zinc-500 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:text-zinc-300'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId={`${label}-bg`}
                  className="absolute inset-0 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
