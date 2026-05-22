// Legacy hook - Hugging Face integration removed.
export const useImageGenerator = () => {
  return {
    generateImage: async () => {},
    isGenerating: false,
    error: null,
    generatedImage: null,
    setGeneratedImage: () => {}
  };
};
