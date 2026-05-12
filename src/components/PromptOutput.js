import React, { useState } from 'react';
import { Copy, Check, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <label className="label-caps flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" /> Output Result
        </label>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${
            copied 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="relative group">
        <div className="relative p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 font-mono break-words leading-relaxed min-h-[100px]">
          {prompt || "Your prompt will appear here..."}
          <div className="absolute bottom-2 right-2 opacity-10 pointer-events-none">
            <Zap className="w-12 h-12" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
