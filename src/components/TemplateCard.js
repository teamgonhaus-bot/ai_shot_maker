import React from 'react';

export default function TemplateCard({
  template,
  index,
  isSelected,
  isDarkMode,
  onSelect,
  onApply,
  onDelete,
  onRename,
  onMoveRequest,
  onViewPrompt,
  categories
}) {
  const formattedIndex = String(index).padStart(2, '0');
  
  // Extract info from config if available
  const aspectRatio = template.config?.aspectRatio || 'FLUX';
  const modelType = 'FLUX';

  return (
    <div
      onClick={() => {
        if (onSelect) onSelect(template);
        if (onViewPrompt) onViewPrompt(template);
      }}
      className={`swiss-spec-row flex flex-col w-full text-left transition-all duration-200 cursor-pointer ${
        isSelected ? 'bg-blue-50/40 dark:bg-zinc-800/40' : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/20'
      }`}
      style={{
        borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #0022FF',
        padding: '16px 8px',
      }}
    >
      {/* Line 1: Split Justification (Preset name is bold blue like right spec sheet) */}
      <div className="flex justify-between items-baseline" style={{ marginBottom: '14px' }}>
        <div className="flex items-baseline gap-1.5">
          <span 
            className="text-[12px] font-sans font-black tracking-wider" 
            style={{ color: isDarkMode ? '#FFFFFF' : '#0022FF', opacity: 0.6 }}
          >
            {formattedIndex}
          </span>
          <span 
            className="text-[13px] font-sans font-black tracking-tight uppercase" 
            style={{ color: isDarkMode ? '#FFFFFF' : '#0022FF' }}
          >
            / {template.name}
          </span>
        </div>
        <div 
          className="text-[10px] font-sans uppercase tracking-widest opacity-60 font-black" 
          style={{ color: isDarkMode ? '#FFFFFF' : '#0022FF' }}
        >
          {aspectRatio.split(' ')[0]} | {modelType}
        </div>
      </div>

      {/* Line 2: Prompt Text & Action Buttons (3-line clamp, padded spacing for clarity) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4" style={{ marginTop: '16px' }}>
        {/* Padded prompt display, limited to exactly 3 lines with ellipsis */}
        <p 
          className="text-[11px] font-sans leading-relaxed flex-1 m-0 text-justify"
          style={{ 
            color: isDarkMode ? '#E5E5EA' : '#48484A',
            wordBreak: 'break-all',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingRight: '12px',
          }}
        >
          {template.prompt}
        </p>

        {/* Action Buttons: Solid Swiss Block Style (Copied from spec sheet Copy tab specs) */}
        <div className="flex flex-wrap items-center gap-4 mt-3 md:mt-0 flex-shrink-0 self-end w-full md:w-auto justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApply(template);
            }}
            className="hover:opacity-90 active:scale-95 transition-all duration-200"
            style={{
              backgroundColor: isDarkMode ? '#FFFFFF' : '#0022FF',
              color: isDarkMode ? '#0022FF' : '#FFFFFF',
              border: 'none',
              borderRadius: '0px',
              padding: '6px 14px',
              fontSize: '10px',
              fontWeight: '900',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            APPLY
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveRequest(template);
            }}
            className="hover:opacity-90 active:scale-95 transition-all duration-200"
            style={{
              backgroundColor: isDarkMode ? '#FFFFFF' : '#0022FF',
              color: isDarkMode ? '#0022FF' : '#FFFFFF',
              border: 'none',
              borderRadius: '0px',
              padding: '6px 14px',
              fontSize: '10px',
              fontWeight: '900',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            MOVE
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(template.id, template.name);
            }}
            className="hover:opacity-90 active:scale-95 transition-all duration-200"
            style={{
              backgroundColor: isDarkMode ? '#FFFFFF' : '#0022FF',
              color: isDarkMode ? '#0022FF' : '#FFFFFF',
              border: 'none',
              borderRadius: '0px',
              padding: '6px 14px',
              fontSize: '10px',
              fontWeight: '900',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            RENAME
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template.id);
            }}
            className="hover:opacity-90 active:scale-95 transition-all duration-200"
            style={{
              backgroundColor: '#FF3B30',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0px',
              padding: '6px 14px',
              fontSize: '10px',
              fontWeight: '900',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
