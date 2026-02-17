
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Step, GenerationState, VideoMetadata, RecapData, Voice } from './types';
import { VOICES, NARRATIVE_STYLES } from './constants';
import { analyzeVideo, generateTTS, wrapPcmInWav, regenerateScriptWithStyle } from './services/geminiService';
import { Play, Upload, Mic, Sliders, CheckCircle, Video, FileText, Download, RotateCcw, Volume2, Eye, Info, Speaker, Pause, User, UserCheck, RefreshCw, AlertCircle, History, ArrowLeft, XCircle, ArrowRight, Sparkles, Ghost, Zap, Heart, Megaphone, BookOpen, Smile, Skull, ShieldAlert, Radio, Wand2, Type as TypeIcon, Flame, Waves, Wind, Key, ChevronRight, Music, Copy, Check, Settings2, VolumeX, Rewind, FastForward, Activity, Cpu, Scan, Globe, Layers, Clapperboard, Film, LayoutDashboard, Share2, ShieldCheck, Lock, ExternalLink, Settings, Maximize2, ChevronDown, ChevronUp, PenTool, Link } from 'lucide-react';

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

// --- Components for Glass UI ---

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`relative bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-[24px] overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99]' : ''} ${className}`}
  >
    {children}
  </div>
);

interface GlassButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass' | 'success' | 'warning';
  className?: string;
  disabled?: boolean;
}

const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "", 
  disabled = false 
}) => {
  const baseStyle = "px-6 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] border border-blue-400/20",
    secondary: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30",
    ghost: "bg-transparent hover:bg-white/5 text-white/70 hover:text-white",
    glass: "bg-black/20 hover:bg-black/30 text-white border border-white/10 backdrop-blur-lg",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/20",
    warning: "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/20"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
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
      {label && <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">{label}</label>}
      <div className="relative">
        {isInput ? (
           <input 
              type="text" 
              value={text}
              onChange={(e) => onUpdate && onUpdate(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
           />
        ) : (
           <div onClick={handleCopy} className={`bg-black/20 border border-white/5 rounded-xl ${multiline ? 'p-4 items-start' : 'p-3 items-center'} flex justify-between cursor-pointer hover:bg-white/5 transition-colors group`}>
              <span className={`text-sm text-white/90 myanmar-text ${multiline ? 'leading-relaxed' : ''}`}>{text || '-'}</span>
              {!isInput && (
                <div className={`p-1.5 rounded-lg transition-colors ml-3 shrink-0 ${copied ? 'bg-green-500/20 text-green-400' : 'text-white/20 group-hover:text-white bg-white/5 hover:bg-white/10'}`}>
                   {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </div>
              )}
           </div>
        )}
        
        {isInput && (
           <button 
              onClick={handleCopy}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'text-white/20 hover:text-white hover:bg-white/10'}`}
           >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
           </button>
        )}
      </div>
    </div>
  );
};

const BackgroundBlobs = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[140px] animate-pulse duration-[6000ms]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse delay-1000 duration-[7000ms]" />
    <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-cyan-500/15 rounded-full blur-[120px] animate-pulse delay-2000 duration-[8000ms]" />
    <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay"></div>
  </div>
);

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

    // Check for social media links specifically to provide better feedback
    const isSocialMedia = /youtube\.com|youtu\.be|tiktok\.com|facebook\.com|instagram\.com|twitter\.com/i.test(targetUrl);

    try {
      if (isSocialMedia) {
          // If it's a known social media link, we throw a specific error because direct fetch will fail CORS or return HTML
          throw new Error("Social Media links (YouTube, TikTok, Facebook, etc.) cannot be processed directly due to platform security restrictions.\n\nPlease download the video first using a tool like 'ssyoutube' or 'snaptik', then upload the video file here.");
      }

      let response;
      
      // Attempt 1: Direct Fetch (for CORS-enabled servers)
      try {
         response = await fetch(targetUrl);
         if (!response.ok) throw new Error("Direct fetch failed");
      } catch (e) {
         // Attempt 2: CORS Proxy (corsproxy.io)
         try {
            response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
            if (!response.ok) throw new Error("Proxy 1 failed");
         } catch (e2) {
            // Attempt 3: AllOrigins Proxy (fallback)
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
      
      // Extract filename hint from URL
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
    
    // Auto-hide only if playing. If paused, controls stay visible.
    if (isVideoPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowVideoControls(false);
      }, 1000);
    }
  }, [isVideoPlaying]);

  useEffect(() => {
    // Sync the hide timer when play status changes
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
      const videoPromise = videoRef.current.play();
      if (videoPromise !== undefined) {
        videoPromise.catch(e => {
          if (e.name !== 'AbortError') console.error("Video playback error:", e);
        });
      }
      
      const audioPromise = audioRef.current?.play();
      if (audioPromise !== undefined) {
        audioPromise.catch(e => {
          if (e.name !== 'AbortError') console.error("Audio playback error:", e);
        });
      }
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
      const startTimeParts = event.time.split(':');
      const startSec = parseInt(startTimeParts[0]) * 60 + parseInt(startTimeParts[1]);
      const nextEvent = events[index + 1];
      const endSec = nextEvent 
        ? (parseInt(nextEvent.time.split(':')[0]) * 60 + parseInt(nextEvent.time.split(':')[1]))
        : state.metadata!.duration;
      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s},000`;
      };
      srtContent += `${index + 1}\n${formatTime(startSec)} --> ${formatTime(endSec)}\n${event.description}\n\n`;
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
    `.trim();
    navigator.clipboard.writeText(all);
  };

  const filteredVoices = VOICES.filter(v => genderFilter === 'all' || v.gender === genderFilter);
  const isOutOfSync = state.recap?.script !== lastSyncedScript;

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-blue-500/40 relative">
      <BackgroundBlobs />
      
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

      <div className="relative z-10 min-h-screen flex flex-col items-center p-2 md:p-8">
        
        {errorMessage && (
          <div className="fixed top-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-500 w-full flex justify-center px-4">
            <GlassCard className="p-4 flex items-center gap-4 border-red-500/30 bg-red-950/60 !rounded-2xl max-w-2xl w-full">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <XCircle className="text-red-400 w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-100 text-sm">Error</h4>
                <p className="text-red-200/70 text-xs mt-0.5 whitespace-pre-line">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <XCircle className="w-4 h-4 text-white/50" />
              </button>
            </GlassCard>
          </div>
        )}

        <div className="w-full max-w-6xl transition-all duration-500 ease-in-out">
          <header className="mb-4 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-white/10 group hover:scale-105 transition-transform">
                <Video className="text-white w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">Recapper PRO</h1>
                <p className="text-white/40 text-[10px] md:text-sm font-semibold flex items-center gap-2 mt-0.5 uppercase tracking-wider">
                  <Globe className="w-3 md:w-3.5 h-3 md:h-3.5" /> Burmese AI Narration Engine
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative">
              {step !== Step.Upload && (
                <GlassButton variant="secondary" onClick={() => { setState(prev => ({...prev, videoUrl: null, videoBlob: null, recap: null, audioUrl: null})); setStep(Step.Upload); setManualScript(''); setLinkUrl(''); }} className="!py-1.5 md:!py-2 !px-3 md:!px-4 !text-[10px] !rounded-xl uppercase tracking-widest">
                   <RefreshCw className="w-3 md:w-3.5 h-3 md:h-3.5" /> Reset Studio
                </GlassButton>
              )}
            </div>
          </header>

          <GlassCard className="min-h-[500px] flex flex-col backdrop-blur-[40px] bg-black/50 !border-white/5 relative !rounded-[32px] md:!rounded-[48px]">
            
            {(isUpdatingAudio || isRewritingScript) && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-2xl rounded-[32px] md:rounded-[48px] animate-in fade-in duration-300">
                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-10">
                  <div className="absolute inset-0 bg-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-500/20 border-b-transparent border-l-transparent rounded-full animate-spin duration-[2s]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isRewritingScript ? <Wand2 className="w-10 h-10 md:w-12 md:h-12 text-white animate-float" /> : <Mic className="w-10 h-10 md:w-12 md:h-12 text-white animate-float" />}
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
                  {isRewritingScript ? "Crafting New Narrative" : "Synthesizing Voice"}
                </h3>
                <p className="text-white/40 text-xs md:text-sm max-w-sm text-center leading-relaxed font-medium px-6">
                  {isRewritingScript ? "AI is rewriting your script based on the chosen narrative style..." : "Calibrating neural textures and emotional weight for your Burmese narration."}
                </p>
              </div>
            )}
            
            {step === Step.Upload && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-full max-w-4xl flex flex-col gap-8">
                  {/* Mode Toggle */}
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md self-center flex-wrap justify-center gap-1">
                    <button 
                      onClick={() => setUploadMode('video')} 
                      className={`px-4 md:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-400 flex items-center gap-2 ${uploadMode === 'video' ? 'bg-blue-600 text-white shadow-xl' : 'text-white/50 hover:text-white'}`}
                    >
                      <Video className="w-4 h-4" /> Video Upload
                    </button>
                    <button 
                      onClick={() => setUploadMode('link')} 
                      className={`px-4 md:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-400 flex items-center gap-2 ${uploadMode === 'link' ? 'bg-blue-600 text-white shadow-xl' : 'text-white/50 hover:text-white'}`}
                    >
                      <Link className="w-4 h-4" /> Social / Link
                    </button>
                    <button 
                      onClick={() => setUploadMode('manual')} 
                      className={`px-4 md:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-400 flex items-center gap-2 ${uploadMode === 'manual' ? 'bg-blue-600 text-white shadow-xl' : 'text-white/50 hover:text-white'}`}
                    >
                      <PenTool className="w-4 h-4" /> Manual Script
                    </button>
                  </div>

                  {uploadMode === 'video' ? (
                    !state.videoUrl ? (
                      <label className="group cursor-pointer block relative">
                        <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative border-2 border-dashed border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-500/[0.02] rounded-[32px] md:rounded-[48px] p-12 md:p-24 transition-all duration-500 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-[24px] md:rounded-[32px] flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-2xl relative">
                            <Upload className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                            <div className="absolute -top-1 -right-1 w-3 md:w-4 h-3 md:h-4 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-extrabold mb-3 md:mb-4 tracking-tight">Drop your Video</h3>
                          <p className="text-white/40 mb-8 md:mb-10 max-w-xs mx-auto text-sm md:text-base font-medium leading-relaxed">Let AI watch and recap your movie clips in natural Burmese.</p>
                          <span className="px-6 md:px-8 py-3 md:py-4 bg-white text-black font-bold rounded-2xl text-xs md:text-sm hover:scale-105 transition-all shadow-xl">Select Video File</span>
                        </div>
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                      </label>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto">
                        <div className="relative rounded-[24px] md:rounded-[36px] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video mb-8 group">
                          <video 
                            ref={videoRef} 
                            src={state.videoUrl} 
                            className="w-full h-full object-contain"
                            onLoadedMetadata={calculateDuration}
                            controls
                          />
                        </div>
                        
                        {/* Narrative Perspective Selector */}
                        <div className="bg-black/30 p-2 rounded-2xl border border-white/5 mb-6 flex items-center justify-between gap-2 max-w-md mx-auto">
                          <button 
                             onClick={() => setState(prev => ({ ...prev, narrativePerspective: 'third_person' }))}
                             className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${state.narrativePerspective === 'third_person' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                          >
                             <User className="w-4 h-4" /> Third Person
                          </button>
                          <button 
                             onClick={() => setState(prev => ({ ...prev, narrativePerspective: 'first_person' }))}
                             className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${state.narrativePerspective === 'first_person' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                          >
                             <UserCheck className="w-4 h-4" /> First Person
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <GlassButton variant="secondary" onClick={() => setState(prev => ({ ...prev, videoUrl: null, videoBlob: null }))} className="w-full sm:flex-1">
                            Replace File
                          </GlassButton>
                          <GlassButton variant="primary" onClick={startAnalysisAndScript} className="w-full sm:flex-[2] py-4">
                            Begin AI Analysis <Sparkles className="w-5 h-5" />
                          </GlassButton>
                        </div>
                      </div>
                    )
                  ) : uploadMode === 'link' ? (
                     <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full flex flex-col items-center">
                        <div className="bg-black/20 rounded-[32px] p-8 md:p-12 border border-white/5 flex flex-col shadow-inner w-full max-w-2xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                           
                           <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 self-center border border-white/5 shadow-lg">
                              <Link className="w-8 h-8 text-blue-400" />
                           </div>
                           
                           <h3 className="text-xl md:text-2xl font-bold mb-2">Fetch from URL</h3>
                           <p className="text-white/40 text-xs md:text-sm mb-8 leading-relaxed max-w-md self-center">
                             Paste a direct link to a video file. <br/>
                             <span className="text-white/20 italic mt-2 block text-[10px]">(Note: YouTube, TikTok, Facebook links are protected by CORS and may not work without a direct download link or proxy.)</span>
                           </p>

                           <div className="relative w-full">
                              <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors pr-12 text-sm md:text-base font-medium"
                                placeholder="https://example.com/video.mp4"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                 {isFetchingLink ? <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" /> : <Link className="w-5 h-5 text-white/20" />}
                              </div>
                           </div>
                           
                           <div className="mt-8 flex justify-center">
                              <GlassButton 
                                variant="primary" 
                                onClick={handleLinkFetch} 
                                className="w-full py-4 shadow-xl"
                                disabled={!linkUrl.trim() || isFetchingLink}
                              >
                                {isFetchingLink ? "Fetching Video..." : "Load Video"} <ArrowRight className="w-5 h-5" />
                              </GlassButton>
                           </div>
                        </div>
                     </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full">
                      <div className="bg-black/20 rounded-[32px] p-6 md:p-10 border border-white/5 flex flex-col shadow-inner">
                        <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-5 block text-left">Production Script (Burmese)</label>
                        <textarea
                          className="w-full min-h-[300px] bg-transparent text-xl text-white/90 placeholder-white/10 resize-none focus:outline-none leading-relaxed font-medium myanmar-text"
                          placeholder="Paste or type your script here in conversational Burmese..."
                          value={manualScript}
                          onChange={(e) => setManualScript(e.target.value)}
                        />
                      </div>
                      <div className="mt-8 flex justify-center">
                        <GlassButton 
                          variant="primary" 
                          onClick={handleManualProceed} 
                          className="w-full max-w-lg py-5 shadow-2xl shadow-blue-900/40"
                          disabled={!manualScript.trim()}
                        >
                          Proceed to Studio <ArrowRight className="w-5 h-5" />
                        </GlassButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === Step.Generating && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-4 md:p-6 animate-in fade-in duration-700">
                <div className="w-full max-w-4xl p-1 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-[32px] md:rounded-[40px] shadow-3xl">
                  <div className="bg-zinc-950/90 rounded-[31px] md:rounded-[39px] p-6 md:p-14 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-40 bg-blue-500/10 blur-[120px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col gap-8 md:gap-12">
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-3 md:gap-5">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center shadow-2xl">
                               <Cpu className="w-6 h-6 md:w-8 md:h-8 text-blue-500 animate-pulse" />
                            </div>
                            <div>
                               <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase font-mono">Scanning Reels</h3>
                               <p className="text-[9px] md:text-xs text-zinc-500 font-mono uppercase tracking-[0.3em] mt-1 md:mt-1.5 flex items-center gap-2">
                                 <Scan className="w-3 h-3" /> Process • {loadingStep === 1 ? 'VISUAL_PASS' : 'SCRIPT_SYNTH'}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-3xl md:text-5xl font-black text-blue-500 tabular-nums font-mono tracking-tighter">
                              {Math.round(progress)}<span className="text-sm md:text-xl align-top ml-1 opacity-50">%</span>
                            </div>
                         </div>
                      </div>

                      <div className="bg-black/60 rounded-xl md:rounded-2xl p-6 md:p-8 border border-zinc-800/40 backdrop-blur-md min-h-[100px] md:min-h-[140px] flex items-center shadow-inner">
                         <p className="text-base md:text-xl font-mono text-blue-50/80 leading-relaxed w-full">
                           <span className="text-blue-500 mr-2 md:mr-3">$</span>
                           <span className="typing-effect">
                             {progress < 25 ? "Ingesting raw pixels and extracting key metadata..." :
                              progress < 50 ? "Deconstructing scene boundaries and character arcs..." :
                              progress < 75 ? `Synthesizing ${state.narrativePerspective === 'first_person' ? 'First Person' : 'Third Person'} Burmese narrative...` :
                              "Perfecting pauses and natural Burmese rhythm..."}
                           </span>
                           <span className="inline-block w-2 md:w-3 h-4 md:h-6 bg-blue-500 ml-1 md:ml-2 align-middle animate-pulse"></span>
                         </p>
                      </div>

                      <div className="relative">
                         <div className="w-full h-8 md:h-10 bg-zinc-900 rounded-lg md:rounded-xl border border-zinc-800/50 overflow-hidden relative shadow-inner">
                            <div 
                               className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-400 relative transition-all duration-700 ease-out flex items-center shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                               style={{ width: `${progress}%` }}
                            >
                               <div className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay" 
                                    style={{ 
                                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.8) 15px, rgba(0,0,0,0.8) 18px)` 
                                    }}>
                               </div>
                               <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/40 blur-[2px]"></div>
                            </div>
                         </div>
                         <div className="flex justify-between mt-3 md:mt-4 text-[9px] md:text-[11px] font-mono text-zinc-600 uppercase tracking-[0.2em] font-bold">
                            <div className="flex items-center gap-2">
                              <Film className="w-3 md:w-3.5 h-3 md:h-3.5" />
                              <span>LIVE_FRAME_FEED</span>
                            </div>
                            <span className="text-blue-500/60">AI_CORE_READY</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === Step.ChooseVoice && (
              <div className="flex-1 flex flex-col p-6 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
                  <div className="flex items-center gap-5">
                    <button onClick={() => setStep(Step.Adjustments)} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 shadow-lg">
                      <ArrowLeft className="w-5 md:w-6 h-5 md:h-6 text-white" />
                    </button>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Select a Voice</h2>
                      <p className="text-white/40 text-xs md:text-sm font-medium">Choose the perfect narrator for your recap.</p>
                    </div>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-md self-start md:self-center">
                    {['all', 'male', 'female'].map((g) => (
                      <button 
                        key={g}
                        onClick={() => setGenderFilter(g as any)} 
                        className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold capitalize transition-all duration-400 ${genderFilter === g ? 'bg-white text-black shadow-xl' : 'text-white/50 hover:text-white'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 overflow-y-auto pr-2 h-[400px] md:h-[480px] no-scrollbar pb-12 content-start">
                  {filteredVoices.map(voice => (
                    <GlassCard 
                      key={voice.id} 
                      onClick={() => setState(prev => ({ ...prev, selectedVoiceId: voice.id }))}
                      className={`p-3 md:p-4 flex items-center gap-3 md:gap-4 group transition-all duration-500 border-2 ${state.selectedVoiceId === voice.id ? 'border-blue-500/50 bg-blue-600/20 shadow-2xl ring-1 ring-blue-500/20' : 'bg-white/[0.03] border-transparent hover:border-white/10 hover:bg-white/10'}`}
                    >
                       <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg font-black shrink-0 shadow-inner transition-colors ${state.selectedVoiceId === voice.id ? 'bg-blue-500 text-white' : 'bg-black/40 text-white/40 border border-white/5'}`}>
                         {voice.name[0]}
                       </div>

                       <div className="flex-1 min-w-0">
                         <h3 className={`font-extrabold text-sm md:text-base leading-tight truncate ${state.selectedVoiceId === voice.id ? 'text-white' : 'text-white/80'}`}>{voice.name}</h3>
                         <p className="text-[9px] md:text-[11px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{voice.gender} • {voice.styleHint.split(',')[0]}</p>
                       </div>

                       <button 
                          onClick={(e) => playVoicePreview(e, voice)}
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shrink-0 border-2 ${previewingVoice === voice.id ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/20 text-white/60'}`}
                        >
                          {previewingVoice === voice.id ? <Pause className="w-3 md:w-4 h-3 md:h-4 fill-current" /> : <Play className="w-3 md:w-4 h-3 md:h-4 fill-current ml-0.5" />}
                        </button>
                    </GlassCard>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <GlassButton variant="primary" onClick={() => setStep(Step.StyleInstructions)} className="w-full max-w-lg py-4 md:py-5 shadow-2xl shadow-blue-900/40">
                    Next: Style Direction <ArrowRight className="w-5 h-5" />
                  </GlassButton>
                </div>
              </div>
            )}

            {step === Step.StyleInstructions && (
              <div className="flex-1 flex flex-col p-6 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-5 mb-8 md:mb-10">
                  <button onClick={() => setStep(Step.ChooseVoice)} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all shadow-lg border border-white/10">
                    <ArrowLeft className="w-5 md:w-6 h-5 md:h-6 text-white/70" />
                  </button>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Vibe & Style</h2>
                    <p className="text-white/40 text-xs md:text-sm font-medium">Fine-tune how the narrator delivers the story.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 h-full">
                   <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
                      <div className="bg-black/20 rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-white/5 flex-1 flex flex-col shadow-inner">
                        <label className="text-[10px] md:text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4 md:mb-5 block">Custom Directives</label>
                        <textarea
                          className="w-full flex-1 bg-transparent text-lg md:text-xl text-white/90 placeholder-white/10 resize-none focus:outline-none leading-relaxed font-medium"
                          placeholder="Example: Speak like a wise elder with deep pauses..."
                          value={state.styleInstructions}
                          onChange={(e) => setState(prev => ({ ...prev, styleInstructions: e.target.value }))}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
                        <GlassButton variant="secondary" onClick={() => setStep(Step.ChooseVoice)} className="w-full sm:flex-1">Previous</GlassButton>
                        <GlassButton 
                           variant="primary" 
                           onClick={handleUpdateAudio} 
                           disabled={isUpdatingAudio}
                           className="w-full sm:flex-[2] py-4 md:py-5"
                        >
                           {isUpdatingAudio ? (
                             <>Synthesizing... <RefreshCw className="w-5 h-5 animate-spin" /></>
                           ) : (
                             <>Generate Narration <Sparkles className="w-5 h-5" /></>
                           )}
                        </GlassButton>
                      </div>
                   </div>
                   
                   <div className="lg:col-span-4 flex flex-col gap-3.5 h-[350px] md:h-[520px] overflow-y-auto no-scrollbar mask-linear-fade pr-2">
                      <label className="text-[10px] md:text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-3">Quick Presets</label>
                      {STYLE_SUGGESTIONS.map((style, idx) => (
                        <button
                          key={idx}
                          onClick={() => setState(prev => ({ ...prev, styleInstructions: style.text }))}
                          className={`group text-left p-4 md:p-5 rounded-[20px] md:rounded-[24px] border-2 transition-all duration-400 ${state.styleInstructions === style.text ? 'bg-blue-600/15 border-blue-500/40 shadow-xl' : 'bg-white/[0.03] border-transparent hover:bg-white/5'}`}
                        >
                          <div className="flex items-center gap-3 md:gap-4 mb-2">
                             <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${state.styleInstructions === style.text ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/30'}`}>
                               {style.icon}
                             </div>
                             <span className={`font-extrabold text-xs md:text-sm ${state.styleInstructions === style.text ? 'text-white' : 'text-white/70'}`}>{style.label}</span>
                          </div>
                          <p className="text-[10px] md:text-[11px] text-white/30 leading-relaxed pl-10 md:pl-12 font-medium">{style.text.substring(0, 70)}...</p>
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {step === Step.Adjustments && state.recap && (
              <div className="flex-1 flex flex-col animate-in fade-in duration-500">
                {/* Header Overlay */}
                <div className="flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20 pointer-events-none">
                  <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
                    <button onClick={() => { setState(prev => ({...prev, videoUrl: null, videoBlob: null, recap: null, audioUrl: null})); setStep(Step.Upload); }} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 backdrop-blur-md">
                      <ArrowLeft className="w-5 md:w-6 h-5 md:h-6 text-white/70" />
                    </button>
                    <div>
                      <h2 className="text-base md:text-xl font-black tracking-tight uppercase font-mono text-white/90">Studio Console</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-[8px] md:text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Live Session</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <GlassButton variant="ghost" onClick={() => setState(prev => ({ ...prev, recap: prev.recap ? {...prev.recap, script: originalScript} : null }))} className="!text-[8px] md:!text-[10px] !py-2 md:!py-2.5 !px-3 md:!px-4 border border-white/10 !rounded-xl font-black uppercase tracking-widest bg-black/40 backdrop-blur-md">
                       <History className="w-3 md:w-3.5 h-3 md:h-3.5" /> Revert
                    </GlassButton>
                  </div>
                </div>

                {/* Hero Player Area */}
                <div 
                  className="relative flex-none h-[45vh] md:h-[55vh] w-full bg-black group overflow-hidden"
                  onMouseMove={handleInteraction}
                  onMouseEnter={handleInteraction}
                  onMouseLeave={() => isVideoPlaying && setShowVideoControls(false)}
                  onTouchStart={handleInteraction}
                >
                  {state.videoUrl ? (
                    <video 
                       ref={videoRef} 
                       src={state.videoUrl!} 
                       onTimeUpdate={syncPlayers} 
                       onClick={togglePlayback}
                       onPlay={() => { setIsVideoPlaying(true); }}
                       onPause={() => { setIsVideoPlaying(false); }}
                       className={`w-full h-full object-contain transition-transform duration-500 ${videoSettings.isMirrored ? '-scale-x-100' : 'scale-x-100'}`} 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50">
                       <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4">
                          <Mic className="w-10 h-10 text-blue-400" />
                       </div>
                       <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Manual Script Mode</p>
                    </div>
                  )}
                  <audio ref={audioRef} src={state.audioUrl || ''} />

                  {/* Video Controls Overlay */}
                  <div className={`absolute inset-0 z-10 flex flex-col justify-center items-center bg-black/30 backdrop-blur-[1px] transition-all duration-300 ${showVideoControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center gap-8 md:gap-12 scale-90 md:scale-100">
                      <button onClick={(e) => { e.stopPropagation(); skipVideo(-5); }} className="p-3 md:p-4 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all transform active:scale-90">
                         <Rewind className="w-8 md:w-10 h-8 md:h-10" />
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); togglePlayback(); }} className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-3xl">
                         {isVideoPlaying ? <Pause className="w-10 md:w-12 h-10 md:h-12 fill-current" /> : <Play className="w-10 md:w-12 h-10 md:h-12 fill-current ml-2" />}
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); skipVideo(5); }} className="p-3 md:p-4 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all transform active:scale-90">
                         <FastForward className="w-8 md:w-10 h-8 md:h-10" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Player Overlay Bar */}
                  <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between transition-all duration-300 ${showVideoControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-3">
                        <span className="text-[10px] md:text-xs font-mono font-bold text-white/90 tabular-nums">
                          {formatTime(videoRef.current?.currentTime || 0)}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                        <span className="text-[10px] md:text-xs font-mono font-bold text-white/40 tabular-nums">
                          {state.metadata?.formattedDuration}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pointer-events-auto">
                      {/* Audio Control Drawer Toggle */}
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIsAudioDrawerOpen(!isAudioDrawerOpen); handleInteraction(); }}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-white/10 transition-all ${isAudioDrawerOpen ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/40 backdrop-blur-md text-white/60 hover:bg-black/60'}`}
                        >
                          {state.audioSettings.originalVolume === 0 ? <VolumeX className="w-5 md:w-6 h-5 md:h-6" /> : <Volume2 className="w-5 md:w-6 h-5 md:h-6" />}
                        </button>
                        
                        {/* Compact Audio Drawer */}
                        {isAudioDrawerOpen && (
                          <div className="absolute bottom-full right-0 mb-3 w-48 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="flex items-center justify-between mb-4">
                               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Master Volume</span>
                               <button onClick={() => setIsAudioDrawerOpen(false)}><XCircle className="w-3.5 h-3.5 text-white/20" /></button>
                             </div>
                             <div className="space-y-4">
                               <div className="flex flex-col gap-2">
                                 <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                   <span>Source Audio</span>
                                   <span>{Math.round(state.audioSettings.originalVolume * 100)}%</span>
                                 </div>
                                 <input
                                   type="range"
                                   min="0"
                                   max="1"
                                   step="0.05"
                                   value={state.audioSettings.originalVolume}
                                   onChange={(e) => setState(prev => ({...prev, audioSettings: {...prev.audioSettings, originalVolume: parseFloat(e.target.value)}}))}
                                   className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                                 />
                               </div>
                               <div className="flex flex-col gap-2">
                                 <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                   <span>AI Narrator</span>
                                   <span>{Math.round(state.audioSettings.narrationVolume * 100)}%</span>
                                 </div>
                                 <input
                                   type="range"
                                   min="0"
                                   max="1"
                                   step="0.05"
                                   value={state.audioSettings.narrationVolume}
                                   onChange={(e) => {
                                      const vol = parseFloat(e.target.value);
                                      if (audioRef.current) audioRef.current.volume = vol;
                                      setState(prev => ({...prev, audioSettings: {...prev.audioSettings, narrationVolume: vol}}));
                                   }}
                                   className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                 />
                               </div>
                             </div>
                          </div>
                        )}
                      </div>
                      
                      {state.videoUrl && (
                        <button onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen(); }} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:bg-black/60 transition-all">
                          <Maximize2 className="w-5 md:w-6 h-5 md:h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Area: Script & Styles */}
                <div className="flex-1 flex flex-col md:flex-row bg-black/30 backdrop-blur-sm border-t border-white/5">
                  <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-white/5">
                    <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Production Script</span>
                      </div>
                      {isOutOfSync && (
                        <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 animate-pulse uppercase tracking-widest">
                          <AlertCircle className="w-3 h-3" /> Modified
                        </div>
                      )}
                    </div>
                    
                    <textarea 
                       className="flex-1 w-full bg-transparent p-6 md:p-8 text-lg md:text-xl leading-relaxed text-white/90 placeholder-white/5 resize-none focus:outline-none myanmar-text overflow-y-auto no-scrollbar min-h-[250px]"
                       value={state.recap.script || ''}
                       onChange={(e) => {
                         const newScript = e.target.value;
                         setState(prev => ({ ...prev, recap: prev.recap ? { ...prev.recap, script: newScript } : null }));
                       }}
                       spellCheck={false}
                       placeholder="AI script draft..."
                    />
                  </div>

                  <div className="w-full md:w-[320px] lg:w-[400px] flex flex-col shrink-0 bg-white/[0.01]">
                    <div className="p-5 flex flex-col gap-5">
                       <div className="bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Narrative Identity</label>
                          <div className="flex flex-wrap gap-2">
                            {NARRATIVE_STYLES.map(style => (
                              <button 
                                key={style.id}
                                onClick={() => setSelectedNarrativeStyle(style.id)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${selectedNarrativeStyle === style.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
                              >
                                {style.label}
                              </button>
                            ))}
                          </div>
                          <button 
                             onClick={handleRewriteScript}
                             disabled={isRewritingScript}
                             className="w-full mt-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 disabled:opacity-50 text-indigo-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            {isRewritingScript ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />} Rewrite Screenplay
                          </button>
                       </div>

                       <div className="flex flex-col gap-3">
                         <GlassButton 
                           onClick={() => setStep(Step.ChooseVoice)}
                           variant={!state.audioUrl ? 'primary' : 'glass'}
                           className="w-full font-black uppercase tracking-widest text-[10px] !py-4"
                         >
                            {!state.audioUrl ? (
                              <>Finalize & Voice Over <Mic className="w-4 h-4" /></>
                            ) : (
                              <>Change Vocal Profile <Settings2 className="w-4 h-4" /></>
                            )}
                         </GlassButton>
                         
                         {state.audioUrl && (
                            <GlassButton 
                               onClick={() => setStep(Step.PreviewExport)} 
                               className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/30 shadow-2xl shadow-emerald-500/20 font-black uppercase tracking-widest text-[10px] !py-4"
                            >
                               Complete Production <CheckCircle className="w-4 h-4" />
                            </GlassButton>
                         )}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === Step.PreviewExport && state.recap && (
               <div className="flex-1 flex flex-col p-6 md:p-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                    <div className="flex items-center gap-5">
                      <button onClick={() => setStep(Step.Adjustments)} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 shadow-lg">
                        <ArrowLeft className="w-6 md:w-7 h-6 md:h-7 text-white/70" />
                      </button>
                      <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/40">Ready for Export</h2>
                        <p className="text-white/40 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] mt-1">Project Output Ready</p>
                      </div>
                    </div>
                    <GlassButton variant="ghost" onClick={copyAllMetadata} className="!text-[10px] !py-2.5 md:!py-3 !px-4 md:!px-5 border border-white/10 font-black uppercase tracking-widest">
                       <Copy className="w-4 h-4" /> Copy All Assets
                    </GlassButton>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                     <div className="space-y-6 md:space-y-8">
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] md:rounded-[48px] p-6 md:p-10 backdrop-blur-3xl shadow-3xl">
                           <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 text-white/80 uppercase tracking-widest"><Download className="w-5 md:w-6 h-5 md:h-6 text-blue-400" /> Digital Masters</h3>
                           <div className="space-y-4 md:space-y-5">
                              <div className="bg-black/40 p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-white/5 flex items-center justify-between group hover:bg-black/60 transition-all shadow-lg">
                                 <div className="flex items-center gap-4 md:gap-6">
                                    <div onClick={() => {
                                      if (isFinalAudioPlaying) {
                                        finalAudioRef.current?.pause();
                                      } else {
                                        finalAudioRef.current?.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
                                      }
                                    }} className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                       {isFinalAudioPlaying ? <Pause className="w-5 md:w-7 h-5 md:h-7 fill-current" /> : <Play className="w-5 md:w-7 h-5 md:h-7 fill-current ml-1" />}
                                    </div>
                                    <div>
                                       <div className="font-black text-base md:text-lg uppercase tracking-tight">Vocal Narration</div>
                                       <div className="text-[9px] md:text-[10px] text-white/30 font-mono font-bold uppercase tracking-widest mt-1">WAV • 48kHz • 24-BIT • {formatTime(state.audioDuration)}</div>
                                    </div>
                                 </div>
                                 <button onClick={exportAudio} className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                    <Download className="w-4 md:w-5 h-4 md:h-5" />
                                 </button>
                              </div>

                              <button onClick={exportScript} className="w-full flex items-center justify-between p-6 md:p-8 bg-white/5 hover:bg-white/10 rounded-[24px] md:rounded-[32px] border border-white/5 transition-all group">
                                 <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                                       <FileText className="w-6 md:w-7 h-6 md:h-7" />
                                    </div>
                                    <div className="text-left">
                                       <div className="font-black text-base md:text-lg uppercase tracking-tight group-hover:text-blue-400 transition-colors">Screenplay TXT</div>
                                       <div className="text-[9px] md:text-[10px] text-white/30 font-mono font-bold uppercase tracking-widest mt-1">Text • UTF-8 • Burmese</div>
                                    </div>
                                 </div>
                                 <Download className="w-4 md:w-5 h-4 md:h-5 text-white/20 group-hover:text-white transition-all" />
                              </button>

                              <button onClick={exportSRT} className="w-full flex items-center justify-between p-6 md:p-8 bg-white/5 hover:bg-white/10 rounded-[24px] md:rounded-[32px] border border-white/5 transition-all group">
                                 <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                                       <TypeIcon className="w-6 md:w-7 h-6 md:h-7" />
                                    </div>
                                    <div className="text-left">
                                       <div className="font-black text-base md:text-lg uppercase tracking-tight group-hover:text-emerald-400 transition-colors">Synced Captions</div>
                                       <div className="text-[9px] md:text-[10px] text-white/30 font-mono font-bold uppercase tracking-widest mt-1">SRT • Time-synced • {state.recap.events.length} Lines</div>
                                    </div>
                                 </div>
                                 <Download className="w-4 md:w-5 h-4 md:h-5 text-white/20 group-hover:text-white transition-all" />
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 md:space-y-8 flex flex-col">
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] md:rounded-[48px] p-6 md:p-10 backdrop-blur-3xl shadow-3xl h-full">
                           <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 text-white/80 uppercase tracking-widest"><LayoutDashboard className="w-5 md:w-6 h-5 md:h-6 text-blue-400" /> Catalog Details</h3>
                           
                           <div className="space-y-6 md:space-y-8">
                              <CopyableField 
                                label="Movie Identity" 
                                text={state.movieTitle} 
                                isInput={true}
                                onUpdate={(val) => setState(prev => ({...prev, movieTitle: val}))}
                              />
                              
                              <div>
                                <label className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-4">Optimized Titles</label>
                                <div className="space-y-3">
                                  {state.recap.titleOptions?.map((opt, i) => (
                                    <CopyableField key={i} text={opt} />
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 md:gap-5">
                                <CopyableField label="Genre" text={state.recap.genre || 'Undefined'} />
                                <div className="bg-black/30 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 flex flex-col justify-center">
                                   <span className="text-[8px] md:text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Runtime</span>
                                   <span className="text-white font-black text-base md:text-lg font-mono">{state.metadata?.formattedDuration}</span>
                                </div>
                              </div>

                              <CopyableField label="The Hook (Logline)" text={state.recap.logline || '---'} multiline={true} />
                              <CopyableField label="Plot Summary" text={state.recap.summary} multiline={true} />
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <GlassButton 
                             onClick={() => { setState(prev => ({...prev, videoUrl: null, videoBlob: null, recap: null, audioUrl: null, metadata: null})); setStep(Step.Upload); setManualScript(''); setLinkUrl(''); }} 
                             className="w-full bg-white/5 border-white/10 hover:bg-white/10 !text-white/40 hover:!text-white !text-[10px] font-black uppercase tracking-widest py-4 md:py-5"
                           >
                              New Project Session
                           </GlassButton>
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </GlassCard>
        </div>
      </div>
      
      <style>{`
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        .mask-linear-fade {
           mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
        }
        @keyframes typing {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .typing-effect {
          display: inline-block;
          animation: typing 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
