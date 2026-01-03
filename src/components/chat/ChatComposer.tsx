import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, StopCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';

interface ChatComposerProps {
  onSend: (message: string, attachments?: File[]) => void;
  isLoading?: boolean;
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

const QUICK_PROMPTS = [
  "I'm feeling stressed",
  "Help with anxiety",
  "Better sleep tips",
  "Study motivation",
];

export function ChatComposer({
  onSend,
  isLoading = false,
  onStop,
  placeholder = "Message Mentara AI...",
  disabled = false,
  maxLength = 2000,
}: ChatComposerProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || disabled || isLoading) return;

    onSend(inputValue.trim());
    setInputValue('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Clear on Escape
    if (e.key === 'Escape') {
      setInputValue('');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const characterCount = inputValue.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3">
        {/* Quick Prompts */}
        {!isLoading && inputValue.length === 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs hidden sm:inline">Quick:</span>
            </div>
            {QUICK_PROMPTS.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap h-7 px-3"
                onClick={() => handleQuickPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}

        {/* Main Input Area */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-2 bg-muted/30 rounded-3xl p-2 border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-all">
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              maxLength={maxLength}
              className={`flex-1 min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent px-3 py-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                isOverLimit ? 'text-destructive' : ''
              }`}
              aria-label="Message input"
              rows={1}
            />
            
            {/* Send/Stop Button */}
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onStop}
                className="h-9 w-9 rounded-full flex-shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Stop generating"
              >
                <StopCircle className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || disabled || isOverLimit}
                className="h-9 w-9 rounded-full flex-shrink-0 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Character count */}
          {characterCount > maxLength * 0.8 && (
            <div 
              className={`absolute -top-6 right-2 text-xs px-2 py-0.5 rounded-full ${
                isOverLimit 
                  ? 'text-destructive bg-destructive/10' 
                  : 'text-muted-foreground bg-muted'
              }`}
              aria-live="polite"
            >
              {characterCount}/{maxLength}
            </div>
          )}
        </form>

        {/* Footer Text */}
        <p className="text-xs text-muted-foreground text-center px-2">
          Mentara AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}