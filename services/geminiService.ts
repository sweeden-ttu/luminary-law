import { GoogleGenAI, Type } from "@google/genai";
import { UserRole, Message, Attachment } from "../types";

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const SYSTEM_INSTRUCTION_BASE = `
You are “Law Luminary,” an AI legal aid assistant for a small Texas plaintiff-side firm.
Practice Areas: Commercial law, civil litigation, construction law, consumer law, personal injury, probate/wills, real estate, SSDI, veterans benefits.

CORE GUARDRAILS:
1. You are NOT a lawyer. Do NOT give definitive legal advice or guarantees.
2. Respect confidentiality.
3. NEVER fabricate citations. If you don't know a case, say so or describe how to find it.
4. Flag uncertainty clearly.

ROLE ADAPTATION:
`;

const ROLE_INSTRUCTIONS: Record<UserRole, string> = {
  [UserRole.ATTORNEY]: `
    User is an ATTORNEY.
    - Provide deep case law discussion, specific citations (real ones only), and strategic options.
    - Use legal terminology (res judicata, voir dire, etc.) appropriately.
    - Focus on precedents and potential pitfalls.
  `,
  [UserRole.PARALEGAL]: `
    User is a PARALEGAL.
    - Emphasis on rules, deadlines, and drafting structure.
    - Assist with pleadings, discovery requests, and demand letters.
    - Verify procedural steps for Texas filing.
  `,
  [UserRole.ADMIN]: `
    User is ADMIN/INTAKE STAFF.
    - Use plain language.
    - Focus on gathering facts (who, what, where, when).
    - Create summaries for attorneys.
    - Help with scheduling and basic form filling.
  `,
};

export class GeminiService {
  private ai: GoogleGenAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async generateResponse(
    history: Message[],
    userRole: UserRole,
    currentInput: string,
    attachments: Attachment[] = []
  ): Promise<string> {
    if (!this.apiKey) return "Error: API Key is missing.";

    // Determine model based on complexity and attachments
    // Using gemini-3-pro-preview for complex reasoning if no images/audio, otherwise flash for multimodal speed/support
    const isComplexReasoning = currentInput.toLowerCase().includes("analyze") || currentInput.toLowerCase().includes("research") || currentInput.toLowerCase().includes("strategy");
    
    // As per instructions, use 3-pro-preview for complex text tasks, 2.5-flash for basic or multimodal
    let modelName = 'gemini-2.5-flash';
    let thinkingBudget = 0;

    if (attachments.length === 0 && isComplexReasoning) {
        modelName = 'gemini-3-pro-preview';
        thinkingBudget = 1024; // Enable thinking for reasoning
    } else if (attachments.some(a => a.type === 'image')) {
        modelName = 'gemini-2.5-flash'; // Good for images
    } else if (attachments.some(a => a.type === 'audio')) {
        modelName = 'gemini-2.5-flash-native-audio-preview-09-2025'; // Native audio support
    }

    const systemInstruction = SYSTEM_INSTRUCTION_BASE + ROLE_INSTRUCTIONS[userRole];

    const contents = [];
    
    // Add history (simplified for this demo context, normally we'd structure turns)
    // We will just append recent history as context in text for simplicity here, 
    // or build a proper Content array. Let's build proper contents.
    
    // Limited history to last 5 turns to save context window in this demo
    const recentHistory = history.slice(-5);
    
    // Construct the prompt parts
    const promptParts: any[] = [{ text: currentInput }];
    
    // Add attachments to the prompt parts
    for (const att of attachments) {
        promptParts.push({
            inlineData: {
                mimeType: att.mimeType,
                data: att.base64Data
            }
        });
    }

    // Since generateContent is stateless, we prepend history as text context if we aren't using chat session
    // Ideally use ai.chats.create, but for mixed modality single-turn feel, generateContent is robust.
    // Let's use a simple Chat structure if no attachments, otherwise generateContent.
    // Given the constraints and multimodal nature, let's use generateContent with system instruction.
    
    let contextStr = "";
    if (recentHistory.length > 0) {
        contextStr = "PREVIOUS CONTEXT:\n" + recentHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n") + "\n\nCURRENT REQUEST:\n";
    }

    // If we have history, prepend it to the text part of the current prompt
    if (promptParts.length > 0 && promptParts[0].text) {
        promptParts[0].text = contextStr + promptParts[0].text;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: { parts: promptParts },
        config: {
          systemInstruction: systemInstruction,
          thinkingConfig: thinkingBudget > 0 ? { thinkingBudget } : undefined,
        }
      });

      return response.text || "I processed the input but could not generate a text response.";
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return `Error communicating with Law Luminary: ${error.message}`;
    }
  }

  async analyzeIntake(transcript: string, notes: string): Promise<any> {
     if (!this.apiKey) return null;

     const prompt = `
        Analyze the following intake information. 
        Transcript: ${transcript}
        Notes: ${notes}
        
        Extract the following in JSON format:
        1. clientName (string)
        2. summary (string - brief factual summary)
        3. potentialClaims (array of strings)
        4. recommendedPracticeArea (string)
        5. missingInformation (array of strings - what needs to be asked next)
     `;

     const response = await this.ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: prompt,
         config: {
             responseMimeType: "application/json",
             responseSchema: {
                 type: Type.OBJECT,
                 properties: {
                     clientName: { type: Type.STRING },
                     summary: { type: Type.STRING },
                     potentialClaims: { type: Type.ARRAY, items: { type: Type.STRING } },
                     recommendedPracticeArea: { type: Type.STRING },
                     missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } }
                 }
             }
         }
     });

     return JSON.parse(response.text || '{}');
  }
}

export const geminiService = new GeminiService();
