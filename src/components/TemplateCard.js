import React from 'react';
import { Trash2, ExternalLink, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-orange-500/30 hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-500/10"
      onClick={() => onLoad(template)}
    >
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-all duration-500"
        style={{ background: template.thumbnailColor || 'linear-gradient(135deg, #333 0%, #111 100%)' }}
      >
        <Box className="w-6 h-6 text-white/80 relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20"></div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <h4 className="font-bold text-xs text-zinc-100 truncate group-hover:text-orange-400 transition-colors uppercase tracking-tight">
          {template.name}
        </h4>
        <p className="text-[10px] text-zinc-500 truncate font-mono opacity-60 leading-tight">
          {template.prompt}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
          className="p-2.5 text-zinc-600 hover:text-red-400 transition-all rounded-xl hover:bg-red-400/10 opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-3 right-3">
         <ExternalLink className="w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all" />
      </div>
    </motion.div>
  );
}
