import React from 'react';
import { motion } from 'framer-motion';
import PixelLogo from './ui/PixelLogo';

const LoadingScreen = () => {
    return (
        <div 
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07060f] text-white overflow-hidden"
            style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(30, 110, 230, 0.4) 0%, rgba(15, 30, 90, 0.15) 40%, #07060f 80%)'
            }}
        >
            {/* Dynamic Background Ambient Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/15 blur-[120px] top-[-50px] left-1/2 -translate-x-1/2"
            />

            {/* Logo Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                <motion.div
                    animate={{
                        y: [0, -8, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative flex items-center justify-center"
                >
                    {/* Glow backdrop behind the logo */}
                    <div className="absolute w-24 h-24 rounded-full bg-blue-400/20 blur-xl animate-pulse" />

                    {/* Logo wrapper matching Photo 1 / Photo 3 style */}
                    <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-[#3390ec] to-[#3b82f6] p-0.5 shadow-2xl shadow-blue-500/25 flex items-center justify-center relative overflow-hidden group">
                        {/* Inner bg */}
                        <div className="absolute inset-0.5 bg-gradient-to-tr from-[#1e40af] to-[#3b82f6] rounded-[2.4rem] flex items-center justify-center">
                            <PixelLogo size={72} color="white" eyeColor="#1e3a8a" className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
                        </div>

                        {/* Shimmer effect */}
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                                repeatDelay: 1
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                    </div>
                </motion.div>
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-10 relative z-10 flex flex-col items-center gap-3"
            >
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-blue-400"
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
