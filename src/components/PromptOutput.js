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
      className="ios-bento-card w-full relative overflow-hidden"
    >
      <div className="flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
            Final Result
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all text-[12px] font-bold border-none cursor-pointer ios-interact ${
              copied ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-[15px] font-medium text-black leading-[1.8] p-5 bg-[#F9F9F9] rounded-2xl border border-gray-100 m-0">
          {prompt}
        </p>
      </div>
    </motion.div>
  );
}
