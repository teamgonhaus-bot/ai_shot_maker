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
      
      <div className="flex-1 p-3 pb-0">
        <div className="flex items-center justify-between mb-2">
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
          <div className="overflow-hidden" style={{ height: '48px', display: 'flex', alignItems: 'flex-start' }}>
            <p className="text-[8px] font-medium text-gray-400 dark:text-zinc-400 leading-[1.5] mt-0 line-clamp-4 w-full text-left">
              {template.prompt}
            </p>
          </div>
        </div>

        {/* Purpose Tag */}
        {template.config && (
          <div style={{ marginTop: '12px', marginBottom: '0px' }}>
            <span className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold tracking-wider rounded-full border border-gray-200 dark:border-zinc-700">
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

      <div className="flex items-center justify-between pt-1 px-3 pb-2 border-t border-gray-100 mt-0">
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
