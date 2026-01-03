/**
 * BackToHome Component - Usage Examples
 * 
 * This file demonstrates various real-world implementations
 * of the BackToHome component in the Mentara app.
 */

import React from 'react';
import { BackToHome, BackToHomeButton, BackToHomeLink, BackToHomeIcon } from './BackToHome';

// ============================================
// EXAMPLE 1: Chat Page with Sticky Header
// ============================================
export function ChatPageExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky on mobile, static on desktop */}
      <BackToHome 
        onBack={onBack}
        variant="button"
        size="md"
        sticky={true}
        fullWidthMobile={true}
        className="px-4 sm:px-6 lg:px-8"
      />
      
      {/* Chat content below */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl mb-2">Chat Interface</h2>
          <p className="text-muted-foreground">
            Back button is sticky on mobile, static on desktop
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Minimal Header Integration
// ============================================
export function MinimalHeaderExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <BackToHomeIcon onBack={onBack} size="md" />
            <div className="flex-1">
              <h1 className="text-lg font-medium">Settings</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-4">
        {/* Page content */}
      </main>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Sidebar Layout (Desktop)
// ============================================
export function SidebarLayoutExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-border bg-card">
        <div className="p-4 space-y-4">
          <BackToHomeLink 
            onBack={onBack}
            size="sm"
            label="← Dashboard"
          />
          
          {/* Sidebar content */}
          <nav className="space-y-2">
            <div className="px-3 py-2 text-sm">Navigation items...</div>
          </nav>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          <h1 className="text-2xl mb-4">Main Content</h1>
        </div>
      </main>
    </div>
  );
}

// ============================================
// EXAMPLE 4: Mobile-First Chat Interface
// ============================================
export function MobileChatExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile header with back */}
      <header className="flex-shrink-0 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 p-3 sm:p-4">
          <BackToHomeIcon onBack={onBack} size="md" />
          <div className="flex-1 min-w-0">
            <h1 className="font-medium truncate">AI Chatbot</h1>
            <p className="text-xs text-muted-foreground">Always here to listen</p>
          </div>
        </div>
      </header>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-auto p-4">
        <p className="text-center text-muted-foreground">Messages appear here...</p>
      </div>
      
      {/* Chat input */}
      <div className="flex-shrink-0 border-t border-border p-3 sm:p-4">
        <input 
          type="text" 
          placeholder="Type a message..."
          className="w-full px-4 py-2 rounded-full border border-border bg-background"
        />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Profile/Settings Page
// ============================================
export function ProfilePageExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back link at top */}
        <BackToHomeLink 
          onBack={onBack}
          size="sm"
          className="mb-6"
        />
        
        {/* Page content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences
            </p>
          </div>
          
          {/* Settings form */}
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground">Settings content...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Full-Width Mobile Button
// ============================================
export function FullWidthMobileExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 space-y-4">
        {/* Full width on mobile, auto on desktop */}
        <BackToHomeButton 
          onBack={onBack}
          size="lg"
          fullWidthMobile={true}
        />
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl mb-2">Content Area</h2>
          <p className="text-muted-foreground">
            The back button is full-width on mobile devices for easy tapping.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Comparison of All Variants
// ============================================
export function VariantsComparisonExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl mb-6">BackToHome Variants</h1>
        
        {/* Button Variant */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Button Variant</h2>
          <div className="flex flex-wrap gap-4">
            <BackToHome onBack={onBack} variant="button" size="sm" />
            <BackToHome onBack={onBack} variant="button" size="md" />
            <BackToHome onBack={onBack} variant="button" size="lg" />
          </div>
        </div>
        
        {/* Text Link Variant */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Text Link Variant</h2>
          <div className="flex flex-wrap gap-4">
            <BackToHome onBack={onBack} variant="text-link" size="sm" />
            <BackToHome onBack={onBack} variant="text-link" size="md" />
            <BackToHome onBack={onBack} variant="text-link" size="lg" />
          </div>
        </div>
        
        {/* Icon Button Variant */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Icon Button Variant</h2>
          <div className="flex flex-wrap gap-4">
            <BackToHome onBack={onBack} variant="icon-button" size="sm" />
            <BackToHome onBack={onBack} variant="icon-button" size="md" />
            <BackToHome onBack={onBack} variant="icon-button" size="lg" />
          </div>
        </div>
        
        {/* With Home Icon */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">With Home Icon</h2>
          <div className="flex flex-wrap gap-4">
            <BackToHome onBack={onBack} variant="button" icon="home" label="Home" />
            <BackToHome onBack={onBack} variant="text-link" icon="home" label="Return Home" />
            <BackToHome onBack={onBack} variant="icon-button" icon="home" />
          </div>
        </div>
        
        {/* Custom Labels */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Custom Labels</h2>
          <div className="flex flex-wrap gap-4">
            <BackToHome onBack={onBack} variant="button" label="← Back" />
            <BackToHome onBack={onBack} variant="text-link" label="Go back" showIcon={false} />
            <BackToHome onBack={onBack} variant="button" label="Return" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 8: Responsive Layout Showcase
// ============================================
export function ResponsiveShowcaseExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile layout */}
      <div className="lg:hidden">
        <BackToHome 
          onBack={onBack}
          variant="button"
          size="md"
          sticky={true}
          fullWidthMobile={true}
          className="px-4 py-3"
        />
        <div className="p-4">
          <h2 className="text-xl mb-2">Mobile View</h2>
          <p className="text-sm text-muted-foreground">
            Full-width sticky button on mobile devices
          </p>
        </div>
      </div>
      
      {/* Desktop layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-8">
          <BackToHomeLink 
            onBack={onBack}
            size="sm"
            className="mb-6"
          />
          <div>
            <h2 className="text-2xl mb-2">Desktop View</h2>
            <p className="text-muted-foreground">
              Subtle text link on desktop for clean design
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 9: Integration with EnhancedChatInterface
// ============================================
export function ChatIntegrationExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header with back button */}
      <header className="flex-shrink-0 sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-3 sm:px-4">
          {/* Left Section */}
          <div className="flex items-center gap-2">
            <BackToHomeIcon onBack={onBack} size="md" />
            <div className="flex items-center gap-2 ml-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-white text-xs">AI</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-medium leading-none">Mentara AI</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Always here to listen
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Chat messages...</p>
        </div>
      </div>
      
      {/* Composer */}
      <div className="flex-shrink-0 border-t border-border bg-background">
        <div className="max-w-3xl mx-auto p-3 sm:p-4">
          <input 
            type="text" 
            placeholder="Message Mentara AI..."
            className="w-full px-4 py-2 rounded-full border border-border bg-muted/30"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 10: All Presets
// ============================================
export function PresetsExample({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl mb-6">Preset Components</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">BackToHomeButton</h3>
            <BackToHomeButton onBack={onBack} size="md" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">BackToHomeLink</h3>
            <BackToHomeLink onBack={onBack} label="← Back to dashboard" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">BackToHomeIcon</h3>
            <BackToHomeIcon onBack={onBack} />
          </div>
        </div>
      </div>
    </div>
  );
}
