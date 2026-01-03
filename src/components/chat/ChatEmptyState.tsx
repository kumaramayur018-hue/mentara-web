import React from 'react';
import { MessageSquare, Sparkles, Heart, Brain, Lightbulb, Shield, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ChatEmptyStateProps {
  onNewChat: () => void;
  onQuickPrompt?: (prompt: string) => void;
  searchQuery?: string;
}

const QUICK_START_PROMPTS = [
  {
    icon: Brain,
    title: 'Manage Stress',
    prompt: "I'm feeling stressed and overwhelmed. Can you help me?",
    color: 'text-blue-500',
  },
  {
    icon: Heart,
    title: 'Improve Mood',
    prompt: "I want to improve my mood and feel better. What can I do?",
    color: 'text-pink-500',
  },
  {
    icon: Lightbulb,
    title: 'Study Tips',
    prompt: "I need help staying motivated and focused while studying.",
    color: 'text-yellow-500',
  },
  {
    icon: Shield,
    title: 'Build Resilience',
    prompt: "How can I build mental resilience and cope better with challenges?",
    color: 'text-green-500',
  },
];

export function ChatEmptyState({ onNewChat, onQuickPrompt, searchQuery }: ChatEmptyStateProps) {
  // If there's a search query, show "no results" message
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl mb-2">No conversations found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          We couldn't find any conversations matching "{searchQuery}". Try a different search term or start a new chat.
        </p>
        <Button onClick={onNewChat}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Start New Chat
        </Button>
      </div>
    );
  }

  // Default empty state
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 mb-4">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="flex items-center justify-center gap-2">
              Start a conversation with Mentara AI
              <Sparkles className="w-5 h-5 text-primary" />
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your personal mental wellness companion, here to support you 24/7. Share what's on your mind, 
              and let's work together towards better mental health.
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={onNewChat}
            className="mt-6"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Start New Chat
          </Button>
        </div>

        {/* Quick Start Prompts */}
        <div className="space-y-4">
          <h2 className="text-center text-muted-foreground">
            Or try one of these quick starts:
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_START_PROMPTS.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary/50"
                  onClick={() => {
                    if (onQuickPrompt) {
                      onQuickPrompt(item.prompt);
                    } else {
                      onNewChat();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onQuickPrompt) {
                        onQuickPrompt(item.prompt);
                      } else {
                        onNewChat();
                      }
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.prompt}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="border-t pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-sm">Private & Secure</h3>
              <p className="text-xs text-muted-foreground">
                Your conversations are encrypted and completely confidential
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm">AI-Powered Support</h3>
              <p className="text-xs text-muted-foreground">
                Powered by advanced AI trained in mental wellness support
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-sm">Always Available</h3>
              <p className="text-xs text-muted-foreground">
                24/7 support whenever you need someone to talk to
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            <strong>Note:</strong> Mentara AI provides supportive guidance and coping strategies. 
            For professional medical advice or emergencies, please contact a qualified healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}