
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const PendingApprovalBanner: React.FC = () => {
    const { user } = useAuth();
    const bannerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const updateHeight = () => {
            if (bannerRef.current && user && !user.isApproved && !user.isAdmin) {
                const height = bannerRef.current.offsetHeight;
                document.documentElement.style.setProperty('--banner-height', `${height}px`);
                document.body.style.paddingTop = `${height}px`;
            } else {
                document.documentElement.style.setProperty('--banner-height', '0px');
                document.body.style.paddingTop = '0px';
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => {
            window.removeEventListener('resize', updateHeight);
            document.documentElement.style.setProperty('--banner-height', '0px');
            document.body.style.paddingTop = '0px';
        };
    }, [user]);

    if (!user || user.isApproved || user.isAdmin) return null;

    return (
        <motion.div
            ref={bannerRef}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full bg-[#0a0a0a]/95 border-b border-amber-500/20 backdrop-blur-xl fixed top-0 left-0 z-[1000] shadow-[0_4px_30px_rgba(0,0,0,0.8)] overflow-hidden"
        >
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-2 flex items-center justify-center gap-3 relative z-10">
                {/* Status Indicator */}
                <div className="size-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <span className="material-symbols-outlined text-amber-500 text-[14px] font-black animate-pulse">verified_user</span>
                </div>

                {/* Text Content */}
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-0.5 sm:gap-2">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-amber-500 leading-none">
                        Accesso Limitato
                    </span>
                    <div className="h-2 w-px bg-white/10 hidden sm:block self-center" />
                    <p className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-widest text-center leading-none">
                        Verifica account <span className="text-white/20">in corso (max 24h)</span>
                    </p>
                </div>

                {/* Tactical Protocol Label (Desktop only for balance) */}
                <div className="hidden sm:flex items-center gap-1 opacity-40">
                    <div className="size-1 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-white tracking-tighter">SEC_PROT_V4</span>
                </div>
            </div>
        </motion.div>
    );
};

export default PendingApprovalBanner;
