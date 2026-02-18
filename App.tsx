
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Step, GenerationState, VideoMetadata, RecapData, Voice } from './types';
import { VOICES, NARRATIVE_STYLES } from './constants';
import { analyzeVideo, generateTTS, wrapPcmInWav, regenerateScriptWithStyle } from './services/geminiService';
import { Play, Upload, Mic, Sliders, CheckCircle, Video, FileText, Download, RotateCcw, Volume2, Eye, Info, Speaker, Pause, User, UserCheck, RefreshCw, AlertCircle, History, ArrowLeft, XCircle, ArrowRight, Sparkles, Ghost, Zap, Heart, Megaphone, BookOpen, Smile, Skull, ShieldAlert, Radio, Wand2, Type as TypeIcon, Flame, Waves, Wind, Key, ChevronRight, Music, Copy, Check, Settings2, VolumeX, Rewind, FastForward, Activity, Cpu, Scan, Globe, Layers, Clapperboard, Film, LayoutDashboard, Share2, ShieldCheck, Lock, ExternalLink, Settings, Maximize2, ChevronDown, ChevronUp, PenTool, Link, Save, Trash2 } from 'lucide-react';

const STYLE_SUGGESTIONS = [
  {
    label: "Sharp & Humorous",
    icon: <Smile className="w-4 h-4" />,
    text: "Speak with a sharp, clever, and fast-paced delivery. Use playful inflections and a smart, humorous tone."
  },
  {
    label: "Sarcastic & Witty",
    icon: <Sparkles className="w-4 h-4" />,
    text: "Speak with a dry, sarcastic, and witty tone. Often point out plot holes or ridiculous character decisions with a sense of humor."
  },
  {
    label: "Suspenseful Horror",
    icon: <Ghost className="w-4 h-4" />,
    text: "Create a dark and suspenseful atmosphere. Speak slowly with deep, ominous pauses to build fear and tension."
  },
  {
    label: "Epic Trailer",
    icon: <Flame className="w-4 h-4" />,
    text: "Adopt a booming, deep, and authoritative 'Voice of God' style common in cinematic trailers. High gravitas and power."
  },
  {
    label: "Warm Storyteller",
    icon: <BookOpen className="w-4 h-4" />,
    text: "Sound like a friendly and gentle storyteller. Use warm, comforting, and nostalgic tones to draw the audience in."
  },
  {
    label: "Breaking News",
    icon: <Megaphone className="w-4 h-4" />,
    text: "Adopt an urgent breaking news style. Fast-paced, serious, and highly informative, as if reporting a live event."
  },
  {
    label: "High-Energy",
    icon: <Zap className="w-4 h-4" />,
    text: "High-energy, fast-paced action style! Loud, punchy, and aggressive to match intense fight or chase scenes."
  },
  {
    label: "Documentary",
    icon: <ShieldAlert className="w-4 h-4" />,
    text: "Formal documentary style. Clear pronunciation, steady professional pace, and an authoritative, objective tone."
  },
  {
    label: "Dramatic",
    icon: <Heart className="w-4 h-4" />,
    text: "Deeply emotional and dramatic. Focus on the character's internal struggle with a heavy, empathetic, and slightly trembling voice."
  },
  {
    label: "Chill Vibe",
    icon: <Waves className="w-4 h-4" />,
    text: "A very relaxed, laid-back, and casual 'vibe'. Low energy but engaging, perfect for slice-of-life or slow-burn recaps."
  }
];

// --- Components for Neumorphic UI ---

interface NeuCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  inset?: boolean;
}

const NeuCard: React.FC<NeuCardProps> = ({ children, className = "", onClick, inset = false }) => (
  <div 
    onClick={onClick}
    className={`${inset ? 'neu-pressed' : 'neu-flat'} transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
  >
    {children}
  </div>
);

interface NeuButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'icon' | 'danger';
  className?: string;
  disabled?: boolean;
  title?: string;
}

const NeuButton: React.FC<NeuButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'secondary', 
  className = "", 
  disabled = false,
  title
}) => {
  const baseStyle = "flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";
  
  let variantStyle = "neu-btn px-6 py-3 rounded-xl hover:text-[#fe7f2d]";
  if (variant === 'primary') {
    variantStyle = "neu-btn-primary px-6 py-3 rounded-xl";
  } else if (variant === 'icon') {
    variantStyle = "neu-btn w-10 h-10 rounded-full p-0 flex items-center justify-center hover:text-[#fe7f2d]";
  } else if (variant === 'danger') {
    variantStyle = "neu-btn px-6 py-3 rounded-xl text-red-400 hover:text-red-500";
  }

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variantStyle} ${className}`} title={title}>
      {children}
    </button>
  );
};

interface CopyableFieldProps {
  label?: string;
  text: string;
  onUpdate?: (v: string) => void;
  isInput?: boolean;
  multiline?: boolean;
}

const CopyableField: React.FC<CopyableFieldProps> = ({ label, text, onUpdate, isInput = false, multiline = false }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group">
      {label && <label className="text-xs font-bold text-[#fe7f2d]/70 uppercase tracking-widest block mb-2 ml-1">{label}</label>}
      <div className="relative">
        {isInput ? (
           <input 
              type="text" 
              value={text}
              onChange={(e) => onUpdate && onUpdate(e.target.value)}
              className="w-full neu-pressed text-[#e0e6ed] px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fe7f2d]/50 transition-colors bg-transparent border-none"
           />
        ) : (
           <div onClick={handleCopy} className={`neu-pressed rounded-xl ${multiline ? 'p-4 items-start' : 'p-3 items-center'} flex justify-between cursor-pointer hover:bg-[#1f3644] transition-colors group`}>
              <span className={`text-sm text-[#e0e6ed]/90 myanmar-text ${multiline ? 'leading-relaxed' : ''}`}>{text || '-'}</span>
              {!isInput && (
                <div className={`p-1.5 rounded-full transition-colors ml-3 shrink-0 ${copied ? 'text-green-400' : 'text-[#fe7f2d]/50 group-hover:text-[#fe7f2d]'}`}>
                   {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </div>
              )}
           </div>
        )}
        
        {isInput && (
           <button 
              onClick={handleCopy}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${copied ? 'text-green-400' : 'text-[#fe7f2d]/50 hover:text-[#fe7f2d]'}`}
           >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
           </button>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Upload);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [isUpdatingAudio, setIsUpdatingAudio] = useState(false);
  const [isRewritingScript, setIsRewritingScript] = useState(false);
  const [selectedNarrativeStyle, setSelectedNarrativeStyle] = useState<string>(NARRATIVE_STYLES[0].id);
  const [originalScript, setOriginalScript] = useState<string>('');
  const [lastSyncedScript, setLastSyncedScript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const [isAudioDrawerOpen, setIsAudioDrawerOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'video' | 'manual' | 'link'>('video');
  const [manualScript, setManualScript] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  const [state, setState] = useState<GenerationState>({
    videoBlob: null,
    videoUrl: null,
    selectedVoiceId: VOICES[0].id,
    styleInstructions: STYLE_SUGGESTIONS[0].text,
    metadata: null,
    recap: null,
    audioUrl: null,
    audioDuration: 0,
    audioSettings: { narrationVolume: 1, originalVolume: 0 },
    movieTitle: 'Untitled Movie',
    narrativePerspective: 'third_person'
  });

  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isFinalAudioPlaying, setIsFinalAudioPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const finalAudioRef = useRef<HTMLAudioElement>(null);

  const [videoSettings] = useState({
    speed: 1,
    isMirrored: false,
    originalMuted: true
  });

  // --- Auto-Save & Restore Logic ---

  useEffect(() => {
    const saved = localStorage.getItem('recapper_autosave');
    if (saved) {
      setHasSavedSession(true);
    }
  }, []);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if ((step === Step.Adjustments || step === Step.PreviewExport) && state.recap) {
        const sessionData = {
          timestamp: Date.now(),
          step,
          uploadMode,
          manualScript,
          state: {
            selectedVoiceId: state.selectedVoiceId,
            styleInstructions: state.styleInstructions,
            metadata: state.metadata,
            recap: state.recap,
            audioSettings: state.audioSettings,
            movieTitle: state.movieTitle,
            narrativePerspective: state.narrativePerspective
          }
        };
        localStorage.setItem('recapper_autosave', JSON.stringify(sessionData));
        if (!hasSavedSession) setHasSavedSession(true);
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [step, uploadMode, manualScript, state, hasSavedSession]);

  const handleRestoreSession = () => {
    try {
      const saved = localStorage.getItem('recapper_autosave');
      if (saved) {
        const data = JSON.parse(saved);
        setUploadMode(data.uploadMode || 'video');
        setManualScript(data.manualScript || '');
        
        setState(prev => ({
          ...prev,
          ...data.state,
          videoBlob: null,
          videoUrl: null,
          audioUrl: null
        }));
        
        setStep(data.step || Step.Adjustments);
        
        if (data.state.recap && data.state.recap.script) {
          setOriginalScript(data.state.recap.script);
        }
        setLastSyncedScript('');
      }
    } catch (e) {
      console.error("Failed to restore session", e);
      setErrorMessage("Could not restore previous session data.");
      localStorage.removeItem('recapper_autosave');
      setHasSavedSession(false);
    }
  };

  const handleDiscardSession = () => {
    localStorage.removeItem('recapper_autosave');
    setHasSavedSession(false);
  };

  const handleResetStudio = () => {
    setState(prev => ({...prev, videoUrl: null, videoBlob: null, recap: null, audioUrl: null}));
    setStep(Step.Upload);
    setManualScript('');
    setLinkUrl('');
    localStorage.removeItem('recapper_autosave');
    setHasSavedSession(false);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = state.audioSettings.originalVolume;
    }
  }, [state.audioSettings.originalVolume]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9\s]/g, " ");
      setState(prev => ({ 
        ...prev, 
        videoBlob: file, 
        videoUrl: url,
        metadata: null, 
        recap: null,
        audioUrl: null,
        movieTitle: cleanName || 'Untitled Movie'
      }));
      setErrorMessage(null);
    }
  };

  const handleLinkFetch = async () => {
    if (!linkUrl.trim()) return;
    
    setIsFetchingLink(true);
    setErrorMessage(null);

    let targetUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const isSocialMedia = /youtube\.com|youtu\.be|tiktok\.com|facebook\.com|instagram\.com|twitter\.com/i.test(targetUrl);

    try {
      if (isSocialMedia) {
          throw new Error("Social Media links (YouTube, TikTok, Facebook, etc.) cannot be processed directly due to platform security restrictions.\n\nPlease download the video first using a tool like 'ssyoutube' or 'snaptik', then upload the video file here.");
      }

      let response;
      try {
         response = await fetch(targetUrl);
         if (!response.ok) throw new Error("Direct fetch failed");
      } catch (e) {
         try {
            response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
            if (!response.ok) throw new Error("Proxy 1 failed");
         } catch (e2) {
             response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
         }
      }

      if (!response || !response.ok) {
          throw new Error(`Unable to access URL. (Status: ${response?.status || 'Network Error'})`);
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && (contentType.includes("text/html") || contentType.includes("application/json"))) {
         throw new Error("The link returned a Webpage, not a Video file. Please provide a direct link to a video file (ending in .mp4, .mov, etc).");
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      let cleanName = "Linked Video";
      try {
        const urlObj = new URL(targetUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
           cleanName = pathSegments[pathSegments.length - 1];
        }
      } catch (e) {}
      cleanName = cleanName.replace(/[^a-zA-Z0-9\s]/g, " ");

      setState(prev => ({ 
        ...prev, 
        videoBlob: blob, 
        videoUrl: url,
        metadata: null, 
        recap: null,
        audioUrl: null,
        movieTitle: cleanName
      }));
      setLinkUrl('');
      
    } catch (error: any) {
      console.error(error);
      let msg = error.message || "Failed to load video.";
      if (msg === "Failed to fetch") msg = "Network request failed. The URL might be blocked by CORS policy.";
      setErrorMessage(msg);
    } finally {
      setIsFetchingLink(false);
    }
  };

  const calculateDuration = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      const mm = Math.floor(dur / 60).toString().padStart(2, '0');
      const ss = Math.floor(dur % 60).toString().padStart(2, '0');
      const formatted = `${mm}:${ss}`;
      setState(prev => ({
        ...prev,
        metadata: { ...prev.metadata, duration: dur, formattedDuration: formatted } as VideoMetadata
      }));
    }
  };

  const handleRewriteScript = async () => {
    if (!state.recap?.script) return;
    setIsRewritingScript(true);
    setErrorMessage(null);
    try {
      const styleObj = NARRATIVE_STYLES.find(s => s.id === selectedNarrativeStyle)!;
      const rewritten = await regenerateScriptWithStyle(state.recap.script, styleObj.label, styleObj.description);
      setState(prev => ({
        ...prev,
        recap: prev.recap ? { ...prev.recap, script: rewritten } : null
      }));
    } catch (e) {
      setErrorMessage(parseErrorMessage(e));
    } finally {
      setIsRewritingScript(false);
    }
  };

  const handleInteraction = useCallback(() => {
    setShowVideoControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    
    if (isVideoPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowVideoControls(false);
      }, 1000);
    }
  }, [isVideoPlaying]);

  useEffect(() => {
    if (isVideoPlaying) {
      handleInteraction();
    } else {
      setShowVideoControls(true);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    }
  }, [isVideoPlaying, handleInteraction]);

  const handleManualProceed = () => {
    if (!manualScript.trim()) {
      setErrorMessage("Please enter a script first.");
      return;
    }
    const manualRecap: RecapData = {
      movieTitle: "Manual Production",
      summary: "Manual narration script",
      script: manualScript,
      events: [],
      characters: [],
      genre: "Custom"
    };
    setState(prev => ({
      ...prev,
      recap: manualRecap,
      movieTitle: "Manual Production",
      metadata: { duration: 0, formattedDuration: "00:00" } as VideoMetadata
    }));
    setOriginalScript(manualScript);
    setStep(Step.Adjustments);
  };

  const playVoicePreview = async (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();

    if (previewingVoice === voice.id) {
      setPreviewingVoice(null);
      if (previewAudioRef.current) previewAudioRef.current.pause();
      return;
    }
    
    setPreviewingVoice(voice.id);
    try {
      const rawAudioBase64 = await generateTTS(voice.previewText, voice.voiceEngine, "Clear and neutral", voice.styleHint);
      const wavUrl = wrapPcmInWav(rawAudioBase64.split(',')[1]);
      if (previewAudioRef.current) {
        previewAudioRef.current.src = wavUrl;
        const playPromise = previewAudioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            if (err.name !== 'AbortError') console.error("Preview play error", err);
          });
        }
      }
    } catch (e) {
      console.error(e);
      const msg = parseErrorMessage(e);
      setErrorMessage(msg);
      setPreviewingVoice(null);
    }
  };

  const parseErrorMessage = (error: any) => {
    const msg = error?.message || String(error);
    if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      return "API Quota Exceeded. Please try again later.";
    }
    return msg;
  };

  const handleUpdateAudio = async () => {
    if (!state.recap?.script) return;
    setIsUpdatingAudio(true);
    setErrorMessage(null);
    try {
      const currentScript = state.recap.script;
      const selectedVoice = VOICES.find(v => v.id === state.selectedVoiceId)!;
      const rawAudioBase64 = await generateTTS(currentScript, selectedVoice.voiceEngine, state.styleInstructions, selectedVoice.styleHint);
      const wavUrl = wrapPcmInWav(rawAudioBase64.split(',')[1]);
      setState(prev => ({ ...prev, audioUrl: wavUrl }));
      setLastSyncedScript(currentScript);
      setStep(Step.Adjustments);
    } catch (error) {
      const msg = parseErrorMessage(error);
      setErrorMessage(msg);
    } finally {
      setIsUpdatingAudio(false);
    }
  };

  const startAnalysisAndScript = async () => {
    setStep(Step.Generating);
    setLoadingStep(1);
    setProgress(0);
    setErrorMessage(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 30) return prev + 1.2;
        if (prev < 70) return prev + 0.15;
        if (prev < 95) return prev + 0.05;
        return prev;
      });
    }, 100);

    try {
      if (!state.videoBlob || !state.metadata) {
        clearInterval(interval);
        return;
      }

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(state.videoBlob!);
      });
      const base64 = await base64Promise;

      setLoadingStep(2); 
      
      const { metadata, recap } = await analyzeVideo(base64, state.videoBlob.type, state.metadata.duration, state.narrativePerspective);
      
      clearInterval(interval);
      setProgress(100);

      setOriginalScript(recap.script);
      setLastSyncedScript('');
      setState(prev => ({
        ...prev,
        metadata: { ...prev.metadata, ...metadata } as VideoMetadata,
        recap,
        movieTitle: recap.movieTitle || prev.movieTitle,
        audioUrl: null
      }));

      setTimeout(() => setStep(Step.Adjustments), 1000);
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      const msg = parseErrorMessage(error);
      setErrorMessage(msg);
      setStep(Step.Upload);
    }
  };

  const togglePlayback = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play().catch(e => console.error(e));
      audioRef.current?.play().catch(e => console.error(e));
    } else {
      videoRef.current?.pause();
      audioRef.current?.pause();
    }
    handleInteraction();
  };

  const skipVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
    handleInteraction();
  };

  const syncPlayers = () => {
    if (videoRef.current && audioRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime;
    }
  };

  const generateUniqueFileName = (prefix: string, ext: string) => {
    const movieName = state.movieTitle.trim().replace(/[^a-z0-9]/gi, '_');
    const voice = VOICES.find(v => v.id === state.selectedVoiceId);
    const voiceName = (voice?.name || 'Narrator').replace(/[^a-z0-9]/gi, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    return `${movieName}_${prefix}_${voiceName}_${timestamp}.${ext}`;
  };

  const exportAudio = () => {
    if (state.audioUrl) {
      const link = document.createElement('a');
      link.href = state.audioUrl;
      link.download = generateUniqueFileName('Audio', 'wav');
      link.click();
    }
  };

  const exportScript = () => {
    if (state.recap?.script) {
      const blob = new Blob([state.recap.script], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateUniqueFileName('Script', 'txt');
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportSRT = () => {
    if (!state.recap?.events || !state.metadata?.duration) return;
    let srtContent = '';
    const events = state.recap.events;
    events.forEach((event, index) => {
      // Robust regex parsing for timestamps like "01:23", "1:23", or even "01:23:00"
      const match = event.time.match(/(\d+):(\d+)/);
      let startSec = 0;
      if (match) {
        startSec = parseInt(match[1]) * 60 + parseInt(match[2]);
      } else {
        // Fallback or error log if format is totally unexpected
        console.warn(`Could not parse timestamp: ${event.time}`);
      }

      const nextEvent = events[index + 1];
      let endSec = state.metadata!.duration;

      if (nextEvent) {
          const nextMatch = nextEvent.time.match(/(\d+):(\d+)/);
          if (nextMatch) {
              endSec = parseInt(nextMatch[1]) * 60 + parseInt(nextMatch[2]);
          }
      }

      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s},000`; // Standard SRT format MM:SS,ms or HH:MM:SS,ms. Here limiting to 2 digits for hours effectively.
      };
      
      // Ensure strict Srt format usually needs HH:MM:SS,ms
      // The previous helper was sufficient for short videos but let's be standard
      const formatTimeStandard = (seconds: number) => {
         const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
         const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
         const s = Math.floor(seconds % 60).toString().padStart(2, '0');
         const ms = '000';
         return `${h}:${m}:${s},${ms}`;
      };

      srtContent += `${index + 1}\n${formatTimeStandard(startSec)} --> ${formatTimeStandard(endSec)}\n${event.description}\n\n`;
    });
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generateUniqueFileName('Subtitles', 'srt');
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyAllMetadata = () => {
    if (!state.recap) return;
    const all = `
Title: ${state.movieTitle}
Genre: ${state.recap.genre}
Logline: ${state.recap.logline}
Summary: ${state.recap.summary}
Viral Titles: ${state.recap.titleOptions?.join(', ')}
Hashtags: ${state.recap.hashtags?.join(' ') || ''}
    `.trim();
    navigator.clipboard.writeText(all);
  };

  const handleInsertHook = () => {
    if (!state.recap?.logline) return;
    const current = state.recap.script;
    // Avoid double insertion check
    if (current.startsWith(state.recap.logline)) return;
    
    setState(prev => ({
      ...prev,
      recap: prev.recap ? { ...prev.recap, script: `${prev.recap.logline}\n\n${current}` } : null
    }));
  };

  const handleInsertCTA = () => {
    if (!state.recap?.cta) return;
    const current = state.recap.script;
    if (current.endsWith(state.recap.cta)) return;

    setState(prev => ({
      ...prev,
      recap: prev.recap ? { ...prev.recap, script: `${current}\n\n${prev.recap.cta}` } : null
    }));
  };

  const filteredVoices = VOICES.filter(v => genderFilter === 'all' || v.gender === genderFilter);
  const isOutOfSync = state.recap?.script !== lastSyncedScript;

  return (
    <div className="min-h-screen font-sans selection:bg-[#fe7f2d]/30 relative pb-10">
      <audio ref={previewAudioRef} onEnded={() => setPreviewingVoice(null)} className="hidden" />
      <audio 
        ref={finalAudioRef} 
        src={state.audioUrl || ''} 
        onPlay={() => setIsFinalAudioPlaying(true)} 
        onPause={() => setIsFinalAudioPlaying(false)} 
        onEnded={() => setIsFinalAudioPlaying(false)} 
        onLoadedMetadata={(e) => {
           const dur = e.currentTarget.duration;
           if (!isNaN(dur)) {
              setState(prev => ({ ...prev, audioDuration: dur }));
           }
        }}
        className="hidden" 
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center p-4 md:p-8">
        
        {errorMessage && (
          <div className="fixed top-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-500 w-full flex justify-center px-4">
            <NeuCard className="p-4 flex items-center gap-4 bg-red-900/10 border-red-500/20 max-w-2xl w-full">
              <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center shrink-0 text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-400 text-sm">System Error</h4>
                <p className="text-red-300/70 text-xs mt-0.5 whitespace-pre-line">{errorMessage}</p>
              </div>
              <NeuButton variant="icon" onClick={() => setErrorMessage(null)}>
                <XCircle className="w-4 h-4 text-white/50" />
              </NeuButton>
            </NeuCard>
          </div>
        )}

        <div className="w-full max-w-6xl transition-all duration-500 ease-in-out">
          <header className="mb-4 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 neu-flat flex items-center justify-center text-[#fe7f2d]">
                <Video className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#fe7f2d]">4ung21n</h1>
                <p className="text-[#fe7f2d]/60 text-[10px] md:text-xs font-bold flex items-center gap-2 mt-0.5 uppercase tracking-wider">
                  <Globe className="w-3 h-3" /> Burmese AI Narration Engine
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative">
              {step !== Step.Upload && (
                <NeuButton variant="secondary" onClick={handleResetStudio} className="!py-2 !px-4 text-xs tracking-widest uppercase">
                   <RefreshCw className="w-3 h-3 mr-2" /> Reset
                </NeuButton>
              )}
            </div>
          </header>

          <NeuCard className="min-h-[600px] flex flex-col relative !rounded-[32px] p-1">
            
            {(isUpdatingAudio || isRewritingScript) && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#233d4d]/90 backdrop-blur-sm rounded-[32px] animate-in fade-in duration-300">
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                   <div className="absolute w-full h-full rounded-full neu-flat animate-pulse"></div>
                   {isRewritingScript ? <Wand2 className="w-10 h-10 text-[#fe7f2d] animate-float relative z-10" /> : <Mic className="w-10 h-10 text-[#fe7f2d] animate-float relative z-10" />}
                </div>
                <h3 className="text-2xl font-bold text-[#e0e6ed] mb-2">
                  {isRewritingScript ? "Crafting Narrative" : "Synthesizing Audio"}
                </h3>
                <p className="text-[#fe7f2d] text-sm font-medium tracking-wide">PROCESSING REQUEST...</p>
              </div>
            )}
            
            {step === Step.Upload && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full max-w-4xl flex flex-col gap-10">
                  
                  {hasSavedSession && (
                    <div className="w-full max-w-xl mx-auto mb-4 animate-in slide-in-from-top-4 fade-in duration-500">
                      <NeuCard className="p-4 flex items-center justify-between border-l-4 border-[#fe7f2d]">
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-[#fe7f2d] shrink-0">
                            <History className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#e0e6ed] text-sm">Previous Session</h4>
                            <p className="text-[#94a3b8] text-xs">Resume where you left off?</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <NeuButton variant="icon" onClick={handleDiscardSession} title="Discard">
                            <Trash2 className="w-4 h-4 text-[#fe7f2d]" />
                          </NeuButton>
                          <NeuButton variant="primary" onClick={handleRestoreSession} className="!py-2 !px-4 !text-xs">
                            Resume
                          </NeuButton>
                        </div>
                      </NeuCard>
                    </div>
                  )}

                  {/* Mode Toggle */}
                  <div className="flex neu-pressed p-2 rounded-2xl self-center gap-2">
                    <button 
                      onClick={() => setUploadMode('video')} 
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${uploadMode === 'video' ? 'neu-flat text-[#fe7f2d]' : 'text-[#94a3b8] hover:text-[#e0e6ed]'}`}
                    >
                      Video File
                    </button>
                    <button 
                      onClick={() => setUploadMode('link')} 
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${uploadMode === 'link' ? 'neu-flat text-[#fe7f2d]' : 'text-[#94a3b8] hover:text-[#e0e6ed]'}`}
                    >
                      URL Link
                    </button>
                    <button 
                      onClick={() => setUploadMode('manual')} 
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${uploadMode === 'manual' ? 'neu-flat text-[#fe7f2d]' : 'text-[#94a3b8] hover:text-[#e0e6ed]'}`}
                    >
                      Script Only
                    </button>
                  </div>

                  {uploadMode === 'video' ? (
                    !state.videoUrl ? (
                      <label className="group cursor-pointer block">
                        <div className="neu-pressed rounded-[40px] p-16 md:p-24 flex flex-col items-center justify-center hover:shadow-[inset_4px_4px_8px_#1b2f3b,inset_-4px_-4px_8px_#2b4b5f] transition-all">
                          <div className="w-24 h-24 neu-flat rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-[#fe7f2d]">
                            <Upload className="w-10 h-10" />
                          </div>
                          <h3 className="text-3xl font-bold mb-4 text-[#e0e6ed]">Upload Video</h3>
                          <p className="text-[#94a3b8] mb-8 font-medium">MP4, MOV, WEBM supported</p>
                          <span className="neu-btn px-8 py-3 rounded-full text-xs font-bold text-[#fe7f2d] uppercase tracking-widest">Browse Files</span>
                        </div>
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                      </label>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto w-full">
                        <div className="neu-flat p-2 rounded-[24px] mb-8">
                          <div className="rounded-[20px] overflow-hidden bg-black aspect-video relative">
                             <video 
                              ref={videoRef} 
                              src={state.videoUrl} 
                              className="w-full h-full object-contain"
                              onLoadedMetadata={calculateDuration}
                              controls
                            />
                          </div>
                        </div>
                        
                        <div className="neu-pressed p-2 rounded-2xl mb-8 flex items-center justify-between gap-2 max-w-md mx-auto">
                          <button 
                             onClick={() => setState(prev => ({ ...prev, narrativePerspective: 'third_person' }))}
                             className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${state.narrativePerspective === 'third_person' ? 'neu-flat text-[#fe7f2d]' : 'text-[#94a3b8]'}`}
                          >
                             <User className="w-4 h-4" /> Third Person
                          </button>
                          <button 
                             onClick={() => setState(prev => ({ ...prev, narrativePerspective: 'first_person' }))}
                             className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${state.narrativePerspective === 'first_person' ? 'neu-flat text-[#fe7f2d]' : 'text-[#94a3b8]'}`}
                          >
                             <UserCheck className="w-4 h-4" /> First Person
                          </button>
                        </div>

                        <div className="flex gap-6">
                          <NeuButton onClick={() => setState(prev => ({ ...prev, videoUrl: null, videoBlob: null }))} className="flex-1">
                            Replace
                          </NeuButton>
                          <NeuButton variant="primary" onClick={startAnalysisAndScript} className="flex-[2]">
                            Start Analysis
                          </NeuButton>
                        </div>
                      </div>
                    )
                  ) : uploadMode === 'link' ? (
                     <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full flex flex-col items-center">
                        <div className="neu-flat p-10 rounded-[32px] w-full max-w-2xl flex flex-col items-center">
                           <div className="w-16 h-16 neu-pressed rounded-full flex items-center justify-center mb-6 text-[#fe7f2d]">
                              <Link className="w-8 h-8" />
                           </div>
                           <h3 className="text-2xl font-bold mb-2 text-[#e0e6ed]">Import from URL</h3>
                           <p className="text-[#94a3b8] text-sm mb-8 text-center">Paste a direct link to a video file.</p>

                           <div className="w-full relative mb-8">
                              <input
                                type="text"
                                className="w-full neu-pressed px-6 py-4 rounded-xl text-[#e0e6ed] focus:outline-none focus:text-[#fe7f2d] transition-colors pr-12 text-base placeholder-[#94a3b8]/50 bg-transparent border-none"
                                placeholder="https://example.com/video.mp4"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                 {isFetchingLink && <RefreshCw className="w-5 h-5 text-[#fe7f2d] animate-spin" />}
                              </div>
                           </div>
                           
                           <NeuButton 
                              variant="primary" 
                              onClick={handleLinkFetch} 
                              className="w-full"
                              disabled={!linkUrl.trim() || isFetchingLink}
                            >
                              Load Video
                            </NeuButton>
                        </div>
                     </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full">
                      <div className="neu-flat p-8 rounded-[32px]">
                        <label className="text-xs font-bold text-[#fe7f2d] uppercase tracking-widest mb-4 block">Manual Script</label>
                        <textarea
                          className="w-full min-h-[300px] neu-pressed p-6 rounded-xl text-lg text-[#e0e6ed] placeholder-[#94a3b8]/30 resize-none focus:outline-none myanmar-text bg-transparent border-none"
                          placeholder="Paste or type your script here..."
                          value={manualScript}
                          onChange={(e) => setManualScript(e.target.value)}
                        />
                      </div>
                      <div className="mt-8 flex justify-center">
                        <NeuButton variant="primary" onClick={handleManualProceed} className="w-full max-w-lg" disabled={!manualScript.trim()}>
                          Proceed to Studio
                        </NeuButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === Step.Generating && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 animate-in fade-in duration-700">
                <div className="neu-flat p-12 rounded-[40px] w-full max-w-4xl flex flex-col items-center">
                   <div className="w-full flex items-center justify-between mb-12">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 neu-pressed rounded-2xl flex items-center justify-center text-[#fe7f2d]">
                           <Cpu className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-[#e0e6ed] uppercase tracking-tight">Processing</h3>
                           <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest mt-1">
                             {loadingStep === 1 ? 'Visual Analysis' : 'Script Synthesis'}
                           </p>
                        </div>
                      </div>
                      <div className="text-5xl font-black text-[#fe7f2d] tabular-nums">
                        {Math.round(progress)}<span className="text-xl ml-1 text-[#94a3b8]">%</span>
                      </div>
                   </div>

                   <div className="w-full neu-pressed h-8 rounded-full overflow-hidden mb-6 relative">
                      <div 
                         className="h-full bg-[#fe7f2d] transition-all duration-300 relative"
                         style={{ width: `${progress}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20" style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
                      </div>
                   </div>
                   
                   <p className="text-[#94a3b8] font-mono text-sm tracking-wide">
                      {progress < 25 ? "Ingesting video data..." :
                       progress < 50 ? "Analyzing scene structure..." :
                       progress < 75 ? "Generating narrative..." :
                       "Finalizing output..."}
                   </p>
                </div>
              </div>
            )}

            {step === Step.ChooseVoice && (
              <div className="flex-1 flex flex-col p-6 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <NeuButton variant="icon" onClick={() => setStep(Step.Adjustments)}>
                      <ArrowLeft className="w-5 h-5" />
                    </NeuButton>
                    <div>
                      <h2 className="text-3xl font-bold text-[#e0e6ed]">Select Voice</h2>
                      <p className="text-[#94a3b8] text-sm mt-1">Choose your narrator</p>
                    </div>
                  </div>
                  <div className="neu-pressed p-1 rounded-xl flex gap-2">
                    {['all', 'male', 'female'].map((g) => (
                      <button 
                        key={g}
                        onClick={() => setGenderFilter(g as any)} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${genderFilter === g ? 'neu-flat text-[#fe7f2d]' : 'text-[#94a3b8] hover:text-[#e0e6ed]'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-12 max-h-[500px] no-scrollbar">
                  {filteredVoices.map(voice => (
                    <NeuCard 
                      key={voice.id} 
                      onClick={() => setState(prev => ({ ...prev, selectedVoiceId: voice.id }))}
                      className={`p-4 flex items-center gap-4 group border-l-4 ${state.selectedVoiceId === voice.id ? 'border-[#fe7f2d] neu-pressed' : 'border-transparent hover:border-[#fe7f2d]/50'}`}
                    >
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${state.selectedVoiceId === voice.id ? 'neu-flat text-[#fe7f2d]' : 'neu-pressed text-[#94a3b8]'}`}>
                         {voice.name[0]}
                       </div>

                       <div className="flex-1 min-w-0">
                         <h3 className={`font-bold text-base ${state.selectedVoiceId === voice.id ? 'text-[#fe7f2d]' : 'text-[#e0e6ed]'}`}>{voice.name}</h3>
                         <p className="text-xs text-[#94a3b8] font-medium mt-0.5 truncate">{voice.styleHint}</p>
                       </div>

                       <NeuButton 
                          variant="icon"
                          onClick={(e) => { e.stopPropagation(); playVoicePreview(e, voice); }}
                          className={`!w-10 !h-10 ${previewingVoice === voice.id ? '!text-[#fe7f2d] neu-pressed' : 'text-[#94a3b8]'}`}
                        >
                          {previewingVoice === voice.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </NeuButton>
                    </NeuCard>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <NeuButton variant="primary" onClick={() => setStep(Step.StyleInstructions)} className="w-full max-w-md">
                    Next Step
                  </NeuButton>
                </div>
              </div>
            )}

            {step === Step.StyleInstructions && (
              <div className="flex-1 flex flex-col p-6 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-6 mb-10">
                  <NeuButton variant="icon" onClick={() => setStep(Step.ChooseVoice)}>
                    <ArrowLeft className="w-5 h-5" />
                  </NeuButton>
                  <div>
                    <h2 className="text-3xl font-bold text-[#e0e6ed]">Vibe & Style</h2>
                    <p className="text-[#94a3b8] text-sm mt-1">Direct the AI performance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
                   <div className="lg:col-span-8 flex flex-col gap-8">
                      <div className="neu-flat p-8 rounded-[32px] flex-1 flex flex-col">
                        <label className="text-xs font-bold text-[#fe7f2d] uppercase tracking-widest mb-4 block">Custom Directives</label>
                        <textarea
                          className="w-full flex-1 neu-pressed p-6 rounded-2xl text-xl text-[#e0e6ed] placeholder-[#94a3b8]/30 resize-none focus:outline-none leading-relaxed bg-transparent border-none"
                          placeholder="Example: Speak like a wise elder with deep pauses..."
                          value={state.styleInstructions}
                          onChange={(e) => setState(prev => ({ ...prev, styleInstructions: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-6">
                        <NeuButton onClick={() => setStep(Step.ChooseVoice)} className="flex-1">Back</NeuButton>
                        <NeuButton 
                           variant="primary" 
                           onClick={handleUpdateAudio} 
                           disabled={isUpdatingAudio}
                           className="flex-[2]"
                        >
                           {isUpdatingAudio ? "Synthesizing..." : "Generate Narration"}
                        </NeuButton>
                      </div>
                   </div>
                   
                   <div className="lg:col-span-4 flex flex-col gap-4 h-[500px] overflow-y-auto no-scrollbar pr-2">
                      <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-2 px-2">Presets</label>
                      {STYLE_SUGGESTIONS.map((style, idx) => (
                        <button
                          key={idx}
                          onClick={() => setState(prev => ({ ...prev, styleInstructions: style.text }))}
                          className={`text-left p-5 rounded-[20px] transition-all duration-200 ${state.styleInstructions === style.text ? 'neu-pressed border-l-4 border-[#fe7f2d]' : 'neu-flat hover:translate-x-1'}`}
                        >
                          <div className="flex items-center gap-4 mb-2">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${state.styleInstructions === style.text ? 'text-[#fe7f2d]' : 'text-[#94a3b8]'}`}>
                               {style.icon}
                             </div>
                             <span className={`font-bold text-sm ${state.styleInstructions === style.text ? 'text-[#fe7f2d]' : 'text-[#e0e6ed]'}`}>{style.label}</span>
                          </div>
                          <p className="text-xs text-[#94a3b8] leading-relaxed pl-12">{style.text.substring(0, 60)}...</p>
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {step === Step.Adjustments && state.recap && (
              <div className="flex-1 flex flex-col animate-in fade-in duration-500 h-full">
                <div className="flex items-center justify-between p-6 border-b border-[#233d4d]">
                  <div className="flex items-center gap-4">
                    <NeuButton variant="icon" onClick={() => { setState(prev => ({...prev, videoUrl: null, videoBlob: null, recap: null, audioUrl: null})); setStep(Step.Upload); }}>
                      <ArrowLeft className="w-5 h-5" />
                    </NeuButton>
                    <h2 className="text-xl font-black text-[#fe7f2d] uppercase tracking-widest">Studio Console</h2>
                  </div>
                  <NeuButton onClick={() => setState(prev => ({ ...prev, recap: prev.recap ? {...prev.recap, script: originalScript} : null }))} className="!py-2 !px-4 text-xs">
                     <History className="w-3 h-3 mr-2" /> Revert
                  </NeuButton>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
                  {/* Left Column: Player & Script */}
                  <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
                    <div 
                      className="relative neu-flat p-2 rounded-[24px] aspect-video group overflow-hidden"
                      onMouseMove={handleInteraction}
                      onMouseEnter={handleInteraction}
                      onMouseLeave={() => isVideoPlaying && setShowVideoControls(false)}
                      onTouchStart={handleInteraction}
                    >
                       <div className="w-full h-full bg-black rounded-[20px] overflow-hidden relative">
                          {state.videoUrl ? (
                            <video 
                               ref={videoRef} 
                               src={state.videoUrl!} 
                               onTimeUpdate={syncPlayers} 
                               onClick={togglePlayback}
                               onPlay={() => setIsVideoPlaying(true)}
                               onPause={() => setIsVideoPlaying(false)}
                               className={`w-full h-full object-contain ${videoSettings.isMirrored ? '-scale-x-100' : 'scale-x-100'}`} 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
                               No Video Source
                            </div>
                          )}
                          <audio ref={audioRef} src={state.audioUrl || ''} />

                          {/* Controls */}
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${showVideoControls ? 'opacity-100' : 'opacity-0'}`}>
                             <div className="flex gap-8 items-center">
                                <button onClick={(e) => { e.stopPropagation(); skipVideo(-5); }} className="text-white/80 hover:text-[#fe7f2d] transition-colors"><Rewind className="w-8 h-8" /></button>
                                <button onClick={(e) => { e.stopPropagation(); togglePlayback(); }} className="w-16 h-16 bg-[#fe7f2d] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform">
                                   {isVideoPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); skipVideo(5); }} className="text-white/80 hover:text-[#fe7f2d] transition-colors"><FastForward className="w-8 h-8" /></button>
                             </div>
                             
                             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                                <span className="text-xs font-mono font-bold text-white bg-black/50 px-2 py-1 rounded">
                                  {formatTime(videoRef.current?.currentTime || 0)} / {state.metadata?.formattedDuration}
                                </span>
                                <div className="flex gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); setIsAudioDrawerOpen(!isAudioDrawerOpen); }} className="p-2 bg-black/50 rounded-full text-white hover:text-[#fe7f2d]"><Volume2 className="w-4 h-4" /></button>
                                  {state.videoUrl && <button onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen(); }} className="p-2 bg-black/50 rounded-full text-white hover:text-[#fe7f2d]"><Maximize2 className="w-4 h-4" /></button>}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex-1 neu-flat rounded-[24px] flex flex-col overflow-hidden">
                       <div className="p-4 border-b border-[#233d4d] flex justify-between items-center bg-[#233d4d]/30">
                          <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2">
                             <FileText className="w-4 h-4" /> Script Editor
                          </span>
                          <div className="flex items-center gap-2">
                             {state.recap?.logline && (
                               <button onClick={handleInsertHook} className="text-[10px] font-bold text-[#fe7f2d] bg-[#fe7f2d]/10 px-2 py-1 rounded border border-[#fe7f2d]/20 hover:bg-[#fe7f2d]/20 transition-colors">
                                 + Hook
                               </button>
                             )}
                             {state.recap?.cta && (
                               <button onClick={handleInsertCTA} className="text-[10px] font-bold text-[#fe7f2d] bg-[#fe7f2d]/10 px-2 py-1 rounded border border-[#fe7f2d]/20 hover:bg-[#fe7f2d]/20 transition-colors">
                                 + CTA
                               </button>
                             )}
                             {isOutOfSync && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Modified</span>}
                          </div>
                       </div>
                       <textarea 
                          className="flex-1 w-full bg-[#233d4d] p-6 text-lg text-[#e0e6ed] resize-none focus:outline-none myanmar-text border-none shadow-[inset_4px_4px_10px_#1b2f3b,inset_-4px_-4px_10px_#2b4b5f]"
                          value={state.recap.script || ''}
                          onChange={(e) => setState(prev => ({ ...prev, recap: prev.recap ? { ...prev.recap, script: e.target.value } : null }))}
                       />
                    </div>
                  </div>

                  {/* Right Column: Controls */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <NeuCard className="p-6">
                       <label className="text-xs font-bold text-[#fe7f2d] uppercase tracking-widest mb-4 block">Style Control</label>
                       <div className="flex flex-wrap gap-2 mb-6">
                          {NARRATIVE_STYLES.map(style => (
                            <button 
                              key={style.id}
                              onClick={() => setSelectedNarrativeStyle(style.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedNarrativeStyle === style.id ? 'neu-pressed text-[#fe7f2d] border border-[#fe7f2d]/20' : 'neu-flat text-[#94a3b8]'}`}
                            >
                              {style.label}
                            </button>
                          ))}
                       </div>
                       <NeuButton onClick={handleRewriteScript} disabled={isRewritingScript} className="w-full text-xs">
                          {isRewritingScript ? "Rewriting..." : "Rewrite Screenplay"}
                       </NeuButton>
                    </NeuCard>

                    <div className="flex flex-col gap-4">
                       <NeuButton 
                          onClick={() => setStep(Step.ChooseVoice)}
                          className="w-full !py-4"
                       >
                          {!state.audioUrl ? "Voice Over Settings" : "Change Voice"}
                       </NeuButton>
                       
                       {state.audioUrl && (
                          <NeuButton 
                             variant="primary"
                             onClick={() => setStep(Step.PreviewExport)} 
                             className="w-full !py-4"
                          >
                             Finalize Production
                          </NeuButton>
                       )}
                    </div>
                    
                    {isAudioDrawerOpen && (
                      <NeuCard className="p-4 mt-auto">
                        <div className="flex justify-between mb-4"><span className="text-xs font-bold text-[#94a3b8]">Mixer</span></div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] text-[#94a3b8] uppercase block mb-1">Source</span>
                            <input type="range" min="0" max="1" step="0.05" value={state.audioSettings.originalVolume} onChange={(e) => setState(prev => ({...prev, audioSettings: {...prev.audioSettings, originalVolume: parseFloat(e.target.value)}}))} className="w-full accent-[#fe7f2d]" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#94a3b8] uppercase block mb-1">Voice</span>
                            <input type="range" min="0" max="1" step="0.05" value={state.audioSettings.narrationVolume} onChange={(e) => { const vol = parseFloat(e.target.value); if(audioRef.current) audioRef.current.volume = vol; setState(prev => ({...prev, audioSettings: {...prev.audioSettings, narrationVolume: vol}})); }} className="w-full accent-[#fe7f2d]" />
                          </div>
                        </div>
                      </NeuCard>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === Step.PreviewExport && state.recap && (
               <div className="flex-1 flex flex-col p-8 md:p-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                      <NeuButton variant="icon" onClick={() => setStep(Step.Adjustments)}>
                        <ArrowLeft className="w-5 h-5" />
                      </NeuButton>
                      <h2 className="text-4xl font-black text-[#fe7f2d]">Digital Masters</h2>
                    </div>
                    <NeuButton onClick={copyAllMetadata} className="text-xs">
                       <Copy className="w-4 h-4 mr-2" /> Copy All Assets
                    </NeuButton>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div className="neu-flat p-8 rounded-[32px]">
                           <h3 className="text-lg font-bold text-[#e0e6ed] mb-8 flex items-center gap-3"><Download className="w-5 h-5 text-[#fe7f2d]" /> Export Files</h3>
                           
                           <div className="space-y-5">
                              {/* Audio Export */}
                              <div className="neu-pressed p-6 rounded-2xl flex items-center justify-between group">
                                 <div className="flex items-center gap-6">
                                    <div onClick={() => {
                                      if (isFinalAudioPlaying) {
                                        finalAudioRef.current?.pause();
                                      } else {
                                        finalAudioRef.current?.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
                                      }
                                    }} className="w-14 h-14 neu-flat rounded-full flex items-center justify-center cursor-pointer text-[#fe7f2d] hover:scale-105 transition-transform">
                                       {isFinalAudioPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                    </div>
                                    <div>
                                       <div className="font-bold text-[#e0e6ed]">Vocal Narration</div>
                                       <div className="text-[10px] text-[#94a3b8] font-mono mt-1">WAV • 48kHz • {formatTime(state.audioDuration)}</div>
                                    </div>
                                 </div>
                                 <NeuButton variant="icon" onClick={exportAudio}>
                                    <Download className="w-5 h-5" />
                                 </NeuButton>
                              </div>

                              {/* Script Export */}
                              <div className="neu-flat p-6 rounded-2xl flex items-center justify-between group border border-transparent hover:border-[#fe7f2d]/20 transition-all">
                                 <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 neu-pressed rounded-full flex items-center justify-center text-[#94a3b8]">
                                       <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                       <div className="font-bold text-[#e0e6ed]">Screenplay</div>
                                       <div className="text-[10px] text-[#94a3b8] font-mono mt-1">TXT • Burmese</div>
                                    </div>
                                 </div>
                                 <NeuButton variant="icon" onClick={exportScript}>
                                    <Download className="w-5 h-5" />
                                 </NeuButton>
                              </div>

                              {/* SRT Export */}
                              <div className="neu-flat p-6 rounded-2xl flex items-center justify-between group border border-transparent hover:border-[#fe7f2d]/20 transition-all">
                                 <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 neu-pressed rounded-full flex items-center justify-center text-[#94a3b8]">
                                       <TypeIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                       <div className="font-bold text-[#e0e6ed]">Subtitles</div>
                                       <div className="text-[10px] text-[#94a3b8] font-mono mt-1">SRT • Time-synced</div>
                                    </div>
                                 </div>
                                 <NeuButton variant="icon" onClick={exportSRT}>
                                    <Download className="w-5 h-5" />
                                 </NeuButton>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-8">
                        <div className="neu-flat p-8 rounded-[32px] h-full">
                           <h3 className="text-lg font-bold text-[#e0e6ed] mb-8 flex items-center gap-3"><LayoutDashboard className="w-5 h-5 text-[#fe7f2d]" /> Metadata</h3>
                           
                           <div className="space-y-8">
                              <CopyableField 
                                label="Title" 
                                text={state.movieTitle} 
                                isInput={true}
                                onUpdate={(val) => setState(prev => ({...prev, movieTitle: val}))}
                              />
                              
                              <div>
                                <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest block mb-4 ml-1">Viral Titles</label>
                                <div className="space-y-3">
                                  {state.recap.titleOptions?.map((opt, i) => (
                                    <CopyableField key={i} text={opt} />
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-5">
                                <CopyableField label="Genre" text={state.recap.genre || 'Undefined'} />
                                <div className="neu-pressed p-3 rounded-xl flex flex-col justify-center px-4">
                                   <span className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Runtime</span>
                                   <span className="text-[#e0e6ed] font-bold font-mono">{state.metadata?.formattedDuration}</span>
                                </div>
                              </div>

                              <CopyableField label="Hook" text={state.recap.logline || '---'} multiline={true} />
                              <CopyableField label="Summary" text={state.recap.summary} multiline={true} />
                              
                              {state.recap.hashtags && (
                                <CopyableField 
                                  label="Hashtags" 
                                  text={state.recap.hashtags.join(' ')} 
                                  multiline={true} 
                                />
                              )}
                           </div>
                        </div>

                        <NeuButton onClick={handleResetStudio} className="w-full !py-4 text-xs uppercase tracking-widest">
                           Start New Project
                        </NeuButton>
                     </div>
                  </div>
               </div>
            )}
          </NeuCard>
        </div>
      </div>
    </div>
  );
};

export default App;
