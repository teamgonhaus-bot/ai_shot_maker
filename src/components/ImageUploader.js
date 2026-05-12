import React, { useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
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
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2">
          <Upload className="w-3 h-3 text-orange-500" /> Reference Image
        </label>
        {preview && (
          <button 
            onClick={clearImage}
            className="text-[10px] font-bold tracking-widest text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors uppercase"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>

      <div className="relative group">
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.label 
              key="uploader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center w-full h-48 border border-white/5 bg-white/[0.02] rounded-3xl cursor-pointer hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all group overflow-hidden relative"
            >
              <div className="flex flex-col items-center justify-center py-6">
                <div className="p-4 bg-zinc-900 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-orange-500 transition-all duration-500">
                  <Plus className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">Drop your reference here</p>
                <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-widest">JPG, PNG or WEBP</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </motion.label>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              className="relative w-full h-64 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-8">
                <p className="text-white text-xs font-bold tracking-widest uppercase mb-4">Click to change image</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
