// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Onboarding from '../components/Onboarding';

const GuideView = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        // Go back to the previous screen when the user closes or finishes the guide
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-[#070514] flex items-center justify-center">
            <Onboarding onComplete={handleClose} />
        </div>
    );
};

export default GuideView;
