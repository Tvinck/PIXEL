import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import galleryAPI from '../lib/galleryAPI';
import { useCloudStorage } from '../hooks/useCloudStorage';
import CompareModal from '../components/CompareModal';
import { SkeletonHistory } from '../components/ui/Skeleton';
import SEO from '../components/SEO/SEO';

import HistoryFilter from '../components/history/HistoryFilter';
import HistoryGrid from '../components/history/HistoryGrid';
import HistoryEmpty from '../components/history/HistoryEmpty';
import HistoryModal from '../components/history/HistoryModal';

const SparkleIcon = ({ size = 24, className = '' }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <motion.path
            d="M12 2L14.09 8.26L20.18 8.63L15.54 12.74L16.82 19.02L12 15.77L7.18 19.02L8.46 12.74L3.82 8.63L9.91 8.26L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.15"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        />
    </svg>
);



const HistoryView = () => {
    const navigate = useNavigate();
    const { user, isLoading: isUserLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [generations, setGenerations] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // ── Filters & Search ───
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all | image | video
    const [sortBy, setSortBy] = useState('date'); // date | likes
    const [showFilters, setShowFilters] = useState(false);

    // ── Compare Mode ───
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCompareIds, setSelectedCompareIds] = useState<any[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    // ── Collections ───
    const { getItem, setItem } = useCloudStorage();
    const [collections, setCollections] = useState<any>({});
    const [activeCollection, setActiveCollection] = useState('all');
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    useEffect(() => {
        const loadCollections = async () => {
            const saved = await getItem('bazzar_collections');
            if (saved) {
                try {
                    setCollections(JSON.parse(saved));
                } catch { }
            }
        };
        loadCollections();
    }, [getItem]);

    useEffect(() => {
        if (isUserLoading) return;
        let isMounted = true;
        
        const fetchHistory = async (showLoading = true) => {
            if (!user?.id) { setIsLoading(false); return; }
            if (showLoading) setIsLoading(true);
            try {
                const data = await galleryAPI.getUserCreations(user.id, true);
                if (isMounted) setGenerations(data || []);
            } catch (error) {
                console.error("Failed to load history", error);
                if (isMounted) setGenerations([]);
            } finally { if (isMounted) setIsLoading(false); }
        };

        fetchHistory();

        const hasPending = generations.some((g: any) => g.status === 'pending');
        const pollInterval = setInterval(() => {
            if (hasPending) {
                fetchHistory(false);
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [user, isUserLoading, generations]);

    const handlePublish = async (item: any) => {
        if (!item) return;
        const newStatus = !item.is_public;
        setGenerations((prev: any[]) => prev.map((g: any) => g.id === item.id ? { ...g, is_public: newStatus } : g));
        setSelectedItem((prev: any) => prev ? { ...prev, is_public: newStatus } : null);
        try {
            const res = await galleryAPI.togglePublic(item.id, newStatus);
            if (!res.success) throw new Error('Failed');
        } catch {
            setGenerations((prev: any[]) => prev.map((g: any) => g.id === item.id ? { ...g, is_public: !newStatus } : g));
            setSelectedItem((prev: any) => prev ? { ...prev, is_public: !newStatus } : null);
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm('Удалить этот шедевр?')) return;
        setGenerations((prev: any[]) => prev.filter((g: any) => g.id !== item.id));
        setSelectedItem(null);
        try { await galleryAPI.deleteCreation(item.id); } catch { window.location.reload(); }
    };

    const handleRepeat = (item: any) => {
        navigate(`/generate/${item.type === 'video' ? 'video-gen' : 'image-gen'}`, {
            state: { prompt: item.prompt, model: item.model_id }
        });
    };

    const handleDownload = async (item: any) => {
        const url = item.image_url;
        const filename = `pixel-gen-${item.id.slice(0, 8)}.${item.type === 'video' ? 'mp4' : 'png'}`;
        if ((window as any).Telegram?.WebApp?.downloadFile) {
            try { (window as any).Telegram.WebApp.downloadFile({ url, file_name: filename }); return; } catch { }
        }
        try {
            const res = await fetch(url, { mode: 'cors' });
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl; a.download = filename; a.click();
            window.URL.revokeObjectURL(blobUrl);
        } catch { window.open(url, '_blank'); }
    };

    const handleSaveToCollection = async (collectionName: any, itemId: any) => {
        const currentItems = collections[collectionName] || [];

        let newCollections;
        if (currentItems.includes(itemId)) {
            newCollections = {
                ...collections,
                [collectionName]: currentItems.filter((id: any) => id !== itemId)
            };
            if (newCollections[collectionName].length === 0) {
                delete newCollections[collectionName];
            }
        } else {
            newCollections = {
                ...collections,
                [collectionName]: [...currentItems, itemId]
            };
        }

        setCollections(newCollections);
        await setItem('bazzar_collections', JSON.stringify(newCollections));
        setShowCollectionModal(false);
        setNewCollectionName('');
    };

    const filteredGenerations = useMemo(() => {
        return generations
            .filter((gen: any) => {
                const searchMatch = !searchQuery ||
                    (gen.prompt && gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (gen.model_id && gen.model_id.toLowerCase().includes(searchQuery.toLowerCase()));
                const typeMatch = filterType === 'all' || gen.type === filterType;
                const collectionMatch = activeCollection === 'all' ||
                    (collections[activeCollection] && collections[activeCollection].includes(gen.id));
                return searchMatch && typeMatch && collectionMatch;
            })
            .sort((a: any, b: any) => {
                if (sortBy === 'likes') return (b.likes_count || 0) - (a.likes_count || 0);
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [generations, searchQuery, filterType, sortBy, activeCollection, collections]);

    const handleCardClick = (gen: any) => {
        if (isSelectionMode) {
            setSelectedCompareIds((prev: any[]) =>
                prev.includes(gen.id) ? prev.filter((id: any) => id !== gen.id) : [...prev, gen.id].slice(0, 4)
            );
        } else {
            setSelectedItem(gen);
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedCompareIds([]);
    };

    if (isLoading) return <SkeletonHistory />;

    if (!generations || generations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 gap-3 min-h-[60vh]">
                <span className="text-6xl mb-4 animate-bounce">🎨</span>
                <p className="text-text-primary text-xl font-bold">
                    Пока нет генераций
                </p>
                <p className="text-text-secondary text-sm text-center max-w-[240px]">
                    Создай своё первое изображение и оно появится здесь!
                </p>
                <button 
                    onClick={() => navigate('/create')}
                    className="mt-6 px-8 py-3 bg-accent-blue text-white rounded-full font-bold active:scale-95 transition-transform"
                >
                    Начать создавать
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-4 pb-32 px-4 bg-bg-primary min-h-screen text-white font-sans relative overflow-y-auto w-full selection:bg-[#3390ec]/30"
        >
            <SEO title="История генераций — Bazzar Pixel" description="Просматривай и управляй своими AI творениями" />

            {/* Premium Dynamic Backdrops */}
            <div className="bg-glow-container">
                <div className="bg-glow-blue" />
                <div className="bg-glow-purple" />
            </div>
            
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-6 px-1 flex items-end justify-between"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <motion.h1 className="text-[28px] font-black font-display leading-tight text-white" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            История
                        </motion.h1>
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}>
                            <SparkleIcon size={22} className="text-[#3390ec]" />
                        </motion.div>
                    </div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-[13px] text-gray-400 font-extrabold font-display uppercase tracking-wider mt-0.5">
                        {generations.length} {(generations.length === 1 || (generations.length % 10 === 1 && generations.length !== 11)) ? 'работа' : (generations.length < 5 || (generations.length % 10 < 5 && generations.length % 10 > 0 && (generations.length < 10 || generations.length > 20))) ? 'работы' : 'работ'}
                    </motion.p>
                </div>

                {generations.length > 1 && (
                    <button
                        onClick={toggleSelectionMode}
                        className={`text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors ${isSelectionMode ? 'bg-accent-blue text-white' : 'bg-bg-elevated text-white'}`}
                    >
                        {isSelectionMode ? 'Отмена' : 'Сравнить'}
                    </button>
                )}
            </motion.div>

            <AnimatePresence>
                {isSelectionMode && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="bg-bg-elevated p-3 rounded-2xl flex items-center justify-between">
                            <span className="text-sm font-medium pl-2">
                                Выбрано: {selectedCompareIds.length} / 4
                            </span>
                            <button
                                disabled={selectedCompareIds.length < 2}
                                onClick={() => setShowCompareModal(true)}
                                className="bg-accent-blue text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Сравнить
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <HistoryFilter
                collections={collections}
                activeCollection={activeCollection}
                setActiveCollection={setActiveCollection}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterType={filterType}
                setFilterType={setFilterType}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            <HistoryGrid
                filteredGenerations={filteredGenerations}
                selectedCompareIds={selectedCompareIds}
                isSelectionMode={isSelectionMode}
                handleCardClick={handleCardClick}
            />

            <HistoryModal
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                handleRepeat={handleRepeat}
                handlePublish={handlePublish}
                handleDownload={handleDownload}
                handleDelete={handleDelete}
                navigate={navigate}
                setShowCollectionModal={setShowCollectionModal}
                showCollectionModal={showCollectionModal}
                collections={collections}
                handleSaveToCollection={handleSaveToCollection}
                newCollectionName={newCollectionName}
                setNewCollectionName={setNewCollectionName}
            />

            <CompareModal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                selectedItems={generations.filter((g: any) => selectedCompareIds.includes(g.id))}
            />
        </motion.div>
    );
};

export default HistoryView;
