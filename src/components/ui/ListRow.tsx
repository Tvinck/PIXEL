import React from 'react';
import { motion } from 'framer-motion';

interface ListRowProps {
  icon?: any;
  iconColor?: string;
  title?: any;
  label?: any;
  subtitle?: any;
  subtext?: any;
  value?: any;
  onClick?: any;
  chevron?: boolean;
  badge?: any;
  danger?: boolean;
  isLast?: boolean;
}

const ListRow: React.FC<ListRowProps> = ({
  icon,
  iconColor = 'bg-white/5',
  title,
  label,
  subtitle,
  subtext,
  value,
  onClick,
  chevron = true,
  badge,
  danger = false,
  isLast = false,
}) => {
  const displayTitle = title || label;
  const displaySubtitle = subtitle || subtext;

  const handleClick = (e) => {
    if (!onClick) return;
    
    // Tactile haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    
    onClick(e);
  };

  return (
    <motion.div
      whileTap={onClick ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' } : undefined}
      onClick={onClick ? handleClick : undefined}
      className={`
        flex items-center gap-3 px-4 py-3.5
        transition-colors duration-200 relative
        ${onClick ? 'cursor-pointer' : ''}
        ${danger ? 'text-red-400' : 'text-white'}
      `}
    >
      {/* Icon with customizable backdrop */}
      {icon && (
        <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center text-[16px] flex-shrink-0 border border-white/5 shadow-inner`}>
          {icon}
        </div>
      )}
      
      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-semibold truncate font-display ${danger ? 'text-red-400' : 'text-white'}`}>
          {displayTitle}
        </p>
        {displaySubtitle && (
          <p className="text-[12px] text-gray-500 truncate mt-0.5 font-body">
            {displaySubtitle}
          </p>
        )}
      </div>
      
      {/* Right-aligned content */}
      <div className="flex items-center gap-2 flex-shrink-0 font-body">
        {badge && (
          <span className="px-2 py-0.5 bg-[#a855f7]/20 text-[#c084fc] text-[11px] font-bold rounded-full border border-[#a855f7]/10">
            {badge}
          </span>
        )}
        {value && (
          <span className="text-[14px] font-semibold text-gray-400">{value}</span>
        )}
        {chevron && onClick && (
          <span className="text-gray-600 text-base font-bold pl-0.5">›</span>
        )}
      </div>

      {/* Underline separator */}
      {!isLast && (
        <div className="absolute bottom-0 left-16 right-4 h-[1px] bg-white/5" />
      )}
    </motion.div>
  );
};

export default ListRow;
