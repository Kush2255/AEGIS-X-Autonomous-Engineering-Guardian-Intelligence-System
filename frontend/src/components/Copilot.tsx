import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, MessageSquare, BookOpen } from 'lucide-react';

interface CopilotProps {
  assetId: string;
  assetName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  sources?: Array<{ title: string; source: string; content: string }>;
  timestamp: string;
}

export const Copilot: React.FC<CopilotProps> = ({ assetId, assetName, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `Hello, Engineer. I am your PRAHARI AI Copilot, grounded in the Digital Twin of **${assetName}**. I can parse inspection histories, retrieve design guides (IS-456, IRC codes, NDMA), and explain risk assessments. What would you like to examine?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [assetId, assetName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset_id: assetId,
          question: textToSend,
          chat_history: []
        })
      });

      if (!response.ok) {
        throw new Error('Copilot response failed');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        sender: 'ai',
        text: data.answer,
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error fetching copilot response:', error);
      const errorMsg: Message = {
        sender: 'ai',
        text: 'System link failure. I was unable to connect to the PRAHARI Agent pipeline. Running offline diagnostics. Please ensure the backend server is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQueries = [
    { label: 'Why is this asset high risk?', query: 'Why is this asset flagged as high risk?' },
    { label: 'Which engineering codes apply?', query: 'Which engineering code guidelines and standards apply to this asset?' },
    { label: 'What is the recommended repair?', query: 'What is the recommended structural repair protocol and checklist?' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 glass-panel border-l border-dark-border shadow-2xl flex flex-col z-50 animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-bg/40">
        <div className="flex items-center space-x-2 text-brand-primary">
          <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
          <span className="font-display font-bold tracking-wide text-gray-200">PRAHARI AI COPILOT</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-dark-hover rounded transition-colors text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Asset Badge */}
      <div className="px-4 py-2 bg-brand-primary/10 border-b border-dark-border text-xs text-brand-primary flex items-center justify-between">
        <span>Grounded Digital Twin:</span>
        <span className="font-semibold uppercase tracking-wider">{assetName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              msg.sender === 'user' 
                ? 'bg-brand-primary text-white rounded-br-none shadow-glow' 
                : 'bg-dark-card border border-dark-border text-gray-200 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
              
              {/* Citations / Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/10 text-xs">
                  <div className="font-bold text-brand-primary flex items-center mb-1">
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    ENGINEERING CODE REFERENCED:
                  </div>
                  <div className="space-y-1.5">
                    {msg.sources.map((src, sIdx) => (
                      <div key={sIdx} className="bg-black/20 p-1.5 rounded border border-white/5">
                        <div className="font-semibold text-gray-300">{src.title}</div>
                        <div className="text-gray-400 mt-0.5 line-clamp-2">{src.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-dark-muted mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 bg-dark-card border border-dark-border rounded-lg rounded-bl-none p-3 max-w-[80%] text-sm">
            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-xs text-dark-muted ml-1">Agents reasoning...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Queries */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-dark-border bg-dark-bg/20">
          <div className="text-[10px] text-dark-muted uppercase font-bold tracking-wider mb-1.5 flex items-center">
            <MessageSquare className="w-3 h-3 mr-1" /> Quick Diagnostics
          </div>
          <div className="flex flex-col space-y-1.5">
            {quickQueries.map((q, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSend(q.query)}
                className="text-left text-xs bg-dark-card border border-dark-border hover:border-brand-primary/40 hover:bg-dark-hover py-1.5 px-2.5 rounded transition-all text-gray-300"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-dark-border bg-dark-bg/60">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(query);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Digital Twin..."
            className="flex-1 bg-dark-card border border-dark-border focus:border-brand-primary rounded px-3 py-2 text-sm text-white focus:outline-none placeholder-dark-muted transition-colors"
          />
          <button 
            type="submit" 
            disabled={!query.trim() || isLoading}
            className="p-2 bg-brand-primary disabled:opacity-50 text-white rounded hover:bg-brand-primary/80 transition-colors shadow-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
