// @ts-nocheck
/**
 * UNIFIED MODEL CATALOG — Single Source of Truth
 * 
 * This file replaces both kie-models.js and config/models.js
 * All prices reflect actual KIE API costs.
 * 
 * Models selected: Top 3-4 per category (Avalava-style simplicity)
 */

// ==================== KIE API Config ====================
export const KIE_API_URL = 'https://api.kie.ai/api/v1';

// ==================== Type Definitions ====================
export interface ModelDefinition {
    id: string;
    kieEndpoint: string;
    name: string;
    shortName: string;
    provider: string;
    type: 'image' | 'video' | 'audio' | 'tool';
    baseCost: number;
    icon: string;
    badge?: string;
    description: string;
    capabilities: string[];
    aspectRatios: string[];
    pricingType?: 'resolution' | 'flat';
    resolutions?: string[];
    defaultResolution?: string;
    maxImages?: number;
    supportsNegativePrompt?: boolean;
    hasAudio?: boolean;
    modes?: string[];
    durations?: string[];
}

export interface ModelFamily {
    id: string;
    name: string;
    icon: string;
    type: 'image' | 'video' | 'audio' | 'tool';
    models: string[]; // model IDs
}

// ==================== IMAGE MODELS (Top 4) ====================
const IMAGE_MODELS: Record<string, ModelDefinition> = {
    nano_banana_pro: {
        id: 'nano_banana_pro',
        kieEndpoint: 'nano-banana-pro',
        name: 'Nano Banana Pro',
        shortName: 'Nano Pro',
        provider: 'Google',
        type: 'image',
        baseCost: 20,
        icon: '🍌',
        badge: 'Быстрая',
        description: 'Быстрая генерация изображений с поддержкой img2img',
        capabilities: ['text-to-image', 'image-to-image', 'inpainting'],
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
        pricingType: 'resolution',
        resolutions: ['1K', '2K', '4K'],
        defaultResolution: '1K',
        maxImages: 1,
        supportsNegativePrompt: false,
    },
    imagen_4: {
        id: 'imagen_4',
        kieEndpoint: 'google/imagen4',
        name: 'Imagen 4',
        shortName: 'Imagen 4',
        provider: 'Google',
        type: 'image',
        baseCost: 20,
        icon: '🎨',
        badge: 'Качество',
        description: 'Высококачественная генерация от Google',
        capabilities: ['text-to-image'],
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
        resolutions: ['1K'],
        maxImages: 0,
        supportsNegativePrompt: false,
    },
    flux_pro: {
        id: 'flux_pro',
        kieEndpoint: 'flux-2/pro-text-to-image',
        name: 'Flux Pro',
        shortName: 'Flux Pro',
        provider: 'Black Forest Labs',
        type: 'image',
        baseCost: 45,
        icon: '⚡',
        badge: 'Фотореализм',
        description: 'Максимально реалистичные изображения',
        capabilities: ['text-to-image', 'image-to-image'],
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
        maxImages: 1,
        supportsNegativePrompt: true,
    },
    ideogram_v3: {
        id: 'ideogram_v3',
        kieEndpoint: 'ideogram/v3',
        name: 'Ideogram V3',
        shortName: 'Ideogram',
        provider: 'Ideogram',
        type: 'image',
        baseCost: 30,
        icon: '✍️',
        badge: 'Текст в картинках',
        description: 'Лучшая генерация текста на изображениях',
        capabilities: ['text-to-image', 'remix', 'edit'],
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
        modes: ['turbo', 'default', 'quality'],
        maxImages: 1,
        supportsNegativePrompt: true,
    },
};

// ==================== VIDEO MODELS (Top 3) ====================
const VIDEO_MODELS: Record<string, ModelDefinition> = {
    veo_3_1: {
        id: 'veo_3_1',
        kieEndpoint: 'veo-3.1/text-to-video',
        name: 'Veo 3.1',
        shortName: 'Veo 3.1',
        provider: 'Google',
        type: 'video',
        baseCost: 150,
        icon: '🎬',
        badge: 'Лучшее видео',
        description: 'Топовая модель видеогенерации от Google',
        capabilities: ['text-to-video', 'image-to-video'],
        aspectRatios: ['16:9', '9:16', '1:1'],
        hasAudio: true,
        maxImages: 1,
        durations: ['5s', '8s'],
    },
    kling_2_6: {
        id: 'kling_2_6',
        kieEndpoint: 'kling-2.6',
        name: 'Kling 2.6',
        shortName: 'Kling',
        provider: 'Bytedance',
        type: 'video',
        baseCost: 100,
        icon: '🎥',
        description: 'Стабильная видеогенерация от Bytedance',
        capabilities: ['text-to-video', 'image-to-video'],
        aspectRatios: ['16:9', '9:16', '1:1'],
        maxImages: 1,
        durations: ['5s', '10s'],
    },
    wan_2_6: {
        id: 'wan_2_6',
        kieEndpoint: 'wan/2-6',
        name: 'Wan 2.6',
        shortName: 'Wan',
        provider: 'Wan',
        type: 'video',
        baseCost: 100,
        icon: '📹',
        description: 'Универсальная видеомодель с img2video',
        capabilities: ['text-to-video', 'image-to-video', 'video-to-video'],
        aspectRatios: ['16:9', '9:16', '1:1'],
        maxImages: 1,
        durations: ['5s'],
    },
};

// ==================== TOOL MODELS ====================
const TOOL_MODELS: Record<string, ModelDefinition> = {
    recraft_remove_bg: {
        id: 'recraft_remove_bg',
        kieEndpoint: 'recraft/remove-background',
        name: 'Удаление фона',
        shortName: 'Фон',
        provider: 'Recraft',
        type: 'tool',
        baseCost: 5,
        icon: '✂️',
        description: 'Автоматическое удаление фона с фото',
        capabilities: ['edit'],
        aspectRatios: [],
        maxImages: 1,
    },
    recraft_upscale: {
        id: 'recraft_upscale',
        kieEndpoint: 'recraft/crisp-upscale',
        name: 'Увеличение',
        shortName: 'Upscale',
        provider: 'Recraft',
        type: 'tool',
        baseCost: 15,
        icon: '🔍',
        description: 'Увеличение разрешения изображения',
        capabilities: ['edit'],
        aspectRatios: [],
        maxImages: 1,
    },
};

// ==================== ALL MODELS FLAT MAP ====================
export const ALL_MODELS: Record<string, ModelDefinition> = {
    ...IMAGE_MODELS,
    ...VIDEO_MODELS,
    ...TOOL_MODELS,
};

// ==================== MODEL FAMILIES ====================
export const MODEL_FAMILIES: Record<string, ModelFamily> = {
    image: {
        id: 'image',
        name: 'Изображения',
        icon: '🖼',
        type: 'image',
        models: Object.keys(IMAGE_MODELS),
    },
    video: {
        id: 'video',
        name: 'Видео',
        icon: '🎬',
        type: 'video',
        models: Object.keys(VIDEO_MODELS),
    },
    tools: {
        id: 'tools',
        name: 'Инструменты',
        icon: '🔧',
        type: 'tool',
        models: Object.keys(TOOL_MODELS),
    },
};

// ==================== PRICING ====================

/**
 * Calculate cost for a model based on selected options.
 * This is THE ONLY pricing function — used by both frontend and backend.
 */
export function calculateModelCost(
    modelId: string,
    options: { resolution?: string; quality?: string; duration?: string; count?: number } = {}
): number {
    const model = ALL_MODELS[modelId];
    if (!model) return 20; // fallback

    let cost = model.baseCost;

    // Dynamic pricing for Nano Banana Pro by resolution
    if (modelId === 'nano_banana_pro') {
        if (options.resolution === '4K') cost = 24;
        else if (options.resolution === '2K') cost = 20;
        else cost = 18; // 1K default
    }

    // Dynamic pricing for Kling video
    if (modelId === 'kling_2_6') {
        if (options.quality === '1080p') cost += 50;
        if (options.duration === '10s') cost += 50;
    }

    // Multiplier for batch generation
    return cost * (options.count || 1);
}

/**
 * Get flat pricing map for backend compatibility.
 * Backend uses PRICING[modelId] for quick lookups.
 */
export function getPricingMap(): Record<string, number> {
    const map: Record<string, number> = {};
    for (const [id, model] of Object.entries(ALL_MODELS)) {
        map[id] = model.baseCost;
    }
    map['default'] = 20;
    return map;
}

// ==================== HELPER FUNCTIONS ====================

export function getModelById(id: string): ModelDefinition | undefined {
    return ALL_MODELS[id];
}

export function getModelsByType(type: 'image' | 'video' | 'audio' | 'tool'): ModelDefinition[] {
    return Object.values(ALL_MODELS).filter(m => m.type === type);
}

export function getDefaultModel(type: 'image' | 'video'): ModelDefinition {
    if (type === 'video') return ALL_MODELS['veo_3_1'];
    return ALL_MODELS['nano_banana_pro'];
}

export function getFamilyForType(type: string): ModelFamily {
    if (type === 'video-gen' || type === 'video') return MODEL_FAMILIES['video'];
    if (type === 'tool') return MODEL_FAMILIES['tools'];
    return MODEL_FAMILIES['image'];
}

// Legacy compatibility exports
export const KIE_MODELS_FLAT = ALL_MODELS;
export const PRICING = getPricingMap();
