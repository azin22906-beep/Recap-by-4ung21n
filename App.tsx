
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Step, GenerationState, VideoMetadata, RecapData, Voice } from './types';
import { VOICES } from './constants';
import { analyzeVideo, generateTTS, wrapPcmInWav } from './services/geminiService';
import { Play, Upload, Mic, Sliders, CheckCircle, Video, FileText, Download, RotateCcw, Volume2, Eye, Info, Speaker, Pause, User, UserCheck, RefreshCw, AlertCircle, History, ArrowLeft, XCircle, ArrowRight, Sparkles, Ghost, Zap, Heart, Megaphone, BookOpen, Smile, Skull, ShieldAlert, Radio, Wand2, Type as TypeIcon, Flame, Waves, Wind, Key, ChevronRight, Music, Copy, Check, Settings2, VolumeX, Rewind, FastForward, Activity, Cpu, Scan, Globe, Layers, Clapperboard, Film } from 'lucide-react';

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
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
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
    glass: "bg-black/20 hover:bg-black/30 text-white border border-white/10 backdrop-blur-lg"
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
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse duration-[4000ms]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000 duration-[5000ms]" />
    <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-2000 duration-[6000ms]" />
    <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>
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
  const [progress, setProgress] = useState<number>(0); // Progress for loading bar
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

  // Sync video volume when state changes
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

    // Progress Simulation for "Cinema Dark" experience
    const interval = setInterval(() => {
      setProgress(prev => {
        // Fast start to 30% (Scanning)
        if (prev < 30) return prev + 1.5;
        // Slow crawl to 70% (Drafting/Analyzing - waiting for API)
        if (prev < 70) return prev + 0.2;
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

      setLoadingStep(2); // Analysis phase theoretically done, now synthesis
      
      const { metadata, recap } = await analyzeVideo(base64, state.videoBlob.type, state.metadata.duration);
      
      clearInterval(interval);
      setProgress(75); // Script generated, jumping to finalizing

      // Simulate quick "Rendering" phase
      setTimeout(() => setProgress(85), 200);
      setTimeout(() => setProgress(95), 500);
      setTimeout(() => setProgress(100), 800);

      setOriginalScript(recap.script);
      setLastSyncedScript('');
      setState(prev => ({
        ...prev,
        metadata: { ...prev.metadata, ...metadata } as VideoMetadata,
        recap,
        movieTitle: recap.movieTitle || prev.movieTitle,
        audioUrl: null
      }));

      // Delay transition to allow user to see 100% completion
      setTimeout(() => setStep(Step.Adjustments), 1200);
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
      // Sync happens via onTimeUpdate usually, but force sync if paused?
      // For now onTimeUpdate should handle it
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

  const filteredVoices = VOICES.filter(v => genderFilter === 'all' || v.gender === genderFilter);
  const isOutOfSync = state.recap?.script !== lastSyncedScript;

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-blue-500/40 relative">
      <BackgroundBlobs />
      
      {/* Audio Elements */}
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
        
        {/* Error Notification */}
        {errorMessage && (
          <div className="fixed top-6 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
            <GlassCard className="p-4 flex items-center gap-4 border-red-500/30 bg-red-950/40 !rounded-2xl max-w-2xl mx-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <XCircle className="text-red-400 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-red-200 text-sm">Action Required</h4>
                <p className="text-red-200/70 text-xs mt-0.5">{errorMessage}</p>
              </div>
              <div className="flex gap-2 ml-4">
                {isQuotaError && (
                  <button onClick={handleSelectKey} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs rounded-lg border border-red-500/30 transition-colors">
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

        {/* Main Content Area */}
        <div className="w-full max-w-6xl transition-all duration-500 ease-in-out">
          {/* Header */}
          <header className="mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Video className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Burmese Video Recapper</h1>
                <p className="text-white/40 text-sm font-medium">AI-Powered Factual Narration Engine</p>
              </div>
            </div>
            {step !== Step.Upload && (
              <GlassButton variant="secondary" onClick={() => { setState(prev => ({...prev, videoUrl: null})); setStep(Step.Upload); }} className="!py-2 !px-4 !text-xs !rounded-xl">
                 New Project
              </GlassButton>
            )}
          </header>

          <GlassCard className="min-h-[600px] flex flex-col backdrop-blur-3xl bg-black/40 !border-white/5 relative">
            
            {/* Audio Generation Loading Overlay */}
            {isUpdatingAudio && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl rounded-[24px] animate-in fade-in duration-300">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-500/30 border-b-transparent border-l-transparent rounded-full animate-spin duration-[1.5s]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-white animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">Synthesizing Audio...</h3>
                <p className="text-white/40 text-sm max-w-xs text-center">Applying neural voice textures and prosody models to your script.</p>
              </div>
            )}
            
            {/* Step: Upload */}
            {step === Step.Upload && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 text-center animate-in fade-in zoom-in-95 duration-500">
                {!state.videoUrl ? (
                  <div className="w-full max-w-xl">
                    <label className="group cursor-pointer block relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative border-2 border-dashed border-white/10 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 rounded-[40px] p-16 transition-all duration-300 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-2xl">
                          <Upload className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Upload Video</h3>
                        <p className="text-white/40 mb-8 max-w-xs mx-auto text-sm leading-relaxed">Drag & drop or click to upload your movie clip. We support most formats.</p>
                        <span className="px-6 py-3 bg-white text-black font-bold rounded-full text-sm hover:scale-105 transition-transform">Browse Files</span>
                      </div>
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                    </label>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video mb-8 group">
                      <video 
                        ref={videoRef} 
                        src={state.videoUrl} 
                        className="w-full h-full object-contain"
                        onLoadedMetadata={calculateDuration}
                        controls
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <GlassButton variant="secondary" onClick={() => setState(prev => ({ ...prev, videoUrl: null }))} className="flex-1">
                        Replace Video
                      </GlassButton>
                      <GlassButton variant="primary" onClick={startAnalysisAndScript} className="flex-[2]">
                        Generate Storyboard <Sparkles className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Generating Script - CINEMA DARK THEME */}
            {step === Step.Generating && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-700">
                
                <div className="w-full max-w-3xl p-1 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-[28px] shadow-2xl">
                  <div className="bg-zinc-950 rounded-[26px] p-8 md:p-12 relative overflow-hidden">
                    
                    {/* Cinematic Glow Background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col gap-10">
                      
                      {/* Header Section */}
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                               <Clapperboard className="w-7 h-7 text-amber-500" />
                            </div>
                            <div>
                               <h3 className="text-2xl font-bold text-white tracking-wide font-mono">PRODUCTION IN PROGRESS</h3>
                               <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.2em] mt-1">
                                 Take {loadingStep === 1 ? '01' : '02'} • Scene {loadingStep} • CAM A
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-4xl font-bold text-amber-500 tabular-nums font-mono tracking-tighter">
                              {Math.round(progress)}<span className="text-base align-top ml-1">%</span>
                            </div>
                         </div>
                      </div>

                      {/* Status Text - Screenplay style */}
                      <div className="bg-black/40 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm min-h-[100px] flex items-center">
                         <p className="text-lg font-mono text-amber-50/90 leading-relaxed w-full">
                           <span className="text-amber-500 mr-2">$</span>
                           <span className="animate-pulse">
                             {progress < 25 ? "Scanning film reels and identifying key plot points..." :
                              progress < 50 ? "Drafting the screenplay and capturing character arcs..." :
                              progress < 75 ? "Applying cinematic tone and voiceover narrative..." :
                              "Finalizing post-production and rendering the recap..."}
                           </span>
                           <span className="inline-block w-2.5 h-5 bg-amber-500 ml-2 align-middle animate-pulse"></span>
                         </p>
                      </div>

                      {/* Film Strip Progress Bar */}
                      <div className="relative">
                         <div className="w-full h-8 bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden relative shadow-inner">
                            {/* The Bar */}
                            <div 
                               className="h-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 relative transition-all duration-500 ease-out flex items-center shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                               style={{ width: `${progress}%` }}
                            >
                               {/* Film Perforations Pattern */}
                               <div className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" 
                                    style={{ 
                                      backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.8) 12px, rgba(0,0,0,0.8) 14px)` 
                                    }}>
                               </div>
                               {/* Leading Edge Highlight */}
                               <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]"></div>
                            </div>
                         </div>
                         
                         {/* Time codes */}
                         <div className="flex justify-between mt-3 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                              <Film className="w-3 h-3" />
                              <span>00:00:00:00</span>
                            </div>
                            <span>EST. REMAINING: {progress < 90 ? '00:00:15:00' : '00:00:00:00'}</span>
                         </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Choose Voice */}
            {step === Step.ChooseVoice && (
              <div className="flex-1 flex flex-col p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setStep(Step.Adjustments)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10">
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h2 className="text-2xl font-bold">Select Voice</h2>
                  </div>
                  <div className="flex bg-white/10 p-1 rounded-full border border-white/10 backdrop-blur-md">
                    {['all', 'male', 'female'].map((g) => (
                      <button 
                        key={g}
                        onClick={() => setGenderFilter(g as any)} 
                        className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all duration-300 ${genderFilter === g ? 'bg-white text-black shadow-lg' : 'text-white/70 hover:text-white'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 h-[500px] no-scrollbar pb-10 content-start">
                  {filteredVoices.map(voice => (
                    <GlassCard 
                      key={voice.id} 
                      onClick={() => setState(prev => ({ ...prev, selectedVoiceId: voice.id }))}
                      className={`p-3 flex items-center gap-3 group transition-all duration-300 border ${state.selectedVoiceId === voice.id ? 'border-blue-400 bg-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-1 ring-blue-400/50' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}`}
                    >
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-inner ${state.selectedVoiceId === voice.id ? 'bg-blue-500 text-white' : 'bg-black/40 text-white/70 border border-white/10'}`}>
                         {voice.name[0]}
                       </div>

                       <div className="flex-1 min-w-0">
                         <h3 className={`font-bold text-sm leading-tight truncate ${state.selectedVoiceId === voice.id ? 'text-white' : 'text-white/80'}`}>{voice.name}</h3>
                         <p className="text-[10px] text-white/40 truncate">{voice.gender} • {voice.styleHint.split(',')[0]}</p>
                       </div>

                       <button 
                          onClick={(e) => playVoicePreview(e, voice)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 border ${previewingVoice === voice.id ? 'bg-blue-500 border-blue-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/20 text-white/70'}`}
                        >
                          {previewingVoice === voice.id ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                        </button>
                    </GlassCard>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <GlassButton variant="primary" onClick={() => setStep(Step.StyleInstructions)} className="w-full max-w-md shadow-2xl shadow-blue-900/50">
                    Next: Style & Vibe <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                </div>
              </div>
            )}

            {/* Step: Style Instructions */}
            {step === Step.StyleInstructions && (
              <div className="flex-1 flex flex-col p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setStep(Step.ChooseVoice)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white/70" />
                  </button>
                  <h2 className="text-2xl font-bold">Direction & Vibe</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                   <div className="lg:col-span-8 flex flex-col gap-6">
                      <div className="bg-black/20 rounded-[24px] p-6 border border-white/5 flex-1 flex flex-col">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 block">Custom Instructions</label>
                        <textarea
                          className="w-full flex-1 bg-transparent text-lg text-white/90 placeholder-white/20 resize-none focus:outline-none leading-relaxed"
                          placeholder="Describe exactly how the narrator should speak..."
                          value={state.styleInstructions}
                          onChange={(e) => setState(prev => ({ ...prev, styleInstructions: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-4">
                        <GlassButton variant="secondary" onClick={() => setStep(Step.ChooseVoice)} className="flex-1">Back</GlassButton>
                        <GlassButton 
                           variant="primary" 
                           onClick={handleUpdateAudio} 
                           disabled={isUpdatingAudio}
                           className="flex-[2]"
                        >
                           {isUpdatingAudio ? (
                             <>Synthesizing Audio... <RefreshCw className="w-4 h-4 animate-spin" /></>
                           ) : (
                             <>Generate Audio <Sparkles className="w-4 h-4" /></>
                           )}
                        </GlassButton>
                      </div>
                   </div>
                   
                   <div className="lg:col-span-4 flex flex-col gap-3 h-[500px] overflow-y-auto no-scrollbar mask-linear-fade">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1 px-2">Presets</label>
                      {STYLE_SUGGESTIONS.map((style, idx) => (
                        <button
                          key={idx}
                          onClick={() => setState(prev => ({ ...prev, styleInstructions: style.text }))}
                          className={`group text-left p-4 rounded-2xl border transition-all duration-300 ${state.styleInstructions === style.text ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                        >
                          <div className="flex items-center gap-3 mb-1">
                             <span className={`${state.styleInstructions === style.text ? 'text-blue-400' : 'text-white/60'} group-hover:scale-110 transition-transform`}>{style.icon}</span>
                             <span className={`font-bold text-sm ${state.styleInstructions === style.text ? 'text-white' : 'text-white/80'}`}>{style.label}</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-normal pl-7">{style.text.substring(0, 60)}...</p>
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {/* Step: Adjustments (Studio) */}
            {step === Step.Adjustments && state.recap && (
              <div className="flex-1 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => { setState(prev => ({...prev, videoUrl: null, recap: null})); setStep(Step.Upload); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold">Studio Board</h2>
                      <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Editor Mode</p>
                    </div>
                  </div>
                  <GlassButton variant="ghost" onClick={() => setState(prev => ({ ...prev, recap: prev.recap ? {...prev.recap, script: originalScript} : null }))} className="!text-xs !py-2 !px-4 border border-white/10">
                     <History className="w-3 h-3" /> Reset Script
                  </GlassButton>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-1 min-h-[500px]">
                  {/* Left: Video Player */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                     <div className="relative rounded-[32px] overflow-hidden bg-black border border-white/10 shadow-2xl aspect-video group">
                        <video 
                           ref={videoRef} 
                           src={state.videoUrl!} 
                           onTimeUpdate={syncPlayers} 
                           onClick={togglePlayback}
                           onPlay={() => setIsVideoPlaying(true)}
                           onPause={() => setIsVideoPlaying(false)}
                           className={`w-full h-full object-contain ${videoSettings.isMirrored ? '-scale-x-100' : 'scale-x-100'}`} 
                        />
                        <audio ref={audioRef} src={state.audioUrl || ''} />
                        
                        {/* Custom Play Overlay */}
                        <div 
                           onClick={togglePlayback}
                           className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer backdrop-blur-[2px]"
                        >
                           <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 fill-white text-white ml-1" />
                           </div>
                        </div>
                     </div>

                     {/* Playback Controls & Volume */}
                     <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                        {/* Volume Control */}
                        <div className="flex items-center gap-3 w-1/3">
                          <button onClick={() => setState(prev => ({...prev, audioSettings: {...prev.audioSettings, originalVolume: prev.audioSettings.originalVolume === 0 ? 1 : 0}}))}>
                            {state.audioSettings.originalVolume === 0 ? <VolumeX className="w-5 h-5 text-white/50" /> : <Volume2 className="w-5 h-5 text-white" />}
                          </button>
                          <div className="flex flex-col w-full">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Original Audio</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={state.audioSettings.originalVolume}
                              onChange={(e) => setState(prev => ({...prev, audioSettings: {...prev.audioSettings, originalVolume: parseFloat(e.target.value)}}))}
                              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center gap-4">
                          <button onClick={() => skipVideo(-5)} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors relative group">
                             <Rewind className="w-5 h-5" />
                             <span className="text-[10px] absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 rounded text-white whitespace-nowrap">-5s</span>
                          </button>

                          <button onClick={togglePlayback} className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                             {isVideoPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                          </button>

                          <button onClick={() => skipVideo(5)} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors relative group">
                             <FastForward className="w-5 h-5" />
                             <span className="text-[10px] absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 rounded text-white whitespace-nowrap">+5s</span>
                          </button>
                        </div>
                     </div>
                  </div>

                  {/* Right: Script Editor */}
                  <div className="lg:col-span-5 flex flex-col h-full bg-black/20 rounded-[32px] border border-white/5 overflow-hidden shadow-inner">
                     <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Script Editor</span>
                        {isOutOfSync && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Unsynced
                          </span>
                        )}
                     </div>
                     <textarea 
                        className="flex-1 w-full bg-transparent p-6 text-lg leading-loose text-white placeholder-white/20 resize-none focus:outline-none myanmar-text overflow-y-auto"
                        value={state.recap.script || ''}
                        onChange={(e) => {
                          const newScript = e.target.value;
                          setState(prev => ({ ...prev, recap: prev.recap ? { ...prev.recap, script: newScript } : null }));
                        }}
                        spellCheck={false}
                        placeholder="Script will appear here..."
                     />
                     <div className="p-4 border-t border-white/5 bg-white/[0.02] flex flex-col gap-3 shrink-0">
                        {/* Navigation to Voice/Style Selection */}
                        <GlassButton 
                          onClick={() => setStep(Step.ChooseVoice)}
                          variant={!state.audioUrl ? 'primary' : 'glass'}
                          className="w-full"
                        >
                           {!state.audioUrl ? (
                             <>Generate Narration <Mic className="w-4 h-4" /></>
                           ) : (
                             <>Regenerate / Change Voice <Settings2 className="w-4 h-4" /></>
                           )}
                        </GlassButton>
                        
                        {state.audioUrl && (
                           <GlassButton 
                              onClick={() => setStep(Step.PreviewExport)} 
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                           >
                              Finish Project <CheckCircle className="w-4 h-4" />
                           </GlassButton>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Export */}
            {step === Step.PreviewExport && state.recap && (
               <div className="flex-1 flex flex-col p-8 md:p-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => setStep(Step.Adjustments)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Ready to Export</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                           <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white/80"><Download className="w-5 h-5 text-blue-400" /> Export Options</h3>
                           <div className="space-y-4">
                              <div className="bg-black/20 p-6 rounded-[24px] border border-white/5 flex items-center justify-between group hover:bg-black/30 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div onClick={() => {
                                      if (isFinalAudioPlaying) {
                                        finalAudioRef.current?.pause();
                                      } else {
                                        finalAudioRef.current?.play().catch(e => { if (e.name !== 'AbortError') console.error(e); });
                                      }
                                    }} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                                       {isFinalAudioPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                    </div>
                                    <div>
                                       <div className="font-bold">Narration Audio</div>
                                       <div className="text-xs text-white/40 font-mono">WAV • 48kHz • Stereo • {formatTime(state.audioDuration)}</div>
                                    </div>
                                 </div>
                                 <button onClick={exportAudio} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                    <Download className="w-4 h-4" />
                                 </button>
                              </div>

                              <button onClick={exportScript} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-[24px] border border-white/5 transition-all group">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/60">
                                       <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                       <div className="font-bold group-hover:text-blue-400 transition-colors">Text Script</div>
                                       <div className="text-xs text-white/40 font-mono">TXT • UTF-8</div>
                                    </div>
                                 </div>
                                 <Download className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                              </button>

                              <button onClick={exportSRT} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-[24px] border border-white/5 transition-all group">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/60">
                                       <TypeIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                       <div className="font-bold group-hover:text-blue-400 transition-colors">Subtitles</div>
                                       <div className="text-xs text-white/40 font-mono">SRT • Time-synced</div>
                                    </div>
                                 </div>
                                 <Download className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md h-full">
                           <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white/80"><Info className="w-5 h-5 text-blue-400" /> Metadata</h3>
                           
                           <div className="space-y-6">
                              <CopyableField 
                                label="Movie Name" 
                                text={state.movieTitle} 
                                isInput={true}
                                onUpdate={(val) => setState(prev => ({...prev, movieTitle: val}))}
                              />
                              
                              <div>
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Title Options</label>
                                <div className="space-y-2">
                                  {state.recap.titleOptions?.map((opt, i) => (
                                    <CopyableField key={i} text={opt} />
                                  ))}
                                  {!state.recap.titleOptions?.length && <div className="text-white/20 text-sm italic">No titles generated</div>}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <CopyableField label="Genre" text={state.recap.genre || 'Unknown'} />
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                                   <span className="text-xs text-white/40 uppercase font-bold mb-1">Duration</span>
                                   <span className="text-white font-bold">{state.metadata?.formattedDuration}</span>
                                </div>
                              </div>

                              <CopyableField label="Logline" text={state.recap.logline || 'No logline available'} multiline={true} />
                              
                              <CopyableField label="Summary" text={state.recap.summary} multiline={true} />
                           </div>
                        </div>

                        <button onClick={() => { setState(prev => ({...prev, videoUrl: null, videoBlob: null, recap: null, audioUrl: null, metadata: null})); setStep(Step.Upload); setErrorMessage(null); setIsQuotaError(false); }} className="w-full py-4 text-white/30 hover:text-white transition-colors text-sm font-medium">
                           Start New Project
                        </button>
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
           mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        }
        @keyframes progress {
          0% { width: 0% }
          100% { width: 100% }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
