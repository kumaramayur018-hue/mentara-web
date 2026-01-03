import React, { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Plus, Trash2, Edit2, Menu, X, ArrowLeft, Sparkles, Smile } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "./AuthProvider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { MessageFormatter } from "./MessageFormatter";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date | string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  messageCount: number;
}

interface ChatInterfaceProps {
  conversationId: string;
  onBack: () => void;
  onConversationChange: (conversationId: string) => void;
}

export function ChatInterface({ conversationId, onBack, onConversationChange }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations list
  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  // Load conversation history when conversation changes
  useEffect(() => {
    if (conversationId && user?.id) {
      // Check if this is a new conversation ID (starts with conv_ and is very recent)
      const isNewConversation = conversationId.startsWith('conv_') && 
        (Date.now() - parseInt(conversationId.split('_')[1])) < 5000;
      
      if (isNewConversation) {
        // Create the conversation on the server first
        createConversationOnServer(conversationId);
      } else {
        loadConversation();
      }
    }
  }, [conversationId, user?.id]);
  
  const createConversationOnServer = async (convId: string) => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
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
        // If creation fails, just show welcome message
        showWelcomeMessage();
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to create conversation on server:', error);
      showWelcomeMessage();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
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
    }
  };

  const loadConversation = async () => {
    if (!conversationId || !user?.id) return;

    setIsLoading(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const historyResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/history/${user.id}/${conversationId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      
      if (historyResponse.ok) {
        const history = await historyResponse.json();
        if (Array.isArray(history) && history.length > 0) {
          const formattedHistory = history
            .filter((msg: any) => msg.content) // Filter out messages without content
            .map((msg: any) => ({
              ...msg,
              content: msg.content || '', // Ensure content is never undefined
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
    } finally {
      setIsLoading(false);
    }
  };

  const showWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: '1',
      content: `**Hello! 👋** I'm Mentara AI, your mental wellness companion 💙

I'm here to provide support and understanding as you navigate your mental wellbeing journey. Whether you're dealing with stress, anxiety, academic pressure, or just need someone to talk to, I'm here to listen and help. 🤗

*How are you feeling today?* ✨ What's on your mind?`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const createNewConversation = async () => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
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
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteConversation = async (convId: string) => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
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
        
        // If deleted current conversation, go back or switch to another
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
    }
    
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const updateConversationTitle = async (convId: string, title: string) => {
    if (!user?.id || !title.trim()) return;

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
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
      console.error('Failed to update conversation title:', error);
    }
    
    setEditingTitle(null);
    setNewTitle('');
  };

  const generateConversationSummary = async () => {
    if (!user?.id || !conversationId) return;

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/generate-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId: user.id,
            conversationId: conversationId
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.title) {
          // Update conversation title in local state
          setConversations(prev => prev.map(c => 
            c.id === conversationId ? { ...c, title: result.title } : c
          ));
        }
      }
    } catch (error) {
      console.error('Failed to generate conversation summary:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user?.id || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log(`[FRONTEND DEBUG] Current message count before sending: ${newMessages.length}`);
      return newMessages;
    });
    setInputValue('');
    setIsTyping(true);

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      console.log(`[FRONTEND DEBUG] Sending message to conversation ${conversationId}`);
      console.log(`[FRONTEND DEBUG] Message content: ${content.substring(0, 50)}...`);
      
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
            conversationId: conversationId
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        console.log(`[FRONTEND DEBUG] Received response from server`);
        console.log(`[FRONTEND DEBUG] AI response preview: ${result?.message?.content?.substring(0, 50)}...`);
        
        if (result?.message && result.message.content) {
          const aiMessage: Message = {
            ...result.message,
            content: result.message.content || 'I apologize, but I encountered an error. Please try again.',
            timestamp: new Date(result.message.timestamp)
          };
          
          setMessages(prev => {
            const newMessages = [...prev, aiMessage];
            console.log(`[FRONTEND DEBUG] Current message count after AI response: ${newMessages.length}`);
            return newMessages;
          });

          // Update conversation list
          setConversations(prev => prev.map(c => 
            c.id === conversationId 
              ? { ...c, lastMessage: content, lastUpdated: new Date().toISOString(), messageCount: (c.messageCount || 0) + 2 }
              : c
          ));
          
          // Auto-generate summary after 4 messages (2 exchanges)
          const currentConv = conversations.find(c => c.id === conversationId);
          if (currentConv && (currentConv.messageCount || 0) >= 3 && (currentConv.messageCount || 0) <= 5) {
            generateConversationSummary();
          }
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Logo size="sm" showText={false} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const currentConversation = conversations.find(c => c.id === conversationId);

  return (
    <div className="flex flex-col h-screen bg-background relative">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-sm">
                Conversations
              </h2>
              <Button
                size="sm"
                onClick={() => setShowSidebar(false)}
                variant="ghost"
                className="lg:hidden h-8 w-8 p-0"
              >
                <X size={18} />
              </Button>
            </div>
            <Button
              onClick={createNewConversation}
              className="w-full"
              size="sm"
            >
              <Plus size={16} className="mr-2" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  conv.id === conversationId
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => {
                  onConversationChange(conv.id);
                  setShowSidebar(false);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  {editingTitle === conv.id ? (
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => updateConversationTitle(conv.id, newTitle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateConversationTitle(conv.id, newTitle);
                        } else if (e.key === 'Escape') {
                          setEditingTitle(null);
                          setNewTitle('');
                        }
                      }}
                      autoFocus
                      className="h-7 text-sm"
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{conv.title}</p>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitle(conv.id);
                        setNewTitle(conv.title);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversationToDelete(conv.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed/Sticky */}
        <div className="sticky top-0 z-10 p-4 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={onBack}
              className="h-9 w-9 p-0"
            >
              <ArrowLeft size={18} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSidebar(true)}
              className="lg:hidden h-9 w-9 p-0"
            >
              <Menu size={18} />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Logo size="sm" showText={false} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="flex items-center gap-2 truncate text-base">
                {currentConversation?.title || 'Mentara AI'}
                <Badge variant="secondary" className="text-xs">
                  <Sparkles size={12} className="mr-1" />
                  AI
                </Badge>
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                Mental wellness support
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.filter(msg => msg.content).map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={`flex-1 ${message.sender === 'user' ? 'flex justify-end' : ''}`}>
                  <Card className={`p-4 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card'
                  }`}>
                    {message.sender === 'ai' ? (
                      <MessageFormatter content={message.content || ''} />
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content || ''}
                      </div>
                    )}
                  </Card>
                  
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <Card className="p-4 bg-card">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputValue);
              }}
              className="flex gap-2"
            >
              <div className="flex-1 flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Share what's on your mind..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      disabled={isTyping}
                    >
                      <Smile size={18} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="grid grid-cols-8 gap-1 p-2 max-h-64 overflow-y-auto">
                      {['😊', '😂', '🥰', '😍', '😭', '😢', '😔', '😟', '😞', '😣', '😖', '😫', '😩', '🥺', '😤', '😠', '😡', '🤯', '😳', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤐', '😶', '😐', '😑', '😬', '🙄', '😏', '😒', '🙃', '😌', '😔', '😪', '🤤', '😴', '🥱', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😇', '🤠', '🤑', '🤓', '😎', '🤡', '💙', '💚', '💛', '🧡', '❤️', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✨', '🌟', '⭐', '🌈', '☀️', '🌙', '⚡', '🔥', '💪', '👍', '👏', '🙏', '🤝', '👊', '✊', '🤞', '✌️', '🤟', '🫶', '🤲', '👐', '🙌', '💐', '🌸', '🌺', '🌻', '🌹', '🌷', '🌱', '🍀', '🌿', '☘️', '🫂'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="text-2xl hover:bg-accent p-2 rounded transition-colors"
                          onClick={() => {
                            setInputValue(inputValue + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit" disabled={!inputValue.trim() || isTyping}>
                <Send size={18} />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by Google Gemini AI • Your conversations are private and secure
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => conversationToDelete && deleteConversation(conversationToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}