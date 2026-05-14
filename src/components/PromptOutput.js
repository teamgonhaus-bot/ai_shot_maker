import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
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
      className="ios-bento-card w-full relative"
      style={{ padding: '24px' }}
    >
      <button
        onClick={handleCopy}
        className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[11px] font-bold border-none cursor-pointer ios-interact z-20 ${
          copied ? 'bg-black text-white' : 'bg-[#F2F2F7] text-black hover:bg-[#E5E5EA]'
        }`}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <div className="flex flex-col relative z-10 pr-12">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Final Result
        </span>
        <p className="text-[15px] font-medium text-black leading-[1.6] m-0 pr-4">
          {prompt}
        </p>
      </div>
    </motion.div>
  );
}
