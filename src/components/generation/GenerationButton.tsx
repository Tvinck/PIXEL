import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, X } from 'lucide-react';

const GenerationButton = ({
    cost,
    handleGenerate,
    isProcessing,
    isCanceling,
    cancelCountdown,
    t
}: any) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-gradient-to-t from-black via-black/95 to-transparent pt-8 z-30 pointer-events-none md:max-w-3xl md:mx-auto">
            <div className="pointer-events-auto">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGenerate}
                    disabled={isProcessing && !isCanceling}
                    className={`w-full h-[56px] rounded-2xl font-bold text-[16px] shadow-2xl transition-all relative overflow-hidden
                        ${isCanceling
                            ? 'bg-red-500/15 border-2 border-red-500/40'
                            : isProcessing
                                ? 'bg-white/10 border border-white/10 cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#3390ec] to-[#a855f7] border border-white/10 shadow-[0_0_30px_rgba(51,144,236,0.2)]'
                        }`}
                >
                    {/* Shimmer effect on gradient button */}
                    {!isCanceling && !isProcessing && (
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                            <div
                                className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite]"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                                }}
                            />
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {isCanceling ? (
                            <motion.div
                                key="cancel"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <motion.span
                                    key={cancelCountdown}
                                    initial={{ scale: 1.3, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white text-[14px] font-black"
                                >
                                    {cancelCountdown}
                                </motion.span>
                                <span className="text-red-400 font-bold flex items-center gap-1.5">
                                    <X size={16} />
                                    Нажмите для отмены
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="generate"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <Sparkles size={20} />
                                <span className="text-white font-bold">
                                    {t?.('creation.generate') || 'Создать'}
                                </span>
                                <div className="flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-full">
                                    <Zap size={12} className="fill-amber-300 text-amber-300" />
                                    <span className="text-[13px] font-bold text-amber-200">{cost}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
};

export default React.memo(GenerationButton);
