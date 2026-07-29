import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Plus, Clock, User } from 'lucide-react';

interface BottomNavProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onCreateClick?: () => void;
    isVisible?: boolean;
    zIndex?: number;
}

const NAV_ITEMS = [
    {
        id: 'ideas',
        label: 'Идеи',
        icon: Sparkles,
        path: '/',
    },
    {
        id: 'create',
        label: 'Создать',
        icon: Plus,
        path: '/create',
    },
    {
        id: 'history',
        label: 'История',
        icon: Clock,
        path: '/history',
    },
    {
        id: 'profile',
        label: 'Профиль',
        icon: User,
        path: '/profile',
    },
];

const BottomNav: React.FC<BottomNavProps> = ({
    activeTab,
    onTabChange,
    onCreateClick,
    isVisible = true,
    zIndex = 50,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isTabActive = (id: string, path: string) => {
        if (activeTab) {
            if (id === 'ideas' && (activeTab === 'ideas' || activeTab === 'home' || activeTab === '/')) {
                return true;
            }
            return activeTab === id || activeTab === path;
        }
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path;
    };

    const handleTabClick = (item: typeof NAV_ITEMS[number]) => {
        if (item.id === 'create' && onCreateClick) {
            onCreateClick();
            return;
        }
        if (onTabChange) {
            onTabChange(item.id);
        } else {
            navigate(item.path);
        }
    };

    return (
        <div
            style={{ zIndex }}
            className={`fixed bottom-4 left-4 right-4 max-w-md mx-auto transition-transform duration-300 ease-out ${
                !isVisible ? 'translate-y-[120%]' : 'translate-y-0'
            }`}
        >
            <nav className="glass-panel rounded-2xl p-1.5 flex justify-between items-center relative border border-white/10 shadow-2xl bg-black/60 backdrop-blur-xl">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = isTabActive(item.id, item.path);

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabClick(item)}
                            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 relative rounded-xl transition-colors duration-200 ${
                                isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabPill"
                                    transition={{ type: 'spring' as const, stiffness: 380, damping: 30 }}
                                    className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                                />
                            )}
                            <Icon size={20} className="relative z-10" />
                            <span className="text-[11px] font-medium mt-1 relative z-10 tracking-tight">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
