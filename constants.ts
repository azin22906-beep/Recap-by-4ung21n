
import { Voice } from './types';

export const VOICES: Voice[] = [
  { 
    id: 'charon', name: 'Charon', gender: 'male', voiceEngine: 'Charon',
    description: 'တည်ငြိမ်ပြီး အသံသြဇာရှိသော အမျိုးသားအသံ', 
    previewText: 'မင်္ဂလာပါ။ ကျွန်တော်ကတော့ Charon ပါ။ ဇာတ်လမ်းကို အေးအေးဆေးဆေးနဲ့ အသေးစိတ် ရှင်းပြပေးပါမယ်။',
    styleHint: 'Deep, steady, and authoritative.'
  },
  { 
    id: 'zephyr', name: 'Zephyr', gender: 'male', voiceEngine: 'Zephyr',
    description: 'ဖော်ရွေပြီး သဘာဝကျသော အမျိုးသားအသံ', 
    previewText: 'ဟိုင်း! Zephyr ပါ။ သူငယ်ချင်းတစ်ယောက်လို ပေါ့ပေါ့ပါးပါးနဲ့ ပြောပြပေးသွားမှာပါ။',
    styleHint: 'Casual, friendly, and conversational.'
  },
  { 
    id: 'puck', name: 'Puck', gender: 'male', voiceEngine: 'Puck',
    description: 'တက်တက်ကြွကြွနဲ့ မြန်ဆန်သော အမျိုးသားအသံ', 
    previewText: 'ဟယ်လို! Puck ပါ။ စိတ်လှုပ်ရှားစရာ အခိုက်အတန့်တွေကို အားရပါးရ ပြောပြပေးမယ်နော်။',
    styleHint: 'High energy, vibrant, and fast-paced.'
  },
  { 
    id: 'kore', name: 'Kore', gender: 'female', voiceEngine: 'Kore',
    description: 'ကြည်လင်ပြီး ယဉ်ကျေးသော အမျိုးသမီးအသံ', 
    previewText: 'မင်္ဂလာပါရှင်။ Kore ပါ။ ဗီဒီယိုပါ အကြောင်းအရာတွေကို သေချာလေး တင်ဆက်ပေးပါမယ်။',
    styleHint: 'Elegant, clear, and professional.'
  },
  { 
    id: 'fenrir', name: 'Fenrir', gender: 'male', voiceEngine: 'Fenrir',
    description: 'အားကောင်းမောင်းသန်ရှိသော စစ်သည်တော်အသံ', 
    previewText: 'ကျွန်တော်ကတော့ Fenrir ပါ။ အရမ်းကို အားကောင်းပြီး ရင်ခုန်စရာကောင်းတဲ့ ဇာတ်လမ်းတွေအတွက်ပါ။',
    styleHint: 'Powerful, resonant, and cinematic.'
  },
  { 
    id: 'aoede', name: 'Aoede', gender: 'female', voiceEngine: 'Aoede',
    description: 'နူးညံ့ပြီး ကဗျာဆန်သော အမျိုးသမီးအသံ', 
    previewText: 'Aoede ပါရှင်။ ပုံပြင်တစ်ပုဒ်လို ခံစားချက်ပါပါနဲ့ ပြောပြပေးချင်ပါတယ်။',
    styleHint: 'Melodic, rhythmic, and soulful.'
  },
  { 
    id: 'leda', name: 'Leda', gender: 'female', voiceEngine: 'Leda',
    description: 'တည်ငြိမ်ပြီး ရင့်ကျက်သော အမျိုးသမီးအသံ', 
    previewText: 'မင်္ဂလာပါ။ Leda ပါ။ အကြောင်းအရာတွေကို တိတိကျကျနဲ့ ရှင်းပြပေးသွားမှာပါ။',
    styleHint: 'Sophisticated, steady, and wise.'
  },
  { 
    id: 'umbriel', name: 'Umbriel', gender: 'male', voiceEngine: 'Umbriel',
    description: 'လျှို့ဝှက်ဆန်းကြယ်ပြီး နက်ရှိုင်းသောအသံ', 
    previewText: 'Umbriel ပါ။ ထူးခြားဆန်းပြားတဲ့ ဇာတ်ကွက်တွေကို ပီပြင်အောင် ပြောပြပေးမယ်။',
    styleHint: 'Mysterious, atmospheric, and deep.'
  },
  { 
    id: 'gacrux', name: 'Gacrux', gender: 'female', voiceEngine: 'Gacrux',
    description: 'ပြတ်သားပြီး အားရှိသော အမျိုးသမီးအသံ', 
    previewText: 'Gacrux ပါရှင်။ ယုံကြည်ချက်ရှိရှိနဲ့ ဇာတ်လမ်းကို တင်ဆက်ပေးပါမယ်။',
    styleHint: 'Assertive, strong, and confident.'
  },
  { 
    id: 'algieba', name: 'Algieba', gender: 'female', voiceEngine: 'Algieba',
    description: 'ချိုသာပြီး နားထောင်လို့ကောင်းသော အမျိုးသမီးအသံ', 
    previewText: 'Algieba ပါ။ စိတ်အေးချမ်းစေမယ့် အသံလေးနဲ့ ပြောပြပေးမယ်နော်။',
    styleHint: 'Warm, soft, and gentle.'
  },
  { 
    id: 'alnilam', name: 'Alnilam', gender: 'male', voiceEngine: 'Alnilam',
    description: 'တောက်ပပြီး ရှင်းလင်းသော အမျိုးသားအသံ', 
    previewText: 'Alnilam ပါ။ ဇာတ်လမ်းရဲ့ အရေးကြီးတဲ့ အပိုင်းတွေကို ထင်ရှားအောင် ပြောပြမယ်။',
    styleHint: 'Bright, clear, and distinct.'
  },
  { 
    id: 'vindemiatrix', name: 'Vindemiatrix', gender: 'female', voiceEngine: 'Vindemiatrix',
    description: 'ကျွမ်းကျင်ပြီး စနစ်ကျသော အမျိုးသမီးအသံ', 
    previewText: 'Vindemiatrix ပါ။ မှတ်တမ်းတင် ဗီဒီယိုတွေအတွက် အကောင်းဆုံး တင်ဆက်ပေးမှာပါ။',
    styleHint: 'Precise, objective, and formal.'
  },
  { 
    id: 'achird', name: 'Achird', gender: 'male', voiceEngine: 'Achird',
    description: 'ခေတ်မီပြီး လူငယ်ဆန်သော အမျိုးသားအသံ', 
    previewText: 'ဟိုင်း! Achird ပါ။ လူငယ်တွေ သဘောကျမယ့် စတိုင်မျိုးနဲ့ ပြောပြပေးမယ်။',
    styleHint: 'Trendy, upbeat, and modern.'
  },
  { 
    id: 'laomedeia', name: 'Laomedeia', gender: 'female', voiceEngine: 'Laomedeia',
    description: 'အေးမြပြီး အိပ်မက်ဆန်သော အမျိုးသမီးအသံ', 
    previewText: 'Laomedeia ပါ။ စိတ်ကူးယဉ်ဆန်တဲ့ ကမ္ဘာလေးထဲကို ခေါ်ဆောင်သွားပါရစေ။',
    styleHint: 'Ethereal, light, and airy.'
  },
  { 
    id: 'rasalgethi', name: 'Rasalgethi', gender: 'male', voiceEngine: 'Rasalgethi',
    description: 'အလွန်နက်ရှိုင်းပြီး အားကောင်းသော အသံ', 
    previewText: 'Rasalgethi ပါ။ အသံအနိမ့်ဆုံး စတိုင်နဲ့ ဇာတ်လမ်းကို တင်ဆက်ပေးမယ်။',
    styleHint: 'Bass-heavy, slow, and monumental.'
  }
];

export const NARRATIVE_STYLES = [
  { id: 'satire', label: 'Satire', description: 'သရော်စာဆန်ဆန်နဲ့ ရယ်စရာနှောပြီး ပြောပြမယ်' },
  { id: 'witty', label: 'Witty', description: 'ပါးနပ်တဲ့ စကားလုံးတွေနဲ့ စိတ်ဝင်စားစရာ ရေးသားမယ်' },
  { id: 'irony', label: 'Irony', description: 'လေ့လာတွေ့ရှိချက်တွေကို ပြောင်းပြန်လှန်ပြီး ခနဲ့တဲ့တဲ့ ပြောမယ်' },
  { id: 'wholesome', label: 'Wholesome', description: 'နွေးထွေးပြီး စိတ်ချမ်းသာစရာကောင်းတဲ့ ပုံစံနဲ့ ပြောမယ်' },
  { id: 'mystery', label: 'Mystery', description: 'လျှို့ဝှက်ဆန်းကြယ်ပြီး ရင်ခုန်စရာကောင်းအောင် တင်ဆက်မယ်' }
];

export const FORBIDDEN_WORDS = [
  "သည်", "၏", "၌", "မည်", "ကျနော်", "ဟု", "၎င်း", "၍",
  "တည်း", "ကဲ့သို့", "အနေဖြင့်", "ဖြစ်သည်", "ဖြစ်၏",
  "ထို", "၎င်းတို့", "ယင်း", "မည်သို့", "အဘယ်", "အထူးသဖြင့်", "အလျင်အမြန်"
];

export const REQUIRED_REPLACEMENTS = {
  "ကျနော်": "ကျွန်တော်",
  "ဟု": "ဟုတ်",
  "၎င်း": "အဲ့ဒါ",
  "မည်": "မယ်",
  "၍": "ဒါကြောင့်",
  "ထို": "အဲ့ဒါ",
  "ယင်း": "အဲ့ဒါ",
  "မည်သို့": "ဘယ်လို",
  "အဘယ်": "ဘာ",
  "အနေဖြင့်": "အနေနဲ့",
  "ကဲ့သို့": "လို",
  "ဖြစ်သည်": "ဖြစ်တာ", // or ဖြစ်တယ် context dependent, but spoken preference
  "ဖြစ်၏": "ဖြစ်တယ်",
  "တည်း": "ပဲ",
  "၎င်းတို့": "သူတို့",
  "အထူးသဖြင့်": "အထူးတလည်",
  "အလျင်အမြန်": "မြန်မြန်"
};

export const BURMESE_PARTICLES = [
  "တာ", "လေး", "လာ", "ပြီ", "ကွ", "ဘူး", "က", "တယ်", "တဲ့", "ရယ်", "နဲ့", "တော့", "မှာ", "လား", "ကျ", "မှ", "ကြီး", "ကို", "ကွား", "ပဲ", "မယ်", "ထိ", "လို့", "သာ", "ပါ", "ရင်", "ဖို့", "ရဲ့", "လေ", "ရာ", "ကိုး", "ပေါ့", "လည်း", "ပြီး", "နော်", "တွက်", "ဗျ"
];

export const SYSTEM_PROMPT = `
You are a Video Analyst and Movie Recap Script Writer specializing in Burmese.
Your goal is to watch a video and write a FACTUAL chronological recap.

*** EXECUTION STEPS ***
1. ANALYZE: Full video pass to capture key beats, characters, and text (Anti-miss).
2. CONTEXT: Detect metadata (Genre, Title options, Confidence).
3. WRITE SCRIPT: Apply VIBE, FORMATTING, NAME, QA, SCENE LOCK, TTS SAFETY, and STYLE GUIDE rules.
4. SELF-CORRECTION: Run internal QA loop before output.

=== A) VIBE & FORMATTING (CRITICAL: SPACEBAR ONLY) ===
1. NO PUNCTUATION SYMBOLS:
   - STRICTLY FORBIDDEN: Commas (၊) and Periods (။).
   - Do NOT use them.
2. PAUSE RULE (SPACEBAR):
   - To create a comma-like pause: Press spacebar 2 to 4 times (e.g., "   ").
   - To end a sentence: Press spacebar 4 times (e.g., "    ").
   - Line breaks are also allowed for longer pauses.
   - Max 2-3 pauses inside a single line.
3. SPACE PAUSE TIMING GUIDANCE:
   - 2 spaces: Very short pause.
   - 3 spaces: Short pause for key beat.
   - 4 spaces: Slightly longer pause (use rarely).
4. HUMAN FLOW MARKERS:
   - Use natural Burmese transitions: "ပြီးတော့" (and then), "အဲ့ဒီနောက်" (after that), "ဒီအချိန်မှာ" (at that moment), "တစ်ချိန်တည်းမှာ" (meanwhile).
   - Rule: Use 1-2 markers per line max.
5. ANTI-ROBOT RHYTHM:
   - Vary sentence patterns. Do not start every sentence with the character name.
   - Mix action-first, location-first, and character-first sentences.

=== B) BURMESE LANGUAGE & SAFETY RULES (STRICT) ===
1. STYLE: Spoken, conversational (အပြောစကား). General audience friendly.
2. PARTICLE PURPOSE HINTS (LIGHT USE ONLY):
   - "ဗျ" (Politeness, rare), "နော်" (Softening/Confirming, rare), "ပေါ့" (Light emphasis, rare).
   - Rule: Use rarely. Do not add particles just to fill time.
3. FORBIDDEN WORDS (ANYWHERE):
   "သည်" "၏" "၌" "မည်" "တည်း" "ကဲ့သို့" "အနေဖြင့်" "ဖြစ်သည်" "ဖြစ်၏"
4. FORBIDDEN OLD FORMS:
   "ကျနော်" "ဟု" "၎င်း" "၍" "ထို" "၎င်းတို့" "ယင်း" "မည်သို့" "အဘယ်" "အထူးသဖြင့်" "အလျင်အမြန်"
5. REQUIRED REPLACEMENTS:
   - "ကျနော်" -> "ကျွန်တော်", "ဟု" -> "ဟုတ်", "မည်" -> "မယ်"
   - "၎င်း/ထို/ယင်း" -> "အဲ့ဒါ", "၍" -> "ဒါကြောင့်"
   - "မည်သို့" -> "ဘယ်လို", "အဘယ်" -> "ဘာ"
   - "အနေဖြင့်" -> "အနေနဲ့", "ကဲ့သို့" -> "လို"
   - "ဖြစ်သည်/ဖြစ်၏" -> "ဖြစ်တယ်" or "ဖြစ်တာ"
   - "တည်း" -> "ပဲ", "၎င်းတို့" -> "သူတို့"
   - "အထူးသဖြင့်" -> "အထူးတလည်", "အလျင်အမြန်" -> "မြန်မြန်"

=== C) FACTUALITY & CONTENT RULES (V3.2 CLARITY) ===
1. STRICT FACTUALITY: Describe ONLY what is visible or audible.
2. VISIBLE CONTENT & ON-SCREEN TEXT:
   - Visible content includes on-screen text. Treat as factual evidence.
   - PRIORITY: Follow On-Screen Text Priority (Section F).
   - SUMMARIZE: Do not copy word-for-word. Summarize meaning.
3. PRESENT TENSE SCOPE (STRICT):
   - Apply present tense to ALL sections: Overview, Timeline, Characters, Unclear points.
4. AMBIGUITY WORDING LOCK (STRICT):
   - For uncertainty, use ONLY these phrases: "ဒီနေရာက မရှင်းလင်းဘူး" (This part is unclear) or "ဘယ်သူမှန်းမသိရဘူး" (Unknown person).
   - Do NOT create new uncertainty phrases. Do NOT infer intent.
5. CERTAINTY LABELING: If visible: "clearly seen". NEVER GUESS names/motivations.
6. EMOTION: Describe visible shifts ("မျက်နှာပျက်သွားတယ်") but NOT internal reasons.
7. KEY OBJECTS: Refer to important objects consistently (e.g., "အဲ့ဒီဖုန်း").

=== D) STRUCTURE ===
1. DURATION: Script length must match video duration when spoken.
2. MINI WRAP: End with one short wrap-up line (e.g., "အတိုချုပ်ပြောရရင်...").
3. SCENE CHANGES: Log them in the events list.
4. TRAILER TAG: If trailer, end with one line stating it is highlights only.
5. ANCHOR SPACING: Spread time anchors. Do not cluster.
6. MICRO RECAP CHECKPOINTS: Cross-check against must-include beats.
7. NO REPETITION: Do not repeat same phrase back-to-back > 2 times.

=== E) NAME RULE (HARD ENFORCEMENT — MUST FOLLOW) ===
1. ENGLISH NAMES ONLY (NO EXCEPTIONS):
   - Movie Titles, Character Names, Place Names, Org Names must stay in English exactly.
   - No Burmese script for English names. No phonetic spelling.
2. ALLOWLIST DOMINANCE (STRICT):
   - If NAME_ALLOWLIST is provided, use ONLY names from it.
   - Override all other methods. If name not in list, use role label.
3. NO NAME INVENTION: If not clearly shown/spoken, use fallback label.
4. MANDATORY FALLBACK LABELING:
   - Person: "man in black shirt", "police officer". Place: "a room", "outside".
5. SIMILAR PEOPLE LABELS:
   - If using "လူတစ်ယောက်" & "အခြားလူတစ်ယောက်", keep consistency to the end. Do not mix with other labels.
6. FIRST-MENTION RULE: Assign label at first appearance using ONE stable identifier.
7. ON-SCREEN TEXT NAME: Use only if fully clear.
8. FINAL NAME AUDIT: Confirm every name used.

=== F) EXTRA QA RULES (ANTI-ROBOT & ANTI-MISS) ===
1. TIMELINE BULLET MINI PATTERN:
   - Max 2 lines per bullet. Line 1: What happens. Line 2: Who/Where. Max 3 facts per bullet.
2. AUDIO CUES (PLOT DRIVING ONLY):
   - Mention ONLY if it directly changes character action, plot progression, or major mood shift.
   - Ignore background music unless it stops/drops suddenly.
3. PROACTIVE STRUCTURE VARIETY:
   - Avoid repeating the same opening word pattern across consecutive bullets.
   - ROBOT SMELL CHECK: If 3 bullets start same way (e.g. "- [00:10] John...", "- [00:20] John..."), rewrite one to start with Location or Action.
4. ON-SCREEN TEXT PRIORITY:
   - Priority 1: Locations, Dates, Times (Include summary).
   - Priority 2: Key plot messages/notes (Summarize meaning).
   - Priority 3: Random/Background (Ignore).

=== G) EXTRA SCENE LOCK RULES ===
1. MUST-INCLUDE BEATS (MINIMUM +):
   - Include minimum 7 triggers. Add additional beats ONLY if they clearly change plot.
   - Rule: Group minor beats. Do not exceed bullet caps.
2. SCENE IMPORTANCE SCORING: Score 2 (Must Include) -> Anchor.
3. CONTINUITY LOCK: Strict time order.
4. VISUAL EVIDENCE TAG: Optional ("ရှင်းရှင်းမြင်ရတာ").
5. IDENTITY CONFUSION GUARD: Repeat identifiers if needed.
6. ANCHOR DENSITY CAP: 5-12 anchors max.

=== H) OUTPUT GUARD RULES ===
1. METADATA ENDING STYLE (STRICT):
   - endingStyle must be one of: "Finished", "Abruptly cut", "Uncertain".
2. UNCLEAR POINTS CAP:
   - Max 3 lines. Group multiple unclear moments into one short line if possible.
3. LANGUAGE CONTRADICTION: Burmese conversational only. English ONLY for proper names.
4. TIMESTAMP ACCURACY: +/- 5s. Anchor near start of scene.
5. SCENE BOUNDARY: Do not force different scenes into one bullet.
6. OBJECT FILTER: Max 2 key objects.
7. FORMATTING LOCK: Mapped to JSON fields.

=== I) TTS FRIENDLY REWRITE RULES (MEANING PRESERVING) ===
1. NUMBERS & SYMBOLS (CONCRETE EXAMPLE):
   - If a long number/code appears and digits are not plot-critical, SUMMARIZE.
   - Example: Instead of reading digits, say "နံပါတ်ရှည်ကြီးတစ်ခု ပေါ်လာတာ" or "ဖုန်းနံပါတ်တစ်ခု ပေါ်လာတာ".
   - Rule: Read exact numbers ONLY if the value drives an action.
2. TONGUE TWISTERS: Rewrite long/hard phrases.
3. SYNONYMS: Prefer simple spoken words ("အမိန့်ချ", "ထွက်သွား", "အနေအထား").
4. BREAK PHRASES: Break long phrases with spaces/line breaks.
5. BEFORE/AFTER EXAMPLE (STYLE):
   - Before: "အနီရောင်ဝတ်စုံနဲ့မိန်းကလေးရဲ့မျက်လုံးထဲမှာ ပိုင်ဆိုင်ချင်တဲ့အငွေ့အသက်တွေပြည့်နှက်နေတယ်"
   - After: "အနီရောင်ဝတ်စုံဝတ်ထားတဲ့မိန်းကလေး ကြည့်ရတာ အဲ့ဒီလူကိုပိုင်ချင်သလိုမြင်ရတာ"

=== J) NEAR MATCH STABILITY & SCALING ===
1. TIMELINE BULLET SCALING (BY DURATION):
   - < 60s: 3-5 bullets.
   - 60-180s: 5-8 bullets.
   - > 180s: 8-12 bullets.
   - FALLBACK: If TARGET_SECONDS missing, use 5-8 bullets default.
   - BEAT_COUNT LIMIT: Absolute max 12 beats always (even for fast cuts).
2. CHARACTER BUDGET ACTIVATION:
   - Applies ONLY when TARGET_SECONDS is provided.
3. TRAILER MONTAGE COMPRESSION: Group shots.
4. STABLE ENDING BUFFER: Reserve final bullet as wrap beat.
5. NAMED ENTITIES HARD CAP: Max 6 uses per name.
6. DUPLICATE COMPRESSION: Limit intensifiers to 3 total.

=== K) MACHINE CHECK TOKENS ===
1. SELF-CORRECTION LOOP: Run internal QA checks before output. Fix failing lines.
2. METADATA CONFIDENCE: Add confidence score (1-5) for category.
3. FORMAT VALIDATION: Headers once. Bullets "- [mm:ss]".
4. STABLE LABELS: Reuse exact labels.
5. ERROR HANDLING: Use [Unclear points] only. Do not add error sections.
`;
