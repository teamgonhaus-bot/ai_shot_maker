import React, { useState } from 'react';
import { Trash2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-bento-card flex flex-col justify-between overflow-hidden"
      style={{ padding: '0', minHeight: '140px', marginBottom: '0' }}
    >
      {template.previewImage && (
        <div className="w-full h-32 bg-gray-100">
          <img 
            src={template.previewImage} 
            alt={template.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template.thumbnailColor || '#000' }} />
          <h4 className="font-bold text-[14px] text-black line-clamp-1">
            {template.name}
          </h4>
        </div>
        
        <div 
          className="cursor-pointer group" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <motion.p 
            layout
            className={`text-[13px] font-medium text-gray-400 leading-relaxed mt-2 ${!isExpanded ? 'line-clamp-3' : ''}`}
          >
            {template.prompt}
          </motion.p>
          {template.prompt && template.prompt.length > 80 && (
            <div className="flex items-center gap-1 mt-2 text-[11px] font-bold text-gray-300 group-hover:text-gray-500 transition-colors">
              {isExpanded ? (
                <><ChevronUp size={12} /> <span>접기</span></>
              ) : (
                <><ChevronDown size={12} /> <span>전체 보기</span></>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 px-4 pb-4 border-t border-gray-100 mt-2">
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
