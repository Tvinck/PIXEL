import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play as PlayIcon, Image as ImageIcon, Sparkles, Heart, Zap, Truck, Snowflake, LayoutGrid, PlaySquare, Smile, Flame, Camera, UserCircle, MessageSquare, Star } from 'lucide-react';


const CATEGORY_ICONS = {
    'all': LayoutGrid,
    'video': PlaySquare,
    'photo': Camera,
    'stickers': Smile,
    'avatar': UserCircle,
    'memes': Zap,
    'hot': Flame,
    'new': Sparkles,
    'recommended': Star
};

const getCategoryIcon = (id: any, label?: any) => {
    if (!id) return Sparkles;
    const lowerId = id.toLowerCase();
    if ((CATEGORY_ICONS as any)[lowerId]) return (CATEGORY_ICONS as any)[lowerId];
    if (label?.toLowerCase().includes('вид')) return PlaySquare;
    if (label?.toLowerCase().includes('фот')) return Camera;
    return Sparkles;
};

// Import Data
import { useTemplates, useCategories } from '../hooks/useGallery';
import { useUser } from '../context/UserContext';
import { templatesData } from '../data/templates';
import { TelegramCard, TelegramButton, TelegramBadge } from '../components/TelegramAnimations';
import { useMagneticButton, useStaggerAnimation } from '../hooks/useGSAPAnimations';
import { SpringCounter } from '../components/SpringAnimations';
import { SkeletonImageCard } from '../components/ui/Skeleton';
import AnimatedIcon from '../components/ui/AnimatedIcon';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hook to track if element is in viewport
 */
const useInView = (options: any = { threshold: 0.1, rootMargin: '50px' }): [React.RefObject<any>, boolean] => {
    const ref = useRef<any>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.disconnect(); // Load once
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (observer && currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [options]);

    return [ref, isInView];
};

/**
 * Optimized Media Component with Lazy Loading & Placeholder
 */
const LazyMedia = ({ src, type, alt, className }: any) => {
    const [ref, isInView] = useInView();
    const [isLoaded, setIsLoaded] = useState(false);
    const videoRef = useRef<any>(null);

    return (
        <div ref={ref} className={`relative bg-bg-elevated overflow-hidden ${className}`}>
            {/* Placeholder / Skeleton */}
            <AnimatePresence>
                {!isLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-bg-elevated"
                    >
                        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content - rendered only when in view */}
            {isInView && (
                type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={`${src}#t=0.0,5.0`}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        muted
                        playsInline
                        autoPlay
                        preload="auto"
                        onLoadedData={() => setIsLoaded(true)}
                        onTimeUpdate={(e: any) => {
                            const target = e.target as HTMLVideoElement;
                            if (target && target.currentTime >= 5) {
                                target.currentTime = 0;
                                target.play();
                            }
                        }}
                    />
                ) : (
                    <img
                        src={src}
                        alt={alt}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                    />
                )
            )}
        </div>
    );
};

const GalleryView = ({ onOpenTemplate }: any) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useLanguage();

    // Data Fetching
    const { data: categories } = useCategories();
    const { data: templatesRaw } = useTemplates(selectedCategory === 'all' ? null : selectedCategory);

    // Merge API templates with local for safety if API fails
    const templates = useMemo(() => {
        if (templatesRaw && templatesRaw.length > 0) return templatesRaw;
        // Fallback to local filtering if API empty (or initial load)
        let filtered: any[] = templatesData || [];
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((t: any) => t.category === selectedCategory);
        }
        return filtered;
    }, [templatesRaw, selectedCategory]);

    // Client-side Search Filter
    const filteredTemplates: any[] = useMemo(() => {
        let filtered: any[] = (templates as any[]) || [];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((t: any) =>
                t.title.toLowerCase().includes(query) ||
                (t.description || '').toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [templates, searchQuery]);

    // Prepare Category List
    const categoryList = useMemo(() => {
        const list = [{ id: 'all', label: t('home.seeAll'), icon: '🔥' }];
        const fetched = (categories && Array.isArray(categories)) ? categories : []; // Normalize
        if (fetched.length > 0) {
            return [
                ...list,
                { id: 'recommended', label: t('home.templates'), icon: '⭐' },
                ...fetched.map((c: any) => ({
                    id: c.slug,
                    label: c.label,
                    icon: 'image'
                }))
            ];
        }
        // If no categories from DB, use hardcoded backup?
        // Actually useCategories hook handles fallback.
        return list;
    }, [categories, t]);


    return (
        <div className="min-h-screen bg-bg-primary text-white pb-28 relative overflow-y-auto w-full selection:bg-[#3390ec]/30 md:max-w-6xl md:mx-auto">
            {/* Premium Dynamic Backdrops */}
            <div className="bg-glow-container">
                <div className="bg-glow-blue" />
                <div className="bg-glow-purple" />
            </div>

            {/* --- HEADER (Search & Categories) --- */}
            <div className="sticky top-0 z-30 bg-bg-primary/75 backdrop-blur-md border-b border-white/5 pb-2 pt-2">
                <div className="max-w-[1600px] mx-auto w-full">
                    <div className="px-4 mb-3">
                        <div className="relative group flex items-center w-full max-w-md mx-auto md:mx-0">
                            <Search className="absolute left-3.5 text-gray-500 z-10" size={18} />
                            <input
                                type="text"
                                placeholder={t('gallery.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.04] backdrop-blur-md rounded-full pl-11 pr-4 py-2.5 text-[16px] text-white placeholder:text-gray-500 outline-none border border-white/5 focus:border-[#3390ec]/50 focus:ring-2 focus:ring-[#3390ec]/20 transition-all duration-300 tracking-[-0.41px] font-medium"
                            />
                        </div>
                    </div>

                    {/* Horizontal Categories Scroll */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-4 pt-2 snap-x">
                        {categoryList.map((cat: any) => {
                            const Icon = getCategoryIcon(cat.id, cat.label);
                            const isActive = selectedCategory === cat.id;

                            return (
                                <motion.button
                                    key={cat.id}
                                    onClick={() => {
                                        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                                            (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                                        }
                                        setSelectedCategory(cat.id);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={`relative flex flex-col items-center justify-center min-w-[96px] h-[100px] rounded-[24px] p-3 snap-center transition-all duration-300 overflow-hidden ${isActive
                                        ? 'bg-gradient-to-br from-[#3390ec] to-[#a855f7] shadow-lg shadow-[#3390ec]/30 border border-white/20'
                                        : 'bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] border border-white/5'
                                        }`}
                                >
                                    {/* Glow Background */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeCategoryGlow"
                                            className="absolute inset-0 bg-white/10"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <div className={`relative z-10 p-2.5 rounded-card mb-2 transition-colors ${isActive ? 'bg-white/20' : 'bg-white/[0.03] border border-white/5'
                                        }`}>
                                        <AnimatedIcon icon={Icon} size={24} color="" className={isActive ? 'text-white' : 'text-gray-400'} disableHover />
                                    </div>

                                    <span className={`relative z-10 text-[13px] font-extrabold tracking-tight font-display ${isActive ? 'text-white' : 'text-gray-400'
                                        }`}>
                                        {cat.label}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- GRID --- */}
            <div className="max-w-[1600px] mx-auto px-0 md:px-4 pt-2 md:pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0.5 md:gap-4">
                    {filteredTemplates.map((template: any, i: number) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 15, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.04 * (i % 10), duration: 0.4, type: "spring" }}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                                    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                                }
                                onOpenTemplate && onOpenTemplate(template);
                            }}
                            className="relative aspect-[9/16] overflow-hidden cursor-pointer bg-white/[0.03] group md:rounded-[24px] rounded-[20px] shadow-xl shadow-black/40 border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300"
                        >
                            {/* Optimized Media Loader */}
                            <LazyMedia
                                src={template.src}
                                type={template.mediaType}
                                alt={template.title}
                                className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            {/* Video Indicator */}
                            {template.mediaType === 'video' && (
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full p-2 z-20 border border-white/10 group-hover:bg-[#3390ec] transition-colors duration-300">
                                    <AnimatedIcon icon={PlayIcon} size={14} color="" className="text-white fill-white" disableHover disableTap />
                                </div>
                            )}

                            {/* Content Block */}
                            <div className="absolute inset-x-0 bottom-0 p-3 z-30 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-16">
                                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-card p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-white text-[13px] font-bold leading-tight line-clamp-2 md:text-[14px] mb-2 drop-shadow-sm font-display">
                                        {template.title}
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {template.likes !== undefined && (
                                                <div className="flex items-center gap-1 text-[11px] text-white/90 font-medium">
                                                    <Heart size={12} className="text-[#ff2d55] fill-[#ff2d55]" /> {template.likes}
                                                </div>
                                            )}
                                            {template.comment_count !== undefined && (
                                                <div className="flex items-center gap-1 text-[11px] text-white/90 font-medium">
                                                    <MessageSquare size={12} className="text-[#3390ec]" /> {template.comment_count}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredTemplates.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-white/40"
                    >
                        <AnimatedIcon icon={Search} size={48} color="" className="mb-4 opacity-30" />
                        <p className="text-sm font-semibold">{t('gallery.nothingFound')}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default GalleryView;
