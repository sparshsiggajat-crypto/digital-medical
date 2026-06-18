import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  ChevronDown, 
  X, 
  Bot, 
  FileText, 
  RotateCcw, 
  TrendingUp, 
  AlertTriangle,
  Clock
} from 'lucide-react';

interface AiAssistantProps {
  token: string | null;
  onRefreshData?: () => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export default function AiAssistant({ token, onRefreshData }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'assistant', 
      text: "Hello! I am your Swasthya AI Co-pilot. I can run real-time audits on inventory stock, predict drug expiries, analyze POS earnings, or draft reorder CSVs. How can I assist you today?", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: data.response || "I apologize, I am unable to connect to the brain node right now.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "Connection failed. Please verify that the pharmacy OS server is live.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(input);
    }
  };

  const quickPrompts = [
    { label: "Show low stock", query: "Show low stock medicines." },
    { label: "Today's sales", query: "What is today's sales?" },
    { label: "Expiry forecast", query: "Which medicines expire next month?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-slate-900 border border-emerald-500/30 text-white px-4 py-3 rounded-full shadow-2xl hover:bg-slate-800 transition-colors shadow-emerald-500/10 cursor-pointer"
            id="ai-copilot-trigger"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-emerald-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-sm font-semibold pr-1 tracking-tight font-display">AI Co-pilot</span>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ y: 80, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 80, scale: 0.95, opacity: 0 }}
            className="w-96 h-[520px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-950 border border-emerald-500/30 rounded-lg">
                  <Bot className="w-5 h-5 text-emerald-450 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight font-display">Swasthya AI Co-pilot</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] text-emerald-450 text-emerald-400 font-mono font-bold tracking-widest uppercase">Grounded Engine</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-gray-150 dark:border-slate-800 rounded-tl-none whitespace-pre-wrap leading-relaxed'
                  }`}>
                    {msg.text}
                    <div className={`text-[9px] mt-1.5 text-right font-mono ${msg.sender === 'user' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-150 dark:border-slate-800 shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Suggesters */}
            <div className="p-2.5 border-t border-gray-100 dark:border-slate-850 flex items-center gap-1.5 overflow-x-auto bg-white dark:bg-slate-900 no-scrollbar">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p.query)}
                  className="flex-shrink-0 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask co-pilot (e.g. today's sales)..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs px-3 py-2.5 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer border border-emerald-500/20"
              >
                <Send className="w-4 h-4 text-emerald-400" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
