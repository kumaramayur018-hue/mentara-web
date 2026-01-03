# AI Chat Interface - Design System

## Overview
The AI Chat interface is a modern, ChatGPT-inspired chat experience built for Mentara's mental wellbeing platform.

## Design Principles

### 1. **Simplicity First**
- Clean, uncluttered interface
- Focus on the conversation
- Minimal distractions

### 2. **Responsive & Accessible**
- Works seamlessly on all devices (320px - 4K+)
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly

### 3. **Visual Hierarchy**
- Clear distinction between user and AI messages
- Consistent spacing and typography
- Subtle animations for better UX

## Component Structure

### EnhancedChatInterface
**Main container** - Orchestrates the entire chat experience

**Features:**
- Collapsible sidebar (desktop: 256px, mobile: overlay)
- Sticky header with minimal controls
- Scrollable message area (max-width: 768px)
- Fixed composer at bottom

**Responsive Breakpoints:**
- Mobile: < 1024px (sidebar as overlay)
- Desktop: ≥ 1024px (sidebar always visible, collapsible)

### MessageBubble
**Message display component** - Shows user and AI messages

**Layout:**
- Avatar (32px circular)
- Sender name + timestamp
- Message content (prose formatting)
- Action buttons (on hover, AI messages only)
- Suggestion chips (AI messages only)

**Features:**
- Copy message
- Thumbs up/down feedback
- Follow-up suggestions
- Markdown rendering for AI responses

### ChatComposer
**Input component** - User message composition

**Features:**
- Auto-resizing textarea (max 200px height)
- Quick prompt chips (when input is empty)
- Character counter (shows at 80% of limit)
- Send button (disabled when empty or over limit)
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

**Simplified Design:**
- Single input field in rounded container
- No file attachments (future consideration)
- No emoji picker (can type emojis directly)
- No voice input (future consideration)

### ConversationSidebar
**Navigation component** - Conversation history

**Features:**
- New chat button
- Conversation list (sorted by date)
- Rename/Export/Delete actions
- Empty state with CTA
- Relative timestamps (Just now, 2h ago, etc.)

**Simplified Design:**
- Removed search (can add later if needed)
- Removed pinning (simplified sorting)
- Removed archiving (simplified management)
- Clean, minimal conversation items

## Color System

### Brand Colors
- Primary: `#4A9B8E` (Teal)
- Primary (Dark Mode): `#5FB3A3` (Lighter Teal)

### Semantic Colors
- Background: White / Dark Gray
- Card: White / Darker Gray
- Muted: Light Gray / Medium Gray
- Border: Subtle dividers
- Destructive: Red (for delete actions)

### Message Colors
- User Avatar: Muted gray
- AI Avatar: Gradient (Primary to Primary/70)
- AI Messages: Default text color
- User Messages: Default text color

## Typography

### Font Sizes
- Message content: 14px (prose-sm)
- Sender name: 14px (font-medium)
- Timestamp: 12px (text-xs)
- Input placeholder: 14px
- Quick prompts: 12px

### Font Weights
- Regular: 400
- Medium: 500 (headings, labels, buttons)

## Spacing

### Container Padding
- Desktop: 16px (1rem)
- Mobile: 12px (0.75rem)

### Message Spacing
- Between messages: 24px
- Message internal: 8px (gap-2)
- Suggestion chips: 8px gap

### Composer Spacing
- Container padding: 12px - 16px
- Quick prompts gap: 8px
- Bottom safe area: consideration for mobile

## Animations

### Transitions
- Sidebar: 300ms ease-in-out
- Button hover: 150ms
- Message hover actions: opacity transition
- Focus states: Ring with 3px width

### Loading States
- Typing indicator: Bouncing dots
- Page loading: Spinning circle + pulsing icon

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals/sidebars
- Cmd/Ctrl + B: Toggle sidebar
- Cmd/Ctrl + K: New conversation

### Screen Reader Support
- Proper ARIA labels
- Role attributes
- Live regions for dynamic content
- Descriptive button labels

### Focus Management
- Visible focus indicators
- Focus trapping in modals
- Auto-focus on composer after actions

## Mobile Optimizations

### Touch Targets
- Minimum 44x44px touch targets
- Adequate spacing between interactive elements

### Gestures
- Tap to select conversation
- Swipe to close sidebar (via backdrop tap)

### Safe Areas
- Respect iOS/Android safe areas
- Bottom padding for home indicators

## Performance

### Optimizations
- Virtualized conversation list (for large histories)
- Debounced auto-resize
- Memoized components
- Efficient re-renders

### Loading Strategy
- Show loading state immediately
- Progressive enhancement
- Optimistic UI updates

## Future Enhancements

### Planned Features
- Voice input
- File attachments
- Image generation
- Code syntax highlighting
- Conversation search
- Export to PDF
- Conversation sharing

### Considerations
- Real-time streaming responses
- Multi-modal support (images, audio)
- Conversation branching
- Advanced filtering/sorting
