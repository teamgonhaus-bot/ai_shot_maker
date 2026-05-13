import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PromptOutput({ prompt }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prompt) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-bento-card w-full relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
          Final Result
        </span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[12px] font-bold ${
            copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        <p className="text-[14px] font-medium text-black leading-relaxed p-4 bg-[#F2F2F7] rounded-xl border-none">
          {prompt}
        </p>
      </div>
    </motion.div>
  );
}
