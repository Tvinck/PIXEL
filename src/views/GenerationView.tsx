import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Zap, Sparkles, Wand2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMarketing } from '../hooks/useMarketing';
import { useSound } from '../context/SoundContext';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { useCloudStorage } from '../hooks/useCloudStorage';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';
import {
    ALL_MODELS, MODEL_FAMILIES, calculateModelCost,
    getDefaultModel, getFamilyForType,
    type ModelDefinition
} from '../config/model-catalog';
import SEO from '../components/SEO/SEO';
import { GenerationErrorBoundary } from '../components/ErrorBoundary';

// Subcomponents
import PromptInput from '../components/generation/PromptInput';
import ModelSelector from '../components/generation/ModelSelector';
import PhotoUpload from '../components/generation/PhotoUpload';
import GenerationSettings from '../components/generation/GenerationSettings';
import GenerationButton from '../components/generation/GenerationButton';

const triggerHaptic = (style = 'light') => {
    try { (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred(style); } catch {}
};

const PRESET_STYLES = [
    { id: 'ghibli', label: 'Ghibli', prompt: 'Studio Ghibli style, anime, vibrant colors' },
    { id: 'vogue', label: 'Vogue', prompt: 'Vogue magazine style, fashion photography, high contrast' },
    { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'Cyberpunk style, neon lights, futuristic' },
    { id: '3d_render', label: '3D Render', prompt: '3D render, unreal engine 5, octane render' },
    { id: 'oil', label: 'Oil Painting', prompt: 'Oil painting style, brush strokes, texture' },
    { id: 'watercolor', label: 'Акварель', prompt: 'Watercolor painting, soft colors, fluid strokes' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 28 } }
};

const GenerationView = ({ onOpenPayment }: any) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { playClick, playSuccess } = useSound();
    const { user, stats, updateStats, startBackgroundGeneration, refreshUser } = useUser();
    const { trackFunnel } = useMarketing(user);
    const { t } = useLanguage();
    const toaster = useToast();
    const { getItem, setItem } = useCloudStorage();

    const { type: paramType } = useParams();
    const isVideoMode = paramType === 'video-gen';

    // Cancellation refs
    const timeoutRef = useRef<any>(null);
    const intervalRef = useRef<any>(null);

    // ===== Model Selection =====
    const defaultModel = getDefaultModel(isVideoMode ? 'video' : 'image');
    const defaultFamily = getFamilyForType(isVideoMode ? 'video' : 'image');

    const [selectedFamilyId, setSelectedFamilyId] = useState(defaultFamily.id);
    const [selectedModelId, setSelectedModelId] = useState(defaultModel.id);

    const filteredFamilies = useMemo(() => {
        return Object.values(MODEL_FAMILIES).filter((family) => {
            if (isVideoMode) return family.type === 'video';
            return family.type !== 'video'; // image + tools
        });
    }, [isVideoMode]);

    const currentFamily = MODEL_FAMILIES[selectedFamilyId];
    const currentModel: ModelDefinition | undefined = ALL_MODELS[selectedModelId];

    // ===== Form State =====
    const [inputs, setInputs] = useState<any>({});
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [customValues, setCustomValues] = useState<any>({});

    // ===== UI State =====
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [cancelCountdown, setCancelCountdown] = useState(0);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
    const [showPromptHistory, setShowPromptHistory] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ===== Computed =====
    const cost = useMemo(() => {
        return calculateModelCost(selectedModelId, {
            resolution: customValues.resolution || '1K',
            quality: customValues.quality,
            duration: customValues.duration,
        });
    }, [selectedModelId, customValues]);

    const modelAcceptsImages = useMemo(() => {
        const caps = currentModel?.capabilities || [];
        return caps.some(c => ['image-to-image', 'edit', 'image-to-video', 'inpainting', 'remix'].includes(c));
    }, [currentModel]);

    const maxImagesForModel = useMemo(() => {
        if (!modelAcceptsImages) return 0;
        return currentModel?.maxImages || 1;
    }, [currentModel, modelAcceptsImages]);

    // ===== Init: load from route state & recent prompts =====
    useEffect(() => {
        const locState = location.state as any;
        if (locState?.model && ALL_MODELS[locState.model]) {
            const targetModel = ALL_MODELS[locState.model];
            const family = Object.values(MODEL_FAMILIES).find(f => f.models.includes(locState.model));
            if (family) setSelectedFamilyId(family.id);
            setSelectedModelId(locState.model);
        }
        if (locState?.prompt) setInputs((p: any) => ({ ...p, prompt: locState.prompt }));

        (async () => {
            const saved = await getItem('bazzar_recent_prompts');
            if (saved) { try { setRecentPrompts(JSON.parse(saved)); } catch {} }
        })();

        trackFunnel('generation', 'view');

        return () => {
            previewUrls.forEach(u => URL.revokeObjectURL(u));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ===== Handlers =====
    const handleFileChange = (e: any) => {
        const files = Array.from(e.target.files as FileList);
        if (!files.length) return;
        triggerHaptic();
        playClick();
        const newTotal = selectedImages.length + files.length;
        if (maxImagesForModel > 0 && newTotal > maxImagesForModel) {
            toaster.error(`Максимум ${maxImagesForModel} фото для этой модели`);
            return;
        }
        setSelectedImages(prev => [...prev, ...files]);
        setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

    const handleRemoveImage = (index: number) => {
        if (previewUrls[index]) URL.revokeObjectURL(previewUrls[index]);
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddPreset = (presetPrompt: string) => {
        const current = inputs.prompt || '';
        setInputs({ ...inputs, prompt: current ? `${current}, ${presetPrompt}` : presetPrompt });
        triggerHaptic();
        playClick();
    };

    const handleEnhancePrompt = async () => {
        const currentPrompt = inputs.prompt?.trim();
        if (!currentPrompt) { toaster.error('Введите промпт для улучшения'); return; }
        setIsEnhancing(true);
        try {
            const res = await fetch('/api/generation/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentPrompt })
            });
            const data = await res.json();
            if (data.enhanced) {
                setInputs((prev: any) => ({ ...prev, prompt: data.enhanced }));
                toaster.success('✨ Промпт улучшен!');
                triggerHaptic('medium');
                playSuccess();
            } else {
                throw new Error(data.error || 'Enhancement failed');
            }
        } catch (e: any) {
            console.error('Enhance error:', e);
            toaster.error('Не удалось улучшить промпт');
        } finally {
            setIsEnhancing(false);
        }
    };

    const cancelGeneration = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsCanceling(false);
        setCancelCountdown(0);
        setIsProcessing(false);
        toaster.success('Генерация отменена');
    };

    const handleGenerate = async () => {
        if (isCanceling) { cancelGeneration(); return; }
        if (!inputs['prompt']?.trim() && !selectedImages.length) {
            toaster.error(t('creation.promptEmpty') || 'Введите промпт или загрузите фото');
            return;
        }

        const finalCost = Math.max(1, cost);
        if ((stats?.current_balance || 0) < finalCost) {
            setShowCreditModal(true);
            return;
        }

        triggerHaptic('medium');
        setIsCanceling(true);
        setIsProcessing(true);
        setCancelCountdown(3);
        playClick();

        intervalRef.current = setInterval(() => {
            setCancelCountdown((prev: number) => {
                if (prev <= 1) { clearInterval(intervalRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);

        timeoutRef.current = setTimeout(async () => {
            setIsCanceling(false);
            triggerHaptic('heavy');
            playSuccess();

            try {
                const payload = {
                    mode: 'kie-gen',
                    type: currentModel?.type === 'video' ? 'video' : 'image',
                    estimatedTime: currentModel?.type === 'video' ? 120 : 15,
                    inputs: { ...inputs },
                    model: selectedModelId,
                    cost: finalCost,
                    callbackData: {
                        ...customValues,
                        source_files: selectedImages,
                        count: 1,
                        resolution: customValues.resolution || '1K',
                        aspect_ratio: customValues.aspect_ratio || '1:1',
                        quality: customValues.quality,
                        duration: customValues.duration,
                    }
                };

                await startBackgroundGeneration(payload);

                // Save recent prompt
                const pText = inputs.prompt?.trim();
                if (pText) {
                    const updated = [pText, ...recentPrompts.filter(p => p !== pText)].slice(0, 5);
                    setRecentPrompts(updated);
                    setItem('bazzar_recent_prompts', JSON.stringify(updated));
                }

                if (stats) updateStats({ current_balance: stats.current_balance - finalCost });
                trackFunnel('generation', 'success', { model: selectedModelId, cost: finalCost });
                try { (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success'); } catch {}
                toaster.success(t('creation.taskStarted') || '✨ Генерация запущена!');
                navigate('/history');

            } catch (e: any) {
                console.error(e);
                refreshUser();
                toaster.error(e.message || 'Ошибка генерации');
            } finally {
                setIsProcessing(false);
            }
        }, 3000);
    };

    const handleFamilyChange = (familyId: string) => {
        const family = MODEL_FAMILIES[familyId];
        if (!family) return;
        setSelectedFamilyId(familyId);
        // Auto-select first model in family
        if (family.models.length > 0) {
            setSelectedModelId(family.models[0]);
        }
        triggerHaptic();
        playClick();
    };

    return (
        <div className="min-h-screen bg-bg-primary text-white font-sans flex flex-col md:max-w-3xl md:mx-auto relative overflow-x-hidden selection:bg-[#3390ec]/30">
            <SEO
                title={isVideoMode ? 'Генерация видео — Bazzar Pixel' : 'Генерация — Bazzar Pixel'}
                description="Создавай изображения и видео с помощью AI"
            />

            {/* Ambient glow */}
            <div className="bg-glow-container">
                <div className="bg-glow-blue" />
                <div className="bg-glow-purple" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-bg-primary/80 backdrop-blur-xl z-30 pt-[calc(env(safe-area-inset-top)+10px)] border-b border-white/5">
                <button
                    onClick={() => { playClick(); navigate(-1); }}
                    className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform bg-white/5 rounded-full border border-white/10"
                >
                    <ChevronLeft className="text-white" size={22} />
                </button>
                <h1 className="text-[17px] font-black font-display tracking-tight text-white">
                    {isVideoMode ? '🎬 Видео' : '✨ Генерация'}
                </h1>
                <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-full">
                    <Zap size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-[13px] font-bold text-amber-300">{stats?.current_balance || 0}</span>
                </div>
            </div>

            <GenerationErrorBoundary>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex-1 overflow-y-auto pb-44 pt-4 space-y-5 relative z-10"
                >
                    {isProcessing && !isCanceling ? (
                        <div className="px-4 py-12 flex flex-col items-center gap-5">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-[3px] border-[#3390ec] border-t-transparent rounded-full"
                            />
                            <div className="text-center space-y-1">
                                <p className="text-[15px] font-semibold text-white">
                                    {isVideoMode ? 'Создаём видео...' : 'Генерируем...'}
                                </p>
                                <p className="text-[13px] text-gray-400">
                                    Результат придёт в историю и Telegram
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Photo Upload (if model supports it) */}
                            <PhotoUpload
                                maxImagesForModel={maxImagesForModel}
                                selectedImages={selectedImages}
                                previewUrls={previewUrls}
                                handleRemoveImage={handleRemoveImage}
                                handleFileChange={handleFileChange}
                                t={t}
                                itemVariants={itemVariants}
                            />

                            {/* Prompt Input */}
                            <PromptInput
                                inputs={inputs}
                                setInputs={setInputs}
                                t={t}
                                showPromptHistory={showPromptHistory}
                                setShowPromptHistory={setShowPromptHistory}
                                recentPrompts={recentPrompts}
                                handleEnhancePrompt={handleEnhancePrompt}
                                isEnhancing={isEnhancing}
                                PRESET_STYLES={PRESET_STYLES}
                                handleAddPreset={handleAddPreset}
                                playClick={playClick}
                                itemVariants={itemVariants}
                            />

                            {/* Model Selector */}
                            <ModelSelector
                                t={t}
                                filteredFamilies={filteredFamilies}
                                selectedFamilyId={selectedFamilyId}
                                handleFamilyChange={handleFamilyChange}
                                selectedModelId={selectedModelId}
                                setSelectedModelId={setSelectedModelId}
                                currentModel={currentModel}
                                cost={cost}
                                playClick={playClick}
                                itemVariants={itemVariants}
                            />

                            {/* Advanced Settings Toggle */}
                            <motion.div variants={itemVariants} className="px-4">
                                <button
                                    onClick={() => { setShowAdvanced(!showAdvanced); playClick(); }}
                                    className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-[13px] text-gray-400 hover:text-white transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <Wand2 size={14} />
                                        Дополнительные настройки
                                    </span>
                                    <ChevronLeft size={14} className={`transition-transform duration-200 ${showAdvanced ? '-rotate-90' : 'rotate-0'}`} />
                                </button>
                            </motion.div>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <GenerationSettings
                                            t={t}
                                            currentModel={currentModel}
                                            currentFamily={currentFamily}
                                            customValues={customValues}
                                            setCustomValues={setCustomValues}
                                            openDropdown={openDropdown}
                                            setOpenDropdown={setOpenDropdown}
                                            itemVariants={itemVariants}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Generation Button */}
                            <GenerationButton
                                cost={cost}
                                handleGenerate={handleGenerate}
                                isProcessing={isProcessing}
                                isCanceling={isCanceling}
                                cancelCountdown={cancelCountdown}
                                t={t}
                            />
                        </>
                    )}
                </motion.div>
            </GenerationErrorBoundary>

            <AnimatePresence>
                {showCreditModal && (
                    <InsufficientCreditsModal
                        isOpen={showCreditModal}
                        onClose={() => setShowCreditModal(false)}
                        onOpenPayment={onOpenPayment}
                        required={cost}
                        current={stats?.current_balance || 0}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default GenerationView;
