import React from 'react';
import { Trash2, FolderInput, Edit2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateCard({ template, onSelect, onApply, onDelete, onRename, onMoveRequest, onViewPrompt, categories, isSelected, isDarkMode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.10)' }}
      className={`ios-bento-card flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${isSelected ? 'ring-2 ring-[#0022FF]' : ''}`}
      style={{ padding: '0', minHeight: '125px', marginBottom: '0', cursor: 'pointer' }}
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
      
      <div className="flex-1 p-1.5 pb-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: template.thumbnailColor || '#000' }} />
            <h4 className="font-bold text-[13px] text-black truncate min-w-0">
              {template.name}
            </h4>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveRequest(template); }}
            className="ios-card-icon-btn flex-shrink-0 ml-1"
            title="Move to category"
            style={{ width: '28px', height: '28px' }}
          >
            <FolderInput size={13} />
          </button>
        </div>
        
        {/* Prompt: true 4-line clamp with 10.5px font and tight line-height */}
        <p style={{
          fontSize: '10.5px',
          fontWeight: 500,
          color: '#9CA3AF',
          lineHeight: 1.3,
          margin: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word',
        }}>
          {template.prompt}
        </p>

        {/* Purpose Tag */}
        {template.config && (
          <div style={{ marginTop: '1px', marginBottom: '0px' }}>
            <span className="inline-block px-1 py-0 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[9px] font-bold tracking-wider rounded-full border border-gray-200 dark:border-zinc-700">
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

      <div className="ios-template-card-footer flex items-center justify-between mt-0" style={{ paddingLeft: '6px', paddingRight: '6px' }}>
        <div className="flex items-center w-full justify-start" style={{ gap: '8px' }}>
          {/* 원형 Apply Preset 서클 버튼 - 일반: 블루원형/화이트아이콘, 블루모드: 화이트원형/블루아이콘 */}
          <button
            onClick={(e) => { e.stopPropagation(); onApply(template); }}
            className="ios-apply-preset-btn"
            title="Apply preset"
            style={{ flexShrink: 0 }}
          >
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>

          {/* Delete 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
            className="ios-card-icon-btn"
            title="Delete"
            style={{ flexShrink: 0 }}
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>

          {/* Rename/Edit 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); onRename(template.id, template.name); }}
            className="ios-card-icon-btn"
            title="Rename"
            style={{ flexShrink: 0 }}
          >
            <Edit2 size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
