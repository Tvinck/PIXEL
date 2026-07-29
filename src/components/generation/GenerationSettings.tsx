import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Music, Check } from 'lucide-react';
import BottomSheet from '../ui/BottomSheet';

const GenerationSettings = ({
    t,
    currentModel,
    currentFamily,
    customValues,
    setCustomValues,
    openDropdown,
    setOpenDropdown,
    itemVariants
}: any) => {
    if (!currentModel) return null;

    return (
        <motion.div variants={itemVariants} className="px-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                {/* Aspect Ratio (primary setting - always visible) */}
                {currentModel.aspectRatios?.length > 0 && (
                    <div>
                        <label className="text-[12px] font-medium text-gray-400 mb-1.5 block">
                            Соотношение сторон
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {currentModel.aspectRatios.map((ar: string) => (
                                <button
                                    key={ar}
                                    onClick={() => setCustomValues((p: any) => ({ ...p, aspect_ratio: ar }))}
                                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                                        (customValues.aspect_ratio || currentModel.aspectRatios[0]) === ar
                                            ? 'bg-[#3390ec]/15 border-[#3390ec]/40 text-[#3390ec]'
                                            : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {ar}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resolution (for Nano Banana Pro) */}
                {currentModel.pricingType === 'resolution' && currentModel.resolutions && (
                    <div>
                        <label className="text-[12px] font-medium text-gray-400 mb-1.5 block">
                            Разрешение
                        </label>
                        <div className="flex gap-1.5">
                            {currentModel.resolutions.map((res: string) => (
                                <button
                                    key={res}
                                    onClick={() => setCustomValues((p: any) => ({ ...p, resolution: res }))}
                                    className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                                        (customValues.resolution || currentModel.defaultResolution || '1K') === res
                                            ? 'bg-[#3390ec]/15 border-[#3390ec]/40 text-[#3390ec]'
                                            : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {res}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video Duration */}
                {currentModel.durations && (
                    <div>
                        <label className="text-[12px] font-medium text-gray-400 mb-1.5 block">
                            Длительность
                        </label>
                        <div className="flex gap-1.5">
                            {currentModel.durations.map((dur: string) => (
                                <button
                                    key={dur}
                                    onClick={() => setCustomValues((p: any) => ({ ...p, duration: dur }))}
                                    className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                                        (customValues.duration || currentModel.durations[0]) === dur
                                            ? 'bg-[#3390ec]/15 border-[#3390ec]/40 text-[#3390ec]'
                                            : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {dur}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Audio toggle (for Veo 3.1) */}
                {currentModel.hasAudio && (
                    <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 col-span-2">
                        <div className="flex items-center gap-2">
                            <Music size={14} className="text-[#3390ec]" />
                            <span className="text-[13px] font-medium text-white">Со звуком</span>
                        </div>
                        <button
                            onClick={() => setCustomValues((p: any) => ({ ...p, audio: !p.audio }))}
                            className={`w-10 h-6 rounded-full transition-all relative border ${
                                customValues.audio
                                    ? 'bg-[#3390ec] border-[#3390ec] shadow-lg shadow-[#3390ec]/20'
                                    : 'bg-white/[0.08] border-white/10'
                            }`}
                        >
                            <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full transition-all ${customValues.audio ? 'left-[21px]' : 'left-[3px]'}`} />
                        </button>
                    </div>
                )}

                {/* Mode selector (for Ideogram) */}
                {currentModel.modes && (
                    <div className="col-span-2">
                        <label className="text-[12px] font-medium text-gray-400 mb-1.5 block">
                            Режим генерации
                        </label>
                        <div className="flex gap-1.5">
                            {currentModel.modes.map((mode: string) => (
                                <button
                                    key={mode}
                                    onClick={() => setCustomValues((p: any) => ({ ...p, mode }))}
                                    className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all capitalize border ${
                                        (customValues.mode || currentModel.modes[0]) === mode
                                            ? 'bg-[#3390ec]/15 border-[#3390ec]/40 text-[#3390ec]'
                                            : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {mode === 'turbo' ? '⚡ Turbo' : mode === 'quality' ? '✨ Quality' : '🎯 Default'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default React.memo(GenerationSettings);
