
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { VideoMetadata, RecapData } from "../types";

export async function analyzeVideo(videoBase64: string, mimeType: string, duration: number): Promise<{ metadata: VideoMetadata, recap: RecapData }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  const prompt = `
    Watch this video (Duration: ${duration} seconds).
    Analyze the video and provide a recap in Burmese.
    
    EXECUTE ALL STEPS OF THE MASTER PROMPT:
    1. Full video pass & Anti-miss capture.
    2. Context detection (Metadata including Confidence Score).
    3. Script writing (Apply VIBE, HUMAN-LIKE, STRICT NAME, QA & SCENE LOCK rules).
    4. Apply V3.2 PATCH CLARITY rules (Strict Metadata, Present Tense, Ambiguity Lock).
    5. TTS Friendly Rewrite & Safety check.
    6. Stability & Validation rules.
    7. Self-Correction Loop.

    CRITICAL REQUIREMENTS:
    - The 'script' MUST be roughly ${duration} seconds long when spoken.
    - FORMATTING: DO NOT USE COMMAS (၊) OR PERIODS (။). Use 2-4 spaces for pauses.
    - Use the "must-include beats" logic to ensure no key moment is missed.
    - Identify or suggest a concise and accurate title for this movie/video clip in the "movieTitle" field.
    - STRICTLY ADHERE to the Forbidden Words list in the System Prompt.
    - Prioritize on-screen text: Locations/Dates (P1), Key Plot (P2), Background (Ignore).
    - METADATA: endingStyle must be "Finished", "Abruptly cut", or "Uncertain".
    
    ALSO GENERATE METADATA FOR SOCIAL MEDIA (in Burmese):
    1. titleOptions: Generate 3 viral/clickbait style titles suitable for TikTok/Facebook.
    2. genre: The movie genre in Burmese.
    3. logline: A single, compelling sentence summary (hook) in Burmese.
    
    Return the response as JSON with these fields:
    - metadata: { detectedLanguage, languageEvidence, audioType, category, categoryConfidence, endingStyle }
    - recap: { movieTitle, titleOptions, genre, logline, summary, events: [{time, description}], characters: [{name, description}], script, unclearPoints: [] }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: videoBase64, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: {
            type: Type.OBJECT,
            properties: {
              detectedLanguage: { type: Type.STRING },
              languageEvidence: { type: Type.STRING },
              audioType: { type: Type.STRING },
              category: { type: Type.STRING },
              categoryConfidence: { type: Type.STRING, description: "Confidence score 1-5" },
              endingStyle: { type: Type.STRING, enum: ["Finished", "Abruptly cut", "Uncertain"] }
            }
          },
          recap: {
            type: Type.OBJECT,
            properties: {
              movieTitle: { type: Type.STRING, description: "Suggest a concise title for the video/movie" },
              titleOptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 viral/clickbait style titles in Burmese"
              },
              genre: { type: Type.STRING, description: "Movie genre in Burmese" },
              logline: { type: Type.STRING, description: "A one-sentence summary hook in Burmese" },
              summary: { type: Type.STRING },
              events: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              script: { type: Type.STRING },
              unclearPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of ambiguous elements or unclear points found in the video"
              }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No analysis returned from model");
  return JSON.parse(text);
}

export async function generateTTS(text: string, voiceEngine: string, styleInstructions: string, styleHint: string = ''): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash-preview-tts";
  
  // Keep the prompt clear and focused on text-to-speech
  const fullPrompt = `Style: ${styleHint}. ${styleInstructions}. TTS this Burmese text: ${text}`;
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: {
      responseModalities: ["AUDIO"], // Using string literal to ensure compatibility
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceEngine },
        },
      },
    },
  });

  // Robustly search for the audio part across all candidates and parts
  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error("No candidates returned from TTS model. This might be due to safety filters.");
  }

  let base64Audio = '';
  for (const part of candidate.content.parts) {
    if (part.inlineData?.data) {
      base64Audio = part.inlineData.data;
      break;
    }
  }

  if (!base64Audio) {
    // If no audio part but there is text, it might be an error message from the model
    if (candidate.content.parts[0]?.text) {
      throw new Error(`TTS generation failed: ${candidate.content.parts[0].text}`);
    }
    throw new Error("Failed to generate audio: No audio data found in response");
  }
  
  return `data:audio/pcm;base64,${base64Audio}`;
}

// Utility to wrap PCM in WAV
export function wrapPcmInWav(base64Pcm: string, sampleRate: number = 24000): string {
    const binary = atob(base64Pcm);
    const len = binary.length;
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);
    
    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + len, true);
    writeString(8, 'WAVE');
    
    // fmt subchunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // Linear PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // Block align (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // Bits per sample
    
    // data subchunk
    writeString(36, 'data');
    view.setUint32(40, len, true);

    // Write PCM data
    for (let i = 0; i < len; i++) {
        view.setUint8(44 + i, binary.charCodeAt(i));
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
}
