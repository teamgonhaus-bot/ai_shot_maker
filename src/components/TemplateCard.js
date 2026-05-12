import React from 'react';
import { Trash2, ImageIcon, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className="group relative flex gap-4 p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl hover:border-orange-500/30 hover:bg-zinc-800/40 transition-all cursor-pointer overflow-hidden"
      onClick={() => onLoad(template)}
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform"
        style={{ background: template.thumbnailColor || 'linear-gradient(135deg, #333 0%, #111 100%)' }}
      >
        <ImageIcon className="w-6 h-6 text-white/70" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <h4 className="font-semibold text-sm text-zinc-100 truncate group-hover:text-orange-400 transition-colors">
          {template.name}
        </h4>
        <p className="text-[11px] text-zinc-500 truncate font-mono opacity-80">
          {template.prompt}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
          className="p-2 text-zinc-600 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10 opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-2 right-2">
         <ExternalLink className="w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}
