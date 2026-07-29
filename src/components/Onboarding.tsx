import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Zap, Image, Video, Music, Trophy, Gift, ArrowRight, Check } from 'lucide-react';
import { useSound } from '../context/SoundContext';

const Onboarding = ({ onComplete }) => {
    const { playClick, playSuccess } = useSound();
    const [step, setStep] = useState(0);

    const slides = [
        {
            id: 'welcome',
            icon: (
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 0.95, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                    <Sparkles size={40} className="text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                </motion.div>
            ),
            title: "Добро пожаловать!",
            desc: "Pixel AI — ваша творческая студия в кармане. Создавайте шедевры за секунды.",
            bg: "from-indigo-600 to-purple-600",
            glowColor: "#6366f1",
            buttonText: "Начать",
            showSkip: true
        },
        {
            id: 'features',
            icon: (
                <motion.div
                    animate={{ y: [0, -4, 4, 0], scale: [1, 1.05, 0.95, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                    <Zap size={40} className="text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                </motion.div>
            ),
            title: "Всё в одном",
            desc: "Генерация изображений, видео, музыки и анимации. Никаких границ для вашей фантазии.",
            bg: "from-blue-600 to-cyan-600",
            glowColor: "#06b6d4",
            content: (
                <div className="grid grid-cols-3 gap-3 w-full py-2">
                    {[
                        { icon: <Image size={24} />, label: "Арт", color: "text-violet-400", bg: "bg-violet-500/5 hover:bg-violet-500/10 border-violet-500/10 hover:border-violet-500/20" },
                        { icon: <Video size={24} />, label: "Видео", color: "text-pink-400", bg: "bg-pink-500/5 hover:bg-pink-500/10 border-pink-500/10 hover:border-pink-500/20" },
                        { icon: <Music size={24} />, label: "Звук", color: "text-amber-400", bg: "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/20" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            className={`flex flex-col items-center gap-2.5 p-3.5 rounded-2xl ${item.bg} border backdrop-blur-sm transition-all duration-300`}
                        >
                            <div className={`${item.color} p-2 bg-white/5 rounded-xl`}>
                                {item.icon}
                            </div>
                            <span className="text-[12px] font-bold text-white/80">{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            ),
            buttonText: "Далее"
        },
        {
            id: 'rewards',
            icon: (
                <motion.div
                    animate={{ y: [0, -5, 0], rotate: [0, -6, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                    <Trophy size={40} className="text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                </motion.div>
            ),
            title: "Играй и Получай",
            desc: "Выполняйте задания, повышайте уровень и получайте бесплатные кредиты каждый день.",
            bg: "from-amber-600 to-orange-600",
            glowColor: "#f59e0b",
            buttonText: "Круто!"
        },
        {
            id: 'gift',
            icon: (
                <motion.div
                    animate={{ rotate: [0, -8, 8, -8, 8, 0], scale: [1, 1.05, 0.95, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                    <Gift size={40} className="text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                </motion.div>
            ),
            title: "Ваш подарок",
            desc: "Мы начислили вам стартовый бонус для первых экспериментов.",
            bg: "from-emerald-600 to-teal-600",
            glowColor: "#10b981",
            buttonText: "Забрать 20 кредитов",
            isFinal: true
        }
    ];

    const handleNext = () => {
        playClick();
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = () => {
        playSuccess();
        localStorage.setItem('pixel_onboarding_complete', 'true');
        onComplete();
    };

    const currentSlide = slides[step];

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#070514]/70 backdrop-blur-xl"
            />

            {/* Interactive Card */}
            <motion.div
                initial={{ y: 150, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="relative w-full max-w-sm bg-[#0c0a20]/95 border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl shadow-purple-950/20 flex flex-col max-h-[90vh] z-10"
            >
                {/* Drag Handle (Mobile Visual) */}
                <div className="absolute top-2 left-0 right-0 h-4 flex justify-center items-center z-20 sm:hidden pointer-events-none">
                    <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Shifting Glow Background behind the icon */}
                <div className="relative h-44 flex items-center justify-center overflow-hidden z-10 pt-4">
                    {/* Background Radial Glow */}
                    <div
                        className="absolute inset-0 transition-all duration-700 pointer-events-none"
                        style={{
                            background: `radial-gradient(circle at center, ${currentSlide.glowColor}25 0%, transparent 65%)`,
                            filter: 'blur(15px)',
                        }}
                    />
                    {/* Glowing Accent Orb */}
                    <div
                        className="absolute w-36 h-36 rounded-full opacity-30 transition-all duration-700"
                        style={{
                            background: `radial-gradient(circle, ${currentSlide.glowColor} 0%, transparent 70%)`,
                            filter: 'blur(30px)',
                        }}
                    />

                    {/* Animated Icon Wrapper */}
                    <motion.div
                        key={step}
                        initial={{ scale: 0, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", damping: 18, stiffness: 180 }}
                        className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md relative z-10"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-2xl -z-10" />
                        {currentSlide.icon}
                    </motion.div>

                    {/* Skip Button */}
                    {currentSlide.showSkip && (
                        <button
                            onClick={completeOnboarding}
                            className="absolute top-6 right-6 text-white/50 hover:text-white/90 text-[13px] font-semibold tracking-wide py-1 px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full backdrop-blur-sm transition-all duration-300 z-30 cursor-pointer"
                        >
                            Пропустить
                        </button>
                    )}
                </div>

                {/* Content Area with smooth slide transitions */}
                <div className="px-6 pb-8 flex flex-col items-center text-center relative z-10">
                    <div className="min-h-[140px] flex flex-col justify-start items-center w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 25, filter: "blur(4px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: -25, filter: "blur(4px)" }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="w-full flex flex-col items-center gap-2"
                            >
                                <h2 className="text-[25px] font-display font-extrabold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent leading-tight">
                                    {currentSlide.title}
                                </h2>

                                <p className="text-[14px] text-slate-400 font-medium leading-relaxed font-body max-w-[280px]">
                                    {currentSlide.desc}
                                </p>

                                {currentSlide.content && (
                                    <div className="w-full mt-2">
                                        {currentSlide.content}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Indicators */}
                    <div className="flex gap-2 my-6 justify-center items-center">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step
                                    ? `w-6 bg-gradient-to-r ${currentSlide.bg} shadow-md shadow-${currentSlide.glowColor}/20`
                                    : 'w-1.5 bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Action Button */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleNext}
                        className={`w-full py-4 rounded-xl font-bold text-[16px] text-white shadow-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${currentSlide.bg} relative overflow-hidden`}
                        style={{
                            boxShadow: `0 8px 25px -4px ${currentSlide.glowColor}40`
                        }}
                    >
                        <span className="relative z-10">{currentSlide.buttonText}</span>
                        <motion.div
                            className="relative z-10"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                            {currentSlide.isFinal ? <Check size={18} /> : <ArrowRight size={18} />}
                        </motion.div>
                        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
