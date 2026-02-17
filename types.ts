
export enum Step {
  Upload = 'UPLOAD',
  ChooseVoice = 'CHOOSE_VOICE',
  StyleInstructions = 'STYLE_INSTRUCTIONS',
  Generating = 'GENERATING',
  Adjustments = 'ADJUSTMENTS',
  PreviewExport = 'PREVIEW_EXPORT'
}

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  voiceEngine: string; // The underlying prebuilt voice name (Kore, Fenrir, etc.)
  description: string;
  previewText: string;
  styleHint: string; // Specific instructions to make this "profile" unique
}

export interface VideoMetadata {
  duration: number; // in seconds
  formattedDuration: string; // MM:SS
  detectedLanguage?: string;
  languageEvidence?: string;
  audioType?: string;
  category?: string;
  categoryConfidence?: string;
  endingStyle?: string;
}

export interface RecapData {
  movieTitle?: string;
  titleOptions?: string[];
  genre?: string;
  logline?: string;
  summary: string;
  events: { time: string; description: string }[];
  characters: { name: string; description: string }[];
  script: string;
  unclearPoints?: string[];
}

export interface AudioSettings {
  narrationVolume: number;
  originalVolume: number;
}

export interface GenerationState {
  videoBlob: Blob | null;
  videoUrl: string | null;
  selectedVoiceId: string;
  styleInstructions: string;
  metadata: VideoMetadata | null;
  recap: RecapData | null;
  audioUrl: string | null;
  audioDuration: number;
  audioSettings: AudioSettings;
  movieTitle: string;
  narrativePerspective: 'first_person' | 'third_person';
}
