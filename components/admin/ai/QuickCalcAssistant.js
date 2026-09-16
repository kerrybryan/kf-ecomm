'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calculator,
  Sparkles,
  X,
  Send,
  Trash2,
  Minimize2,
  Info,
  ChevronDown,
  CornerDownLeft,
  HelpCircle,
} from 'lucide-react';

const SAMPLE_QUERIES = [
  'Wood 1800 B/m (8m) + Fabric 950 B/m (12m) + Labor 16h @ 250 B/h + 15% overhead. Total at 2.1x markup?',
  'Cabinet MDF 6 sq m @ 1200 B + 4 hinges @ 350 B + Labor 14h @ 250 B + 15% overhead at 2x markup?',
  'Convert 240cm × 160cm wood dining table to square meters and calculate wood cost at 1800 B/meter',
];

export default function QuickCalcAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'assistant',
      text: `Hello! I am your quick calculation scratchpad helper. Type any rough workshop math, wood dimensions, or material numbers and I will compute the steps instantly.`,
    },
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (queryText = inputQuery) => {
    const q = (queryText || '').trim();
    if (!q || loading) return;

    const userMsg = { id: Date.now().toString(), type: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/ai/quick-calc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          text: data.data.answer,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          text: `⚠️ ${data.error || 'Unable to calculate at this time.'}`,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          text: `⚠️ Network error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        type: 'assistant',
        text: `Scratchpad cleared. Type any new rough math question below.`,
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          id="open-quick-calc-btn"
          aria-label="Open Quick Calculation Assistant"
          className="fixed bottom-6 right-6 z-40 bg-[#201C18] hover:bg-[#B8551F] text-white p-3.5 rounded-full shadow-2xl border-2 border-white/20 flex items-center gap-2.5 transition-all duration-200 active:scale-95 group cursor-pointer"
        >
          <div className="relative">
            <Calculator className="w-5 h-5 text-white" />
            <Sparkles className="w-3 h-3 text-[#D99A2B] absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="text-xs font-extrabold tracking-wider pr-1 hidden sm:inline-block">
            Quick Math AI
          </span>
        </button>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-3xl border-2 border-[#E5DDD3] shadow-2xl w-[92vw] sm:w-[420px] overflow-hidden transition-all duration-300 flex flex-col ${
            isMinimized ? 'h-14' : 'h-[540px]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#201C18] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#383129] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#B8551F] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#D99A2B]" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold tracking-wide flex items-center gap-1.5">
                  <span>Quick Calculation Assistant</span>
                  <span className="text-[9px] uppercase tracking-wider bg-white/10 text-[#D99A2B] px-1.5 py-0.5 rounded font-bold">
                    Gemini Math
                  </span>
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-white/70 hover:text-white rounded-md"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                className="p-1 text-white/70 hover:text-rose-400 rounded-md"
                title="Clear Scratchpad"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/70 hover:text-white rounded-md"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mandatory Disclaimer Notice Banner (Part C.3) */}
              <div className="bg-[#FAF8F5] border-b border-[#E5DDD3] p-2.5 px-3 flex items-start gap-2 text-[10px] text-[#6B6459] shrink-0">
                <Info className="w-3.5 h-3.5 text-[#B8551F] shrink-0 mt-0.5" />
                <p className="leading-tight">
                  <strong className="text-[#201C18]">Scratchpad Only:</strong> Quick estimate only — not saved anywhere. Use the Pricing Calculator to set an official product price.
                </p>
              </div>

              {/* Chat & Scratchpad Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]/40 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.type === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl whitespace-pre-line ${
                        m.type === 'user'
                          ? 'bg-[#201C18] text-white rounded-br-none shadow-xs font-medium'
                          : 'bg-white border border-[#E5DDD3] text-[#201C18] rounded-bl-none shadow-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-[#6B6459] bg-white p-3 rounded-2xl border border-[#E5DDD3] w-fit animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-[#B8551F] animate-spin" />
                    <span>Computing workshop math...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sample Quick Questions Chips */}
              <div className="px-3 py-2 bg-white border-t border-[#E5DDD3] overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0 scrollbar-none">
                {SAMPLE_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE1D2] border border-[#E5DDD3] text-[10px] text-[#6B6459] hover:text-[#201C18] font-bold shrink-0 transition-colors"
                  >
                    {idx === 0 ? '🛋️ Sofa Math' : idx === 1 ? '🚪 Cabinet Math' : '📐 Table Area'}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-white border-t border-[#E5DDD3] flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="e.g. 10m wood @ 1800 + 15h labor @ 250 at 2x markup..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
                <button
                  type="submit"
                  disabled={loading || !inputQuery.trim()}
                  id="send-quick-calc-btn"
                  className="p-2.5 bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-40 text-white rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
