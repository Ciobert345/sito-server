import React from 'react';
import { motion } from 'framer-motion';

interface TerminalMapProps {
    coords: { lat: number; lon: number };
}

export const TerminalMap: React.FC<TerminalMapProps> = ({ coords }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "circOut" }}
            className="relative w-full h-full flex items-center justify-center border border-emerald-500/20 bg-black/40 rounded-none overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]"
        >
            {/* DECORATIVE CORNERS */}
            <div className="absolute top-2 left-2 w-16 h-16 border-t border-l border-emerald-500/30 rounded-none pointer-events-none z-20">
                <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-500/20" />
                <div className="absolute top-1 left-2 text-[8px] text-emerald-500/40 font-mono">SYS.INIT.V2</div>
            </div>
            <div className="absolute top-2 right-2 w-16 h-16 border-t border-r border-emerald-500/30 rounded-none pointer-events-none z-20">
                <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500/20" />
                <div className="absolute top-1 right-2 text-[8px] text-emerald-500/40 font-mono text-right">SECURE.CONN<br />PORT: 443</div>
            </div>
            <div className="absolute bottom-2 left-2 w-16 h-16 border-b border-l border-emerald-500/30 rounded-none pointer-events-none z-20">
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-emerald-500/20" />
                <div className="absolute bottom-1 left-2 flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="size-1 bg-emerald-500/40 rounded-none" />
                    ))}
                </div>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-16 border-b border-r border-emerald-500/30 rounded-none pointer-events-none z-20">
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500/20" />
                <div className="absolute bottom-1 right-2 text-[8px] text-emerald-500/40 font-mono">VERIFIED</div>
            </div>

            {/* ATMOSPHERIC BACKDROP - Enhanced and consistent */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle at 25% 25%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16,185,129,0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%), linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)'
                }}
            />

            {/* CRT SCANLINE EFFECT - More subtle */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
                style={{ background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(16,185,129,0.3) 3px)' }}
            />

            {/* WORLD GRID BACKGROUND - Enhanced visibility */}
            <div className="absolute inset-0 z-0 opacity-[0.18]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.6) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* MAP CONTENT */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden z-10 p-3 sm:p-4">
                {/* ASCII MAP */}
                <pre className="font-mono text-[6px] sm:text-[8px] md:text-[10px] leading-normal text-emerald-500/80 whitespace-pre text-center drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
                    {`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣄⣠⣀⡀⣀⣠⣤⣤⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣄⢠⣠⣼⣿⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⢠⣤⣦⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⢦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣟⣾⣿⣽⣿⣿⣅⠈⠉⠻⣿⣿⣿⣿⣿⡿⠇⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⢀⡶⠒⢉⡀⢠⣤⣶⣶⣿⣷⣆⣀⡀⠀⢲⣖⠒⠀⠀⠀⠀⠀⠀⠀
⢀⣤⣾⣶⣦⣤⣤⣶⣿⣿⣿⣿⣿⣿⣽⡿⠻⣷⣀⠀⢻⣿⣿⣿⡿⠟⠀⠀⠀⠀⠀⠀⣤⣶⣶⣤⣀⣀⣬⣷⣦⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣦⣤⣦⣼⣀⠀
⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠓⣿⣿⠟⠁⠘⣿⡟⠁⠀⠘⠛⠁⠀⠀⢠⣾⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠏⠙⠁
⠀⠸⠟⠋⠀⠈⠙⣿⣿⣿⣿⣿⣿⣾⣦⡄⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⣼⣆⢘⣿⣯⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡉⠉⢱⡿⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⡿⠦⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡗⠀⠈⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣉⣿⡿⢿⢷⣾⣾⣿⣞⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⣠⠟⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⠿⠿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣾⣿⣿⣷⣦⣶⣦⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠈⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣤⡖⠛⠶⠤⡀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠙⣿⣿⠿⢻⣿⣿⡿⠋⢩⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠧⣤⣦⣤⣄⡀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠘⣧⠀⠈⣹⡻⠇⢀⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⣿⣿⣤⣀⡀⠀⠀⠀⠀⠀⠀⠈⢽⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠹⣷⣴⣿⣷⢲⣦⣤⡀⢀⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣷⢀⡄⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠂⠛⣆⣤⡜⣟⠋⠙⠂⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⠉⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣾⣿⣿⣿⣿⣆⠀⠰⠄⠀⠉⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⠿⠿⣿⣿⣿⠇⠀⠀⢀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⡇⠀⠀⢀⣼⠗⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠃⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`}
                </pre>

                {/* STATIC GRID OVERLAY (always visible) - Enhanced */}
                <div
                    className="absolute inset-0 z-[9] pointer-events-none opacity-[0.2] mix-blend-screen"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(16, 185, 129, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.35) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* SCANNING GRID OVERLAY */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.22, 0.22, 0.12] }}
                    transition={{ duration: 3.5, times: [0, 0.12, 0.75, 1] }}
                    className="absolute inset-0 z-10 mix-blend-screen"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.06) 1px, transparent 1px)',
                        backgroundSize: '10% 10%'
                    }}
                />

                {/* TARGET MARKER */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3.4, duration: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                    className="absolute z-30 flex items-center justify-center"
                    style={{ left: '48%', top: '40%', transform: 'translate(-50%, -50%)', width: 0, height: 0 }}
                >
                    {/* Final LOCKED Axis Lines - Enhanced visibility */}
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 3.6, duration: 0.4 }}
                        className="absolute h-[1px] w-[200vw] bg-gradient-to-r from-transparent via-emerald-500/75 to-transparent shadow-[0_0_8px_#34d399]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ delay: 3.6, duration: 0.4 }}
                        className="absolute w-[1px] h-[200vh] bg-gradient-to-b from-transparent via-emerald-500/75 to-transparent shadow-[0_0_8px_#34d399]"
                    />

                    <div className="relative flex items-center justify-center">
                        <div className="absolute size-20 rounded-full bg-emerald-500/10 blur-xl" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute size-16"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-emerald-500/70 shadow-[0_0_4px_#34d399]" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-emerald-500/70 shadow-[0_0_4px_#34d399]" />
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[1px] bg-emerald-500/70 shadow-[0_0_4px_#34d399]" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-[1px] bg-emerald-500/70 shadow-[0_0_4px_#34d399]" />
                        </motion.div>
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute size-10"
                        >
                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-500/80" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-500/80" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-emerald-500/80" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-500/80" />
                        </motion.div>
                        <motion.div
                            initial={{ rotate: 45, scale: 0.5, opacity: 0 }}
                            animate={{ rotate: 45, scale: 1, opacity: 1 }}
                            transition={{ delay: 3.6, duration: 0.3 }}
                            className="absolute size-6 border border-emerald-400 shadow-[0_0_10px_#34d39940]"
                        />
                        <motion.div
                            animate={{ boxShadow: ['0 0 10px #34d399', '0 0 20px #34d399', '0 0 10px #34d399'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="size-2 bg-emerald-100 rounded-full z-10"
                        />
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
                                className="absolute size-full rounded-full border border-emerald-500/30"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* COORDINATES READOUT */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-2 right-2 text-[7px] font-mono text-emerald-500/60 text-right"
                >
                    <div>LAT: <span className="text-emerald-400">{coords.lat.toFixed(4)}°N</span></div>
                    <div>LON: <span className="text-emerald-400">{coords.lon.toFixed(4)}°E</span></div>
                </motion.div>

                {/* SCANNING STATUS */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3.5, times: [0, 0.05, 0.9, 1] }}
                    className="absolute bottom-2 left-2 text-[7px] font-mono text-emerald-500/60 uppercase tracking-wider"
                >
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.3, repeat: Infinity }}>
                        ◈ TRIANGULATING...
                    </motion.span>
                </motion.div>

                {/* LOCKED STATUS */}
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.7, duration: 0.3 }}
                    className="absolute bottom-2 left-2 text-[7px] font-mono text-emerald-400 uppercase tracking-wider font-bold"
                >
                    ✓ LOCKED • TARGET_ACQUIRED
                </motion.div>
            </div>

            {/* HORIZONTAL SCANNING LINE */}
            <motion.div
                initial={{ top: '10%', opacity: 1 }}
                animate={{
                    top: ['10%', '70%', '25%', '40%'],
                    opacity: [1, 1, 1, 0]
                }}
                transition={{
                    top: { duration: 3.5, times: [0, 0.3, 0.6, 1], ease: "easeOut" },
                    opacity: { duration: 0.2, delay: 3.3 }
                }}
                className="absolute left-0 right-0 z-[15] pointer-events-none"
            >
                <div className="h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-400/90 to-emerald-500/0 shadow-[0_0_12px_#34d399,0_0_6px_#34d399]" />
            </motion.div>

            {/* VERTICAL SCANNING LINE */}
            <motion.div
                initial={{ left: '90%', opacity: 1 }}
                animate={{
                    left: ['90%', '20%', '65%', '48%'],
                    opacity: [1, 1, 1, 0]
                }}
                transition={{
                    left: { duration: 3.5, times: [0, 0.3, 0.6, 1], ease: "easeOut" },
                    opacity: { duration: 0.2, delay: 3.3 }
                }}
                className="absolute top-0 bottom-0 z-[15] pointer-events-none"
            >
                <div className="w-[1px] h-full bg-gradient-to-b from-emerald-500/0 via-emerald-400/90 to-emerald-500/0 shadow-[0_0_12px_#34d399,0_0_6px_#34d399]" />
            </motion.div>
        </motion.div>
    );
};
