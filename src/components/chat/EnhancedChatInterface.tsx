import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Menu, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Logo } from '../Logo';
import { useAuth } from '../AuthProvider';
import { MessageBubble, Message } from './MessageBubble';
import { ChatComposer } from './ChatComposer';
import { ConversationSidebar, Conversation } from './ConversationSidebar';
import { ChatSettings, ChatSettingsConfig } from './ChatSettings';
import { toast } from 'sonner@2.0.3';

interface EnhancedChatInterfaceProps {
  conversationId: string;
  onBack: () => void;
  onConversationChange: (conversationId: string) => void;
}

export function EnhancedChatInterface({ 
  conversationId, 
  onBack, 
  onConversationChange 
}: EnhancedChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSettings, setChatSettings] = useState<ChatSettingsConfig>({
    model: 'gemini-2.0-flash',
    tone: 'calm',
    temperature: 0.7,
    maxTokens: 2048,
    safetyFilter: true,
    streamingEnabled: true,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversations list
  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  // Load conversation history when conversation changes
  useEffect(() => {
    if (conversationId && user?.id) {
      const isNewConversation = conversationId.startsWith('conv_') && 
        (Date.now() - parseInt(conversationId.split('_')[1])) < 5000;
      
      if (isNewConversation) {
        createConversationOnServer(conversationId);
      } else {
        loadConversation();
      }
    }
  }, [conversationId, user?.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: New conversation
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        createNewConversation();
      }
      // Cmd/Ctrl + B: Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/conversations/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      
      if (response.ok) {
        const convList = await response.json();
        setConversations(convList);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const createConversationOnServer = async (convId: string) => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/conversations/${user.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ title: 'New conversation', id: convId })
        }
      );

      if (response.ok) {
        const { conversation } = await response.json();
        setConversations(prev => [conversation, ...prev]);
        showWelcomeMessage();
        setIsLoading(false);
      } else {
        showWelcomeMessage();
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      showWelcomeMessage();
      setIsLoading(false);
    }
  };

  const loadConversation = async () => {
    if (!conversationId || !user?.id) return;

    setIsLoading(true);
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/history/${user.id}/${conversationId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      
      if (response.ok) {
        const history = await response.json();
        if (Array.isArray(history) && history.length > 0) {
          const formattedHistory = history
            .filter((msg: any) => msg.content)
            .map((msg: any) => ({
              ...msg,
              content: msg.content || '',
              timestamp: new Date(msg.timestamp)
            }));
          setMessages(formattedHistory);
        } else {
          showWelcomeMessage();
        }
      } else {
        showWelcomeMessage();
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      showWelcomeMessage();
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const showWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hello! 👋 I'm **Mentara AI**, your mental wellness companion.

I'm here to provide support and understanding as you navigate your mental wellbeing journey. Whether you're dealing with stress, anxiety, academic pressure, or just need someone to talk to, I'm here to listen and help.

How are you feeling today? What's on your mind?`,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        "I'm feeling stressed about exams",
        "Help me manage anxiety",
        "Tips for better sleep"
      ]
    };
    setMessages([welcomeMessage]);
  };

  const createNewConversation = async () => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/conversations/${user.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ title: 'New conversation' })
        }
      );

      if (response.ok) {
        const { conversation } = await response.json();
        setConversations(prev => [conversation, ...prev]);
        onConversationChange(conversation.id);
        setShowSidebar(false);
        toast.success('New conversation started');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const deleteConversation = async (convId: string) => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/conversations/${user.id}/${convId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const updatedConversations = conversations.filter(c => c.id !== convId);
        setConversations(updatedConversations);
        
        if (convId === conversationId) {
          if (updatedConversations.length > 0) {
            onConversationChange(updatedConversations[0].id);
          } else {
            onBack();
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const renameConversation = async (convId: string, title: string) => {
    if (!user?.id || !title.trim()) return;

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/conversations/${user.id}/${convId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ title })
        }
      );

      if (response.ok) {
        setConversations(prev => prev.map(c => 
          c.id === convId ? { ...c, title } : c
        ));
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      toast.error('Failed to rename conversation');
    }
  };

  const exportConversation = async (convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/history/${user.id}/${convId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const history = await response.json();
        
        // Create text export
        let exportText = `Conversation: ${conv.title}\n`;
        exportText += `Exported: ${new Date().toLocaleString()}\n`;
        exportText += `Messages: ${history.length}\n\n`;
        exportText += '='.repeat(60) + '\n\n';

        history.forEach((msg: any) => {
          const timestamp = new Date(msg.timestamp).toLocaleString();
          const sender = msg.sender === 'user' ? 'You' : 'Mentara AI';
          exportText += `[${timestamp}] ${sender}:\n${msg.content}\n\n`;
        });

        // Download as text file
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export conversation:', error);
      toast.error('Failed to export conversation');
    }
  };

  const sendMessage = async (content: string, attachments?: File[]) => {
    if (!content.trim() || !user?.id || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            message: content,
            userId: user.id,
            conversationId: conversationId,
            settings: chatSettings
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        if (result?.message && result.message.content) {
          const aiMessage: Message = {
            ...result.message,
            content: result.message.content || 'I apologize, but I encountered an error. Please try again.',
            timestamp: new Date(result.message.timestamp),
            suggestions: result.message.suggestions,
          };
          
          setMessages(prev => [...prev, aiMessage]);

          // Update conversation list
          setConversations(prev => prev.map(c => 
            c.id === conversationId 
              ? { 
                  ...c, 
                  lastMessage: content, 
                  lastUpdated: new Date().toISOString(), 
                  messageCount: (c.messageCount || 0) + 2 
                }
              : c
          ));
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'up' | 'down') => {
    // Update local state
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));

    // TODO: Send feedback to backend for analytics
    console.log('Feedback:', messageId, feedback);
  };

  const handleSaveMessage = async (messageId: string) => {
    // TODO: Implement save to notes functionality
    console.log('Save message:', messageId);
  };

  const handleFollowUp = (content: string) => {
    sendMessage(content);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse mx-auto">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentConversation = conversations.find(c => c.id === conversationId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <div 
        className={`hidden lg:block border-r border-border bg-card transition-all duration-300 ease-in-out ${
          showSidebar ? 'w-64' : 'w-0'
        }`}
      >
        {showSidebar && (
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={conversationId}
            onSelectConversation={onConversationChange}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
            onRenameConversation={renameConversation}
            onExportConversation={exportConversation}
            onBackToHome={onBack}
          />
        )}
      </div>

      {/* Sidebar - Mobile Overlay */}
      {showSidebar && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setShowSidebar(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-64 sm:w-72 z-50 animate-in slide-in-from-left duration-300">
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={conversationId}
              onSelectConversation={onConversationChange}
              onNewConversation={createNewConversation}
              onDeleteConversation={deleteConversation}
              onRenameConversation={renameConversation}
              onExportConversation={exportConversation}
              onClose={() => setShowSidebar(false)}
              onBackToHome={onBack}
            />
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header 
          className="flex-shrink-0 sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl"
          role="banner"
        >
          <div className="flex items-center justify-between h-14 px-3 sm:px-4">
            {/* Left Section */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-9 w-9 lg:hidden"
                aria-label="Back to chat list"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="h-9 w-9"
                aria-label={showSidebar ? 'Close sidebar' : 'Open sidebar'}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2 ml-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-medium leading-none">
                    {currentConversation?.title || 'Mentara AI'}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Always here to listen
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <ChatSettings
              config={chatSettings}
              onConfigChange={setChatSettings}
            />
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl">Start a conversation</h2>
                    <p className="text-muted-foreground max-w-md">
                      I'm here to support your mental wellbeing. Share what's on your mind.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onFeedback={handleFeedback}
                      onSave={handleSaveMessage}
                      onFollowUp={handleFollowUp}
                    />
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-3 bg-muted rounded-2xl">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Composer */}
        <div className="flex-shrink-0 border-t border-border bg-background">
          <ChatComposer
            onSend={sendMessage}
            isLoading={isTyping}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}