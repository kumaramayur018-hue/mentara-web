import React, { useState } from 'react';
import { 
  Plus, X, Edit2, Trash2, Download, MessageSquare, MoreHorizontal, Check
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { BackToHomeIcon } from '../BackToHome';

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  messageCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  unreadCount?: number;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onExportConversation?: (id: string) => void;
  onClose?: () => void;
  onBackToHome?: () => void;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onExportConversation,
  onClose,
  onBackToHome,
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Sort by last updated
  const sortedConversations = [...conversations].sort((a, b) => {
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  const handleRename = (id: string, title: string) => {
    if (!title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    onRenameConversation(id, title.trim());
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
      toast.success('Conversation deleted');
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      <div 
        className="flex flex-col h-full bg-card"
        role="navigation"
        aria-label="Conversation list"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {onBackToHome && <BackToHomeIcon onBack={onBackToHome} size="sm" />}
              <h2 className="font-medium">Chats</h2>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* New Chat Button */}
          <Button
            onClick={onNewConversation}
            className="w-full justify-start"
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            New chat
          </Button>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sortedConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  No conversations yet
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={onNewConversation}
                  className="text-xs"
                >
                  Start your first chat
                </Button>
              </div>
            ) : (
              sortedConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative rounded-lg transition-colors ${
                    conv.id === activeConversationId
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {editingId === conv.id ? (
                    // Edit Mode
                    <div className="flex items-center gap-2 p-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleRename(conv.id, editingTitle)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            handleRename(conv.id, editingTitle);
                          } else if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditingTitle('');
                          }
                        }}
                        autoFocus
                        className="h-8 text-sm"
                        aria-label="Edit conversation title"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => handleRename(conv.id, editingTitle)}
                        aria-label="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    // Display Mode
                    <div 
                      className="flex items-center gap-2 p-2 cursor-pointer pr-1"
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onClose?.();
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select conversation: ${conv.title}`}
                      aria-current={conv.id === activeConversationId ? 'true' : undefined}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectConversation(conv.id);
                          onClose?.();
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate mb-0.5">
                          {conv.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(conv.lastUpdated)}
                        </p>
                      </div>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            aria-label="Conversation actions"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(conv.id);
                              setEditingTitle(conv.title);
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          {onExportConversation && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportConversation(conv.id);
                                toast.success('Conversation exported');
                              }}
                            >
                              <Download className="w-3.5 h-3.5 mr-2" />
                              Export
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setConversationToDelete(conv.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}