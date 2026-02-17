
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { VideoMetadata, RecapData } from "../types";

export async function analyzeVideo(videoBase64: string, mimeType: string, duration: number, perspective: 'first_person' | 'third_person' = 'third_person'): Promise<{ metadata: VideoMetadata, recap: RecapData }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const perspectiveInstruction = perspective === 'first_person' 
    ? 'NARRATIVE PERSPECTIVE: FIRST PERSON ("ကျွန်တော်/ကျွန်မ" - I). Narrate the story as if YOU are the main character involved in the events. Use first-person pronouns where appropriate and express internal thoughts directly.' 
    : 'NARRATIVE PERSPECTIVE: THIRD PERSON ("သူ" - He/She/They). Standard narrator style. Describe the events as an observer.';

  const prompt = `
    Watch this video (Duration: ${duration} seconds).
    Analyze the video and provide a recap in Burmese.
    
    ${perspectiveInstruction}

    EXECUTE ALL STEPS OF THE MASTER PROMPT V5.6:
    1. Full video pass & Anti-miss capture.
    2. Context detection (Metadata including Confidence Score).
    3. Script writing (Apply VIBE, HUMAN-LIKE, STRICT NAME, QA & SCENE LOCK rules).
    4. Follow Section K density rules: 
       - 1 Minute: 18-23 beats
       - 2 Minutes: 24-30 beats
       - 3 Minutes: 31-37 beats
    5. Follow Section K anchor rules: Timestamps must round to the nearest 5 seconds.
    6. Apply Section D Spacebar Pause Mode: No commas or periods. Use exactly 2 or 3-4 spaces.
    7. TTS Friendly Rewrite & Safety check.
    
    CRITICAL REQUIREMENTS:
    - The 'script' MUST be roughly ${duration} seconds long when spoken.
    - FORMATTING: DO NOT USE COMMAS (၊) OR PERIODS (။). 
    - Identify or suggest a concise and accurate title for this movie/video clip in the "movieTitle" field.
    - STRICTLY ADHERE to the Forbidden Words list and replacements in the System Prompt.
    - METADATA: endingStyle must be "Finished", "Abruptly cut", or "Uncertain".
    
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

export async function regenerateScriptWithStyle(originalScript: string, styleLabel: string, styleDescription: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Rewrite the following Burmese video recap script using a "${styleLabel}" narrative style.
    
    STYLE DESCRIPTION: ${styleDescription}
    
    ================================================
    SPOKEN BURMESE SAFETY RULES  STRICT (MUST FOLLOW)
    Allowed ending particles only
    "တာ" "လေး" "လာ" "ပြီ" "ကွ" "ဘူး" "က" "တယ်" "တဲ့" "ရယ်" "နဲ့" "တော့" "မှာ" "လား" "ကျ" "မှ" "ကြီး" "ကို" "ကွာ" "ပဲ" "မယ်" "ထိ" "လို့" "သာ" "ပါ" "ရင်" "ဖို့" "ရဲ့" "လေ" "ရာ" "ကိုး" "ပေါ့" "လည်း" "ပြီး" "နော်" "အတွက်" "ဗျ"
    Forbidden anywhere
    "သည်" "၏" "၌" "မည်"
    "တည်း" "ကဲ့သို့" "အနေဖြင့်" "ဖြစ်သည်" "ဖြစ်၏"
    Old forms forbidden
    "ကျနော်" "ဟု" "၎င်း" "၍"
    "ထို" "၎င်းတို့" "ယင်း" "မည်သို့" "အဘယ်" "အထူးသဖြင့်" "အလျင်အမြန်"
    Required replacements
    "ကျနော်" -> "ကျွန်တော်"
    "ဟု" -> "ဟုတ်"
    "၎င်း" -> "အဲ့ဒါ"
    "၍" -> "ဒါကြောင့်"
    "ထို" -> "အဲ့ဒါ"
    "ယင်း" -> "အဲ့ဒါ"
    "မည်သို့" -> "ဘယ်လို"
    "အဘယ်" -> "ဘာ"
    "အနေဖြင့်" -> "အနေနဲ့"
    "ကဲ့သို့" -> "လို"
    "ဖြစ်သည်" -> "ဖြစ်တာ" or "ဖြစ်တယ်"
    "ဖြစ်၏" -> "ဖြစ်တယ်"
    "တည်း" -> "ပဲ" or remove
    "၎င်းတို့" -> "သူတို့"
    "လျှော့" -> "ရှော့"
    "အထူးသဖြင့်" -> "အထူးတလည်"
    "အလျင်အမြန်" -> "မြန်မြန်"
    "အံ့သြ" -> "အံအော"
    "လျှို့ဝှက်ချက်" -> "လို့ဝှက်ချက်"
    "တပည့်" -> "တပဲ့"
    "ပါးစပ်" -> "ပစပ်"
    “ရောက်ရှိ” -> “ရောက်လာ”
    “ဝင်ရောက်” -> “ဝင်သွား”
    “စတင်” -> “စပြီး”
    “အသုံးပြု” -> “သုံး”
    “ပြသ” -> “ပြ”
    “ရှာဖွေ” -> “လိုက်ရှာ”
    “ဖယ်ရှား” -> “ဖယ်လိုက်”
    “သတိပြုမိ” -> “သတိထားမိ”
    “ဆောင်ရွက်” -> “လုပ်”
    “ကြိုးစားအားထုတ်” -> “ကြိုးစား”
    “လက်ခံရရှိ” -> “ရလိုက်”
    “ငြင်းပယ်” -> “ငြင်းလိုက်”
    “မေးမြန်း” -> “မေး”
    “ပြောကြား” -> “ပြော”
    “မြင်တွေ့ရ” -> “မြင်ရ”
    Contextual Particle Usage  Emotion  Intent
    - “လေ”  Use for explaining or soft persuasion
    - “ပေါ့”  Use for agreement or stating the obvious
    - “နော်”  Use to seek attention or agreement
    - “ဗျ”  Polite male tone  use rarely
    - Rule  Do not add particles just to fill time  match the emotion
    ================================================
    
    STRICT EXECUTION RULES:
    1. FACTUALITY: Do not change the events or facts. Only change the tone and narrative angle.
    2. FORMATTING: DO NOT USE COMMAS (၊) OR PERIODS (။). Use exactly 2 or 3-4 spaces for pauses as per Section D of System Prompt.
    3. LENGTH: Keep the spoken duration roughly the same as the original.
    4. NAMES: Keep all English names exactly as they are.
    
    ORIGINAL SCRIPT:
    ${originalScript}
    
    Output ONLY the rewritten script as a single string.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ text: prompt }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to regenerate script");
  return text;
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
