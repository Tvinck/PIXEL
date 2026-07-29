// Global type declarations for Telegram WebApp SDK and other third-party globals
declare global {
    interface Window {
        Telegram?: {
            WebApp?: any;
            [key: string]: any;
        };
        amplitude?: any;
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
        __REPLICATE_API_TOKEN__?: string;
        __SUPABASE_URL__?: string;
        __SUPABASE_ANON_KEY__?: string;
        __bazzar_auth__?: any;
        YaPay?: any;
        YaSendSuggestToken?: any;
        TBankPay?: any;
        PaymentIntegration?: any;
        Sentry?: any;
        posthog?: any;
        mixpanel?: any;
        fbq?: (...args: any[]) => void;
        ym?: (...args: any[]) => void;
        _tmr?: any;
        VK?: any;
        SpeechRecognition?: any;
        webkitSpeechRecognition?: any;
        YaAuthSuggest?: any;
        onTelegramAuth?: any;
    }
}

declare module 'virtual:pwa-register/react' {
    export function useRegisterSW(options?: any): any;
}

export {};
