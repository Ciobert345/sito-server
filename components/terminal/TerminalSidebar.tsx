import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TerminalSidebarProps {
    ip: string;
    geo: string;
    version: string;
    coords: { lat: number; lon: number };
    xp: number;
    level: number;
}

export const TerminalSidebar: React.FC<TerminalSidebarProps> = ({ ip, geo, version, coords, xp, level }) => {
    const [cpuBars, setCpuBars] = useState<number[]>(Array(10).fill(20));
    const [memBlocks, setMemBlocks] = useState<number[]>(Array(32).fill(0.2));
    const [totalCpu, setTotalCpu] = useState(32);

    const xpProgress = (xp % 1000) / 10; // Percentage of current level progress
    const levelTitle = level >= 10 ? 'LEGACY' :
        level >= 9 ? 'SENTINEL' :
            level >= 8 ? 'OVERSEER' :
                level >= 7 ? 'COMMANDER' :
                    level >= 6 ? 'VETERAN' :
                        level >= 5 ? 'ELITE' :
                            level >= 4 ? 'SPECIALIST' :
                                level >= 3 ? 'OPERATIVE' :
                                    level >= 2 ? 'AGENT' : 'INITIATE';

    useEffect(() => {
        const interval = setInterval(() => {
            setTotalCpu(Math.floor(Math.random() * 20 + 20));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setMemBlocks(Array(32).fill(0).map(() => Math.random() > 0.7 ? 0.7 : 0.15));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col font-mono select-none relative overflow-hidden text-emerald-500/80">

            {/* Background Grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none z-0"
                style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {/* HEADER: SYSTEM VITALS */}
            <div className="px-4 py-3 border-b border-emerald-500/10 bg-emerald-900/5 relative z-10 shrink-0">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">System_Vitals</span>
                    <span className="text-[8px] opacity-40">MONITORING</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* CPU Graph */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[8px] opacity-60">
                            <span>CPU_CORES</span>
                            <span className="tabular-nums">{totalCpu}%</span>
                        </div>
                        <div className="h-4 flex items-end gap-0.5">
                            {cpuBars.map((val, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                    className={`flex-1 ${val > 80 ? 'bg-red-500/60' : val > 60 ? 'bg-yellow-500/50' : 'bg-emerald-500/30'}`}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Memory Graph */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-[8px] opacity-60">
                            <span>MEM_ALLOC</span>
                            <span>12.4GB</span>
                        </div>
                        <div className="h-4 flex flex-col justify-end gap-0.5">
                            {[...Array(4)].map((_, row) => (
                                <div key={row} className="flex gap-0.5 h-0.5">
                                    {[...Array(8)].map((_, col) => {
                                        const idx = row * 8 + col;
                                        return (
                                            <motion.div
                                                key={col}
                                                animate={{ opacity: memBlocks[idx] }}
                                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                                className="flex-1 bg-emerald-500"
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MIDDLE: HARDWARE & CLEARANCE MODULES */}
            <div className="flex-1 min-h-0 px-4 py-3 overflow-y-auto relative z-10 custom-terminal-scrollbar space-y-4">
                {/* Connector Line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-emerald-500/20 -z-10" />

                {/* Module 0: Clearance Status */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="pl-5 relative"
                >
                    <div className="absolute left-[-2.5px] top-3 size-1.5 bg-emerald-500 rounded-none shadow-[0_0_8px_#10b981]" />
                    <div className="border border-emerald-500/20 bg-emerald-500/5 p-3 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 size-2 border-t border-l border-emerald-500/50" />
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black tracking-widest text-emerald-400">CLEARANCE_L{level}</span>
                                <span className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-tighter">{levelTitle}</span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[8px] opacity-60">
                                    <span>CLEARANCE_MATRIX</span>
                                    <span>{xp} XP</span>
                                </div>
                                {/* Single unified progress bar */}
                                <div className="w-full h-1.5 bg-emerald-500/5 rounded-[1px] overflow-hidden relative border border-emerald-500/10">
                                    {(() => {
                                        const xpInCurrentLevel = xp % 1000;
                                        const width = (xpInCurrentLevel / 1000) * 100;

                                        return (
                                            <motion.div
                                                key={level} // Reset animation when level changes
                                                initial={{ width: 0 }}
                                                animate={{ width: `${width}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                            />
                                        );
                                    })()}
                                </div>
                                <div className="flex justify-between items-center text-[7px] text-emerald-500/30 uppercase italic">
                                    {level >= 10 ? (
                                        <span>MAX LEVEL</span>
                                    ) : (
                                        <>
                                            <span>NEXT: {Math.ceil((xp + 1) / 1000) * 1000} XP</span>
                                            <span>{((xp % 1000) / 10).toFixed(1)}%</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Module 1: Network */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pl-5 relative"
                >
                    <div className="absolute left-[-2.5px] top-3 size-1.5 bg-emerald-500 rounded-none shadow-[0_0_8px_#10b981]" />
                    <div className="border border-emerald-500/20 bg-black/40 p-3 relative group">
                        <div className="absolute top-0 left-0 size-2 border-t border-l border-emerald-500/50" />
                        <div className="absolute bottom-0 right-0 size-2 border-b border-r border-emerald-500/50" />

                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] uppercase tracking-wider font-bold">Net_Interface_V4</span>
                        </div>
                        <div className="flex justify-between text-[9px] items-center border-b border-emerald-500/10 pb-1">
                            <span className="opacity-40">IP_ADDR</span>
                            <span className="text-emerald-100 font-mono tracking-wide">
                                {ip !== 'Detecting...' ? ip : 'SCANNING...'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Module 2: Location */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pl-5 relative"
                >
                    <div className="absolute left-[-2.5px] top-3 size-1.5 bg-emerald-500 rounded-none shadow-[0_0_8px_#10b981]" />
                    <div className="border border-emerald-500/20 bg-black/40 p-3 relative group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] uppercase tracking-wider font-bold">Geo_Triangulation</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                            <div className="bg-emerald-500/5 p-1 border-l-2 border-emerald-500/20">
                                <div className="opacity-40 mb-0.5">REGION</div>
                                <div className="text-emerald-200 truncate">{geo !== 'Scanning...' ? geo : 'Seek...'}</div>
                            </div>
                            <div className="bg-emerald-500/5 p-1 border-l-2 border-emerald-500/20">
                                <div className="opacity-40 mb-0.5">COORDS</div>
                                <div className="text-emerald-200">{coords.lat.toFixed(1)} / {coords.lon.toFixed(1)}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Module 3: Version */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pl-5 relative"
                >
                    <div className="absolute left-[-2.5px] top-3 size-1.5 bg-emerald-500 rounded-none shadow-[0_0_8px_#10b981]" />
                    <div className="border border-emerald-500/20 bg-black/40 p-2 flex justify-between items-center opacity-80">
                        <span className="text-[9px] opacity-40 uppercase">Kernel_Ver</span>
                        <span className="text-[9px] text-emerald-300 font-bold bg-emerald-500/10 px-1">{version}</span>
                    </div>
                </motion.div>
            </div>

            {/* BOTTOM: DATA FEED */}
            <div className="h-[20%] min-h-[80px] border-t border-emerald-500/20 bg-emerald-900/5 p-3 flex flex-col space-y-2 relative z-10 shrink-0">
                <div className="text-[9px] font-bold opacity-60 uppercase tracking-wider flex justify-between">
                    <span>Event_Stream</span>
                </div>
                <div className="grid grid-cols-[1fr_2fr_1fr] text-[8px] opacity-30 border-b border-emerald-500/10 pb-1">
                    <span>TIMESTAMP</span>
                    <span>PROCESS</span>
                    <span className="text-right">STATUS</span>
                </div>
                <div className="overflow-hidden relative flex-1">
                    <div className="absolute inset-0 flex flex-col justify-end space-y-0.5">
                        {[
                            { time: "00:01:23", proc: "SYS_INIT_BOOT", status: "OK" },
                            { time: "00:01:28", proc: "NET_HANDSHAKE_ACK", status: "OK" },
                            { time: "00:02:10", proc: "SECURE_CHANNEL_EST", status: "LOCK" },
                        ].map((event, i) => (
                            <div key={i} className="grid grid-cols-[1fr_2fr_1fr] text-[9px] border-l border-emerald-500/10 pl-2">
                                <span className="opacity-40 font-mono">{event.time}</span>
                                <span className="opacity-80 truncate pr-2">{event.proc}</span>
                                <span className={`text-right font-bold ${event.status === 'OK' ? 'text-emerald-400' : 'opacity-50'}`}>
                                    {event.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
