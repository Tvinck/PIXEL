import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import BottomSheet from '../ui/BottomSheet';

const PromptInput = ({
    inputs,
    setInputs,
    t,
    showPromptHistory,
    setShowPromptHistory,
    recentPrompts,
    handleEnhancePrompt,
    isEnhancing,
    PRESET_STYLES,
    handleAddPreset,
    playClick,
    itemVariants
}: any) => {
    return (
        <motion.div variants={itemVariants} className="px-4">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl p-4 relative shadow-lg overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3390ec]/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Textarea */}
                <div className="relative z-10">
                    <textarea
                        placeholder={t('creation.placeholder') || 'Опишите, что хотите создать...'}
                        value={inputs.prompt || ''}
                        onChange={e => setInputs({ ...inputs, prompt: e.target.value })}
                        className="w-full bg-transparent rounded-xl p-3 text-white text-[15px] placeholder:text-gray-500 resize-none outline-none min-h-[90px] leading-relaxed transition-all"
                    />

                    {/* Recent prompts button */}
                    {recentPrompts?.length > 0 && (
                        <button
                            onClick={() => { setShowPromptHistory(true); playClick(); }}
                            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <Clock size={14} />
                        </button>
                    )}

                    <BottomSheet
                        isOpen={showPromptHistory && recentPrompts.length > 0}
                        onClose={() => setShowPromptHistory(false)}
                        title="История промптов"
                    >
                        <div className="space-y-1">
                            {recentPrompts?.map((p: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setInputs({ ...inputs, prompt: p });
                                        setShowPromptHistory(false);
                                    }}
                                    className="w-full text-left px-4 py-3.5 text-[14px] text-white border-b border-white/5 last:border-none hover:bg-white/5 transition-colors line-clamp-2"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </BottomSheet>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/5">
                    {/* AI Enhance button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing || !inputs.prompt?.trim()}
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5
                            ${inputs.prompt?.trim()
                                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 hover:text-white'
                                : 'bg-white/[0.02] border border-white/5 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isEnhancing ? (
                            <><span className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" /> Улучшаю...</>
                        ) : (
                            <><Sparkles size={12} /> Улучшить с AI</>
                        )}
                    </motion.button>

                    {/* Preset style tags */}
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        {PRESET_STYLES?.map((style: any) => (
                            <button
                                key={style.id}
                                onClick={() => handleAddPreset(style.prompt)}
                                className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/5 text-[12px] font-medium text-gray-300 whitespace-nowrap hover:bg-white/[0.08] hover:text-white transition-all"
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(PromptInput);
