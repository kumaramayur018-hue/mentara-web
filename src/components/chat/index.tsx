/**
 * Mentara AI Chatbot Components
 * 
 * A comprehensive, ChatGPT-style AI chatbot interface with:
 * - Modern, responsive design
 * - Full keyboard navigation
 * - Conversation management
 * - Rich message actions
 * - Customizable settings
 * - Accessibility compliant (WCAG 2.1 AA)
 * 
 * @module components/chat
 */

// Main Interface
export { EnhancedChatInterface } from './EnhancedChatInterface';

// Message Components
export { MessageBubble } from './MessageBubble';
export type { Message } from './MessageBubble';

// Composer
export { ChatComposer } from './ChatComposer';

// Sidebar
export { ConversationSidebar } from './ConversationSidebar';
export type { Conversation } from './ConversationSidebar';

// Settings
export { ChatSettings } from './ChatSettings';
export type { ChatSettingsConfig } from './ChatSettings';

// Empty States
export { ChatEmptyState } from './ChatEmptyState';

// Keyboard Shortcuts
export { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
export { 
  useChatKeyboardShortcuts, 
  CHAT_SHORTCUTS,
  getModifierKey,
  formatShortcut 
} from './useChatKeyboardShortcuts';
export type { KeyboardShortcut } from './useChatKeyboardShortcuts';

/**
 * Usage Example:
 * 
 * ```tsx
 * import { EnhancedChatInterface } from './components/chat';
 * 
 * function App() {
 *   return (
 *     <EnhancedChatInterface
 *       conversationId="conv_123"
 *       onBack={() => console.log('Back')}
 *       onConversationChange={(id) => console.log('Changed:', id)}
 *     />
 *   );
 * }
 * ```
 * 
 * For more examples and documentation, see:
 * - /components/chat/README.md
 * - /components/chat/QUICK_REFERENCE.md
 * - /CHATBOT_IMPLEMENTATION_SUMMARY.md
 */
