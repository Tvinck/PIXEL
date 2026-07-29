// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZenlyButton } from '../components/zenly-ui/ZenlyButton';
import { ZenlyListRow } from '../components/zenly-ui/ZenlyListRow';
import { ZenlyNav } from '../components/zenly-ui/ZenlyNav';
import { ZenlySegmentedControl } from '../components/zenly-ui/ZenlySegmentedControl';
import { ZenlyCoin } from '../components/zenly-ui/ZenlyCoin';
import { MagicOrb } from '../components/zenly-ui/MagicOrb';
import { IconImageGen, IconTextWork, IconSmartSearch, IconPhotoAnim, IconVideoGen, IconMusic, IconEraser, LogoMidjourney, LogoFlux, LogoKling, LogoLuma, LogoGemini } from '../components/zenly-ui/QualityIcons';
import { MessageCircle, Zap, X } from 'lucide-react';

import Onboarding from '../components/Onboarding';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import SEO from '../components/SEO/SEO';

const DesignLabView = ({ onOpenPayment, onOpenInpainting, onOpenFaceSwap }: any) => {
    const navigate = useNavigate();
    const { stats, isLoading } = useUser();
    const [activeTab, setActiveTab] = useState('scenarios');
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    return (
        <div className="min-h-screen bg-bg-primary text-white font-sans overflow-x-hidden relative selection:bg-[#3390ec]/30">
            <SEO 
                title="Лаборатория дизайна — Bazzar Pixel"
                description="Сценарии генерации и популярные нейросети в одном приложении"
            />

            {/* Premium Dynamic Backdrops */}
            <div className="bg-glow-container">
                <div className="bg-glow-blue" />
                <div className="bg-glow-purple" />
            </div>

            {/* Top Bar: Credits & Help */}
            <div className="fixed top-0 left-0 right-0 z-50 px-5 pt-8 flex justify-between items-start pointer-events-none">

                {/* Help Button (Left) */}
                <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileTap={{ scale: 0.9 }}
                    className="pointer-events-auto w-11 h-11 bg-white/[0.03] backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/5 text-white font-black text-lg hover:bg-white/[0.08]"
                    onClick={() => setIsHelpOpen(true)}
                >
                    ?
                </motion.button>

                {/* Balance Button (Right) */}
                <motion.button
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="pointer-events-auto group flex items-center gap-2.5 bg-white/[0.03] backdrop-blur-md border border-white/5 shadow-lg rounded-[32px] pl-3 pr-1.5 py-1.5"
                    onClick={() => {
                        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
                        onOpenPayment && onOpenPayment();
                    }}
                >
                    {/* Coin Icon */}
                    <div className="relative z-10">
                        <ZenlyCoin size={42} />
                    </div>

                    <div className="flex flex-col items-start leading-none mr-3 ml-0.5">
                        <span className="text-[10px] text-gray-400 font-extrabold font-display tracking-wider uppercase scale-y-90 origin-left">БАЛАНС</span>
                        <span className="text-[17px] font-black text-white font-mono tracking-tight leading-none">
                            {isLoading ? '...' : (stats?.current_balance || 0).toLocaleString()}
                        </span>
                    </div>

                    {/* SUPER 3D Plus Orb */}
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className="relative w-12 h-12 -my-2 -mr-1 rounded-full bg-gradient-to-b from-[#3390ec] via-[#a855f7] to-[#ec4899] shadow-[0_8px_16px_rgba(168,85,247,0.3),0_2px_4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-4px_6px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer border-[3px] border-[#07060f]"
                    >
                        {/* Glossy Reflection (Top) */}
                        <div className="absolute top-[10%] left-[15%] w-[70%] h-[35%] bg-gradient-to-b from-white to-transparent opacity-40 rounded-full blur-[1px]"></div>

                        {/* Reflected Light (Bottom) */}
                        <div className="absolute bottom-[10%] inset-x-[20%] h-[20%] bg-gradient-to-t from-white/20 to-transparent opacity-40 rounded-full blur-[2px]"></div>

                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md relative z-10">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </motion.div>
                </motion.button>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen pb-32">

                {/* Header Section with ORB */}
                {/* Header Section */}
                <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center w-full max-w-md mx-auto">

                    {/* Restored Magic Orb */}
                    <div className="mb-6 transform hover:scale-105 transition-transform duration-500 cursor-pointer">
                        <MagicOrb />
                    </div>

                    <h2 className="text-[28px] font-black font-display text-white leading-tight mb-8 text-left w-full pl-2">
                        {activeTab === 'scenarios' ? 'Иди по готовому пути' : 'Выбери мощь AI'} <br />
                        <span className="text-gray-400">{activeTab === 'scenarios' ? 'или спроси напрямую' : 'для своих задач'}</span>
                    </h2>

                    {/* Segmented Control */}
                    <ZenlySegmentedControl
                        activeId={activeTab}
                        options={[
                            { id: 'scenarios', label: 'сценарии' },
                            { id: 'neural', label: 'нейросети' }
                        ]}
                        onChange={setActiveTab}
                    />
                </div>

                {/* List Content */}
                <div className="px-5 pb-32 flex flex-col w-full max-w-md mx-auto min-h-[400px]">

                    <div className="mb-2 pl-2">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest opacity-60">
                            {activeTab === 'scenarios' ? 'Популярное' : 'Доступные модели'}
                        </p>
                    </div>

                    {activeTab === 'scenarios' ? (
                        <>
                            <ZenlyListRow
                                delay={0.1}
                                title="генерация изображений"
                                subtitle="арт, дизайн, визуализация"
                                icon={IconImageGen}
                                gradient="bg-gradient-to-tr from-[#00C6FF] to-[#0072FF]"
                                onClick={() => navigate('/image-templates')}
                            />

                            <ZenlyListRow
                                delay={0.2}
                                title="работа с текстом"
                                subtitle="придумать, сократить и проверить"
                                icon={IconTextWork}
                                gradient="bg-gradient-to-tr from-[#FFA500] to-[#FF5E00]"
                                onClick={() => {}}
                            />

                            <ZenlyListRow
                                delay={0.3}
                                title="умный веб-поиск"
                                subtitle="ответы с глубокой аналитикой"
                                icon={IconSmartSearch}
                                gradient="bg-gradient-to-tr from-[#56ab2f] to-[#a8e063]"
                                onClick={() => {}}
                            />

                            <ZenlyListRow
                                delay={0.4}
                                title="оживление фото"
                                subtitle="анимация статичных изображений"
                                icon={IconPhotoAnim}
                                gradient="bg-gradient-to-tr from-[#FF9966] to-[#FF5E62]"
                                onClick={() => onOpenFaceSwap && onOpenFaceSwap()}
                            />

                            <ZenlyListRow
                                delay={0.45}
                                title="поздравления от звезд"
                                subtitle="видео с озвучкой от знаменитостей"
                                icon={IconVideoGen}
                                gradient="bg-gradient-to-tr from-[#FFD700] to-[#FF8C00]"
                                onClick={() => navigate('/star-greetings')}
                            />

                            <ZenlyListRow
                                delay={0.5}
                                title="генерация реалистичных видео"
                                subtitle="профессиональные ролики с озвучкой"
                                icon={IconVideoGen}
                                gradient="bg-gradient-to-tr from-[#11998e] to-[#38ef7d]"
                                onClick={() => {}}
                            />

                            <ZenlyListRow
                                delay={0.6}
                                title="генерация трека"
                                subtitle="музыка по твоему запросу"
                                icon={IconMusic}
                                gradient="bg-gradient-to-tr from-[#8E2DE2] to-[#4A00E0]"
                                onClick={() => {}}
                            />

                            <ZenlyListRow
                                delay={0.7}
                                title="удаление фона"
                                subtitle="убери лишнее с фото за секунды"
                                icon={IconEraser}
                                gradient="bg-gradient-to-tr from-[#DA4453] to-[#89216B]"
                                onClick={() => onOpenInpainting && onOpenInpainting()}
                            />
                        </>
                    ) : (
                        <>
                            {/* Neural Networks List - REAL LOGOS */}
                            <ZenlyListRow
                                delay={0.1}
                                title="Midjourney V6"
                                subtitle="Лучшая генерация изображений"
                                icon={LogoMidjourney}
                                gradient="bg-gradient-to-tr from-stone-800 to-black"
                                onClick={() => {}}
                            />

                            <ZenlyListRow
                                delay={0.2}
                                title="Flux.1 Pro"
                                subtitle="Фотореализм нового поколения"
                                icon={LogoFlux}
                                gradient="bg-gradient-to-tr from-blue-600 to-indigo-700"
                                onClick={() => {}}
                            />

                            <ZenlyListRow
                                delay={0.3}
                                title="Kling AI"
                                subtitle="Мощнейшая видео-модель"
                                icon={LogoKling}
                                gradient="bg-gradient-to-tr from-emerald-600 to-teal-800"
                                onClick={() => {}}
                            />

                            <ZenlyListRow
                                delay={0.4}
                                title="Luma Dream Machine"
                                subtitle="Креативное видео из текста"
                                icon={LogoLuma}
                                gradient="bg-gradient-to-tr from-pink-500 to-rose-600"
                                onClick={() => {}}
                            />

                            <ZenlyListRow
                                delay={0.5}
                                title="Gemini 1.5 Pro"
                                subtitle="Умнейший текстовый ассистент"
                                icon={LogoGemini}
                                gradient="bg-gradient-to-tr from-blue-500 to-yellow-500"
                                onClick={() => {}}
                            />
                        </>
                    )}
                </div>

                {/* Bottom Input Removed */}

                <ZenlyNav />

            </div>

            {/* HELP MODAL (Bottom Sheet) */}
            <AnimatePresence>
                {isHelpOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHelpOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] cursor-pointer"
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0c0a18] rounded-t-[32px] overflow-hidden border-t border-white/10 shadow-2xl"
                        >
                            <div className="p-6 pb-12 flex flex-col gap-6">
                                {/* Handle & Close */}
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black font-display text-white tracking-tight">Что вас интересует?</h3>
                                    <button
                                        onClick={() => setIsHelpOpen(false)}
                                        className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors border border-white/5"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">

                                    {/* Button 1: Intro */}
                                    <button
                                        onClick={() => {
                                            setIsHelpOpen(false);
                                            setShowOnboarding(true);
                                        }}
                                        className="flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-[24px] active:scale-98 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-[#3390ec] border border-blue-500/25">
                                            <Zap size={24} fill="currentColor" className="opacity-80" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[17px] font-bold font-display text-white leading-tight">Что тут можно сделать?</span>
                                            <span className="text-[13px] font-semibold text-gray-400 leading-tight mt-0.5">Вводный курс и возможности AI</span>
                                        </div>
                                    </button>

                                    {/* Button 2: Support */}
                                    <button
                                        onClick={() => window.open('https://t.me/BAZZAR_HELP', '_blank')}
                                        className="flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-[24px] active:scale-98 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-emerald-400 border border-green-500/25">
                                            <MessageCircle size={24} fill="currentColor" className="opacity-80" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[17px] font-bold font-display text-white leading-tight">Написать в поддержку</span>
                                            <span className="text-[13px] font-semibold text-gray-400 leading-tight mt-0.5">Перейти в Telegram чат</span>
                                        </div>
                                    </button>

                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Onboarding Flow */}
            <AnimatePresence>
                {showOnboarding && (
                    <Onboarding onComplete={() => setShowOnboarding(false)} />
                )}
            </AnimatePresence>

        </div>
    );
};

export default DesignLabView;
