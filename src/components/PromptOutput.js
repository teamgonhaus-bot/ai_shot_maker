import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromptOutput({ prompt, onChange }) {
  const [copied, setCopied] = useState(false);

  const isArray = Array.isArray(prompt);
  const textPrompt = isArray ? prompt.join(", ") : prompt;

  const handleCopy = () => {
    navigator.clipboard.writeText(textPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveChip = (index) => {
    if (isArray && onChange) {
      const newPrompt = [...prompt];
      newPrompt.splice(index, 1);
      onChange(newPrompt);
    }
  };

  if (!prompt || (isArray && prompt.length === 0)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="result-card ios-bento-card relative"
      style={{ padding: '20px' }}
    >
      <button
        onClick={handleCopy}
        className={`copy-btn ${copied ? 'copied' : ''}`}
        style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <span className="result-card-label block mb-3 font-bold text-sm">Final Result (Word Chips)</span>
      
      {isArray ? (
        <div className="flex flex-wrap gap-2 pr-[80px]">
          <AnimatePresence>
            {prompt.map((chip, idx) => (
              <motion.div
                key={`${idx}-${chip}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-zinc-700 shadow-sm"
              >
                <span>{chip}</span>
                <button onClick={() => handleRemoveChip(idx)} className="hover:text-red-500 transition-colors ml-1 p-0.5">
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="result-card-text pr-[80px] text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {textPrompt}
        </p>
      )}
    </motion.div>
  );
}
