import React, { useState, useEffect } from 'react';
import {
  Wand2, LayoutTemplate, X, Image as ImageIcon, Menu, Settings, LogIn, LogOut, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InferenceClient } from "@huggingface/inference";
import { db, auth } from './firebase';
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';

// Modular Components
import OptionSelect from './components/OptionSelect';
import IOSToggle from './components/IOSToggle';
import PromptOutput from './components/PromptOutput';
import TemplateCard from './components/TemplateCard';

/**
 * [ROLE: AI/React Senior Engineer]
 * Face Distortion (얼굴 일그러짐) 방지 고품질 렌더링 프롬프트 헬퍼
 */
const enhancePrompt = (prompt) => {
  const qualitySuffix = ", highly detailed face, sharp focus, 8k resolution, perfect symmetry, masterpiece, photorealistic, intricate facial features";
  return `${prompt}${qualitySuffix}`;
};

const DICTIONARY = {
  subjectNum: { "없음": "", "혼자": "a single person", "다수": "a group of people" },
  subjectGender: { "선택안함": "", "여성": "female", "남성": "male", "혼성": "mixed gender" },
  subjectAge: { "선택안함": "", "10대": "teenager", "20대": "in their 20s", "30대": "in their 30s", "40대": "in their 40s", "중장년": "middle-aged" },
  subjectRegion: { "선택안함": "", "한국": "Korean", "일본": "Japanese", "북유럽": "Northern European", "북미": "North American" },
  subjectAction: { "선택안함": "", "기본": "posing naturally", "차분함": "with a calm demeanor", "활발함": "with energetic and active movement", "공간에 어울리게": "interacting naturally with the surrounding space" },
  subjectClothesStyle: { "선택안함": "", "캐주얼": "casual style", "비즈니스": "business style", "스트릿": "streetwear style", "미니멀": "minimalist style", "포멀/정장": "formal suit style" },
  subjectClothesTop: {
    "선택안함": "", "반팔티": "wearing a short sleeve t-shirt", "긴팔티": "wearing a long sleeve t-shirt", "자켓": "wearing a jacket", "아우터": "wearing outerwear", "원피스": "wearing a dress", "스포츠 복장": "wearing sportswear", "아웃도어": "wearing outdoor apparel"
  },
  subjectClothesBottom: {
    "선택안함": "", "기본 스커트": "with a basic skirt", "미니스커트": "with a miniskirt", "롱스커트": "with a long skirt", "긴바지": "with long pants", "반바지": "with shorts"
  },
  subjectHair: { "선택안함": "", "긴머리": "with long hair", "짧은머리": "with short hair", "단발": "with bob hair", "펌": "with permed hair", "염색": "with dyed hair", "묶은머리": "with tied hair" },

  spaceType: { "스튜디오": "a professional studio environment", "오피스": "a modern office space", "홈": "a cozy home interior", "리테일": "a retail commercial space", "라운지": "a luxury lounge area", "야외": "an outdoor setting" },
  spaceDetail: {
    "단색 배경": "with a solid color background", "인테리어 세트장": "within a designed interior set", "그라데이션 배경": "with a gradient background", "쇼케이스": "in a showcase display area", "크로마키 그린 배경": "with a chroma key green screen background",
    "사무실": "in a standard office setup", "회의실": "in a formal meeting room", "중역실": "in an executive office suite", "오피스 라운지": "in a relaxed office lounge", "트레이닝룸": "in a training or lecture room", "공유오피스": "in a modern coworking space",
    "리빙": "in a living room area", "다이닝": "in a dining room setting", "룸": "in a private room", "워크룸": "in a dedicated workroom or study", "베드룸": "in a comfortable bedroom setting", "테라스": "on a scenic terrace",
    "카페": "in a trendy cafe", "식당": "in a modern restaurant", "쇼룸": "in a premium showroom", "로비": "in a grand lobby area", "쇼핑몰": "in a bustling shopping mall", "박람회": "at a professional exhibition or fair", "갤러리": "in a minimalist art gallery", "도서관": "in a quiet library environment", "강의실": "in a modern classroom",
    "호텔 라운지": "in a luxury hotel lounge", "공항 라운지": "in a premium airport lounge", "쇼핑몰라운지": "in a shopping mall lounge area", "쇼케이스 라운지": "in a showcase lounge area",
    "도심": "in a bustling city urban environment", "자연": "surrounded by natural scenery", "공원": "in a public park", "강가": "by a scenic riverside", "쇼핑가": "on a busy shopping street", "힙한곳": "in a trendy, hip neighborhood"
  },
  detailWall: { "화이트 페인트": "clean white painted walls", "노출 콘크리트": "exposed raw concrete walls", "웨인스코팅": "elegant wainscoted walls", "파스텔톤 벽지": "soft pastel wallpaper", "붉은 벽돌": "rustic red brick walls", "세라믹타일": "ceramic tiled walls", "패널": "paneled walls", "템바보드": "tambour board walls", "원목패널": "solid wood paneled walls", "스틸패널": "steel paneled walls", "스톤패널": "stone paneled walls" },
  interiorStyle: { "선택안함": "", "미드센추리 모던": "mid-century modern style", "모던 미니멀": "modern minimal style", "내추럴 우드": "natural wood interior style", "젠 스타일": "Zen-inspired style", "인더스트리얼": "industrial style", "스칸디나비안": "Scandinavian style", "플랜테리어": "planterior style with many indoor plants" },
  light: { "선택안함": "", "자연광": "natural sunlight", "시네마틱": "cinematic dramatic lighting", "스튜디오 조명": "professional studio softbox lighting", "스포트라이트 조명": "focused spotlight lighting", "무드등": "soft mood lighting" },

  detailFloor: { "밝은 우드 마루": "light wood flooring", "어두운 우드 마루": "dark walnut wood flooring", "테라조 타일": "modern terrazzo tile floor", "대리석": "premium marble flooring", "콘크리트": "polished concrete floor", "조약돌 바닥": "pebble stone floor", "자갈 바닥": "gravel floor", "카펫": "with cozy carpet texture", "포세린타일": "with polished porcelain tiles", "에폭시": "with industrial epoxy flooring" },
  detailWood: { "오크(참나무)": "natural oak wood textures", "월넛(호두나무)": "rich walnut wood details", "자작나무": "birch wood accents", "티크": "premium teak wood", "애쉬": "with natural ash wood grain", "마호가니": "with rich mahogany wood finish", "미송": "with clean pine wood textures", "OBS": "with rugged OSB textures", "합판": "with minimalist plywood details" },
  detailMetal: { "황동(브라스)": "brushed brass metal points", "크롬/실버": "polished chrome silver accents", "무광 블랙": "matte black metal frames", "유광 블랙": "with polished glossy black metal", "로즈골드": "elegant rose gold details" },

  copySpace: { "선택안함": "", "좌측 여백": "with ample empty copy space on the left side", "우측 여백": "with ample empty copy space on the right side" },
  cameraAngle: { "선택안함": "", "정면": "frontal shot", "미디움 샷": "medium shot", "하이앵글": "high-angle shot", "로우앵글": "low-angle shot", "아이레벨": "eye-level shot", "클로즈업": "close-up shot", "익스트림 클로즈업": "extreme close-up shot", "버드아이 뷰": "bird's eye view", "웜즈아이 뷰": "worm's eye view", "더치 앵글": "dutch angle shot", "초광각": "ultra-wide angle shot", "망원 샷": "telephoto lens shot", "풀 샷": "full body shot", "드론 샷": "aerial drone shot" },
  shotStyle: {
    "컬러블로킹": "color blocking aesthetic", "네거티브 스페이스": "negative space composition", "하드 섀도우": "hard shadows",
    "톤온톤-모노크로매틱": "tone-on-tone monochromatic palette", "플랫 레이": "flat lay perspective", "매크로-디테일": "macro detail shot",
    "와비사비-어스톤": "wabi-sabi earth tone aesthetic", "모션 캡쳐-동적 연출": "motion capture dynamic pose",
    "인테리어 잡지 샷(사실적)": "realistic interior magazine photography", "와이드 건축/공간 샷": "wide architectural space shot",
    "인테리어 비네트(코너)": "interior vignette corner shot", "라이프스타일 인테리어": "lifestyle interior scene",
    "클로즈업 디테일": "close-up detail focus", "심도 얕은 샷(아웃포커싱)": "shallow depth of field with bokeh"
  },
  country: { "선택안함": "", "한국": "Korea", "일본": "Japan", "동남아 휴양지": "Southeast Asia resort", "미국": "USA", "독일": "Germany", "이탈리아": "Italy" }
};

const OPTIONS_DATA = {
  subjectNum: ["없음", "혼자", "다수"],
  subjectGender: ["선택안함", "여성", "남성", "혼성"],
  subjectAge: ["선택안함", "10대", "20대", "30대", "40대", "중장년"],
  subjectRegion: ["선택안함", "한국", "일본", "북유럽", "북미"],
  subjectAction: ["선택안함", "기본", "차분함", "활발함", "공간에 어울리게"],
  subjectClothesStyle: ["선택안함", "캐주얼", "비즈니스", "스트릿", "미니멀", "포멀/정장"],
  subjectClothesTop: {
    female: ["선택안함", "반팔티", "긴팔티", "자켓", "아우터", "원피스", "스포츠 복장", "아웃도어"],
    male: ["선택안함", "반팔티", "긴팔티", "자켓", "아우터", "스포츠 복장", "아웃도어"]
  },
  subjectClothesBottom: {
    female: ["선택안함", "기본 스커트", "미니스커트", "롱스커트", "긴바지", "반바지"],
    male: ["선택안함", "긴바지", "반바지"]
  },
  subjectHair: ["선택안함", "긴머리", "짧은머리", "단발", "펌", "염색", "묶은머리"],
  spaceType: ["스튜디오", "오피스", "홈", "리테일", "라운지", "야외"],
  spaceDetail: {
    "스튜디오": ["단색 배경", "인테리어 세트장", "그라데이션 배경", "쇼케이스", "크로마키 그린 배경"],
    "오피스": ["사무실", "회의실", "중역실", "오피스 라운지", "트레이닝룸", "공유오피스"],
    "홈": ["리빙", "다이닝", "룸", "워크룸", "베드룸", "테라스"],
    "리테일": ["카페", "식당", "쇼룸", "로비", "쇼핑몰", "박람회", "갤러리", "도서관", "강의실"],
    "라운지": ["호텔 라운지", "공항 라운지", "쇼핑몰라운지", "쇼케이스 라운지"],
    "야외": ["도심", "자연", "테라스", "공원", "강가", "쇼핑가", "힙한곳"]
  },
  interiorStyle: ["선택안함", "미드센추리 모던", "모던 미니멀", "내추럴 우드", "젠 스타일", "인더스트리얼", "스칸디나비안", "플랜테리어"],
  light: ["선택안함", "자연광", "시네마틱", "스튜디오 조명", "스포트라이트 조명", "무드등"],
  detailFloor: ["밝은 우드 마루", "어두운 우드 마루", "테라조 타일", "대리석", "콘크리트", "조약돌 바닥", "자갈 바닥", "카펫", "포세린타일", "에폭시"],
  detailWood: ["오크(참나무)", "월넛(호두나무)", "자작나무", "티크", "애쉬", "마호가니", "미송", "OBS", "합판"],
  detailMetal: ["황동(브라스)", "크롬/실버", "무광 블랙", "유광 블랙", "로즈골드"],
  detailWall: ["화이트 페인트", "노출 콘크리트", "웨인스코팅", "파스텔톤 벽지", "붉은 벽돌", "세라믹타일", "패널", "템바보드", "원목패널", "스틸패널", "스톤패널"],
  copySpace: ["선택안함", "좌측 여백", "우측 여백"],
  cameraAngle: ["선택안함", "정면", "미디움 샷", "풀 샷", "하이앵글", "로우앵글", "아이레벨", "클로즈업", "익스트림 클로즈업", "버드아이 뷰", "웜즈아이 뷰", "더치 앵글", "초광각", "망원 샷", "드론 샷"],
  shotStyle: [
    "컬러블로킹", "네거티브 스페이스", "하드 섀도우", "톤온톤-모노크로매틱", "플랫 레이", "매크로-디테일", "와비사비-어스톤", "모션 캡쳐-동적 연출",
    "인테리어 잡지 샷(사실적)", "와이드 건축/공간 샷", "인테리어 비네트(코너)", "라이프스타일 인테리어", "클로즈업 디테일", "심도 얕은 샷(아웃포커싱)"
  ],
  aspectRatio: ["1:1 (Square)", "16:9 (Widescreen)", "4:3 (Standard)", "3:4 (Portrait)", "4:5 (SNS)", "9:16 (Vertical)"],
  country: ["선택안함", "한국", "일본", "동남아 휴양지", "미국", "독일", "이탈리아"]
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState({
    subjectNum: "없음",
    subjectGender: "선택안함",
    subjectAge: "선택안함",
    subjectRegion: "선택안함",
    subjectAction: "기본",
    subjectClothesStyle: "선택안함",
    subjectClothesTop: "선택안함",
    subjectClothesBottom: "선택안함",
    femaleClothesTop: "선택안함",
    femaleClothesBottom: "선택안함",
    maleClothesTop: "선택안함",
    maleClothesBottom: "선택안함",
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
    copySpace: "선택안함",
    shotStyle: [],
    aspectRatio: "1:1 (Square)",
    country: "선택안함",
    brightness: 1.0,
    useLight: true
  });
  const [enableImageGeneration, setEnableImageGeneration] = useState(false);
  const [useDetailMaterial, setUseDetailMaterial] = useState(false);
  const [removeText, setRemoveText] = useState(true);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // v0.3 Features
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [activeCategory, setActiveCategory] = useState('subject');
  const [activeTemplate, setActiveTemplate] = useState(null);

  // Image-to-Image & Lightbox states
  const [refImage, setRefImage] = useState(null); // { mimeType, data }
  const [useImageRef, setUseImageRef] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('전체');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState("google");
  const [sdApiKey, setSdApiKey] = useState("");
  const [moveTarget, setMoveTarget] = useState(null);
  const [img2imgStrength, setImg2imgStrength] = useState(0.65); // [INSTRUCTION] Img2Img 강도 상태 분리

  // Rename Modal State
  const [renameTarget, setRenameTarget] = useState(null); // { id, name }
  const [newPresetName, setNewPresetName] = useState("");
  
  // Prompt Modal State
  const [promptModalTarget, setPromptModalTarget] = useState(null);
  const [promptCopied, setPromptCopied] = useState(false);

  // ESC Key Listener for Modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && promptModalTarget) {
        setPromptModalTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [promptModalTarget]);

  // Initial Data Load & Persistence Sync
  useEffect(() => {
    console.log("🚀 Initializing Shot Maker v0.3 Professional Studio...");

    const storedAdmin = localStorage.getItem('shotmaker_is_admin');
    if (storedAdmin === 'true') setIsAdmin(true);

    const storedKey = localStorage.getItem('shotmaker_api_key');
    if (storedKey) setGoogleApiKey(storedKey);

    const storedTheme = localStorage.getItem('shotmaker_dark_mode');
    if (storedTheme === 'true') setIsDarkMode(true);

    // 1. LocalStorage Sync (Instant)
    const savedConfig = localStorage.getItem('shotmaker_config_v13');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    const savedMat = localStorage.getItem('shotmaker_useDetailMaterial_v13');
    if (savedMat) setUseDetailMaterial(savedMat === 'true');
    const savedText = localStorage.getItem('shotmaker_removeText_v13');
    if (savedText) setRemoveText(savedText === 'true');

    const storedApi = localStorage.getItem('shotmaker_selected_api');
    if (storedApi) setSelectedApi(storedApi);
    const storedSdKey = localStorage.getItem('shotmaker_sd_api_key');
    if (storedSdKey) setSdApiKey(storedSdKey);

    const storedGen = localStorage.getItem('shotmaker_enableImageGeneration');
    if (storedGen !== null) setEnableImageGeneration(storedGen === 'true');

    // 2. Firebase Initial Load (One-time fetch as requested)
    const fetchTemplates = async () => {
      try {
        const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ Firebase Loaded: ${templates.length} templates loaded.`);
        setSavedTemplates(templates);
      } catch (error) {
        console.error("❌ Firebase load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // ⏱️ Cooldown Timer Logic
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('shotmaker_dark_mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('shotmaker_config_v13', JSON.stringify(config));
      localStorage.setItem('shotmaker_useDetailMaterial_v13', useDetailMaterial);
      localStorage.setItem('shotmaker_removeText_v13', removeText);
      localStorage.setItem('shotmaker_enableImageGeneration', enableImageGeneration);
    }
  }, [config, useDetailMaterial, removeText, enableImageGeneration, isLoading]);

  const handleConfigChange = (key, value) => {
    setActiveTemplate(null);
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'spaceType') next.spaceDetail = OPTIONS_DATA.spaceDetail[value][0];
      if (key === 'subjectGender') {
        if (value === '남성' && !OPTIONS_DATA.subjectClothesTop.male.includes(prev.subjectClothesTop)) next.subjectClothesTop = "선택안함";
        if (value === '남성' && !OPTIONS_DATA.subjectClothesBottom.male.includes(prev.subjectClothesBottom)) next.subjectClothesBottom = "선택안함";
      }
      return next;
    });
    setIsSaved(false); // Reset complete state on option change
  };

  const handleSmartTemplate = (templateType) => {
    setActiveTemplate(templateType);
    let newConfig = { ...config };
    
    if (templateType === '타이틀씬') {
      newConfig.subjectNum = '없음';
      newConfig.spaceType = '스튜디오';
      newConfig.spaceDetail = '그라데이션 배경';
      newConfig.cameraAngle = '풀 샷';
      newConfig.interiorStyle = '모던 미니멀';
    } else if (templateType === '디테일씬') {
      newConfig.subjectNum = '없음';
      newConfig.spaceType = '스튜디오';
      newConfig.spaceDetail = '쇼케이스';
      newConfig.cameraAngle = '익스트림 클로즈업';
      newConfig.useLight = true;
      newConfig.light = '스포트라이트 조명';
    } else if (templateType === '인스타씬') {
      if (newConfig.subjectNum === "없음") newConfig.subjectNum = "혼자";
      newConfig.subjectAge = '20대';
      newConfig.aspectRatio = '1:1 (Square)';
      newConfig.spaceType = '야외';
      newConfig.spaceDetail = '힙한곳';
      newConfig.interiorStyle = '플랜테리어';
    } else if (templateType === '사용씬') {
      if (newConfig.subjectNum === "없음") newConfig.subjectNum = "혼자";
      newConfig.spaceType = '홈';
      newConfig.spaceDetail = '워크룸';
      newConfig.cameraAngle = '미디움 샷';
    }
    
    setConfig(newConfig);
    setIsSaved(false);
  };

  const hashPassword = async (password) => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async () => {
    const pwd = window.prompt("관리자 암호를 입력하세요:");
    if (!pwd) return;
    const hashed = await hashPassword(pwd);
    if (hashed === process.env.REACT_APP_ADMIN_PWD_HASH) {
      try {
        await signInAnonymously(auth);
        setIsAdmin(true);
        localStorage.setItem('shotmaker_is_admin', 'true');
        triggerToast("관리자 로그인 성공");
      } catch (error) {
        console.error("Firebase Auth Error:", error);
        triggerToast("인증 실패: " + error.message);
      }
    } else {
      triggerToast("암호가 일치하지 않습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      localStorage.removeItem('shotmaker_is_admin');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!isAdmin) {
      triggerToast("저장 권한이 없습니다.");
      return;
    }
    if (!templateName || !generatedPrompt) return;

    setIsSaving(true);
    console.log(`💾 Attempting to save template: "${templateName}"...`);
    try {
      const newTemplate = {
        name: templateName,
        prompt: generatedPrompt,
        config: config,
        useDetailMaterial,
        removeText,
        createdAt: serverTimestamp(),
        thumbnailColor: ['#FF3B30', '#34C759', '#AF52DE', '#FF9500', '#007AFF'][Math.floor(Math.random() * 5)],
        previewImage: generatedImage || null
      };

      const docRef = await addDoc(collection(db, "templates"), newTemplate);
      console.log(`✅ Template saved successfully with ID: ${docRef.id}`);

      // Immediate local state update for zero-latency UI
      setSavedTemplates(prev => [{ id: docRef.id, ...newTemplate, createdAt: new Date() }, ...prev]);

      setIsSaved(true);
      triggerToast("라이브러리에 저장 완료!");
      setTemplateName("");
    } catch (e) {
      console.error("Firebase Save Error:", e);
      triggerToast("저장 실패: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!isAdmin) {
      triggerToast("삭제 권한이 없습니다.");
      return;
    }
    try {
      await deleteDoc(doc(db, "templates", id));
      triggerToast("템플릿이 삭제되었습니다.");
    } catch (e) {
      console.error("Error deleting template:", e);
      triggerToast("삭제 오류가 발생했습니다.");
    }
  };

  const handleMoveTemplate = async (templateId, newCategory) => {
    if (!isAdmin) {
      triggerToast("권한이 없습니다.");
      return;
    }
    try {
      const templateRef = doc(db, "templates", templateId);
      await updateDoc(templateRef, {
        "config.spaceType": newCategory
      });

      setSavedTemplates(prev => prev.map(t =>
        t.id === templateId
          ? { ...t, config: { ...t.config, spaceType: newCategory } }
          : t
      ));

      triggerToast(`'${newCategory}' 탭으로 이동되었습니다.`);
    } catch (e) {
      console.error("Error moving template:", e);
      triggerToast("이동 오류가 발생했습니다.");
    }
  };

  const handleLoadTemplate = (template) => {
    setConfig({
      ...config, // Keep existing if missing in template
      ...template.config
    });
    setUseDetailMaterial(template.useDetailMaterial || false);
    setRemoveText(template.removeText !== undefined ? template.removeText : true);
    setGeneratedPrompt(template.prompt);
    setActiveTab('home');
  };

  const handleRenameTemplate = async (templateId, newName) => {
    if (!isAdmin) {
      triggerToast("수정 권한이 없습니다.");
      return;
    }
    try {
      const templateRef = doc(db, "templates", templateId);
      await updateDoc(templateRef, { name: newName });
      setSavedTemplates(prev => prev.map(t => t.id === templateId ? { ...t, name: newName } : t));
      triggerToast("이름이 변경되었습니다.");
    } catch (e) {
      console.error("Error renaming template:", e);
      triggerToast("변경 오류가 발생했습니다.");
    }
  };

  const generatePrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const parts = [];
      
      if (activeTemplate === '타이틀씬') {
        parts.push("Clean and organized studio style shot for title banner, product focus");
      } else if (activeTemplate === '디테일씬') {
        parts.push("Close-up detail shot highlighting texture of materials, product focus");
      } else if (activeTemplate === '인스타씬') {
        parts.push("Trendy Instagram snapshot style, emotional SNS aesthetic");
      } else if (activeTemplate === '사용씬') {
        parts.push("Commercial lifestyle usage scene emphasizing natural interaction in an everyday space");
      }

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
        
        if (config.subjectGender === "혼성") {
          const fTop = DICTIONARY.subjectClothesTop[config.femaleClothesTop];
          const fBot = DICTIONARY.subjectClothesBottom[config.femaleClothesBottom];
          const mTop = DICTIONARY.subjectClothesTop[config.maleClothesTop];
          const mBot = DICTIONARY.subjectClothesBottom[config.maleClothesBottom];
          
          let fClothes = [];
          if (fTop) fClothes.push(fTop);
          if (fBot) fClothes.push(fBot);
          
          let mClothes = [];
          if (mTop) mClothes.push(mTop);
          if (mBot) mClothes.push(mBot);
          
          if (fClothes.length > 0) details.push(`females ${fClothes.join(" and ")}`);
          if (mClothes.length > 0) details.push(`males ${mClothes.join(" and ")}`);
        } else {
          const top = DICTIONARY.subjectClothesTop[config.subjectClothesTop];
          const bot = DICTIONARY.subjectClothesBottom[config.subjectClothesBottom];
          if (top) details.push(top);
          if (bot) details.push(bot);
        }

        if (details.length > 0) humanStr += ` ${details.join(", ")}`;
        
        let actionStr = "posing naturally";
        if (config.subjectAction && config.subjectAction !== "선택안함" && config.subjectAction !== "기본") {
          actionStr = DICTIONARY.subjectAction[config.subjectAction];
        } else if (config.subjectAction === "기본") {
          actionStr = "posing naturally";
        }
        parts.push(`featuring ${humanStr} ${actionStr}`);
      } else {
        parts.push(`professional architectural photography of ${subjectStr}`);
      }

      let envStr = DICTIONARY.spaceType[config.spaceType];
      if (config.spaceDetail) envStr += `, ${DICTIONARY.spaceDetail[config.spaceDetail]}`;
      if (config.country !== "선택안함") envStr += ` in ${DICTIONARY.country[config.country]}`;
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

      if (config.useLight && config.light !== "선택안함") {
        parts.push(`illuminated by ${DICTIONARY.light[config.light]} with ${config.brightness} brightness`);
      }
      if (config.copySpace && config.copySpace !== "선택안함") parts.push(DICTIONARY.copySpace[config.copySpace]);
      if (config.cameraAngle !== "선택안함") parts.push(`shot from ${DICTIONARY.cameraAngle[config.cameraAngle]}`);
      if (config.shotStyle.length > 0) {
        const styles = config.shotStyle.map(s => DICTIONARY.shotStyle[s]);
        parts.push(`rendered with ${styles.join(", ")}`);
      }
      if (removeText) parts.push("textless, no text, no watermarks, clear image");
      parts.push("8k resolution, highly detailed, masterpiece, photorealistic, interior design magazine cover");

      const finalPrompt = parts.join(", ");
      setGeneratedPrompt(finalPrompt);
      setGeneratedImage(null);
      setIsGenerating(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 800);
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const generateImage = async (prompt) => {
    if (selectedApi === 'google') {
      await generateImageFromGoogle(prompt);
    } else {
      await generateImageFromSD(prompt);
    }
  };

  const generateImageFromSD = async (prompt) => {
    const hfToken = sdApiKey?.trim() || process.env.REACT_APP_HF_TOKEN;

    if (!hfToken) {
      triggerToast("Hugging Face API 토큰이 설정되지 않았습니다.");
      return;
    }
    const rawPrompt = prompt || generatedPrompt;
    if (!rawPrompt) {
      triggerToast("먼저 프롬프트를 생성해주세요.");
      return;
    }

    // [INSTRUCTION 2] 얼굴 일그러짐 방지 프롬프트 주입
    const promptToUse = enhancePrompt(rawPrompt);

    setCooldownTime(5);
    setIsImageGenerating(true);

    let retryCount = 0;
    const maxRetries = 3;

    const executeInference = async () => {
      try {
        console.log(`🚀 Generating via InferenceClient (FLUX.1-dev)... Retry: ${retryCount}`);
        const client = new InferenceClient(hfToken.trim());

        let blob;
        // [INSTRUCTION 1] Text-to-Image와 Image-to-Image 분기 처리
        if (useImageRef && refImage) {
          console.log("🎨 Attempting Image-to-Image with Flux.1...");
          // Base64 데이터를 Blob으로 변환하거나 직접 전달
          const imageBlob = await (await fetch(`data:${refImage.mimeType};base64,${refImage.data}`)).blob();

          blob = await client.imageToImage({
            model: "black-forest-labs/FLUX.1-dev", // 고품질 dev 모델 권장
            inputs: {
              image: imageBlob,
              prompt: promptToUse,
            },
            parameters: {
              // [INSTRUCTION 3] Image-to-Image 파라미터 최적화
              strength: img2imgStrength,
              // [INSTRUCTION 2] Flux.1 Schnell 최적화된 4스텝 설정
              num_inference_steps: 4,
              width: 1024,
              height: 1024,
            },
          });
        } else {
          console.log("📝 Attempting Text-to-Image with Flux.1...");
          blob = await client.textToImage({
            model: "black-forest-labs/FLUX.1-dev",
            inputs: promptToUse,
            parameters: {
              num_inference_steps: 4,
              width: 1024,
              height: 1024,
            },
          });
        }

        const imageUrl = URL.createObjectURL(blob);
        setGeneratedImage(imageUrl);
        triggerToast("Hugging Face (FLUX.1) 생성 성공!");
      } catch (e) {
        const errorMsg = e.message?.toLowerCase() || "";
        
        // [INSTRUCTION 4] Model Loading (503) 발생 시 자동 재시도
        if ((errorMsg.includes('503') || errorMsg.includes('loading')) && retryCount < maxRetries) {
          retryCount++;
          console.warn(`⚠️ Model loading. Retrying... (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return executeInference();
        }
        throw e;
      }
    };

    try {
      await executeInference();
    } catch (e) {
      console.error("SD Generation Error:", e);
      const errorMsg = e.message?.toLowerCase() || "";

      if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        triggerToast("토큰 권한 확인이 필요합니다 (401 Unauthorized)");
      } else if (errorMsg.includes('403')) {
        triggerToast("토큰 권한(Inference)이 부족합니다.");
      } else {
        triggerToast(`Hugging Face 오류: ${e.message}`);
      }
    } finally {
      setIsImageGenerating(false);
    }
  };

  const generateImageFromGoogle = async (prompt) => {
    if (!googleApiKey) {
      triggerToast("API 키가 설정되지 않았습니다.");
      return;
    }
    if (cooldownTime > 0) {
      triggerToast(`${cooldownTime}초 후에 다시 시도해주세요.`);
      return;
    }
    const promptToUse = prompt || generatedPrompt;
    if (!promptToUse) {
      triggerToast("먼저 프롬프트를 생성해주세요.");
      return;
    }

    // Reduced cooldown to 5 seconds for paid/billing-enabled users
    setCooldownTime(5);
    setIsImageGenerating(true);

    try {
      const ratioMap = {
        "1:1 (Square)": "1:1",
        "16:9 (Widescreen)": "16:9",
        "4:3 (Standard)": "4:3",
        "3:4 (Portrait)": "3:4",
        "4:5 (SNS)": "4:5",
        "9:16 (Vertical)": "9:16"
      };
      const apiRatio = ratioMap[config.aspectRatio] || "1:1";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${googleApiKey}`;

      // Construct parts for multimodal input
      const parts = [{ text: promptToUse }];
      if (useImageRef && refImage) {
        parts.push({
          inlineData: {
            mimeType: refImage.mimeType,
            data: refImage.data
          }
        });
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: parts
          }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: apiRatio
            }
          }
        })
      });

      if (res.status === 429) {
        throw new Error("API 할당량 초과. 약 1분 후 다시 시도해주세요.");
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ API Error Response:", data);
        throw new Error(data.error?.message || `HTTP ${res.status}`);
      }

      const responseParts = data.candidates?.[0]?.content?.parts || [];
      let imageFound = false;

      for (const part of responseParts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || "image/png";
          setGeneratedImage(`data:${mimeType};base64,${part.inlineData.data}`);
          imageFound = true;
          break;
        }
      }

      if (!imageFound) {
        const finishReason = data.candidates?.[0]?.finishReason;
        console.error("⚠️ No image in response. Data:", data);
        if (finishReason === 'SAFETY') {
          throw new Error("보안 정책(Safety)으로 인해 이미지가 차단되었습니다.");
        } else if (finishReason === 'RECITATION') {
          throw new Error("저작권 보호(Recitation)로 인해 이미지가 차단되었습니다.");
        } else {
          throw new Error(finishReason ? `생성 중단됨 (${finishReason})` : "이미지 데이터를 찾을 수 없습니다.");
        }
      }

    } catch (e) {
      console.error("🔴 Image Generation Error:", e);
      triggerToast(`오류: ${e.message}`);
    } finally {
      setIsImageGenerating(false);
    }
  };

  const simulateUpscale = () => {
    if (!generatedImage) return;
    setIsUpscaling(true);
    setTimeout(() => {
      setIsUpscaling(false);
      alert("2x Upscale Complete! (Simulated for Demo)");
    }, 2000);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = `shotmaker_${Date.now()}.png`;
    a.click();
  };

  if (isLoading) return <div className="ios-loading-screen">Loading Studio...</div>;

  return (
    <div className="app-container">
      {/* 🖼️ Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ios-lightbox"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="ios-lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lightboxImage} alt="Fullscreen" className="ios-lightbox-img" />
              <button className="ios-lightbox-close" onClick={() => setLightboxImage(null)}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ios-toast-container">
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ios-toast"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📦 Move to Tab Modal */}
      <AnimatePresence>
        {moveTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="settings-modal-overlay"
            style={{ zIndex: 200000 }}
            onClick={() => setMoveTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="settings-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[22px] font-black text-black dark:text-white mb-2 text-center tracking-tight">Move to Tab</h3>
              <p className="text-[13px] font-bold text-gray-400 mb-8 text-center">이동할 카테고리를 선택하세요</p>

              <div className="modal-pill-grid">
                {OPTIONS_DATA.spaceType.map(space => (
                  <button
                    key={space}
                    onClick={() => {
                      handleMoveTemplate(moveTarget.id, space);
                      setMoveTarget(null);
                    }}
                    className={`modal-pill-btn ${moveTarget.config?.spaceType === space ? 'active' : 'inactive'}`}
                  >
                    {space}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setMoveTarget(null)}
                className="cancel-pill-btn"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏷️ Rename Preset Modal — v0.44 Pill Design */}
      <AnimatePresence>
        {renameTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="settings-modal-overlay"
            style={{ zIndex: 200000 }}
            onClick={() => setRenameTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="settings-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[22px] font-black text-black dark:text-white mb-2 text-center tracking-tight">Rename Preset</h3>
              <p className="text-[13px] font-bold text-gray-400 mb-8 text-center">새로운 프리셋 이름을 입력하세요</p>

              <div className="flex flex-col gap-4 w-full">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Enter new name..."
                  className="save-input w-full"
                  autoFocus
                />
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setRenameTarget(null)}
                    className="cancel-pill-btn flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleRenameTemplate(renameTarget.id, newPresetName);
                      setRenameTarget(null);
                    }}
                    className="save-btn flex-1"
                    style={{ background: 'var(--current-theme)', color: 'white' }}
                  >
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📝 Prompt Detail Global Modal */}
      <AnimatePresence>
        {promptModalTarget && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="settings-modal-overlay"
            style={{ zIndex: 300000, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPromptModalTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="settings-modal"
              style={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh', padding: '24px', borderRadius: '24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[20px] font-black text-black dark:text-white mb-4 tracking-tight text-center">Prompt Detail</h3>
              <div className="flex-1 overflow-y-auto mb-6" style={{ padding: '16px', backgroundColor: '#F2F2F7', borderRadius: '16px' }}>
                <p className="text-[13px] font-medium text-gray-600 leading-relaxed break-words m-0">
                  {promptModalTarget.prompt}
                </p>
              </div>
              
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(promptModalTarget.prompt);
                    setPromptCopied(true);
                    setTimeout(() => setPromptCopied(false), 2000);
                  }}
                  className="save-btn flex-1"
                  style={{ backgroundColor: promptCopied ? '#34C759' : '#000', color: '#FFF', borderRadius: '9999px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  {promptCopied ? <span className="font-black">✓ Copied</span> : <><Copy size={16} /> Copy Prompt</>}
                </button>
                <button 
                  onClick={() => setPromptModalTarget(null)}
                  className="cancel-pill-btn"
                  style={{ width: '48px', height: '48px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '9999px', flexShrink: 0 }}
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="settings-modal-overlay"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="settings-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="settings-header">
                <h3>Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="close-btn"><X size={20} /></button>
              </div>
              <div className="settings-body space-y-4">
                {/* Dark Mode Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', paddingBottom: '28px', borderBottom: '1px solid #E5E5EA' }}>
                  <div>
                    <label className="settings-prop-label">다크 모드</label>
                    <p className="settings-desc-text">앱 테마를 어둡게 변경합니다.</p>
                  </div>
                  <IOSToggle
                    label=""
                    isOn={isDarkMode}
                    onToggle={() => setIsDarkMode(!isDarkMode)}
                    activeColor="#000000"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '28px', borderBottom: '1px solid #E5E5EA' }}>
                  <div>
                    <label className="settings-prop-label">이미지 생성 기능</label>
                    <p className="settings-desc-text">메인 화면에서 이미지 생성 버튼을 표시합니다.</p>
                  </div>
                  <IOSToggle
                    label=""
                    isOn={enableImageGeneration}
                    onToggle={() => setEnableImageGeneration(!enableImageGeneration)}
                    activeColor="#34C759"
                  />
                </div>

                {/* Generate API Section */}
                <div style={{ paddingTop: '32px', marginTop: '4px' }}>
                  <label className="settings-prop-label">Generate API</label>
                  <p className="settings-desc-text" style={{ marginBottom: '24px' }}>사용할 이미지 생성 AI 엔진을 선택하세요.</p>

                  {/* Google Gemini Row */}
                  <div
                    className={`engine-row ${selectedApi === 'google' ? 'active' : 'inactive'} ${!isAdmin ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (!isAdmin) {
                        triggerToast("관리자 로그인이 필요합니다.");
                        return;
                      }
                      setSelectedApi('google');
                      localStorage.setItem('shotmaker_selected_api', 'google');
                    }}
                  >
                    <div className="engine-label">
                      <div className="engine-radio" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'inherit', whiteSpace: 'nowrap' }}>Google AI</span>
                    </div>
                    <input
                      type="password"
                      value={googleApiKey}
                      onChange={(e) => {
                        if (!isAdmin) return;
                        setGoogleApiKey(e.target.value);
                        localStorage.setItem('shotmaker_api_key', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={isAdmin ? "Enter Gemini API Key..." : "🔒 Restricted"}
                      className="settings-input settings-input-sm"
                      readOnly={!isAdmin}
                    />
                  </div>

                  {/* Hugging Face Row */}
                  <div
                    className={`engine-row ${selectedApi === 'stable-diffusion' ? 'active' : 'inactive'} ${!isAdmin ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (!isAdmin) {
                        triggerToast("관리자 로그인이 필요합니다.");
                        return;
                      }
                      setSelectedApi('stable-diffusion');
                      localStorage.setItem('shotmaker_selected_api', 'stable-diffusion');
                    }}
                  >
                    <div className="engine-label" style={{ width: 'auto', flexShrink: 0 }}>
                      <div className="engine-radio" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'inherit', whiteSpace: 'nowrap' }}>Hugging Face</span>
                    </div>
                    <input
                      type="password"
                      value={sdApiKey}
                      onChange={(e) => {
                        if (!isAdmin) return;
                        setSdApiKey(e.target.value);
                        localStorage.setItem('shotmaker_sd_api_key', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder={isAdmin ? "Enter HF Token..." : "🔒 Restricted"}
                      className="settings-input settings-input-sm"
                      readOnly={!isAdmin}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ios-toast-container">
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ios-toast"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <header className="app-header">
        <h1 className="text-2xl font-black text-black tracking-tight leading-none m-0">Shot Maker</h1>
        <div className="flex items-center gap-3">
          <div className="header-nav">
            <button className={`header-nav-btn ${activeTab === 'home' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('home')}>Create</button>
            <button className={`header-nav-btn ${activeTab === 'library' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('library')}>Library</button>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`ios-card-icon-btn ${isMenuOpen ? 'active' : ''}`}
              title="Menu"
              style={{ width: '36px', height: '36px' }}
            >
              <Menu size={22} />
            </button>
            {/* Header Menu Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div
                    className="menu-overlay"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="header-dropdown"
                  >
                    <button
                      onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                      className="dropdown-item"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button
                      onClick={() => {
                        if (isAdmin) handleLogout();
                        else handleLogin();
                        setIsMenuOpen(false);
                      }}
                      className="dropdown-item"
                    >
                      {isAdmin ? <LogOut size={18} /> : <LogIn size={18} />}
                      <span>{isAdmin ? 'Logout' : 'Login'}</span>
                                        </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">

            {/* Smart Templates */}
            <div className="template-grid">
              <button className={`ios-smart-template-btn ${activeTemplate === '타이틀씬' ? 'active' : ''}`} onClick={() => handleSmartTemplate('타이틀씬')}>
                <div className="template-title">타이틀씬</div>
                <div className="template-desc">스튜디오 + 그라데이션</div>
              </button>
              <button className={`ios-smart-template-btn ${activeTemplate === '디테일씬' ? 'active' : ''}`} onClick={() => handleSmartTemplate('디테일씬')}>
                <div className="template-title">디테일씬</div>
                <div className="template-desc">쇼케이스 + 클로즈업</div>
              </button>
              <button className={`ios-smart-template-btn ${activeTemplate === '인스타씬' ? 'active' : ''}`} onClick={() => handleSmartTemplate('인스타씬')}>
                <div className="template-title">인스타씬</div>
                <div className="template-desc">1:1 SNS + 플랜테리어</div>
              </button>
              <button className={`ios-smart-template-btn ${activeTemplate === '사용씬' ? 'active' : ''}`} onClick={() => handleSmartTemplate('사용씬')}>
                <div className="template-title">사용씬</div>
                <div className="template-desc">인물 포함 라이프스타일</div>
              </button>
            </div>

            {/* Category Tabs */}
            <div className="ios-category-tabs">
              <button className={`category-tab ${activeCategory === 'subject' ? 'active' : ''}`} onClick={() => setActiveCategory('subject')}>인물</button>
              <button className={`category-tab ${activeCategory === 'space' ? 'active' : ''}`} onClick={() => setActiveCategory('space')}>공간</button>
              <button className={`category-tab ${activeCategory === 'camera' ? 'active' : ''}`} onClick={() => setActiveCategory('camera')}>카메라</button>
              <button className={`category-tab ${activeCategory === 'style' ? 'active' : ''}`} onClick={() => setActiveCategory('style')}>스타일</button>
            </div>

            <AnimatePresence mode="wait">
              {activeCategory === 'subject' && (
                <motion.section key="subject" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="ios-section-title">인물</h2>
                  <div className="ios-bento-card" style={{ padding: '20px' }}>
                    <OptionSelect label="인원" value={config.subjectNum} onChange={(v) => handleConfigChange('subjectNum', v)} options={OPTIONS_DATA.subjectNum} theme="red" />
                    {config.subjectNum !== "없음" && (
                      <div className="mt-2 space-y-1">
                        <OptionSelect label="성별" value={config.subjectGender} onChange={(v) => handleConfigChange('subjectGender', v)} options={OPTIONS_DATA.subjectGender} theme="red" />
                        <OptionSelect label="연령대" value={config.subjectAge} onChange={(v) => handleConfigChange('subjectAge', v)} options={OPTIONS_DATA.subjectAge} theme="red" />
                        <OptionSelect label="지역/인종" value={config.subjectRegion} onChange={(v) => handleConfigChange('subjectRegion', v)} options={OPTIONS_DATA.subjectRegion} theme="red" />
                        <OptionSelect label="행동" value={config.subjectAction} onChange={(v) => handleConfigChange('subjectAction', v)} options={OPTIONS_DATA.subjectAction} theme="red" />
                        <OptionSelect label="옷 스타일" value={config.subjectClothesStyle} onChange={(v) => handleConfigChange('subjectClothesStyle', v)} options={OPTIONS_DATA.subjectClothesStyle} theme="red" />
                        
                        {config.subjectGender === '혼성' ? (
                          <>
                            <div className="mt-4 mb-2 text-xs font-bold text-gray-500 border-b pb-1">여성 의상</div>
                            <OptionSelect
                              label="상의"
                              value={config.femaleClothesTop}
                              onChange={(v) => handleConfigChange('femaleClothesTop', v)}
                              options={OPTIONS_DATA.subjectClothesTop.female}
                              theme="red"
                            />
                            <OptionSelect
                              label="하의"
                              value={config.femaleClothesBottom}
                              onChange={(v) => handleConfigChange('femaleClothesBottom', v)}
                              options={OPTIONS_DATA.subjectClothesBottom.female}
                              theme="red"
                            />
                            
                            <div className="mt-4 mb-2 text-xs font-bold text-gray-500 border-b pb-1">남성 의상</div>
                            <OptionSelect
                              label="상의"
                              value={config.maleClothesTop}
                              onChange={(v) => handleConfigChange('maleClothesTop', v)}
                              options={OPTIONS_DATA.subjectClothesTop.male}
                              theme="red"
                            />
                            <OptionSelect
                              label="하의"
                              value={config.maleClothesBottom}
                              onChange={(v) => handleConfigChange('maleClothesBottom', v)}
                              options={OPTIONS_DATA.subjectClothesBottom.male}
                              theme="red"
                            />
                          </>
                        ) : (
                          <>
                            <OptionSelect
                              label="상의"
                              value={config.subjectClothesTop}
                              onChange={(v) => handleConfigChange('subjectClothesTop', v)}
                              options={config.subjectGender === '여성' ? OPTIONS_DATA.subjectClothesTop.female : OPTIONS_DATA.subjectClothesTop.male}
                              theme="red"
                            />
                            <OptionSelect
                              label="하의"
                              value={config.subjectClothesBottom}
                              onChange={(v) => handleConfigChange('subjectClothesBottom', v)}
                              options={config.subjectGender === '여성' ? OPTIONS_DATA.subjectClothesBottom.female : OPTIONS_DATA.subjectClothesBottom.male}
                              theme="red"
                            />
                          </>
                        )}
                        <OptionSelect label="헤어 스타일" value={config.subjectHair} onChange={(v) => handleConfigChange('subjectHair', v)} options={OPTIONS_DATA.subjectHair} theme="red" />
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {activeCategory === 'space' && (
                <motion.section key="space" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="ios-section-title">공간</h2>
                  <div className="ios-bento-card">
                    <OptionSelect label="공간 종류" value={config.spaceType} onChange={(v) => handleConfigChange('spaceType', v)} options={OPTIONS_DATA.spaceType} theme="green" />
                    <OptionSelect label="세부 공간" value={config.spaceDetail} onChange={(v) => handleConfigChange('spaceDetail', v)} options={OPTIONS_DATA.spaceDetail[config.spaceType] || []} theme="green" />
                    <OptionSelect label="인테리어 양식" value={config.interiorStyle} onChange={(v) => handleConfigChange('interiorStyle', v)} options={OPTIONS_DATA.interiorStyle} theme="green" />
                    <div className="mt-4 border-t border-gray-100">
                      <OptionSelect label="국가/지역 (Country)" value={config.country} onChange={(v) => handleConfigChange('country', v)} options={OPTIONS_DATA.country} theme="green" />
                      
                      <IOSToggle
                        label="세부 소재 및 컬러 (Materials)"
                        isOn={useDetailMaterial}
                        onToggle={() => setUseDetailMaterial(!useDetailMaterial)}
                        activeColor="#34C759"
                      />
                      <AnimatePresence>
                        {useDetailMaterial && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col overflow-hidden">
                            <OptionSelect label="바닥 소재" value={config.detailFloor} onChange={(v) => handleConfigChange('detailFloor', v)} options={OPTIONS_DATA.detailFloor} theme="green" />
                            <OptionSelect label="우드 소재" value={config.detailWood} onChange={(v) => handleConfigChange('detailWood', v)} options={OPTIONS_DATA.detailWood} theme="green" />
                            <OptionSelect label="메탈 소재" value={config.detailMetal} onChange={(v) => handleConfigChange('detailMetal', v)} options={OPTIONS_DATA.detailMetal} theme="green" />
                            <OptionSelect label="벽 소재/마감" value={config.detailWall} onChange={(v) => handleConfigChange('detailWall', v)} options={OPTIONS_DATA.detailWall} theme="green" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeCategory === 'camera' && (
                <motion.section key="camera" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="ios-section-title">카메라</h2>
                  <div className="ios-bento-card" style={{ padding: '20px' }}>
                    <div className="mb-4 space-y-4">
                      <IOSToggle
                        label="이미지 참조 모드 (Image-to-Image)"
                        isOn={useImageRef}
                        onToggle={() => setUseImageRef(!useImageRef)}
                        activeColor="#007AFF"
                      />

                      {useImageRef && (
                        <div className="space-y-4">
                          <div
                            className={`ios-upload-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const file = e.dataTransfer.files[0];
                              if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setRefImage({
                                    mimeType: file.type,
                                    data: reader.result.split(',')[1]
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              id="ref-image-upload"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setRefImage({
                                      mimeType: file.type,
                                      data: reader.result.split(',')[1]
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {!refImage ? (
                              <label htmlFor="ref-image-upload" className="ios-upload-placeholder">
                                <div className="upload-main-text">Image Upload</div>
                                <div className="upload-sub-text">Drag & Drop</div>
                                <div className="ios-upload-capsule">
                                  <span>파일 선택</span>
                                </div>
                              </label>
                            ) : (
                              <div className="relative group w-full flex justify-center">
                                <img
                                  src={`data:${refImage.mimeType};base64,${refImage.data}`}
                                  alt="Ref Preview"
                                  className="ios-upload-preview"
                                />
                                <button
                                  onClick={() => setRefImage(null)}
                                  className="ios-upload-remove-btn"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Strength (변형 강도)</label>
                              <span className="text-[11px] font-black text-[var(--current-theme)]">{img2imgStrength}</span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="0.95"
                              step="0.05"
                              value={img2imgStrength}
                              onChange={(e) => setImg2imgStrength(parseFloat(e.target.value))}
                              className="w-full h-1 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                              style={{ accentColor: '#007AFF' }}
                            />
                            <div className="flex justify-between mt-1">
                              <span className="text-[9px] font-bold text-gray-300">ORIGIN</span>
                              <span className="text-[9px] font-bold text-gray-300">CREATIVE</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <OptionSelect label="이미지 비율" value={config.aspectRatio} onChange={(v) => handleConfigChange('aspectRatio', v)} options={OPTIONS_DATA.aspectRatio} theme="blue" />
                    <OptionSelect label="카메라 구도" value={config.cameraAngle} onChange={(v) => handleConfigChange('cameraAngle', v)} options={OPTIONS_DATA.cameraAngle} theme="blue" />
                    <OptionSelect label="화면 여백 (Copy Space)" value={config.copySpace || "선택안함"} onChange={(v) => handleConfigChange('copySpace', v)} options={OPTIONS_DATA.copySpace} theme="blue" />
                  </div>
                </motion.section>
              )}

              {activeCategory === 'style' && (
                <motion.section key="style" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="ios-section-title">스타일 & 조명</h2>
                  <div className="ios-bento-card">
                    <OptionSelect
                      label="연출 샷 스타일 (다중 선택)"
                      value={config.shotStyle}
                      onChange={(v) => handleConfigChange('shotStyle', v)}
                      options={OPTIONS_DATA.shotStyle}
                      multiSelect={true}
                      theme="purple"
                    />

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <IOSToggle
                        label="조명 밝기(Lighting Brightness)"
                        isOn={config.useLight}
                        onToggle={() => handleConfigChange('useLight', !config.useLight)}
                        activeColor="#FFD60A"
                      />
                      <AnimatePresence>
                        {config.useLight && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <OptionSelect label="조명 스타일" value={config.light} onChange={(v) => handleConfigChange('light', v)} options={OPTIONS_DATA.light} theme="purple" />
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl mt-2">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Brightness (밝기)</label>
                                <span className="text-[11px] font-black text-[#FFD60A]">{config.brightness}</span>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="2.0"
                                step="0.1"
                                value={config.brightness}
                                onChange={(e) => handleConfigChange('brightness', parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                style={{ accentColor: '#FFD60A' }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <IOSToggle
                        label="텍스트/로고 제거"
                        isOn={removeText}
                        onToggle={() => setRemoveText(!removeText)}
                        activeColor="#AF52DE"
                      />
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Action Area with Summary Panel */}
            <div className="pt-4 pb-20">
              <div className="ios-option-label mb-2 px-1">현재 선택된 옵션 (Summary)</div>
              <div className="ios-summary-panel">
                <div className="flex flex-wrap gap-[6px]">
                  {(() => {
                    const tags = [];
                    Object.entries(config).forEach(([key, val]) => {
                      if (val === "선택안함" || val === "없음" || (Array.isArray(val) && val.length === 0)) return;
                      if (key === 'brightness' || key === 'useLight') return;

                      // 1. 인물없음 일때 인물관련 속성 제거
                      if (config.subjectNum === "없음" && (key.startsWith('subject') || key.startsWith('female') || key.startsWith('male'))) return;

                      // 혼성/단일 성별에 따른 의상 분기
                      if (config.subjectNum !== "없음") {
                        if (config.subjectGender === "혼성" && key.startsWith("subjectClothes")) return;
                        if (config.subjectGender !== "혼성" && (key.startsWith("female") || key.startsWith("male"))) return;
                      }

                      let group = 0;
                      let bgColor = '#F2F2F7';
                      let textColor = '#8E8E93';

                      if (key.startsWith('subject') || key.startsWith('female') || key.startsWith('male')) {
                        group = 1; bgColor = '#FF3B30'; textColor = '#FFFFFF';
                      } else if (key.startsWith('space') || key === 'interiorStyle' || key === 'country' || key.startsWith('detail')) {
                        group = 2; bgColor = '#34C759'; textColor = '#FFFFFF';
                      } else if (key.startsWith('camera') || key === 'aspectRatio' || key === 'copySpace') {
                        group = 3; bgColor = '#007AFF'; textColor = '#FFFFFF';
                      } else if (key === 'shotStyle' || key === 'light' || key === 'brightness' || key === 'useLight') {
                        group = 4; bgColor = '#AF52DE'; textColor = '#FFFFFF';
                      }

                      if (Array.isArray(val)) {
                        val.forEach(v => tags.push({ key: `${key}-${v}`, val: v, group, bgColor, textColor }));
                      } else {
                        tags.push({ key, val, group, bgColor, textColor });
                      }
                    });

                    if (config.useLight && config.brightness) {
                      tags.push({ key: 'light-brightness', val: `조명: ${config.brightness}`, group: 4, bgColor: '#AF52DE', textColor: '#FFFFFF' });
                    }
                    if (removeText) {
                      tags.push({ key: 'remove-text', val: '텍스트 제거', group: 4, bgColor: '#AF52DE', textColor: '#FFFFFF' });
                    }

                    // 2. 같은 탭 속성 정렬 (group 기준)
                    tags.sort((a, b) => a.group - b.group);

                    // 3. 중복 표기 오류 수정 (val 기준으로 중복 제거)
                    const uniqueTags = [];
                    const seen = new Set();
                    tags.forEach(t => {
                      if (!seen.has(t.val)) {
                        seen.add(t.val);
                        uniqueTags.push(t);
                      }
                    });

                    return uniqueTags.map(t => (
                      <span key={t.key} className="ios-summary-tag" style={{ backgroundColor: t.bgColor, color: t.textColor }}>
                        {t.val}
                      </span>
                    ));
                  })()}
                </div>
              </div>

              {/* Unified Button Container — flex-col with gap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
                <button
                  onClick={generatePrompt}
                  disabled={isGenerating}
                  className="generate-btn"
                >
                  <Wand2 className="w-5 h-5 text-white" />
                  <span>{isGenerating ? 'GENERATING...' : 'GENERATE PROMPT'}</span>
                </button>

                {generatedPrompt && (selectedApi === 'google' ? googleApiKey : sdApiKey) && enableImageGeneration && (
                  <button
                    onClick={() => {
                      if (!isAdmin) {
                        triggerToast("이미지 생성은 관리자 권한이 필요합니다.");
                        return;
                      }
                      generateImage();
                    }}
                    disabled={isImageGenerating || cooldownTime > 0}
                    className={`generate-btn w-full${(!isAdmin || isImageGenerating || cooldownTime > 0) ? '' : ' point-color'}`}
                    style={{
                      background: (!isAdmin || isImageGenerating || cooldownTime > 0) ? '#48484A' : undefined,
                      cursor: (!isAdmin || isImageGenerating || cooldownTime > 0) ? 'not-allowed' : 'pointer',
                      opacity: !isAdmin ? 0.7 : 1
                    }}
                  >
                    <ImageIcon className="w-5 h-5 text-white" />
                    <span>
                      {isImageGenerating ? 'GENERATING...' :
                        cooldownTime > 0 ? `COOLDOWN (${cooldownTime}s)` : 'GENERATE IMAGE'}
                    </span>
                  </button>
                )}
              </div>

              {isImageGenerating && (
                <div className="result-card" style={{ marginTop: '32px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="skeleton-pulse"></div>
                  <p style={{ color: '#8E8E93', fontSize: '12px', fontWeight: 600, zIndex: 1, position: 'relative' }}>
                    {selectedApi === 'google' ? 'Generating with Gemini...' : 'Generating with FLUX.1...'}
                  </p>
                </div>
              )}

              {!isImageGenerating && generatedPrompt && (
                <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} className="mt-12 space-y-8">

                  <div className="flex flex-col items-center mb-[-16px]">
                    <div className="w-8 h-1 bg-black dark:bg-white rounded-full mt-1 opacity-10"></div>
                  </div>

                  {generatedImage ? (
                    <div className="image-result-card relative group">
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full h-auto cursor-zoom-in"
                        onClick={() => setLightboxImage(generatedImage)}
                      />

                      {/* Prompt tooltip on hover */}
                      <div className="image-prompt-tooltip">
                        <p>{generatedPrompt.length > 120 ? generatedPrompt.slice(0, 120) + '...' : generatedPrompt}</p>
                      </div>

                      {isUpscaling && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: 'white', fontWeight: 'bold', letterSpacing: '0.1em', zIndex: 10 }}>
                          UPSCALING...
                        </div>
                      )}

                      <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 20 }}>
                        <button onClick={simulateUpscale} className="ios-pill" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', backdropFilter: 'blur(10px)' }}>
                          2x Upscale
                        </button>
                        <button onClick={handleDownload} className="ios-pill" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', backdropFilter: 'blur(10px)' }}>
                          Download
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <PromptOutput prompt={generatedPrompt} />

                  <div className="save-card">
                    <div className="ios-option-label mb-3">Save Preset</div>
                    <div className="save-bar">
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Preset name..."
                        className="save-input"
                      />
                      <button
                        onClick={handleSaveTemplate}
                        disabled={isSaving}
                        className={`save-btn ${isSaved ? 'saved' : ''}`}
                      >
                        {isSaving ? '저장 중...' : isSaved ? 'Complete ✓' : 'Save'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="library" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 relative pb-20">
            <button className="ios-library-close" onClick={() => setActiveTab('home')}>
              <X size={18} strokeWidth={1.5} />
            </button>
            <h2 className="ios-section-title">Library</h2>

            <div className="ios-category-tabs" style={{ marginTop: '0', marginBottom: '16px', overflowX: 'auto', whiteSpace: 'nowrap', padding: '4px' }}>
              <button className={`category-tab ${libraryFilter === '전체' ? 'active' : ''}`} style={{ padding: '8px 12px' }} onClick={() => setLibraryFilter('전체')}>전체</button>
              {OPTIONS_DATA.spaceType.map(space => (
                <button
                  key={space}
                  className={`category-tab ${libraryFilter === space ? 'active' : ''}`}
                  style={{ padding: '8px 12px' }}
                  onClick={() => setLibraryFilter(space)}
                >
                  {space}
                </button>
              ))}
            </div>

            <div className="ios-library-grid">
              {(libraryFilter === '전체' ? savedTemplates : savedTemplates.filter(t => t.config?.spaceType === libraryFilter)).map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onLoad={(t) => {
                    handleLoadTemplate(t);
                    setActiveTab('home');
                  }}
                  onDelete={handleDeleteTemplate}
                  onRename={(id, name) => {
                    setRenameTarget({ id, name });
                    setNewPresetName(name);
                  }}
                  onMoveRequest={(t) => setMoveTarget(t)}
                  onViewPrompt={(t) => setPromptModalTarget(t)}
                  categories={OPTIONS_DATA.spaceType}
                />
              ))}
              {(libraryFilter === '전체' ? savedTemplates : savedTemplates.filter(t => t.config?.spaceType === libraryFilter)).length === 0 && (
                <div className="col-span-2 text-center py-20 bg-white rounded-3xl ios-shadow">
                  <LayoutTemplate className="w-12 h-12 text-gray-200 mb-4 mx-auto" />
                  <p className="text-gray-400 font-bold m-0">No templates found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="ios-footer">
        v0.48 Stable | Developed by Gony
      </footer>
      <div className="h-12"></div>
    </div>
  );
}