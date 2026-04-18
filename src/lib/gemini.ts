/**
 * AI client using puter.js — no API key required, free tier, streaming + vision support.
 * Falls back gracefully if puter is not yet loaded.
 */

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string,
          imageUrl?: string,
          opts?: { model: string; stream?: boolean }
        ) => Promise<string | AsyncIterable<{ text?: string }>>;
      };
    };
  }
}

const MODEL = "gemini-2.0-flash";
const SYSTEM = `You are a warm caring companion for elderly people. Use simple language, be concise and kind. Use 💛 occasionally.

IMPORTANT: Never use asterisks (*) in your responses as the text is converted to speech. Use plain text only.`;

function waitForPuter(timeout = 8000): Promise<typeof window.puter> {
  return new Promise((resolve, reject) => {
    if (window.puter) { resolve(window.puter); return; }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.puter) { clearInterval(interval); resolve(window.puter); }
      else if (Date.now() - start > timeout) { clearInterval(interval); reject(new Error("puter.js failed to load")); }
    }, 100);
  });
}

/**
 * Stream a response from puter.ai with optional image analysis.
 * @param prompt      Full text prompt to send
 * @param imageUrl    Optional image URL for vision analysis
 * @param onChunk     Called with each streamed text chunk
 * @param onDone      Called when stream is complete
 * @param onError     Called on error
 */
export async function streamGemini(
  prompt: string,
  imageUrl: string | undefined,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (msg: string) => void
) {
  try {
    const puter = await waitForPuter();
    if (!puter) throw new Error("puter.js not available");

    const fullPrompt = `${SYSTEM}\n\nUser: ${prompt}`;

    if (imageUrl) {
      // Vision mode - non-streaming for now (puter.ai.chat with image doesn't support streaming yet)
      const response = await puter.ai.chat(fullPrompt, imageUrl, { model: MODEL });
      if (typeof response === "string") {
        // Simulate streaming by chunking the response
        const words = response.split(" ");
        for (let i = 0; i < words.length; i++) {
          onChunk(words[i] + (i < words.length - 1 ? " " : ""));
          await new Promise((r) => setTimeout(r, 40));
        }
        onDone();
      } else {
        throw new Error("Unexpected response format");
      }
    } else {
      // Text-only mode with streaming
      const response = await puter.ai.chat(fullPrompt, undefined, {
        model: MODEL,
        stream: true,
      });

      if (typeof response === "string") {
        onChunk(response);
        onDone();
      } else {
        for await (const part of response) {
          if (part?.text) onChunk(part.text);
        }
        onDone();
      }
    }
  } catch (err: any) {
    onError(err?.message ?? "AI unavailable");
  }
}
