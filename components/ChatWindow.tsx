'use client';

import React, { useState, useRef, useEffect } from 'react';
import AICompanionOrb from './AICompanionOrb';
import type { ChatMessage } from '@/types';

interface ChatWindowProps {
  initialMessages: ChatMessage[];
}

export default function ChatWindow({ initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsgText = text.trim();
    setInput('');
    setLoading(true);

    // Create optimistic user message
    const optimisticUserMsg: ChatMessage = {
      id: Math.random().toString(),
      user_id: '',
      role: 'user',
      content: userMsgText,
      flagged_for_safety: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsgText }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        const assistantMsg: ChatMessage = {
          id: Math.random().toString(),
          user_id: '',
          role: 'assistant',
          content: data.reply,
          flagged_for_safety: data.flaggedForSafety || false,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Handle error
        const errorMsg: ChatMessage = {
          id: Math.random().toString(),
          user_id: '',
          role: 'assistant',
          content: data.error || 'Sorry, I am having trouble connecting right now. Please try again.',
          flagged_for_safety: false,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="flex flex-col h-[70vh] w-full max-w-2xl mx-auto glass-card border border-border-glass relative overflow-hidden shadow-2xl">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-black/10">
        <AICompanionOrb size="sm" />
        <div>
          <h3 className="font-semibold text-text-primary text-sm">SerenIQ Companion</h3>
          <p className="text-[10px] text-accent-warm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-warm animate-pulse" />
            Online & listening
          </p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
            <AICompanionOrb size="lg" />
            <div className="space-y-2">
              <h4 className="font-serif text-2xl text-text-primary">I'm here to listen</h4>
              <p className="text-sm text-text-muted max-w-xs mx-auto">
                How is your exam prep going? Pick a prompt or type below:
              </p>
            </div>
            {/* Quick chips inside chat */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => handleChipClick('I feel overwhelmed by my study schedule.')}
                className="chip border-none text-left px-4 py-2.5 text-xs text-text-muted hover:text-text-primary transition-colors bg-white/5"
              >
                "I feel overwhelmed by my study schedule."
              </button>
              <button
                type="button"
                onClick={() => handleChipClick('How can I deal with exam anxiety?')}
                className="chip border-none text-left px-4 py-2.5 text-xs text-text-muted hover:text-text-primary transition-colors bg-white/5"
              >
                "How can I deal with exam anxiety?"
              </button>
              <button
                type="button"
                onClick={() => handleChipClick('I just need a quick study break.')}
                className="chip border-none text-left px-4 py-2.5 text-xs text-text-muted hover:text-text-primary transition-colors bg-white/5"
              >
                "I just need a quick study break."
              </button>
            </div>
          </div>
        ) : (
          /* Active messages list */
          <div className="space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed border ${
                      isUser
                        ? 'bg-accent-warm/10 border-accent-warm/20 text-text-primary rounded-tr-none'
                        : msg.flagged_for_safety
                        ? 'bg-accent-danger-soft/10 border-accent-danger-soft/20 text-text-primary rounded-tl-none'
                        : 'bg-white/5 border-border-glass text-text-primary rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-border-glass rounded-tl-none flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 border-t border-white/5 bg-black/20 flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Talk to SerenIQ..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted/30 focus:outline-none focus:border-accent-warm/40 transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-accent-warm hover:bg-accent-warm/90 disabled:opacity-50 text-bg-base font-semibold rounded-xl transition-colors cursor-pointer text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
