// Virtual module declarations for Vite plugins
declare module 'virtual:pwa-register/react' {
    export function useRegisterSW(options?: any): any;
}

declare module 'virtual:pwa-register' {
    export function registerSW(options?: any): any;
}
