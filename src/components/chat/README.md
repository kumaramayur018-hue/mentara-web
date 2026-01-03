# Mentara AI Chatbot - ChatGPT-Style Interface

## Overview

This is a comprehensive, modern ChatGPT-style AI chatbot interface built for Mentara. It features a clean, responsive design optimized for all screen sizes from smartphones to large displays.

## Features

### 🎨 Modern UI/UX
- **ChatGPT-inspired design** with clean, minimal aesthetics
- **Responsive layout** that works perfectly on all devices (320px - 4K+)
- **Dark mode support** with Mentara's brand colors (#4A9B8E light, #5FB3A3 dark)
- **Smooth animations** for message entry, typing indicators, and interactions
- **Glassmorphism effects** on header and composer

### 💬 Messaging Features
- **Message bubbles** with user/AI differentiation
- **Typing indicators** with animated dots
- **Date separators** (Today, Yesterday, specific dates)
- **Message timestamps** in compact format
- **Suggested follow-up questions** from AI responses
- **System messages** for announcements

### 🎯 Message Actions
- **Copy to clipboard** - Copy any AI message
- **Thumbs up/down feedback** - Rate AI responses
- **Save to notes** - Bookmark important messages
- **Follow-up prompts** - Quick reply to suggested questions

### 🗂️ Conversation Management
- **Sidebar with conversation list** - Collapsible on mobile
- **Search conversations** - Find by title or content
- **Pin conversations** - Keep important chats at top
- **Archive conversations** - Hide old chats
- **Export conversations** - Download as .txt file
- **Rename conversations** - Custom titles
- **Delete conversations** - With confirmation dialog
- **Conversation metadata** - Message count, last updated time

### ✍️ Composer Features
- **Auto-expanding textarea** - Grows with content up to 200px
- **Character counter** - Shows when near limit (2000 chars)
- **Emoji picker** - Quick access to common emojis
- **File attachments** - Support for images, PDFs, docs (max 10MB)
- **Voice input button** - Ready for speech-to-text integration
- **Quick prompts** - Pre-written prompts for common topics
- **Keyboard shortcuts**:
  - `Enter` - Send message
  - `Shift + Enter` - New line
  - `Escape` - Clear input
  - `Cmd/Ctrl + K` - New conversation
  - `Cmd/Ctrl + B` - Toggle sidebar

### ⚙️ Settings & Customization
- **Model selection** - Choose between Gemini models
- **Tone presets** - Calm, Clinical, or Friendly
- **Temperature slider** - Adjust creativity (0.0 - 1.0)
- **Max tokens control** - Response length (512 - 4096)
- **Safety filter toggle** - Content filtering
- **Streaming toggle** - Enable/disable progressive responses

### ♿ Accessibility
- **ARIA labels** on all interactive elements
- **Keyboard navigation** - Full keyboard support
- **Screen reader friendly** - Proper semantic HTML
- **Focus management** - Clear focus indicators
- **High contrast support** - Works with system settings
- **Flexible text sizing** - Respects user preferences

### 📱 Responsive Breakpoints
- **Mobile** (< 640px) - Single column, overlay sidebar
- **Tablet** (640px - 1024px) - Optimized touch targets
- **Desktop** (1024px+) - Two-column layout, permanent sidebar
- **Large Desktop** (1440px+) - Max width constraints for readability

## Component Architecture

```
/components/chat/
├── EnhancedChatInterface.tsx    # Main chat container
├── MessageBubble.tsx            # Individual message component
├── ChatComposer.tsx             # Message input area
├── ConversationSidebar.tsx      # Conversation list sidebar
├── ChatSettings.tsx             # Settings modal
└── README.md                    # This file
```

## Integration

### Basic Usage

```tsx
import { EnhancedChatInterface } from './components/chat/EnhancedChatInterface';

function MyApp() {
  return (
    <EnhancedChatInterface
      conversationId="conv_123"
      onBack={() => console.log('Back pressed')}
      onConversationChange={(id) => console.log('Changed to', id)}
    />
  );
}
```

### Props

#### EnhancedChatInterface
- `conversationId: string` - Current conversation ID
- `onBack: () => void` - Callback when back button clicked
- `onConversationChange: (id: string) => void` - Callback when conversation changes

#### MessageBubble
- `message: Message` - Message data
- `onFeedback?: (id, feedback) => void` - Feedback callback
- `onSave?: (id) => void` - Save callback
- `onFollowUp?: (content) => void` - Follow-up callback
- `showActions?: boolean` - Show/hide action buttons

#### ChatComposer
- `onSend: (message, attachments?) => void` - Send callback
- `onVoiceInput?: () => void` - Voice input callback
- `isLoading?: boolean` - Loading state
- `onStop?: () => void` - Stop generation callback
- `placeholder?: string` - Custom placeholder
- `disabled?: boolean` - Disable input
- `maxLength?: number` - Character limit
- `showQuickPrompts?: boolean` - Show quick prompts

#### ConversationSidebar
- `conversations: Conversation[]` - List of conversations
- `activeConversationId: string | null` - Current conversation
- `onSelectConversation: (id) => void` - Selection callback
- `onNewConversation: () => void` - New chat callback
- `onDeleteConversation: (id) => void` - Delete callback
- `onRenameConversation: (id, title) => void` - Rename callback
- `onExportConversation?: (id) => void` - Export callback
- `onPinConversation?: (id) => void` - Pin callback
- `onArchiveConversation?: (id) => void` - Archive callback
- `onClose?: () => void` - Close callback (mobile)
- `isOpen?: boolean` - Sidebar visibility

#### ChatSettings
- `config: ChatSettingsConfig` - Current settings
- `onConfigChange: (config) => void` - Settings change callback
- `trigger?: ReactNode` - Custom trigger button

## API Integration

The interface integrates with your existing Supabase backend:

### Endpoints Used
- `POST /chat` - Send message, get AI response
- `GET /chat/history/:userId/:conversationId` - Load conversation
- `GET /chat/conversations/:userId` - List conversations
- `POST /chat/conversations/:userId` - Create conversation
- `PUT /chat/conversations/:userId/:convId` - Update conversation
- `DELETE /chat/conversations/:userId/:convId` - Delete conversation

### Message Format
```typescript
interface Message {
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
```

### Conversation Format
```typescript
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  messageCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  unreadCount?: number;
}
```

### Settings Format
```typescript
interface ChatSettingsConfig {
  model: 'gemini-2.0-flash' | 'gemini-1.5-pro';
  tone: 'calm' | 'clinical' | 'friendly';
  temperature: number;
  maxTokens: number;
  safetyFilter: boolean;
  streamingEnabled: boolean;
}
```

## Customization

### Brand Colors
Update in `/styles/globals.css`:
```css
:root {
  --primary: #4A9B8E;  /* Light mode */
}

.dark {
  --primary: #5FB3A3;  /* Dark mode */
}
```

### Quick Prompts
Edit in `ChatComposer.tsx`:
```typescript
const QUICK_PROMPTS = [
  "Your custom prompt 1",
  "Your custom prompt 2",
  // ...
];
```

### Tone Presets
Edit in `ChatSettings.tsx`:
```typescript
const TONE_PRESETS = {
  custom: {
    label: 'Custom Tone',
    description: 'Your description',
    icon: '🎯',
  },
  // ...
};
```

## Performance Optimizations

1. **Virtualized Lists** - Ready for `react-window` integration
2. **Lazy Loading** - Components load on demand
3. **Debounced Search** - Prevents excessive filtering
4. **Optimistic UI** - Immediate feedback on user actions
5. **Message Grouping** - Efficient date-based rendering
6. **Auto-scroll Optimization** - Smooth scroll to bottom

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari 14+, Chrome Android)

## Accessibility Compliance

- ✅ WCAG 2.1 Level AA
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Focus indicators
- ✅ ARIA labels and roles
- ✅ Semantic HTML

## Future Enhancements

### Planned Features
- [ ] Real-time streaming responses (SSE/WebSocket)
- [ ] Voice-to-text input
- [ ] Rich media support (images, videos in responses)
- [ ] Code syntax highlighting
- [ ] LaTeX/Math rendering
- [ ] Conversation templates
- [ ] Multi-language support (i18n)
- [ ] Offline mode with service workers
- [ ] Push notifications
- [ ] Conversation sharing
- [ ] Custom themes

### Advanced Features (Optional)
- [ ] Conversation branching
- [ ] Message editing
- [ ] Thread replies
- [ ] Collaborative conversations
- [ ] Voice responses (TTS)
- [ ] Screen sharing for visual support
- [ ] Integration with calendar for session booking
- [ ] Mood tracking integration
- [ ] Crisis detection and intervention

## Troubleshooting

### Sidebar not showing on mobile
- Check `showSidebar` state
- Verify z-index hierarchy
- Ensure backdrop is clickable

### Messages not loading
- Check network requests in DevTools
- Verify user authentication
- Check conversation ID format

### Keyboard shortcuts not working
- Ensure no input has focus
- Check for conflicting browser shortcuts
- Verify event listener attachment

### Styling issues
- Clear browser cache
- Check Tailwind CSS compilation
- Verify CSS variable definitions

## Support

For issues or questions:
1. Check this README
2. Review component source code
3. Check browser console for errors
4. Verify API responses in Network tab

## License

Part of the Mentara mental wellbeing platform.
