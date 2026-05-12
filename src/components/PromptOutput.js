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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-extrabold tracking-[0.2em] text-zinc-400 uppercase flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-orange-500" /> Output Prompt
        </label>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-bold tracking-widest uppercase transition-all duration-500 ${
            copied 
              ? 'bg-green-500 text-white shadow-xl shadow-green-500/20' 
              : 'bg-white border-2 border-zinc-50 text-zinc-500 hover:border-orange-500/30 hover:text-orange-500 shadow-sm'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={copied ? 'check' : 'copy'}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center gap-2"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      <div className="relative group">
        <div className="relative p-8 bg-white border-2 border-zinc-50 rounded-[40px] text-sm text-zinc-800 leading-relaxed font-mono break-words shadow-sm overflow-hidden min-h-[120px]">
          {prompt}
          <div className="absolute -bottom-6 -right-6 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000 pointer-events-none">
            <Zap className="w-32 h-32" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
