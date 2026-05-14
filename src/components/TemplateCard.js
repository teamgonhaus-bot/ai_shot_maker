import React from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-bento-card flex flex-col justify-between"
      style={{ padding: '16px', minHeight: '140px', marginBottom: '0' }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template.thumbnailColor || '#000' }} />
          <h4 className="font-bold text-[14px] text-black line-clamp-1">
            {template.name}
          </h4>
        </div>
        <p className="text-[13px] font-medium text-gray-400 line-clamp-3 leading-relaxed mt-2">
          {template.prompt}
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
        <button
          onClick={() => onLoad(template)}
          className="ios-card-icon-btn"
          title="Load"
        >
          <ArrowRight size={16} strokeWidth={2} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
          className="ios-card-icon-btn"
          title="Delete"
        >
          <Trash2 size={16} strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
