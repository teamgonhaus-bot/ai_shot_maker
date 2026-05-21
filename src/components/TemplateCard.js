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
      
      <div className="flex-1 p-2 pb-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: template.thumbnailColor || '#000' }} />
            <h4 className="font-bold text-[13px] text-black line-clamp-1">
              {template.name}
            </h4>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveRequest(template); }}
            className="ios-card-icon-btn"
            title="Move to category"
            style={{ width: '28px', height: '28px', flexShrink: 0 }}
          >
            <FolderInput size={14} />
          </button>
        </div>
        
        {/* Prompt: true 4-line clamp with 8px font, no fixed height override */}
        <p style={{
          fontSize: '8px',
          fontWeight: 500,
          color: '#9CA3AF',
          lineHeight: 1.5,
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
          <div style={{ marginTop: '6px', marginBottom: '0px' }}>
            <span className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[9px] font-bold tracking-wider rounded-full border border-gray-200 dark:border-zinc-700">
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

      <div className="flex items-center justify-between pt-1 px-2 pb-1.5 border-t border-gray-100 mt-1">
        <div className="flex gap-2 items-center w-full">
          {/* 원형 Apply Preset 서클 버튼 - 옆의 다른 버튼과 동일 규격(34px), 일반: 블루원형/화이트아이콘, 블루모드: 화이트원형/블루아이콘 */}
          <button
            onClick={(e) => { e.stopPropagation(); onApply(template); }}
            className="ios-apply-preset-btn"
            title="Apply preset"
          >
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>

          {/* 보조 관리 버튼 그룹을 우측 끝으로 완벽 격리 */}
          <div className="flex gap-2 items-center ml-auto">
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
      </div>
    </motion.div>
  );
}
