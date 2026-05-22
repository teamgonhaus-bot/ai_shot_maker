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
      {/* Line 1: Split Justification (Preset name is massive bold blue like right spec sheet) */}
      <div className="flex justify-between items-end" style={{ marginBottom: '14px' }}>
        <div className="flex flex-col items-start gap-1">
          <span 
            className="text-[12px] font-sans font-black tracking-wider" 
            style={{ color: isDarkMode ? '#FFFFFF' : '#0022FF', opacity: 0.6 }}
          >
            {formattedIndex}
          </span>
          <span 
            className="text-[28px] font-sans font-black tracking-tighter uppercase" 
            style={{ color: isDarkMode ? '#FFFFFF' : '#0022FF', lineHeight: '1.0' }}
          >
            / {template.name}
          </span>
        </div>
        <div 
          className="text-[10px] font-sans uppercase tracking-widest opacity-60 font-black" 
          style={{ color: isDarkMode ? '#FFFFFF' : '#0022FF' }}
        >
          {aspectRatio.split(' ')[0]}
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

        {/* Action Buttons: APPLY primary solid, others minimal underline text */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* APPLY — primary CTA, solid fill */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApply(template);
            }}
            className="hover:opacity-90 active:scale-95 transition-all duration-150"
            style={{
              backgroundColor: isDarkMode ? '#FFFFFF' : '#0022FF',
              color: isDarkMode ? '#0022FF' : '#FFFFFF',
              border: 'none',
              borderRadius: '0px',
              padding: '8px 20px',
              fontSize: '11px',
              fontWeight: '900',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            APPLY
          </button>

          {/* Secondary actions — simple underline text style */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveRequest(template);
              }}
              className="hover:opacity-100 active:opacity-60 transition-opacity"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(0,34,255,0.4)',
                borderRadius: '0px',
                padding: '2px 0',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,34,255,0.55)',
              }}
            >
              MOVE
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename(template.id, template.name);
              }}
              className="hover:opacity-100 active:opacity-60 transition-opacity"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(0,34,255,0.4)',
                borderRadius: '0px',
                padding: '2px 0',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,34,255,0.55)',
              }}
            >
              RENAME
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(template.id);
              }}
              className="hover:opacity-100 active:opacity-60 transition-opacity"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,59,48,0.5)',
                borderRadius: '0px',
                padding: '2px 0',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: 'rgba(255,59,48,0.7)',
              }}
            >
              DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
