import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: () => void;
  description: string;
}

/**
 * Custom hook for managing keyboard shortcuts in the chat interface
 * 
 * @example
 * useChatKeyboardShortcuts([
 *   { 
 *     key: 'k', 
 *     meta: true, 
 *     callback: () => createNewChat(),
 *     description: 'New conversation' 
 *   }
 * ]);
 */
export function useChatKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      const isContentEditable = target.isContentEditable;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatch = shortcut.meta ? event.metaKey : true;
        
        // Check if it's a meta/ctrl shortcut (allow these even in inputs for common actions)
        const isModifierShortcut = shortcut.ctrl || shortcut.meta;
        
        const matches = 
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch &&
          metaMatch;

        if (matches) {
          // Allow modifier shortcuts everywhere, but prevent non-modifier shortcuts in inputs
          if (!isModifierShortcut && (isInput || isContentEditable)) {
            continue;
          }

          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Pre-defined keyboard shortcuts for the chat interface
 */
export const CHAT_SHORTCUTS: Record<string, Omit<KeyboardShortcut, 'callback'>> = {
  NEW_CONVERSATION: {
    key: 'k',
    meta: true,
    description: 'New conversation',
  },
  TOGGLE_SIDEBAR: {
    key: 'b',
    meta: true,
    description: 'Toggle sidebar',
  },
  SEARCH: {
    key: 'f',
    meta: true,
    description: 'Search conversations',
  },
  SETTINGS: {
    key: ',',
    meta: true,
    description: 'Open settings',
  },
  FOCUS_INPUT: {
    key: '/',
    description: 'Focus message input',
  },
  ESCAPE: {
    key: 'Escape',
    description: 'Close modals/Clear input',
  },
  NEXT_CONVERSATION: {
    key: 'ArrowDown',
    meta: true,
    description: 'Next conversation',
  },
  PREVIOUS_CONVERSATION: {
    key: 'ArrowUp',
    meta: true,
    description: 'Previous conversation',
  },
  DELETE_CONVERSATION: {
    key: 'Backspace',
    meta: true,
    shift: true,
    description: 'Delete current conversation',
  },
  EXPORT_CONVERSATION: {
    key: 'e',
    meta: true,
    shift: true,
    description: 'Export conversation',
  },
};

/**
 * Get platform-specific modifier key label
 */
export function getModifierKey(): 'Cmd' | 'Ctrl' {
  return navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl';
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'callback'>): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl || shortcut.meta) {
    parts.push(getModifierKey());
  }
  
  if (shortcut.shift) {
    parts.push('Shift');
  }
  
  if (shortcut.alt) {
    parts.push('Alt');
  }
  
  // Capitalize single letters, use as-is for special keys
  const key = shortcut.key.length === 1 
    ? shortcut.key.toUpperCase() 
    : shortcut.key;
  
  parts.push(key);
  
  return parts.join(' + ');
}
