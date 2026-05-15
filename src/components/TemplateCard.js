import React, { useState } from 'react';
import { Trash2, ArrowRight, ChevronDown, ChevronUp, FolderInput } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete, onMove, categories }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

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
          <div className="relative">
            <button 
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="p-1 text-gray-400 hover:text-black transition-colors"
              title="Move to category"
            >
              <FolderInput size={16} />
            </button>
            <AnimatePresence>
              {showMoveMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoveMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-8 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                  >
                    <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Move to</p>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { onMove(template.id, cat); setShowMoveMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-[12px] font-bold hover:bg-gray-50 transition-colors ${template.config?.spaceType === cat ? 'text-blue-500 bg-blue-50/30' : 'text-black'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="relative">
          <motion.p 
            layout
            className={`text-[13px] font-medium text-gray-400 leading-relaxed mt-1 ${!isExpanded ? 'line-clamp-3' : ''}`}
            style={{ height: !isExpanded ? '60px' : 'auto' }}
          >
            {template.prompt}
          </motion.p>
          
          {template.prompt && template.prompt.length > 80 && (
            <div className="flex justify-center mt-3">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="ios-upload-capsule"
                style={{ padding: '4px 12px', fontSize: '10px', height: 'auto', background: '#F2F2F7', color: '#8E8E93', border: 'none', boxShadow: 'none' }}
              >
                <span>{isExpanded ? 'Close' : 'View All'}</span>
                {isExpanded ? <ChevronUp size={10} className="ml-1" /> : <ChevronDown size={10} className="ml-1" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 px-4 pb-4 border-t border-gray-100 mt-2">
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
