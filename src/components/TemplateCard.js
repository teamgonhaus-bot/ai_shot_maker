import React, { useState } from 'react';
import { Trash2, ArrowRight, ChevronDown, ChevronUp, FolderInput, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete, onRename, onMoveRequest, categories }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-bento-card flex flex-col justify-between overflow-hidden relative"
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: template.thumbnailColor || '#000' }} />
            <h4 className="font-bold text-[14px] text-black line-clamp-1">
              {template.name}
            </h4>
          </div>
          <button 
            onClick={() => onMoveRequest(template)}
            className="ios-card-icon-btn"
            title="Move to category"
            style={{ width: '32px', height: '32px' }}
          >
            <FolderInput size={16} />
          </button>
        </div>
        
        <div className="relative">
          <motion.div 
            layout
            initial={false}
            animate={{ height: isExpanded ? 'auto' : '60px' }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className={`text-[13px] font-medium text-gray-400 leading-relaxed mt-1 ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {template.prompt}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 px-4 pb-4 border-t border-gray-100 mt-2">
        <div className="flex gap-3">
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(template.id, template.name);
            }}
            className="ios-card-icon-btn"
            title="Rename"
          >
            <Edit2 size={16} strokeWidth={2} />
          </button>
        </div>

        {template.prompt && template.prompt.length > 80 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center transition-transform active:scale-95"
            style={{ 
              padding: '4px 10px', 
              fontSize: '10px', 
              fontWeight: '700',
              borderRadius: '9999px',
              background: '#000000', 
              color: '#FFFFFF', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            <span>{isExpanded ? 'Close' : 'View All'}</span>
            {isExpanded ? <ChevronUp size={10} className="ml-1" /> : <ChevronDown size={10} className="ml-1" />}
          </button>
        )}
      </div>
    </motion.div>
  );
}
