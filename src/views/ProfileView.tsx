import React from 'react';
import { ListRow, Block } from '../components/ui';
import { Wallet, Globe, Sun, Moon, LogOut, Award } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';
import SEO from '../components/SEO/SEO';
import { SkeletonProfile } from '../components/ui/Skeleton';

const ProfileView: React.FC<any> = ({ onOpenPayment }) => {
    const { user, stats, isLoading } = useUser();
    const { lang, setLang, t } = useLanguage();
    const { themeMode, setThemeMode } = useTheme();
    const { playClick } = useSound();

    if (isLoading) return <SkeletonProfile />;

    const displayName = user?.first_name || 'Пользователь';
    const username = user?.username ? `@${user.username}` : user?.telegram_id ? `ID: ${user.telegram_id}` : '';
    const initials = displayName.substring(0, 2).toUpperCase();

    const handleLogout = () => {
        playClick();
        localStorage.removeItem('bazzar_web_auth');
        localStorage.removeItem('bazzar_dev_override');
        if ((window as any).Telegram?.WebApp?.close) {
            (window as any).Telegram.WebApp.close();
        } else {
            window.location.reload();
        }
    };

    const isDark = themeMode === 'dark' || (themeMode === 'system' && (window as any).Telegram?.WebApp?.colorScheme !== 'light');

    return (
        <div className="min-h-screen bg-bg-primary text-white pb-28 relative overflow-y-auto w-full selection:bg-[#3390ec]/30 md:max-w-2xl md:mx-auto md:px-6">
            <SEO 
                title="Профиль — Bazzar Pixel"
                description="Настройки аккаунта и баланс зарядов"
            />

            {/* Premium Dynamic Backdrops */}
            <div className="bg-glow-container">
                <div className="bg-glow-blue" />
                <div className="bg-glow-purple" />
            </div>

            {/* Header: Avatar + Username / Telegram Handle */}
            <div className="flex flex-col items-center mb-6 pt-4">
                <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-tr from-[#3390ec] via-[#a855f7] to-[#ec4899] flex items-center justify-center text-[40px] font-black text-white shadow-2xl border border-white/20 relative">
                    {initials}
                </div>
                <h1 className="text-[28px] font-black font-display mt-3 tracking-[-0.6px] text-white">{displayName}</h1>
                {username && (
                    <p className="text-[15px] text-[#3390ec] font-bold font-display tracking-tight mt-0.5">
                        {username}
                    </p>
                )}
            </div>

            <div className="space-y-6 px-4">

                {/* Level / XP Bar */}
                <div className="bg-bg-elevated/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" />
                            <span className="text-[15px] font-bold text-white font-display">
                                {t('profile.level') || 'Уровень'} {stats?.level || 1}
                            </span>
                        </div>
                        <span className="text-[13px] text-gray-400 font-medium font-display">
                            {stats?.xp || 0} XP
                        </span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, ((stats?.xp || 0) % 100) || (stats?.xp ? 100 : 0)))}%` }}
                        />
                    </div>
                </div>

                {/* Balance Display & Top-up Button */}
                <Block>
                    <ListRow
                        icon={<Wallet size={16} className="text-white" />}
                        iconColor="bg-gradient-to-r from-orange-500 to-amber-500"
                        label={t('profile.walletTokens') || 'Баланс зарядов'}
                        value={
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-amber-400">{stats?.current_balance || 0} ⚡</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playClick();
                                        onOpenPayment();
                                    }}
                                    className="px-2.5 py-1 bg-accent-blue hover:bg-accent-blue/80 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm"
                                >
                                    + Пополнить
                                </button>
                            </div>
                        }
                        onClick={() => { playClick(); onOpenPayment(); }}
                        isLast
                    />
                </Block>

                {/* Settings: Theme & Language */}
                <Block>
                    <ListRow
                        icon={isDark ? <Moon size={16} className="text-white" /> : <Sun size={16} className="text-white" />}
                        iconColor="bg-gradient-to-r from-purple-500 to-indigo-500"
                        label="Тема оформления"
                        value={isDark ? 'Тёмная' : 'Светлая'}
                        onClick={() => {
                            playClick();
                            setThemeMode(isDark ? 'light' : 'dark');
                        }}
                    />
                    <ListRow
                        icon={<Globe size={16} className="text-white" />}
                        iconColor="bg-gradient-to-r from-indigo-500 to-blue-500"
                        label={t('profile.interfaceLang') || 'Язык интерфейса'}
                        value={lang === 'ru' ? 'Русский' : 'English'}
                        onClick={() => {
                            playClick();
                            setLang(lang === 'ru' ? 'en' : 'ru');
                        }}
                        isLast
                    />
                </Block>

                {/* Logout / Exit Button */}
                <div className="pt-2">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-[16px] py-3.5 rounded-2xl border border-red-500/20 active:opacity-80 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        <span>Выйти</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProfileView;
