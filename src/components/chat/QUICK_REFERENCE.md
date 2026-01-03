# Mentara AI Chatbot - Quick Reference Guide

## 🎯 Component Quick Reference

### Main Components

| Component | Purpose | File Path |
|-----------|---------|-----------|
| EnhancedChatInterface | Main chat container | `/components/chat/EnhancedChatInterface.tsx` |
| MessageBubble | Individual messages | `/components/chat/MessageBubble.tsx` |
| ChatComposer | Message input | `/components/chat/ChatComposer.tsx` |
| ConversationSidebar | Conversation list | `/components/chat/ConversationSidebar.tsx` |
| ChatSettings | Settings modal | `/components/chat/ChatSettings.tsx` |
| ChatEmptyState | Empty states | `/components/chat/ChatEmptyState.tsx` |
| KeyboardShortcutsHelp | Shortcuts modal | `/components/chat/KeyboardShortcutsHelp.tsx` |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | New conversation |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Escape` | Clear input / Close dialogs |
| `?` | Show shortcuts help |
| `/` | Focus message input |

## 🎨 Styling Classes

### Custom CSS Classes (in globals.css)
```css
.scrollbar-hide          /* Hide scrollbars */
.message-enter           /* Message entry animation */
.prose                   /* Markdown formatting */
.prose-sm                /* Small prose variant */
```

### Tailwind Utilities
```tsx
"bg-primary"             // Mentara teal (#4A9B8E / #5FB3A3)
"bg-card"                // Card background
"bg-muted"               // Muted background
"text-muted-foreground"  // Muted text
"border-border"          // Border color
```

## 📐 Responsive Breakpoints

```tsx
sm:  640px   // Small tablets, large phones
md:  768px   // Tablets
lg:  1024px  // Laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large desktops
```

## 🔧 Common Tasks

### 1. Adding a New Quick Prompt
**File:** `/components/chat/ChatComposer.tsx`
```typescript
const QUICK_PROMPTS = [
  "Your new prompt here",
  // ... existing prompts
];
```

### 2. Customizing Tone Presets
**File:** `/components/chat/ChatSettings.tsx`
```typescript
const TONE_PRESETS = {
  yourTone: {
    label: 'Your Tone Label',
    description: 'Description here',
    icon: '🎯',
  },
  // ... existing tones
};
```

### 3. Changing Brand Colors
**File:** `/styles/globals.css`
```css
:root {
  --primary: #4A9B8E;  /* Light mode */
}

.dark {
  --primary: #5FB3A3;  /* Dark mode */
}
```

### 4. Adding a New Message Action
**File:** `/components/chat/MessageBubble.tsx`

1. Add button in actions section:
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={handleYourAction}
    >
      <YourIcon className="w-3 h-3" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Your action</p>
  </TooltipContent>
</Tooltip>
```

2. Add handler:
```tsx
const handleYourAction = () => {
  // Your logic here
  toast.success('Action completed');
};
```

### 5. Customizing Welcome Message
**File:** `/components/chat/EnhancedChatInterface.tsx`

Find `showWelcomeMessage()` function:
```typescript
const showWelcomeMessage = () => {
  const welcomeMessage: Message = {
    id: 'welcome',
    content: `Your custom welcome message here`,
    sender: 'ai',
    timestamp: new Date(),
    suggestions: [
      "Your suggestion 1",
      "Your suggestion 2",
    ]
  };
  setMessages([welcomeMessage]);
};
```

## 🐛 Debugging Tips

### Check Message Flow
```typescript
// In EnhancedChatInterface.tsx
console.log('Messages:', messages);
console.log('Current conversation:', conversationId);
```

### Check API Responses
```typescript
// In sendMessage function
const result = await response.json();
console.log('AI Response:', result);
```

### Check Conversation State
```typescript
// In ConversationSidebar.tsx
console.log('Conversations:', conversations);
console.log('Active:', activeConversationId);
```

## 🎯 Type Definitions

### Message Type
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

### Conversation Type
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

### Settings Type
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

## 🔌 API Integration Points

### Send Message
```typescript
POST /make-server-a40ffbb5/chat
Body: {
  message: string,
  userId: string,
  conversationId: string,
  settings: ChatSettingsConfig
}
```

### Load Conversation
```typescript
GET /make-server-a40ffbb5/chat/history/:userId/:conversationId
```

### List Conversations
```typescript
GET /make-server-a40ffbb5/chat/conversations/:userId
```

### Create Conversation
```typescript
POST /make-server-a40ffbb5/chat/conversations/:userId
Body: { title: string, id?: string }
```

### Update Conversation
```typescript
PUT /make-server-a40ffbb5/chat/conversations/:userId/:convId
Body: { title: string }
```

### Delete Conversation
```typescript
DELETE /make-server-a40ffbb5/chat/conversations/:userId/:convId
```

## 🎨 Icon Library (Lucide React)

Common icons used:
```typescript
import {
  MessageSquare,  // Chat icon
  Plus,           // New chat
  Send,           // Send message
  Bot,            // AI avatar
  User,           // User avatar
  Search,         // Search
  Settings,       // Settings
  Sparkles,       // AI badge
  Copy,           // Copy action
  ThumbsUp,       // Positive feedback
  ThumbsDown,     // Negative feedback
  Bookmark,       // Save
  Download,       // Export
  Trash2,         // Delete
  Edit2,          // Rename
  Pin,            // Pin
  Archive,        // Archive
  Smile,          // Emoji picker
  Paperclip,      // Attachments
  Mic,            // Voice input
} from 'lucide-react';
```

## 📱 Mobile-Specific Features

### Touch Gestures
- Swipe left on conversation → Show actions
- Long press on message → Show actions
- Pull to refresh → Reload conversations

### Mobile Optimizations
- Larger touch targets (44px minimum)
- Overlay sidebar instead of permanent
- Simplified header on mobile
- Bottom sheet for settings
- Full-screen composer on focus

## ⚡ Performance Tips

1. **Virtualize Long Lists** - For 100+ conversations
2. **Lazy Load Images** - Defer off-screen images
3. **Debounce Search** - Wait 300ms before searching
4. **Optimize Re-renders** - Use React.memo for heavy components
5. **Code Split** - Lazy load settings modal

## 🔒 Security Considerations

1. **Sanitize User Input** - Before displaying
2. **Validate Message Content** - Check for XSS
3. **Rate Limiting** - Prevent spam (backend)
4. **Content Security Policy** - Set appropriate CSP headers
5. **HTTPS Only** - Ensure secure connections

## 📊 Analytics Events (Future)

Track these user interactions:
```typescript
// Message sent
analytics.track('chat_message_sent', { conversationId });

// Message feedback
analytics.track('chat_message_feedback', { messageId, feedback });

// Settings changed
analytics.track('chat_settings_changed', { setting, value });

// Conversation action
analytics.track('chat_conversation_action', { action, conversationId });
```

## 🌐 Internationalization (Future)

Prepare for i18n:
```typescript
// Use i18n keys instead of hardcoded strings
t('chat.composer.placeholder')
t('chat.empty.title')
t('chat.settings.model.label')
```

## 🎯 Common Issues & Solutions

### Issue: Sidebar not closing on mobile
**Solution:** Check `onClose` prop is passed and called

### Issue: Messages not scrolling to bottom
**Solution:** Check `messagesEndRef` is attached and scrollIntoView called

### Issue: Keyboard shortcuts not working
**Solution:** Verify no input has focus, check event listener

### Issue: Styles not applying
**Solution:** Run `npm run build` to recompile Tailwind CSS

### Issue: API errors
**Solution:** Check projectId and publicAnonKey in network tab

## 📞 Support

For issues or questions:
1. Check this quick reference
2. Review full README.md
3. Check implementation summary
4. Review component source code
5. Check browser console for errors

---

**Quick Reference v1.0** - Updated December 2024
