import React, { Component, useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Terminal, HelpCircle } from 'lucide-react';

// Functional wrapper for default fallback UI to support hooks (like useState for details toggle)
const DefaultErrorFallback = ({ error, reset }: any) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      reset();
      setIsResetting(false);
    }, 600);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full py-12 px-6 text-center relative overflow-hidden font-body text-white bg-[#07060f]">
      {/* Brand Glowing Accents */}
      <div className="absolute w-[350px] h-[350px] -top-[50px] left-1/2 -translate-x-1/2 bg-red-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] -bottom-[100px] left-1/2 -translate-x-1/2 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-md p-8 rounded-[28px] bg-gradient-to-b from-[#121124]/90 to-[#0b0a14]/90 border border-white/10 shadow-2xl backdrop-blur-xl relative">
        {/* Glow behind the icon */}
        <div className="absolute -top-[30px] left-1/2 -translate-x-1/2 w-16 h-16 bg-red-500/20 rounded-full blur-xl z-0" />
        
        {/* Warning Icon Container */}
        <div className="w-16 h-16 rounded-[22px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative z-10">
          <AlertTriangle size={28} className="text-red-500 animate-pulse" />
        </div>

        {/* Header Title */}
        <h2 className="text-[22px] font-extrabold tracking-tight mb-2 font-display bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
          Что-то пошло не так
        </h2>
        
        {/* Helper text */}
        <p className="text-[13.5px] text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
          Произошла непредвиденная ошибка в интерфейсе. Мы уже знаем о ней и работаем над исправлением.
        </p>

        {/* Collapsible Error Log */}
        {error && (
          <div className="w-full mb-6 text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/5 text-[12px] text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer select-none"
            >
              <span className="flex items-center gap-2 font-medium">
                <Terminal size={13} className="text-purple-400" />
                Технические детали
              </span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showDetails && (
              <div className="mt-2 w-full bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-red-300/90 overflow-x-auto max-h-40 scrollbar-thin select-text">
                <div className="font-semibold text-red-400 mb-1">{error.name}: {error.message}</div>
                {error.stack && (
                  <pre className="whitespace-pre-wrap text-[10px] text-slate-500 mt-1">
                    {error.stack.split('\n').slice(1, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 active:scale-[0.98] text-white font-semibold text-[14px] shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isResetting ? "animate-spin" : ""} />
            {isResetting ? "Перезапуск..." : "Попробовать снова"}
          </button>
          
          <button
            onClick={handleReload}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 active:scale-[0.98] text-slate-300 hover:text-white font-semibold text-[14px] transition-all cursor-pointer"
          >
            Обновить страницу
          </button>
        </div>

        {/* Footer Support Link */}
        <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-500">
          <HelpCircle size={12.5} />
          <span>Нужна помощь? </span>
          <a
            href="https://t.me/BAZZAR_HELP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors"
          >
            Служба поддержки
          </a>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo });
    
    // Log error (Sentry integration can go here)
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Analytics if available
    if ((window as any).amplitude) {
      (window as any).amplitude.track('app_error_caught', {
        error_message: error.message,
        component: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback({ 
          error: this.state.error,
          reset: this.handleReset 
        });
      }
      
      // Default fallback using functional component to support hooks
      return <DefaultErrorFallback error={this.state.error} reset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
