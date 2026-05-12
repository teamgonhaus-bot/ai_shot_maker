import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
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

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-extrabold tracking-[0.2em] text-zinc-400 uppercase px-1">Attached Image</label>
      <div className="relative group">
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative aspect-video w-full rounded-[40px] overflow-hidden shadow-2xl"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={removeImage}
                  className="p-4 bg-white text-red-500 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative aspect-video w-full"
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className="absolute inset-0 bg-white border-2 border-dashed border-zinc-100 rounded-[40px] flex flex-col items-center justify-center gap-4 group-hover:border-orange-500 group-hover:bg-orange-50/50 transition-all duration-500">
                <div className="p-5 bg-orange-50 rounded-full text-orange-500 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-zinc-800">Drop image here</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">or click to browse</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
