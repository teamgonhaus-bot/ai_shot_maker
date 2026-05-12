import React, { useState } from 'react';
import { ImageIcon, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageUploader({ onImageSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <Upload className="w-4 h-4 text-orange-500" /> 공간 및 제품 이미지 첨부
        </label>
        {preview && (
          <button 
            onClick={clearImage}
            className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> 삭제
          </button>
        )}
      </div>

      <div className="relative group">
        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 text-zinc-600 mb-3 group-hover:text-orange-400 transition-colors" />
              <p className="mb-1 text-sm text-zinc-500 group-hover:text-zinc-300">클릭하거나 이미지를 드래그하세요</p>
              <p className="text-xs text-zinc-600 uppercase tracking-widest">JPG, PNG, WEBP (Max 5MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-64 rounded-2xl overflow-hidden border border-zinc-800"
          >
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-medium">이미지 변경</p>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
