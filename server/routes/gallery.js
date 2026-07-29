import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authTG } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/gallery/like
 * Add a like to a creation.
 * 
 * Security: protected by `authTG`. Checks user UUID from verified session.
 */
router.post('/like', authTG, async (req, res) => {
    try {
        const { creationId } = req.body;
        const userId = req.tgUser.uuid;

        const { data, error } = await supabase
            .from('creation_likes')
            .insert({ user_id: userId, creation_id: creationId })
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (e) {
        if (e.code === '23505') return res.json({ success: false, error: 'Already liked' });
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/gallery/unlike
 * Remove a like from a creation.
 * 
 * Security: protected by `authTG`. Checks user UUID from verified session.
 */
router.post('/unlike', authTG, async (req, res) => {
    try {
        const { creationId } = req.body;
        const userId = req.tgUser.uuid;

        const { error } = await supabase
            .from('creation_likes')
            .delete()
            .eq('user_id', userId)
            .eq('creation_id', creationId);

        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/gallery/liked
 * Retrieve list of creation IDs that a specific user has liked.
 * 
 * @param {import('express').Request} req - Query parameters: userId
 * @param {import('express').Response} res - Returns JSON array of creation UUIDs
 */
router.get('/liked', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.json([]);

        console.log(`🔍 [API] Fetching liked creations for user: ${userId}`);
        const { data, error } = await supabase.from('creation_likes').select('creation_id').eq('user_id', userId);

        if (error) {
            console.error('Supabase Liked Error:', error);
            throw error;
        }

        const result = data ? data.map(d => d.creation_id) : [];
        console.log(`✅ [API] Found ${result.length} liked items`);
        res.json(result);
    } catch (e) {
        console.error('Liked Gallery Error:', e);
        res.status(500).json({
            error: 'Failed to fetch liked creations',
            details: e.message,
            stack: process.env.NODE_ENV !== 'production' ? e.stack : undefined
        });
    }
});

/**
 * GET /api/gallery/is_liked
 * Check if a specific creation is liked by a specific user.
 * 
 * @param {import('express').Request} req - Query parameters: userId, creationId
 * @param {import('express').Response} res - Returns JSON object with { liked: boolean }
 */
router.get('/is_liked', async (req, res) => {
    try {
        const { userId, creationId } = req.query;
        const { data } = await supabase.from('creation_likes').select('id').eq('user_id', userId).eq('creation_id', creationId).maybeSingle();
        res.json({ liked: !!data });
    } catch (e) {
        res.json({ liked: false });
    }
});

/**
 * GET /api/gallery/
 * Fetch the public community gallery feed with pagination and sorting.
 * 
 * @param {import('express').Request} req - Query parameters: sortBy ('trending', 'latest'), filterType ('all', 'image', 'video'), page, limit
 * @param {import('express').Response} res - Returns JSON list of creations, hasMore boolean, and total count
 */
router.get('/', async (req, res) => {
    try {
        const { sortBy = 'trending', filterType = 'all', page = 1, limit = 20 } = req.query;
        const viewName = `public_gallery_${sortBy}`;
        
        let query = supabase.from(viewName).select('*', { count: 'exact' });
        
        if (filterType !== 'all') {
            query = query.eq('type', filterType);
        }
        
        const from = (parseInt(page) - 1) * parseInt(limit);
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        if (error) throw error;
        
        res.json({
            creations: data || [],
            hasMore: data && data.length === parseInt(limit),
            total: count
        });
    } catch (e) {
        console.error('Gallery Fetch Error:', e);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

/**
 * GET /api/gallery/categories
 * Retrieve all template categories.
 * 
 * @param {import('express').Response} res - Returns JSON array of category records
 */
router.get('/categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('template_categories')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) throw error;
        res.json(data || []);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// --- CREATION MANAGEMENT ---

/**
 * GET /api/gallery/creations/:id
 * Retrieve a single creation record populated with basic author user details.
 * 
 * @param {import('express').Request} req - URL param: id (creation UUID)
 * @param {import('express').Response} res - Returns JSON creation record
 */
router.get('/creations/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('creations')
            .select('*, user:users(username, first_name, avatar_url)')
            .eq('id', req.params.id)
            .single();
        if (error) throw error;
        res.json(data);
    } catch (e) {
        res.status(404).json({ error: 'Creation not found' });
    }
});

/**
 * GET /api/gallery/creations/user/:userId
 * Retrieve all creations of a specific user.
 * 
 * @param {import('express').Request} req - URL param: userId, query param: includePrivate ('true' or 'false')
 * @param {import('express').Response} res - Returns JSON array of creations
 */
router.get('/creations/user/:userId', async (req, res) => {
    try {
        const { includePrivate } = req.query;
        let query = supabase
            .from('creations')
            .select('*')
            .eq('user_id', req.params.userId)
            .order('created_at', { ascending: false });
            
        if (includePrivate !== 'true') {
            query = query.eq('is_public', true);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        res.json(data || []);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch user creations' });
    }
});

/**
 * POST /api/gallery/creations
 * Save a newly completed generation to the user's gallery.
 * 
 * Security: protected by `authTG`. Overrides user_id from the verified session.
 */
router.post('/creations', authTG, async (req, res) => {
    try {
        const userId = req.tgUser.uuid;
        const creationData = {
            ...req.body,
            user_id: userId // Force session user UUID to prevent spoofing
        };

        const { data, error } = await supabase
            .from('creations')
            .insert(creationData)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PUT /api/gallery/creations/:id
 * Update creation metadata (e.g. rename, visibility toggle).
 * 
 * Security: protected by `authTG`. Checks that the creation belongs to the requesting user.
 */
router.put('/creations/:id', authTG, async (req, res) => {
    try {
        const creationId = req.params.id;
        const userId = req.tgUser.uuid;

        // Verify ownership
        const { data: creation, error: checkError } = await supabase
            .from('creations')
            .select('user_id')
            .eq('id', creationId)
            .maybeSingle();

        if (checkError) throw checkError;
        if (!creation) return res.status(404).json({ error: 'Creation not found' });
        if (creation.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this creation' });
        }

        // Restrict client to safe updates only
        const { is_public, title } = req.body;
        const updateData = {};
        if (is_public !== undefined) updateData.is_public = is_public;
        if (title !== undefined) updateData.title = title;

        const { data, error } = await supabase
            .from('creations')
            .update(updateData)
            .eq('id', creationId)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * DELETE /api/gallery/creations/:id
 * Permanently delete a creation from the database.
 * 
 * Security: protected by `authTG`. Checks that the creation belongs to the requesting user.
 */
router.delete('/creations/:id', authTG, async (req, res) => {
    try {
        const creationId = req.params.id;
        const userId = req.tgUser.uuid;

        // Verify ownership
        const { data: creation, error: checkError } = await supabase
            .from('creations')
            .select('user_id')
            .eq('id', creationId)
            .maybeSingle();

        if (checkError) throw checkError;
        if (!creation) return res.status(404).json({ error: 'Creation not found' });
        if (creation.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You do not own this creation' });
        }

        const { error } = await supabase
            .from('creations')
            .delete()
            .eq('id', creationId);

        if (error) throw error;
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
