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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="result-card"
    >
      {/* Copy Button — absolute top-right inside card */}
      <button
        onClick={handleCopy}
        className={`copy-btn ${copied ? 'copied' : ''}`}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>

      {/* Content — padded right to not overlap copy btn */}
      <span className="result-card-label">Final Result</span>
      <p className="result-card-text" style={{ paddingRight: '90px' }}>
        {prompt}
      </p>
    </motion.div>
  );
}
