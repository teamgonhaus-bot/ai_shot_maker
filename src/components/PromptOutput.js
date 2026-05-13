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
        <div className="flex items-center justify-between mb-[12px]">
          <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest m-0">
            Final Result
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center p-2 rounded-full transition-colors border-none cursor-pointer ios-interact ${
              copied ? 'bg-[#E9E9EB] text-green-600' : 'bg-[#E9E9EB] text-gray-600 hover:bg-[#D1D1D6]'
            }`}
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[15px] font-medium text-black leading-relaxed p-4 bg-[#F2F2F7] rounded-xl border-none m-0">
          {prompt}
        </p>
      </div>
    </motion.div>
  );
}
