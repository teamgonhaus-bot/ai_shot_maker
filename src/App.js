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
  const [attachedImage, setAttachedImage] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");

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
        thumbnailColor: `hsl(${Math.random() * 360}, 70%, 60%)`
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
  };

  const generatePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const parts = [];
      
      // 1. Core Subject
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

      // 2. Environment
      if (config.spaceType !== "선택안함") {
        let envStr = DICTIONARY.spaceType[config.spaceType];
        if (config.spaceDetail !== "선택안함") envStr += `, ${DICTIONARY.spaceDetail[config.spaceDetail]}`;
        parts.push(`set in ${envStr}`);
      }

      if (config.interiorStyle !== "선택안함") parts.push(`designed with ${DICTIONARY.interiorStyle[config.interiorStyle]}`);

      // 3. Materials
      if (useDetailMaterial) {
        const materials = [];
        if (config.detailFloor !== "선택안함") materials.push(DICTIONARY.detailFloor[config.detailFloor]);
        if (config.detailWood !== "선택안함") materials.push(DICTIONARY.detailWood[config.detailWood]);
        if (config.detailMetal !== "선택안함") materials.push(DICTIONARY.detailMetal[config.detailMetal]);
        if (config.detailWall !== "선택안함") materials.push(DICTIONARY.detailWall[config.detailWall]);
        if (materials.length > 0) parts.push(`highlighting ${materials.join(", ")}`);
      }

      // 4. Lighting & Camera
      if (config.light !== "선택안함") parts.push(`illuminated by ${DICTIONARY.light[config.light]}`);
      if (config.camera !== "선택안함") parts.push(`shot from ${DICTIONARY.camera[config.camera]}`);

      parts.push("8k resolution, photorealistic, cinematic lighting, architectural digest style, highly detailed textures");

      setGeneratedPrompt(parts.join(", "));
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="min-h-screen selection:bg-orange-500/30 overflow-x-hidden pb-24 xl:pb-0">
      <div className="app-container">
        <div className="main-grid">
          
          {/* Sidebar (Web Only) */}
          <aside className="hidden xl:flex sidebar-web sticky top-6">
            <div className="p-4 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/30 cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col gap-6 text-slate-400 mt-8">
              <Zap className="w-6 h-6 hover:text-orange-500 cursor-pointer transition-all" />
              <Palette className="w-6 h-6 hover:text-orange-500 cursor-pointer transition-all" />
              <LayoutTemplate className="w-6 h-6 hover:text-orange-500 cursor-pointer transition-all" />
              <Settings className="w-6 h-6 hover:text-orange-500 cursor-pointer transition-all" />
            </div>
          </aside>

          {/* Mobile Bottom Navigation */}
          <nav className="mobile-bottom-nav">
            <Camera className="w-6 h-6 text-orange-500" />
            <Zap className="w-6 h-6 text-slate-400" />
            <LayoutTemplate className="w-6 h-6 text-slate-400" />
            <User className="w-6 h-6 text-slate-400" />
          </nav>

          {/* Main Content */}
          <main className="space-y-8 animate-slide-up">
            <header className="px-2">
              <h1 className="heading-primary">AI Shot Maker</h1>
              <p className="text-slate-500 font-semibold text-lg max-w-lg">
                Create high-end architectural and product photography prompts. <span className="text-slate-900">Mobile & Web optimized.</span>
              </p>
            </header>

            <div className="space-y-6">
              {/* Core Concept Section */}
              <section className="section-card theme-core">
                <div className="section-header">
                  <div className="icon-box">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="heading-section">Core Concept</h3>
                </div>

                <div className="space-y-6">
                  <ImageUploader onImageSelect={setAttachedImage} />
                  <div className="space-y-2">
                    <label className="label-caps">Scene Description</label>
                    <textarea
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      placeholder="What are we shooting today? Describe the product or main subject..."
                      className="custom-input h-32 resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Human Staging Section */}
              <section className="section-card theme-human">
                <div className="section-header">
                  <div className="icon-box">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="heading-section">Human Staging</h3>
                </div>
                
                <div className="space-y-6">
                  <OptionSelect label="Presence" value={config.subjectNum} onChange={(v) => handleConfigChange('subjectNum', v)} options={OPTIONS_DATA.subjectNum} />
                  
                  <AnimatePresence>
                    {config.subjectNum !== "없음" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 pt-6 border-t border-slate-100"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <OptionSelect label="Gender" value={config.subjectGender} onChange={(v) => handleConfigChange('subjectGender', v)} options={OPTIONS_DATA.subjectGender} />
                          <OptionSelect label="Age" value={config.subjectAge} onChange={(v) => handleConfigChange('subjectAge', v)} options={OPTIONS_DATA.subjectAge} />
                        </div>
                        <OptionSelect label="Regional Aesthetic" value={config.subjectRegion} onChange={(v) => handleConfigChange('subjectRegion', v)} options={OPTIONS_DATA.subjectRegion} />
                        <OptionSelect label="Hair Style" value={config.subjectHair} onChange={(v) => handleConfigChange('subjectHair', v)} options={OPTIONS_DATA.subjectHair} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Environment Section */}
              <section className="section-card theme-env">
                <div className="section-header">
                  <div className="icon-box">
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="heading-section">Environment</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OptionSelect label="Space Type" value={config.spaceType} onChange={(v) => handleConfigChange('spaceType', v)} options={OPTIONS_DATA.spaceType} />
                    <OptionSelect label="Detail" value={config.spaceDetail} onChange={(v) => handleConfigChange('spaceDetail', v)} options={SPACE_DETAILS_MAP[config.spaceType] || ["선택안함"]} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OptionSelect label="Interior Style" value={config.interiorStyle} onChange={(v) => handleConfigChange('interiorStyle', v)} options={OPTIONS_DATA.interiorStyle} />
                    <OptionSelect label="Lighting" value={config.light} onChange={(v) => handleConfigChange('light', v)} options={OPTIONS_DATA.light} />
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <label className="flex items-center gap-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
                        <Layers className="w-4 h-4 text-purple-500" /> Detailed Materials
                      </label>
                      <button 
                        onClick={() => setUseDetailMaterial(!useDetailMaterial)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${useDetailMaterial ? 'bg-purple-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${useDetailMaterial ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {useDetailMaterial && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2"
                        >
                          <OptionSelect label="Floor" value={config.detailFloor} onChange={(v) => handleConfigChange('detailFloor', v)} options={OPTIONS_DATA.detailFloor} />
                          <OptionSelect label="Wood" value={config.detailWood} onChange={(v) => handleConfigChange('detailWood', v)} options={OPTIONS_DATA.detailWood} />
                          <OptionSelect label="Metal" value={config.detailMetal} onChange={(v) => handleConfigChange('detailMetal', v)} options={OPTIONS_DATA.detailMetal} />
                          <OptionSelect label="Wall" value={config.detailWall} onChange={(v) => handleConfigChange('detailWall', v)} options={OPTIONS_DATA.detailWall} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* Right Sidebar: Controls & Library */}
          <aside className="space-y-6">
            <div className="section-card theme-camera sticky top-6">
              <div className="section-header">
                <div className="icon-box">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="heading-section">Controls</h3>
              </div>

              <div className="space-y-6">
                <OptionSelect label="Shot Angle" value={config.camera} onChange={(v) => handleConfigChange('camera', v)} options={OPTIONS_DATA.camera} />
                
                <button
                  onClick={generatePrompt}
                  disabled={isGenerating}
                  className="w-full bg-slate-900 text-white font-bold py-5 px-8 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-3 disabled:opacity-50"
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
                      className="pt-6 border-t border-slate-100 space-y-4"
                    >
                      <label className="label-caps">Save to Library</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Preset name..."
                          className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={handleSaveTemplate}
                          className="p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="label-caps">Preset Library</label>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{savedTemplates.length}</span>
                  </div>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {savedTemplates.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-50 rounded-2xl">
                        <ImageIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Library Empty</p>
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}