import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="glass-card bg-red-500/10 border-red-500/20 p-8 rounded-2xl text-center flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
                    <h2 className="text-lg font-black uppercase text-white tracking-widest">Dashboard Error</h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed max-w-[240px]">
                        Un errore critico ha impedito il caricamento della dashboard. Riprova a ricaricare la pagina.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                        Ricarica Pagina
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
