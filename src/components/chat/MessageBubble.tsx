import React, { useState } from 'react';
import { User, Copy, ThumbsUp, ThumbsDown, Check, CornerDownRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { MessageFormatter } from '../MessageFormatter';
import { toast } from 'sonner@2.0.3';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date | string;
  type?: string;
  suggestions?: string[];
  emotionalTone?: string;
  isStreaming?: boolean;
  feedback?: 'up' | 'down' | null;
}

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (messageId: string, feedback: 'up' | 'down') => void;
  onSave?: (messageId: string) => void;
  onFollowUp?: (content: string) => void;
  showActions?: boolean;
}

export function MessageBubble({ 
  message, 
  onFeedback, 
  onSave, 
  onFollowUp,
  showActions = true 
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<'up' | 'down' | null>(message.feedback || null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleFeedback = (feedback: 'up' | 'down') => {
    const newFeedback = localFeedback === feedback ? null : feedback;
    setLocalFeedback(newFeedback);
    if (newFeedback) {
      onFeedback?.(message.id, newFeedback);
      toast.success(newFeedback === 'up' ? 'Thanks for your feedback!' : 'We\'ll improve');
    }
  };

  // System messages
  if (message.sender === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="px-3 py-1.5 bg-muted/50 rounded-full text-sm text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  const isUser = message.sender === 'user';

  return (
    <div 
      className="group w-full"
      role="article"
      aria-label={`${isUser ? 'Your' : 'AI'} message`}
    >
      {/* Message Container */}
      <div className={`flex gap-3 sm:gap-4 ${isUser ? '' : ''}`}>
        {/* Avatar */}
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ 
            isUser 
              ? 'bg-muted' 
              : 'bg-gradient-to-br from-primary to-primary/70'
          }`}
          aria-hidden="true"
        >
          {isUser ? (
            <User className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Sparkles className="w-4 h-4 text-white" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Sender Name */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {isUser ? 'You' : 'Mentara AI'}
            </span>
            {!isUser && (
              <time className="text-xs text-muted-foreground" dateTime={new Date(message.timestamp).toISOString()}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </time>
            )}
          </div>

          {/* Message Content */}
          <div className={`prose prose-sm dark:prose-invert max-w-none ${
            isUser ? 'text-foreground' : ''
          } ${message.isStreaming ? 'animate-pulse' : ''}`}>
            {isUser ? (
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </div>
            ) : (
              <MessageFormatter content={message.content} />
            )}
          </div>

          {/* Message Actions - Only for AI messages */}
          {!isUser && showActions && !message.isStreaming && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
              <TooltipProvider delayDuration={300}>
                {/* Copy */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md"
                      onClick={handleCopy}
                      aria-label="Copy message"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>{copied ? 'Copied!' : 'Copy'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Thumbs Up */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-md ${localFeedback === 'up' ? 'bg-green-500/10 text-green-600' : ''}`}
                      onClick={() => handleFeedback('up')}
                      aria-label="Good response"
                      aria-pressed={localFeedback === 'up'}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" fill={localFeedback === 'up' ? 'currentColor' : 'none'} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>Good response</p>
                  </TooltipContent>
                </Tooltip>

                {/* Thumbs Down */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-md ${localFeedback === 'down' ? 'bg-red-500/10 text-red-600' : ''}`}
                      onClick={() => handleFeedback('down')}
                      aria-label="Bad response"
                      aria-pressed={localFeedback === 'down'}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" fill={localFeedback === 'down' ? 'currentColor' : 'none'} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>Bad response</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Suggested Follow-ups */}
          {!isUser && message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
            <div className="flex flex-wrap gap-2 pt-2">
              {message.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 px-3 rounded-full"
                  onClick={() => onFollowUp?.(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}