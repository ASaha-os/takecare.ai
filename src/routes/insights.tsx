import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Heart, Mic, Send, Volume2, MicOff, Camera, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { streamGemini } from "@/lib/gemini";

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
  id: number;
  streaming?: boolean;
}

let msgId = 0;

function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Get user's first name from Supabase auth
  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          // Try to extract first name from user metadata or email
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
          const firstName = fullName.split(" ")[0] || user.email?.split("@")[0] || "dear";
          setUserName(firstName);
        } else {
          setUserName("dear");
        }
      });
    });
  }, []);

  // Set initial greeting once userName is loaded
  useEffect(() => {
    if (userName && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hello, ${userName}! 😊 I'm your TakeCare companion. You can chat with me about anything, or show me a photo if you've misplaced something. How are you feeling today?`,
        id: msgId++,
      }]);
    }
  }, [userName, messages.length]);

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
        setTimeout(() => {
          const label = prompt.length > 120 ? prompt.slice(0, 120) + "…" : prompt;
          sendMessage(prompt, label);
        }, 600);
      }
    } catch {}
  }, []);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Female")
    );
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = useCallback((fullPrompt: string, displayText: string, imageUrl?: string) => {
    const userMsg: Message = { role: "user", content: displayText, image: imageUrl, id: msgId++ };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Add a streaming assistant message placeholder
    const assistantId = msgId++;
    setMessages((prev) => [...prev, { role: "assistant", content: "", id: assistantId, streaming: true }]);
    setLoading(false);

    let accumulated = "";

    streamGemini(
      fullPrompt,
      imageUrl, // Pass image URL for vision analysis
      (chunk) => {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
        );
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      },
      () => {
        // Stream done — mark as no longer streaming, speak the full response
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, streaming: false } : m)
        );
        speakText(accumulated);
      },
      (errMsg) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `Sorry dear, I'm having a moment. Please try again in a few seconds. 💛\n\n(${errMsg})`, streaming: false }
              : m
          )
        );
      }
    );
  }, []);

  const handleSend = async (imageFile?: File) => {
    const text = input.trim();
    if (!text && !imageFile) return;

    let imageUrl = "";
    if (imageFile) {
      setLoading(true);
      const fileName = `${Date.now()}-${imageFile.name}`;
      try {
        const { error } = await supabase.storage.from("assets").upload(`uploads/${fileName}`, imageFile);
        imageUrl = error
          ? URL.createObjectURL(imageFile)
          : supabase.storage.from("assets").getPublicUrl(`uploads/${fileName}`).data.publicUrl;
      } catch {
        imageUrl = URL.createObjectURL(imageFile);
      }
      setLoading(false);
    }

    const displayText = imageFile ? (text || "📷 Photo sent") : text;
    const fullPrompt = imageFile
      ? `${text || "Please help me find any misplaced items in this photo. Describe exactly where each item is located. Remember: do not use asterisks in your response."}`
      : text;

    sendMessage(fullPrompt, displayText, imageUrl);
  };

  const toggleListen = () => {
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser. Please type instead."); return; }
    if (isListening) { setIsListening(false); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  return (
    <div className="min-h-screen pb-28 flex flex-col" style={{ background: "linear-gradient(180deg, var(--background) 0%, #F5EDE4 100%)" }}>
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border/40 px-6 pt-10 pb-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center shadow-lg shadow-[#D4956A]/25 animate-gentle-breathe">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-card animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Your Companion
                <Sparkles className="w-5 h-5 text-[#D4956A]" />
              </h1>
              <p className="text-muted-foreground font-medium text-sm">Always here, always listening</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"} animate-fade-up-blur`}
              style={{ animationDelay: `${Math.min(i * 20, 150)}ms` }}
            >
              <div className={`max-w-[88%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#D4956A] to-[#E8C9A0] flex items-center justify-center flex-shrink-0">
                      <Heart className="w-3 h-3 text-white" fill="white" />
                    </div>
                    <span className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Companion</span>
                    {!msg.streaming && msg.content && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors opacity-60 hover:opacity-100"
                        title="Read aloud"
                      >
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                )}
                <div className={`px-5 py-4 rounded-3xl text-base leading-relaxed transition-all duration-200 hover:scale-[1.005] ${
                  msg.role === "assistant"
                    ? "bg-card shadow-md shadow-black/[0.04] border border-border/50 text-foreground rounded-tl-lg"
                    : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-tr-lg shadow-lg shadow-primary/20"
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="Your photo" className="rounded-2xl w-full mb-3 object-cover max-h-52 shadow-sm" />
                  )}
                  {msg.content ? (
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}
                      {msg.streaming && <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />}
                    </p>
                  ) : (
                    /* Typing dots while waiting for first chunk */
                    <div className="flex items-center gap-1.5 py-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-primary/50 animate-typing-dot"
                          style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 pb-28">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-3xl p-3 shadow-xl shadow-black/[0.08] border border-border/50 flex items-center gap-2 transition-all duration-300 focus-within:shadow-2xl focus-within:border-primary/30">
            <button
              onClick={toggleListen}
              className={`p-3.5 rounded-2xl transition-all duration-300 touch-target flex-shrink-0 ${
                isListening
                  ? "bg-destructive text-white shadow-lg shadow-destructive/30 scale-110"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:scale-105"
              }`}
              title={isListening ? "Stop listening" : "Speak to me"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef}
              onChange={(e) => { if (e.target.files?.[0]) handleSend(e.target.files[0]); }} />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-2xl bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:scale-105 transition-all duration-200 touch-target flex-shrink-0"
              title="Take a photo"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak..."
              className="flex-1 bg-transparent border-none outline-none text-base px-2 placeholder:text-muted-foreground/40 min-w-0"
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-3.5 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:scale-100 touch-target flex-shrink-0 shadow-md shadow-primary/20"
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {isListening && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-destructive animate-ping" />
              <p className="text-sm text-destructive font-bold">Listening... speak clearly</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav onAddClick={() => {}} />
    </div>
  );
}
