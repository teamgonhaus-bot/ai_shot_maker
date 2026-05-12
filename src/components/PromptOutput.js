import React, { useState } from 'react';
import { Copy, Check, Terminal, Zap } from 'lucide-react';
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
      className="vibrant-card card-purple shadow-xl shadow-purple-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="px-4 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest">
          Final Result
        </span>
        <button
          onClick={handleCopy}
          className={`p-3 rounded-full transition-all ${
            copied ? 'bg-white text-emerald-500' : 'bg-white/20 text-white hover:bg-white/40'
          }`}
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none text-white">
          Generated Prompt
        </h3>
        <p className="text-sm font-medium text-white/80 font-mono leading-relaxed bg-black/10 p-6 rounded-2xl border border-white/10">
          {prompt}
        </p>
      </div>

      <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
        <Terminal className="w-32 h-32 text-white" />
      </div>
    </motion.div>
  );
}
