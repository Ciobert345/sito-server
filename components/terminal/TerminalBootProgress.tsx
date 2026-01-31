import React from 'react';
import { motion } from 'framer-motion';

export const TerminalBootProgress: React.FC = () => {
    return (
        <div className="absolute bottom-20 flex flex-col items-center gap-3 w-full pointer-events-none z-50">
            {/* Progress Label */}
            <div className="flex justify-between w-[600px] text-[10px] text-emerald-500/50 font-mono tracking-widest pl-1">
                <span>SYSTEM_INIT</span>
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    _
                </motion.span>
            </div>

            {/* Main Progress Bar */}
            <div className="w-[600px] h-6 bg-black/40 border border-emerald-500/30 p-0.5 relative overflow-hidden backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                        duration: 3.8, // Slightly less than timeout to ensure it hits 100% visually
                        ease: "easeInOut"
                    }}
                    className="h-full bg-emerald-500 relative"
                >
                    <motion.div
                        className="absolute inset-0 w-full h-full"
                        style={{ backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)', backgroundSize: '24px 24px' }}
                        animate={{ backgroundPosition: ["0px 0px", "48px 48px"] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-white/50 shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                </motion.div>
            </div>

            {/* Status Text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-[600px] text-right"
            >
                <motion.span
                    className="text-[9px] text-emerald-500/40 font-mono"
                >
                    LOADING_MODULES...
                </motion.span>
            </motion.div>
        </div >
    );
};
