import mentaraLogo from 'figma:asset/f2c9e0014fc2366c195cfac71965be700809d93c.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-24',
    xl: 'h-32'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  if (!showText) {
    return (
      <img 
        src={mentaraLogo} 
        alt="Mentara - A guiding star for the mind"
        className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      />
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <img 
        src={mentaraLogo} 
        alt="Mentara Logo"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );
}