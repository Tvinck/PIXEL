import { verifyTelegramWebAppData, verifyWebAuthToken } from '../utils.js';
import { supabase } from '../lib/supabase.js';

/**
 * Express middleware for authenticating requests using Telegram WebApp InitData or JWT (Web OAuth).
 * 
 * Authentication Sources (checked in order):
 * 1. HTTP Headers: `x-tg-data` or `x-telegram-init-data` or `authorization` (Bearer token)
 * 2. Request Body: `initData` or `tg_data`
 * 3. Query string: `initData`
 * 
 * User Object Standardization:
 * Upon successful verification, attaches a standardized `req.tgUser` object:
 * ```json
 * {
 *   "id": 12345678,         // Numeric Telegram ID (or negative OAuth ID)
 *   "uuid": "uuid-string",  // Database user UUID from the `users` table
 *   "username": "username", // Telegram/OAuth username (optional)
 *   "first_name": "Name"   // User first name
 * }
 * ```
 * Automatically registers the user and initializes their stats (with a welcome bonus)
 * if they are authenticated but do not exist in the database.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
export const authTG = async (req, res, next) => {
    try {
        // 1. Extract authentication data from all possible sources
        let initData = req.headers['x-tg-data'] || 
                       req.headers['x-telegram-init-data'] || 
                       (req.body && (req.body.initData || req.body.tg_data)) ||
                       (req.query && req.query.initData);

        const authHeader = req.headers['authorization'];
        if (!initData && authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token && token !== 'null' && token !== 'undefined') {
                initData = token;
                // Normalize JWT format by prepending 'web_auth:' if not present
                if (!initData.startsWith('web_auth:') && initData.split('.').length === 3) {
                    initData = 'web_auth:' + initData;
                }
            }
        }

        // Handle stringified nulls or undefined values from client-side requests
        if (initData === 'null' || initData === 'undefined') {
            initData = null;
        }

        if (!initData) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        let decodedUser = null;
        let isJwt = false;

        // 2. Verify credentials
        if (initData.startsWith('web_auth:')) {
            decodedUser = verifyWebAuthToken(initData);
            isJwt = true;
        } else {
            decodedUser = verifyTelegramWebAppData(initData);
        }

        if (!decodedUser) {
            return res.status(401).json({ error: 'Security verification failed. Please reload or login again.' });
        }

        // 3. Resolve Database UUID
        let uuid = null;
        let telegramId = null;

        if (isJwt) {
            // Decoded JWT: structure has { id: UUID, telegram_id: numeric_telegram_id, ... }
            uuid = decodedUser.id;
            telegramId = decodedUser.telegram_id;
        } else {
            // Decoded Telegram initData: structure has { id: numeric_telegram_id, ... }
            telegramId = decodedUser.id;

            // Fetch user UUID from supabase
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', telegramId)
                .maybeSingle();

            if (userError) {
                console.error('Error fetching user UUID in authTG:', userError);
                return res.status(500).json({ error: 'Database session validation error' });
            }

            if (user) {
                uuid = user.id;
            } else {
                // Auto-register user if they don't exist yet (first-time Mini App entry)
                const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert({
                        telegram_id: telegramId,
                        username: decodedUser.username || null,
                        first_name: decodedUser.first_name || 'User',
                        avatar_url: decodedUser.photo_url || null,
                        updated_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    console.error('Error registering new user in authTG:', insertError);
                    return res.status(500).json({ error: 'User registration failed' });
                }

                uuid = newUser.id;

                // Initialize user_stats for the newly created user (welcome bonus of 50 credits)
                await supabase.from('user_stats').insert({
                    user_id: uuid,
                    current_balance: 50,
                    total_generations: 0,
                    level: 1,
                    xp: 0
                }).onConflict('user_id').ignore();
            }
        }

        // 4. Attach standardized session to request
        req.tgUser = {
            id: telegramId,
            uuid: uuid,
            username: decodedUser.username || null,
            first_name: decodedUser.first_name || 'User'
        };

        next();
    } catch (e) {
        console.error('Auth Middleware Error:', e);
        res.status(500).json({ error: 'Internal Auth Error' });
    }
};
