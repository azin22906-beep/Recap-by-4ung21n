
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Step, GenerationState, VideoMetadata, RecapData, Voice } from './types';
import { VOICES } from './constants';
import { analyzeVideo, generateTTS, wrapPcmInWav } from './services/geminiService';
import { Play, Upload, Mic, Sliders, CheckCircle, Video, FileText, Download, RotateCcw, Volume2, Eye, Info, Speaker, Pause, User, UserCheck, RefreshCw, AlertCircle, History, ArrowLeft, XCircle, ArrowRight, Sparkles, Ghost, Zap, Heart, Megaphone, BookOpen, Smile, Skull, ShieldAlert, Radio, Wand2, Type as TypeIcon, Flame, Waves, Wind, Key, ChevronRight, Music, Copy, Check, Settings2, VolumeX, Rewind, FastForward, Activity, Cpu, Scan, Globe, Layers, Clapperboard, Film, LayoutDashboard, Share2 } from 'lucide-react';

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
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass' | 'success';
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
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/20"
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
  const [originalScript, setOriginalScript] = useState<string>('');
  const [lastSyncedScript, setLastSyncedScript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
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
    movieTitle: 'Untitled Movie'
  });

  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isFinalAudioPlaying, setIsFinalAudioPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const finalAudioRef = useRef<HTMLAudioElement>(null);

  const [videoSettings, setVideoSettings] = useState({
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

  const handleSelectKey = async () => {
    try {
      if (window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
        setErrorMessage(null);
        setIsQuotaError(false);
      }
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
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
      setIsQuotaError(false);
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
      if (msg.includes("Quota") || msg.includes("limit")) setIsQuotaError(true);
      setPreviewingVoice(null);
    }
  };

  const parseErrorMessage = (error: any) => {
    const msg = error?.message || String(error);
    if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      return "API Quota Exceeded. Please use your own Paid API Key.";
    }
    return msg;
  };

  const handleUpdateAudio = async () => {
    if (!state.recap?.script) return;
    setIsUpdatingAudio(true);
    setErrorMessage(null);
    setIsQuotaError(false);
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
      if (msg.includes("Quota") || msg.includes("limit")) setIsQuotaError(true);
    } finally {
      setIsUpdatingAudio(false);
    }
  };

  const startAnalysisAndScript = async () => {
    setStep(Step.Generating);
    setLoadingStep(1);
    setProgress(0);
    setErrorMessage(null);
    setIsQuotaError(false);

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
      
      const { metadata, recap } = await analyzeVideo(base64, state.videoBlob.type, state.metadata.duration);
      
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
      if (msg.includes("Quota") || msg.includes("limit")) setIsQuotaError(true);
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
  };

  const skipVideo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
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

      <div className="relative z-10 min-h-screen flex flex-col items-center p-4 md:p-8">
        
        {errorMessage && (
          <div className="fixed top-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-500 w-full flex justify-center px-4">
            <GlassCard className="p-4 flex items-center gap-4 border-red-500/30 bg-red-950/60 !rounded-2xl max-w-2xl w-full">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <XCircle className="text-red-400 w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-100 text-sm">Action Required</h4>
                <p className="text-red-200/70 text-xs mt-0.5">{errorMessage}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {isQuotaError && (
                  <button onClick={handleSelectKey} className="px-3 py-1.5 bg-red-500/30 hover:bg-red-500/40 text-red-50 text-xs rounded-lg border border-red-500/30 transition-colors">
                    Add Key
                  </button>
                )}
                <button onClick={() => { setErrorMessage(null); setIsQuotaError(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle className="w-4 h-4 text-white/50" />
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        <div className="w-full max-w-6xl transition-all duration-500 ease-in-out">
          <header className="mb-8 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-white/10 group hover:scale-105 transition-transform">
                <Video className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60">Recapper PRO</h1>
                <p className="text-white/40 text-sm font-semibold flex items-center gap-2 mt-0.5 uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5" /> Burmese AI Narration Engine
                </p>
              </div>
            </div>
            {step !== Step.Upload && (
              <GlassButton variant="secondary" onClick={() => { setState(prev => ({...prev, videoUrl: null})); setStep(Step.Upload); }} className="!py-2.5 !px-5 !text-xs !rounded-xl">
                 <RefreshCw className="w-3.5 h-3.5" /> Start New Project
              </GlassButton>
            )}
          </header>

          <GlassCard className="min-h-[620px] flex flex-col backdrop-blur-[40px] bg-black/50 !border-white/5 relative">
            
            {isUpdatingAudio && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-2xl rounded-[24px] animate-in fade-in duration-300">
                <div className="relative w-40 h-40 mb-10">
                  <div className="absolute inset-0 bg-blue-500/15 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-500/20 border-b-transparent border-l-transparent rounded-full animate-spin duration-[2s]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mic className="w-12 h-12 text-white animate-float" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">Synthesizing Voice</h3>
                <p className="text-white/40 text-sm max-w-sm text-center leading-relaxed font-medium">Calibrating neural textures and emotional weight for your Burmese narration.</p>
              </div>
            )}
            
            {step === Step.Upload && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 text-center animate-in fade-in zoom-in-95 duration-500">
                {!state.videoUrl ? (
                  <div className="w-full max-w-xl">
                    <label className="group cursor-pointer block relative">
                      <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative border-2 border-dashed border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-500/[0.02] rounded-[48px] p-20 transition-all duration-500 flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-2xl relative">
                          <Upload className="w-10 h-10 text-blue-400" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Drop your Video</h3>
                        <p className="text-white/40 mb-10 max-w-xs mx-auto text-base font-medium leading-relaxed">Let AI watch and recap your movie clips in natural Burmese.</p>
                        <span className="px-8 py-4 bg-white text-black font-bold rounded-2xl text-sm hover:scale-105 transition-all shadow-xl">Select from Computer</span>
                      </div>
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="relative rounded-[36px] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video mb-10 group">
                      <video 
                        ref={videoRef} 
                        src={state.videoUrl} 
                        className="w-full h-full object-contain"
                        onLoadedMetadata={calculateDuration}
                        controls
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <GlassButton variant="secondary" onClick={() => setState(prev => ({ ...prev, videoUrl: null }))} className="w-full sm:flex-1">
                        Replace File
                      </GlassButton>
                      <GlassButton variant="primary" onClick={startAnalysisAndScript} className="w-full sm:flex-[2] py-5">
                        Begin AI Analysis <Sparkles className="w-5 h-5" />
                      </GlassButton>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === Step.Generating && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-6 animate-in fade-in duration-700">
                <div className="w-full max-w-4xl p-1 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-[40px] shadow-3xl">
                  <div className="bg-zinc-950/90 rounded-[39px] p-10 md:p-14 relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-40 bg-blue-500/10 blur-[120px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col gap-12">
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center shadow-2xl">
                               <Cpu className="w-8 h-8 text-blue-500 animate-pulse" />
                            </div>
                            <div>
                               <h3 className="text-3xl font-black text-white tracking-tight uppercase font-mono">Scanning Reels</h3>
                               <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                                 <Scan className="w-3 h-3" /> Process • {loadingStep === 1 ? 'VISUAL_PASS' : 'SCRIPT_SYNTH'}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-5xl font-black text-blue-500 tabular-nums font-mono tracking-tighter">
                              {Math.round(progress)}<span className="text-xl align-top ml-1 opacity-50">%</span>
                            </div>
                         </div>
                      </div>

                      <div className="bg-black/60 rounded-2xl p-8 border border-zinc-800/40 backdrop-blur-md min-h-[140px] flex items-center shadow-inner">
                         <p className="text-xl font-mono text-blue-50/80 leading-relaxed w-full">
                           <span className="text-blue-500 mr-3">$</span>
                           <span className="typing-effect">
                             {progress < 25 ? "Ingesting raw pixels and extracting key metadata..." :
                              progress < 50 ? "Deconstructing scene boundaries and character arcs..." :
                              progress < 75 ? "Synthesizing conversational Burmese narrative..." :
                              "Perfecting pauses and natural Burmese rhythm..."}
                           </span>
                           <span className="inline-block w-3 h-6 bg-blue-500 ml-2 align-middle animate-pulse"></span>
                         </p>
                      </div>

                      <div className="relative">
                         <div className="w-full h-10 bg-zinc-900 rounded-xl border border-zinc-800/50 overflow-hidden relative shadow-inner">
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
                         <div className="flex justify-between mt-4 text-[11px] font-mono text-zinc-600 uppercase tracking-[0.2em] font-bold">
                            <div className="flex items-center gap-2">
                              <Film className="w-3.5 h-3.5" />
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
              <div className="flex-1 flex flex-col p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-5">
                    <button onClick={() => setStep(Step.Adjustments)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 shadow-lg">
                      <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight">Select a Voice</h2>
                      <p className="text-white/40 text-sm font-medium">Choose the perfect narrator for your recap.</p>
                    </div>
                  </div>
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md self-start md:self-center">
                    {['all', 'male', 'female'].map((g) => (
                      <button 
                        key={g}
                        onClick={() => setGenderFilter(g as any)} 
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-400 ${genderFilter === g ? 'bg-white text-black shadow-xl' : 'text-white/50 hover:text-white'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 overflow-y-auto pr-2 h-[480px] no-scrollbar pb-12 content-start">
                  {filteredVoices.map(voice => (
                    <GlassCard 
                      key={voice.id} 
                      onClick={() => setState(prev => ({ ...prev, selectedVoiceId: voice.id }))}
                      className={`p-4 flex items-center gap-4 group transition-all duration-500 border-2 ${state.selectedVoiceId === voice.id ? 'border-blue-500/50 bg-blue-600/20 shadow-2xl ring-1 ring-blue-500/20' : 'bg-white/[0.03] border-transparent hover:border-white/10 hover:bg-white/10'}`}
                    >
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-inner transition-colors ${state.selectedVoiceId === voice.id ? 'bg-blue-500 text-white' : 'bg-black/40 text-white/40 border border-white/5'}`}>
                         {voice.name[0]}
                       </div>

                       <div className="flex-1 min-w-0">
                         <h3 className={`font-extrabold text-base leading-tight truncate ${state.selectedVoiceId === voice.id ? 'text-white' : 'text-white/80'}`}>{voice.name}</h3>
                         <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{voice.gender} • {voice.styleHint.split(',')[0]}</p>
                       </div>

                       <button 
                          onClick={(e) => playVoicePreview(e, voice)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 border-2 ${previewingVoice === voice.id ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/20 text-white/60'}`}
                        >
                          {previewingVoice === voice.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                    </GlassCard>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <GlassButton variant="primary" onClick={() => setStep(Step.StyleInstructions)} className="w-full max-w-lg py-5 shadow-2xl shadow-blue-900/40">
                    Next: Style Direction <ArrowRight className="w-5 h-5" />
                  </GlassButton>
                </div>
              </div>
            )}

            {step === Step.StyleInstructions && (
              <div className="flex-1 flex flex-col p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-5 mb-10">
                  <button onClick={() => setStep(Step.ChooseVoice)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all shadow-lg border border-white/10">
                    <ArrowLeft className="w-6 h-6 text-white/70" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Vibe & Style</h2>
                    <p className="text-white/40 text-sm font-medium">Fine-tune how the narrator delivers the story.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
                   <div className="lg:col-span-8 flex flex-col gap-8">
                      <div className="bg-black/20 rounded-[32px] p-8 border border-white/5 flex-1 flex flex-col shadow-inner">
                        <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-5 block">Custom Directives</label>
                        <textarea
                          className="w-full flex-1 bg-transparent text-xl text-white/90 placeholder-white/10 resize-none focus:outline-none leading-relaxed font-medium"
                          placeholder="Example: Speak like a wise elder with deep pauses..."
                          value={state.styleInstructions}
                          onChange={(e) => setState(prev => ({ ...prev, styleInstructions: e.target.value }))}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-5">
                        <GlassButton variant="secondary" onClick={() => setStep(Step.ChooseVoice)} className="w-full sm:flex-1">Previous</GlassButton>
                        <GlassButton 
                           variant="primary" 
                           onClick={handleUpdateAudio} 
                           disabled={isUpdatingAudio}
                           className="w-full sm:flex-[2] py-5"
                        >
                           {isUpdatingAudio ? (
                             <>Synthesizing... <RefreshCw className="w-5 h-5 animate-spin" /></>
                           ) : (
                             <>Generate Narration <Sparkles className="w-5 h-5" /></>
                           )}
                        </GlassButton>
                      </div>
                   </div>
                   
                   <div className="lg:col-span-4 flex flex-col gap-3.5 h-[520px] overflow-y-auto no-scrollbar mask-linear-fade pr-2">
                      <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-2 px-3">Quick Presets</label>
                      {STYLE_SUGGESTIONS.map((style, idx) => (
                        <button
                          key={idx}
                          onClick={() => setState(prev => ({ ...prev, styleInstructions: style.text }))}
                          className={`group text-left p-5 rounded-[24px] border-2 transition-all duration-400 ${state.styleInstructions === style.text ? 'bg-blue-600/15 border-blue-500/40 shadow-xl' : 'bg-white/[0.03] border-transparent hover:bg-white/5'}`}
                        >
                          <div className="flex items-center gap-4 mb-2">
                             <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${state.styleInstructions === style.text ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/30'}`}>
                               {style.icon}
                             </div>
                             <span className={`font-extrabold text-sm ${state.styleInstructions === style.text ? 'text-white' : 'text-white/70'}`}>{style.label}</span>
                          </div>
                          <p className="text-[11px] text-white/30 leading-relaxed pl-12 font-medium">{style.text.substring(0, 70)}...</p>
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {step === Step.Adjustments && state.recap && (
              <div className="flex-1 flex flex-col p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <button onClick={() => { setState(prev => ({...prev, videoUrl: null, recap: null})); setStep(Step.Upload); }} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 shadow-lg">
                      <ArrowLeft className="w-6 h-6 text-white/70" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight uppercase font-mono text-white/90">Studio Console</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Editing Live Session</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GlassButton variant="ghost" onClick={() => setState(prev => ({ ...prev, recap: prev.recap ? {...prev.recap, script: originalScript} : null }))} className="!text-[10px] !py-2 !px-4 border border-white/5 !rounded-xl font-black uppercase tracking-widest">
                       <History className="w-3.5 h-3.5" /> Revert
                    </GlassButton>
                    {state.audioUrl && (
                       <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Audio Mastered</span>
                       </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full flex-1 min-h-[520px]">
                  <div className="lg:col-span-7 flex flex-col gap-8">
                     <div className="relative rounded-[40px] overflow-hidden bg-black border border-white/10 shadow-3xl aspect-video group ring-1 ring-white/5">
                        <video 
                           ref={videoRef} 
                           src={state.videoUrl!} 
                           onTimeUpdate={syncPlayers} 
                           onClick={togglePlayback}
                           onPlay={() => setIsVideoPlaying(true)}
                           onPause={() => setIsVideoPlaying(false)}
                           className={`w-full h-full object-contain transition-transform duration-500 ${videoSettings.isMirrored ? '-scale-x-100' : 'scale-x-100'}`} 
                        />
                        <audio ref={audioRef} src={state.audioUrl || ''} />
                        
                        <div 
                           onClick={togglePlayback}
                           className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer backdrop-blur-[2px]"
                        >
                           <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-3xl transform group-hover:scale-110 transition-transform">
                              {isVideoPlaying ? <Pause className="w-8 h-8 fill-white text-white" /> : <Play className="w-8 h-8 fill-white text-white ml-1.5" />}
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-black/40 p-6 rounded-[32px] border border-white/10 backdrop-blur-md shadow-2xl">
                        <div className="flex items-center gap-5 w-full sm:w-1/3">
                          <button 
                            onClick={() => setState(prev => ({...prev, audioSettings: {...prev.audioSettings, originalVolume: prev.audioSettings.originalVolume === 0 ? 1 : 0}}))}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            {state.audioSettings.originalVolume === 0 ? <VolumeX className="w-5 h-5 text-white/30" /> : <Volume2 className="w-5 h-5 text-white/70" />}
                          </button>
                          <div className="flex flex-col w-full">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Source Audio</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={state.audioSettings.originalVolume}
                              onChange={(e) => setState(prev => ({...prev, audioSettings: {...prev.audioSettings, originalVolume: parseFloat(e.target.value)}}))}
                              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <button onClick={() => skipVideo(-5)} className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                             <Rewind className="w-6 h-6" />
                          </button>

                          <button onClick={togglePlayback} className="w-16 h-16 flex items-center justify-center bg-white text-black rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/20">
                             {isVideoPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1.5" />}
                          </button>

                          <button onClick={() => skipVideo(5)} className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                             <FastForward className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="hidden sm:flex items-center gap-3 w-1/3 justify-end">
                           <div className="text-right">
                              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5">Timecode</p>
                              <p className="text-sm font-mono font-bold text-white/80 tabular-nums">{formatTime(videoRef.current?.currentTime || 0)} / {state.metadata?.formattedDuration}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col h-full bg-black/30 rounded-[40px] border border-white/5 overflow-hidden shadow-inner flex-1">
                     <div className="p-5 border-b border-white/5 bg-white/[0.03] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Production Script</span>
                        </div>
                        {isOutOfSync && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 animate-pulse uppercase tracking-widest">
                            <AlertCircle className="w-3 h-3" /> Modified
                          </div>
                        )}
                     </div>
                     <textarea 
                        className="flex-1 w-full bg-transparent p-8 text-xl leading-relaxed text-white/90 placeholder-white/5 resize-none focus:outline-none myanmar-text overflow-y-auto no-scrollbar"
                        value={state.recap.script || ''}
                        onChange={(e) => {
                          const newScript = e.target.value;
                          setState(prev => ({ ...prev, recap: prev.recap ? { ...prev.recap, script: newScript } : null }));
                        }}
                        spellCheck={false}
                        placeholder="AI script draft..."
                     />
                     <div className="p-6 border-t border-white/5 bg-white/[0.03] flex flex-col gap-4 shrink-0">
                        <GlassButton 
                          onClick={() => setStep(Step.ChooseVoice)}
                          variant={!state.audioUrl ? 'primary' : 'glass'}
                          className="w-full font-black uppercase tracking-widest text-xs"
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
                              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/30 shadow-2xl shadow-emerald-500/20 font-black uppercase tracking-widest text-xs"
                           >
                              Complete Production <CheckCircle className="w-4 h-4" />
                           </GlassButton>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {step === Step.PreviewExport && state.recap && (
               <div className="flex-1 flex flex-col p-8 md:p-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-5">
                      <button onClick={() => setStep(Step.Adjustments)} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 shadow-lg">
                        <ArrowLeft className="w-7 h-7 text-white/70" />
                      </button>
                      <div>
                        <h2 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/40">Ready for Export</h2>
                        <p className="text-white/40 text-sm font-bold uppercase tracking-[0.2em] mt-1">Project Output Ready</p>
                      </div>
                    </div>
                    <GlassButton variant="ghost" onClick={copyAllMetadata} className="!text-[10px] !py-3 !px-5 border border-white/10 font-black uppercase tracking-widest">
                       <Copy className="w-4 h-4" /> Copy All Assets
                    </GlassButton>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div className="bg-white/[0.03] border border-white/10 rounded-[48px] p-10 backdrop-blur-3xl shadow-3xl">
                           <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-white/80 uppercase tracking-widest"><Download className="w-6 h-6 text-blue-400" /> Digital Masters</h3>
                           <div className="space-y-5">
                              <div className="bg-black/40 p-8 rounded-[32px] border border-white/5 flex items-center justify-between group hover:bg-black/60 transition-all shadow-lg">
                                 <div className="flex items-center gap-6">
                                    <div onClick={() => {
                                      if (isFinalAudioPlaying) {
                                        finalAudioRef.current?.pause();
                                      } else {
                                        finalAudioRef.current?.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
                                      }
                                    }} className="w-16 h-16 rounded-[24px] bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                       {isFinalAudioPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1.5" />}
                                    </div>
                                    <div>
                                       <div className="font-black text-lg uppercase tracking-tight">Vocal Narration</div>
                                       <div className="text-[10px] text-white/30 font-mono font-bold uppercase tracking-widest mt-1">WAV • 48kHz • 24-BIT • {formatTime(state.audioDuration)}</div>
                                    </div>
                                 </div>
                                 <button onClick={exportAudio} className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                    <Download className="w-5 h-5" />
                                 </button>
                              </div>

                              <button onClick={exportScript} className="w-full flex items-center justify-between p-8 bg-white/5 hover:bg-white/10 rounded-[32px] border border-white/5 transition-all group">
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                                       <FileText className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                       <div className="font-black text-lg uppercase tracking-tight group-hover:text-blue-400 transition-colors">Screenplay TXT</div>
                                       <div className="text-[10px] text-white/30 font-mono font-bold uppercase tracking-widest mt-1">Text • UTF-8 • Burmese</div>
                                    </div>
                                 </div>
                                 <Download className="w-5 h-5 text-white/20 group-hover:text-white transition-all" />
                              </button>

                              <button onClick={exportSRT} className="w-full flex items-center justify-between p-8 bg-white/5 hover:bg-white/10 rounded-[32px] border border-white/5 transition-all group">
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                                       <TypeIcon className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                       <div className="font-black text-lg uppercase tracking-tight group-hover:text-emerald-400 transition-colors">Synced Captions</div>
                                       <div className="text-[10px] text-white/30 font-mono font-bold uppercase tracking-widest mt-1">SRT • Time-synced • {state.recap.events.length} Lines</div>
                                    </div>
                                 </div>
                                 <Download className="w-5 h-5 text-white/20 group-hover:text-white transition-all" />
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-8 flex flex-col">
                        <div className="bg-white/[0.03] border border-white/10 rounded-[48px] p-10 backdrop-blur-3xl shadow-3xl h-full">
                           <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-white/80 uppercase tracking-widest"><LayoutDashboard className="w-6 h-6 text-blue-400" /> Catalog Details</h3>
                           
                           <div className="space-y-8">
                              <CopyableField 
                                label="Movie Identity" 
                                text={state.movieTitle} 
                                isInput={true}
                                onUpdate={(val) => setState(prev => ({...prev, movieTitle: val}))}
                              />
                              
                              <div>
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-4">Optimized Titles</label>
                                <div className="space-y-3">
                                  {state.recap.titleOptions?.map((opt, i) => (
                                    <CopyableField key={i} text={opt} />
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-5">
                                <CopyableField label="Genre" text={state.recap.genre || 'Undefined'} />
                                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                   <span className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1.5">Runtime</span>
                                   <span className="text-white font-black text-lg font-mono">{state.metadata?.formattedDuration}</span>
                                </div>
                              </div>

                              <CopyableField label="The Hook (Logline)" text={state.recap.logline || '---'} multiline={true} />
                              <CopyableField label="Plot Summary" text={state.recap.summary} multiline={true} />
                           </div>
                        </div>

                        <div className="flex gap-4">
                           <GlassButton 
                             onClick={() => { setState(prev => ({...prev, videoUrl: null, videoBlob: null, recap: null, audioUrl: null, metadata: null})); setStep(Step.Upload); }} 
                             className="w-full bg-white/5 border-white/10 hover:bg-white/10 !text-white/40 hover:!text-white !text-xs font-black uppercase tracking-widest py-5"
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