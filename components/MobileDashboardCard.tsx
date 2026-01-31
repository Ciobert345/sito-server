import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const MobileDashboardCard: React.FC = () => {
    const { mcssService, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'console'>('overview');

    // Server State
    const [serverId, setServerId] = useState<string | null>(null);
    const clientIp = 'SCN_PROT_V4';
    const [stats, setStats] = useState<{
        online: boolean;
        status: number; // 0: Offline, 1: Online, 2: Restarting, 3: Starting, 4: Stopping
        players: { online: number; max: number };
        cpu: number;
        ram: number;
        latency?: number;
        statusText: string;
        unreachable?: boolean;
    }>({
        online: false,
        status: 0,
        players: { online: 0, max: 0 },
        cpu: 0,
        ram: 0,
        latency: 0,
        statusText: 'OFFLINE',
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
    const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
    const [commandInput, setCommandInput] = useState('');

    // Action State
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [gracePassed, setGracePassed] = useState(false);

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

                        setStats({
                            online: currentStatus === 1,
                            status: currentStatus,
                            statusText: statusMap[currentStatus] || 'UNKNOWN',
                            cpu: serverStats?.cpuUsage ?? 0,
                            ram: serverStats?.ramUsage ?? 0,
                            players: { online: serverStats?.onlinePlayers ?? 0, max: serverStats?.maxPlayers ?? 20 },
                            latency: latency,
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
                            setStats(prev => ({
                                online: !!data.online,
                                status: data.online ? 1 : 0,
                                statusText: data.online ? 'ONLINE (LTD)' : 'OFFLINE',
                                players: { online: data.players?.online || 0, max: data.players?.max || 20 },
                                cpu: 0,
                                ram: 0,
                                uptime: 'N/A',
                                unreachable: true
                            }));
                        } else {
                            localStorage.setItem('mcsrvstat_fail_count', String(failCount + 1));
                            setStats(prev => ({ ...prev, statusText: 'UNKNOWN', unreachable: true }));
                        }
                    }
                } catch (error) {
                    // console.error('[MOBILE_CARD] All fetch methods failed');
                    try {
                        const failCount = parseInt(localStorage.getItem('mcsrvstat_fail_count') || '0', 10);
                        localStorage.setItem('mcsrvstat_fail_count', String(failCount + 1));
                        localStorage.setItem('mcsrvstat_last_ts', Date.now().toString());
                    } catch { }
                    setStats(prev => ({ ...prev, unreachable: true }));
                }
            }
        };

        fetchStats();
        // Conservative polling to reduce mobile resource usage
        const intervalTime = stats.unreachable ? 300000 : 15000;
        const interval = setInterval(fetchStats, intervalTime);

        const timer = setTimeout(() => setGracePassed(true), 4000);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [mcssService, serverId, stats.unreachable]);

    // Console Polling
    // Manual Console Refresh Logic
    const fetchConsole = async () => {
        if (!mcssService || !serverId) return;
        try {
            setActionLoading('console');
            const logs = await mcssService.getConsole(serverId, 30);
            setConsoleLogs(prev => {
                if (JSON.stringify(prev) === JSON.stringify(logs)) return prev;
                return logs;
            });
        } catch (err) {
            console.error('[Console] Fetch failed:', err);
        } finally {
            setActionLoading(null);
        }
    };

    // Initial load when tab changes
    useEffect(() => {
        if (activeTab === 'console' && serverId) {
            fetchConsole();
        }
    }, [activeTab, serverId]);



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

    const sendCommand = async (e: React.SyntheticEvent | { preventDefault: () => void }) => {
        e.preventDefault();
        if (!commandInput.trim() || !mcssService || !serverId) return;
        const cmd = commandInput;
        setCommandInput('');
        try {
            await mcssService.executeCommand(serverId, cmd);
            addNotification('info', `Executed: ${cmd}`);
        } catch (err) {
            addNotification('error', `Failed to send command: ${cmd}`);
        }
    };

    // Memoize logs as a single string for textarea
    const logsText = useMemo(() => {
        return (consoleLogs || []).slice(-50).join('\n');
    }, [consoleLogs]);

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
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 relative items-center">
                    {/* Active Tab Indicator - Pure CSS for maximum stability */}
                    <div
                        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white/10 rounded-lg border border-white/5 shadow-inner transition-transform duration-300 ease-out"
                        style={{ transform: activeTab === 'console' ? 'translateX(100%)' : 'translateX(0)' }}
                    />

                    {['overview', 'console'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className="relative flex-1 py-2.5 z-10 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 text-center outline-none focus:outline-none"
                            style={{ color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.3)' }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative h-[420px]">
                    {(stats.unreachable && gracePassed) ? (
                        <div
                            className="flex flex-col items-center justify-center gap-8 h-full text-center p-8 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden"
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="size-14 rounded-full border border-red-500/20 flex items-center justify-center text-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                        <span className="material-symbols-outlined text-3xl">link_off</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-sm font-black text-white/60 uppercase tracking-[0.4em] italic mb-1">Signal Lost</h3>
                                        <span className="text-[10px] font-mono text-red-500/30 uppercase tracking-[0.2em]">Retrying_Uplink...</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.2em] mb-0.5">Latency</span>
                                        <span className="text-[10px] font-mono font-black text-white/60 tracking-tighter italic">
                                            {stats.latency ? `${stats.latency}ms` : '---'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl max-w-full backdrop-blur-sm">
                                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.05em] leading-relaxed">
                                        Il server potrebbe essere offline.<br />
                                        Assicurati di non essere al di fuori<br />
                                        dell'orario operativo.
                                    </p>
                                </div>
                            </div>


                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="flex flex-col gap-8 h-full justify-between relative">
                                    {!gracePassed && (
                                        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] rounded-2xl p-8 text-center">
                                            <div className="flex flex-col items-center gap-5 w-48">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">Uplink Sync</span>
                                                        <div className="size-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    </div>
                                                    <span className="text-[7px] font-mono text-white/20 uppercase tracking-[0.1em]">Negotiating Handshake...</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                                                    <div className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] relative" style={{ width: '100%' }}>
                                                        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/50 shadow-[0_0_5px_#fff]" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-center w-full opacity-20">
                                                    <span className="text-[6px] font-mono text-white uppercase tracking-widest animate-pulse">Establishing_Secure_Relay</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                                {[40, 60, 30, 80, 50, stats.cpu].map((h, i) => (
                                                    <div key={i} className="w-1.5 bg-blue-500 rounded-t-sm transition-all duration-500" style={{ height: `${Math.min(h, 100)}%` }}></div>
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
                                                <div className="h-full bg-purple-500/50" style={{ width: `${stats.ram}%` }}></div>
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
                                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/50 to-transparent"></div>
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
                            )}

                            {activeTab === 'console' && (
                                <div className="flex flex-col h-full bg-[#050505] rounded-xl border border-white/10 relative">
                                    <div className="h-6 bg-white/5 border-b border-white/5 flex items-center justify-between px-3 shrink-0">
                                        <div className="text-[8px] font-mono text-white/30 uppercase">/var/log/server_latest.log</div>
                                        <button
                                            onClick={fetchConsole}
                                            disabled={actionLoading === 'console'}
                                            className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider hover:text-emerald-400 disabled:opacity-50"
                                        >
                                            {actionLoading === 'console' ? 'Loading...' : 'REFRESH'}
                                        </button>
                                    </div>
                                    <div className="h-[340px] bg-[#050505] relative overflow-hidden">
                                        {/* Logs Display - Using PRE for stability + readability */}
                                        <pre className="w-full h-full bg-transparent text-[10px] font-mono text-white/70 p-3 overflow-auto whitespace-pre-wrap font-bold leading-relaxed selection:bg-emerald-500/30">
                                            {logsText || "No logs available. Press REFRESH to sync."}
                                        </pre>

                                        {/* Loading Overlay - CSS Only (Safe) */}
                                        {actionLoading === 'console' && (
                                            <div className="absolute inset-0 bg-[#050505]/80 flex flex-col items-center justify-center z-10">
                                                <div className="flex flex-col items-center gap-3">
                                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Syncing Uplink...</span>
                                                    <div className="w-24 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 w-1/2 animate-[spin_1s_linear_infinite]" style={{ transformOrigin: 'left' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {consoleLogs.length === 0 && !actionLoading && !stats.unreachable && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white/20 gap-2">
                                                <span className="material-symbols-outlined text-3xl">terminal</span>
                                                <span className="text-[8px] uppercase tracking-[0.2em] opacity-50">Console Ready</span>
                                            </div>
                                        )}
                                    </div>

                                    {!gracePassed && (
                                        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] p-6 text-center">
                                            <div className="flex flex-col items-center gap-3 w-32">
                                                <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.2em] animate-pulse">Syncing Console</span>
                                                <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500/40" style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`p-2 bg-[#050505] border-t border-white/10 ${stats.unreachable ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                                        <div className="relative flex items-center gap-2">
                                            <span className="text-emerald-500 font-mono text-xs pl-2">{'>'}</span>
                                            <input
                                                type="text"
                                                value={commandInput}
                                                onChange={(e) => setCommandInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        sendCommand(e);
                                                    }
                                                }}
                                                placeholder={stats.unreachable ? "Link lost..." : "Enter command..."}
                                                className="flex-1 bg-transparent border-none text-xs font-mono text-white placeholder-white/20 focus:ring-0 focus:outline-none py-2"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                autoCapitalize="off"
                                                spellCheck="false"
                                                data-form-type="other"
                                                disabled={stats.unreachable}
                                                style={{ WebkitAppearance: 'none', appearance: 'none' }}
                                            />
                                            <button
                                                onClick={(e) => sendCommand(e)}
                                                disabled={!commandInput.trim() || stats.unreachable}
                                                className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors disabled:opacity-0"
                                            >
                                                <span className="material-symbols-outlined text-sm">keyboard_return</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
