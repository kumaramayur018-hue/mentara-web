# BackToHome - Quick Start Guide

**Clean, modern "Back to Home" navigation for Mentara**

---

## ⚡ Quick Usage

### 1. Import
```tsx
import { BackToHome } from './components/BackToHome';
// or use presets:
import { BackToHomeButton, BackToHomeLink, BackToHomeIcon } from './components/BackToHome';
```

### 2. Basic Implementation
```tsx
<BackToHome onBack={() => router.push('/')} />
```

---

## 🎨 Three Variants

### Button (Default)
```tsx
<BackToHome onBack={handleBack} variant="button" />
```
✅ Best for: Primary navigation, mobile-first designs

### Text Link
```tsx
<BackToHome onBack={handleBack} variant="text-link" />
```
✅ Best for: Secondary navigation, desktop layouts, minimal designs

### Icon Button
```tsx
<BackToHome onBack={handleBack} variant="icon-button" />
```
✅ Best for: Compact headers, toolbars, tight spaces

---

## 📱 Common Patterns

### Pattern 1: Mobile Chat Header
```tsx
<BackToHome 
  onBack={() => router.push('/')}
  variant="icon-button"
  sticky={true}
/>
```

### Pattern 2: Desktop Sidebar
```tsx
<BackToHomeLink 
  onBack={() => router.push('/')}
  size="sm"
  label="← Dashboard"
/>
```

### Pattern 3: Full-Width Mobile Button
```tsx
<BackToHomeButton 
  onBack={() => router.push('/')}
  fullWidthMobile={true}
/>
```

---

## 🔧 Essential Props

| Prop | Values | Default | Use Case |
|------|--------|---------|----------|
| `onBack` | function | **Required** | Navigation callback |
| `variant` | `button` \| `text-link` \| `icon-button` | `button` | Visual style |
| `size` | `sm` \| `md` \| `lg` | `md` | Component size |
| `sticky` | boolean | `false` | Sticky on scroll |
| `fullWidthMobile` | boolean | `false` | Mobile full width |

---

## 📐 Sizing Reference

| Size | Height | Icon | Text | Use Case |
|------|--------|------|------|----------|
| `sm` | 36px | 14px | 14px | Compact layouts |
| `md` | 40px | 16px | 16px | Standard (default) |
| `lg` | 44px | 20px | 18px | Mobile primary |

---

## 💡 Design Tokens

### Button Variant
```
Border radius: 8px
Padding: 16px horizontal
Gap: 8px (icon to text)
Border: 1px outline
Hover: Muted background
```

### Text Link Variant
```
No border/background
Underline on hover
Icon slides left on hover
Minimum tap: 44px (mobile)
```

### Icon Button Variant
```
Circular: border-radius 50%
Square dimensions: 40x40px
Centered icon
```

---

## ✅ Accessibility Checklist

- [x] ARIA label: "Go back to home page"
- [x] Keyboard navigation (Tab, Enter, Space)
- [x] Focus ring visible (2px primary)
- [x] 44px minimum tap target (mobile)
- [x] WCAG 2.1 AA color contrast
- [x] Screen reader friendly

---

## 🎯 When to Use What

### Use **Button** when:
- Back action is primary navigation
- Mobile-first design
- Need full-width CTA
- Prominent back action needed

### Use **Text Link** when:
- Back action is secondary
- Desktop/sidebar layouts
- Minimal, clean design
- Space is limited

### Use **Icon Button** when:
- Header/toolbar integration
- Very limited space
- Icon communicates clearly
- Minimalist aesthetic

---

## 🚀 Integration Examples

### With React Router
```tsx
import { useNavigate } from 'react-router-dom';

function Page() {
  const navigate = useNavigate();
  return <BackToHome onBack={() => navigate('/')} />;
}
```

### With Next.js
```tsx
import { useRouter } from 'next/router';

function Page() {
  const router = useRouter();
  return <BackToHome onBack={() => router.push('/')} />;
}
```

### With State Management
```tsx
function Page() {
  const setPage = usePageStore(state => state.setPage);
  return <BackToHome onBack={() => setPage('home')} />;
}
```

---

## 🎨 Customization

### Custom Label
```tsx
<BackToHome label="← Back to Dashboard" />
```

### Different Icon
```tsx
<BackToHome icon="home" label="Home" />
```

### No Icon
```tsx
<BackToHome showIcon={false} label="Go back" />
```

### Custom Styling
```tsx
<BackToHome 
  className="bg-primary text-white hover:bg-primary/90"
/>
```

---

## 📱 Responsive Behavior

### Mobile (<640px)
- 44px minimum height
- Full-width option available
- Larger touch targets
- Optional sticky positioning

### Tablet (640-1024px)
- Inline positioning
- Medium spacing
- Standard sizing

### Desktop (>1024px)
- Compact layout
- Near sidebar/header
- Hover effects active

---

## ⚠️ Common Mistakes

### ❌ Don't
```tsx
// Missing onBack handler
<BackToHome />

// Inline style overriding
<BackToHome style={{ background: 'red' }} />
```

### ✅ Do
```tsx
// Provide onBack
<BackToHome onBack={handleNavigation} />

// Use className for custom styles
<BackToHome className="bg-red-500" />
```

---

## 🔍 Troubleshooting

**Icon not showing?**
```tsx
<BackToHome showIcon={true} /> // Default is true
```

**Not sticky on mobile?**
```tsx
<BackToHome sticky={true} />
// Ensure parent has overflow-auto
```

**Not full width on mobile?**
```tsx
<BackToHome fullWidthMobile={true} />
```

**Focus ring not visible?**
```tsx
// Check global CSS for focus-visible resets
// Component uses focus-visible:ring-2
```

---

## 📦 File Locations

- Component: `/components/BackToHome.tsx`
- Documentation: `/components/BackToHome.md`
- Examples: `/components/BackToHomeExamples.tsx`
- Quick Start: `/components/BACK_TO_HOME_QUICK_START.md`

---

## 🎓 Learn More

For detailed documentation, see: `/components/BackToHome.md`

For real-world examples, see: `/components/BackToHomeExamples.tsx`

---

## 💬 Support

Questions? Check:
1. Full documentation in `BackToHome.md`
2. Examples in `BackToHomeExamples.tsx`
3. Component source in `BackToHome.tsx`

---

**Built for Mentara with ❤️**
