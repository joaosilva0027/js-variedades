import React from 'react';

export interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  monogramOnly?: boolean;
  className?: string;
  iconClassName?: string;
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg 
      viewBox="0 0 1000 1050" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform flex-shrink-0 drop-shadow-sm`}
    >
      <defs>
        {/* Royal Blue Gradient for Letter J and left handle */}
        <linearGradient id="logoRoyalBlue" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#0056eb" />
          <stop offset="50%" stopColor="#0041c4" />
          <stop offset="100%" stopColor="#002f9c" />
        </linearGradient>

        {/* Turquoise Cyan Gradient for Letter S and right handle */}
        <linearGradient id="logoTurquoise" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#00d5fb" />
          <stop offset="50%" stopColor="#00b4d8" />
          <stop offset="100%" stopColor="#009bbd" />
        </linearGradient>

        {/* Swoosh Highlight for J Tail Accent */}
        <linearGradient id="logoTailAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#003db5" />
        </linearGradient>
      </defs>

      {/* BAG HANDLE: Left part (Royal Blue) */}
      <path 
        d="M 494 245 C 494 125, 558 48, 680 48 L 708 48 L 640 142 C 592 152, 568 188, 564 245 Z" 
        fill="url(#logoRoyalBlue)" 
      />

      {/* BAG HANDLE: Right part (Turquoise Cyan) */}
      <path 
        d="M 708 48 C 765 48, 856 108, 856 245 L 784 245 C 784 178, 748 142, 640 142 L 708 48 Z" 
        fill="url(#logoTurquoise)" 
      />

      {/* LETTER J: TOP LEFT HORIZONTAL ARM */}
      <path 
        d="M 340 245 L 582 245 L 556 352 L 340 352 Z" 
        fill="url(#logoRoyalBlue)" 
      />

      {/* LETTER J: MAIN STEM & CURVING HOOK */}
      <path 
        d="M 582 245 L 624 245 L 446 828 C 418 918, 334 956, 240 946 C 165 938, 98 878, 108 775 L 184 712 C 162 798, 208 860, 278 868 C 342 875, 376 832, 396 768 L 556 245 Z" 
        fill="url(#logoRoyalBlue)" 
      />

      {/* LETTER J: LOWER SWOOSH CRESCENT ACCENT */}
      <path 
        d="M 108 775 C 92 848, 134 918, 218 948 C 142 922, 114 852, 134 766 Z" 
        fill="url(#logoTailAccent)" 
      />

      {/* LETTER S: UPPER RIGHT SHOULDER OF BAG */}
      <path 
        d="M 640 245 L 972 245 L 972 482 L 808 482 L 808 352 L 640 352 Z" 
        fill="url(#logoTurquoise)" 
      />

      {/* LETTER S: CENTRAL DIAGONAL (INTERLOCKING WITH J) */}
      <path 
        d="M 448 468 L 626 250 L 692 316 L 538 522 L 808 662 L 746 752 L 448 586 Z" 
        fill="url(#logoTurquoise)" 
      />

      {/* LETTER S: LOWER LOOP & FLAT BOTTOM BASE OF BAG */}
      <path 
        d="M 808 662 L 940 635 L 940 848 C 940 918, 888 946, 808 946 L 365 946 L 365 842 L 790 842 C 824 842, 842 826, 842 796 L 842 748 L 746 752 L 808 662 Z" 
        fill="url(#logoTurquoise)" 
      />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showText = true,
  showTagline = true,
  monogramOnly = false,
  className = '',
  iconClassName = ''
}) => {
  // Size mappings
  const iconSizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20'
  }[size];

  const titleSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg sm:text-2xl',
    lg: 'text-xl sm:text-3xl',
    xl: 'text-2xl sm:text-4xl'
  }[size];

  const taglineSizeClasses = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm'
  }[size];

  if (monogramOnly) {
    return <LogoIcon className={`${iconSizeClasses} ${iconClassName}`} />;
  }

  const isLight = variant === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Monogram Icon Container */}
      <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
        <LogoIcon className={`${iconSizeClasses} ${iconClassName}`} />
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight ${titleSizeClasses} flex items-center gap-1.5`}>
            <span className={isLight ? 'text-white' : 'text-slate-900'}>
              JS
            </span>
            <span className={isLight ? 'text-cyan-400 bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent' : 'text-blue-600 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent'}>
              VARIEDADES
            </span>
          </div>

          {showTagline && (
            <span className={`font-semibold tracking-wider uppercase mt-1 flex items-center gap-1 ${taglineSizeClasses} ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
              Loja Oficial • Achadinhos Virais
            </span>
          )}
        </div>
      )}
    </div>
  );
};
