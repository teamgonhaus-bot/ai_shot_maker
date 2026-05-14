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
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template.thumbnailColor || '#000' }} />
          <h4 className="font-bold text-[14px] text-black line-clamp-1">
            {template.name}
          </h4>
        </div>
        <p className="text-[11px] font-medium text-gray-400 line-clamp-3 leading-relaxed">
          {template.prompt}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button
          onClick={() => onLoad(template)}
          className="w-8 h-8 flex items-center justify-center bg-[#F2F2F7] hover:bg-black hover:text-white text-black rounded-full transition-all border-none cursor-pointer ios-interact"
          title="Load"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
          className="w-8 h-8 flex items-center justify-center bg-[#F2F2F7] hover:bg-red-50 text-red-500 rounded-full transition-all border-none cursor-pointer ios-interact"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
