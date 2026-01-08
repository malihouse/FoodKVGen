import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Settings, Terminal, CheckCircle, Download, LayoutGrid, Loader2, 
  AlertCircle, Play, Pencil, Save, Check, Monitor, Image as ImageIcon, 
  Type, Layers, Ratio, Upload, RefreshCw, Maximize2, X, Globe, Copy, Camera,
  ChevronRight, Languages, ShieldCheck, Sparkles, BoxSelect, Plus, Lock, 
  Target, Wand2, Info, RotateCcw, Bug, Activity, FileJson, ImagePlus
} from 'lucide-react';

// --- 核心模型配置 (严格锁定 Pro 系列) ---
const TEXT_MODEL = "gemini-3-pro-preview";
const IMAGE_MODEL = "gemini-3-pro-image-preview";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// --- 国际化字典 ---
const i18n = {
  cn: {
    siteTitle: "Food Vision AI",
    tagline: "顶级美食海报策划系统",
    placeholder: "输入菜品名称，策划您的品牌视觉...",
    planHeroBtn: "第一步：策划 HERO 锚点",
    extendSuiteBtn: "第二步：同步视觉基因，延展全案",
    modeI: "灵感模式 (I)",
    modeR: "参考模式 (R)",
    uploadRef: "上传菜品素材",
    access: "接入设置",
    ratio: "画布比例",
    quality: "画质分辨率",
    language: "输出语种",
    brand: "品牌信息 (可选)",
    brandName: "品牌名称",
    logoUpload: "点击上传 Logo",
    photoStyle: "画面风格",
    typoStyle: "视觉排版",
    copyTone: "文案倾向",
    assets: "素材规划 / Assets",
    rendering: "正在创作...",
    awaiting: "等待锚点确立",
    syncingDNA: "同步视觉基因中...",
    rethink: "重构",
    render: "生成图片",
    copy: "复制指令",
    edit: "编辑",
    emptyState: "输入产品名称并配置品牌，开启您的品牌视觉策划",
    thinking: "正在构思视觉方案...",
    analyzing: "正在分析 Logo 特征与视觉基准...",
    successCopy: "已复制到剪贴板",
    anchorMissing: "请先渲染完成 KV01 锚点图",
    step1Desc: "请先策划并渲染 KV01，确立核心食材的视觉基准",
    step2Desc: "锚点图已就绪，AI 将以此为核心延展全套方案",
    configUpdated: "设置已刷新，请点击按钮重新生成策划以同步",
    reset: "重置方案",
    tracker: "系统追踪日志",
    refAdded: "已添加参考图"
  },
  en: {
    siteTitle: "Food Vision AI",
    tagline: "Elite Food Poster Planner",
    placeholder: "Enter dish name to start...",
    planHeroBtn: "Step 1: Plan HERO Anchor",
    extendSuiteBtn: "Step 2: Sync DNA & Extend Suite",
    modeI: "Imagination",
    modeR: "Reference",
    uploadRef: "Upload Ref",
    access: "Access Point",
    ratio: "Aspect Ratio",
    quality: "Quality Resolution",
    language: "Output Language",
    brand: "Brand Info (Opt.)",
    brandName: "Brand Name",
    logoUpload: "Upload Logo",
    photoStyle: "Art Style",
    typoStyle: "Typography Style",
    copyTone: "Copy Tone",
    assets: "Assets Selection",
    rendering: "Crafting...",
    awaiting: "Awaiting Anchor",
    syncingDNA: "Syncing Visual DNA...",
    rethink: "Re-think",
    render: "Render",
    copy: "Copy Prompt",
    edit: "Edit",
    emptyState: "Define dish and brand to initiate workflow",
    thinking: "Crafting strategy...",
    analyzing: "Analyzing visual baseline...",
    successCopy: "Copied to clipboard",
    anchorMissing: "Render KV01 first",
    step1Desc: "Plan and render KV01 to define core ingredient DNA",
    step2Desc: "Anchor ready. Extending full brand suite now",
    configUpdated: "Config updated. Please re-plan to sync prompts.",
    reset: "Reset All",
    tracker: "System Tracker",
    refAdded: "Reference Attached"
  }
};

// --- 配置常量 ---
const RESOLUTIONS = [
  { label: 'Standard (1K)', value: '1024x1024' },
  { label: 'HD (2K)', value: '2048x2048' },
  { label: 'Ultra (4K)', value: '4096x4096' },
];

const RATIOS = [
  { label: '1:1', value: '1:1', desc: 'Square' },
  { label: '3:4', value: '3:4', desc: 'Portrait' },
  { label: '16:9', value: '16:9', desc: 'Landscape' },
  { label: '9:16', value: '9:16', desc: 'Story' },
];

const TONES = [
  { id: 'minimal', cn: '极简禅意', en: 'Zen Minimalist', desc: '强调食材原力，文案短促有力' },
  { id: 'luxury', cn: '奢华杂志', en: 'Luxury Editorial', desc: '高级感，强调匠心与稀缺' },
  { id: 'cravable', cn: '深夜食堂', en: 'Cravable & Juicy', desc: '感官刺激，强调食欲与风味' },
  { id: 'promo', cn: '促销转化', en: 'Action-Oriented', desc: '营销力强，包含 CTA 引导' },
];

const PHOTOGRAPHY_STYLES = [
  { id: 'commercial', cn: '商业摄影', en: 'Pro Commercial', prompt: 'high-end professional commercial food photography, clean studio softbox lighting, crisp highlights, vibrant natural colors, sharp focus, 8k details' },
  { id: 'cinematic', cn: '电影质感', en: 'Cinematic Mood', prompt: 'cinematic lighting, moody atmosphere, warm golden hour tones, storytelling composition, film-like quality' },
  { id: 'rustic', cn: '复古烟火', en: 'Rustic Dark', prompt: 'rustic dark moody food photography, vintage aesthetic, natural window side-lighting, organic textures, wooden background, artisanal plating style' },
  { id: 'bright', cn: '清新自然', en: 'Bright Natural', prompt: 'bright airy food photography, high-key lighting, soft natural daylight, fresh and appetizing, clean pastel tones' },
  { id: 'chinese_pastoral', cn: '中式田园', en: 'Chinese Pastoral', prompt: 'Chinese pastoral aesthetic, ink wash painting nuances, misty atmosphere, soft natural window light, rustic bamboo and wood utensils, serene zen-like arrangement' },
  { id: 'american_comic', cn: '美漫风格', en: 'American Comic', prompt: 'American comic book art style, bold ink lines, cel-shading, pop art aesthetic, vibrant saturated colors' }
];

const TYPOGRAPHY_STYLES = [
  { id: 'swiss', cn: '瑞士极简', en: 'Swiss Minimal', prompt: 'Swiss graphic design layout, minimalist grid system, bold geometric sans-serif, negative space' },
  { id: 'bold', cn: '强力广告', en: 'Impact Ad', prompt: 'bold impactful advertising typography, high contrast text, promotional font hierarchy' },
  { id: 'serif', cn: '杂志版式', en: 'Editorial Serif', prompt: 'sophisticated magazine editorial layout, elegant serif font, luxury feel' },
  { id: 'hand', cn: '艺术手写', en: 'Artisan Script', prompt: 'organic hand-drawn artistic lettering, warm human touch' },
];

const POSTER_TYPES = [
  { id: 'KV01', cn: '主视觉锚点 (必选)', en: 'HERO Anchor (Required)', mandatory: true },
  { id: 'KV02', cn: '场景主图', en: 'Lifestyle Scene' },
  { id: 'KV03', cn: '转化主图', en: 'Conversion Main' },
  { id: 'KV04A', cn: '核心质地', en: 'Macro Texture' },
  { id: 'KV04B', cn: '酱汁挂壁', en: 'Macro Sauce' },
  { id: 'KV04C', cn: '主料细节', en: 'Macro Main' },
  { id: 'KV04D', cn: '颗粒分明', en: 'Macro Grain' },
  { id: 'KV04E', cn: '热气氛围', en: 'Macro Aroma' },
  { id: 'KV05', cn: '配料搭配', en: 'Ingredients' },
  { id: 'KV06', cn: '整菜拆解', en: 'Deconstruction' },
];

const TARGET_LANGUAGES = [
  { id: 'cn', cn: '简体中文', en: 'Chinese', instruction: 'MANDATORY: Generate ALL text content in Simplified Chinese characters ONLY.' },
  { id: 'bi', cn: '中英双语', en: 'Bilingual', instruction: 'MANDATORY: Generate ALL text content in BOTH Simplified Chinese and English. FORMAT: "Chinese Content" followed by "English Content" on a new line. STRICTLY PROHIBITED: Do NOT use slashes "/" to separate languages.' },
  { id: 'en', cn: '纯英文', en: 'English', instruction: 'MANDATORY: Generate ALL text content strictly in English.' },
  { id: 'jp', cn: '日本語', en: 'Japanese', instruction: 'MANDATORY: Generate ALL text content strictly in Japanese.' },
];

const App = () => {
  const [lang, setLang] = useState('cn');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gv_api_key') || ""); 
  const [dishName, setDishName] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [posters, setPosters] = useState([]);
  const [error, setError] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [configStale, setConfigStale] = useState(false);
  
  const [logs, setLogs] = useState([]);
  // const [showTracker, setShowTracker] = useState(false); // Tracker 已隐藏

  const [brandName, setBrandName] = useState('');
  const [copyTone, setCopyTone] = useState('cravable');
  const [selectedTypes, setSelectedTypes] = useState(['KV01', 'KV02', 'KV03', 'KV04A']);
  const [resolution, setResolution] = useState('1024x1024');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [photoStyleId, setPhotoStyleId] = useState('commercial');
  const [typoStyleId, setTypoStyleId] = useState('swiss');
  const [targetLang, setTargetLang] = useState('bi');
  const [mode, setMode] = useState('I');
  const [refImage, setRefImage] = useState(null);

  const t = (key) => i18n[lang][key];

  const addLog = (msg, type = 'info') => {
    // 逻辑保留，仅隐藏 UI
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 30));
  };

  useEffect(() => {
    if (posters.length > 0) setConfigStale(true);
  }, [brandName, copyTone, resolution, aspectRatio, photoStyleId, typoStyleId, targetLang]);

  const fileToBas64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBas64(file);
      const data = { file, preview: URL.createObjectURL(file), base64, mimeType: file.type };
      addLog(`Added reference image: ${file.name}`);
      setPosters([]);
      setStatus('idle');
      setRefImage(data);
    } catch (err) { 
      addLog(`Image processing failed: ${err.message}`, 'error');
      setError("Image Processing Failed"); 
    }
  };

  const robustParseShot = (data, shotId) => {
    if (!data) return null;
    const defaults = {
      'KV03': 'TASTE THE FRESHNESS',
      'KV04A': 'TEXTURE / 口感质地',
      'KV04B': 'SAUCE / 酱汁挂壁',
      'KV04C': 'MAIN / 主料细节',
      'KV04D': 'GRAIN / 颗粒分明',
      'KV04E': 'AROMA / 热气香气',
      'KV06': 'WHAT’S INSIDE'
    };
    const copyRaw = data.copywriting || data.copy || data.text_content || {};
    const copywriting = {
      headline: copyRaw.headline || copyRaw.title || copyRaw.header || defaults[shotId] || "DELICIOUS MOMENT",
      subhead: copyRaw.subhead || copyRaw.subtitle || copyRaw.desc || "",
      slogan: copyRaw.slogan || copyRaw.tagline || ""
    };
    const p = data.prompt || data.image_prompt || data.visual_prompt || data.content || data.description || "";
    return {
      id: shotId || (data.id || "").toString().toUpperCase().trim(),
      copywriting,
      prompt: p,
      title: data.title || ""
    };
  };

  const extractJson = (text) => {
    if (!text || typeof text !== 'string') return null;
    try {
      addLog(`Parsing response...`, "info");
      const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) return JSON.parse(codeBlockMatch[1]);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      addLog(`JSON Parse failed: ${e.message}`, "error");
      return null;
    }
  };

  const fetchWithRetry = async (url, options, retries = 3, backoff = 1500) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok && (response.status === 503 || response.status === 429)) {
        const errorBody = await response.text(); 
        throw new Error(`Server Busy (${response.status}): ${errorBody}`);
      }
      return response;
    } catch (err) {
      if (retries > 0) {
        addLog(`${t('serverBusy')} (${retries})`, "info");
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw err;
    }
  };

  const callGeminiText = async (systemInstruction, userParts, schema = null) => {
    addLog(`Calling ${TEXT_MODEL}...`, "info");
    const body = {
      contents: [{ parts: userParts }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
    };
    if (schema) body.generationConfig.responseSchema = schema;

    try {
      const response = await fetchWithRetry(`${API_BASE}/${TEXT_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      if (!response.ok) {
        const msg = result.error?.message || `HTTP ${response.status}`;
        addLog(`API ERROR: ${msg}`, "error");
        throw new Error(msg);
      }

      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("AI Engine returned empty content");
      
      addLog(`Raw AI response length: ${rawText.length}`, "info");
      const data = extractJson(rawText);
      if (!data) throw new Error("Failed to parse visual plan JSON");
      
      return data;
    } catch (err) {
      addLog(`Text Gen Failed: ${err.message}`, "error");
      throw err;
    }
  };

  const GET_PROMPT_TEMPLATE = (langObj, tone, typoStyle, photoStyle, brandName) => `
    Generate the "prompt" string using this EXACT Markdown-like structure (Do NOT summarize):

    === FOOD KV [ID] : [TITLE] ===

    ${photoStyle.prompt}
    
    DISH (DETAILED):
    [Describe ingredient DNA: species, texture, cut, color, gloss]

    VISUALS:
    Lighting: [Commercial Studio / Natural]
    Composition: [Swiss Grid / Thirds]

    TEXT RENDER INSTRUCTIONS:
    Headline: "[Headline]" (Font: ${typoStyle.en})
    Subhead: "[Subhead]" (Font: Elegant Sans/Serif)
    Slogan: "[Slogan]"
    Placement: Balanced with negative space. 
    Language: ${langObj.instruction} (Use newlines for bilingual, NO slashes)

    BRANDING:
    ${brandName ? `Render brand name "${brandName}" as logo top-left` : 'NO LOGOS'}
  `;

  const PLAN_SCHEMA = {
    type: "OBJECT",
    properties: {
      shots: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            copywriting: {
              type: "OBJECT",
              properties: { headline: { type: "STRING" }, subhead: { type: "STRING" }, slogan: { type: "STRING" } },
              required: ["headline", "subhead", "slogan"]
            },
            prompt: { type: "STRING" }
          },
          required: ["id", "copywriting", "prompt"]
        }
      }
    },
    required: ["shots"]
  };

  const GET_YAML_INSTRUCTIONS = () => `
    【MANDATORY: COPYWRITING & LAYOUT DESIGN (YAML STANDARDS)】
    1. Visual Hierarchy: treat every image as a commercial advertisement layout.
    2. Data Mapping: use exact content from "copywriting" for rendering instructions.
    3. Mandatory prompt keyword: include "RENDER THE TEXT: '[headline content]'" and describe its placement clearly.
    4. Swiss Grid System: Maintain plenty of negative space. No random logos.
  `;

  const handleGenerateAnchorPlan = async () => {
    if (!dishName) return setError(t('placeholder'));
    if (!apiKey) return setError("Please enter API Key");
    
    setError(null);
    setStatus('thinking');
    setConfigStale(false);
    
    const placeholders = selectedTypes.map(id => ({ id, status: 'pending', isLocked: id !== 'KV01', copywriting: null, prompt: '' }));
    setPosters(placeholders);

    try {
      const langObj = TARGET_LANGUAGES.find(l => l.id === targetLang);
      const tone = TONES.find(t => t.id === copyTone);
      const photoStyle = PHOTOGRAPHY_STYLES.find(s => s.id === photoStyleId);
      const typoStyle = TYPOGRAPHY_STYLES.find(s => s.id === typoStyleId);

      const currentMode = refImage ? 'R' : 'I';
      const systemInstruction = `
        You are a Master Creative Director. Dish: "${dishName}". Brand: "${brandName || 'Premium Food'}". Tone: ${tone.en}.
        Mode: ${currentMode} - ${refImage ? 'REFERENCE' : 'IMAGINATION'}
        Language: ${langObj.instruction}
        MANDATORY: Return a JSON object containing a "shots" array.
        Ensure "prompt" field is populated with detailed visual description following this template:
        ${GET_PROMPT_TEMPLATE(langObj, tone.en, typoStyle, photoStyle, brandName)}
      `;
      
      const userParts = [];
      if (refImage) {
        userParts.push({ inlineData: { mimeType: refImage.mimeType, data: refImage.base64 } });
        userParts.push({ text: `Analyze this image carefully. Generate HERO KV01 planning. Language: ${langObj.en}. Style: ${photoStyle.prompt}.` });
      } else {
        userParts.push({ text: `Generate HERO KV01 visual concept for ${dishName}. Language: ${langObj.en}. Style: ${photoStyle.prompt}.` });
      }

      const planData = await callGeminiText(systemInstruction, userParts, PLAN_SCHEMA);
      
      const rawShots = Array.isArray(planData) ? planData : (planData.shots || []);
      let rawKV01 = rawShots.find(s => s.id && s.id.toString().toUpperCase().includes('KV01'));
      
      if (!rawKV01 && typeof planData === 'object') {
        Object.keys(planData).forEach(k => {
          if (k.toUpperCase().includes('KV01')) rawKV01 = planData[k];
        });
      }
      
      if (!rawKV01) throw new Error("KV01 missing in response");

      const kv01Data = robustParseShot(rawKV01, 'KV01');
      if (!kv01Data.prompt || kv01Data.prompt.trim().length < 5) throw new Error("AI returned empty prompt");

      setPosters(prev => prev.map(p => (p.id === 'KV01') ? { ...p, ...kv01Data, isLocked: false } : p));
      setStatus('planned');
      addLog(`Anchor Successful. Mode: ${currentMode}`, "success");
    } catch (err) {
      addLog(`Planning Failed: ${err.message}`, "error");
      setError(`Planning Failed: ${err.message}`);
      setPosters([]);
      setStatus('idle');
    }
  };

  const handleExtendSuite = async () => {
    const anchor = posters.find(p => p.id === 'KV01');
    if (!anchor || !anchor.url) return setError(t('anchorMissing'));
    
    setError(null);
    setStatus('extending');
    setConfigStale(false);
    addLog(`--- STEP 2: EXTENDING SUITE ---`);

    try {
      const remainingIds = selectedTypes.filter(id => id !== 'KV01');
      const langObj = TARGET_LANGUAGES.find(l => l.id === targetLang);
      const tone = TONES.find(t => t.id === copyTone);
      const photoStyle = PHOTOGRAPHY_STYLES.find(s => s.id === photoStyleId);
      const typoStyle = TYPOGRAPHY_STYLES.find(s => s.id === typoStyleId);

      const systemInstruction = `
        Elite Brand Designer. Base visual DNA from KV01. Extend full suite for: [${remainingIds.join(', ')}].
        Target Product: "${dishName}". Brand: "${brandName || 'Premium Food'}".
        
        【MANDATORY PROMPT FORMAT】
        ${GET_PROMPT_TEMPLATE(langObj, tone.en, typoStyle, photoStyle, brandName)}
        
        Return JSON object with key "shots" (array).
      `;

      const anchorB64 = anchor.url.split(',')[1];
      const userParts = [
        { inlineData: { mimeType: "image/png", data: anchorB64 } },
        { text: `Reference this KV01 Visual DNA. The product is "${dishName}". Generate consistent prompts for: ${remainingIds.join(', ')}.` }
      ];

      const planData = await callGeminiText(systemInstruction, userParts, PLAN_SCHEMA);
      const rawShots = Array.isArray(planData) ? planData : (planData.shots || []);
      const parsedPool = [];
      
      rawShots.forEach(s => {
          const parsed = robustParseShot(s, s.id);
          if (parsed) parsedPool.push(parsed);
      });
      
      if (parsedPool.length === 0 && typeof planData === 'object') {
         Object.keys(planData).forEach(key => {
           if (typeof planData[key] === 'object') {
             const parsed = robustParseShot(planData[key], key);
             if (parsed) parsedPool.push(parsed);
           }
         });
      }
      
      addLog(`Extracted ${parsedPool.length} valid assets from AI response.`, "info");

      setPosters(prev => prev.map((p, indexInArr) => {
        if (p.id === 'KV01') return p;
        
        // 智能替补匹配逻辑
        let newData = parsedPool.find(s => s && s.id && (s.id.toUpperCase().includes(p.id.toUpperCase()) || p.id.toUpperCase().includes(s.id.toUpperCase())));
        
        if (!newData && parsedPool.length > 0) {
           const poolIndex = indexInArr - 1; 
           if (parsedPool[poolIndex]) {
             newData = parsedPool[poolIndex];
             addLog(`Fallback match: Assigned ${newData.id} data to ${p.id}`, "info");
           }
        }
        
        return newData ? { ...p, ...newData, id: p.id, isLocked: false } : p;
      }));
      
      setStatus('planned');
      addLog(`Suite Extended.`, "success");
    } catch (err) {
      addLog(`Extension Failed: ${err.message}`, "error");
      setError(`Extension Failed: ${err.message}`);
      setStatus('planned');
    }
  };

  const handleRenderShot = async (idx) => {
    const shot = posters[idx];
    if (!shot.prompt) return;
    addLog(`Rendering ${shot.id}...`);
    setPosters(prev => {
      const next = [...prev];
      if (next[idx]) next[idx].status = 'generating';
      return next;
    });

    try {
      const resMap = { '1024x1024': '1K', '2048x2048': '2K', '4096x4096': '4K' };
      const response = await fetchWithRetry(`${API_BASE}/${IMAGE_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: shot.prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio, imageSize: resMap[resolution] || '1K' } }
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Imaging failure");
      const b64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (!b64) throw new Error("Image missing");
      setPosters(prev => {
        const next = [...prev];
        if (next[idx]) { next[idx].status = 'completed'; next[idx].url = `data:image/png;base64,${b64}`; }
        return next;
      });
      addLog(`Rendered ${shot.id}`, "success");
    } catch (err) {
      addLog(`Render error: ${err.message}`, "error");
      setPosters(prev => {
        const next = [...prev];
        if (next[idx]) next[idx].status = 'error';
        return next;
      });
    }
  };

  const handleRethinkShot = async (idx) => {
    const shot = posters[idx];
    if (!shot) return;
    addLog(`Rethinking ${shot.id}...`);
    setPosters(prev => {
      const next = [...prev];
      if (next[idx]) { next[idx].isRethinking = true; next[idx].prompt = ""; }
      return next;
    });
    try {
      const langObj = TARGET_LANGUAGES.find(l => l.id === targetLang);
      const photoStyle = PHOTOGRAPHY_STYLES.find(s => s.id === photoStyleId);
      const typoStyle = TYPOGRAPHY_STYLES.find(s => s.id === typoStyleId);
      const tone = TONES.find(t => t.id === copyTone);
      const hasLogoInput = !!brandName;
      const logoInstruction = hasLogoInput ? `Render logo for '${brandName}'.` : `NO logo.`;

      const rethinkSystemInstruction = `Expert Food Director. ID: "${shot.id}". Dish: "${dishName}". ${GET_PROMPT_TEMPLATE(langObj, tone.en, typoStyle, photoStyle, brandName, logoInstruction)} Return JSON.`;
      const rethinkPrompt = `Please rethink concept for ${shot.id} in ${langObj.en}. Style: ${photoStyle.prompt}.`;
      const planData = await callGeminiText(rethinkSystemInstruction, [{ text: rethinkPrompt }], PLAN_SCHEMA);
      const rawShots = Array.isArray(planData) ? planData : (planData.shots || []);
      const newData = robustParseShot(rawShots[0] || planData, shot.id);
      if (!newData || !newData.prompt) throw new Error("Empty response");
      setPosters(prev => {
        const next = [...prev];
        if (next[idx]) { next[idx] = { ...next[idx], ...newData, id: shot.id, isRethinking: false, url: null, status: 'pending' }; }
        return next;
      });
      addLog(`Rethink Done.`, "success");
    } catch (err) {
      addLog(`Rethink Fail: ${err.message}`, "error");
      setPosters(prev => {
        const next = [...prev];
        if (next[idx]) { next[idx].isRethinking = false; }
        return next;
      });
    }
  };

  const handleCopyPrompt = (idx) => {
    const text = posters[idx].prompt;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setPosters(prev => {
        const next = [...prev];
        if (next[idx]) next[idx].isCopied = true;
        return next;
      });
      setTimeout(() => setPosters(prev => {
        const next = [...prev];
        if (next[idx]) next[idx].isCopied = false;
        return next;
      }), 1500);
    } catch (e) {}
    document.body.removeChild(textArea);
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCF9] text-[#2D2926] font-sans antialiased overflow-hidden text-sm selection:bg-red-50">
      
      {/* Sidebar Panel */}
      <aside className="w-[320px] bg-white border-r border-[#EBE6DF] fixed h-full z-30 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-7 border-b border-[#F3F0EC] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B0000] flex items-center justify-center text-white rounded-xl shadow-lg">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-serif text-2xl tracking-tight font-bold italic leading-none">{t('siteTitle')}</h1>
              <p className="text-[10px] text-[#A6998A] uppercase tracking-widest font-medium mt-1">{t('tagline')}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-9 custom-scrollbar pb-32">
          <ConfigSection title={t('access')} icon={<Settings size={14}/>}>
            <input type="password" placeholder="Google Cloud API Key" value={apiKey || ""} onChange={(e) => { const v = e.target.value; setApiKey(v); localStorage.setItem('gv_api_key', v); }} className="w-full bg-[#F9F8F6] border-none text-xs p-3 rounded-xl focus:ring-1 focus:ring-black outline-none font-mono placeholder-[#CEC6BC]" />
          </ConfigSection>

          <ConfigSection title={t('brand')} icon={<ShieldCheck size={14}/>}>
            <input type="text" value={brandName || ""} onChange={(e) => setBrandName(e.target.value)} placeholder={t('brandName')} className="w-full bg-[#F9F8F6] border-none text-[11px] p-2.5 rounded-lg focus:ring-1 focus:ring-black outline-none font-bold placeholder-[#CEC6BC]" />
          </ConfigSection>

          <ConfigSection title={t('ratio')} icon={<Ratio size={14}/>}>
            <div className="grid grid-cols-2 gap-2">
              {RATIOS.map(r => (
                <button key={r.value} onClick={() => setAspectRatio(r.value)} className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${aspectRatio === r.value ? 'bg-[#2D2926] text-white border-[#2D2926] shadow-md' : 'bg-white border-[#F3F0EC] text-[#A6998A] hover:border-[#CEC6BC]'}`}>
                  <span className="font-bold">{r.label}</span>
                  <span className="text-[8px] uppercase opacity-60 font-medium">{r.desc}</span>
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title={t('quality')} icon={<Monitor size={14}/>}>
            <div className="grid grid-cols-1 gap-1.5">
              {RESOLUTIONS.map(res => (
                <button key={res.value} onClick={() => setResolution(res.value)} className={`text-[10px] py-2.5 rounded-xl border-2 font-bold transition-all ${resolution === res.value ? 'bg-[#2D2926] text-white border-[#2D2926]' : 'bg-white border-[#F3F0EC] text-[#A6998A] hover:border-[#CEC6BC]'}`}>{res.label}</button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title={t('language')} icon={<Globe size={14}/>}>
            <div className="grid grid-cols-2 gap-2">
              {TARGET_LANGUAGES.map(l => (
                <button key={l.id} onClick={() => setTargetLang(l.id)} className={`text-[10px] py-2 rounded-xl border-2 font-bold transition-all ${targetLang === l.id ? 'bg-[#8B0000] text-white border-[#8B0000]' : 'bg-white border-[#F3F0EC] text-[#A6998A]'}`}>{lang === 'cn' ? l.cn : l.en}</button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title={t('photoStyle')} icon={<Camera size={14}/>}>
            <div className="grid grid-cols-1 gap-1.5">
              {PHOTOGRAPHY_STYLES.map(s => (
                <button key={s.id} onClick={() => setPhotoStyleId(s.id)} className={`w-full text-left p-2.5 border-2 rounded-xl transition-all ${photoStyleId === s.id ? 'border-[#2D2926] bg-[#2D2926] text-white shadow-sm' : 'border-[#F3F0EC] bg-white text-[#5C554E] hover:border-[#CEC6BC]'}`}>
                  <div className="text-[11px] font-bold uppercase tracking-tight">{lang === 'cn' ? s.cn : s.en}</div>
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title={t('copyTone')} icon={<Type size={14}/>}>
            <div className="space-y-1.5">
              {TONES.map(tone => (
                <button key={tone.id} onClick={() => setCopyTone(tone.id)} className={`w-full text-left p-3 border-2 rounded-xl transition-all ${copyTone === tone.id ? 'border-red-800 bg-red-50/50' : 'border-[#F3F0EC] bg-white text-[#5C554E]'}`}>
                  <div className="text-[10px] font-bold uppercase tracking-tight">{lang === 'cn' ? tone.cn : tone.en}</div>
                </button>
              ))}
            </div>
          </ConfigSection>

          <ConfigSection title={t('assets')} icon={<Layers size={14}/>}>
            <div className="grid grid-cols-1 gap-1 px-1">
              {POSTER_TYPES.map(t_type => (
                <div key={t_type.id} onClick={() => !t_type.mandatory && setSelectedTypes(prev => prev.includes(t_type.id) ? prev.filter(x => x !== t_type.id) : [...prev, t_type.id])} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${selectedTypes.includes(t_type.id) ? 'bg-[#F3F0EC] text-[#2D2926]' : 'text-[#A6998A]'} ${t_type.mandatory ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${selectedTypes.includes(t_type.id) ? 'bg-[#2D2926] border-[#2D2926]' : 'border-[#EBE6DF]'}`}>{selectedTypes.includes(t_type.id) && <Check size={10} className="text-white" strokeWidth={5} />}</div>
                  <div className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis">{lang === 'cn' ? t_type.cn : t_type.en}</div>
                </div>
              ))}
            </div>
          </ConfigSection>
        </div>
        {/* Tracker Removed */}
      </aside>

      <main className="flex-1 ml-[320px] relative flex flex-col min-h-screen bg-[#FDFCF9]">
        <header className="sticky top-0 bg-[#FDFCF9]/90 backdrop-blur-2xl border-b border-[#EBE6DF] z-20 px-10 py-5 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#8B0000]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D2926]">Pro Creative Workspace</span>
              </div>
              <div className="flex gap-3">
                {posters.length > 0 && (
                  <button onClick={() => { setPosters([]); setStatus('idle'); setConfigStale(false); setLogs([]); }} className="flex items-center gap-2 text-[9px] font-bold uppercase bg-white border border-[#EBE6DF] px-3.5 py-1.5 rounded-full hover:border-red-800 transition-all shadow-sm whitespace-nowrap"><RotateCcw size={12}/> {t('reset')}</button>
                )}
                <button onClick={() => setLang(lang === 'cn' ? 'en' : 'cn')} className="flex items-center gap-2 text-[9px] font-bold uppercase bg-white border border-[#EBE6DF] px-3.5 py-1.5 rounded-full hover:border-black transition-all shadow-sm"><Languages size={14}/> {lang === 'cn' ? 'EN' : 'CN'}</button>
              </div>
            </div>

            <div className="flex gap-3 items-stretch">
              <div className="flex-1 flex gap-3 bg-white p-2.5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#EBE6DF] focus-within:border-black transition-all">
                <input type="text" placeholder={t('placeholder')} value={dishName || ""} onChange={(e) => setDishName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (posters.length === 0 ? handleGenerateAnchorPlan() : null)} className="flex-1 bg-transparent px-4 text-base font-medium outline-none placeholder-[#CEC6BC]" />
                
                <div className="relative w-12 h-12 shrink-0 cursor-pointer group">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className={`w-full h-full flex flex-col items-center justify-center border-2 rounded-xl transition-all overflow-hidden bg-[#F9F8F6] ${refImage ? 'border-[#8B0000] shadow-lg' : 'border-dashed border-[#CEC6BC] hover:border-black'}`}>
                    {refImage ? (
                      <img src={refImage.preview} className="w-full h-full object-cover" alt="ref" />
                    ) : (
                      <ImagePlus size={18} className="text-[#CEC6BC] group-hover:text-black transition-colors" />
                    )}
                  </div>
                  {refImage && (
                    <button onClick={(e) => { e.stopPropagation(); setRefImage(null); setPosters([]); setStatus('idle'); }} className="absolute -top-1.5 -right-1.5 bg-black text-white p-1 rounded-full shadow-lg hover:bg-red-800 transition-colors z-20"><X size={10}/></button>
                  )}
                </div>
              </div>
              
              {posters.length === 0 ? (
                <button onClick={handleGenerateAnchorPlan} disabled={status === 'thinking'} className="bg-[#2D2926] text-white px-8 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#8B0000] transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:bg-[#EBE6DF] whitespace-nowrap">
                  {status === 'thinking' ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                  <span className="ml-2 font-black">{t('planHeroBtn')}</span>
                </button>
              ) : (
                <button onClick={handleExtendSuite} disabled={status === 'thinking' || status === 'extending' || posters.find(p => p.id === 'KV01')?.status !== 'completed'} className={`px-8 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-30 disabled:bg-[#CEC6BC] animate-in zoom-in-95 duration-300 whitespace-nowrap ${configStale ? 'bg-red-800 text-white animate-pulse' : 'bg-red-800 text-white'}`}>
                  {status === 'extending' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  <span className="ml-2 font-black">{t('extendSuiteBtn')}</span>
                </button>
              )}
            </div>
            {refImage && (
              <div className="flex items-center gap-2 px-1 animate-in slide-in-from-left duration-300">
                <div className="w-1.5 h-1.5 bg-[#8B0000] rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#8B0000]">{t('refAdded')}</span>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="mx-10 mt-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-top-1"><div className="bg-[#FFF5F5] text-[#8B0000] p-4 rounded-2xl border border-[#FFE5E5] flex items-center gap-4 text-[11px] font-medium leading-relaxed shadow-sm"><AlertCircle size={16}/> {error}</div></div>
        )}

        {configStale && posters.length > 0 && (
          <div className="mx-10 mt-6 max-w-4xl mx-auto w-full animate-in slide-in-from-top-2 duration-300">
             <div className="bg-amber-50 border border-amber-100 text-amber-800 p-3 px-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Info size={16}/>
                  <span className="text-xs font-bold">{t('configUpdated')}</span>
                </div>
                <button onClick={handleGenerateAnchorPlan} className="text-[10px] font-black uppercase tracking-widest bg-amber-200/50 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-all whitespace-nowrap">Refine Suite</button>
             </div>
          </div>
        )}

        {posters.length > 0 && (
          <div className="mx-10 mt-6 max-w-4xl mx-auto w-full flex items-center gap-6 animate-in slide-in-from-top-2 duration-500">
             <div className="flex-1 bg-white p-4 rounded-2xl border border-[#EBE6DF] shadow-sm flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${posters.find(p => p.id === 'KV01')?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-800 text-white animate-pulse shadow-[0_0_15px_rgba(139,0,0,0.4)]'}`}>1</div>
                <div><p className="text-[11px] font-bold uppercase tracking-tight">{posters.find(p => p.id === 'KV01')?.status === 'completed' ? 'Pro Anchor Locked' : 'Step 1: Set Pro Anchor'}</p><p className="text-[9px] text-[#A6998A] font-medium">{t('step1Desc')}</p></div>
             </div>
             <ChevronRight className="text-[#CEC6BC]" size={20}/>
             <div className={`flex-1 bg-white p-4 rounded-2xl border border-[#EBE6DF] shadow-sm flex items-center gap-4 ${posters.find(p => p.id === 'KV01')?.status !== 'completed' ? 'opacity-40 grayscale' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${posters.every(p => !p.isLocked) && posters.length > 1 ? 'bg-green-100 text-green-700' : 'bg-[#2D2926] text-white'}`}>2</div>
                <div><p className="text-[11px] font-bold uppercase tracking-tight">Step 2: Pro Suite</p><p className="text-[9px] text-[#A6998A] font-medium">{t('step2Desc')}</p></div>
             </div>
          </div>
        )}

        <div className="p-10 w-full max-w-[1100px] mx-auto flex-1 overflow-y-auto custom-scrollbar">
          {status === 'idle' && (
            <div className="h-[50vh] flex flex-col items-center justify-center text-[#EBE6DF] select-none animate-in fade-in duration-700">
              <LayoutGrid size={60} strokeWidth={0.5} className="mb-6 opacity-30" />
              <p className="text-lg font-serif italic tracking-wide text-[#A6998A] text-center px-10 leading-relaxed">{t('emptyState')}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-20 pb-60">
            {posters.map((poster, idx) => (
              <div key={poster.id} className={`bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-[#EBE6DF]/40 flex flex-col lg:flex-row group relative overflow-hidden transition-all duration-700 hover:shadow-2xl w-full ${poster.isLocked ? 'opacity-40' : ''}`}>
                
                <div className="relative w-full lg:w-[45%] aspect-[3/4] bg-[#F9F8F6] overflow-hidden shrink-0 border-r border-[#F3F0EC]">
                  {poster.url ? (
                    <img src={poster.url} alt={poster.id} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                      {poster.status === 'generating' ? (
                        <div className="space-y-4 animate-pulse text-[#8B0000]"><Loader2 size={28} className="animate-spin mx-auto" /><p className="text-[9px] font-bold uppercase tracking-[0.2em]">{t('rendering')}</p></div>
                      ) : (
                        <div className="opacity-20 space-y-3 text-black">
                          {poster.isLocked || poster.isRethinking ? (
                            <Loader2 size={40} className="animate-spin mx-auto text-[#8B0000]"/>
                          ) : (
                            <ImageIcon size={40} strokeWidth={0.5} className="mx-auto" />
                          )}
                          <p className="text-[9px] font-bold uppercase tracking-widest">
                            {poster.isRethinking ? t('rethink') : (poster.isLocked ? (status === 'extending' ? t('syncingDNA') : t('awaiting')) : t('render'))}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {poster.url && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3 z-10">
                      <button onClick={() => setZoomedImage(poster.url)} className="bg-white text-black w-11 h-11 rounded-full shadow-2xl hover:bg-black hover:text-white transition-all transform hover:scale-110 flex items-center justify-center"><Maximize2 size={16} /></button>
                      <a href={poster.url} download={`${dishName || "food"}_${poster.id}.png`} className="bg-white text-black w-11 h-11 rounded-full shadow-2xl hover:bg-[#8B0000] hover:text-white transition-all transform hover:scale-110 flex items-center justify-center"><Download size={16} /></a>
                    </div>
                  )}
                  <div className="absolute top-5 left-5 z-20 flex items-center gap-2"><span className="bg-black/90 backdrop-blur-xl text-white text-[8px] font-bold px-2.5 py-1 rounded-full shadow-xl tracking-tighter uppercase">{poster.id}</span>{poster.id === 'KV01' && <span className="bg-[#8B0000] text-white text-[7px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1 shadow-sm"><ShieldCheck size={8}/> ANCHOR</span>}</div>
                </div>

                <div className="p-10 flex-1 flex flex-col gap-7 justify-center bg-gradient-to-br from-white to-[#FDFCF9]">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2.5 text-[8px] font-bold uppercase"><span className="text-[#8B0000] tracking-widest bg-[#FFF5F5] px-2.5 py-1 rounded-full border border-[#FFE5E5]">{poster.id}</span><span className="text-[#CEC6BC] tracking-widest">{aspectRatio} Ratio</span></div>
                      
                      {(status === 'extending' || poster.isRethinking) && (poster.isLocked || poster.isRethinking) ? (
                        <div className="h-8 w-3/4 bg-[#F3F0EC] animate-pulse rounded-lg" />
                      ) : (
                        <h3 className="font-serif text-2xl font-bold tracking-tight text-[#2D2926] pr-4 leading-tight">
                          {poster.copywriting?.headline || '...'}
                        </h3>
                      )}
                    </div>
                    
                    {!poster.isLocked && (
                      <div className="flex gap-2 shrink-0">
                         <button 
                            onClick={() => handleRethinkShot(idx)} 
                            disabled={poster.status === 'generating' || poster.isRethinking || status === 'extending'} 
                            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#F9F8F6] text-[#CEC6BC] hover:text-[#8B0000] hover:bg-[#FFF5F5] transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed" 
                            title={t('rethink')}
                         >
                           <RefreshCw size={18} className={poster.isRethinking ? "animate-spin" : ""} />
                         </button>
                         <button 
                            onClick={() => handleRenderShot(idx)} 
                            disabled={poster.status === 'generating' || status === 'extending' || poster.isRethinking} 
                            className="px-5 h-11 min-w-[120px] bg-[#2D2926] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#8B0000] transition-all shadow-xl active:scale-95 disabled:bg-[#CEC6BC] disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                         >
                           {poster.status === 'generating' ? <Loader2 size={14} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                           <span className="font-black">{poster.url ? "Redraw" : t('render')}</span>
                         </button>
                      </div>
                    )}
                  </div>

                  {(status === 'extending' || poster.isRethinking) && (poster.isLocked || poster.isRethinking) ? (
                    <div className="space-y-3">
                      <div className="h-4 w-1/2 bg-[#F3F0EC] animate-pulse rounded" />
                      <div className="h-3 w-1/3 bg-[#F3F0EC] animate-pulse rounded" />
                    </div>
                  ) : poster.copywriting && (
                    <div className="space-y-5 animate-in fade-in duration-700">
                      <div className="space-y-2">
                        <p className="text-xs font-serif italic text-[#A6998A]">{poster.copywriting.subhead || ""}</p>
                        <p className="text-[10px] font-bold text-[#8B0000] uppercase tracking-[0.2em]">{poster.copywriting.slogan || ""}</p>
                      </div>
                    </div>
                  )}

                  <div className="relative group/prompt flex-1">
                    {!poster.isLocked && <div className="absolute top-3 right-3 opacity-0 group-hover/prompt:opacity-100 transition-all flex gap-2 z-10 scale-90"><button onClick={() => handleCopyPrompt(idx)} className="p-2.5 bg-white/90 backdrop-blur hover:bg-black hover:text-white border border-[#F3F0EC] rounded-xl shadow-xl transition-all">{poster.isCopied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>}</button></div>}
                    
                    {poster.isEditing ? (
                      <textarea value={poster.prompt || ""} onChange={(e) => { const next = [...posters]; if(next[idx]) next[idx].prompt = e.target.value; setPosters(next); }} onBlur={() => { const next = [...posters]; if(next[idx]) next[idx].isEditing = false; setPosters(next); }} autoFocus className="w-full h-[120px] text-[10px] p-5 bg-white border-2 border-[#2D2926] rounded-[1.5rem] outline-none font-mono leading-relaxed resize-none" />
                    ) : (
                      <div 
                        onClick={() => { if(!poster.isLocked && status !== 'extending' && !poster.isRethinking) { const next = [...posters]; next[idx].isEditing = true; setPosters(next); } }} 
                        className={`w-full h-[120px] overflow-y-auto text-[10px] p-5 bg-[#F9F8F6] rounded-[1.5rem] text-[#CEC6BC] font-mono leading-relaxed whitespace-pre-wrap italic border border-transparent transition-all custom-scrollbar ${poster.isLocked || status === 'extending' || poster.isRethinking ? 'cursor-not-allowed' : 'cursor-text hover:border-[#CEC6BC]'}`}
                      >
                        {poster.isRethinking ? t('rethink') : (poster.isLocked ? (status === 'extending' ? t('syncingDNA') : "DNA not yet inherited...") : (poster.prompt || "Pending..."))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-[#2D2926]/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-500" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-10 right-10 p-4 text-white/30 hover:text-[#8B0000] transition-all bg-white/5 rounded-full"><X size={32}/></button>
          <img src={zoomedImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10" alt="HD" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

const ConfigSection = ({ title, icon, children }) => (
  <section className="space-y-3.5 animate-in slide-in-from-left duration-500"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#A6998A] leading-none">{icon} <span>{title}</span></div><div className="pl-4 border-l-2 border-[#F3F0EC] flex flex-col gap-2">{children}</div></section>
);

export default App;