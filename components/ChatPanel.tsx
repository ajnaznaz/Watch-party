'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/hooks/useSocket';

interface ChatPanelProps {
  messages: Message[];
  typingUser: string | null;
  onSendMessage: (text: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const EMOJIS = ['\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE32', '\uD83D\uDE22', '\uD83D\uDD25', '\uD83D\uDC4D', '\uD83D\uDC4E', '\uD83C\uDF89', '\uD83C\uDF7E'];

export function ChatPanel({
  messages,
  typingUser,
  onSendMessage,
  onTypingStart,
  onTypingStop,
}: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTypingStart();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 1000);
  };

  // Send message
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      onTypingStop();
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Add emoji
  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // Quick emoji send
  const quickEmojiSend = (emoji: string) => {
    onSendMessage(emoji);
  };

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center shadow-lg z-50"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {messages.length > 0 && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-xs text-red-500 flex items-center justify-center font-bold">
            {messages.length > 99 ? '99+' : messages.length}
          </div>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '50%' }}
            animate={{ opacity: 1, y: 0, x: '50%' }}
            exit={{ opacity: 0, y: 100, x: '50%' }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-48px)] translate-x-[-50%] md:translate-x-0 md:right-6 bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-white">Chat</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="h-[300px] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-zinc-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Say hi to your friend!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-sm text-red-400">
                            {msg.userName}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <div className="bg-zinc-800/80 rounded-xl px-3 py-2 inline-block max-w-full">
                          <p className="text-white text-sm break-words">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Typing indicator */}
              <AnimatePresence>
                {typingUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 text-zinc-400 text-sm"
                  >
                    <div className="flex gap-1">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                      />
                    </div>
                    <span>{typingUser} is typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Emoji Buttons */}
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {EMOJIS.slice(0, 6).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => quickEmojiSend(emoji)}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xl transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  <AnimatePresence>
                    {showEmojis && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 bg-zinc-800 rounded-xl p-2 grid grid-cols-5 gap-1"
                      >
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              addEmoji(emoji);
                              setShowEmojis(false);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-zinc-700 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
