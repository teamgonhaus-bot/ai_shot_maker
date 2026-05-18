import React from 'react';
import { motion } from 'framer-motion';

export default function WireframeVisualizer({ aspectRatio, copySpace }) {
  // Parse aspect ratio strings like "4:5 (SNS)" to numerical ratios
  const getRatio = (arString) => {
    if (!arString) return 1; // default square
    const match = arString.match(/^(\d+):(\d+)/);
    if (match) {
      return parseInt(match[1]) / parseInt(match[2]);
    }
    return 1;
  };

  const ratio = getRatio(aspectRatio);
  
  // Calculate dimensions for the wireframe box based on ratio
  const maxHeight = 100;
  const maxWidth = 100;
  
  let width, height;
  if (ratio > 1) {
    width = maxWidth;
    height = maxWidth / ratio;
  } else {
    height = maxHeight;
    width = maxHeight * ratio;
  }

  // Calculate safe area based on copy space
  const getCopySpaceOverlay = () => {
    if (!copySpace || copySpace === "선택안함") return null;
    
    // Default safe area size
    const safeAreaStyle = {
      position: 'absolute',
      backgroundColor: 'rgba(0, 122, 255, 0.2)', // iOS Blue translucent
      border: '1px dashed #007AFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (copySpace) {
      case "상단 여백":
        return { ...safeAreaStyle, top: 0, left: 0, right: 0, height: '40%' };
      case "하단 여백":
        return { ...safeAreaStyle, bottom: 0, left: 0, right: 0, height: '40%' };
      case "좌측 여백":
        return { ...safeAreaStyle, top: 0, left: 0, bottom: 0, width: '40%' };
      case "우측 여백":
        return { ...safeAreaStyle, top: 0, right: 0, bottom: 0, width: '40%' };
      case "중앙 여백":
        return { ...safeAreaStyle, top: '25%', left: '25%', right: '25%', bottom: '25%' };
      case "가장자리 여백":
        return { ...safeAreaStyle, top: '10%', left: '10%', right: '10%', bottom: '10%', border: '4px solid rgba(0, 122, 255, 0.2)', backgroundColor: 'transparent' };
      default:
        return null;
    }
  };

  const overlayStyle = getCopySpaceOverlay();

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 mb-4 transition-all duration-300">
      <div className="flex justify-between items-center w-full mb-3 px-1">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Frame Preview</label>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
          {aspectRatio || "1:1"}
        </span>
      </div>
      
      <div className="flex items-center justify-center" style={{ height: '120px', width: '100%' }}>
        <motion.div
          layout
          initial={false}
          animate={{ width, height }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded shadow-sm overflow-hidden flex items-center justify-center"
        >
          {overlayStyle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-10"
              style={overlayStyle}
            >
              <span className="text-[8px] font-bold text-[#007AFF] uppercase rotate-0 text-center px-1">
                Text Safe<br/>Area
              </span>
            </motion.div>
          )}
          {/* Mock subject indicator */}
          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-700 relative z-0" />
        </motion.div>
      </div>
    </div>
  );
}
