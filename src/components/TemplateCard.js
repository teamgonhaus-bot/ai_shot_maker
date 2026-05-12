import React from 'react';
import { Trash2, ExternalLink, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative flex flex-col gap-6 p-8 bg-white rounded-[32px] border-2 border-zinc-50 hover:border-orange-500/30 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-orange-500/10"
      onClick={() => onLoad(template)}
    >
      <div 
        className="w-full aspect-video rounded-3xl flex items-center justify-center flex-shrink-0 shadow-inner relative overflow-hidden group-hover:scale-[1.02] transition-all duration-700"
        style={{ background: template.thumbnailColor || 'var(--accent-teal)' }}
      >
        <Box className="w-10 h-10 text-white/90 relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10"></div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <h4 className="font-extrabold text-lg text-zinc-900 truncate group-hover:text-orange-500 transition-colors uppercase tracking-tight">
          {template.name}
        </h4>
        <p className="text-xs text-zinc-400 truncate font-semibold leading-relaxed">
          {template.prompt}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(template.id);
        }}
        className="absolute top-4 right-4 p-3 text-white bg-black/10 hover:bg-red-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
