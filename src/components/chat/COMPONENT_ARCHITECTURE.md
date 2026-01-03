# Mentara AI Chatbot - Component Architecture

## 📊 Component Hierarchy

```
App.tsx
  └── AIChatbotWrapper.tsx
       ├── ChatHistory.tsx                    [Conversation List View]
       │    ├── ChatEmptyState.tsx            [When no conversations]
       │    └── Card (for each conversation)  [Conversation cards]
       │
       └── EnhancedChatInterface.tsx          [Main Chat View]
            ├── ConversationSidebar.tsx       [Left sidebar - desktop/overlay]
            │    ├── Search (Input)
            │    ├── New Chat (Button)
            │    └── Conversation Items
            │         ├── Edit (inline)
            │         └── Actions Menu
            │              ├── Rename
            │              ├── Pin
            │              ├── Export
            │              ├── Archive
            │              └── Delete
            │
            ├── Header                        [Top bar]
            │    ├── Back Button
            │    ├── Menu Button (mobile)
            │    ├── Logo
            │    ├── Title & Badge
            │    └── ChatSettings.tsx        [Settings modal]
            │         ├── Model Selection
            │         ├── Tone Presets
            │         ├── Temperature Slider
            │         ├── Max Tokens Slider
            │         └── Feature Toggles
            │
            ├── Messages Area                 [Scrollable message list]
            │    ├── Date Separator (Today/Yesterday/Date)
            │    ├── MessageBubble.tsx        [Individual messages]
            │    │    ├── Avatar (User/AI)
            │    │    ├── Message Content
            │    │    │    ├── MessageFormatter (markdown)
            │    │    │    └── Suggested Follow-ups
            │    │    └── Message Actions
            │    │         ├── Copy
            │    │         ├── Thumbs Up/Down
            │    │         ├── Save to Notes
            │    │         └── Follow-up
            │    └── Typing Indicator
            │
            └── ChatComposer.tsx              [Bottom input area]
                 ├── Quick Prompts (mobile)
                 ├── Attachments Preview
                 ├── Main Input
                 │    ├── Expanding Textarea
                 │    └── Character Counter
                 ├── Action Buttons
                 │    ├── Quick Prompts (desktop)
                 │    └── Send/Stop Button
                 └── Secondary Actions
                      ├── File Attachment
                      ├── Voice Input
                      ├── Emoji Picker
                      └── Keyboard Hints
```

## 🔄 Data Flow

```
User Interaction
      ↓
  Component Event
      ↓
  Handler Function
      ↓
  API Call (Supabase)
      ↓
  Backend Processing
      ↓
  Gemini AI Response
      ↓
  State Update (React)
      ↓
  UI Re-render
      ↓
  User Feedback
```

## 📦 State Management

### EnhancedChatInterface State
```typescript
{
  messages: Message[],           // Current conversation messages
  conversations: Conversation[], // All user conversations
  showSidebar: boolean,          // Sidebar visibility (mobile)
  isLoading: boolean,            // Initial load state
  isTyping: boolean,             // AI response in progress
  chatSettings: ChatSettingsConfig // User preferences
}
```

### ConversationSidebar State
```typescript
{
  searchQuery: string,           // Search filter
  editingId: string | null,      // Conversation being renamed
  editingTitle: string,          // New title being edited
  deleteDialogOpen: boolean,     // Delete confirmation
  conversationToDelete: string   // ID to delete
}
```

### ChatComposer State
```typescript
{
  inputValue: string,            // Message text
  showEmojiPicker: boolean,      // Emoji picker visibility
  showQuickPromptsPopover: boolean, // Quick prompts visibility
  attachments: File[]            // Attached files
}
```

### MessageBubble State
```typescript
{
  copied: boolean,               // Copy success state
  localFeedback: 'up' | 'down' | null // User feedback
}
```

## 🎯 Props Flow

### Top-Level Props (EnhancedChatInterface)
```typescript
{
  conversationId: string,        // Current conversation ID
  onBack: () => void,            // Navigate back handler
  onConversationChange: (id: string) => void // Switch conversation
}
```

### Sidebar Props (ConversationSidebar)
```typescript
{
  conversations: Conversation[], // List of conversations
  activeConversationId: string,  // Currently selected ID
  onSelectConversation: (id) => void,
  onNewConversation: () => void,
  onDeleteConversation: (id) => void,
  onRenameConversation: (id, title) => void,
  onExportConversation?: (id) => void,
  onPinConversation?: (id) => void,
  onArchiveConversation?: (id) => void,
  onClose?: () => void           // Mobile close handler
}
```

### Message Props (MessageBubble)
```typescript
{
  message: Message,              // Message data
  onFeedback?: (id, feedback) => void,
  onSave?: (id) => void,
  onFollowUp?: (content) => void,
  showActions?: boolean          // Display action buttons
}
```

### Composer Props (ChatComposer)
```typescript
{
  onSend: (message, attachments?) => void,
  onVoiceInput?: () => void,
  isLoading?: boolean,
  onStop?: () => void,
  placeholder?: string,
  disabled?: boolean,
  maxLength?: number,
  showQuickPrompts?: boolean
}
```

## 🔌 External Dependencies

### UI Components (Shadcn/ui)
- `Button` - All interactive buttons
- `Card` - Message bubbles, conversation cards
- `Input` - Text inputs, search
- `Textarea` - Message composer
- `ScrollArea` - Message list, sidebar
- `Badge` - AI badge, status indicators
- `Dialog` - Settings, delete confirmation
- `AlertDialog` - Destructive actions
- `Popover` - Emoji picker, quick prompts
- `DropdownMenu` - Conversation actions
- `Tooltip` - Action hints
- `Slider` - Settings controls
- `Switch` - Feature toggles
- `Select` - Model selection
- `Separator` - Visual dividers

### Icons (Lucide React)
- `MessageSquare, Bot, User, Send, Plus, Search`
- `Settings, Sparkles, Copy, ThumbsUp, ThumbsDown`
- `Bookmark, Download, Trash2, Edit2, Pin, Archive`
- `ArrowLeft, Menu, X, Smile, Paperclip, Mic`
- `Keyboard, Brain, Heart, Lightbulb, Shield`

### Utilities
- `toast` (sonner) - Notifications
- `MessageFormatter` - Markdown rendering
- `Logo` - Mentara branding

## 🎨 Styling Architecture

### CSS Layers
1. **Base** - Reset & defaults (`globals.css`)
2. **Components** - UI components (Shadcn)
3. **Utilities** - Tailwind utilities
4. **Custom** - Chat-specific styles

### Theme Variables
```css
/* Light Mode */
--primary: #4A9B8E
--background: #ffffff
--card: #ffffff
--muted: #ececf0
--border: rgba(0, 0, 0, 0.1)

/* Dark Mode */
--primary: #5FB3A3
--background: oklch(0.145 0 0)
--card: oklch(0.205 0 0)
--muted: oklch(0.269 0 0)
--border: oklch(0.269 0 0)
```

### Responsive Strategy
```css
/* Mobile First Approach */
.sidebar {
  /* Base: Mobile (hidden) */
  display: none;
}

@media (min-width: 1024px) {
  /* Desktop: Visible */
  .sidebar {
    display: block;
  }
}
```

## 📱 Responsive Behavior

### Mobile (< 1024px)
- Single column layout
- Overlay sidebar (slide-in from left)
- Full-width messages
- Simplified header
- Bottom-sheet settings

### Desktop (>= 1024px)
- Two-column layout
- Permanent sidebar (320px)
- Max-width messages (4xl)
- Full header
- Modal settings

## ⚡ Performance Considerations

### Memoization Points
```typescript
// Expensive computations
const messageGroups = useMemo(
  () => groupMessagesByDate(messages),
  [messages]
);

// Callback stability
const handleSend = useCallback(
  (content: string) => { /* ... */ },
  [conversationId, user]
);
```

### Lazy Loading
```typescript
// Heavy components
const ChatSettings = lazy(() => import('./ChatSettings'));
const KeyboardShortcutsHelp = lazy(() => import('./KeyboardShortcutsHelp'));
```

### Virtualization (Future)
```typescript
// For 100+ messages
import { FixedSizeList } from 'react-window';
<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={100}
>
  {MessageRow}
</FixedSizeList>
```

## 🔐 Security Architecture

### Input Sanitization
```typescript
// Before rendering user content
const sanitizedContent = DOMPurify.sanitize(message.content);
```

### API Security
```typescript
// All API calls use auth headers
headers: {
  'Authorization': `Bearer ${publicAnonKey}`
}
```

### XSS Prevention
```typescript
// Use dangerouslySetInnerHTML carefully
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

## 🧪 Testing Strategy

### Unit Tests
- Component rendering
- Event handlers
- State updates
- Prop validation

### Integration Tests
- Message sending flow
- Conversation management
- Settings persistence
- Keyboard navigation

### E2E Tests
- Complete user journeys
- Multi-device testing
- Cross-browser verification
- Accessibility compliance

## 📊 Analytics Events

### User Interactions
```typescript
// Track engagement
analytics.track('chat_message_sent');
analytics.track('chat_conversation_created');
analytics.track('chat_settings_changed');
analytics.track('chat_message_feedback');
```

### Performance Metrics
```typescript
// Track performance
performance.mark('chat_load_start');
performance.mark('chat_load_end');
performance.measure('chat_load_time', 'chat_load_start', 'chat_load_end');
```

## 🔄 Update Strategy

### Adding New Features
1. Create component in `/components/chat/`
2. Export from `index.tsx`
3. Update type definitions
4. Add to documentation
5. Write tests

### Modifying Existing Features
1. Update component file
2. Check for breaking changes
3. Update props if needed
4. Update documentation
5. Test thoroughly

---

**Architecture Guide v1.0** - Mentara AI Chatbot
