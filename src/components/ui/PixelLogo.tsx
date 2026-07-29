import React from 'react';

const PixelLogo = ({ className = '', size = 64, color = 'currentColor', eyeColor = '#07060f' }) => {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
        >
            {/* Mascot Starburst Body */}
            <path 
                d="M50 4 C51.8 22 63.6 23.6 71.5 17.6 C79.5 11.6 75.5 33.6 91.5 37.6 C103.5 41.6 79.5 47.6 82.5 57.6 C85.5 71.6 70.5 67.6 65.5 79.6 C60.5 87.6 53.5 95.6 49.5 91.6 C45.5 95.6 38.5 87.6 33.5 79.6 C28.5 67.6 13.5 71.6 16.5 57.6 C19.5 47.6 -4.5 41.6 7.5 37.6 C23.5 33.6 19.5 11.6 27.5 17.6 C35.4 23.6 47.2 22 49 4 Z" 
                fill={color}
            />
            {/* Left Eye */}
            <ellipse cx="44" cy="50" rx="3.5" ry="7" fill={eyeColor} />
            {/* Right Eye */}
            <ellipse cx="56" cy="50" rx="3.5" ry="7" fill={eyeColor} />
        </svg>
    );
};

export default PixelLogo;
