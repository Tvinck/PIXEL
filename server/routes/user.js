import express from 'express';
import { supabase, botAnalytics } from '../lib/supabase.js';
import { authTG } from '../middleware/auth.js';
import { getUserUUID, getUserBalance } from '../helpers/utils.js';
import { bot } from '../index.js';

const router = express.Router();

/**
 * GET /api/user/stats
 * Retrieve statistics (current credits balance, level, XP) for the authenticated user.
 * 
 * Security: protected by `authTG`. Resolves and isolates user session via UUID.
 */
router.get('/stats', authTG, async (req, res) => {
    try {
        const userUUID = req.tgUser.uuid;

        const { data: stats, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userUUID)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        res.json(stats || null);
    } catch (e) {
        console.error('Stats Error:', e);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * GET /api/user/profile
 * Retrieve profile details for the authenticated user.
 * 
 * Security: protected by `authTG`.
 */
router.get('/profile', authTG, async (req, res) => {
    try {
        const userUUID = req.tgUser.uuid;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userUUID)
            .single();

        res.json({
            profile: profile || null,
            onboardingCompleted: profile?.onboarding_completed || false
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

/**
 * PUT /api/user/profile
 * Create or update the authenticated user's profile metadata.
 * 
 * Security: protected by `authTG`.
 */
router.put('/profile', authTG, async (req, res) => {
    try {
        const userUUID = req.tgUser.uuid;
        const {
            display_name, gender, age_range, location, occupation,
            interests, communication_style, language, onboarding_completed
        } = req.body;

        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', userUUID)
            .single();

        let profile;
        const profileData = {
            display_name, gender, age_range, location, occupation,
            interests, communication_style, language, onboarding_completed
        };

        if (existing) {
            const { data } = await supabase
                .from('user_profiles')
                .update({ ...profileData, updated_at: new Date().toISOString() })
                .eq('user_id', userUUID)
                .select()
                .single();
            profile = data;
        } else {
            const { data } = await supabase
                .from('user_profiles')
                .insert({ user_id: userUUID, ...profileData })
                .select()
                .single();
            profile = data;
        }

        res.json({ success: true, profile });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * GET /api/user/active-promotions
 * Retrieve a list of active special discounts and flash sales.
 * 
 * Security: protected by `authTG`.
 */
router.get('/active-promotions', authTG, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('active_promotions')
            .select('*')
            .eq('is_active', true)
            .gt('ends_at', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, promotions: data });
    } catch (e) {
        console.error('Get Active Promotions Error:', e);
        res.status(500).json({ error: 'Failed to get promotions' });
    }
});

/**
 * POST /api/user/apply-promo
 * Verify if a promotional code is valid, active, and has not exceeded its limits.
 * 
 * Security: protected by `authTG`.
 */
router.post('/apply-promo', authTG, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'Missing code' });

        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !promo) return res.status(404).json({ error: 'Промокод не найден' });

        if (!promo.is_active) return res.status(400).json({ error: 'Промокод неактивен' });

        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Срок действия промокода истек' });
        }

        if (promo.max_uses && promo.used_count >= promo.max_uses) {
            return res.status(400).json({ error: 'Лимит использования исчерпан' });
        }

        res.json({ success: true, promo });
    } catch (e) {
        console.error('Apply Promo Error:', e);
        res.status(500).json({ error: 'Failed to apply promo' });
    }
});

/**
 * POST /api/user/stars-init
 * Initialize a Telegram Stars invoice link for credit purchasing.
 * 
 * Security: protected by `authTG`. Checks and binds parameters securely.
 */
router.post('/stars-init', authTG, async (req, res) => {
    try {
        const { amount, credits, promoCode } = req.body;
        const telegramId = req.tgUser.id;
        const userUUID = req.tgUser.uuid;

        if (!bot) return res.status(500).json({ error: 'Bot is not initialized' });

        // Let's ensure promo code is still valid, as extra safety
        let checkedPromo = null;
        if (promoCode) {
            const { data: promo } = await supabase.from('promo_codes').select('*').eq('code', promoCode.toUpperCase()).single();
            if (promo && promo.is_active && (!promo.expires_at || new Date(promo.expires_at) > new Date()) && (!promo.max_uses || promo.used_count < promo.max_uses)) {
                checkedPromo = promo.code;
            } else {
                return res.status(400).json({ error: 'Недействительный промокод' });
            }
        }

        const orderId = `BZR_STARS_${Date.now().toString().slice(-8)}`;
        const payload = JSON.stringify({
            telegramId,
            credits: credits || 0,
            promoCode: checkedPromo,
            orderId
        });

        const invoiceLink = await bot.createInvoiceLink(
            'Заряды Pixel AI', // title
            `Пополнение на ${credits} ⚡ зарядов для генерации`, // description
            payload, // payload
            '', // provider_token (empty for stars)
            'XTR', // currency
            [{ label: 'Заряды', amount: Number(amount) }] // prices
        );

        // Log pending transaction securely
        await supabase.from('transactions').insert({
            user_id: userUUID,
            amount: 0,
            type: 'pending_init_stars',
            description: `Init Stars: ${amount} XTR`,
            metadata: { OrderId: orderId, TelegramId: telegramId },
            created_at: new Date().toISOString()
        });

        res.json({ success: true, invoiceLink });
    } catch (e) {
        console.error('Stars Init Error:', e);
        res.status(500).json({ error: 'Failed to initialize Stars payment' });
    }
});

/**
 * GET /api/user/follow/check
 * Check if a follower is following another user.
 */
router.get('/follow/check', async (req, res) => {
    try {
        const { followerId, followingId } = req.query;
        if (!followerId || !followingId) {
            return res.status(400).json({ error: 'Missing followerId or followingId' });
        }
        const { data, error } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', followerId)
            .eq('following_id', followingId)
            .maybeSingle();
        if (error) throw error;
        res.json({ following: !!data });
    } catch (e) {
        console.error('Check Follow Error:', e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/user/follow
 * Follow a user. Follower UUID is secured from the session.
 */
router.post('/follow', authTG, async (req, res) => {
    try {
        const { followingId } = req.body;
        const followerId = req.tgUser.uuid;
        if (!followingId) {
            return res.status(400).json({ error: 'Missing followingId' });
        }
        if (followerId === followingId) {
            return res.status(400).json({ error: 'You cannot follow yourself' });
        }
        const { data, error } = await supabase
            .from('follows')
            .insert({ follower_id: followerId, following_id: followingId })
            .select()
            .single();
        if (error && error.code !== '23505') throw error;
        res.json({ success: true, data });
    } catch (e) {
        console.error('Follow User Error:', e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * DELETE /api/user/follow
 * Unfollow a user. Follower UUID is secured from the session.
 */
router.delete('/follow', authTG, async (req, res) => {
    try {
        const { followingId } = req.query;
        const followerId = req.tgUser.uuid;
        if (!followingId) {
            return res.status(400).json({ error: 'Missing followingId' });
        }
        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);
        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        console.error('Unfollow User Error:', e);
        res.status(500).json({ error: e.message });
    }
});

export default router;
