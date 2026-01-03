# BackToHome Component

A clean, modern "Back to Home Page" UI element designed for the Mentara app with ChatGPT-style aesthetics.

## Features

✅ **3 Visual Variants**: Button, Text Link, Icon Button  
✅ **Fully Responsive**: Mobile, Tablet, Desktop optimized  
✅ **Accessible**: ARIA labels, keyboard navigation, focus states  
✅ **Customizable**: Multiple sizes, icons, and styling options  
✅ **Mobile-Friendly**: 44px+ tap targets, optional sticky positioning  
✅ **Theme Support**: Works in light and dark mode  

---

## Installation

```tsx
import { BackToHome, BackToHomeButton, BackToHomeLink, BackToHomeIcon } from './components/BackToHome';
```

---

## Basic Usage

### Button Variant (Default)

```tsx
<BackToHome 
  onBack={() => router.push('/home')}
/>
```

### Text Link Variant

```tsx
<BackToHome 
  onBack={() => router.push('/home')}
  variant="text-link"
/>
```

### Icon Button Variant

```tsx
<BackToHome 
  onBack={() => router.push('/home')}
  variant="icon-button"
/>
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onBack` | `() => void` | **Required** | Callback when clicked |
| `variant` | `'button' \| 'text-link' \| 'icon-button'` | `'button'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `label` | `string` | `'Back to Home Page'` | Display text |
| `showIcon` | `boolean` | `true` | Show/hide icon |
| `icon` | `'arrow' \| 'home'` | `'arrow'` | Icon type |
| `sticky` | `boolean` | `false` | Sticky positioning on mobile |
| `fullWidthMobile` | `boolean` | `false` | Full width on mobile |
| `className` | `string` | `undefined` | Additional CSS classes |

---

## Size Variants

### Small
```tsx
<BackToHome onBack={handleBack} size="sm" />
```
- Height: 36px
- Icon: 14px
- Text: 14px

### Medium (Default)
```tsx
<BackToHome onBack={handleBack} size="md" />
```
- Height: 40px
- Icon: 16px
- Text: 16px

### Large
```tsx
<BackToHome onBack={handleBack} size="lg" />
```
- Height: 44px
- Icon: 20px
- Text: 18px

---

## Responsive Behavior

### Mobile (<640px)
- Full tap target: 44px minimum height
- Optional full-width button
- Sticky positioning available
- Larger touch areas

### Tablet (640px - 1024px)
- Inline positioning
- Medium spacing
- Standard sizing

### Desktop (>1024px)
- Compact layout
- Positioned near sidebar/header
- Hover effects

---

## Usage Examples

### 1. Chat Page Header (Mobile Sticky)

```tsx
import { BackToHome } from './components/BackToHome';

function ChatPage() {
  return (
    <div className="min-h-screen">
      <BackToHome 
        onBack={() => router.push('/')}
        variant="button"
        size="md"
        sticky={true}
        fullWidthMobile={true}
        className="px-4 sm:px-0"
      />
      
      {/* Chat content */}
    </div>
  );
}
```

### 2. Minimal Text Link (Top Left)

```tsx
function ChatPage() {
  return (
    <div className="min-h-screen p-4">
      <BackToHome 
        onBack={() => router.push('/')}
        variant="text-link"
        size="sm"
        label="← Back"
      />
      
      {/* Content */}
    </div>
  );
}
```

### 3. Icon Button (Compact)

```tsx
function ChatPage() {
  return (
    <div className="min-h-screen">
      <header className="p-4 flex items-center gap-3">
        <BackToHome 
          onBack={() => router.push('/')}
          variant="icon-button"
          size="md"
        />
        <h1>Chat</h1>
      </header>
      
      {/* Content */}
    </div>
  );
}
```

### 4. With Custom Label & Home Icon

```tsx
<BackToHome 
  onBack={() => router.push('/')}
  variant="button"
  label="Return Home"
  icon="home"
  size="md"
/>
```

### 5. Desktop Sidebar Integration

```tsx
function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r p-4">
        <BackToHome 
          onBack={() => router.push('/')}
          variant="text-link"
          size="sm"
          className="mb-4"
        />
        {/* Sidebar content */}
      </aside>
      
      {/* Main content */}
    </div>
  );
}
```

### 6. Full-Width Mobile, Inline Desktop

```tsx
<BackToHome 
  onBack={() => router.push('/')}
  variant="button"
  fullWidthMobile={true}
  className="sm:w-auto sm:max-w-xs"
/>
```

---

## Preset Components

For convenience, use preset components:

### BackToHomeButton
```tsx
import { BackToHomeButton } from './components/BackToHome';

<BackToHomeButton 
  onBack={handleBack}
  size="md"
/>
```

### BackToHomeLink
```tsx
import { BackToHomeLink } from './components/BackToHome';

<BackToHomeLink 
  onBack={handleBack}
  label="← Back to dashboard"
/>
```

### BackToHomeIcon
```tsx
import { BackToHomeIcon } from './components/BackToHome';

<BackToHomeIcon 
  onBack={handleBack}
/>
```

---

## Accessibility Features

✅ **ARIA Labels**: "Go back to home page"  
✅ **Keyboard Navigation**: Tab to focus, Enter/Space to activate  
✅ **Focus Indicators**: Visible ring on focus  
✅ **Screen Reader**: Proper semantic HTML and labels  
✅ **Touch Targets**: 44px minimum on mobile  
✅ **Color Contrast**: WCAG 2.1 AA compliant  

---

## Styling Tokens

### Light Mode
```css
/* Button */
background: transparent
border: 1px solid rgba(0, 0, 0, 0.1)
text: foreground
hover-bg: muted
hover-border: rgba(0, 0, 0, 0.2)

/* Text Link */
text: muted-foreground
hover-text: foreground
underline: on hover
```

### Dark Mode
```css
/* Button */
background: transparent
border: 1px solid rgba(255, 255, 255, 0.1)
text: foreground
hover-bg: muted
hover-border: rgba(255, 255, 255, 0.2)

/* Text Link */
text: muted-foreground
hover-text: foreground
underline: on hover
```

---

## Design Specifications

### Button Variant

**Visual Style:**
- Border radius: `0.5rem` (8px)
- Border width: `1px`
- Padding: Horizontal `1rem`, Vertical `0.5rem`
- Gap between icon and text: `0.5rem`
- Transition: `200ms ease`

**States:**
- **Default**: Outline border, transparent background
- **Hover**: Muted background, darker border
- **Focus**: 2px primary color ring
- **Active**: Scale down to 98%

**Mobile Adjustments:**
- Full width option
- Minimum height: 44px
- Padding: 16px horizontal

### Text Link Variant

**Visual Style:**
- No background or border
- Text color: Muted foreground
- Underline offset: `4px`
- Icon translation: `-4px` on hover

**States:**
- **Default**: No underline
- **Hover**: Underline appears, icon slides left, text darkens
- **Focus**: 2px primary color ring
- **Active**: 70% opacity

**Mobile Adjustments:**
- Minimum tap target: 44px height
- Inline on desktop

### Icon Button Variant

**Visual Style:**
- Circular shape (border-radius: `50%`)
- Square dimensions (40x40px default)
- Centered icon

**States:**
- Same as button variant
- Hover: Background changes
- Focus: Ring visible
- Active: Scale effect

---

## Integration with App.tsx

```tsx
// In your main app routing
import { BackToHomeButton } from './components/BackToHome';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div>
      {currentPage === 'chat' && (
        <div>
          <BackToHomeButton 
            onBack={() => setCurrentPage('home')}
            sticky={true}
            className="px-4 pt-4"
          />
          <ChatInterface />
        </div>
      )}
    </div>
  );
}
```

---

## Best Practices

### When to Use Each Variant

**Button Variant:**
- Primary navigation action
- When back action is important
- Mobile-first designs
- Full-width CTAs

**Text Link Variant:**
- Secondary navigation
- When space is limited
- Desktop layouts with sidebars
- Subtle, non-intrusive placement

**Icon Button Variant:**
- Compact headers
- Toolbars
- When label is redundant
- Minimalist designs

### Placement Guidelines

**Top-Left (Recommended):**
```tsx
<div className="p-4">
  <BackToHome onBack={handleBack} />
  {/* Content */}
</div>
```

**Header Integration:**
```tsx
<header className="flex items-center gap-4 p-4">
  <BackToHome variant="icon-button" onBack={handleBack} />
  <h1>Page Title</h1>
</header>
```

**Sticky Mobile:**
```tsx
<BackToHome 
  onBack={handleBack}
  sticky={true}
  className="px-4"
/>
```

---

## Performance Considerations

- **No Re-renders**: Component is pure, only re-renders when props change
- **Optimized Icons**: Lucide icons are tree-shakeable
- **Minimal CSS**: Uses Tailwind utility classes
- **Fast Transitions**: CSS transitions, no JavaScript animations

---

## Browser Support

✅ Chrome/Edge (latest)  
✅ Firefox (latest)  
✅ Safari (latest)  
✅ Mobile Safari (iOS 13+)  
✅ Chrome Mobile (Android 8+)  

---

## Troubleshooting

### Icon not showing
```tsx
// Make sure showIcon is true (default)
<BackToHome onBack={handleBack} showIcon={true} />
```

### Not full width on mobile
```tsx
// Add fullWidthMobile prop
<BackToHome onBack={handleBack} fullWidthMobile={true} />
```

### Sticky not working
```tsx
// Ensure parent container has proper overflow
<div className="overflow-auto">
  <BackToHome onBack={handleBack} sticky={true} />
</div>
```

### Focus ring not visible
```tsx
// Check if you have global focus ring disabled
// Component uses focus-visible:ring-2
```

---

## Advanced Customization

### Custom Styling

```tsx
<BackToHome 
  onBack={handleBack}
  className="
    bg-primary text-primary-foreground 
    hover:bg-primary/90 
    border-0
  "
/>
```

### With Router Integration

```tsx
import { useNavigate } from 'react-router-dom';

function ChatPage() {
  const navigate = useNavigate();
  
  return (
    <BackToHome onBack={() => navigate('/')} />
  );
}
```

### With Animation

```tsx
<BackToHome 
  onBack={handleBack}
  className="animate-in fade-in slide-in-from-left-4 duration-300"
/>
```

---

## Examples Gallery

Check the `/examples` directory for:
- Mobile app integration
- Desktop dashboard layout
- Chat interface header
- Settings page navigation
- Multi-level navigation

---

## Contributing

To add new variants or improve the component, follow these guidelines:
1. Maintain accessibility standards
2. Test on all breakpoints
3. Ensure dark mode compatibility
4. Add documentation for new props
5. Update this README
