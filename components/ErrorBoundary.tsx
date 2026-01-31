import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-mono">
                    <div className="max-w-xl w-full glass-card rounded-2xl border border-red-500/20 p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm">
                            <span className="material-symbols-outlined text-8xl text-red-500">terminal</span>
                        </div>

                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                                    <span className="material-symbols-outlined">warning</span>
                                </div>
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Kernel Panic</h2>
                            </div>

                            <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                                <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">Error Trace</span>
                                <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                    {this.state.error?.message || 'Unknown runtime exception detected.'}
                                </p>
                            </div>

                            <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                                Site integrity compromised. The automated recovery system is attempting to isolate the fault.
                            </div>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                            >
                                Re-initialize Core
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
