import React, { useState } from 'react';
import { Wand2, Loader2, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageGenerator } from '../hooks/useImageGenerator';
import ImageUploader from './ImageUploader';

/**
 * [ROLE: AI/React Senior Engineer]
 * Hugging Face Flux.1 API를 활용한 고품질 이미지 생성 컴포넌트
 */
export default function ImageGenerator({ hfToken }) {
  const [prompt, setPrompt] = useState("");
  const [imageRef, setImageRef] = useState(null);
  const [strength, setStrength] = useState(0.65); // [INSTRUCTION 3] Img2Img 강도 기본값 0.65
  const [numSteps, setNumSteps] = useState(4);   // [INSTRUCTION 2] Flux.1 Schnell 최적화

  const { 
    generateImage, 
    isGenerating, 
    error, 
    generatedImage, 
    setGeneratedImage 
  } = useImageGenerator(hfToken);

  const handleGenerate = async () => {
    if (!prompt) return alert("프롬프트를 입력해주세요.");
    
    // [INSTRUCTION 1] Text-to-Image vs Image-to-Image 분기 로직은 hook 내부에서 처리
    await generateImage({
      prompt,
      imageRef, // 첨부 이미지가 있으면 Img2Img로 동작
      strength,
      numSteps: 4
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-all">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Wand2 className="text-purple-500" /> Flux.1 Studio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-500 mb-2">Text Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision..."
                className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none text-sm"
              />
            </div>

            {/* [INSTRUCTION 1] Image-to-Image 첨부 섹션 */}
            <ImageUploader onImageSelect={(file) => setImageRef(file)} />

            {/* [INSTRUCTION 3] UI에서 조절 가능한 Strength 상태 */}
            {imageRef && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30"
              >
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-purple-700 dark:text-purple-300">Denoising Strength</label>
                  <span className="text-xs font-black text-purple-700 dark:text-purple-300">{strength}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={strength}
                  onChange={(e) => setStrength(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-purple-200 dark:bg-purple-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[10px] text-purple-600/60 dark:text-purple-400/60 mt-2">
                  낮을수록 원본 유지, 높을수록 AI 변형 강해짐
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2">Inference Steps</label>
                <input
                  type="number"
                  value={numSteps}
                  min="30"
                  max="100"
                  onChange={(e) => setNumSteps(parseInt(e.target.value))}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isGenerating ? 'bg-zinc-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Generate Masterpiece
                </>
              )}
            </button>
          </div>

          {/* Right Column: Result */}
          <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {generatedImage ? (
                <motion.img
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              ) : (
                <motion.div
                  key="placeholder"
                  className="flex flex-col items-center gap-3 text-zinc-400"
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin" />
                        <ImageIcon className="absolute inset-0 m-auto w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-sm font-bold animate-pulse text-purple-600">AI is dreaming...</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest opacity-40">Ready to Create</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="absolute bottom-4 inset-x-4 p-4 bg-red-500/90 text-white rounded-2xl flex items-center gap-2 backdrop-blur-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold leading-tight">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
