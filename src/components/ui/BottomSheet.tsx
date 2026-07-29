import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { cn } from '../../utils/cn';

const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = ['40%', '85%'],
  defaultSnap = 0,
  showHandle = true,
  showOverlay = true,
  className = '',
}: any) => {
  const sheetRef = useRef<any>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: any) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Haptic feedback on open
  useEffect(() => {
    if (isOpen) {
      (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    }
  }, [isOpen]);

  // Swipe gesture for closing
  const bind = useDrag(
    ({ movement: [, my], velocity: [, vy], last }: any) => {
      if (last) {
        if (my > 120 || vy > 0.4) {
          (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
          onClose();
        }
      }
    },
    { 
      axis: 'y',
      filterTaps: true,
      rubberband: true,
    }
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-[4px]"
            />
          )}

          {/* Sheet */}
          <motion.div
            {...(bind() as any)}
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring' as const,
              damping: 26,
              stiffness: 220,
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[70]",
              "bg-[#0a0915]/90 backdrop-blur-3xl rounded-t-[32px]",
              "border-t border-white/10 shadow-[0_-10px_50px_rgba(0,0,0,0.7)]",
              "flex flex-col touch-none",
              className
            )}
            style={{ 
              maxHeight: snapPoints[defaultSnap] || '90vh'
            }}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3.5 pb-4 cursor-grab active:cursor-grabbing">
                <div className="w-14 h-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5">
                <h3 className="text-white font-display font-bold text-xl tracking-tight">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 active:scale-90 transition-all font-sans"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-12 pt-3 scrollbar-none overscroll-contain touch-auto font-body">
              {children}
            </div>

            {/* iOS Bottom Padding */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
