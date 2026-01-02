'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bot, Send, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSVG from '@/public/img/icons/loader.svg';
import { toast } from 'sonner';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setInput('');

    const apiMessages = newMessages.map((msg) => ({
      role: msg.role,
      parts: [{ type: 'text', text: msg.content }],
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const assistantResponseText = await response.text();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponseText,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to get a response from ByteBot.');
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          size="icon"
          className="fixed bottom-6 right-6 z-50 size-16 rounded-full shadow-lg"
          aria-label="Open chatbot"
        >
          {isOpen ? <X className="size-8" /> : <Bot className="size-8" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={16}
        className="z-50 w-[calc(100vw-32px)] max-w-md rounded-4xl p-0"
      >
        <div className="flex h-[500px] flex-col">
          <div className="rounded-t-4xl border-b bg-surface-variant p-4">
            <h3 className="text-center text-lg font-bold">ByteBot Assistant</h3>
            <p className="text-center text-sm text-muted-foreground">
              Ask me about BrainBytes!
            </p>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 space-y-4 overflow-y-auto p-4"
          >
            {messages.length === 0 && !isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="size-5" />
                </span>
                <div className="max-w-xs rounded-2xl rounded-bl-none bg-surface-variant px-4 py-3 text-sm leading-relaxed text-foreground">
                  Hi there! I&apos;m ByteBot. Ask me anything about the BrainBytes
                  platform.
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'flex items-start gap-3',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {m.role === 'assistant' && (
                  <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="size-5" />
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'rounded-br-none bg-primary/20 text-foreground'
                      : 'rounded-bl-none bg-surface-variant text-foreground'
                  )}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-muted">
                    <User className="size-5" />
                  </span>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start gap-3">
                <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="size-5" />
                </span>
                <div className="max-w-xs rounded-2xl rounded-bl-none bg-surface-variant px-4 py-3">
                  <LoadingSVG className="size-5 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="How do I earn points?"
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="size-5" />
              </Button>
            </form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}