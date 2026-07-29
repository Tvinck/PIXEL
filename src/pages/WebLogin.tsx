import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, X, Mail } from 'lucide-react';
import TelegramLoginWidget from '../components/TelegramLoginWidget';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

// PKCE Helpers for VK ID
// PKCE Helpers for VK ID
function generateRandomString(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => chars[b % chars.length]).join('');
}

async function generateCodeChallenge(verifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

const YANDEX_CLIENT_ID = import.meta.env.VITE_YANDEX_CLIENT_ID || '';
const VK_CLIENT_ID = import.meta.env.VITE_VK_CLIENT_ID || '';

const SocialLoginButton = ({ icon, label, onClick, disabled, bgClass = "bg-[#242426] hover:bg-[#2c2c2e]" }: any) => (
    <motion.button
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl border border-white/5 text-white font-display font-semibold text-[15px] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${bgClass}`}
    >
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <span>{label}</span>
    </motion.button>
);

const WebLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showTelegramWidget, setShowTelegramWidget] = useState(false);
    const [showMailInput, setShowMailInput] = useState(false);
    const [email, setEmail] = useState('');
    const { success, error: toastError } = useToast();
    const yandexInitialized = useRef(false);

    // Handle Yandex Token
    const handleYandexToken = useCallback(async (accessToken: any) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/yandex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken })
            });
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('bazzar_web_auth', data.token);
                success('Вход через Яндекс успешен!');
                window.location.reload();
            } else {
                throw new Error(data.error || 'Ошибка авторизации через Яндекс');
            }
        } catch (error: any) {
            console.error('Yandex login error:', error);
            toastError(error.message || 'Ошибка подключения');
        } finally {
            setIsLoading(false);
        }
    }, [success, toastError]);

    // Initialize Yandex SDK on mount
    useEffect(() => {
        if (yandexInitialized.current || !YANDEX_CLIENT_ID) return;

        const initYandex = () => {
            if (!(window as any).YaAuthSuggest) return false;

            yandexInitialized.current = true;

            (window as any).YaAuthSuggest.init(
                {
                    client_id: YANDEX_CLIENT_ID,
                    response_type: 'token',
                    redirect_uri: `${window.location.origin}/auth/callback`
                },
                `${window.location.origin}`,
                { view: 'button', parentId: 'yandex-login-button', buttonSize: 'l', buttonView: 'main', buttonTheme: 'dark', buttonBorderRadius: 16 }
            )
                .then(({ handler }: any) => handler())
                .then((data: any) => {
                    handleYandexToken(data.access_token);
                })
                .catch((error: any) => {
                    console.log('Yandex SDK suggest not available or declined:', error);
                });
        };

        initYandex();
    }, [handleYandexToken]);

    // Yandex Fallback
    const handleYandexLogin = useCallback(() => {
        if (!YANDEX_CLIENT_ID) {
            toastError('Yandex ID не настроен');
            return;
        }
        const state = 'yandex_' + generateRandomString(16);
        const redirectUri = `${window.location.origin}/auth/callback`;
        const url = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
        window.location.href = url;
    }, [toastError]);

    // Telegram Response
    const handleTelegramResponse = async (user: any) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/telegram-web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('bazzar_web_auth', data.token);
                success('Успешный вход!');
                window.location.reload();
            } else {
                throw new Error(data.error || 'Ошибка авторизации');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toastError(error.message || 'Ошибка подключения к серверу');
        } finally {
            setIsLoading(false);
        }
    };

    // VK Login
    const handleVKLogin = useCallback(async () => {
        if (!VK_CLIENT_ID) {
            toastError('VK ID не настроен');
            return;
        }
        const state = 'vk_' + generateRandomString(16);
        const codeVerifier = generateRandomString(64);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const redirectUri = `${window.location.origin}/auth/callback`;

        sessionStorage.setItem('vk_code_verifier', codeVerifier);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: VK_CLIENT_ID,
            redirect_uri: redirectUri,
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            scope: 'vkid.personal_info'
        });

        window.location.href = `https://id.vk.com/authorize?${params.toString()}`;
    }, [toastError]);

    // Dev Login Bypass
    const handleDevLogin = async () => {
        setIsLoading(true);
        try {
            const mockUser = {
                id: 603207436,
                first_name: "Developer",
                username: "dev_user",
                photo_url: "https://github.com/apple.png",
                isDevMock: true
            };
            const response = await fetch('/api/auth/telegram-web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockUser)
            });
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('bazzar_web_auth', data.token);
                success('DEV Вход успешен!');
                window.location.reload();
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toastError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSubmit = (e: any) => {
        e.preventDefault();
        if (!email) return;
        toastError('Вход по почте временно отключен. Используйте соц. сети.');
    };

    return (
        <div className="min-h-screen bg-[#07060f] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-body selection:bg-blue-500/20">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute w-[600px] h-[600px] -top-[150px] -left-[100px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute w-[600px] h-[600px] -bottom-[150px] -right-[100px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Split Screen Container */}
            <div className="w-full max-w-5xl bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 shadow-2xl backdrop-blur-3xl min-h-[580px]">
                
                {/* Left Side: Login Form Card */}
                <div className="flex flex-col justify-between p-8 md:p-12 text-left relative z-10 border-r border-white/5">
                    {/* Header Logo or Info */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#3390ec] to-[#a855f7] flex items-center justify-center text-white">
                            <Sparkles size={14} className="animate-pulse" />
                        </div>
                        <span className="text-white font-display font-black text-sm tracking-wider uppercase">Pixel AI</span>
                    </div>

                    <div className="my-auto w-full max-w-[340px] mx-auto">
                        <h2 className="text-[25px] font-display font-black text-white mb-6 tracking-tight leading-tight">
                            Войдите, чтобы продолжить
                        </h2>

                        <AnimatePresence mode="wait">
                            {showTelegramWidget ? (
                                <motion.div
                                    key="telegram"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex flex-col items-center gap-4 w-full"
                                >
                                    <TelegramLoginWidget
                                        botName={import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'bazzar_pixel_bot'}
                                        onAuth={handleTelegramResponse}
                                        authUrl={`${window.location.origin}/auth/callback`}
                                    />
                                    <button
                                        onClick={() => setShowTelegramWidget(false)}
                                        className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer mt-2"
                                    >
                                        ← Назад к выбору
                                    </button>
                                </motion.div>
                            ) : showMailInput ? (
                                <motion.form
                                    key="email"
                                    onSubmit={handleEmailSubmit}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex flex-col gap-4 w-full"
                                >
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="Введите ваш email..."
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#242426] border border-white/10 rounded-2xl px-4 py-3.5 text-[14px] text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 rounded-2xl bg-white text-black font-display font-bold text-[14px] hover:bg-white/90 active:scale-95 transition-all shadow-lg"
                                    >
                                        Продолжить
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowMailInput(false)}
                                        className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer text-center mt-1"
                                    >
                                        ← Назад к выбору
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="main-options"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col gap-3 w-full"
                                >
                                    {/* Yandex Button */}
                                    <div id="yandex-login-button" className="w-full hidden" />
                                    <SocialLoginButton
                                        icon={
                                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                                                <path d="M12.5 2C6.7 2 2 6.7 2 12.5S6.7 23 12.5 23 23 18.3 23 12.5 18.3 2 12.5 2zm2.1 14.1l-1.3 3.3H11l3.5-8.5V2.2h2.1v8.7l2.5-3.3h2.1L17.7 11l3.2 5.1h-2.2l-2.1-3.2-2.1 3.2z" fill="#fc3f1d" />
                                            </svg>
                                        }
                                        label="Войти с Яндекс ID"
                                        onClick={handleYandexLogin}
                                        disabled={isLoading}
                                    />

                                    {/* Telegram Button */}
                                    <SocialLoginButton
                                        icon={
                                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="#3390ec" />
                                            </svg>
                                        }
                                        label="Войти через Telegram"
                                        onClick={() => setShowTelegramWidget(true)}
                                        disabled={isLoading}
                                    />

                                    {/* VK Button */}
                                    <SocialLoginButton
                                        icon={
                                            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                                                <path d="M12.78 17.77h1.18s.36-.04.54-.24c.16-.18.16-.52.16-.52s-.02-1.6.72-1.84c.72-.24 1.66 1.56 2.64 2.26.74.52 1.32.4 1.32.4l2.64-.04s1.38-.08.72-1.16c-.04-.08-.32-.76-1.72-2.14-1.46-1.44-1.26-1.22.5-3.72 1.06-1.52 1.5-2.46 1.36-2.86-.12-.36-.9-.28-.9-.28l-2.98.02s-.22-.04-.38.06c-.16.1-.26.32-.26.32s-.48 1.26-1.1 2.34c-1.34 2.26-1.86 2.38-2.08 2.24-.52-.32-.38-1.28-.38-1.96 0-2.14.32-3.02-.64-3.26-.32-.08-.56-.12-1.38-.14-.06 0-1.14-.02-1.82.32-.44.22-.78.72-.58.74.26.04 1 .18 1.34.64.46.6.44 1.96.44 1.96s.26 2.52-.62 2.82c-.6.22-1.44-.9-2.3-2.38-.58-1.02-1.04-2.16-1.04-2.16s-.08-.2-.24-.32c-.18-.12-.44-.18-.44-.18l-2.82.02s-.42.02-.58.2c-.14.16-.02.48-.02.48s2.22 5.2 4.74 7.82c2.32 2.4 4.94 2.24 4.94 2.24z" fill="#0077ff" />
                                            </svg>
                                        }
                                        label="Войти с VK ID"
                                        onClick={handleVKLogin}
                                        disabled={isLoading}
                                    />

                                    {/* Divider */}
                                    <div className="flex items-center gap-4 my-4">
                                        <div className="h-[1px] flex-1 bg-white/10" />
                                        <span className="text-[12px] text-gray-500 font-semibold font-display">или</span>
                                        <div className="h-[1px] flex-1 bg-white/10" />
                                    </div>

                                    {/* Email Button */}
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        whileHover={{ scale: 1.01 }}
                                        onClick={() => setShowMailInput(true)}
                                        disabled={isLoading}
                                        className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-white/95 text-black font-display font-black text-[15px] transition-all duration-200 active:scale-[0.98] shadow-xl text-center flex items-center justify-center gap-2"
                                    >
                                        <Mail size={16} />
                                        <span>Вход через почту</span>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Dev Login */}
                        {import.meta.env.DEV && (
                            <button
                                onClick={handleDevLogin}
                                className="mt-4 w-full text-xs text-gray-500 hover:text-white transition-colors underline cursor-pointer text-center"
                            >
                                Войти как разработчик (DEV)
                            </button>
                        )}
                    </div>

                    {/* Legal footer */}
                    <p className="mt-8 text-[11px] text-gray-500/80 leading-relaxed text-center font-display font-medium">
                        Продолжая, вы принимаете наше{' '}
                        <a href="/terms" className="underline hover:text-white">Пользовательское соглашение</a>{' '}
                        и{' '}
                        <a href="/privacy" className="underline hover:text-white">Политику Конфиденциальности</a>
                    </p>
                </div>

                {/* Right Side: Mockup Image (Photo 1) */}
                <div className="hidden md:flex flex-col items-center justify-center p-8 bg-black/40 relative overflow-hidden">
                    <img 
                        src="/login_mockup.png" 
                        alt="Pixel Interface Mockup"
                        className="w-full h-auto object-contain rounded-2xl drop-shadow-2xl select-none"
                    />

                    {/* Close cosmetic X button like Photo 1 */}
                    <button 
                        onClick={() => window.history.back()}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WebLogin;
