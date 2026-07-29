// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

const JELLY_TRANSITION = { type: "spring" as const, stiffness: 450, damping: 15 };

export const ZenlyButton = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false
}: any) => {

    const triggerHaptic = () => {
        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    };

    const styles: any = {
        primary: 'bg-white/[0.03] backdrop-blur-md text-white border border-white/5 hover:bg-white/[0.06] shadow-lg shadow-black/20',
        action: 'bg-gradient-to-tr from-[#3390ec] to-[#a855f7] text-white shadow-lg shadow-[#3390ec]/20 border border-white/10',
        glass: 'bg-white/5 backdrop-blur-md text-white border border-white/5'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={JELLY_TRANSITION}
            onClick={(e) => { !disabled && triggerHaptic(); onClick && onClick(e); }}
            className={`
        relative overflow-hidden
        py-4 px-6 rounded-[24px] 
        font-bold text-[15px] tracking-wide
        flex items-center justify-center gap-3
        disabled:opacity-50
        ${styles[variant] || styles.primary}
        ${className}
      `}
        >
            {children}
        </motion.button>
    );
};
