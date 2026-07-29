// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

// Refined Physics for "Soft Pillow" feel
const CARD_ENTRY = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring" as const, stiffness: 200, damping: 20 }
    }
};

export const ZenlyCard = ({ children, className = '', delay = 0, title, icon: Icon, color = "blue" }: any) => {

    // Color presets for the icon bubble
    const colorMap: any = {
        blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        orange: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        pink: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
        indigo: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={CARD_ENTRY}
            transition={{ delay: delay }}
            className={`
        relative
        bg-white/[0.03] backdrop-blur-md
        rounded-[28px] 
        p-5
        shadow-xl shadow-black/40
        border border-white/5
        flex flex-col
        ${className}
      `}
        >
            {/* Optional Header Row if Title/Icon provided */}
            {(title || Icon) && (
                <div className="flex items-center gap-3 mb-3">
                    {Icon && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
                            <Icon size={16} strokeWidth={2.5} />
                        </div>
                    )}
                    {title && <h3 className="font-extrabold font-display text-white text-[15px] leading-tight">{title}</h3>}
                </div>
            )}

            <div className="relative z-10 text-gray-400 text-sm leading-relaxed font-medium">
                {children}
            </div>
        </motion.div>
    );
};
