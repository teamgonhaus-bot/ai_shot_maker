import { useState, useCallback } from 'react';
import { InferenceClient } from "@huggingface/inference";

/**
 * Face Distortion (얼굴 일그러짐) 방지 고품질 렌더링 프롬프트 헬퍼
 */
const enhancePrompt = (prompt) => {
  const qualitySuffix = ", highly detailed face, sharp focus, 8k resolution, perfect symmetry, masterpiece, photorealistic, intricate facial features";
  return `${prompt}${qualitySuffix}`;
};

export const useImageGenerator = (hfToken) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);

  const client = new InferenceClient(hfToken);

  const generateImage = useCallback(async ({ 
    prompt, 
    imageRef = null, 
    strength = 0.65, 
    numSteps = 4 
  }) => {
    setIsGenerating(true);
    setError(null);

    const promptToUse = enhancePrompt(prompt);
    let retryCount = 0;
    const maxRetries = 3;

    const executeCall = async () => {
      try {
        // Image-to-Image와 Text-to-Image 분기 처리
        if (imageRef) {
          // [INSTRUCTION 1] Hugging Face image-to-image task 구현
          // imageRef는 Base64 스트링 또는 Blob/File 형태여야 함
          const blob = await client.imageToImage({
            model: "black-forest-labs/FLUX.1-dev", // 고품질 dev 모델 권장
            inputs: {
              image: imageRef,
              prompt: promptToUse,
            },
            parameters: {
              // [INSTRUCTION 3] Image-to-Image 파라미터 최적화
              strength: strength,
              // [INSTRUCTION 2] 고해상도 및 추론 스텝 설정
              num_inference_steps: numSteps,
              width: 1024,
              height: 1024,
            },
          });
          return URL.createObjectURL(blob);
        } else {
          // Text-to-Image 분기
          const blob = await client.textToImage({
            model: "black-forest-labs/FLUX.1-dev",
            inputs: promptToUse,
            parameters: {
              num_inference_steps: numSteps,
              width: 1024,
              height: 1024,
            },
          });
          return URL.createObjectURL(blob);
        }
      } catch (err) {
        // [INSTRUCTION 4] Model Loading (503) 자동 재시도 로직
        if (err.message.includes('503') && retryCount < maxRetries) {
          retryCount++;
          console.warn(`Model loading (503). Retrying... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기 후 재시도
          return executeCall();
        }
        throw err;
      }
    };

    try {
      const imageUrl = await executeCall();
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error("Generation Error:", err);
      setError(err.message || "이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  }, [client]);

  return {
    generateImage,
    isGenerating,
    error,
    generatedImage,
    setGeneratedImage
  };
};
