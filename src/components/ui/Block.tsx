import React from 'react';

/**
 * iOS/Telegram-style Block
 * Used to group related UI elements (like list rows) inside a themed glass container.
 */
interface BlockProps {
    children: React.ReactNode;
    className?: string;
    title?: any;
}

const Block: React.FC<BlockProps> = ({ children, className = '', title }) => (
    <div className="mb-6 w-full">
        {title && (
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4 font-display">
                {title}
            </p>
        )}
        <div className={`glass-card overflow-hidden w-full ${className}`}>
            {children}
        </div>
    </div>
);

export default Block;
