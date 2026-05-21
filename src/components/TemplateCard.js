import React from 'react';
import { Trash2, FolderInput, Edit2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onSelect, onApply, onDelete, onRename, onMoveRequest, onViewPrompt, categories, isSelected }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.10)' }}
      className={`ios-bento-card flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${isSelected ? 'ring-2 ring-[#0022FF]' : ''}`}
      style={{ padding: '0', minHeight: '140px', marginBottom: '0', cursor: 'pointer' }}
      onClick={() => {
        onSelect(template);
        onViewPrompt(template);
      }}
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
            onClick={(e) => { e.stopPropagation(); onMoveRequest(template); }}
            className="ios-card-icon-btn"
            title="Move to category"
            style={{ width: '32px', height: '32px' }}
          >
            <FolderInput size={16} />
          </button>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden" style={{ height: '60px', display: 'flex', alignItems: 'center' }}>
            <p className="text-[13px] font-medium text-gray-400 dark:text-zinc-400 leading-relaxed mt-1 line-clamp-3 w-full">
              {template.prompt}
            </p>
          </div>
        </div>

        {/* Purpose Tag */}
        {template.config && (
          <div className="mt-2">
            <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-full border border-gray-200 dark:border-zinc-700">
              {(() => {
                const c = template.config;
                if (c.aspectRatio === '1:1 (Square)' && c.subjectNum === '없음') return 'Title';
                if (c.cameraAngle === '익스트림 클로즈업' || c.productLayout === '액체 스플래시') return 'Detail';
                if (c.aspectRatio === '4:5 (SNS)' || c.spaceDetail === '힙한곳') return 'SNS';
                if (c.spaceType === '홈' || c.spaceType === '오피스' || c.spaceDetail === '워크룸') return 'Usage';
                return 'General';
              })()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 px-4 pb-4 border-t border-gray-100 mt-2">
        <div className="flex gap-2 items-center">
          {/* Apply arrow — inverts to black when selected */}
          <button
            onClick={(e) => { e.stopPropagation(); onApply(template); }}
            className="ios-card-icon-btn"
            title="Apply preset"
            style={{
              backgroundColor: isSelected ? '#0022FF' : undefined,
              color: isSelected ? '#FFFFFF' : undefined,
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
            className="ios-card-icon-btn"
            title="Delete"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRename(template.id, template.name); }}
            className="ios-card-icon-btn"
            title="Rename"
          >
            <Edit2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
