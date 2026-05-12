import React, { useState, useEffect } from 'react';
import { 
  Camera, Save, Sparkles, User, Home, Settings, Layers, 
  Wand2, LayoutTemplate, Palette, Zap, Image as ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Modular Components
import ImageUploader from './components/ImageUploader';
import OptionSelect from './components/OptionSelect';
import PromptOutput from './components/PromptOutput';
import TemplateCard from './components/TemplateCard';

// 영문 프롬프트 변환을 위한 매핑 딕셔너리
const DICTIONARY = {
  subjectNum: { "혼자": "a single person", "다수": "a group of people", "없음": "" },
  subjectGender: { "여성": "female", "남성": "male", "혼성": "mixed gender", "선택안함": "" },
  subjectAge: { "10대": "teenager", "20대": "in their 20s", "30대": "in their 30s", "40대": "in their 40s", "중장년": "senior", "선택안함": "" },
  subjectStyle: { "캐주얼": "casual style", "비즈니스": "business style", "스트릿": "streetwear", "미니멀": "minimalist style", "포멀/정장": "formal wear", "선택안함": "" },
  subjectClothesType: { "기본 스커트": "wearing a skirt", "미니스커트": "wearing a mini skirt", "롱스커트": "wearing a long skirt", "긴바지": "wearing long trousers", "반바지": "wearing shorts", "원피스": "wearing a dress", "아웃도어": "wearing outdoor apparel", "스포츠 복장": "wearing sportswear", "선택안함": "" },
  subjectHair: { "긴머리": "with long hair", "짧은머리": "with short hair", "단발": "with a bob cut", "펌": "with permed curly hair", "염색": "with dyed hair", "묶은머리": "with hair tied back", "선택안함": "" },
  subjectRegion: { "한국": "Korean", "일본": "Japanese", "북유럽": "Nordic", "북미": "North American", "선택안함": "" },

  spaceType: { "오피스": "in an office environment", "홈": "in a cozy home", "리테일": "in a retail space", "라운지": "in a lounge", "스튜디오": "in a photo studio", "야외": "outdoor" },
  spaceDetail: { "회의실": "(conference room)", "사무실": "(main workspace)", "중역실": "(executive office)", "오피스 라운지": "(office lounge)", "리빙": "(living room)", "다이닝": "(dining room)", "룸": "(bedroom)", "카페": "(cafe)", "식당": "(restaurant)", "쇼룸": "(showroom)", "단색 배경": "(solid color background)", "인테리어 세트장": "(interior set)", "호텔 라운지": "(hotel lounge)", "공항 라운지": "(airport lounge)", "도심": "(urban city street)", "자연": "(natural landscape)", "테라스": "(outdoor terrace)", "선택안함": "" },

  light: { "자연광": "natural lighting", "시네마틱": "cinematic lighting", "스튜디오 조명": "professional studio lighting", "무드등": "warm mood lighting", "선택안함": "" },
  interiorStyle: { "미드센추리 모던": "mid-century modern interior", "모던 미니멀": "modern minimalist interior", "내추럴 우드": "natural wood interior", "젠 스타일": "zen style interior", "인더스트리얼": "industrial interior", "스칸디나비안": "Scandinavian interior", "선택안함": "" },
  detailFloor: { "밝은 우드 마루": "light wood flooring", "어두운 우드 마루": "dark wood flooring", "테라조 타일": "terrazzo floor tiles", "대리석": "marble floor", "콘크리트": "concrete floor", "조약돌 바닥": "pebble floor", "자갈 바닥": "gravel floor", "선택안함": "" },
  detailWood: { "오크(참나무)": "oak wood elements", "월넛(호두나무)": "walnut wood elements", "자작나무": "birch wood elements", "티크": "teak wood elements", "선택안함": "" },
  detailMetal: { "황동(브라스)": "brass metal accents", "크롬/실버": "chrome metal accents", "무광 블랙": "matte black metal accents", "로즈골드": "rose gold accents", "선택안함": "" },
  detailWall: { "화이트 페인트": "white painted walls", "노출 콘크리트": "exposed concrete walls", "웨인스코팅": "wainscoting walls", "파스텔톤 벽지": "pastel tone wallpaper", "붉은 벽돌": "red brick walls", "선택안함": "" },

  camera: { "정면": "front view", "하이앵글": "high angle shot", "로우앵글": "low angle shot", "아이레벨": "eye level shot", "클로즈업": "close-up shot", "버드아이 뷰": "bird's-eye view", "웜즈아이 뷰": "worm's-eye view", "더치 앵글": "Dutch angle", "초광각": "ultra-wide angle shot", "망원 샷": "telephoto shot", "풀 샷": "full wide shot", "드론 샷": "drone shot", "선택안함": "" },

  styles: {
    "컬러블로킹": "color blocking",
    "네거티브 스페이스": "negative space",
    "하드 섀도우": "hard shadows",
    "톤온톤-모노크로매틱": "tone-on-tone, monochromatic",
    "플랫 레이": "flat lay photography",
    "매크로-디테일": "macro photography, extreme detail",
    "와비사비-어스톤": "wabi-sabi aesthetic, earth tones",
    "모션 캡쳐-동적 연출": "dynamic motion capture, movement",
    "인테리어 잡지 샷(사실적)": "interior design magazine style, highly photorealistic, architectural photography",
    "와이드 건축/공간 샷": "wide architectural interior photography",
    "인테리어 비네트(코너)": "interior vignette, curated corner",
    "라이프스타일 인테리어": "lifestyle interior photography",
    "클로즈업 디테일": "close-up macro detail shot",
    "심도 얕은 샷(아웃포커싱)": "shallow depth of field, blurred background"
  }
};

const OPTIONS_DATA = {
  subjectNum: ["없음", "혼자", "다수"],
  subjectGender: ["선택안함", "여성", "남성", "혼성"],
  subjectAge: ["선택안함", "10대", "20대", "30대", "40대", "중장년"],
  subjectStyle: ["선택안함", "캐주얼", "비즈니스", "스트릿", "미니멀", "포멀/정장"],
  subjectClothesTypeFemale: ["선택안함", "기본 스커트", "미니스커트", "롱스커트", "긴바지", "반바지", "원피스", "아웃도어", "스포츠 복장"],
  subjectClothesTypeMale: ["선택안함", "긴바지", "반바지", "아웃도어", "스포츠 복장"],
  subjectHair: ["선택안함", "긴머리", "짧은머리", "단발", "펌", "염색", "묶은머리"],
  subjectRegion: ["선택안함", "한국", "일본", "북유럽", "북미"],
  spaceType: ["스튜디오", "오피스", "홈", "리테일", "라운지", "야외"],
  light: ["선택안함", "자연광", "시네마틱", "스튜디오 조명", "무드등"],
  interiorStyle: ["선택안함", "미드센추리 모던", "모던 미니멀", "내추럴 우드", "젠 스타일", "인더스트리얼", "스칸디나비안"],
  detailFloor: ["선택안함", "밝은 우드 마루", "어두운 우드 마루", "테라조 타일", "대리석", "콘크리트", "조약돌 바닥", "자갈 바닥"],
  detailWood: ["선택안함", "오크(참나무)", "월넛(호두나무)", "자작나무", "티크"],
  detailMetal: ["선택안함", "황동(브라스)", "크롬/실버", "무광 블랙", "로즈골드"],
  detailWall: ["선택안함", "화이트 페인트", "노출 콘크리트", "웨인스코팅", "파스텔톤 벽지", "붉은 벽돌"],
  camera: ["선택안함", "정면", "하이앵글", "로우앵글", "아이레벨", "클로즈업", "버드아이 뷰", "웜즈아이 뷰", "더치 앵글", "초광각", "망원 샷", "풀 샷", "드론 샷"]
};

const SPACE_DETAILS_MAP = {
  "스튜디오": ["선택안함", "단색 배경", "인테리어 세트장"],
  "오피스": ["선택안함", "사무실", "회의실", "중역실", "오피스 라운지"],
  "홈": ["선택안함", "리빙", "다이닝", "룸"],
  "리테일": ["선택안함", "카페", "식당", "쇼룸"],
  "라운지": ["선택안함", "호텔 라운지", "공항 라운지"],
  "야외": ["선택안함", "도심", "자연", "테라스"]
};

export default function App() {
  const [productDesc, setProductDesc] = useState("");
  const [attachedImage, setAttachedImage] = useState(null);
  const [useDetailMaterial, setUseDetailMaterial] = useState(false);
  const [config, setConfig] = useState({
    subjectNum: "없음",
    subjectGender: "선택안함",
    subjectAge: "선택안함",
    subjectStyle: "선택안함",
    subjectClothesType: "선택안함",
    subjectHair: "선택안함",
    subjectRegion: "선택안함",
    spaceType: "홈",
    spaceDetail: "리빙",
    light: "자연광",
    interiorStyle: "미드센추리 모던",
    detailFloor: "선택안함",
    detailWood: "선택안함",
    detailMetal: "선택안함",
    detailWall: "선택안함",
    camera: "정면",
    noText: true,
    styles: []
  });

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync with Firebase Firestore
  useEffect(() => {
    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedTemplates(templates);
    }, (error) => {
      console.error("Firestore Error:", error);
      // Fallback to localStorage if Firebase fails (e.g. invalid config)
      const saved = localStorage.getItem('prompt_templates');
      if (saved) setSavedTemplates(JSON.parse(saved));
    });

    return () => unsubscribe();
  }, []);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert("템플릿 이름을 입력해주세요.");
      return;
    }
    
    const newTemplate = {
      name: templateName,
      productDesc,
      config,
      prompt: generatedPrompt,
      thumbnailColor: `linear-gradient(135deg, hsl(${Math.random() * 360}, 70%, 50%) 0%, hsl(${Math.random() * 360}, 70%, 30%) 100%)`,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "templates"), newTemplate);
      setTemplateName("");
    } catch (e) {
      console.error("Error adding document: ", e);
      // Fallback to localStorage
      const updated = [...savedTemplates, { ...newTemplate, id: Date.now() }];
      setSavedTemplates(updated);
      localStorage.setItem('prompt_templates', JSON.stringify(updated));
      setTemplateName("");
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteDoc(doc(db, "templates", id));
    } catch (e) {
      console.error("Error deleting document: ", e);
      const updated = savedTemplates.filter(t => t.id !== id);
      setSavedTemplates(updated);
      localStorage.setItem('prompt_templates', JSON.stringify(updated));
    }
  };

  const handleLoadTemplate = (template) => {
    setProductDesc(template.productDesc);
    setConfig(template.config);
    setGeneratedPrompt(template.prompt);
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      if (key === 'spaceType') newConfig.spaceDetail = "선택안함";
      if (key === 'subjectGender' && value !== '여성') {
        const femaleOnly = ["기본 스커트", "미니스커트", "롱스커트", "원피스"];
        if (femaleOnly.includes(newConfig.subjectClothesType)) newConfig.subjectClothesType = "선택안함";
      }
      return newConfig;
    });
  };

  const generatePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let parts = [];

      // 1. Attached Image & Product Context
      if (attachedImage) {
        parts.push(`following the spatial structure and layout of the attached photo`);
      }

      if (productDesc.trim() !== "") {
        parts.push(`high-end interior photography featuring ${productDesc.trim()} as the central focal point`);
      } else {
        parts.push(`professional architectural interior photography of a luxurious space`);
      }

      // 2. Subjects
      if (config.subjectNum !== "없음") {
        let subjectStr = DICTIONARY.subjectNum[config.subjectNum];
        const traits = [];
        if (config.subjectRegion !== "선택안함") traits.push(DICTIONARY.subjectRegion[config.subjectRegion]);
        if (config.subjectAge !== "선택안함") traits.push(DICTIONARY.subjectAge[config.subjectAge]);
        if (config.subjectGender !== "선택안함") traits.push(DICTIONARY.subjectGender[config.subjectGender]);

        if (traits.length > 0) subjectStr += ` (${traits.join(" ")})`;
        if (config.subjectHair !== "선택안함") subjectStr += ` ${DICTIONARY.subjectHair[config.subjectHair]}`;

        const clothes = [];
        if (config.subjectStyle !== "선택안함") clothes.push(DICTIONARY.subjectStyle[config.subjectStyle]);
        if (config.subjectClothesType !== "선택안함") clothes.push(DICTIONARY.subjectClothesType[config.subjectClothesType]);
        if (clothes.length > 0) subjectStr += ` in ${clothes.join(", ")}`;

        parts.push(`expertly staging ${subjectStr} naturally interacting within the environment`);
      }

      // 3. Environment & Styling
      if (config.spaceType !== "선택안함") {
        let spaceStr = DICTIONARY.spaceType[config.spaceType];
        if (config.spaceDetail !== "선택안함") spaceStr += ` ${DICTIONARY.spaceDetail[config.spaceDetail]}`;
        parts.push(spaceStr);
      }

      if (config.interiorStyle !== "선택안함") parts.push(DICTIONARY.interiorStyle[config.interiorStyle]);

      if (useDetailMaterial) {
        const details = [];
        if (config.detailFloor !== "선택안함") details.push(DICTIONARY.detailFloor[config.detailFloor]);
        if (config.detailWood !== "선택안함") details.push(DICTIONARY.detailWood[config.detailWood]);
        if (config.detailMetal !== "선택안함") details.push(DICTIONARY.detailMetal[config.detailMetal]);
        if (config.detailWall !== "선택안함") details.push(DICTIONARY.detailWall[config.detailWall]);
        if (details.length > 0) parts.push(`meticulous details of ${details.join(", ")}`);
      }

      // 4. Lighting & Camera
      if (config.light !== "선택안함") parts.push(`illuminated by ${DICTIONARY.light[config.light]}`);
      if (config.camera !== "선택안함") parts.push(DICTIONARY.camera[config.camera]);

      // 5. Styles & Quality
      if (config.styles.length > 0) {
        parts.push(`Styles: ${config.styles.map(s => DICTIONARY.styles[s]).join(", ")}`);
      }

      parts.push("8k UHD, highly detailed, photorealistic, architectural digest style, cinematic composition, award-winning interior photography");

      if (config.noText) parts.push("textless, no watermark, clean image");

      setGeneratedPrompt(parts.join(", "));
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen selection:bg-orange-500/30 overflow-x-hidden">
      <div className="noise-overlay" />
      
      <div className="max-w-[1600px] mx-auto px-6 py-12 lg:px-12 grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Navigation / Sidebar */}
        <aside className="xl:col-span-1 hidden xl:flex flex-col items-center py-10 glass-panel h-[calc(100vh-6rem)] sticky top-12 gap-10">
          <div className="p-4 accent-gradient rounded-[22px] shadow-2xl shadow-orange-500/40 cursor-pointer hover:scale-110 transition-transform duration-500">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col gap-8 text-zinc-600">
            <Zap className="w-6 h-6 hover:text-orange-500 cursor-pointer transition-all hover:scale-110" />
            <Palette className="w-6 h-6 hover:text-orange-500 cursor-pointer transition-all hover:scale-110" />
            <LayoutTemplate className="w-6 h-6 hover:text-orange-500 cursor-pointer transition-all hover:scale-110" />
            <Settings className="w-6 h-6 hover:text-orange-500 cursor-pointer transition-all hover:scale-110" />
          </div>
          <div className="mt-auto pb-4">
             <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-500">GM</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="xl:col-span-8 space-y-12 animate-fade-in">
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
               <h1 className="text-5xl md:text-6xl font-bold tracking-tighter gradient-text">AI Shot Maker</h1>
               <span className="text-[10px] font-bold text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full uppercase tracking-widest bg-orange-500/5">PRO v2.5</span>
            </div>
            <p className="text-zinc-500 font-medium max-w-xl text-lg leading-relaxed">
              Craft high-end architectural and product photography prompts. 
              Built for <span className="text-zinc-300">Midjourney & Stable Diffusion</span>.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-10">
            {/* Input Sections */}
            <section className="glass-panel p-10 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Section: Base Context */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Core Concept</h3>
                  </div>
                  
                  <div className="control-group">
                    <ImageUploader onImageSelect={setAttachedImage} />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">Product Context</label>
                    <textarea
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      placeholder="e.g., a minimalist concrete dining table with linen runner"
                      className="w-full p-5 glass-input h-32 resize-none text-sm placeholder:text-zinc-700 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Section: Subjects */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Human Staging</h3>
                  </div>
                  
                  <div className="space-y-8 p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <OptionSelect label="Count" value={config.subjectNum} onChange={(v) => handleConfigChange('subjectNum', v)} options={OPTIONS_DATA.subjectNum} />
                    
                    <AnimatePresence>
                      {config.subjectNum !== "없음" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 pt-4 border-t border-white/5"
                        >
                          <div className="grid grid-cols-2 gap-6">
                            <OptionSelect label="Gender" value={config.subjectGender} onChange={(v) => handleConfigChange('subjectGender', v)} options={OPTIONS_DATA.subjectGender} />
                            <OptionSelect label="Age" value={config.subjectAge} onChange={(v) => handleConfigChange('subjectAge', v)} options={OPTIONS_DATA.subjectAge} />
                          </div>
                          <OptionSelect label="Region" value={config.subjectRegion} onChange={(v) => handleConfigChange('subjectRegion', v)} options={OPTIONS_DATA.subjectRegion} />
                          <OptionSelect label="Hair Style" value={config.subjectHair} onChange={(v) => handleConfigChange('subjectHair', v)} options={OPTIONS_DATA.subjectHair} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Section: Environment */}
              <div className="pt-10 border-t border-white/5 space-y-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <Home className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Environment & Lighting</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="control-group">
                      <OptionSelect label="Space Type" value={config.spaceType} onChange={(v) => handleConfigChange('spaceType', v)} options={OPTIONS_DATA.spaceType} />
                      <OptionSelect label="Location Detail" value={config.spaceDetail} onChange={(v) => handleConfigChange('spaceDetail', v)} options={SPACE_DETAILS_MAP[config.spaceType] || ["선택안함"]} />
                   </div>
                   <div className="control-group">
                      <OptionSelect label="Interior Aesthetic" value={config.interiorStyle} onChange={(v) => handleConfigChange('interiorStyle', v)} options={OPTIONS_DATA.interiorStyle} />
                      <OptionSelect label="Lighting Mood" value={config.light} onChange={(v) => handleConfigChange('light', v)} options={OPTIONS_DATA.light} />
                   </div>
                </div>

                <div className="p-8 rounded-[32px] bg-gradient-to-br from-zinc-900/50 to-black/50 border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <label className="flex items-center gap-3 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                      <Layers className="w-4 h-4 text-orange-500" /> Advanced Material Details
                    </label>
                    <button 
                      onClick={() => setUseDetailMaterial(!useDetailMaterial)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 ${useDetailMaterial ? 'bg-orange-500' : 'bg-zinc-800'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-transform duration-500 ${useDetailMaterial ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {useDetailMaterial && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                          <OptionSelect label="Flooring" value={config.detailFloor} onChange={(v) => handleConfigChange('detailFloor', v)} options={OPTIONS_DATA.detailFloor} />
                          <OptionSelect label="Woodwork" value={config.detailWood} onChange={(v) => handleConfigChange('detailWood', v)} options={OPTIONS_DATA.detailWood} />
                          <OptionSelect label="Metal Accents" value={config.detailMetal} onChange={(v) => handleConfigChange('detailMetal', v)} options={OPTIONS_DATA.detailMetal} />
                          <OptionSelect label="Wall Finish" value={config.detailWall} onChange={(v) => handleConfigChange('detailWall', v)} options={OPTIONS_DATA.detailWall} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Section: Styles */}
              <div className="pt-10 border-t border-white/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-pink-500/10 rounded-xl border border-pink-500/20">
                    <Palette className="w-4 h-4 text-pink-400" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200 tracking-tight">Visual Aesthetic Styles</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(DICTIONARY.styles).map(style => {
                    const isSelected = config.styles.includes(style);
                    return (
                      <button
                        key={style}
                        onClick={() => {
                          setConfig(prev => ({
                            ...prev,
                            styles: isSelected 
                              ? prev.styles.filter(s => s !== style)
                              : [...prev.styles, style]
                          }));
                        }}
                        className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold tracking-tight transition-all border ${
                          isSelected 
                            ? 'bg-orange-500 border-transparent text-white shadow-xl shadow-orange-500/30' 
                            : 'bg-white/[0.03] border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Right Sidebar: Controls & Library */}
        <aside className="xl:col-span-3 space-y-8">
          <div className="glass-panel p-8 sticky top-12 space-y-8">
            <div className="space-y-4">
               <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">Shot Control</label>
               <OptionSelect label="Camera Angle" value={config.camera} onChange={(v) => handleConfigChange('camera', v)} options={OPTIONS_DATA.camera} />
            </div>

            <button
              onClick={generatePrompt}
              disabled={isGenerating}
              className="w-full accent-gradient text-white text-sm font-bold py-5 px-8 rounded-3xl shadow-2xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Generate Prompt
            </button>

            <PromptOutput prompt={generatedPrompt} />

            <AnimatePresence>
              {generatedPrompt && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-8 border-t border-white/5 space-y-5"
                >
                  <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase px-1">Library Management</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Preset name..."
                      className="flex-1 p-4 glass-input text-sm"
                    />
                    <button
                      onClick={handleSaveTemplate}
                      className="p-4 bg-zinc-900 border border-white/5 hover:bg-orange-500 hover:text-white rounded-2xl transition-all shadow-lg"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2">
                  <LayoutTemplate className="w-3 h-3" /> Preset Library
                </label>
                <span className="text-[9px] font-mono font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">{savedTemplates.length}</span>
              </div>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-[32px] bg-white/[0.01]">
                    <ImageIcon className="w-8 h-8 text-zinc-800 mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Library Empty</p>
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
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}