import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, Trash2, MoreVertical, ArrowLeft, Clock, ArrowRight, MessageCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Logo } from './Logo';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner@2.0.3';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { BackToHomeIcon } from './BackToHome';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  messageCount: number;
}

interface ChatHistoryProps {
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onBack?: () => void;
}

// Empty State Component
function ChatEmptyState({ searchQuery, onNewChat }: { searchQuery: string; onNewChat: () => void }) {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Search size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl mb-2">No conversations found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          No conversations match your search. Try different keywords or start a new chat.
        </p>
        <Button onClick={onNewChat} className="gap-2">
          <Plus size={18} />
          Start New Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageSquare size={32} className="text-primary" />
      </div>
      <h3 className="text-xl mb-2">No conversations yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start your first conversation with Mentara AI. Share your thoughts, feelings, or questions.
      </p>
      <Button onClick={onNewChat} size="lg" className="gap-2">
        <Plus size={18} />
        Start Your First Chat
      </Button>
    </div>
  );
}

export function ChatHistory({ onSelectConversation, onNewChat, onBack }: ChatHistoryProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  const loadConversations = async () => {
    if (!user?.id) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user?.id) return;

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/chat/conversations/${user.id}/${conversationId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
    
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupedConversations = filteredConversations.reduce((groups: any, conv) => {
    const date = formatDate(conv.lastUpdated);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conv);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Logo size="sm" showText={false} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {onBack && <BackToHomeIcon onBack={onBack} size="md" />}
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Logo size="sm" showText={false} />
              </div>
              <div>
                <h1>Mentara AI Chat</h1>
                <p className="text-sm text-muted-foreground">
                  Your personal mental wellness companion
                </p>
              </div>
            </div>
            
            <Button onClick={onNewChat} size="lg" className="gap-2">
              <Plus size={18} />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto p-6">
          {filteredConversations.length === 0 ? (
            <ChatEmptyState
              searchQuery={searchQuery}
              onNewChat={onNewChat}
            />
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedConversations).map(([date, convs]: [string, any]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={14} className="text-muted-foreground" />
                    <h3 className="text-sm text-muted-foreground">{date}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {convs.map((conv: Conversation) => (
                      <Card
                        key={conv.id}
                        className="group hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConversationToDelete(conv.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        <div 
                          className="p-5"
                          onClick={() => onSelectConversation(conv.id)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <MessageCircle size={20} className="text-primary" />
                            </div>
                          </div>
                          
                          <h3 className="mb-2 line-clamp-2 min-h-[3rem]">
                            {conv.title}
                          </h3>
                          
                          {conv.lastMessage && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {conv.lastMessage}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {new Date(conv.lastUpdated).toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            
                            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight size={16} />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Stats Footer */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>All conversations are private and secure</span>
          </div>
          <div className="hidden md:block">
            Powered by Google Gemini
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