import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: `
    bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
    text-white shadow-lg shadow-purple-500/20
    border border-white/15
    hover:shadow-purple-500/35 hover:brightness-[1.05]
  `,
  secondary: `
    bg-white/5 border border-white/10
    text-white shadow-md
    hover:bg-white/10
  `,
  glass: `
    bg-white/5 backdrop-blur-xl border border-white/8
    text-white hover:bg-white/10
    shadow-[0_8px_32px_rgba(0,0,0,0.3)]
  `,
  ghost: `
    bg-transparent text-gray-400
    hover:text-white hover:bg-white/5
  `,
  danger: `
    bg-red-500/10 border border-red-500/25
    text-red-400 hover:bg-red-500/20
  `,
};

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-full font-semibold tracking-wide',
  md: 'px-5 py-3 text-sm rounded-xl font-bold',
  lg: 'px-7 py-3.5 text-[15px] rounded-[18px] font-bold tracking-tight',
  full: 'w-full px-6 py-3.5 text-[15px] rounded-[18px] font-bold tracking-tight',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon,
}) => {
  const handleClick = (e) => {
    if (disabled || loading) return;
    
    // Tactile haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2
        transition-all duration-300 font-display
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-[2.5px] border-current 
                        border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="flex items-center justify-center">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
};

export default Button;
