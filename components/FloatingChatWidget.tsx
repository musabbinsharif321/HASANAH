'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Loader2,
  ExternalLink,
  MessageCircle,
  ChevronLeft,
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const WHATSAPP_NUMBER = '8801670555719';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hello Hasanah Tech Solutions! I would like to discuss a project.'
)}`;

const QUICK_PROMPTS = [
  'What services do you offer?',
  'Tell me about Hasanah Tech',
  'How can I get a quote?',
];

const INITIAL_MESSAGE: Message = {
  role: 'model',
  text: 'Assalamu Alaikum! 👋 Welcome to Hasanah Tech Solutions. Ask me anything about our services, team, or projects — or tap WhatsApp to chat directly with us.',
};

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.49 0 .16 5.33.16 11.9c0 2.1.55 4.15 1.59 5.96L0 24l6.31-1.65a11.87 11.87 0 0 0 5.75 1.47h.01c6.57 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44Zm-8.46 18.33h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.87 9.87 0 0 1-1.51-5.28c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.46-4.44 9.91-9.91 9.91Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

type WidgetView = 'closed' | 'menu' | 'chat';

export default function FloatingChatWidget() {
  const [view, setView] = useState<WidgetView>('closed');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  const sendMessage = async (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: 'user', text: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(1, -1),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text:
            data?.reply ||
            'Thanks for reaching out! Feel free to contact us on WhatsApp at 01670555719.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Connection issue. You can reach us directly on WhatsApp at 01670555719.',
        },
      ]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleToggle = () => {
    setView((prev) => (prev === 'closed' ? 'menu' : 'closed'));
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Compact 2-Option Launcher Menu */}
      {view === 'menu' && (
        <div className="w-[270px] rounded-2xl bg-[#0B1628] border border-white/15 shadow-2xl shadow-black/60 p-3 space-y-2">
          <p className="px-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            How can we help?
          </p>

          <button
            type="button"
            onClick={() => setView('chat')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#11223A] hover:bg-[#162C4A] border border-white/10 hover:border-[#3AA6B5]/50 text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2A8C9E] to-[#3AA6B5] flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white flex items-center gap-1">
                AI Assistant
                <Sparkles className="w-3.5 h-3.5 text-[#3AA6B5]" />
              </p>
              <p className="text-xs text-slate-400 truncate">
                Ask about services &amp; company
              </p>
            </div>
          </button>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setView('closed')}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#11223A] hover:bg-[#25D366]/15 border border-white/10 hover:border-[#25D366]/50 text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0">
              <WhatsAppIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white flex items-center justify-between">
                <span>WhatsApp Us</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </p>
              <p className="text-xs text-slate-400 truncate">
                Direct chat • 01670555719
              </p>
            </div>
          </a>
        </div>
      )}

      {/* Chatbot Window */}
      {view === 'chat' && (
        <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[75vh] rounded-2xl bg-[#0B1628] border border-white/15 shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-[#11223A] to-[#0E1D33] border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Back to menu"
                title="Back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2A8C9E] to-[#3AA6B5] flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                  Hasanah AI
                  <Sparkles className="w-3.5 h-3.5 text-[#3AA6B5] shrink-0" />
                </h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-xs font-semibold transition-colors"
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>
              <button
                type="button"
                onClick={() => setView('closed')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#050D18]/70">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#2A8C9E] to-[#3AA6B5] text-white rounded-br-sm'
                      : 'bg-[#11223A] text-slate-200 border border-white/10 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && !isLoading && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#2A8C9E]/25 border border-white/10 hover:border-[#3AA6B5]/50 text-slate-300 hover:text-white transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#11223A] border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-slate-300 flex items-center gap-2 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3AA6B5]" />
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-[#0B1628] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our services..."
              className="flex-1 bg-[#050D18] text-sm text-white placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#3AA6B5]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#2A8C9E] to-[#3AA6B5] text-white disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Single Clean Floating Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={view === 'closed' ? 'Open Chat & WhatsApp' : 'Close'}
        title="Chat with us"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#2A8C9E] to-[#3AA6B5] text-white shadow-xl shadow-[#2A8C9E]/35 hover:scale-105 transition-transform"
      >
        {view !== 'closed' ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-[#050D18]" />
          </>
        )}
        {view === 'closed' && (
          <span className="pointer-events-none absolute right-16 px-2.5 py-1 rounded-lg bg-[#0B1628] border border-white/10 text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            Chat / WhatsApp
          </span>
        )}
      </button>
    </div>
  );
}
