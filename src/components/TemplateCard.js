import React from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-bento-card flex flex-col justify-between"
      style={{ padding: '16px', minHeight: '160px', marginBottom: '0' }}
    >
      <div className="flex-1 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: template.thumbnailColor || '#000' }} />
          <h4 className="font-bold text-[15px] text-black line-clamp-1">
            {template.name}
          </h4>
        </div>
        <p className="text-[12px] font-medium text-gray-400 line-clamp-3 leading-relaxed">
          {template.prompt}
        </p>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-50">
        <button
          onClick={() => onLoad(template)}
          className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-black text-[12px] font-bold rounded-xl transition-all border-none cursor-pointer ios-interact"
        >
          Load
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
          className="px-3 py-2 bg-gray-50 hover:bg-red-50 text-red-500 rounded-xl transition-all border-none cursor-pointer ios-interact"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
