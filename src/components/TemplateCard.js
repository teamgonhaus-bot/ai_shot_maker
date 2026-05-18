import React from 'react';
import { Trash2, ArrowRight, ChevronDown, FolderInput, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete, onRename, onMoveRequest, onViewPrompt, categories, isActive }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }}
      className={`ios-bento-card flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${isActive ? 'ring-2 ring-[#007AFF] shadow-md' : ''}`}
      style={{ padding: '0', minHeight: '140px', marginBottom: '0', cursor: 'pointer' }}
      onClick={() => onLoad(template)}
    >
      {isActive && (
        <div className="absolute top-3 right-3 bg-[#007AFF] text-white rounded-full p-[3px] z-10 shadow-sm flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      )}
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
            onClick={(e) => { e.stopPropagation(); onMoveRequest(template); }}
            className="ios-card-icon-btn"
            title="Move to category"
            style={{ width: '32px', height: '32px' }}
          >
            <FolderInput size={16} />
          </button>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden" style={{ height: '60px' }}>
            <p className="text-[13px] font-medium text-gray-400 leading-relaxed mt-1 line-clamp-3">
              {template.prompt}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 px-4 pb-4 border-t border-gray-100 mt-2">
        <div className="flex gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onLoad(template); }}
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
            onClick={(e) => { e.stopPropagation(); onViewPrompt(template); }}
            className="ios-card-icon-btn"
            title="View Prompt"
            style={{ width: '32px', height: '32px', marginLeft: 'auto', backgroundColor: '#000', color: '#fff' }}
          >
            <ChevronDown size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
