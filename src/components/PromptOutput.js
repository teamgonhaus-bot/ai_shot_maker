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
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2">
          <Terminal className="w-3 h-3 text-orange-500" /> Generated Architect Prompt
        </label>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-bold tracking-widest uppercase transition-all duration-500 ${
            copied 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-white/[0.03] border border-white/5 text-zinc-500 hover:border-white/20 hover:text-white'
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
        <div className="absolute -inset-px bg-gradient-to-r from-orange-500/30 via-purple-500/30 to-blue-500/30 rounded-[32px] blur-lg opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
        <div className="relative p-6 bg-black/60 border border-white/10 rounded-[32px] text-xs text-orange-100/80 leading-relaxed font-mono break-words shadow-2xl backdrop-blur-xl overflow-hidden min-h-[120px]">
          {prompt}
          <div className="absolute -bottom-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none">
            <Zap className="w-32 h-32" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
