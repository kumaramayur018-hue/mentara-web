import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface BackToHomeProps {
  /** Callback function when back button is clicked */
  onBack: () => void;
  
  /** Visual variant of the component */
  variant?: 'button' | 'text-link' | 'icon-button';
  
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  
  /** Custom label text (default: "Back to Home Page") */
  label?: string;
  
  /** Show icon alongside text */
  showIcon?: boolean;
  
  /** Icon to display (arrow or home) */
  icon?: 'arrow' | 'home';
  
  /** Make sticky on mobile */
  sticky?: boolean;
  
  /** Full width on mobile */
  fullWidthMobile?: boolean;
  
  /** Custom className for additional styling */
  className?: string;
}

export function BackToHome({
  onBack,
  variant = 'button',
  size = 'md',
  label = 'Back to Home Page',
  showIcon = true,
  icon = 'arrow',
  sticky = false,
  fullWidthMobile = false,
  className,
}: BackToHomeProps) {
  const IconComponent = icon === 'home' ? Home : ArrowLeft;

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-9 px-3 text-sm',
      icon: 'w-3.5 h-3.5',
      text: 'text-sm',
    },
    md: {
      button: 'h-10 px-4 text-base',
      icon: 'w-4 h-4',
      text: 'text-base',
    },
    lg: {
      button: 'h-11 px-5 text-base',
      icon: 'w-5 h-5',
      text: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  // Button Variant
  if (variant === 'button') {
    return (
      <div
        className={cn(
          'w-full sm:w-auto',
          sticky && 'sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3 sm:py-0 sm:bg-transparent sm:backdrop-blur-none',
          className
        )}
      >
        <Button
          onClick={onBack}
          variant="outline"
          className={cn(
            config.button,
            'gap-2 transition-all duration-200',
            'hover:bg-muted hover:border-muted-foreground/20',
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'active:scale-[0.98]',
            fullWidthMobile ? 'w-full sm:w-auto' : 'w-auto'
          )}
          aria-label="Go back to home page"
        >
          {showIcon && <IconComponent className={config.icon} />}
          <span>{label}</span>
        </Button>
      </div>
    );
  }

  // Icon Button Variant (mobile-friendly circle)
  if (variant === 'icon-button') {
    return (
      <div
        className={cn(
          sticky && 'sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3 sm:py-0 sm:bg-transparent sm:backdrop-blur-none',
          className
        )}
      >
        <Button
          onClick={onBack}
          variant="outline"
          size="icon"
          className={cn(
            config.button,
            'rounded-full transition-all duration-200',
            'hover:bg-muted hover:border-muted-foreground/20',
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'active:scale-[0.98]'
          )}
          aria-label="Go back to home page"
        >
          <IconComponent className={config.icon} />
        </Button>
      </div>
    );
  }

  // Text Link Variant
  return (
    <div
      className={cn(
        'w-full sm:w-auto',
        sticky && 'sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3 sm:py-0 sm:bg-transparent sm:backdrop-blur-none',
        className
      )}
    >
      <button
        onClick={onBack}
        className={cn(
          'group inline-flex items-center gap-2',
          config.text,
          'text-muted-foreground hover:text-foreground',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm',
          'active:opacity-70',
          'min-h-[44px] sm:min-h-0' // Mobile tap target
        )}
        aria-label="Go back to home page"
      >
        {showIcon && (
          <IconComponent 
            className={cn(
              config.icon,
              'transition-transform duration-200 group-hover:-translate-x-1'
            )} 
          />
        )}
        <span className="underline-offset-4 group-hover:underline">
          {label}
        </span>
      </button>
    </div>
  );
}

// Preset Variants for Common Use Cases
export function BackToHomeButton(props: Omit<BackToHomeProps, 'variant'>) {
  return <BackToHome {...props} variant="button" />;
}

export function BackToHomeLink(props: Omit<BackToHomeProps, 'variant'>) {
  return <BackToHome {...props} variant="text-link" />;
}

export function BackToHomeIcon(props: Omit<BackToHomeProps, 'variant'>) {
  return <BackToHome {...props} variant="icon-button" />;
}
