# BackToHome - Design Specifications

**Visual design reference for the BackToHome component**

---

## 🎨 Visual Design

### Color Palette

#### Light Mode
```css
/* Button Variant */
--background: transparent
--border: rgba(0, 0, 0, 0.1)
--text: var(--foreground)
--hover-bg: var(--muted)
--hover-border: rgba(0, 0, 0, 0.2)
--focus-ring: var(--primary)

/* Text Link Variant */
--text: var(--muted-foreground)
--hover-text: var(--foreground)
--underline: var(--foreground)
```

#### Dark Mode
```css
/* Button Variant */
--background: transparent
--border: rgba(255, 255, 255, 0.1)
--text: var(--foreground)
--hover-bg: var(--muted)
--hover-border: rgba(255, 255, 255, 0.2)
--focus-ring: var(--primary)

/* Text Link Variant */
--text: var(--muted-foreground)
--hover-text: var(--foreground)
--underline: var(--foreground)
```

---

## 📏 Spacing & Sizing

### Button Variant Measurements

#### Small (sm)
```
Height: 36px (h-9)
Padding: 12px horizontal (px-3)
Icon size: 14px (w-3.5 h-3.5)
Text size: 14px (text-sm)
Gap: 8px (gap-2)
Border radius: 8px (rounded-lg)
```

#### Medium (md) - Default
```
Height: 40px (h-10)
Padding: 16px horizontal (px-4)
Icon size: 16px (w-4 h-4)
Text size: 16px (text-base)
Gap: 8px (gap-2)
Border radius: 8px (rounded-lg)
```

#### Large (lg)
```
Height: 44px (h-11)
Padding: 20px horizontal (px-5)
Icon size: 20px (w-5 h-5)
Text size: 16px (text-base)
Gap: 8px (gap-2)
Border radius: 8px (rounded-lg)
```

### Text Link Variant Measurements

#### Small (sm)
```
Minimum height: auto (desktop), 44px (mobile)
Icon size: 14px (w-3.5 h-3.5)
Text size: 14px (text-sm)
Gap: 8px (gap-2)
Underline offset: 4px
```

#### Medium (md) - Default
```
Minimum height: auto (desktop), 44px (mobile)
Icon size: 16px (w-4 h-4)
Text size: 16px (text-base)
Gap: 8px (gap-2)
Underline offset: 4px
```

#### Large (lg)
```
Minimum height: auto (desktop), 44px (mobile)
Icon size: 20px (w-5 h-5)
Text size: 18px (text-lg)
Gap: 8px (gap-2)
Underline offset: 4px
```

### Icon Button Variant Measurements

#### Small (sm)
```
Width: 36px (w-9)
Height: 36px (h-9)
Icon size: 14px (w-3.5 h-3.5)
Border radius: 50% (rounded-full)
```

#### Medium (md) - Default
```
Width: 40px (w-10)
Height: 40px (h-10)
Icon size: 16px (w-4 h-4)
Border radius: 50% (rounded-full)
```

#### Large (lg)
```
Width: 44px (w-11)
Height: 44px (h-11)
Icon size: 20px (w-5 h-5)
Border radius: 50% (rounded-full)
```

---

## 🎭 States & Interactions

### Button Variant States

#### Default
```css
background: transparent
border: 1px solid rgba(0, 0, 0, 0.1)
color: foreground
cursor: pointer
```

#### Hover
```css
background: muted
border: 1px solid rgba(0, 0, 0, 0.2)
transition: all 200ms ease
```

#### Focus (Keyboard)
```css
outline: none
ring: 2px solid primary
ring-offset: 2px
border-radius: 8px
```

#### Active (Pressed)
```css
transform: scale(0.98)
transition: transform 100ms
```

#### Disabled
```css
opacity: 0.5
cursor: not-allowed
pointer-events: none
```

### Text Link States

#### Default
```css
color: muted-foreground
text-decoration: none
cursor: pointer
```

#### Hover
```css
color: foreground
text-decoration: underline
underline-offset: 4px
icon-transform: translateX(-4px)
transition: all 200ms ease
```

#### Focus (Keyboard)
```css
outline: none
ring: 2px solid primary
ring-offset: 2px
border-radius: 4px
```

#### Active (Pressed)
```css
opacity: 0.7
transition: opacity 100ms
```

---

## 🎬 Animations

### Transitions
```css
/* All interactive elements */
transition-property: all
transition-duration: 200ms
transition-timing-function: ease

/* Icon slide on hover (text-link) */
icon-transform: translateX(-4px)
transition: transform 200ms ease

/* Scale on active */
active-scale: scale(0.98)
transition: transform 100ms
```

### Loading States
```css
/* Optional: Add if implementing async navigation */
button::after {
  content: '';
  animation: spin 600ms linear infinite;
}
```

---

## 📱 Responsive Breakpoints

### Mobile (<640px)
```css
/* Button */
width: 100% (if fullWidthMobile)
height: 44px minimum
padding: 16px
font-size: 16px

/* Text Link */
min-height: 44px
padding: 12px 0
font-size: 16px

/* Icon Button */
width: 44px
height: 44px
```

### Tablet (640px - 1024px)
```css
/* Button */
width: auto
height: 40px
padding: 16px
font-size: 16px

/* Text Link */
min-height: auto
padding: 0
font-size: 16px

/* Icon Button */
width: 40px
height: 40px
```

### Desktop (>1024px)
```css
/* Button */
width: auto
height: 40px
padding: 16px
font-size: 16px

/* Text Link */
min-height: auto
padding: 0
font-size: 14px

/* Icon Button */
width: 40px
height: 40px
```

---

## ♿ Accessibility Specifications

### ARIA Attributes
```html
<button
  aria-label="Go back to home page"
  role="button"
  tabindex="0"
>
  Back to Home Page
</button>
```

### Focus Indicators
```css
/* Visible focus ring */
focus-visible:ring-2
focus-visible:ring-primary
focus-visible:ring-offset-2

/* Ring color matches primary brand */
--ring-color: var(--primary)
```

### Keyboard Navigation
```
Tab: Focus element
Enter: Activate
Space: Activate
Escape: Blur (if in modal/overlay)
```

### Touch Targets
```css
/* Mobile minimum */
min-width: 44px
min-height: 44px
padding: 12px (ensures internal content fits)

/* Tablet/Desktop minimum */
min-width: 40px
min-height: 40px
```

### Color Contrast Ratios
```
Text on background: 4.5:1 (WCAG AA)
Border on background: 3:1 (WCAG AA)
Focus ring: High contrast visible
```

---

## 🎯 Use Case Guidelines

### When to Use Each Variant

#### Button Variant
**Use when:**
- Back action is primary navigation
- Mobile-first design required
- Need prominent, clear CTA
- Full-width button beneficial

**Don't use when:**
- Space is very limited
- Design calls for minimal UI
- Secondary navigation action
- Desktop-only layout

#### Text Link Variant
**Use when:**
- Back action is secondary
- Desktop/sidebar layouts
- Minimal design aesthetic
- Inline with other text

**Don't use when:**
- Primary call-to-action
- Mobile-first design
- Users need clear visual cue
- Accessibility requires prominence

#### Icon Button Variant
**Use when:**
- Space is extremely limited
- Header/toolbar integration
- Icon is universally understood
- Minimalist interface required

**Don't use when:**
- Users unfamiliar with icons
- Text label adds clarity
- Accessibility concerns exist
- Primary navigation on mobile

---

## 🖼️ Layout Examples

### Top-Left Positioning
```css
/* Container */
position: relative
padding: 16px

/* Component placement */
margin-bottom: 24px
```

### Sticky Mobile Header
```css
/* Container */
position: sticky
top: 0
z-index: 10
background: rgba(255, 255, 255, 0.8)
backdrop-filter: blur(8px)
padding: 12px 16px

/* Desktop override */
@media (min-width: 640px) {
  position: static
  background: transparent
  backdrop-filter: none
  padding: 0
}
```

### Header Integration
```css
/* Header container */
display: flex
align-items: center
gap: 12px
padding: 16px

/* Component */
flex-shrink: 0
```

### Sidebar Placement
```css
/* Sidebar */
width: 256px
padding: 16px
border-right: 1px solid border

/* Component */
margin-bottom: 16px
width: 100%
```

---

## 🎨 Theme Tokens

### Mentara Brand Colors
```css
--primary: #4A9B8E (Teal)
--primary-hover: #3d8578
--primary-active: #2f6a5f

/* Dark mode adjustments */
--primary-dark: #5FB3A3
--primary-hover-dark: #4d9e8f
--primary-active-dark: #3b897b
```

### Component-Specific Tokens
```css
/* Light mode */
--btn-bg: transparent
--btn-border: rgba(0, 0, 0, 0.1)
--btn-text: var(--foreground)
--btn-hover-bg: var(--muted)
--btn-hover-border: rgba(0, 0, 0, 0.2)
--btn-focus-ring: var(--primary)

/* Dark mode */
--btn-bg-dark: transparent
--btn-border-dark: rgba(255, 255, 255, 0.1)
--btn-text-dark: var(--foreground)
--btn-hover-bg-dark: var(--muted)
--btn-hover-border-dark: rgba(255, 255, 255, 0.2)
--btn-focus-ring-dark: var(--primary-dark)
```

---

## 📐 Grid & Spacing System

### Component Spacing
```css
/* Margin from content */
margin-bottom: 24px (sm:mb-6)

/* Padding inside sticky container */
padding: 12px 16px (sm:p-0)

/* Gap between icon and text */
gap: 8px (gap-2)
```

### Container Max-Width
```css
/* Full width on mobile */
width: 100%

/* Auto on tablet/desktop */
sm:width: auto
sm:max-width: 300px
```

---

## ✨ Best Practices

### DO ✅
- Use consistent sizing across app
- Provide clear visual feedback
- Maintain 44px touch targets on mobile
- Test with keyboard navigation
- Verify color contrast ratios
- Use appropriate variant for context
- Add loading states for async navigation

### DON'T ❌
- Mix multiple variants on same page
- Override core accessibility features
- Use small sizes on mobile
- Remove focus indicators
- Ignore responsive breakpoints
- Use icon-only without aria-label
- Override semantic HTML structure

---

## 📊 Performance Metrics

### Target Metrics
```
First paint: <100ms
Interaction ready: <100ms
Hover feedback: <16ms (60fps)
Click response: <100ms
Animation duration: 200ms
Transition timing: ease
```

### Optimization
```
- Uses CSS transitions (GPU accelerated)
- No JavaScript animations
- Minimal re-renders
- Pure component pattern
- Tree-shakeable icons
```

---

## 🔄 Version History

**v1.0** - Initial release
- Button, Text Link, Icon Button variants
- Responsive design
- Accessibility features
- Theme support
- Full documentation

---

**Design System Compliance**: ✅ Mentara Design System v1.0
**Last Updated**: December 2024
**Maintained By**: Mentara Design Team
