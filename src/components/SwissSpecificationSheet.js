import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, Zap, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SwissSpecificationSheet({
  prompt,
  image,
  isImageGenerating,
  config = {},
  activeTemplate,
  useProduct,
  isDarkMode,
  simulateUpscale,
  handleDownload,
  isUpscaling,
  setLightboxImage,
  isSyncingToCloud = false,
  handleSyncToCloud
}) {
  // Guard: if config is null/undefined, use empty object
  const safeConfig = config || {};
  const [copied, setCopied] = useState(false);
  const [shimmerActive, setShimmerActive] = useState(false);

  // Trigger cinematic line shimmer on configuration updates (v0.65)
  useEffect(() => {
    setShimmerActive(true);
    const timer = setTimeout(() => setShimmerActive(false), 1200);
    return () => clearTimeout(timer);
  }, [config]);

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine scene number and name dynamically based on status
  const getSceneInfo = () => {
    if (activeTemplate) {
      if (activeTemplate === 'TITLE SCENE') return { num: '01', name: 'TITLE SCENE' };
      if (activeTemplate === 'COMMERCIAL SHOWROOM') return { num: '02', name: 'SHOWROOM SCENE' };
      if (activeTemplate === 'NATURE ORGANIC') return { num: '03', name: 'OUTDOOR SCENE' };
      return { num: '04', name: activeTemplate.toUpperCase() };
    }
    return { num: '00', name: 'PROFESSIONAL MIX' };
  };

  const scene = getSceneInfo();

  // Helper to extract active specifications for sheet
  const getSpecs = () => {
    const specs = [];
    
    // 1. Ratio
    if (safeConfig.aspectRatio && safeConfig.aspectRatio !== "선택안함") {
      specs.push({ label: 'RATIO', value: String(safeConfig.aspectRatio).split(' ')[0] });
    }
    
    // 2. Space / Environment
    if (safeConfig.spaceType && safeConfig.spaceType !== "선택안함") {
      let spaceVal = String(safeConfig.spaceType);
      if (safeConfig.spaceDetail && safeConfig.spaceDetail !== "선택안함") {
        spaceVal += ` / ${safeConfig.spaceDetail}`;
      }
      specs.push({ label: 'SPACE', value: spaceVal });
    }

    // 3. Subject
    if (safeConfig.subjectNum && safeConfig.subjectNum !== "없음") {
      specs.push({ 
        label: 'SUBJECT', 
        value: `${safeConfig.subjectNum} (${safeConfig.subjectGender || 'SOLO'})` 
      });
    }

    // 4. Camera Angle / Depth
    if (safeConfig.cameraAngle && safeConfig.cameraAngle !== "선택안함") {
      specs.push({ label: 'CAMERA', value: String(safeConfig.cameraAngle) });
    }

    // 5. Lighting
    if (safeConfig.useLight && safeConfig.light && safeConfig.light !== "선택안함") {
      specs.push({ label: 'LIGHTING', value: String(safeConfig.light) });
    }

    // 6. Style — shotStyle may be an array
    if (safeConfig.shotStyle) {
      const styleVal = Array.isArray(safeConfig.shotStyle)
        ? safeConfig.shotStyle.join(', ')
        : safeConfig.shotStyle;
      if (styleVal && styleVal !== "선택안함") {
        specs.push({ label: 'STYLE', value: styleVal });
      }
    }

    // 7. Brand Anchor
    if (useProduct && safeConfig.productAnchor && safeConfig.productAnchor !== "선택안함") {
      specs.push({ label: 'ANCHOR', value: String(safeConfig.productAnchor) });
    }

    return specs;
  };

  const specs = getSpecs();
  
  // High-end technical ID generation based on config hash
  const getSpecId = () => {
    const spaceMap = {
      "스튜디오": "STUDIO",
      "오피스": "OFFICE",
      "홈": "HOME",
      "리테일": "RETAIL",
      "라운지": "LOUNGE",
      "야외": "OUTDOOR"
    };
    const spaceCode = safeConfig.spaceType ? (spaceMap[safeConfig.spaceType] || String(safeConfig.spaceType).toUpperCase()) : 'MIX';
    return `EU-SM63-${spaceCode}`;
  };

  const specId = getSpecId();

  return (
    <div 
      className="swiss-spec-panel"
      style={{
        backgroundColor: isDarkMode ? '#0022FF' : '#FFFFFF',
        color: isDarkMode ? '#FFFFFF' : '#0022FF',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '0 0 40px 0',
      }}
    >
      <style>{`
        .swiss-spec-panel {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          width: 100%;
        }
        .swiss-line-divider {
          border-bottom: 1.5px solid ${isDarkMode ? '#FFFFFF' : '#0022FF'};
          margin: 0;
          padding: 24px 0;
        }
        .swiss-header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 12px;
          border-bottom: 3px solid ${isDarkMode ? '#FFFFFF' : '#0022FF'};
        }
        .swiss-scene-num {
          font-size: clamp(48px, 6vw, 64px);
          font-weight: 900;
          line-height: 0.8;
          letter-spacing: -0.05em;
        }
        .swiss-scene-name {
          font-size: clamp(22px, 3.2vw, 32px);
          font-weight: 900;
          line-height: 0.9;
          text-align: right;
          letter-spacing: -0.03em;
          text-transform: uppercase;
        }
        .swiss-spec-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 24px 0 6px 0;
          border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,34,255,0.4)'};
          position: relative !important;
          overflow: hidden !important;
        }
        @keyframes glow-shimmer {
          0% { left: -150%; }
          100% { left: 150%; }
        }
        .shimmer-line-glow {
          position: absolute !important;
          bottom: 0 !important;
          left: -150% !important;
          width: 50% !important;
          height: 1.5px !important;
          background: linear-gradient(90deg, transparent, ${isDarkMode ? '#FFFFFF' : '#0022FF'}, transparent) !important;
          animation: glow-shimmer 1.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
          z-index: 5 !important;
        }
        .swiss-spec-label {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          opacity: 0.8;
        }
        .swiss-spec-value {
          font-size: clamp(18px, 2.5vw, 26px);
          font-weight: 900;
          letter-spacing: -0.02em;
          text-align: right;
          max-width: 75%;
          word-break: break-word;
          line-height: 1.1;
        }
        .swiss-image-container {
          border: 1px solid ${isDarkMode ? '#FFFFFF' : '#0022FF'};
          margin-top: 24px;
          overflow: hidden;
          position: relative;
        }
        .swiss-image-container img {
          width: 100%;
          height: auto;
          display: block;
          filter: grayscale(0.1);
          transition: filter 0.3s ease;
        }
        .swiss-image-container img:hover {
          filter: grayscale(0);
        }
        .swiss-image-controls {
          display: flex;
          border-top: 1.5px solid ${isDarkMode ? '#FFFFFF' : '#0022FF'};
          background-color: ${isDarkMode ? '#0022FF' : '#FFFFFF'};
        }
        .swiss-image-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: inherit;
          font-size: 10.5px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background-color 0.2s ease, opacity 0.2s;
        }
        .swiss-image-btn:hover {
          background-color: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,34,255,0.06)'};
        }
        .swiss-image-btn:active {
          opacity: 0.8;
        }
        .swiss-image-btn:not(:last-child) {
          border-right: 1px solid ${isDarkMode ? '#FFFFFF' : '#0022FF'};
        }
        .swiss-prompt-box {
          padding: 28px 0;
          border-bottom: 1.5px solid ${isDarkMode ? '#FFFFFF' : '#0022FF'};
        }
        .swiss-prompt-title {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 12px;
          opacity: 0.7;
        }
        .swiss-prompt-text {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.6;
          word-break: break-word;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .swiss-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1.5px solid ${isDarkMode ? '#FFFFFF' : '#0022FF'};
        }
        .swiss-footer-id {
          font-size: 10.5px;
          font-weight: 900;
          letter-spacing: 0.05em;
        }
        .swiss-copy-tab {
          background-color: ${isDarkMode ? '#FFFFFF' : '#0022FF'};
          color: ${isDarkMode ? '#0022FF' : '#FFFFFF'};
          border: none;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .swiss-copy-tab:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .swiss-copy-tab:active {
          transform: translateY(0);
        }
        .swiss-empty-spec {
          text-align: center;
          padding: 64px 16px;
          border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,34,255,0.2)'};
        }
        .swiss-empty-text {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.05em;
          opacity: 0.6;
          text-transform: uppercase;
        }
        .skeleton-line {
          height: 240px;
          width: 100%;
          border: 1px dashed ${isDarkMode ? '#FFFFFF' : '#0022FF'};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 24px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* 1. Header Grid */}
      <div className="swiss-header-container">
        <div className="swiss-scene-num">{scene.num}</div>
        <div className="swiss-scene-name">{scene.name}</div>
      </div>

      {/* 2. Specification Data Lines */}
      {specs.map((spec, i) => (
        <div key={i} className="swiss-spec-row">
          <span className="swiss-spec-label">{spec.label}</span>
          <span className="swiss-spec-value">{spec.value ? String(spec.value).toUpperCase() : ''}</span>
          {shimmerActive && <div className="shimmer-line-glow" />}
        </div>
      ))}

      {specs.length === 0 && (
        <div className="swiss-empty-spec">
          <span className="swiss-empty-text">No active parameters selected</span>
        </div>
      )}

      {/* 3. Image Generation Result Area */}
      {isImageGenerating && (
        <div className="skeleton-line">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mb-3"></div>
          <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em' }}>
            GENERATING IMAGE VIA GEMINI API...
          </span>
        </div>
      )}

      {!isImageGenerating && image && (
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="swiss-image-container"
        >
          <img
            src={image}
            alt="Generated Concept Shot"
            className="cursor-zoom-in"
            onClick={() => setLightboxImage(image)}
          />
          <div className="swiss-image-controls">
            <button onClick={simulateUpscale} className="swiss-image-btn" disabled={isUpscaling}>
              <Zap size={11} />
              <span>{isUpscaling ? 'Upscaling...' : '2x'}</span>
            </button>
            <button onClick={handleDownload} className="swiss-image-btn">
              <Download size={11} />
              <span>Download</span>
            </button>
            {image && image.startsWith("data:image/") ? (
              <button onClick={handleSyncToCloud} className="swiss-image-btn" disabled={isSyncingToCloud} style={{ color: '#007AFF', fontWeight: 900 }}>
                <Cloud size={11} />
                <span>{isSyncingToCloud ? 'Syncing...' : 'Cloud Sync'}</span>
              </button>
            ) : (
              <button className="swiss-image-btn" disabled style={{ opacity: 0.6 }}>
                <Cloud size={11} />
                <span>Synced ✓</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 4. Full English Prompt Text Output */}
      {prompt && (
        <div className="swiss-prompt-box">
          <div className="swiss-prompt-title">FULL ENGLISH PROMPT</div>
          <p className="swiss-prompt-text">
            {prompt}
          </p>
        </div>
      )}

      {!prompt && (
        <div className="swiss-prompt-box" style={{ textAlign: 'center', padding: '40px 16px' }}>
          <p className="swiss-prompt-text" style={{ opacity: 0.5, fontSize: '12px', fontWeight: 800 }}>
            PLEASE OPTIMIZE CONSTANTS AND GENERATE PROMPT
          </p>
        </div>
      )}

      {/* 5. Receipt Footer with Spec ID and Copy Tab */}
      <div className="swiss-footer-row">
        <span className="swiss-footer-id">
          ID / {specId}
        </span>
        {prompt && (
          <button onClick={handleCopy} className="swiss-copy-tab">
            {copied ? <Check size={11} /> : <Copy size={11} />}
            <span>{copied ? 'Copied✓' : 'Copy'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
