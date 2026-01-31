import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const MobileDashboardCard: React.FC = () => {
    const { mcssService, user } = useAuth();
    const [serverId, setServerId] = useState<string | null>(null);
    const clientIp = 'SCN_PROT_V4';
    const [stats, setStats] = useState<{
        online: boolean;
        status: number;
        players: { online: number; max: number };
        cpu: number;
        ram: number;
        latency?: number;
        uptime: string;
        statusText: string;
        unreachable: boolean;
    }>({
        online: false,
        status: 0,
        players: { online: 0, max: 0 },
        cpu: 0,
        ram: 0,
        latency: 0,
        uptime: '00:00:00',
        statusText: 'SYNCING',
        unreachable: false
    });

    // Notification State
    const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'error' | 'info'; message: string }[]>([]);

    const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    };

    // Console State
    const consecutiveFails = useRef(0); // Track consecutive failures to avoid flickering "Signal Lost"

    // Action State
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [gracePassed, setGracePassed] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    // Initial load progress animation (Desktop Parity)
    useEffect(() => {
        const timer = setTimeout(() => setLoadProgress(100), 100);
        return () => clearTimeout(timer);
    }, []);

    // Discovery & Stats Polling merged for robustness
    useEffect(() => {
        const fetchStats = async () => {
            const serverIp = 'server-manfredonia.ddns.net'; // Fallback IP
            let mcssSuccess = false;

            // 1. Try MCSS
            if (mcssService) {
                try {
                    let currentServerId = serverId;
                    if (!currentServerId) {
                        const servers = await mcssService.getServers();
                        if (servers.length > 0) {
                            currentServerId = servers[0].serverId;
                            setServerId(currentServerId);
                        }
                    }

                    if (currentServerId) {
                        const startTime = Date.now();
                        const [serverStats, servers] = await Promise.all([
                            mcssService.getServerStats(currentServerId),
                            mcssService.getServers()
                        ]);
                        const latency = Date.now() - startTime;

                        if (!serverStats || !servers) throw new Error('Incomplete data from MCSS');

                        const server = servers.find(s => s.serverId === currentServerId);
                        const currentStatus = server?.status ?? 0;

                        const statusMap: { [key: number]: string } = {
                            0: 'OFFLINE', 1: 'ONLINE', 2: 'RESTARTING', 3: 'STARTING', 4: 'STOPPING'
                        };

                        consecutiveFails.current = 0; // SUCCESS: Reset threshold
                        setStats({
                            online: currentStatus === 1,
                            status: currentStatus,
                            statusText: statusMap[currentStatus] || 'UNKNOWN',
                            cpu: serverStats?.cpuUsage ?? 0,
                            ram: serverStats?.ramUsage ?? 0,
                            players: { online: serverStats?.onlinePlayers ?? 0, max: serverStats?.maxPlayers ?? 20 },
                            latency: latency,
                            uptime: serverStats?.uptime || '00:00:00',
                            unreachable: false
                        });
                        mcssSuccess = true;
                    }
                } catch (err: any) {
                    // console.warn('[MOBILE_CARD] MCSS Failed:', err.message || err);
                }
            }

            // 2. Fallback to Simple API (mcsrvstat.us) if MCSS failed or not available, with throttle/backoff
            if (!mcssSuccess) {
                try {
                    const lastTs = parseInt(localStorage.getItem('mcsrvstat_last_ts') || '0', 10);
                    const failCount = parseInt(localStorage.getItem('mcsrvstat_fail_count') || '0', 10);
                    const now = Date.now();
                    if (!(failCount >= 3 && (now - lastTs) < 15 * 60 * 1000) && ((now - lastTs) >= 5 * 60 * 1000)) {
                        const response = await fetch(`https://api.mcsrvstat.us/2/${serverIp}`, { method: 'GET' });
                        localStorage.setItem('mcsrvstat_last_ts', now.toString());
                        if (response.ok && (response.headers.get('content-type') || '').includes('application/json')) {
                            const data = await response.json();
                            consecutiveFails.current = 0; // Success (fallback) resets threshold
                            setStats(prev => ({
                                ...prev,
                                online: !!data.online,
                                status: data.online ? 1 : 0,
                                statusText: data.online ? 'SIGNAL_DEGRADED' : 'OFFLINE',
                                players: { online: data.players?.online || 0, max: data.players?.max || 20 },
                                unreachable: false // We have data, even if limited!
                            }));
                        } else {
                            const mcsrvFailCount = parseInt(localStorage.getItem('mcsrvstat_fail_count') || '0', 10);
                            localStorage.setItem('mcsrvstat_fail_count', String(mcsrvFailCount + 1));
                            // No state update here, wait for final catch
                        }
                    }
                } catch (error) {
                    consecutiveFails.current += 1;
                    // Only show "Signal Lost" after 3 consecutive total failures (approx 15s)
                    if (consecutiveFails.current >= 3) {
                        setStats(prev => ({ ...prev, statusText: 'LOSS_SYNC', unreachable: true }));
                    }
                    try {
                        const globalFailCount = parseInt(localStorage.getItem('mcsrvstat_fail_count') || '0', 10);
                        localStorage.setItem('mcsrvstat_fail_count', String(globalFailCount + 1));
                        localStorage.setItem('mcsrvstat_last_ts', Date.now().toString());
                    } catch (le) { }
                }
            }
        };

        fetchStats();
        // Desktop timing: 5s for stats
        const interval = setInterval(fetchStats, 5000);

        return () => clearInterval(interval);
    }, [mcssService, serverId]);

    // Independent Sync Timer (Desktop Parity)
    useEffect(() => {
        // Reduced to 4s for a snappier first-load experience
        const timer = setTimeout(() => setGracePassed(true), 4000);
        return () => clearTimeout(timer);
    }, []);





    const handleAction = async (action: string) => {
        if (!mcssService || !serverId || actionLoading) return;
        setActionLoading(action);
        try {
            await mcssService.executeAction(serverId, action);
            await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
            addNotification('error', `Failed to execute ${action}`);
        } finally {
            setActionLoading(null);
        }
    };



    if (!user) return null;


    if (!user.isApproved && !user.isAdmin) {
        return (
            <div className="glass-card bg-[#080808]/80 rounded-2xl border border-amber-500/10 shadow-2xl p-8 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="material-symbols-outlined text-8xl">verified_user</span>
                </div>
                <div className="size-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-2">
                    <span className="material-symbols-outlined text-3xl">lock_clock</span>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Access Restricted</h3>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">Verification from central command is required for dashboard synchronization.</p>
                </div>
                <div className="w-full h-px bg-white/5" />
                <span className="text-[9px] font-bold text-amber-500/50 uppercase tracking-[0.3em] animate-pulse">Waiting for approval...</span>
            </div>
        );
    }

    return (
        <div className="bg-[#080808]/90 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative" style={{ transform: 'translateZ(0)' }}>

            {/* Notification Overlay */}
            <div className="absolute bottom-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
                {(notifications || []).map((notif) => (
                    <div
                        key={notif.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-xl border shadow-2xl ${notif.type === 'success' ? 'bg-[#0a2015] border-emerald-500/20 text-emerald-400' :
                            notif.type === 'error' ? 'bg-[#2a0a0a] border-red-500/20 text-red-400' :
                                'bg-[#0a1020] border-blue-500/20 text-blue-400'
                            }`}
                    >
                        <div className={`size-2 rounded-full ${notif.type === 'success' ? 'bg-emerald-500 animate-pulse' :
                            notif.type === 'error' ? 'bg-red-500' :
                                'bg-blue-500'
                            }`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{notif.message}</span>
                    </div>
                ))}
            </div>

            {/* Header / Status Bar */}
            <div className="relative px-5 py-4 flex items-center justify-between bg-white/[0.02] border-b border-white/5">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500 ${stats.unreachable && !stats.online ? 'bg-red-500 text-red-500 animate-pulse' : stats.online ? 'bg-emerald-500 text-emerald-500' : 'bg-rose-500 text-rose-500'}`}></span>
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                            {stats.unreachable && stats.online ? 'Limited Uplink' : stats.online ? 'System Online' : 'System Offline'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 pl-4">
                        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                            ID: {stats.unreachable && !stats.online ? 'SIGNAL LOST' : (serverId || 'SCANNING...')}
                        </span>
                    </div>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded text-[9px] font-mono text-white/40">V2.0</div>
            </div>

            <div className="p-5 flex flex-col gap-6 relative">


                <div className="relative h-[420px]">
                    <AnimatePresence mode="wait">
                        {(stats.unreachable || !gracePassed) && (
                            <motion.div
                                key="sync-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] rounded-2xl p-8 text-center"
                            >
                                {!gracePassed ? (
                                    /* EXACT DESKTOP LOADING */
                                    <div className="flex flex-col items-center gap-6 w-72">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="size-1 rounded-full bg-emerald-500 animate-ping"></div>
                                                <span className="text-[11px] font-mono font-black text-emerald-400 uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">Establishing Tactical Uplink</span>
                                                <div className="size-1 rounded-full bg-emerald-500 animate-ping"></div>
                                            </div>
                                            <div className="flex items-center gap-4 opacity-20 group">
                                                <span className="text-[8px] font-mono text-white tracking-widest animate-pulse">DH_KEY_EXCHANGE</span>
                                                <span className="text-[8px] font-mono text-white tracking-widest opacity-20">•</span>
                                                <span className="text-[8px] font-mono text-white tracking-widest animate-pulse" style={{ animationDelay: '0.5s' }}>SYNC_NODES v2.2</span>
                                            </div>
                                        </div>

                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-inner backdrop-blur-sm">
                                            <motion.div
                                                animate={{ x: ["-100%", "200%"] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"
                                            />
                                            <motion.div
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 6, ease: [0.65, 0, 0.35, 1] }}
                                                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(52,211,153,0.4)] relative"
                                            >
                                                <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-white shadow-[0_0_10px_#fff]" />
                                            </motion.div>
                                        </div>

                                        <div className="flex justify-between w-full px-2 opacity-30">
                                            <span className="text-[8px] font-mono text-white uppercase tracking-tighter">MCSS_PROPORT_SECURE</span>
                                            <div className="flex items-center gap-1.5 font-mono text-[8px] text-white">
                                                <span>STATUS:</span>
                                                <span className="text-emerald-400">HANDSHAKE_OK</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* EXACT DESKTOP LOST STATE */
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-12 rounded-full border border-red-500/20 flex items-center justify-center text-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                                <span className="material-symbols-outlined text-2xl">link_off</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.3em] italic">Signal Lost</h3>
                                                <span className="text-[8px] font-mono text-red-500/40 uppercase tracking-widest mt-1">Retrying_Uplink...</span>
                                            </div>
                                            <div className="mt-4 px-6 py-3 bg-white/5 border border-white/10 rounded-xl max-w-[320px] text-center backdrop-blur-sm">
                                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.1em] leading-relaxed">
                                                    Il server potrebbe essere offline. <br /> Assicurati di non essere al di fuori dell'orario operativo.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>


                    <div className="flex flex-col gap-8 h-full justify-between relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-[120px] relative overflow-hidden group/chart">
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">CPU</span>
                                    <span className="material-symbols-outlined text-white/20 text-sm">memory</span>
                                </div>
                                <div className="flex items-baseline gap-1 z-10">
                                    <span className="text-2xl font-mono font-bold text-white tracking-tighter">{stats.cpu}</span>
                                    <span className="text-[10px] text-white/30">%</span>
                                </div>
                                <div className="absolute inset-0 opacity-20 pointer-events-none flex items-end justify-end p-2 gap-0.5">
                                    {[40, 60, 30, 80, 50, Number(stats.cpu) || 0].map((h, i) => (
                                        <div key={i} className="w-1.5 bg-blue-500 rounded-t-sm transition-all duration-700 ease-out" style={{ height: `${Math.min(Number(h) || 0, 100)}%` }}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-[120px] relative overflow-hidden">
                                <div className="flex justify-between items-start z-10">
                                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">RAM</span>
                                    <span className="material-symbols-outlined text-white/20 text-sm">storage</span>
                                </div>
                                <div className="flex items-baseline gap-1 z-10">
                                    <span className="text-2xl font-mono font-bold text-white tracking-tighter">{stats.ram}</span>
                                    <span className="text-[10px] text-white/30">%</span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                                    <motion.div
                                        className="h-full bg-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Number(stats.ram) || 0}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 bg-gradient-to-r from-white/[0.04] to-transparent border border-white/5 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
                                <div className="flex flex-col gap-1 z-10">
                                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Active Players</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-mono font-bold text-white tracking-tighter">{stats.players.online}</span>
                                        <span className="text-xs text-white/30 font-medium">/ {stats.players.max} CAP</span>
                                    </div>
                                </div>
                                <div className="flex -space-x-2 z-10">
                                    {Array.from({ length: Math.min(stats.players.online, 3) }).map((_, i) => (
                                        <div key={i} className="size-8 rounded-full bg-white/10 border border-black/50 flex items-center justify-center text-[10px] text-white/50">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                        </div>
                                    ))}
                                    {stats.players.online > 3 && (
                                        <div className="size-8 rounded-full bg-white/5 border border-black/50 flex items-center justify-center text-[9px] text-white/50 font-bold">
                                            +{stats.players.online - 3}
                                        </div>
                                    )}
                                </div>
                                {/* Animated Players Bar Background (Like Desktop Active Nodes) */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-500/50"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(Number(stats.players.online) / (Number(stats.players.max) || 1)) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="h-px flex-1 bg-white/10"></div>
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Manual Override</span>
                                <div className="h-px flex-1 bg-white/10"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <button onClick={() => handleAction('Start')} disabled={stats.status !== 0 || !!actionLoading || stats.unreachable} className="relative group overflow-hidden p-0.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
                                    <div className="absolute inset-0 bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors rounded-xl"></div>
                                    <div className="relative bg-[#0a0a0a] rounded-[10px] h-full p-5 flex flex-col items-center justify-center gap-2 border border-white/5">
                                        <span className="material-symbols-outlined text-emerald-500 text-xl group-hover:scale-110 transition-transform">play_arrow</span>
                                        <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Start</span>
                                    </div>
                                </button>
                                <button onClick={() => handleAction('Restart')} disabled={stats.status !== 1 || !!actionLoading || stats.unreachable} className="relative group overflow-hidden p-0.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
                                    <div className="absolute inset-0 bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors rounded-xl"></div>
                                    <div className="relative bg-[#0a0a0a] rounded-[10px] h-full p-5 flex flex-col items-center justify-center gap-2 border border-white/5">
                                        <span className="material-symbols-outlined text-amber-500 text-xl group-hover:rotate-180 transition-transform duration-500">sync</span>
                                        <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Reboot</span>
                                    </div>
                                </button>
                                <button onClick={() => handleAction('Stop')} disabled={stats.status !== 1 || !!actionLoading || stats.unreachable} className="relative group overflow-hidden p-0.5 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
                                    <div className="absolute inset-0 bg-rose-500/20 group-hover:bg-rose-500/30 transition-colors rounded-xl"></div>
                                    <div className="relative bg-[#0a0a0a] rounded-[10px] h-full p-5 flex flex-col items-center justify-center gap-2 border border-white/5">
                                        <span className="material-symbols-outlined text-rose-500 text-xl group-hover:scale-110 transition-transform">power_settings_new</span>
                                        <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Stop</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
