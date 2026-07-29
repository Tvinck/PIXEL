import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { MODEL_CATALOG } from '../config/models';
import {
    ChevronLeft, Zap,
    Image as ImageIcon, Video, Music, Wand2,
    Banana, Wind, Layers, PenTool, Sparkles,
    Mic, Type, Eraser, Scissors, Film, User
} from 'lucide-react';
import SEO from '../components/SEO/SEO';

/**
 * CreateView - Modern dark-themed tool selection page
 * Updated design matching the app's premium dark aesthetic
 */

const CreateView = () => {
    const navigate = useNavigate();
    const { stats } = useUser();
    const balance = stats?.current_balance || 0;

    const TOOLS = [
        {
            id: 'ideogram',
            model: 'ideogram_reframe',
            label: 'Ideogram v3',
            desc: 'Текст в Арт',
            icon: Type,
            gradient: 'from-blue-600 to-indigo-700',
            special: true,
            cost: MODEL_CATALOG['ideogram_reframe']?.cost || 20
        },
        {
            id: 'suno',
            model: 'suno_v5',
            label: 'Suno v4.5',
            desc: 'AI Музыка',
            icon: Music,
            gradient: 'from-pink-500 to-rose-600',
            special: true,
            cost: MODEL_CATALOG['suno_v5']?.cost || 10
        },
        {
            id: 'veo',
            model: 'veo_3',
            label: 'Veo 3.1',
            desc: 'Google Video',
            icon: Film,
            gradient: 'from-orange-500 to-red-600',
            cost: MODEL_CATALOG['veo_3']?.cost || 30
        },
        {
            id: 'kling',
            model: 'kling_2_6_text',
            label: 'Kling 2.6',
            desc: 'Avatar & Video',
            icon: User,
            gradient: 'from-emerald-500 to-teal-600',
            cost: MODEL_CATALOG['kling_2_6_text']?.cost || 20
        },
        {
            id: 'recraft',
            model: 'recraft_upscale',
            label: 'Recraft AI',
            desc: 'Векторы и Дизайн',
            icon: Wand2,
            gradient: 'from-blue-400 to-indigo-500',
            cost: MODEL_CATALOG['recraft_upscale']?.cost || 5
        },
        {
            id: 'audio',
            model: 'wan_turbo_speech',
            label: 'ElevenLabs',
            desc: 'Voice & SFX',
            icon: Mic,
            gradient: 'from-cyan-500 to-blue-500',
            cost: MODEL_CATALOG['wan_turbo_speech']?.cost || 5
        },
        {
            id: 'edit',
            model: 'recraft_remove_bg',
            label: 'Удалить фон',
            desc: 'Recraft Tools',
            icon: Eraser,
            gradient: 'from-gray-700 to-gray-800',
            cost: MODEL_CATALOG['recraft_remove_bg']?.cost || 2
        }
    ];

    const handleSelect = (toolId) => {
        const tool = TOOLS.find(t => t.id === toolId);
        if (!tool) return;

        let type = 'image-gen';
        if (tool.id === 'suno' || tool.id === 'audio') type = 'audio-gen';
        else if (tool.id === 'veo' || tool.id === 'kling') type = 'video-gen';
        else if (tool.id === 'animate') type = 'animate-photo';

        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
        navigate(`/generate/${encodeURIComponent(type)}`, { state: { model: tool.model } });
    };

    return (
        <div className="min-h-screen bg-bg-primary text-white pb-28 relative overflow-y-auto w-full selection:bg-[#3390ec]/30 md:max-w-3xl md:mx-auto md:px-6">
            <SEO 
                title="Создать — Bazzar Pixel"
                description="Выбери подходящую нейросеть для генерации изображений, музыки или видео"
            />

            {/* Premium Dynamic Backdrops */}
            <div className="bg-glow-container">
                <div className="bg-glow-blue" />
                <div className="bg-glow-purple" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 backdrop-blur-md bg-bg-primary/75 border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors active:scale-95 duration-200"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <h1 className="text-[17px] tracking-tight font-black font-display text-white">Создать</h1>

                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${balance > 50 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            balance > 10 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="text-[15px] font-bold font-display">{balance}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6">
                {/* Featured Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full aspect-[2/1] rounded-[24px] overflow-hidden mb-6 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-purple-500/10 border border-yellow-500/20 shadow-xl shadow-yellow-500/5 group"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=800')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                    {/* Animated glow */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-500/30 rounded-full blur-[40px] opacity-70 group-hover:scale-110 transition-transform duration-700" />

                    <div className="relative h-full flex flex-col justify-center p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                            <span className="text-[11px] font-extrabold text-yellow-300 uppercase tracking-widest font-display">NEW MODEL</span>
                        </div>
                        <h3 className="text-[24px] tracking-tight font-black text-white leading-tight mb-1 font-display">
                            Nano Banana
                        </h3>
                        <p className="text-[14px] text-gray-300 max-w-[70%] leading-snug">
                            Google Gemini с генерацией реалистичных изображений
                        </p>
                    </div>

                    <Banana className="absolute -right-4 -bottom-4 w-32 h-32 text-yellow-400/25 rotate-[-15deg] group-hover:rotate-[0deg] transition-transform duration-500" />
                </motion.div>

                {/* Section Title */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#3390ec] to-[#a855f7] rounded-full" />
                    <h2 className="text-[18px] tracking-tight font-black font-display text-white">Инструменты</h2>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TOOLS.map((tool, idx) => (
                        <motion.button
                            key={tool.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleSelect(tool.id)}
                            className="group relative bg-white/[0.03] backdrop-blur-md rounded-[24px] p-5 border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 text-left overflow-hidden shadow-lg"
                        >
                            {/* Background gradient on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-all duration-300`} />

                            {/* Glow Indicator */}
                            <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${tool.gradient} rounded-full blur-[20px] opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />

                            {/* Icon */}
                            <div className={`w-11 h-11 rounded-[16px] bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 shadow-md shadow-black/20 group-hover:scale-105 transition-transform duration-300`}>
                                <tool.icon className="w-5 h-5 text-white" />
                            </div>

                            {/* Text */}
                            <h3 className="font-extrabold text-[16px] text-white mb-0.5 tracking-tight font-display">{tool.label}</h3>
                            <p className="text-[13px] text-gray-400 font-medium leading-snug">{tool.desc}</p>

                            {/* Cost badge */}
                            {tool.cost > 0 && !tool.special && (
                                <div className={`absolute top-4 right-4 flex items-center gap-1 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 ${balance >= tool.cost ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400'}`}>
                                    <Zap className="w-[10px] h-[10px] fill-current" />
                                    <span className="text-[11px] font-bold font-display">{tool.cost}</span>
                                </div>
                            )}

                            {/* Special badge */}
                            {tool.special && (
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                    ✨ HOT
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-gradient-to-b from-[#bf5af2] to-[#ec4899] rounded-full" />
                        <h2 className="text-[18px] tracking-tight font-black font-display text-white">Быстрые действия</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Face Swap', icon: '🎭', route: '/design-lab' },
                            { label: 'Шаблоны', icon: '📋', route: '/image-templates' },
                            { label: 'Галерея', icon: '🖼️', route: '/gallery' },
                        ].map((action) => (
                            <motion.button
                                key={action.label}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(action.route)}
                                className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-[20px] py-4 px-3 flex flex-col items-center gap-2 transition-all duration-300 shadow-lg"
                            >
                                <span className="text-2xl filter drop-shadow-md">{action.icon}</span>
                                <span className="text-[13px] font-bold text-gray-300 font-display">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateView;
