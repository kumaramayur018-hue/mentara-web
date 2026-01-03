import React from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { formatShortcut, CHAT_SHORTCUTS } from './useChatKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  trigger?: React.ReactNode;
}

const SHORTCUT_CATEGORIES = {
  'Conversation Management': [
    CHAT_SHORTCUTS.NEW_CONVERSATION,
    CHAT_SHORTCUTS.TOGGLE_SIDEBAR,
    CHAT_SHORTCUTS.SEARCH,
    CHAT_SHORTCUTS.NEXT_CONVERSATION,
    CHAT_SHORTCUTS.PREVIOUS_CONVERSATION,
    CHAT_SHORTCUTS.DELETE_CONVERSATION,
    CHAT_SHORTCUTS.EXPORT_CONVERSATION,
  ],
  'Message Actions': [
    { key: 'Enter', description: 'Send message' },
    { key: 'Enter', shift: true, description: 'New line' },
    CHAT_SHORTCUTS.FOCUS_INPUT,
    CHAT_SHORTCUTS.ESCAPE,
  ],
  'Navigation': [
    CHAT_SHORTCUTS.SETTINGS,
    { key: 'Tab', description: 'Navigate between elements' },
    { key: 'Escape', description: 'Close dialogs and popups' },
  ],
};

export function KeyboardShortcutsHelp({ trigger }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Keyboard className="w-4 h-4 mr-2" />
            Shortcuts
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick keyboard shortcuts to navigate and use Mentara AI more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {Object.entries(SHORTCUT_CATEGORIES).map(([category, shortcuts], index) => (
            <div key={category}>
              {index > 0 && <Separator className="mb-6" />}
              
              <div className="space-y-3">
                <h3 className="text-sm text-muted-foreground">{category}</h3>
                
                <div className="space-y-2">
                  {shortcuts.map((shortcut, idx) => (
                    <Card 
                      key={idx}
                      className="p-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {formatShortcut(shortcut).split(' + ').map((key, keyIdx, arr) => (
                          <React.Fragment key={keyIdx}>
                            <Badge 
                              variant="secondary" 
                              className="font-mono text-xs px-2 py-0.5"
                            >
                              {key}
                            </Badge>
                            {keyIdx < arr.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Press <Badge variant="outline" className="mx-1 text-xs">?</Badge> to show this dialog anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
