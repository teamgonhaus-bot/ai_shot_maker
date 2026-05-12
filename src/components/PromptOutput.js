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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-2">
          <Terminal className="w-3 h-3" /> Generated Prompt
        </label>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            copied ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative p-5 bg-zinc-950 border border-zinc-800/50 rounded-2xl text-sm text-orange-200/90 leading-relaxed font-mono break-words shadow-inner overflow-hidden min-h-[100px]">
          {prompt}
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Terminal className="w-24 h-24 rotate-12" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
