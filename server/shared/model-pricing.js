/**
 * Server-side Model Pricing — mirrors src/config/model-catalog.ts
 * 
 * IMPORTANT: Keep prices in sync with frontend model-catalog.ts
 * This file is the backend's source of truth for pricing and KIE endpoints.
 */

const MODEL_PRICING = {
    // Image models
    nano_banana_pro: 20,
    imagen_4: 20,
    flux_pro: 45,
    ideogram_v3: 30,

    // Video models  
    veo_3_1: 150,
    kling_2_6: 100,
    wan_2_6: 100,

    // Tools
    recraft_remove_bg: 5,
    recraft_upscale: 15,

    // Legacy fallbacks (for existing jobs in queue)
    nano_banana: 10,
    nano_banana_edit: 5,
    imagen_4_ultra: 30,
    flux_flex: 35,
    seedream_4_5: 30,
    seedream_edit: 30,
    ideogram_char: 30,
    ideogram_char_edit: 35,
    ideogram_reframe: 20,
    kling_avatar: 150,
    wan_animate: 80,
    suno_v4: 80,
    suno_video: 120,
    eleven_tts: 10,
    eleven_sfx: 15,
    
    default: 20,
};

const KIE_ENDPOINTS = {
    // Active models
    nano_banana_pro: 'nano-banana-pro',
    imagen_4: 'google/imagen4',
    imagen_4_ultra: 'google/imagen4-ultra',
    flux_pro: 'flux-2/pro-text-to-image',
    flux_flex: 'flux-2/flex-text-to-image',
    ideogram_v3: 'ideogram/v3',
    ideogram_char: 'ideogram/character',
    ideogram_char_edit: 'ideogram/character-edit',
    ideogram_reframe: 'ideogram/v3-reframe',
    seedream_4_5: 'seedream/4.5-text-to-image',
    seedream_edit: 'seedream/4.5-edit',
    
    // Video
    veo_3_1: 'veo-3.1/text-to-video',
    kling_2_6: 'kling-2.6',
    kling_avatar: 'kling/ai-avatar-pro',
    wan_2_6: 'wan/2-6',
    wan_animate: 'wan/2-2-animate-move',
    
    // Tools
    recraft_remove_bg: 'recraft/remove-background',
    recraft_upscale: 'recraft/crisp-upscale',
    nano_banana: 'nano-banana',
    nano_banana_edit: 'nano-banana-edit',
    
    // Audio
    suno_v4: 'suno/music-generation',
    suno_video: 'suno/create-music-video',
    eleven_tts: 'elevenlabs/text-to-speech-turbo-2-5',
    eleven_sfx: 'elevenlabs/sound-effect-v2',
};

/**
 * Calculate cost for a model. Single source of truth for server-side pricing.
 */
function calculateCost(modelId, options = {}) {
    let cost = MODEL_PRICING[modelId] || MODEL_PRICING.default;

    // Dynamic pricing for Nano Banana Pro
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

    return cost * (options.count || 1);
}

/**
 * Get KIE endpoint for a model ID.
 */
function getKieEndpoint(modelId) {
    return KIE_ENDPOINTS[modelId] || modelId;
}

export { MODEL_PRICING, KIE_ENDPOINTS, calculateCost, getKieEndpoint };
export default { MODEL_PRICING, KIE_ENDPOINTS, calculateCost, getKieEndpoint };
