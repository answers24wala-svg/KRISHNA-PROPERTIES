import { motion } from 'motion/react';

interface KPLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  showText?: boolean;
}

export default function KPLogo({ className = 'w-12 h-12', variant = 'color', showText = false }: KPLogoProps) {
  const isLight = variant === 'light';
  const logoFill = isLight ? '#FFFFFF' : 'url(#kpLogoGradient)';
  const windowFill = isLight ? '#EAEAEA' : 'url(#kpLogoGradient)';

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="kpLogoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2E3192" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>

          {/* Mask for the letter K diagonal slash */}
          <mask id="kMask">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            <line 
              x1="18" 
              y1="78" 
              x2="48" 
              y2="48" 
              stroke="black" 
              strokeWidth="3.2" 
              strokeLinecap="butt" 
            />
          </mask>
        </defs>

        {/* 1. Left Roof Piece */}
        <motion.path
          d="M 10 57 L 25 41.25 L 25 49.25 L 17.62 57 Z"
          fill={logoFill}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* 2. Right Roof Piece */}
        <motion.path
          d="M 32 33.9 L 50 15 L 90 57 L 82.38 57 L 50 23 L 32 41.9 Z"
          fill={logoFill}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        />

        {/* 3. Window Grid */}
        <g className="window-panes">
          {/* Top-Left Pane */}
          <motion.rect
            x="45"
            y="34"
            width="4"
            height="4"
            rx="0.5"
            fill={windowFill}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          />
          {/* Top-Right Pane */}
          <motion.rect
            x="51"
            y="34"
            width="4"
            height="4"
            rx="0.5"
            fill={windowFill}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          />
          {/* Bottom-Left Pane */}
          <motion.rect
            x="45"
            y="40"
            width="4"
            height="4"
            rx="0.5"
            fill={windowFill}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          />
          {/* Bottom-Right Pane */}
          <motion.rect
            x="51"
            y="40"
            width="4"
            height="4"
            rx="0.5"
            fill={windowFill}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
          />
        </g>

        {/* 4. Letter K (Group with diagonal slash mask) */}
        <g mask="url(#kMask)">
          {/* Stem & Chimney */}
          <motion.path
            d="M 25 18 L 32 18 L 32 92 L 25 85 Z"
            fill={logoFill}
            initial={{ opacity: 0, scaleY: 0.8 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: "bottom" }}
          />
          {/* Diagonal Arms */}
          <motion.path
            d="M 32 72 L 52 52 L 52 61.5 L 38.5 75 L 52 88.5 L 52 92 Z"
            fill={logoFill}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          />
        </g>

        {/* 5. Letter P */}
        <motion.path
          d="M 58 52 L 75 52 A 11 11 0 0 1 86 63 L 86 63 A 11 11 0 0 1 75 74 L 65 74 L 65 92 L 58 85 Z M 65 59 L 71 59 A 4 4 0 0 1 75 63 L 75 63 A 4 4 0 0 1 71 67 L 65 67 Z"
          fill={logoFill}
          fillRule="evenodd"
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      {showText && (
        <span className={`text-[11px] font-extrabold uppercase tracking-widest font-display text-center ${
          variant === 'light' ? 'text-white' : 'text-brand-primary'
        }`}>
          Krishna Properties
        </span>
      )}
    </div>
  );
}
