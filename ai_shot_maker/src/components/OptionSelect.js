import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function OptionSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-2">
          {Icon && <Icon className="w-3 h-3" />} {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer hover:bg-zinc-800/50"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-zinc-900">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
      </div>
    </div>
  );
}
