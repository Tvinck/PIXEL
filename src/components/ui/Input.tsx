import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  icon,
  maxLength,
  multiline = false,
  rows = 3,
  className = '',
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  const inputClass = `
    w-full bg-white/5 border text-white placeholder-gray-500
    px-4 py-3.5 text-[15px] outline-none rounded-2xl
    transition-all duration-300 font-body
    ${icon ? 'pl-11' : ''}
    ${error 
      ? 'border-red-500/40 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
      : focused 
        ? 'border-purple-500/50 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 bg-white/[0.08]' 
        : 'border-white/5 hover:border-white/10'
    }
  `;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest font-display">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 
                           text-gray-500 text-[18px] transition-colors duration-200"
                style={{ color: focused ? 'var(--tg-theme-link-color)' : undefined }}>
            {icon}
          </span>
        )}
        
        {multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={inputClass + ' resize-none'}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={inputClass}
          />
        )}
        
        {/* Tick validation feedback */}
        <AnimatePresence>
          {hasValue && !error && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, y: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%' }}
              exit={{ opacity: 0, scale: 0.5, y: '-50%' }}
              className="absolute right-4 top-1/2 text-green-400 text-sm font-bold"
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex justify-between items-center px-1">
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-red-400 flex items-center gap-1 font-body"
            >
              ⚠️ {error}
            </motion.p>
          )}
          {hint && !error && (
            <p className="text-xs text-gray-500 font-body">{hint}</p>
          )}
        </AnimatePresence>
        
        {maxLength && (
          <p className="text-xs text-gray-500 ml-auto font-body">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default Input;
