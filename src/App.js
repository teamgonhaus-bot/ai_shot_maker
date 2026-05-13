import React, { useState, useEffect } from 'react';
import { 
  Save, Wand2, LayoutTemplate, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Modular Components
import OptionSelect from './components/OptionSelect';
import PromptOutput from './components/PromptOutput';
import TemplateCard from './components/TemplateCard';

const DICTIONARY = {
  subjectNum: { "없음": "", "1명": "a single person", "2명": "two people", "3명 이상": "a group of people" },
  subjectGender: { "선택안함": "", "남성": "male", "여성": "female", "중성적": "androgynous" },
  subjectAge: { "선택안함": "", "20대": "in their 20s", "30대": "in their 30s", "40대": "in their 40s", "50대 이상": "middle-aged" },
  subjectRegion: { "선택안함": "", "한국인": "Korean", "동양인": "Asian", "서양인": "Caucasian", "흑인": "Black", "히스패닉": "Hispanic" },
  subjectHair: { "선택안함": "", "긴 생머리": "with long straight hair", "단발머리": "with short bob hair", "포니테일": "with a ponytail", "포마드": "with sleek pomade hair", "자연스러운 스타일": "with natural messy hair" },
  spaceType: { "선택안함": "", "거실": "a spacious modern living room", "침실": "a cozy minimalist bedroom", "주방": "a high-end designer kitchen", "욕실": "a luxury spa-like bathroom", "오피스": "a professional home office", "카페/상업공간": "a trendy minimalist cafe interior" },
  spaceDetail: { "선택안함": "", "미니멀": "with minimalist aesthetics", "럭셔리": "with luxury high-end finishes", "인더스트리얼": "with industrial raw textures", "내추럴": "with natural organic elements", "모던": "with clean modern lines" },
  interiorStyle: { "선택안함": "", "화이트 & 우드": "white and warm wood palette", "올 블랙": "monochromatic all-black interior", "콘크리트 & 메탈": "raw concrete and brushed metal", "베이지 톤": "warm beige and cream tones", "파스텔": "soft pastel color palette" },
  light: { "선택안함": "", "자연광": "natural sunlight streaming through windows", "골든아워": "warm golden hour lighting", "스튜디오 조명": "professional studio softbox lighting", "야간/네온": "moody night lighting with neon accents", "안개/몽환": "dreamy misty lighting" },
  camera: { "선택안함": "", "아이레벨": "eye-level shot", "하이앵글": "high-angle perspective", "로우앵글": "low-angle heroic shot", "광각": "wide-angle architectural shot", "클로즈업": "macro close-up shot" },
  detailFloor: { "선택안함": "", "원목마루": "polished oak wood flooring", "대리석": "premium white marble floor", "테라조": "modern terrazzo flooring", "노출콘크리트": "raw polished concrete floor" },
  detailWood: { "선택안함": "", "월넛": "dark walnut wood textures", "오크": "light natural oak wood", "티크": "rich teak wood details" },
  detailMetal: { "선택안함": "", "브러쉬드 골드": "brushed gold metal accents", "실버/크롬": "polished chrome details", "블랙 스틸": "matte black steel frames" },
  detailWall: { "선택안함": "", "템바보드": "vertical tambour wood panels", "아트월": "stone texture art wall", "페인트벽": "clean matte painted walls" }
};

const OPTIONS_DATA = {
  subjectNum: ["없음", "1명", "2명", "3명 이상"],
  subjectGender: ["선택안함", "남성", "여성", "중성적"],
  subjectAge: ["선택안함", "20대", "30대", "40대", "50대 이상"],
  subjectRegion: ["선택안함", "한국인", "동양인", "서양인", "흑인"],
  subjectHair: ["선택안함", "긴 생머리", "단발머리", "포니테일", "포마드", "자연스러운 스타일"],
  spaceType: ["선택안함", "거실", "침실", "주방", "욕실", "오피스", "카페/상업공간"],
  interiorStyle: ["선택안함", "화이트 & 우드", "올 블랙", "콘크리트 & 메탈", "베이지 톤", "파스텔"],
  light: ["선택안함", "자연광", "골든아워", "스튜디오 조명", "야간/네온", "안개/몽환"],
  camera: ["선택안함", "아이레벨", "하이앵글", "로우앵글", "광각", "클로즈업"],
  detailFloor: ["선택안함", "원목마루", "대리석", "테라조", "노출콘크리트"],
  detailWood: ["선택안함", "월넛", "오크", "티크"],
  detailMetal: ["선택안함", "브러쉬드 골드", "실버/크롬", "블랙 스틸"],
  detailWall: ["선택안함", "템바보드", "아트월", "페인트벽"]
};

const SPACE_DETAILS_MAP = {
  "거실": ["선택안함", "미니멀", "럭셔리", "내추럴", "모던"],
  "침실": ["선택안함", "아늑한", "호텔식", "다락방"],
  "주방": ["선택안함", "아일랜드형", "오픈형", "카페테리아"],
  "욕실": ["선택안함", "스파형", "건식", "대리석"],
  "오피스": ["선택안함", "서재형", "공유오피스", "창조적"],
  "카페/상업공간": ["선택안함", "쇼룸", "부티크", "팝업스토어"]
};

export default function App() {
  const [productDesc, setProductDesc] = useState("");
  const [config, setConfig] = useState({
    subjectNum: "없음",
    subjectGender: "선택안함",
    subjectAge: "선택안함",
    subjectRegion: "선택안함",
    subjectHair: "선택안함",
    spaceType: "선택안함",
    spaceDetail: "선택안함",
    interiorStyle: "선택안함",
    light: "선택안함",
    camera: "선택안함",
    detailFloor: "선택안함",
    detailWood: "선택안함",
    detailMetal: "선택안함",
    detailWall: "선택안함"
  });
  const [useDetailMaterial, setUseDetailMaterial] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedTemplates(templates);
    });
    return () => unsubscribe();
  }, []);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !generatedPrompt) return;
    try {
      await addDoc(collection(db, "templates"), {
        name: templateName,
        prompt: generatedPrompt,
        config: config,
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
    setGeneratedPrompt(template.prompt);
    setActiveTab('home');
  };

  const generatePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const parts = [];
      
      let subjectStr = productDesc || "a high-end product";
      if (config.subjectNum !== "없음") {
        const traits = [];
        if (config.subjectAge !== "선택안함") traits.push(DICTIONARY.subjectAge[config.subjectAge]);
        if (config.subjectGender !== "선택안함") traits.push(DICTIONARY.subjectGender[config.subjectGender]);
        if (config.subjectRegion !== "선택안함") traits.push(DICTIONARY.subjectRegion[config.subjectRegion]);
        
        let humanStr = DICTIONARY.subjectNum[config.subjectNum];
        if (traits.length > 0) humanStr += ` (${traits.join(", ")})`;
        if (config.subjectHair !== "선택안함") humanStr += ` ${DICTIONARY.subjectHair[config.subjectHair]}`;
        
        parts.push(`featuring ${subjectStr} with ${humanStr} posing naturally`);
      } else {
        parts.push(`professional architectural photography of ${subjectStr}`);
      }

      if (config.spaceType !== "선택안함") {
        let envStr = DICTIONARY.spaceType[config.spaceType];
        if (config.spaceDetail !== "선택안함") envStr += `, ${DICTIONARY.spaceDetail[config.spaceDetail]}`;
        parts.push(`set in ${envStr}`);
      }

      if (config.interiorStyle !== "선택안함") parts.push(`designed with ${DICTIONARY.interiorStyle[config.interiorStyle]}`);

      if (useDetailMaterial) {
        const materials = [];
        if (config.detailFloor !== "선택안함") materials.push(DICTIONARY.detailFloor[config.detailFloor]);
        if (config.detailWood !== "선택안함") materials.push(DICTIONARY.detailWood[config.detailWood]);
        if (config.detailMetal !== "선택안함") materials.push(DICTIONARY.detailMetal[config.detailMetal]);
        if (config.detailWall !== "선택안함") materials.push(DICTIONARY.detailWall[config.detailWall]);
        if (materials.length > 0) parts.push(`highlighting ${materials.join(", ")}`);
      }

      if (config.light !== "선택안함") parts.push(`illuminated by ${DICTIONARY.light[config.light]}`);
      if (config.camera !== "선택안함") parts.push(`shot from ${DICTIONARY.camera[config.camera]}`);

      parts.push("8k resolution, photorealistic, cinematic lighting, architectural digest style, highly detailed textures");

      setGeneratedPrompt(parts.join(", "));
      setIsGenerating(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 800);
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 className="text-3xl font-black text-black tracking-tight leading-none m-0">Create</h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest m-0">AI Prompt Dashboard</p>
        </div>
        
        {/* Navigation Pills */}
        <div className="flex gap-2 bg-gray-200/50 p-1 rounded-full">
          <button 
            className={`ios-interact ${activeTab === 'home' ? 'ios-black-pill' : 'ios-white-pill bg-transparent shadow-none text-gray-500 hover:bg-white/50'}`}
            onClick={() => setActiveTab('home')}
          >
            Start New
          </button>
          <button 
            className={`ios-interact ${activeTab === 'library' ? 'ios-black-pill' : 'ios-white-pill bg-transparent shadow-none text-gray-500 hover:bg-white/50'}`}
            onClick={() => setActiveTab('library')}
          >
            Library
          </button>
        </div>
      </header>



      <AnimatePresence mode="wait">
        {activeTab === 'home' ? (
          <motion.div 
            key="home"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Core Subject Card */}
            <section className="ios-bento-card">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Main Concept</p>
                  <textarea
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder="Describe your scene (e.g., minimalist coffee table)"
                    className="w-full p-4 ios-bg-main ios-rounded-lg border-none outline-none focus:ring-2 focus:ring-black text-[14px] font-semibold transition-all"
                    rows={3}
                  />
                </div>
                <OptionSelect label="Number of People" value={config.subjectNum} onChange={(v) => handleConfigChange('subjectNum', v)} options={OPTIONS_DATA.subjectNum} />
              </div>
            </section>

            {/* Human Staging Card */}
            {config.subjectNum !== "없음" && (
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ios-bento-card"
              >
                <div className="space-y-4">
                  <div className="grid-cols-2">
                    <OptionSelect label="Gender" value={config.subjectGender} onChange={(v) => handleConfigChange('subjectGender', v)} options={OPTIONS_DATA.subjectGender} />
                    <OptionSelect label="Age Group" value={config.subjectAge} onChange={(v) => handleConfigChange('subjectAge', v)} options={OPTIONS_DATA.subjectAge} />
                  </div>
                  <OptionSelect label="Regional Style" value={config.subjectRegion} onChange={(v) => handleConfigChange('subjectRegion', v)} options={OPTIONS_DATA.subjectRegion} />
                  <OptionSelect label="Hair Style" value={config.subjectHair} onChange={(v) => handleConfigChange('subjectHair', v)} options={OPTIONS_DATA.subjectHair} />
                </div>
              </motion.section>
            )}

            {/* Environment Card */}
            <section className="ios-bento-card">
              <div className="space-y-4">
                <div className="grid-cols-2">
                  <OptionSelect label="Space Type" value={config.spaceType} onChange={(v) => handleConfigChange('spaceType', v)} options={OPTIONS_DATA.spaceType} />
                  <OptionSelect label="Detail" value={config.spaceDetail} onChange={(v) => handleConfigChange('spaceDetail', v)} options={SPACE_DETAILS_MAP[config.spaceType] || ["선택안함"]} />
                </div>
                <div className="grid-cols-2">
                  <OptionSelect label="Style" value={config.interiorStyle} onChange={(v) => handleConfigChange('interiorStyle', v)} options={OPTIONS_DATA.interiorStyle} />
                  <OptionSelect label="Lighting" value={config.light} onChange={(v) => handleConfigChange('light', v)} options={OPTIONS_DATA.light} />
                </div>

                <div className="p-4 ios-bg-main ios-rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Material Details</p>
                    <button 
                      onClick={() => setUseDetailMaterial(!useDetailMaterial)}
                      className={`relative w-12 h-6 ios-rounded-pill transition-colors ${useDetailMaterial ? 'ios-bg-black' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 ios-bg-card ios-rounded-pill transition-transform ${useDetailMaterial ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {useDetailMaterial && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid-cols-2 pt-2"
                      >
                        <OptionSelect label="Flooring" value={config.detailFloor} onChange={(v) => handleConfigChange('detailFloor', v)} options={OPTIONS_DATA.detailFloor} />
                        <OptionSelect label="Woodwork" value={config.detailWood} onChange={(v) => handleConfigChange('detailWood', v)} options={OPTIONS_DATA.detailWood} />
                        <OptionSelect label="Metal" value={config.detailMetal} onChange={(v) => handleConfigChange('detailMetal', v)} options={OPTIONS_DATA.detailMetal} />
                        <OptionSelect label="Wall" value={config.detailWall} onChange={(v) => handleConfigChange('detailWall', v)} options={OPTIONS_DATA.detailWall} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* Status Window */}
            <section className="ios-black-btn w-full mb-4">
              <div className="flex flex-wrap gap-2 text-[13px] font-semibold">
                {Object.entries(config).filter(([k, v]) => v !== "선택안함" && v !== "없음").map(([k, v]) => (
                  <span key={k} className="px-3 py-1 bg-white/20 ios-rounded-pill text-white">
                    {v}
                  </span>
                ))}
                {productDesc && (
                  <span className="px-3 py-1 bg-white/20 ios-rounded-pill text-white">
                    "{productDesc}"
                  </span>
                )}
                {Object.values(config).every(v => v === "선택안함" || v === "없음") && !productDesc && (
                  <span className="text-gray-400 text-sm">No options selected.</span>
                )}
              </div>
            </section>

            {/* Final Action Button (Bento Box) */}
            <div className="mb-8">
              <button 
                onClick={generatePrompt}
                disabled={isGenerating}
                className="w-full ios-black-btn ios-interact flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5 text-white" />
                <span className="text-[16px] font-black">{isGenerating ? 'GENERATING...' : 'GENERATE PROMPT'}</span>
              </button>
            </div>

            {/* Result Section */}
            {generatedPrompt && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <PromptOutput prompt={generatedPrompt} />
                
                <div className="ios-bento-card mt-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter preset name..."
                      className="flex-1 px-4 py-3 ios-bg-main ios-rounded-lg border-none outline-none focus:ring-2 focus:ring-black font-semibold text-[14px]"
                    />
                    <button
                      onClick={handleSaveTemplate}
                      className="ios-black-btn ios-interact px-6 py-3"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="library"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
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

      <div className="h-12"></div>
    </div>
  );
}