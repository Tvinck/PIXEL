// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    MessageSquare, 
    Folder, 
    Grid, 
    Compass, 
    Plus, 
    User, 
    ChevronUp, 
    ChevronDown, 
    LifeBuoy, 
    Megaphone, 
    Sun, 
    Moon, 
    Monitor, 
    LogOut,
    Zap
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import PixelLogo from '../ui/PixelLogo';

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
            ? 'bg-white/5 text-white font-bold'
            : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'
            }`}
    >
        {isActive && (
            <motion.div
                layoutId="sidebarActiveIndicator"
                className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-[#3390ec] to-[#a855f7]"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
        )}
        <Icon
            size={18}
            className={`transition-colors duration-300 ${isActive ? 'text-[#3390ec]' : 'group-hover:text-white'}`}
        />
        <span className="text-sm tracking-tight font-display">{label}</span>
    </button>
);

const Sidebar = ({ activeTab, onTabChange, onCreateClick }) => {
    const { user, stats } = useUser();
    const { themeMode, setThemeMode } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (tab) => activeTab === tab;

    // Handle clicks outside menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('bazzar_web_auth');
        window.location.reload();
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#07060f] border-r border-white/5 flex flex-col z-50 hidden md:flex select-none">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
                <div className="w-9 h-9 bg-gradient-to-tr from-[#3390ec] to-[#3b82f6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <PixelLogo size={24} color="white" eyeColor="#1e3a8a" />
                </div>
                <h1 className="text-lg font-display font-black tracking-tight text-white">Pixel AI</h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-1.5 mt-6">
                <SidebarItem
                    icon={MessageSquare}
                    label="Новый чат"
                    isActive={location.pathname.startsWith('/chat')}
                    onClick={() => navigate('/chat/private')}
                />
                <SidebarItem
                    icon={Folder}
                    label="Мои файлы"
                    isActive={isActive('history')}
                    onClick={() => onTabChange('history')}
                />
                <SidebarItem
                    icon={Grid}
                    label="Все нейросети"
                    isActive={isActive('home') && !location.pathname.startsWith('/chat')}
                    onClick={() => onTabChange('home')}
                />
                <SidebarItem
                    icon={Compass}
                    label="Вдохновение"
                    isActive={isActive('gallery')}
                    onClick={() => onTabChange('gallery')}
                />
            </nav>

            {/* Create Button */}
            <div className="px-4 mb-4">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onCreateClick}
                    className="w-full py-3.5 bg-gradient-to-r from-[#3390ec] via-[#a855f7] to-[#ec4899] rounded-xl text-white font-display font-bold text-sm shadow-lg shadow-purple-500/15 flex items-center justify-center gap-2 group transition-all duration-300"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Создать</span>
                </motion.button>
            </div>

            {/* User Info Block with Redesigned Dropdown Popover */}
            <div className="p-4 border-t border-white/5 bg-[#0c0a18]/40 backdrop-blur-md relative" ref={menuRef}>
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-20 left-4 right-4 bg-[#12111a] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-0.5"
                        >
                            {/* Profile option */}
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onTabChange('profile');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all duration-200 text-[14px] font-semibold text-left"
                            >
                                <User size={16} className="text-gray-400" />
                                <span>Профиль</span>
                            </button>

                            {/* Support option */}
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    window.open('https://t.me/bazzar_pixel_bot', '_blank');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all duration-200 text-[14px] font-semibold text-left"
                            >
                                <LifeBuoy size={16} className="text-gray-400" />
                                <span>Поддержка</span>
                            </button>

                            {/* What's new option */}
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all duration-200 text-[14px] font-semibold text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Megaphone size={16} className="text-gray-400" />
                                    <span>Что нового?</span>
                                </div>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#3390ec]" />
                            </button>

                            {/* Divider */}
                            <div className="h-[1px] bg-white/5 my-1.5" />

                            {/* Theme switcher segment */}
                            <div className="bg-[#242426]/40 p-1 rounded-xl flex items-center justify-between gap-1 mb-1.5">
                                <button
                                    onClick={() => setThemeMode('system')}
                                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition-all ${
                                        themeMode === 'system' ? 'bg-[#242426] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Системная тема"
                                >
                                    <Monitor size={14} />
                                </button>
                                <button
                                    onClick={() => setThemeMode('light')}
                                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition-all ${
                                        themeMode === 'light' ? 'bg-[#242426] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Светлая тема"
                                >
                                    <Sun size={14} />
                                </button>
                                <button
                                    onClick={() => setThemeMode('dark')}
                                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition-all ${
                                        themeMode === 'dark' ? 'bg-[#242426] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                                    }`}
                                    title="Тёмная тема"
                                >
                                    <Moon size={14} />
                                </button>
                            </div>

                            {/* Logout option */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 text-[14px] font-semibold text-left"
                            >
                                <LogOut size={16} />
                                <span>Выход</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* User card trigger */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-full flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 border border-transparent active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden border border-white/10 flex-shrink-0 flex items-center justify-center text-white font-display font-black text-sm">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="User avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{(user?.username || 'G')[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="text-left min-w-0">
                            <p className="text-sm font-bold text-white truncate font-display">
                                {user?.username || 'Guest'}
                            </p>
                            <p className="text-xs text-gray-400 font-semibold mt-0.5">
                                {stats?.current_balance ? `${stats.current_balance} ★` : 'Free'}
                            </p>
                        </div>
                    </div>
                    {isMenuOpen ? (
                        <ChevronDown size={16} className="text-gray-400 hover:text-white" />
                    ) : (
                        <ChevronUp size={16} className="text-gray-400 hover:text-white" />
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
