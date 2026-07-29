import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SpringCounter } from '../SpringAnimations';
import { useUser } from '../../context/UserContext';
import PixelLogo from '../ui/PixelLogo';

interface HeaderProps {
    onOpenPayment?: () => void;
    onOpenProfile?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenPayment }) => {
    const { stats } = useUser();
    const balance = stats?.current_balance || 0;
    const navigate = useNavigate();

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-[100] safe-area-top"
            style={{
                background: 'linear-gradient(180deg, rgba(7, 6, 15, 0.9) 0%, rgba(7, 6, 15, 0.6) 80%, transparent 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}
        >
            <div className="px-4 py-3 flex items-center justify-between max-w-[480px] md:max-w-none mx-auto">
                {/* Left side: App Logo & Name */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2.5 group cursor-pointer text-left active:scale-95 transition-transform"
                >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3390ec] to-[#a855f7] flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <PixelLogo size={20} color="white" eyeColor="#07060f" />
                    </div>
                    <span className="text-lg font-display font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                        Pixel
                    </span>
                </button>

                {/* Right side: Balance display with top-up button */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenPayment}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg group hover:bg-white/10 transition-all cursor-pointer"
                >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#3390ec] to-[#a855f7] flex items-center justify-center shadow-inner">
                        <Zap size={11} className="text-white fill-white" />
                    </div>
                    <span className="text-white font-display font-black text-[13.5px] tracking-tight">
                        <SpringCounter value={balance} />
                    </span>
                    <div className="w-4.5 h-4.5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors ml-0.5">
                        <Plus size={11} className="text-white" />
                    </div>
                </motion.button>
            </div>
        </motion.header>
    );
};

export default Header;
