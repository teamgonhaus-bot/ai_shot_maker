import React from 'react';
import { Trash2, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-orange-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
      onClick={() => onLoad(template)}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner relative overflow-hidden"
        style={{ background: template.thumbnailColor || 'var(--theme-core-bg)' }}
      >
        <Box className="w-5 h-5 text-white/90 relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-white/10"></div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-orange-600 transition-colors">
          {template.name}
        </h4>
        <p className="text-[10px] text-slate-400 truncate font-medium">
          {template.prompt}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(template.id);
        }}
        className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
