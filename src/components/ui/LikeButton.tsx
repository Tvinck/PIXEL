import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import galleryAPI from '../../lib/galleryAPI';
import { useUser } from '../../context/UserContext';

const triggerHaptic = (style = 'medium') => {
    if ((window as any).Telegram && (window as any).Telegram.WebApp && (window as any).Telegram.WebApp.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
};

const LikeButton = ({ creationId, initialLiked = false, initialCount = 0, size = "normal", className = "" }: any) => {
    const { user } = useUser() as any;
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(typeof initialCount === 'number' ? initialCount : (parseInt(String(initialCount)) || 0));
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        setLiked(initialLiked);
        setCount(typeof initialCount === 'number' ? initialCount : (parseInt(String(initialCount)) || 0));
    }, [initialLiked, initialCount]);

    const handleLike = async (e: any) => {
        e.stopPropagation();
        if (!user) {
            triggerHaptic('error');
            // TODO: Trigger auth modal or shake effect?
            return;
        }
        if (isThinking) return;

        triggerHaptic('medium');

        // Optimistic update
        const newLikedState = !liked;
        setLiked(newLikedState);
        setCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
        setIsThinking(true);

        try {
            if (newLikedState) {
                await galleryAPI.likeCreation(creationId, user.id);
            } else {
                await galleryAPI.unlikeCreation(creationId, user.id);
            }
        } catch (error) {
            console.error('Like failed:', error);
            // Revert on error
            setLiked(!newLikedState);
            setCount(prev => !newLikedState ? prev + 1 : Math.max(0, prev - 1));
            triggerHaptic('error');
        } finally {
            setIsThinking(false);
        }
    };

    const isSmall = size === "small";

    return (
        <motion.button
            onClick={handleLike}
            whileTap={{ scale: 0.85 }}
            className={`flex items-center gap-1.5 ${isSmall ? 'bg-black/30 px-2 py-1' : 'bg-white/10 backdrop-blur-md px-3 py-1.5'} rounded-full border border-white/10 justify-center transition-colors group ${liked ? 'border-red-500/30 bg-red-500/10' : ''} ${className}`}
        >
            <motion.div
                animate={liked ? {
                    scale: [1, 1.4, 1],
                    color: "#ef4444", // red-500
                } : {
                    scale: 1,
                    color: "#ffffff"
                }}
                transition={{ duration: 0.4, type: "spring" }}
            >
                <Heart size={isSmall ? 10 : 14} className={liked ? "fill-current" : "group-hover:opacity-80"} />
            </motion.div>
            <span className={`text-white font-bold tabular-nums ${isSmall ? 'text-[9px]' : 'text-[11px]'}`}>
                {count > 0 ? count : ''}
            </span>
        </motion.button>
    );
};

export default LikeButton;
