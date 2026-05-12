import React from 'react';
import { Trash2, Box, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative vibrant-card cursor-pointer shadow-md overflow-hidden"
      style={{ backgroundColor: template.thumbnailColor || 'var(--color-purple)' }}
      onClick={() => onLoad(template)}
    >
      <div className="card-icon">
        <Box className="w-5 h-5 text-white/90" />
      </div>

      <div className="flex-1 min-w-0 pr-12">
        <h4 className="font-black text-2xl uppercase tracking-tighter text-white leading-tight mb-2">
          {template.name}
        </h4>
        <p className="text-xs font-medium text-white/70 line-clamp-2">
          {template.prompt}
        </p>
      </div>

      <div className="absolute top-8 right-8">
        <ArrowRight className="w-6 h-6 text-white" />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(template.id);
        }}
        className="absolute bottom-6 right-6 p-3 bg-white/20 hover:bg-red-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
