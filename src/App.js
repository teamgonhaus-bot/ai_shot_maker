import React, { useState, useEffect } from 'react';
import { 
  Save, Wand2, LayoutTemplate, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Modular Components
import OptionSelect from './components/OptionSelect';
import IOSToggle from './components/IOSToggle';
import PromptOutput from './components/PromptOutput';
import TemplateCard from './components/TemplateCard';

const DICTIONARY = {
  subjectNum: { "없음": "", "혼자": "a single person", "다수": "a group of people" },
  subjectGender: { "선택안함": "", "여성": "female", "남성": "male", "혼성": "mixed gender" },
  subjectAge: { "선택안함": "", "10대": "teenager", "20대": "in their 20s", "30대": "in their 30s", "40대": "in their 40s", "중장년": "middle-aged" },
  subjectRegion: { "선택안함": "", "한국": "Korean", "일본": "Japanese", "북유럽": "Northern European", "북미": "North American" },
  subjectClothesStyle: { "선택안함": "", "캐주얼": "casual style", "비즈니스": "business style", "스트릿": "streetwear style", "미니멀": "minimalist style", "포멀/정장": "formal suit style" },
  subjectClothesType: { 
    "선택안함": "", "기본 스커트": "wearing a basic skirt", "미니스커트": "wearing a miniskirt", "롱스커트": "wearing a long skirt", 
    "긴바지": "wearing long pants", "반바지": "wearing shorts", "원피스": "wearing a dress", 
    "아웃도어": "wearing outdoor apparel", "스포츠 복장": "wearing sportswear" 
  },
  subjectHair: { "선택안함": "", "긴머리": "with long hair", "짧은머리": "with short hair", "단발": "with bob hair", "펌": "with permed hair", "염색": "with dyed hair", "묶은머리": "with tied hair" },
  
  spaceType: { "스튜디오": "a professional studio environment", "오피스": "a modern office space", "홈": "a cozy home interior", "리테일": "a retail commercial space", "라운지": "a luxury lounge area", "야외": "an outdoor setting" },
  spaceDetail: { 
    "단색 배경": "with a solid color background", "인테리어 세트장": "within a designed interior set",
    "사무실": "in a standard office setup", "회의실": "in a formal meeting room", "중역실": "in an executive office suite", "오피스 라운지": "in a relaxed office lounge",
    "리빙": "in a living room area", "다이닝": "in a dining room setting", "룸": "in a private room",
    "카페": "in a trendy cafe", "식당": "in a modern restaurant", "쇼룸": "in a premium showroom",
    "호텔 라운지": "in a luxury hotel lounge", "공항 라운지": "in a premium airport lounge",
    "도심": "in a bustling city urban environment", "자연": "surrounded by natural scenery", "테라스": "on a scenic terrace"
  },
  interiorStyle: { "선택안함": "", "미드센추리 모던": "mid-century modern style", "모던 미니멀": "modern minimal style", "내추럴 우드": "natural wood interior style", "젠 스타일": "Zen-inspired style", "인더스트리얼": "industrial style", "스칸디나비안": "Scandinavian style" },
  light: { "선택안함": "", "자연광": "natural sunlight", "시네마틱": "cinematic dramatic lighting", "스튜디오 조명": "professional studio softbox lighting", "무드등": "soft mood lighting" },
  
  detailFloor: { "밝은 우드 마루": "light wood flooring", "어두운 우드 마루": "dark walnut wood flooring", "테라조 타일": "modern terrazzo tile floor", "대리석": "premium marble flooring", "콘크리트": "polished concrete floor", "조약돌 바닥": "pebble stone floor", "자갈 바닥": "gravel floor" },
  detailWood: { "오크(참나무)": "natural oak wood textures", "월넛(호두나무)": "rich walnut wood details", "자작나무": "birch wood accents", "티크": "premium teak wood" },
  detailMetal: { "황동(브라스)": "brushed brass metal points", "크롬/실버": "polished chrome silver accents", "무광 블랙": "matte black metal frames", "로즈골드": "elegant rose gold details" },
  detailWall: { "화이트 페인트": "clean white painted walls", "노출 콘크리트": "exposed raw concrete walls", "웨인스코팅": "elegant wainscoted walls", "파스텔톤 벽지": "soft pastel wallpaper", "붉은 벽돌": "rustic red brick walls" },
  
  cameraAngle: { "선택안함": "", "정면": "frontal shot", "하이앵글": "high-angle shot", "로우앵글": "low-angle shot", "아이레벨": "eye-level shot", "클로즈업": "close-up shot", "버드아이 뷰": "bird's eye view", "웜즈아이 뷰": "worm's eye view", "더치 앵글": "dutch angle shot", "초광각": "ultra-wide angle shot", "망원 샷": "telephoto lens shot", "풀 샷": "full body shot", "드론 샷": "aerial drone shot" },
  shotStyle: {
    "컬러블로킹": "color blocking aesthetic", "네거티브 스페이스": "negative space composition", "하드 섀도우": "hard shadows", 
    "톤온톤-모노크로매틱": "tone-on-tone monochromatic palette", "플랫 레이": "flat lay perspective", "매크로-디테일": "macro detail shot", 
    "와비사비-어스톤": "wabi-sabi earth tone aesthetic", "모션 캡쳐-동적 연출": "motion capture dynamic pose", 
    "인테리어 잡지 샷(사실적)": "realistic interior magazine photography", "와이드 건축/공간 샷": "wide architectural space shot", 
    "인테리어 비네트(코너)": "interior vignette corner shot", "라이프스타일 인테리어": "lifestyle interior scene", 
    "클로즈업 디테일": "close-up detail focus", "심도 얕은 샷(아웃포커싱)": "shallow depth of field with bokeh"
  }
};

const OPTIONS_DATA = {
  subjectNum: ["없음", "혼자", "다수"],
  subjectGender: ["선택안함", "여성", "남성", "혼성"],
  subjectAge: ["선택안함", "10대", "20대", "30대", "40대", "중장년"],
  subjectRegion: ["선택안함", "한국", "일본", "북유럽", "북미"],
  subjectClothesStyle: ["선택안함", "캐주얼", "비즈니스", "스트릿", "미니멀", "포멀/정장"],
  subjectClothesType: {
    female: ["선택안함", "기본 스커트", "미니스커트", "롱스커트", "긴바지", "반바지", "원피스", "아웃도어", "스포츠 복장"],
    others: ["선택안함", "긴바지", "반바지", "아웃도어", "스포츠 복장"]
  },
  subjectHair: ["선택안함", "긴머리", "짧은머리", "단발", "펌", "염색", "묶은머리"],
  spaceType: ["스튜디오", "오피스", "홈", "리테일", "라운지", "야외"],
  spaceDetail: {
    "스튜디오": ["단색 배경", "인테리어 세트장"],
    "오피스": ["사무실", "회의실", "중역실", "오피스 라운지"],
    "홈": ["리빙", "다이닝", "룸"],
    "리테일": ["카페", "식당", "쇼룸"],
    "라운지": ["호텔 라운지", "공항 라운지"],
    "야외": ["도심", "자연", "테라스"]
  },
  interiorStyle: ["선택안함", "미드센추리 모던", "모던 미니멀", "내추럴 우드", "젠 스타일", "인더스트리얼", "스칸디나비안"],
  light: ["선택안함", "자연광", "시네마틱", "스튜디오 조명", "무드등"],
  detailFloor: ["밝은 우드 마루", "어두운 우드 마루", "테라조 타일", "대리석", "콘크리트", "조약돌 바닥", "자갈 바닥"],
  detailWood: ["오크(참나무)", "월넛(호두나무)", "자작나무", "티크"],
  detailMetal: ["황동(브라스)", "크롬/실버", "무광 블랙", "로즈골드"],
  detailWall: ["화이트 페인트", "노출 콘크리트", "웨인스코팅", "파스텔톤 벽지", "붉은 벽돌"],
  cameraAngle: ["선택안함", "정면", "하이앵글", "로우앵글", "아이레벨", "클로즈업", "버드아이 뷰", "웜즈아이 뷰", "더치 앵글", "초광각", "망원 샷", "풀 샷", "드론 샷"],
  shotStyle: [
    "컬러블로킹", "네거티브 스페이스", "하드 섀도우", "톤온톤-모노크로매틱", "플랫 레이", "매크로-디테일", "와비사비-어스톤", "모션 캡쳐-동적 연출", 
    "인테리어 잡지 샷(사실적)", "와이드 건축/공간 샷", "인테리어 비네트(코너)", "라이프스타일 인테리어", "클로즈업 디테일", "심도 얕은 샷(아웃포커싱)"
  ]
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState({
    subjectNum: "없음",
    subjectGender: "선택안함",
    subjectAge: "선택안함",
    subjectRegion: "선택안함",
    subjectClothesStyle: "선택안함",
    subjectClothesType: "선택안함",
    subjectHair: "선택안함",
    spaceType: "스튜디오",
    spaceDetail: "단색 배경",
    interiorStyle: "선택안함",
    light: "선택안함",
    detailFloor: "밝은 우드 마루",
    detailWood: "오크(참나무)",
    detailMetal: "황동(브라스)",
    detailWall: "화이트 페인트",
    cameraAngle: "선택안함",
    shotStyle: []
  });
  const [useDetailMaterial, setUseDetailMaterial] = useState(false);
  const [removeText, setRemoveText] = useState(true);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [activeTab, setActiveTab] = useState('home');

  // Initial Data Load & Persistence Sync
  useEffect(() => {
    const loadSavedData = () => {
      const savedConfig = localStorage.getItem('shotmaker_config');
      if (savedConfig) setConfig(JSON.parse(savedConfig));
      
      const savedMat = localStorage.getItem('shotmaker_useDetailMaterial');
      if (savedMat) setUseDetailMaterial(savedMat === 'true');
      
      const savedText = localStorage.getItem('shotmaker_removeText');
      if (savedText) setRemoveText(savedText === 'true');

      // Set loading false after states are synced
      setTimeout(() => setIsLoading(false), 300);
    };

    loadSavedData();

    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedTemplates(templates);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('shotmaker_config', JSON.stringify(config));
      localStorage.setItem('shotmaker_useDetailMaterial', useDetailMaterial);
      localStorage.setItem('shotmaker_removeText', removeText);
    }
  }, [config, useDetailMaterial, removeText, isLoading]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'spaceType') next.spaceDetail = OPTIONS_DATA.spaceDetail[value][0];
      if (key === 'subjectGender' && value !== '여성' && !OPTIONS_DATA.subjectClothesType.others.includes(prev.subjectClothesType)) {
        next.subjectClothesType = "선택안함";
      }
      return next;
    });
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !generatedPrompt) return;
    try {
      await addDoc(collection(db, "templates"), {
        name: templateName,
        prompt: generatedPrompt,
        config: config,
        useDetailMaterial,
        removeText,
        createdAt: new Date(),
        thumbnailColor: ['#7C3AED', '#FACC15', '#18181B', '#BEF264', '#EF4444'][Math.floor(Math.random() * 5)]
      });
      setTemplateName("");
    } catch (e) {
      console.error("Error saving template:", e);
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteDoc(doc(db, "templates", id));
    } catch (e) {
      console.error("Error deleting template:", e);
    }
  };

  const handleLoadTemplate = (template) => {
    setConfig(template.config);
    setUseDetailMaterial(template.useDetailMaterial || false);
    setRemoveText(template.removeText !== undefined ? template.removeText : true);
    setGeneratedPrompt(template.prompt);
    setActiveTab('home');
  };

  const generatePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const parts = [];
      let subjectStr = "a high-end masterpiece";
      
      if (config.subjectNum !== "없음") {
        const traits = [];
        if (config.subjectAge !== "선택안함") traits.push(DICTIONARY.subjectAge[config.subjectAge]);
        if (config.subjectGender !== "선택안함") traits.push(DICTIONARY.subjectGender[config.subjectGender]);
        if (config.subjectRegion !== "선택안함") traits.push(DICTIONARY.subjectRegion[config.subjectRegion]);
        
        let humanStr = DICTIONARY.subjectNum[config.subjectNum];
        if (traits.length > 0) humanStr += ` (${traits.join(", ")})`;
        
        const details = [];
        if (config.subjectHair !== "선택안함") details.push(DICTIONARY.subjectHair[config.subjectHair]);
        if (config.subjectClothesStyle !== "선택안함") details.push(DICTIONARY.subjectClothesStyle[config.subjectClothesStyle]);
        if (config.subjectClothesType !== "선택안함") details.push(DICTIONARY.subjectClothesType[config.subjectClothesType]);
        
        if (details.length > 0) humanStr += ` ${details.join(", ")}`;
        parts.push(`featuring ${humanStr} posing naturally`);
      } else {
        parts.push(`professional architectural photography of ${subjectStr}`);
      }

      let envStr = DICTIONARY.spaceType[config.spaceType];
      if (config.spaceDetail) envStr += `, ${DICTIONARY.spaceDetail[config.spaceDetail]}`;
      parts.push(`set in ${envStr}`);
      if (config.interiorStyle !== "선택안함") parts.push(`designed with ${DICTIONARY.interiorStyle[config.interiorStyle]}`);

      if (useDetailMaterial) {
        const materials = [
          DICTIONARY.detailFloor[config.detailFloor],
          DICTIONARY.detailWood[config.detailWood],
          DICTIONARY.detailMetal[config.detailMetal],
          DICTIONARY.detailWall[config.detailWall]
        ];
        parts.push(`highlighting ${materials.join(", ")}`);
      }

      if (config.light !== "선택안함") parts.push(`illuminated by ${DICTIONARY.light[config.light]}`);
      if (config.cameraAngle !== "선택안함") parts.push(`shot from ${DICTIONARY.cameraAngle[config.cameraAngle]}`);
      if (config.shotStyle.length > 0) {
        const styles = config.shotStyle.map(s => DICTIONARY.shotStyle[s]);
        parts.push(`rendered with ${styles.join(", ")}`);
      }
      if (removeText) parts.push("textless, no text, no watermarks, clear image");
      parts.push("8k resolution, highly detailed, masterpiece, photorealistic, interior design magazine cover");

      setGeneratedPrompt(parts.join(", "));
      setIsGenerating(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 800);
  };

  if (isLoading) return <div className="ios-loading-screen">Loading Studio...</div>;

  return (
    <div className="app-container">
      <header className="flex justify-between items-center mb-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h1 className="text-2xl font-black text-black tracking-tight leading-none m-0">Shot Maker</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest m-0">Advanced Prompt Studio</p>
        </div>
        <div className="flex gap-1.5 bg-gray-200/50 p-1 rounded-full">
          <button className={`ios-pill ios-interact ${activeTab === 'home' ? 'bg-black text-white' : 'bg-transparent text-gray-500'}`} style={{ padding: '6px 14px' }} onClick={() => setActiveTab('home')}>Create</button>
          <button className={`ios-pill ios-interact ${activeTab === 'library' ? 'bg-black text-white' : 'bg-transparent text-gray-500'}`} style={{ padding: '6px 14px' }} onClick={() => setActiveTab('library')}>Library</button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            
            {/* 👤 인물 섹션 */}
            <section>
              <h2 className="ios-section-title" style={{ marginTop: '24px' }}>인물 (Subject)</h2>
              <div className="ios-bento-card" style={{ padding: '20px' }}>
                <OptionSelect label="인원" value={config.subjectNum} onChange={(v) => handleConfigChange('subjectNum', v)} options={OPTIONS_DATA.subjectNum} theme="red" />
                {config.subjectNum !== "없음" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <OptionSelect label="성별" value={config.subjectGender} onChange={(v) => handleConfigChange('subjectGender', v)} options={OPTIONS_DATA.subjectGender} theme="red" />
                    <OptionSelect label="연령대" value={config.subjectAge} onChange={(v) => handleConfigChange('subjectAge', v)} options={OPTIONS_DATA.subjectAge} theme="red" />
                    <OptionSelect label="지역/인종" value={config.subjectRegion} onChange={(v) => handleConfigChange('subjectRegion', v)} options={OPTIONS_DATA.subjectRegion} theme="red" />
                    <OptionSelect label="옷 스타일" value={config.subjectClothesStyle} onChange={(v) => handleConfigChange('subjectClothesStyle', v)} options={OPTIONS_DATA.subjectClothesStyle} theme="red" />
                    <OptionSelect 
                      label="옷 종류" 
                      value={config.subjectClothesType} 
                      onChange={(v) => handleConfigChange('subjectClothesType', v)} 
                      options={config.subjectGender === '여성' ? OPTIONS_DATA.subjectClothesType.female : OPTIONS_DATA.subjectClothesType.others} 
                      theme="red"
                    />
                    <OptionSelect label="헤어 스타일" value={config.subjectHair} onChange={(v) => handleConfigChange('subjectHair', v)} options={OPTIONS_DATA.subjectHair} theme="red" />
                  </motion.div>
                )}
              </div>
            </section>

            {/* 🏠 공간 섹션 */}
            <section>
              <h2 className="ios-section-title">공간 (Space)</h2>
              <div className="ios-bento-card">
                <OptionSelect label="공간 종류" value={config.spaceType} onChange={(v) => handleConfigChange('spaceType', v)} options={OPTIONS_DATA.spaceType} theme="green" />
                <OptionSelect label="세부 공간" value={config.spaceDetail} onChange={(v) => handleConfigChange('spaceDetail', v)} options={OPTIONS_DATA.spaceDetail[config.spaceType] || []} theme="green" />
                <OptionSelect label="인테리어 양식" value={config.interiorStyle} onChange={(v) => handleConfigChange('interiorStyle', v)} options={OPTIONS_DATA.interiorStyle} theme="green" />
                <OptionSelect label="조명" value={config.light} onChange={(v) => handleConfigChange('light', v)} options={OPTIONS_DATA.light} theme="green" />
                
                <div className="mt-4 border-t border-gray-100">
                  <IOSToggle 
                    label="세부 소재 및 컬러 (Materials)" 
                    isOn={useDetailMaterial} 
                    onToggle={() => setUseDetailMaterial(!useDetailMaterial)} 
                    activeColor="#34C759"
                  />
                  <AnimatePresence>
                    {useDetailMaterial && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col overflow-hidden">
                        <OptionSelect label="바닥 타일/마루" value={config.detailFloor} onChange={(v) => handleConfigChange('detailFloor', v)} options={OPTIONS_DATA.detailFloor} theme="green" />
                        <OptionSelect label="우드 소재" value={config.detailWood} onChange={(v) => handleConfigChange('detailWood', v)} options={OPTIONS_DATA.detailWood} theme="green" />
                        <OptionSelect label="메탈 포인트" value={config.detailMetal} onChange={(v) => handleConfigChange('detailMetal', v)} options={OPTIONS_DATA.detailMetal} theme="green" />
                        <OptionSelect label="벽 소재/컬러" value={config.detailWall} onChange={(v) => handleConfigChange('detailWall', v)} options={OPTIONS_DATA.detailWall} theme="green" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* ⚙️ 카메라 섹션 */}
            <section>
              <h2 className="ios-section-title" style={{ marginTop: '24px' }}>카메라 (Camera)</h2>
              <div className="ios-bento-card" style={{ padding: '20px' }}>
                <div className="mb-4 border-b border-gray-100">
                  <IOSToggle 
                    label="텍스트/로고 제거" 
                    isOn={removeText} 
                    onToggle={() => setRemoveText(!removeText)} 
                    activeColor="#AF52DE"
                  />
                </div>
                <OptionSelect label="카메라 구도" value={config.cameraAngle} onChange={(v) => handleConfigChange('cameraAngle', v)} options={OPTIONS_DATA.cameraAngle} theme="blue" />
              </div>
            </section>

            {/* 🎨 스타일 섹션 */}
            <section>
              <h2 className="ios-section-title">스타일 (Style)</h2>
              <div className="ios-bento-card">
                <OptionSelect 
                  label="연출 샷 스타일 (다중 선택)" 
                  value={config.shotStyle} 
                  onChange={(v) => handleConfigChange('shotStyle', v)} 
                  options={OPTIONS_DATA.shotStyle} 
                  multiSelect={true}
                  theme="purple"
                />
              </div>
            </section>

            {/* Action Area with Summary Panel */}
            <div className="pt-4 pb-20">
              <div className="ios-option-label mb-2 px-1">현재 선택된 옵션 (Summary)</div>
              <div className="ios-summary-panel">
                <div className="flex flex-wrap">
                  {Object.entries(config).map(([key, val]) => {
                    if (val === "선택안함" || val === "없음" || (Array.isArray(val) && val.length === 0)) return null;
                    if (Array.isArray(val)) {
                      return val.map(v => <span key={v} className="ios-summary-tag">{v}</span>);
                    }
                    return <span key={key} className="ios-summary-tag">{val}</span>;
                  })}
                  {removeText && <span className="ios-summary-tag">텍스트 제거</span>}
                </div>
              </div>

              <button 
                onClick={generatePrompt}
                disabled={isGenerating}
                className="w-full ios-black-btn ios-interact flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ borderRadius: '9999px', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
              >
                <Wand2 className="w-5 h-5 text-white" />
                <span className="text-[17px] font-black">{isGenerating ? 'GENERATING...' : 'GENERATE PROMPT'}</span>
              </button>

              {generatedPrompt && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 space-y-6">
                  <PromptOutput prompt={generatedPrompt} />
                  <div className="ios-bento-card">
                    <div className="flex gap-2">
                      <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Preset name..." className="flex-1 px-4 py-4 bg-[#F2F2F7] rounded-2xl border-none outline-none focus:ring-2 focus:ring-black font-medium text-[15px]" />
                      <button onClick={handleSaveTemplate} className="bg-black text-white px-8 py-4 rounded-2xl flex items-center justify-center ios-interact border-none"><Save className="w-5 h-5" /></button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="library" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
            <div className="flex justify-between items-center px-2 mb-6">
              <h2 className="text-[40px] font-black text-black tracking-tight leading-none mb-1">Library</h2>
              <button 
                onClick={() => setActiveTab('home')}
                className="ios-white-btn ios-interact p-3 flex items-center justify-center rounded-full"
                style={{ padding: '12px' }}
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedTemplates.length === 0 ? (
                <div className="col-span-full py-20 text-center ios-bg-card ios-rounded-2xl ios-shadow flex flex-col items-center justify-center">
                  <LayoutTemplate className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold m-0">Your library is empty</p>
                </div>
              ) : (
                savedTemplates.map(template => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    onLoad={handleLoadTemplate} 
                    onDelete={handleDeleteTemplate} 
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="ios-footer">
        v0.1 · AI Shot Maker
      </footer>
      <div className="h-12"></div>
    </div>
  );
}