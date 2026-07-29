import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Image as ImageIcon, Video, Send, Zap, ChevronRight, Search, Sparkles,
    ChevronDown, MessageSquare
} from 'lucide-react';
import { usePublicCreations, useTemplates } from '../hooks/useGallery';
import SEO from '../components/SEO/SEO';
import { useUser } from '../context/UserContext';
import { templatesData } from '../data/templates';
import { SpringCounter } from '../components/SpringAnimations';
import { useLanguage } from '../context/LanguageContext';
import { useABTest } from '../hooks/useABTest';
import { useMarketing } from '../hooks/useMarketing';
import { getCDNUrl } from '../hooks/useCDN';

const triggerHaptic = (style = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 350, damping: 25 } }
};

const ToolIcon = ({ icon: Icon, label, onClick, color }: any) => (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform"
    >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300 border border-white/10`}>
            <Icon size={22} className="text-white" />
        </div>
        <span className="text-xs font-display font-bold text-gray-400 group-hover:text-white transition-colors">{label}</span>
    </button>
);

const HomeView = ({ onLoadComplete, onOpenCreation, onOpenTemplate, onOpenPayment }: any) => {
    const navigate = useNavigate();
    const { user, stats } = useUser();
    const { t } = useLanguage();
    const { variant } = useABTest('home_hero_text');
    const { trackFunnel } = useMarketing(user);

    const { isLoading: isFeedLoading } = usePublicCreations({ sortBy: 'trending', limit: 10 });
    const { data: templates, isLoading: isTemplatesLoading } = useTemplates();
    const [searchQuery, setSearchQuery] = useState('');

    // PC specific states
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedModel, setSelectedModel] = useState('ChatGPT 5.4');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    const finalTemplates = templates?.length > 0 ? templates : (templatesData || []).slice(0, 10);

    useEffect(() => {
        if (!isFeedLoading && !isTemplatesLoading) {
            onLoadComplete && onLoadComplete();
            trackFunnel('onboarding', 'landing');
        }
    }, [isFeedLoading, isTemplatesLoading, onLoadComplete, trackFunnel]);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            triggerHaptic('light');
            navigate('/chat/private', { state: { initialMessage: searchQuery.trim() } });
        }
    };

    const categories = [
        { id: 'all', label: 'Популярные' },
        { id: 'image', label: 'Изображения' },
        { id: 'text', label: 'Текст' },
        { id: 'video', label: 'Видео и аудио' },
        { id: 'free', label: 'Бесплатные' }
    ];

    const NEURAL_NETWORKS = [
        {
            id: 'pixel-ai-chat',
            title: 'Pixel AI Chat',
            description: 'Универсальный AI-помощник для решения любых задач и ответов на вопросы',
            cost: 30,
            rating: 4.90,
            users: '42 150',
            category: 'text',
            iconColor: 'bg-gradient-to-tr from-[#3390ec] to-[#a855f7]',
            icon: Sparkles,
            onClick: () => navigate('/chat/private')
        },
        {
            id: 'nano-banana-pro',
            title: 'Nano Banana Pro',
            description: 'Лучшая нейросеть для генерации изображений',
            cost: 55,
            rating: 4.90,
            users: '93 688',
            category: 'image',
            iconColor: 'bg-gradient-to-tr from-[#ff4500] via-[#ffaa00] to-[#ffcc00]',
            icon: ImageIcon,
            onClick: () => onOpenCreation && onOpenCreation('image-gen')
        },
        {
            id: 'chatgpt-5',
            title: 'ChatGPT 5.4',
            description: 'Новейшая нейросеть от OpenAI',
            cost: 35,
            rating: 4.80,
            users: '17 124',
            category: 'text',
            iconColor: 'bg-[#10a37f]',
            icon: MessageSquare,
            onClick: () => navigate('/chat/private')
        },
        {
            id: 'video-gen',
            title: 'Генератор видео',
            description: 'Генерация реалистичного видео по тексту и картинке',
            cost: 50,
            rating: 4.98,
            users: '689 010',
            category: 'video',
            iconColor: 'bg-[#fc3f1d]',
            icon: Video,
            onClick: () => onOpenCreation && onOpenCreation('video-gen')
        }
    ];

    // Filter networks by search query and category tab
    const filteredNetworks = NEURAL_NETWORKS.filter(net => {
        const matchesSearch = searchQuery.trim() === '' || 
            net.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            net.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = activeCategory === 'all' || 
            (activeCategory === 'free' && net.cost === 0) || 
            net.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen pb-28 relative overflow-y-auto overflow-x-hidden font-body w-full selection:bg-[#3390ec]/30 bg-[#07060f]">
            <SEO 
                title="Bazzar Pixel — AI генерация"
                description="Создавай уникальный контент с помощью нейросетей"
            />

            {/* ========================================================== */}
            {/* 1. MOBILE VIEW LAYOUT (< md breakpoint) */}
            {/* ========================================================== */}
            <div className="block md:hidden">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="px-4 pt-4 flex flex-col gap-6 relative z-10"
                >
                    {/* Mobile Header matching Photo 2 */}
                    <motion.div variants={itemVariants} className="flex justify-between items-center px-1 mb-2">
                        <button
                            onClick={() => { triggerHaptic('light'); navigate('/profile'); }}
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-display font-black text-sm active:scale-95 transition-transform shadow-lg animate-pulse"
                        >
                            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                        </button>
                        


                        <button
                            onClick={() => { triggerHaptic('light'); onOpenPayment && onOpenPayment(); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-lg active:scale-95 transition-transform"
                        >
                            <span className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px] text-yellow-400">★</span>
                            <span className="text-white font-display font-black text-[13px] tracking-tight">
                                <SpringCounter value={stats?.current_balance || 0} />
                            </span>
                        </button>
                    </motion.div>

                    {/* Mobile Hero Title */}
                    <motion.div variants={itemVariants} className="text-center mt-6 mb-4 px-2">
                        <h2 className="text-[26px] font-display font-black text-white leading-tight tracking-tight drop-shadow-sm">
                            Чем я могу помочь Вам сегодня?
                        </h2>
                    </motion.div>

                    {/* Search Bar Capsule */}
                    <motion.div variants={itemVariants} className="relative group flex items-center w-full">
                        <Search className="absolute left-4.5 text-white/30 z-10" size={17} />
                        <input
                            type="text"
                            placeholder="Спросить что-нибудь..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-14 py-3.5 text-[15px] text-white placeholder:text-white/30 outline-none focus:border-[#3390ec]/50 focus:ring-4 focus:ring-[#3390ec]/10 transition-all duration-300"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2.5 w-9 h-9 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform z-10"
                        >
                            <Send size={14} className="text-white/80" />
                        </button>
                    </motion.div>

                    {/* Mobile Templates ("Фото и видео") */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-4">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[17px] font-display font-black text-white tracking-tight font-display">Фото и видео</span>
                            <button onClick={() => navigate('/gallery')} className="text-[13px] text-[#3390ec] font-bold active:opacity-75 flex items-center gap-0.5 font-display">
                                Показать все <ChevronRight size={15} />
                            </button>
                        </div>
                        <div className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x pb-2 -mx-4 px-4 w-[calc(100%+2rem)]">
                            {finalTemplates.map((item, i) => (
                                <div 
                                    key={item.id || i}
                                    onClick={() => onOpenTemplate(item)}
                                    className="snap-center flex-shrink-0 w-28 aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden relative border border-white/5 active:scale-95 transition-transform"
                                >
                                    {item.src && <img src={getCDNUrl(item.src)} className="w-full h-full object-cover" alt="" />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                    <span className="absolute bottom-2.5 left-2.5 right-2.5 text-[9.5px] font-display font-semibold text-white line-clamp-1 text-left">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Mobile Category filter tabs */}
                    <motion.div variants={itemVariants} className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mt-2 -mx-4 px-4 w-[calc(100%+2rem)]">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    triggerHaptic('light');
                                    setActiveCategory(cat.id);
                                }}
                                className={`px-4 py-2.5 rounded-full font-display font-semibold text-[13.5px] whitespace-nowrap transition-all border ${
                                    activeCategory === cat.id 
                                        ? 'bg-gradient-to-r from-[#3390ec] to-[#a855f7] border-transparent text-white font-bold shadow-lg shadow-purple-500/10' 
                                        : 'bg-white/[0.03] border-white/5 text-gray-400 hover:text-white'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </motion.div>

                    {/* Mobile Neural Networks List */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-2">
                        <h3 className="text-[17px] font-display font-black text-white tracking-tight px-1">
                            {activeCategory === 'all' ? 'Нейросети' : categories.find(c => c.id === activeCategory)?.label}
                        </h3>

                        {filteredNetworks.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 font-semibold bg-white/[0.02] border border-white/5 rounded-[24px] text-[13.5px]">
                                Нейросети не найдены
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {filteredNetworks.map((net) => {
                                    const NetIcon = net.icon;
                                    return (
                                        <motion.div 
                                            key={net.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={net.onClick}
                                            className="bg-white/[0.03] border border-white/5 rounded-[24px] p-5 relative cursor-pointer active:bg-white/[0.05] transition-all flex flex-col gap-3.5"
                                        >
                                            {/* Cost token badge top-right */}
                                            <div className="absolute top-5 right-5 flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2.5 py-1 text-[11px] text-blue-400 font-black font-display shadow-sm">
                                                <span>✦</span>
                                                <span>{net.cost}</span>
                                            </div>

                                            {/* Card Icon & Header */}
                                            <div className="flex items-start gap-3.5">
                                                <div className={`w-11 h-11 rounded-xl ${net.iconColor} flex items-center justify-center text-white shadow-lg shrink-0`}>
                                                    <NetIcon size={18} className="text-white" />
                                                </div>
                                                <div className="text-left pr-12 min-w-0">
                                                    <h4 className="text-[15.5px] font-display font-black text-white leading-tight tracking-tight truncate">
                                                        {net.title}
                                                    </h4>
                                                    <p className="text-[12.5px] text-gray-400 leading-snug font-semibold mt-1.5 line-clamp-2">
                                                        {net.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Card Rating & Users footer */}
                                            <div className="flex items-center gap-4 border-t border-white/5 pt-3.5 text-[11px] text-gray-500 font-bold">
                                                <div className="flex items-center gap-0.5 text-yellow-500">
                                                    <span>★</span>
                                                    <span>{net.rating.toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center gap-0.5 text-gray-400">
                                                    <span>👥</span>
                                                    <span>{net.users}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* ========================================================== */}
            {/* 2. DESKTOP VIEW LAYOUT (>= md breakpoint) matching Photo 2 */}
            {/* ========================================================== */}
            <div className="hidden md:block">
                <div className="flex flex-col min-h-screen">
                    
                    {/* Top PC Nav Bar matching Photo 2 */}
                    <div className="flex items-center justify-between w-full py-4.5 px-10 bg-[#07060f]/60 border-b border-white/5 backdrop-blur-md sticky top-0 z-40">
                        {/* Model Dropdown Selector */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-2xl bg-[#1a1a1c] border border-white/5 text-white font-display font-semibold text-[13.5px] hover:border-white/10 active:scale-98 transition-all shadow-lg"
                            >
                                <span>{selectedModel}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isModelDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.1 }}
                                        className="absolute left-0 mt-2 w-48 bg-[#12111a] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5"
                                    >
                                        {['ChatGPT 5.4', 'Pixel AI Chat', 'Nano Banana Pro'].map((modelName) => (
                                            <button
                                                key={modelName}
                                                onClick={() => {
                                                    setSelectedModel(modelName);
                                                    setIsModelDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                                                    selectedModel === modelName 
                                                        ? 'bg-white/5 text-white' 
                                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                                                }`}
                                            >
                                                {modelName}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* Balance + Tariffs Action */}
                        <div className="flex items-center gap-4">
                            {/* Balance indicator badge */}
                            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1a1a1c] border border-white/5 shadow-md">
                                <span className="w-4.5 h-4.5 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px] text-yellow-400 font-bold">★</span>
                                <span className="text-white font-display font-black text-[13.5px] tracking-tight">
                                    {stats?.current_balance || 0}
                                </span>
                            </div>

                            {/* Select Plan Button */}
                            <button 
                                onClick={onOpenPayment}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-display font-black text-sm shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                            >
                                Выбрать тариф
                            </button>
                        </div>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex-1 max-w-5xl mx-auto w-full px-10 pt-12 pb-16 flex flex-col text-left relative z-10"
                    >
                        {/* Title Section */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <h1 className="text-[32px] font-display font-black text-white leading-tight tracking-tight">
                                Нейросети
                            </h1>
                            <p className="text-[14.5px] text-gray-400 leading-relaxed font-semibold mt-2.5 max-w-2xl">
                                Здесь собраны все нейросети из нашей коллекции. Напишите, какую задачу нужно решить и умный поиск подберёт самую подходящую нейронку.
                            </p>
                        </motion.div>

                        {/* Search Input Box */}
                        <motion.div variants={itemVariants} className="w-full max-w-xl mb-6 relative">
                            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Поиск нейросети"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#12111a] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-[14.5px] text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors shadow-inner"
                            />
                        </motion.div>

                        {/* Category filter tabs */}
                        <motion.div variants={itemVariants} className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar py-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4.5 py-2.5 rounded-full font-display font-semibold text-[13.5px] whitespace-nowrap transition-all border ${
                                        activeCategory === cat.id 
                                            ? 'bg-white/5 border-white/10 text-white font-bold' 
                                            : 'bg-transparent border-transparent text-gray-500 hover:text-white'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </motion.div>

                        {/* Popular / Neural Networks Grid */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-6">
                            <h3 className="text-lg font-display font-black text-white tracking-tight mb-2">
                                {activeCategory === 'all' ? 'Популярные' : categories.find(c => c.id === activeCategory)?.label}
                            </h3>

                            {filteredNetworks.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 font-semibold bg-[#12111a]/40 border border-white/5 rounded-3xl">
                                    Нейросети не найдены
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-5">
                                    {filteredNetworks.map((net) => {
                                        const NetIcon = net.icon;
                                        return (
                                            <motion.div 
                                                key={net.id}
                                                whileHover={{ scale: 1.015, y: -2 }}
                                                whileTap={{ scale: 0.985 }}
                                                onClick={net.onClick}
                                                className="bg-[#12111a] border border-white/5 rounded-3xl p-6 relative cursor-pointer hover:border-white/10 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between aspect-[1.7/1]"
                                            >
                                                {/* Cost token badge top-right */}
                                                <div className="absolute top-5 right-5 flex items-center gap-1 bg-[#1a1a1c] border border-white/5 rounded-full px-3 py-1.5 text-xs text-blue-400 font-black font-display shadow-sm">
                                                    <span>✦</span>
                                                    <span>{net.cost}</span>
                                                </div>

                                                {/* Card Icon & Header */}
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl ${net.iconColor} flex items-center justify-center text-white shadow-lg`}>
                                                        <NetIcon size={22} className="text-white" />
                                                    </div>
                                                    <div className="text-left pr-14 min-w-0">
                                                        <h4 className="text-[17px] font-display font-black text-white leading-tight tracking-tight truncate">
                                                            {net.title}
                                                        </h4>
                                                        <p className="text-[13px] text-gray-400 leading-snug font-semibold mt-2 line-clamp-2">
                                                            {net.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Card Rating & Users footer */}
                                                <div className="flex items-center gap-4 border-t border-white/5 pt-4 mt-4 text-[12px] text-gray-500 font-bold">
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <span>★</span>
                                                        <span>{net.rating.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <span>👥</span>
                                                        <span>{net.users}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
