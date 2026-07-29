import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  glass: 'glass-card',
  solid: 'bg-bg-secondary/70 border border-white/5 shadow-xl shadow-black/25',
  gradient: `
    bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 
    backdrop-blur-xl border border-purple-500/15 
    shadow-[0_8px_30px_rgba(168,85,247,0.06)]
  `,
};

const Card = ({ 
  children, 
  variant = 'glass',
  className = '',
  onClick,
  padding = true,
  hoverable = true,
}) => {
  const handleClick = (e) => {
    if (!onClick) return;
    
    // Tactile haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    
    onClick(e);
  };

  const isClickable = !!onClick;

  return (
    <motion.div
      onClick={isClickable ? handleClick : undefined}
      whileHover={isClickable && hoverable ? { scale: 1.015, y: -2 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        relative overflow-hidden rounded-[24px] transition-all duration-300
        ${variants[variant]}
        ${padding ? 'p-5' : ''}
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
