/**
 * Tracking System (Frontend Analytics)
 * Единая точка входа для всей аналитики поведения в приложении.
 * Позволяет легко подключать GA4, PostHog, Amplitude, LogRocket и т.д.
 */

class TrackingService {
    initialized: boolean = false;
    userId: any = null;
    userTraits: any = {};

    constructor() {
        this.initialized = false;
        this.userId = null;
        this.userTraits = {};
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log('📊 Tracking Service Initialized');
    }

    identify(userId: any, traits: any = {}) {
        this.userId = userId;
        this.userTraits = traits;
        console.log(`[Tracking] Identify: ${userId}`, traits);

        if ((window as any).Sentry) {
            (window as any).Sentry.setUser({ id: userId, ...traits });
        }
    }

    track(eventName: any, properties: any = {}) {
        try {
            const eventData = {
                timestamp: new Date().toISOString(),
                ...properties
            };

            if (import.meta.env.DEV) {
                console.log(`[Tracking] Track: ${eventName}`, eventData);
            }

            if ((window as any).Sentry) {
                (window as any).Sentry.addBreadcrumb({
                    category: 'user-action',
                    message: eventName,
                    data: properties,
                    level: 'info',
                });
            }
        } catch (error) {
            console.warn('[Tracking] Failed to track event:', eventName, error);
        }
    }

    pageView(pageName: any, properties: any = {}) {
        this.track('page_view', { page: pageName, ...properties });
    }

    reset() {
        this.userId = null;
        this.userTraits = {};
        if ((window as any).Sentry) {
            (window as any).Sentry.configureScope((scope: any) => scope.setUser(null));
        }
    }
}

export const tracking = new TrackingService();

export const EVENTS = {
    LOGIN_SUCCESS: 'auth_login_success',
    LOGIN_ERROR: 'auth_login_error',
    SIGNUP_START: 'auth_signup_start',
    GENERATION_STARTED: 'gen_started',
    GENERATION_COMPLETED: 'gen_completed',
    GENERATION_FAILED: 'gen_failed',
    GENERATION_CANCELED: 'gen_canceled',
    TAB_CHANGED: 'ui_tab_changed',
    THEME_CHANGED: 'ui_theme_changed',
    MODAL_OPENED: 'ui_modal_opened',
    BUTTON_CLICKED: 'ui_button_clicked',
    TRAINING_STARTED: 'feature_training_started',
    FACESWAP_STARTED: 'feature_faceswap_started',
};

import { useEffect } from 'react';

export const useTracking = () => {
    return {
        track: (name: any, props?: any) => tracking.track(name, props),
        identify: (id: any, traits?: any) => tracking.identify(id, traits),
        events: EVENTS
    };
};
