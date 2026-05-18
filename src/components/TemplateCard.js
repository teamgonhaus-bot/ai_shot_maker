import React, { useState } from 'react';
import { Trash2, ArrowRight, ChevronDown, FolderInput, Edit2, Copy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TemplateCard({ template, onLoad, onDelete, onRename, onMoveRequest, categories }) {
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            onClick={() => setShowPromptModal(true)}
            className="ios-card-icon-btn"
            title="View Prompt"
            style={{ width: '32px', height: '32px', marginLeft: 'auto', backgroundColor: '#000', color: '#fff' }}
          >
            <ChevronDown size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showPromptModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { e.stopPropagation(); setShowPromptModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 w-full max-w-sm shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[20px] font-black text-black dark:text-white mb-4 tracking-tight">Prompt Detail</h3>
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-300 mb-6 max-h-[40vh] overflow-y-auto leading-relaxed p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                {template.prompt}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-[14px] transition-all"
                  style={{ backgroundColor: copied ? '#34C759' : '#000', color: '#FFF' }}
                >
                  {copied ? <span className="font-black">✓ Copied</span> : <><Copy size={16} /> Copy Prompt</>}
                </button>
                <button 
                  onClick={() => setShowPromptModal(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
