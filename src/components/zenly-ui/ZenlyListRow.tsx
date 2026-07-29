// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';

export const ZenlyListRow = ({ title, subtitle, icon: _Icon, gradient, delay = 0, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="group relative w-full bg-white/[0.03] backdrop-blur-md rounded-[28px] p-2.5 flex items-center pr-6 shadow-lg border border-white/5 mb-3 cursor-pointer overflow-hidden hover:border-white/10 transition-all duration-300"
        >
            {/* Hover Highlight */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Big Gradient Icon Wrapper */}
            <div className={`relative z-10 w-14 h-14 rounded-[22px] ${gradient} flex items-center justify-center text-white shadow-md shrink-0 mr-4`}>
                <_Icon size={24} strokeWidth={2.5} />
            </div>

            {/* Text Content */}
            <div className="relative z-10 flex flex-col items-start min-w-0">
                <h3 className="font-extrabold text-[15px] font-display text-white leading-tight mb-0.5 truncate w-full">{title}</h3>
                <p className="text-[12px] font-bold text-gray-400 leading-tight truncate w-full">{subtitle}</p>
            </div>
        </motion.div>
    );
};
