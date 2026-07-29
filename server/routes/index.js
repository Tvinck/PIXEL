import crypto from 'node:crypto';
import https from 'node:https';
import { supabase } from '../lib/supabase.js';
import { getUserUUID } from '../helpers/utils.js';
import galleryRoutes from './gallery.js';
import userRoutes from './user.js';
import { setupMarketingRoutes } from './marketing.js';
import expertsRoutes from './experts.js';
import chatRoutes from './chat.js';
import generationRoutes from './generation.js';
import templatesRoutes from './templates.js';
import stickersRoutes from './stickers.js';
import kieRoutes from './kie.js';

/**
 * Register all modular route groups on the Express app.
 * Called from server/index.js during initialization.
 */
export function registerRoutes(app, bot) {
    // Attach bot to app for access in routers
    app.set('bot', bot);

    // Gallery
    app.use('/api/gallery', galleryRoutes);

    // User (stats + profile)
    app.use('/api/user', userRoutes);

    // Marketing (needs bot for sending messages)
    const marketingRouter = setupMarketingRoutes(bot);
    app.use('/api/marketing', marketingRouter);

    // Experts
    app.use('/api/experts', expertsRoutes);

    // Universal Chat
    app.use('/api/chat', chatRoutes);

    // Generation
    app.use('/api/generation', generationRoutes);

    // Templates
    app.use('/api/templates', templatesRoutes);

    // Stickers
    app.use('/api/stickers', stickersRoutes);

    // Kie Webhooks
    app.use('/api/kie', kieRoutes);

    // Legacy aliases — frontend calls these directly (not via /api/generation/*)
    app.get('/api/stars', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('stars')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
            if (error) throw error;
            res.json({ success: true, stars: data || [] });
        } catch (e) {
            console.error('Stars alias error:', e);
            res.json({ success: true, stars: [] });
        }
    });
    app.use('/api/preview-greeting', (req, res, next) => { req.url = '/preview-greeting'; generationRoutes(req, res, next); });
    app.use('/api/generate-greeting-v2', (req, res, next) => { req.url = '/generate-greeting-v2'; generationRoutes(req, res, next); });
    app.use('/api/generate-stickers', (req, res, next) => { req.url = '/generate-stickers'; stickersRoutes(req, res, next); });
    app.use('/api/create-sticker-pack', (req, res, next) => { req.url = '/create-sticker-pack'; stickersRoutes(req, res, next); });
    app.use('/api/send-result', (req, res, next) => { req.url = '/send-result'; generationRoutes(req, res, next); });
    app.use('/api/send-sticker', (req, res, next) => { req.url = '/send-sticker'; stickersRoutes(req, res, next); });

    // Legacy/standalone payment and webhook routes
    app.post('/api/payment-init', async (req, res) => {
        try {
            const { amount, credits, promoCode, description, userId, userEmail, recurrent, connectionType, paymentType } = req.body;
            const TERMINAL_KEY = process.env.TBANK_TERMINAL_KEY;
            const PASSWORD = process.env.TBANK_PASSWORD;

            let validPromo = null;
            if (promoCode) {
                const { data: promo } = await supabase.from('promo_codes').select('*').eq('code', promoCode.toUpperCase()).single();
                if (promo && promo.is_active && (!promo.expires_at || new Date(promo.expires_at) > new Date()) && (!promo.max_uses || promo.used_count < promo.max_uses)) {
                    validPromo = promo;
                } else {
                    return res.status(400).json({ error: 'Недействительный промокод' });
                }
            }

            const amountKopeeks = Math.round(Number(amount) * 100);
            const orderId = `BZR_${Date.now().toString().slice(-8)}`;
            const desc = (description || 'Pixel AI Credits').slice(0, 100);

            const requestBody = {
                TerminalKey: TERMINAL_KEY,
                Amount: amountKopeeks,
                OrderId: orderId,
                Description: desc,
                NotificationURL: `https://${req.headers.host}/api/webhook`,
                SuccessURL: `https://t.me/Pixel_ai_bot?startapp=payment_success__${orderId}`,
                FailURL: 'https://t.me/Pixel_ai_bot?startapp=payment_fail',
                DATA: {
                    userId: userId,
                    telegramId: req.body.telegramId,
                    credits: credits || 0,
                    promoCode: validPromo ? validPromo.code : null,
                    ...(connectionType && { connection_type: connectionType }),
                    ...(paymentType && { payment_type: paymentType })
                },
                Receipt: {
                    Email: userEmail || 'customer@example.com',
                    Taxation: 'usn_income',
                    Items: [
                        {
                            Name: desc,
                            Price: amountKopeeks,
                            Quantity: 1,
                            Amount: amountKopeeks,
                            PaymentMethod: 'full_prepayment',
                            PaymentObject: 'service',
                            Tax: 'none'
                        }
                    ]
                }
            };

            if (recurrent) {
                requestBody.Recurrent = 'Y';
                requestBody.CustomerKey = String(userId || req.body.telegramId);
            }

            const tokenParams = {};
            for (const key in requestBody) {
                if (['Token', 'DATA', 'Receipt'].includes(key)) continue;
                tokenParams[key] = requestBody[key];
            }
            tokenParams.Password = PASSWORD;

            const sortedKeys = Object.keys(tokenParams).sort();
            let tokenStr = '';
            for (const key of sortedKeys) tokenStr += String(tokenParams[key]);
            requestBody.Token = crypto.createHash('sha256').update(tokenStr).digest('hex');

            const responseData = await new Promise((resolve, reject) => {
                const reqData = JSON.stringify(requestBody);
                const request = https.request({
                    hostname: 'securepay.tinkoff.ru',
                    path: '/v2/Init',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(reqData)
                    }
                }, (response) => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => {
                        try { resolve(JSON.parse(data)); }
                        catch (e) { resolve({ Success: false, Message: 'Invalid JSON' }); }
                    });
                });
                request.on('error', reject);
                request.write(reqData);
                request.end();
            });

            if (responseData.Success) {
                if (userId) {
                    let finalUserId = null;
                    const telegramIdInt = Number(userId);

                    if (userId && !String(userId).includes('-') && !isNaN(telegramIdInt)) {
                        const { data: u } = await supabase.from('users').select('id').eq('telegram_id', telegramIdInt).maybeSingle();
                        if (u) finalUserId = u.id;

                        if (!finalUserId) {
                            console.log(`Creating new user for payment init: ${telegramIdInt}`);
                            const { data: newUser } = await supabase.from('users').insert({
                                telegram_id: telegramIdInt,
                                username: 'user_' + telegramIdInt,
                                created_at: new Date().toISOString()
                            }).select().single();
                            if (newUser) finalUserId = newUser.id;
                        }
                    } else {
                        finalUserId = userId;
                    }

                    if (finalUserId) {
                        await supabase.from('transactions').insert({
                            user_id: finalUserId,
                            amount: 0,
                            type: 'pending_init',
                            description: `Init: ${amount}₽`,
                            metadata: {
                                PaymentId: responseData.PaymentId,
                                OrderId: orderId,
                                TelegramId: req.body.telegramId || telegramIdInt
                            },
                            created_at: new Date().toISOString()
                        });
                    }
                }

                res.json({
                    paymentUrl: responseData.PaymentURL,
                    paymentId: responseData.PaymentId,
                    orderId: orderId
                });
            } else {
                res.json({
                    success: false,
                    error: responseData.Message || 'Ошибка инициализации'
                });
            }
        } catch (error) {
            console.error('Payment Service Error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/payment-check', async (req, res) => {
        let { paymentId, orderId, userId } = req.body;
        const TERMINAL_KEY = process.env.TBANK_TERMINAL_KEY;
        const PASSWORD = process.env.TBANK_PASSWORD;

        console.log(`🔎 [Payment Check] Start. Order: ${orderId}, Payment: ${paymentId}, UserRaw: ${userId}`);

        try {
            if (!paymentId && orderId) {
                const { data: tx } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('type', 'pending_init')
                    .filter('metadata->>OrderId', 'eq', orderId)
                    .maybeSingle();

                if (tx && tx.metadata?.PaymentId) {
                    paymentId = tx.metadata.PaymentId;
                    if (!userId && tx.user_id) userId = tx.user_id;
                }
            }

            if (!paymentId) return res.status(400).json({ error: 'No PaymentId found' });

            if (userId && !String(userId).includes('-') && !isNaN(Number(userId))) {
                const { data: u } = await supabase
                    .from('users')
                    .select('id')
                    .eq('telegram_id', userId)
                    .maybeSingle();

                if (u) userId = u.id;
                else return res.status(400).json({ error: 'User not found' });
            }

            const tokenParams = { TerminalKey: TERMINAL_KEY, PaymentId: paymentId, Password: PASSWORD };
            const sortedKeys = Object.keys(tokenParams).sort();
            let tokenStr = '';
            for (const key of sortedKeys) tokenStr += String(tokenParams[key]);
            const token = crypto.createHash('sha256').update(tokenStr).digest('hex');

            const bankResponse = await new Promise((resolve, reject) => {
                const reqData = JSON.stringify({ TerminalKey: TERMINAL_KEY, PaymentId: paymentId, Token: token });
                const request = https.request({
                    hostname: 'securepay.tinkoff.ru',
                    path: '/v2/GetState',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(reqData) }
                }, (response) => {
                    let d = '';
                    response.on('data', c => d += c);
                    response.on('end', () => resolve(JSON.parse(d)));
                });
                request.on('error', reject);
                request.write(reqData);
                request.end();
            });

            console.log('🏦 Bank Status:', bankResponse.Status);

            if (bankResponse.Success && (bankResponse.Status === 'CONFIRMED' || bankResponse.Status === 'AUTHORIZED')) {
                const { data: txByPayment } = await supabase.from('transactions')
                    .select('id').eq('type', 'deposit').eq('metadata->>PaymentId', paymentId).maybeSingle();

                const { data: txByOrder } = await supabase.from('transactions')
                    .select('id').eq('type', 'deposit').eq('metadata->>OrderId', orderId).maybeSingle();

                if (txByPayment || txByOrder) {
                    return res.status(200).json({ success: true, status: 'ALREADY_CREDITED' });
                }

                if (!userId) {
                    const { data: pendingTx } = await supabase.from('transactions')
                        .select('user_id').eq('type', 'pending_init')
                        .filter('metadata->>OrderId', 'eq', orderId || bankResponse.OrderId).maybeSingle();
                    if (pendingTx) userId = pendingTx.user_id;
                }

                if (!userId) return res.status(400).json({ error: 'User UUID not found' });

                const amountRub = Math.round(bankResponse.Amount / 100);
                let creditsToAdd = amountRub;
                if (amountRub === 99) creditsToAdd = 100;
                else if (amountRub >= 490 && amountRub <= 510) creditsToAdd = 525;
                else if (amountRub >= 990 && amountRub <= 1010) creditsToAdd = 1150;
                else if (amountRub >= 1990 && amountRub <= 2010) creditsToAdd = 2400;
                else if (amountRub >= 4990) creditsToAdd = 6500;

                console.log(`✅ [Payment Check] Crediting User ${userId}: ${creditsToAdd} credits`);

                const { data: currentStats } = await supabase
                    .from('user_stats')
                    .select('current_balance')
                    .eq('user_id', userId)
                    .maybeSingle();

                const newBalance = (currentStats?.current_balance || 0) + creditsToAdd;

                await supabase.from('user_stats').upsert({
                    user_id: userId,
                    current_balance: newBalance,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

                await supabase.from('transactions').insert({
                    user_id: userId,
                    amount: creditsToAdd,
                    type: 'deposit',
                    description: `T-Bank Check: ${amountRub}₽`,
                    metadata: bankResponse,
                    created_at: new Date().toISOString()
                });

                try {
                    const { data: u } = await supabase.from('users').select('telegram_id').eq('id', userId).single();
                    if (u?.telegram_id && bot) {
                        const msg = `✅ <b>Оплата прошла успешно!</b>\n\n💰 Пополнено: <b>${amountRub}₽</b>\n⚡️ Начислено: <b>${creditsToAdd} кредитов</b>\n💎 Текущий баланс: <b>${newBalance}</b>`;
                        await bot.sendMessage(u.telegram_id, msg, { parse_mode: 'HTML' });
                    }
                } catch (err) {
                    console.error(err);
                }

                res.json({ success: true, status: 'CREDITED', balance: newBalance });
            } else {
                res.json({
                    success: false,
                    status: bankResponse.Status,
                    message: bankResponse.Message || 'Платеж не подтвержден'
                });
            }
        } catch (e) {
            console.error('Payment Check Error:', e);
            res.status(500).json({ error: e.message });
        }
    });

    const handleTBankWebhook = async (req, res) => {
        const body = req.body;
        const T_BANK_PASSWORD = process.env.TBANK_PASSWORD;

        try {
            if (!body.Token) {
                console.warn('⚠️ [Webhook] No Token found. Ignoring.');
                return res.send('OK');
            }

            const params = { ...body };
            delete params.Token;
            params.Password = T_BANK_PASSWORD;

            const sortedKeys = Object.keys(params).sort();
            let tokenStr = '';
            for (const key of sortedKeys) {
                if (typeof params[key] !== 'object') tokenStr += params[key];
            }
            const calculatedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

            if (calculatedToken !== body.Token) {
                console.error('❌ [Webhook] Signature Fail!');
                return res.send('OK');
            }

            if (body.Status !== 'CONFIRMED' && body.Status !== 'AUTHORIZED') {
                return res.send('OK');
            }

            const orderId = body.OrderId;
            const { data: existingTx } = await supabase
                .from('transactions')
                .select('id')
                .eq('metadata->>OrderId', orderId)
                .neq('type', 'pending_init')
                .maybeSingle();

            if (existingTx) {
                console.log(`✅ [Webhook] Order ${orderId} already processed.`);
                return res.send('OK');
            }

            let userId = body.userId || body.DATA?.userId;
            let telegramId = body.telegramId || body.DATA?.telegramId;

            if (!userId) {
                const { data: pendingTx } = await supabase
                    .from('transactions')
                    .select('user_id, metadata')
                    .eq('metadata->>OrderId', orderId)
                    .eq('type', 'pending_init')
                    .maybeSingle();

                if (pendingTx) {
                    userId = pendingTx.user_id;
                    telegramId = pendingTx.metadata?.TelegramId;
                }
            }

            if (userId && !String(userId).includes('-') && !isNaN(Number(userId))) {
                const { data: uVal } = await supabase
                    .from('users')
                    .select('id, telegram_id')
                    .eq('telegram_id', userId)
                    .maybeSingle();

                if (uVal) {
                    userId = uVal.id;
                    if (!telegramId) telegramId = uVal.telegram_id;
                } else {
                    console.error(`❌ [Webhook] Could not resolve Telegram ID to user UUID: ${userId}`);
                    return res.send('OK');
                }
            }

            if (!userId) {
                console.error('❌ [Webhook] FATAL: Could not identify user for payment.');
                return res.send('OK');
            }

            const amountRub = Math.round(body.Amount / 100);
            let creditsToAdd = amountRub;

            if (amountRub === 99) creditsToAdd = 100;
            else if (amountRub >= 490 && amountRub <= 510) creditsToAdd = 525;
            else if (amountRub >= 990 && amountRub <= 1010) creditsToAdd = 1150;
            else if (amountRub >= 1990 && amountRub <= 2010) creditsToAdd = 2400;
            else if (amountRub >= 4990) creditsToAdd = 6500;

            console.log(`💰 [Webhook] Crediting ${creditsToAdd} credits to User ${userId}`);

            const { data: currentStats } = await supabase
                .from('user_stats')
                .select('current_balance')
                .eq('user_id', userId)
                .maybeSingle();

            const newBalance = (currentStats?.current_balance || 0) + creditsToAdd;

            await supabase.from('user_stats').upsert({
                user_id: userId,
                current_balance: newBalance,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            await supabase.from('transactions').insert({
                user_id: userId,
                amount: creditsToAdd,
                type: 'deposit',
                description: `T-Bank Webhook: ${amountRub}₽`,
                metadata: body,
                created_at: new Date().toISOString()
            });

            try {
                if (!telegramId) {
                    const { data: u } = await supabase.from('users').select('telegram_id').eq('id', userId).single();
                    if (u) telegramId = u.telegram_id;
                }

                if (telegramId && bot) {
                    const msg = `✅ <b>Оплата прошла успешно!</b>\n\n💰 Пополнено: <b>${amountRub}₽</b>\n⚡️ Начислено: <b>${creditsToAdd} кредитов</b>\n💎 Текущий баланс: <b>${newBalance}</b>\n\n<i>Приятного творчества!</i>`;
                    await bot.sendMessage(telegramId, msg, { parse_mode: 'HTML' });
                }
            } catch (notifyErr) {
                console.error('Notify Error:', notifyErr);
            }

            res.send('OK');
        } catch (err) {
            console.error('💥 [Webhook] Payment Error:', err);
            res.send('OK');
        }
    };

    app.post('/api/webhook', async (req, res) => {
        if (req.body.update_id) {
            try {
                if (bot) bot.processUpdate(req.body);
            } catch (e) {
                console.error('Webhook Telegram processUpdate error:', e);
            }
            return res.status(200).send('OK');
        }
        return handleTBankWebhook(req, res);
    });

    app.post('/api/payment-webhook', handleTBankWebhook);

    app.get('/api/payment-mock-success', async (req, res) => {
        const { orderId, amount, userId } = req.query;

        if (!orderId || !amount) {
            return res.status(400).send('Missing params');
        }

        const webhookUrl = `https://${req.headers.host}/api/payment-webhook`;
        const PASSWORD = process.env.TBANK_PASSWORD;

        const payload = {
            TerminalKey: '1768938209941DEMO',
            OrderId: orderId,
            Success: true,
            Status: 'CONFIRMED',
            PaymentId: 'MOCK_PAY_' + Date.now(),
            ErrorCode: '0',
            Amount: parseInt(amount),
            CardId: '123456',
            Pan: '4276********0001',
            ExpDate: '1122',
            DATA: {
                userId: userId,
                telegramId: req.query.telegramId
            },
            Token: ''
        };

        const params = { ...payload };
        delete params.Token;
        params.Password = PASSWORD;

        const keys = Object.keys(params).sort();
        let tokenStr = '';
        for (const key of keys) {
            if (typeof params[key] === 'object') continue;
            tokenStr += params[key];
        }

        payload.Token = crypto.createHash('sha256').update(tokenStr).digest('hex');

        try {
            console.log('🚀 Firing Mock Webhook to:', webhookUrl);
            const { default: fetch } = await import('node-fetch');
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('✅ Mock Webhook Sent');
        } catch (e) {
            console.error('❌ Mock Webhook Failed:', e);
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Оплата успешна</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5; margin: 0; }
                    .card { background: white; padding: 40px; border-radius: 24px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 90%; }
                    h1 { color: #10b981; margin-bottom: 10px; }
                    p { color: #6b7280; margin-bottom: 30px; }
                    .btn { background: #000; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>✅ Оплата прошла!</h1>
                    <p>Кредиты успешно начислены.</p>
                    <a href="https://t.me/Pixel_ai_bot/app" class="btn">Вернуться в приложение</a>
                </div>
                <script>
                    if (window.Telegram?.WebApp) {
                        window.Telegram.WebApp.close();
                    }
                </script>
            </body>
            </html>
        `);
    });

    app.get('/api/setup-webhook', async (req, res) => {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is missing in env' });
        
        const host = req.headers.host;
        const webhookUrl = `https://${host}/api/webhook`;
        try {
            const result = await bot.setWebhook(webhookUrl);
            res.json({ status: 'attempted', webhookUrl, telegramResponse: result });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    console.log('🛣️ Modular routes registered: gallery, user, marketing, experts, chat, generation, templates, stickers');
}
