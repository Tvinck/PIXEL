// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ZenlySegmentedControl = ({ options, activeId, onChange }) => {
    return (
        <div className="flex bg-white/[0.03] backdrop-blur-md p-1 rounded-full border border-white/5 relative w-full h-12">
            {options.map((opt) => {
                const isActive = activeId === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`flex-1 relative z-10 font-bold text-sm tracking-wide transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400'}`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="segment-pill"
                                className="absolute inset-0 bg-white/10 rounded-full border border-white/5 shadow-md"
                                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            />
                        )}
                        <span className="relative z-10">{opt.label}</span>
                    </button>
                )
            })}
        </div>
    );
};
