import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Heart, Mic, Send, Image as ImageIcon, Volume2, Loader2, MicOff, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/insights")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "TakeCare.ai — Your Companion" },
      { name: "description", content: "Chat with your caring AI companion. Voice, text, or photo — we're here for you." },
    ],
  }),
});

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello, dear! 😊 I'm your TakeCare companion. You can chat with me about anything, or show me a photo if you've misplaced something. How are you feeling today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle prefilled prompts from action cards
  const prefillProcessed = useRef(false);
  useEffect(() => {
    if (prefillProcessed.current) return;
    const raw = localStorage.getItem("takecare_prefill");
    if (!raw) return;
    prefillProcessed.current = true;
    localStorage.removeItem("takecare_prefill");
    try {
      const { prompt } = JSON.parse(raw);
      if (prompt) {
        // Slight delay so the page renders first
        setTimeout(() => {
          setInput(prompt);
          // Auto-send after a brief moment
          setTimeout(() => {
            handleSendPrefill(prompt);
          }, 300);
        }, 500);
      }
    } catch {}
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      // Try to find a warm, friendly voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Female"));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please type your message instead.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSend = async (imageFile?: File) => {
    if (!input.trim() && !imageFile) return;

    let msgContent = input;
    let imageUrl = "";

    const newMessages = [...messages];

    if (imageFile) {
      setLoading(true);
      const fileName = `${Date.now()}-${imageFile.name}`;
      try {
        const { error } = await supabase.storage.from("assets").upload(`uploads/${fileName}`, imageFile);
        if (!error) {
          const { data: publicUrlData } = supabase.storage.from("assets").getPublicUrl(`uploads/${fileName}`);
          imageUrl = publicUrlData.publicUrl;
        } else {
          imageUrl = URL.createObjectURL(imageFile);
        }
      } catch {
        imageUrl = URL.createObjectURL(imageFile);
      }
      setLoading(false);
    }

    const userMessage: Message = { role: "user", content: msgContent, image: imageUrl };
    newMessages.push(userMessage);
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setTimeout(() => {
          const responseText = imageFile
            ? "I can see the photo you sent! It looks like your keys might be on the wooden table near the window, and there's a pair of glasses on the shelf. Would you like me to look for something specific?"
            : "I'm here for you, always. Could you tell me a little more about how you're feeling? I'd love to help in any way I can. 💛";
          setMessages([...newMessages, { role: "assistant", content: responseText }]);
          speakText(responseText);
          setLoading(false);
        }, 1500);
        return;
      }

      // Build system prompt for elderly-friendly Gemini response
      const systemPrompt = `You are a warm, caring companion for an elderly person. You speak gently and clearly, using simple language. You are patient and kind. If the user sends a photo and asks about finding an item, describe exactly where in the image you see items like keys, glasses, medicine, phone, wallet, or remote control. Always respond with warmth and encouragement. Keep responses concise but caring. Use occasional emojis like 💛 and 😊 to feel friendly.`;

      let requestBody: any = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: "user",
            parts: [{ text: msgContent || "I'm showing you a photo. Please help me find any misplaced items like keys, glasses, medicine, phone, wallet, or remote. Describe exactly where each item is located in the image." }]
          }
        ]
      };

      if (imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          requestBody.contents[0].parts.unshift({
            inline_data: { mime_type: imageFile.type, data: base64data }
          });
          callGemini(apiKey, requestBody, newMessages);
        };
      } else {
        callGemini(apiKey, requestBody, newMessages);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // Prefill handler — sends a prompt directly from action cards
  const handleSendPrefill = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Show a short user-facing label instead of the full prompt
    const shortLabel = prompt.length > 120 ? prompt.slice(0, 120) + "…" : prompt;
    const newMessages = [...messages, { role: "user" as const, content: shortLabel }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setTimeout(() => {
          const responseText = "I'd love to help you with that! However, the AI service isn't connected yet. Please ask your family member to add the Gemini API key in the settings. 💛";
          setMessages([...newMessages, { role: "assistant", content: responseText }]);
          speakText(responseText);
          setLoading(false);
        }, 1500);
        return;
      }

      const systemPrompt = `You are a warm, caring companion for an elderly person living in India. You speak gently and clearly, using simple language. You are patient and kind. Format your responses clearly with sections, bullet points, and times where relevant. Use occasional emojis like 💛 and 😊 to feel friendly. Keep language simple but never condescending.`;

      const requestBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      };

      callGemini(apiKey, requestBody, newMessages);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const callGemini = async (apiKey: string, requestBody: any, currentMessages: Message[]) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry dear, I'm having a moment. Could you try again? 💛";
      setMessages([...currentMessages, { role: "assistant", content: reply }]);
      speakText(reply);
    } catch (e) {
      setMessages([...currentMessages, { role: "assistant", content: "Oh dear, I'm having trouble connecting right now. Please try again in a moment. 💛" }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-28 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border/40 px-6 pt-10 pb-6">
        <div className="max-w-lg mx-auto animate-fade-up-blur">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center shadow-lg animate-gentle-breathe">
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                Your Companion
              </h1>
              <p className="text-muted-foreground font-medium">Always here, always listening</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-lg mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"} animate-fade-up-blur`}>
              <div className={`max-w-[85%] ${msg.role === "assistant" ? "" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 text-white" fill="white" />
                    </div>
                    <span className="font-bold text-sm text-muted-foreground">Companion</span>
                    <button onClick={() => speakText(msg.content)} className="ml-auto p-2 rounded-xl hover:bg-muted transition-colors touch-target" title="Read aloud">
                      <Volume2 className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                )}
                <div className={`p-5 rounded-3xl text-lg leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-card shadow-sm border border-border/50 text-foreground rounded-tl-lg"
                    : "bg-primary text-primary-foreground rounded-tr-lg"
                }`}>
                  {msg.image && <img src={msg.image} alt="Your photo" className="rounded-2xl w-full mb-4 object-cover max-h-56" />}
                  <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-up-blur">
              <div className="p-5 rounded-3xl bg-card shadow-sm border border-border/50 rounded-tl-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-muted-foreground font-medium">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 pb-28">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-3xl p-3 shadow-xl border border-border/50 flex items-center gap-2">
            <button
              onClick={toggleListen}
              className={`p-4 rounded-2xl transition-all duration-300 touch-target ${
                isListening
                  ? 'bg-destructive text-white shadow-lg shadow-destructive/30 animate-pulse'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              title={isListening ? "Stop listening" : "Speak to me"}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleSend(e.target.files[0]);
                }
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl bg-muted text-foreground hover:bg-muted/80 transition-colors touch-target"
              title="Take a photo to find items"
            >
              <Camera className="w-6 h-6" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak..."
              className="flex-1 bg-transparent border-none outline-none text-lg px-3 placeholder:text-muted-foreground/50"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-30 touch-target"
              title="Send message"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>

          {isListening && (
            <p className="text-center text-sm text-destructive font-bold mt-3 animate-pulse">
              🎙️ Listening... speak clearly
            </p>
          )}
        </div>
      </div>

      <BottomNav onAddClick={() => {}} />
    </div>
  );
}
