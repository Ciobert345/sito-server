import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { RoadmapItem } from '../types';
import { getLatestRelease } from '../utils/githubCache';
import { useAuth } from '../contexts/AuthContext';
import { TERMINAL_FS, FSNode } from '../data/terminalFS';
import { TerminalMinigames } from './TerminalMinigames';
import { TerminalMap } from './terminal/TerminalMap';
import { TerminalSidebar } from './terminal/TerminalSidebar';
import { TerminalBootProgress } from './terminal/TerminalBootProgress';
import { isMobilePhone } from '../utils/deviceDetection';

interface TerminalProps {
    isOpen: boolean;
    onClose: () => void;
}


const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, addXP, attemptUnlockWithCode, unlockedIntelIds } = useAuth();
    const { config } = useConfig();

    // Terminal access: desktop only; require approved or admin; allow explicit terminal permission even if globally disabled
    if (isMobilePhone()) return null;
    if (!user) return null;
    if (!user.isApproved && !user.isAdmin) return null;
    if (config && !config.isTerminalEnabled && !user.isAdmin && !user.permissions?.terminal) return null;

    const [input, setInput] = useState('');
    const [history, setHistory] = useState<(string | React.ReactNode | undefined)[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [startTime] = useState(Date.now());
    const [sessionTime, setSessionTime] = useState('00:00:00');
    const [isBooting, setIsBooting] = useState(true);
    const [clientIp, setClientIp] = useState<string>('Detecting...');
    const [geoInfo, setGeoInfo] = useState<string>('Scanning...');
    const [geoCoords, setGeoCoords] = useState<{ lat: number, lon: number }>({ lat: 0, lon: 0 });
    const [userAlias, setUserAlias] = useState<string>(() => localStorage.getItem('terminal_user_alias') || 'guest');
    const [buildRef, setBuildRef] = useState<string>('v1.0.0-STABLE');

    // File System & Minigames State
    const [currentPath, setCurrentPath] = useState<string>('/');
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [viewingIntel, setViewingIntel] = useState<{ id: string, name: string, url: string } | null>(null);
    const [intelAssets, setIntelAssets] = useState<any[]>([]);
    const [isFabioOpen, setIsFabioOpen] = useState(false);

    // Refs for closure-safe access during boot animation
    const clientIpRef = useRef('Detecting...');
    const geoInfoRef = useRef('Scanning...');
    const buildRefRef = useRef('v1.0.0-STABLE');

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const ALL_COMMANDS = ['status', 'ping', 'goto', 'ip', 'roadmap', 'whoami', 'uptime', 'matrix', 'gravity', 'disco', 'crash', 'kill', 'clear', 'exit', 'help', 'echo', 'version', 'setname', 'ls', 'cd', 'cat', 'pwd', 'unlock', 'xp'];

    useEffect(() => {
        const fetchDiagnostics = async () => {
            try {
                // Fetch IP (CORS friendly)
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                setClientIp(ipData.ip);
                clientIpRef.current = ipData.ip;

                // Fetch real build ref from GitHub
                if (config?.github?.repository) {
                    const latest = await getLatestRelease(config.github.repository);
                    if (latest && latest.tag_name) {
                        setBuildRef(latest.tag_name);
                        buildRefRef.current = latest.tag_name;
                    }
                }

                // Fetch Geo (Try-Catch separately for CORS)
                try {
                    const geoRes = await fetch('https://ipapi.co/json/');
                    const geoData = await geoRes.json();
                    const geoStr = `${geoData.city || 'Unknown'}, ${geoData.country_name || 'Earth'}`;
                    setGeoInfo(geoStr);
                    geoInfoRef.current = geoStr;

                    // Store coords for CyberMap
                    if (geoData.latitude && geoData.longitude) {
                        setGeoCoords({ lat: geoData.latitude, lon: geoData.longitude });
                    }
                } catch {
                    setGeoInfo('Local Node');
                    geoInfoRef.current = 'Local Node';
                    setGeoCoords({ lat: 0, lon: 0 }); // Default to Null Island/Center
                }
            } catch (error) {
                console.error('Diagnostic error:', error);
            }
        };
        const fetchIntelAssets = async () => {
            const { data } = await supabase.from('intel_assets').select('*');
            if (data) setIntelAssets(data);
        };

        fetchDiagnostics();
        fetchIntelAssets();
    }, [config]);

    useEffect(() => {
        // Boot sequence logic - runs once on mount (extended for cooler effect)
        const finishBoot = setTimeout(() => {
            setIsBooting(false);
            setHistory((prev) => [...prev, 'Type "help" to start.', '']);
            setTimeout(() => inputRef.current?.focus(), 100);
        }, 4000); // Extended boot time

        return () => clearTimeout(finishBoot);
    }, []);

    useEffect(() => {
        if (!isBooting) {
            inputRef.current?.focus();
        }
    }, [isBooting]);

    useEffect(() => {
        // Custom "Slow Fluid" smooth scroll
        if (!scrollRef.current) return;

        let animationFrameId: number;
        const scrollContainer = scrollRef.current;
        // Wait for DOM update
        const timeoutId = setTimeout(() => {
            const targetScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            const startScrollTop = scrollContainer.scrollTop;
            const distance = targetScrollTop - startScrollTop;

            // Only animate if significantly far from bottom
            if (Math.abs(distance) < 5) return;

            const duration = 1200; // 1.2s duration for "heavy" fluid feel
            const startTime = performance.now();

            const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                scrollContainer.scrollTop = startScrollTop + (distance * easeOutCubic(progress));

                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animate);
                }
            };

            animationFrameId = requestAnimationFrame(animate);
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationFrameId);
        };
    }, [history]);

    useEffect(() => {
        const timer = setInterval(() => {
            const diff = Date.now() - startTime;
            const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setSessionTime(`${hours}:${mins}:${secs}`);
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    const findNode = (path: string): FSNode | null => {
        if (path === '/') return TERMINAL_FS;

        let current = TERMINAL_FS;
        const parts = path.split('/').filter(p => p && p !== '.');

        for (const part of parts) {
            if (part === '..') {
                // Simplified parent traversal not really supported in this basic tree walk without parent pointers
                // But normalizePath handles '..' before calling findNode usually.
                continue;
            }
            const next = current.children?.find(c => c.name === part);
            if (!next) return null;
            current = next;
        }

        // Dynamic Content Injection for /mnt/intel
        if (current.name === 'intel' && path.includes('/mnt/intel')) {
            return {
                ...current,
                children: unlockedIntelIds.map(id => ({
                    name: `intel_${id.slice(0, 4)}.png`,
                    type: 'file',
                    content: `[INTEL_ASSET:${id}]`,
                    permissions: '-r--r--r--'
                }))
            };
        }

        return current;
    };

    const normalizePath = (path: string): string => {
        const parts = path.split('/').filter(p => p && p !== '.');
        const stack: string[] = [];
        for (const p of parts) {
            if (p === '..') {
                stack.pop();
            } else {
                stack.push(p);
            }
        }
        return '/' + stack.join('/');
    };

    const handleGameComplete = (gameType: string, status: 'win' | 'loss' | 'quit') => {
        setActiveGame(null);
        const resultMsg = status === 'win'
            ? `>> PROCESS_SUCCESS: [${gameType}] completed normally.`
            : status === 'quit'
                ? `>> PROCESS_ABORTED: [${gameType}] terminated by user.`
                : `>> PROCESS_STOPPED: [${gameType}] mission failed.`;
        setHistory(prev => [...prev.filter(l => l !== undefined), resultMsg]);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleCommand = async (cmd: string) => {
        const fullCmd = cmd.trim();
        if (!fullCmd) return;

        const parts = fullCmd.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        let response: string | string[] | React.ReactNode = '';

        if (activeGame && command !== 'exit') {
            // If a game is active, we don't process normal commands except exit.
            // We could potentially pipe input to the game here, but we'll stick to a simple exit for now.
            return;
        }

        setCommandHistory(prev => [fullCmd, ...prev]);
        setHistoryIndex(-1);

        // Add user command to history immediately
        setHistory((prev) => [...prev, `[${userAlias}@manfredonia]:${currentPath}$ ${fullCmd}`]);

        switch (command) {
            case 'help':
                response = (
                    <div className="w-full max-w-4xl bg-white/5 border border-emerald-500/20 rounded-lg p-3 my-1 mb-2 font-mono text-[10px] shadow-lg shadow-black/20">
                        <div className="border-b border-emerald-500/10 pb-2 mb-3 flex justify-between items-center bg-black/20 -mx-3 -mt-3 p-3 rounded-t-lg">
                            <h3 className="text-emerald-400 font-bold uppercase tracking-[0.2em] flishing-text">Manfredonia_OS // Manual</h3>
                            <span className="text-white/20">V4.0.0</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {/* SECTION 1: GENERAL */}
                            <div>
                                <h4 className="text-white/30 uppercase text-[9px] font-bold tracking-[0.2em] mb-1.5 border-b border-white/5 pb-1">General</h4>
                                <ul className="space-y-1">
                                    {[
                                        { cmd: 'status', desc: 'System Check' },
                                        { cmd: 'ip', desc: 'Server Addr' },
                                        { cmd: 'ping', desc: 'Latency Test' },
                                        { cmd: 'roadmap', desc: 'Dev Plans' },
                                        { cmd: 'version', desc: 'Build Info' }
                                    ].map((item) => (
                                        <li
                                            key={item.cmd}
                                            onClick={() => { setInput(item.cmd); inputRef.current?.focus(); }}
                                            className="flex justify-between items-center bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent px-2 py-0.5 rounded cursor-pointer transition-all group"
                                        >
                                            <span className="text-emerald-500 font-bold group-hover:text-emerald-400">{item.cmd}</span>
                                            <span className="text-white/30 text-[8px]">{item.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* SECTION 2: OPERATIONS */}
                            <div>
                                <h4 className="text-white/30 uppercase text-[9px] font-bold tracking-[0.2em] mb-1.5 border-b border-white/5 pb-1">Operations</h4>
                                <ul className="space-y-1">
                                    {[
                                        { cmd: 'ls', desc: 'List Files' },
                                        { cmd: 'cd <dir>', desc: 'Change Dir' },
                                        { cmd: 'cat <file>', desc: 'Read File' },
                                        { cmd: 'clear', desc: 'Purge Log' },
                                        { cmd: 'echo <txt>', desc: 'Print Text' }
                                    ].map((item) => (
                                        <li
                                            key={item.cmd}
                                            onClick={() => { setInput(item.cmd.split(' ')[0]); inputRef.current?.focus(); }}
                                            className="flex justify-between items-center bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent px-2 py-0.5 rounded cursor-pointer transition-all group"
                                        >
                                            <span className="text-emerald-500 font-bold group-hover:text-emerald-400 whitespace-nowrap mr-1">{item.cmd.split(' ')[0]}</span>
                                            <span className="text-white/30 text-[8px] truncate">{item.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* SECTION 3: SESSION */}
                            <div>
                                <h4 className="text-white/30 uppercase text-[9px] font-bold tracking-[0.2em] mb-1.5 border-b border-white/5 pb-1">Session</h4>
                                <ul className="space-y-1">
                                    {[
                                        { cmd: 'whoami', desc: 'Profile' },
                                        { cmd: 'setname', desc: 'Set Alias' },
                                        { cmd: 'exit', desc: 'Terminate' }
                                    ].map((item) => (
                                        <li
                                            key={item.cmd}
                                            onClick={() => { setInput(item.cmd); inputRef.current?.focus(); }}
                                            className="flex justify-between items-center bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent px-2 py-0.5 rounded cursor-pointer transition-all group"
                                        >
                                            <span className="text-emerald-500 font-bold group-hover:text-emerald-400">{item.cmd}</span>
                                            <span className="text-white/30 text-[8px]">{item.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-2 pt-1 border-t border-white/5">
                                    <div className="flex flex-wrap gap-1 justify-end">
                                        {['matrix', 'gravity', 'disco', 'crash'].map(cmd => (
                                            <span key={cmd} onClick={() => { setInput(cmd); inputRef.current?.focus(); }} className="text-[8px] text-emerald-500/30 hover:text-emerald-400 cursor-pointer transition-colors uppercase tracking-wider">
                                                {cmd}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                break;
            case 'status':
                setHistory(prev => [...prev, 'FETCHING SYSTEM STATUS...']);
                try {
                    const targetIp = config?.serverMetadata?.ip || 'server-manfredonia.ddns.net';
                    const res = await fetch(`https://api.mcsrvstat.us/2/${targetIp}`);
                    const data = await res.json();

                    if (data.online) {
                        response = `SYSTEM STATUS: [OPERATIONAL]\nSERVER_IP: ${targetIp}\nVERSION: ${data.version || config?.serverMetadata?.modpackVersion || 'N/A'}\nPLAYERS: ${data.players?.online}/${data.players?.max}\nMOTD: ${data.motd?.clean?.[0] || 'Operational'}\nREGION: MANFREDONIA_CORE_NODE_01`;
                    } else {
                        response = `SYSTEM STATUS: [OFFLINE]\nSERVER_IP: ${targetIp}\nNOTICE: The node is currently unreachable.`;
                    }
                } catch (e) {
                    response = 'ERROR: Failed to retrieve system status from monitoring node.';
                }
                break;
            case 'ping':
                const host = config?.serverMetadata?.ip || 'play.manfredonia.com';
                setHistory(prev => [...prev, `PING ${host} (127.0.0.1): 56 data bytes`]);

                for (let j = 0; j < 4; j++) {
                    await new Promise(r => setTimeout(r, 600));
                    const lat = Math.floor(Math.random() * 30) + 15;
                    setHistory(prev => [...prev, `64 bytes from ${host}: icmp_seq=${j} ttl=64 time=${lat} ms`]);
                }
                response = `\n--- ${host} ping statistics ---\n4 packets transmitted, 4 packets received, 0.0% packet loss`;
                break;
            case 'ip':
                const serverIp = config?.serverMetadata?.ip || 'server-manfredonia.ddns.net';
                response = [
                    `IDENTIFICATION SUCCESSFUL:`,
                    `> DEVICE_IP:    ${clientIp}`,
                    `> SERVER_IP:    ${serverIp}`,
                    `\nTarget Server IP copied to clipboard.`
                ];
                try {
                    navigator.clipboard.writeText(serverIp);
                } catch (e) { }
                break;
            case 'echo':
                response = args.join(' ') || 'ECHO: (empty)';
                break;
            case 'goto':
                const page = args[0]?.toLowerCase();
                const pages: Record<string, string> = {
                    home: '/',
                    modpack: '/modpack',
                    utils: '/utilities',
                    utilities: '/utilities',
                    updates: '/updates',
                    dashboard: '/dashboard',
                    info: '/info'
                };
                if (page && pages[page]) {
                    response = `Redirecting to [${page}]...`;
                    setTimeout(() => {
                        navigate(pages[page]);
                        onClose();
                    }, 800);
                } else {
                    response = `ERROR: Invalid destination. Available: ${Object.keys(pages).join(', ')}`;
                }
                break;
            case 'roadmap':
                const roadmapData = config?.feedbackRoadmap?.sections?.roadmap;
                if (roadmapData && roadmapData.items) {
                    const columns = roadmapData.columns || [];
                    response = (
                        <div className="w-full mt-4 mb-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {columns.map((col: { id: string, title: string }) => {
                                const colItems = roadmapData.items.filter((i: RoadmapItem) => i.column === col.id);
                                const colColor = col.id === 'done' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : col.id === 'inprogress' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                                const barColor = col.id === 'done' ? 'bg-emerald-500' : col.id === 'inprogress' ? 'bg-yellow-500' : 'bg-blue-500';

                                return (
                                    <div key={col.id} className={`bg-black/20 rounded-lg overflow-hidden flex flex-col border ${colColor.split(' ')[2] || 'border-white/10'}`}>
                                        <div className={`px-3 py-2 border-b border-white/5 font-bold uppercase text-[9px] tracking-widest flex justify-between items-center ${colColor}`}>
                                            {col.title}
                                            <span className="opacity-50 text-[8px]">{colItems.length}</span>
                                        </div>
                                        <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {colItems.length === 0 && <div className="text-white/20 text-[9px] italic p-2 text-center">No active tasks</div>}
                                            {colItems.map((item: any, idx: number) => {
                                                const progress = item.progress || (col.id === 'done' ? 100 : col.id === 'inprogress' ? 65 : col.id === 'nextup' ? 25 : 5);
                                                return (
                                                    <div key={idx} className="bg-white/5 p-2 rounded border border-white/5 hover:border-white/20 transition-all hover:bg-white/10 group">
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <span className="text-emerald-100 font-bold text-[10px] leading-tight block pr-2">{item.title}</span>
                                                            {item.priority && <span className={`text-[8px] px-1 rounded uppercase tracking-wider ${item.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'}`}>{item.priority}</span>}
                                                        </div>
                                                        {item.description && <div className="text-white/40 text-[9px] mb-2 leading-relaxed line-clamp-3">{item.description}</div>}
                                                        <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                                                            <div className={`h-full ${barColor}`} style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                } else {
                    response = <div className="text-yellow-500/80 italic">&gt;&gt; ROADMAP_DATA_UNAVAILABLE</div>;
                }
                break;
            case 'whoami':
                const userAgent = navigator.userAgent;
                const isWin = userAgent.includes('Windows');
                const isMac = userAgent.includes('Mac');
                const os = isWin ? 'WINDOWS_NT' : isMac ? 'DARWIN' : 'UNIX_LIKE';
                const browser = userAgent.includes('Chrome') ? 'CHROME/V8' : userAgent.includes('Firefox') ? 'GECKO/FX' : 'WEBKIT/STD';
                const uptimeMs = Date.now() - startTime;
                const h = Math.floor(uptimeMs / 3600000);
                const m = Math.floor((uptimeMs % 3600000) / 60000);

                response = (
                    <div className="max-w-md bg-white/5 border border-emerald-500/20 rounded-lg p-4 my-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 rotate-12 scale-150 pointer-events-none">
                            <span className="material-symbols-outlined text-6xl text-emerald-500">fingerprint</span>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="size-14 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                <span className="text-2xl">{userAlias === 'guest' ? '👤' : '🧑‍💻'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[9px] uppercase text-emerald-500/60 font-bold tracking-widest mb-0.5">Identity Protocol</div>
                                <div className="text-lg text-emerald-400 font-bold tracking-tight truncate font-mono">{userAlias}</div>
                                <div className="text-[10px] text-white/30 font-mono mt-0.5 flex items-center gap-2">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {clientIp}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono relative z-10">
                            <div className="bg-black/20 p-2 rounded border border-white/5 flex flex-col">
                                <span className="text-white/30 mb-0.5 uppercase tracking-wider text-[8px]">System_OS</span>
                                <span className="text-emerald-100 font-bold">{os}</span>
                            </div>
                            <div className="bg-black/20 p-2 rounded border border-white/5 flex flex-col">
                                <span className="text-white/30 mb-0.5 uppercase tracking-wider text-[8px]">XP_Points</span>
                                <span className="text-emerald-100 font-bold">{user?.experience_points || 0}</span>
                            </div>
                            <div className="bg-black/20 p-2 rounded border border-white/5 flex flex-col">
                                <span className="text-white/30 mb-0.5 uppercase tracking-wider text-[8px]">Session_Dur</span>
                                <span className="text-emerald-100 font-bold">{h}h {m}m</span>
                            </div>
                            <div className="bg-black/20 p-2 rounded border border-white/5 flex flex-col">
                                <span className="text-white/30 mb-0.5 uppercase tracking-wider text-[8px]">Clearance</span>
                                <span className="text-emerald-500 font-bold">
                                    {user?.clearance_level >= 10 ? 'LEGACY' :
                                        user?.clearance_level >= 9 ? 'SENTINEL' :
                                            user?.clearance_level >= 8 ? 'OVERSEER' :
                                                user?.clearance_level >= 7 ? 'COMMANDER' :
                                                    user?.clearance_level >= 6 ? 'VETERAN' :
                                                        user?.clearance_level >= 5 ? 'ELITE' :
                                                            user?.clearance_level >= 4 ? 'SPECIALIST' :
                                                                user?.clearance_level >= 3 ? 'OPERATIVE' :
                                                                    user?.clearance_level >= 2 ? 'NOVICE' :
                                                                        user?.clearance_level >= 1 ? 'AGENT' : 'INITIATE'} (LVL {user?.clearance_level ?? 0})
                                </span>
                            </div>
                        </div>

                        {!user && (
                            <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-yellow-500/80 flex items-start gap-2 relative z-10">
                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                <span className="leading-tight">Unregistered entity. Sync required for progression.</span>
                            </div>
                        )}
                    </div>
                );
                break;
            case 'setname':
                if (args.length > 0) {
                    const newAlias = args.join('_').slice(0, 20);
                    setUserAlias(newAlias);
                    localStorage.setItem('terminal_user_alias', newAlias);
                    response = `  SUCCESS: Identity updated to [${newAlias}]. Settings persisted.`;
                } else {
                    response = '  ERROR: Missing alias. Usage: setname <alias>';
                }
                break;
            case 'uptime':
                response = `SESSION_UPTIME: ${sessionTime}\nNODE_UPTIME: 341 days, 12 hours, 04 minutes\nCONNECTION: STABLE`;
                break;
            case 'version':
                response = `MANFREDONIA OS [CORE_BUILD_4.0.0]\nTARGET_CORPUS: /CIOBERT345/SITO-SERVER\nMODPACK_REF: ${config?.serverMetadata?.modpackVersion || 'v4.0.0'}`;
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'exit':
                if (activeGame) {
                    setActiveGame(null);
                    response = '>> SUB_PROCESS_TERMINATED. RETURNING_TO_SHELL.';
                } else {
                    onClose();
                }
                return;
            case 'sudo':
                response = 'ACCESS_LEVEL_5_REQUIRED. This unauthorized access attempt has been logged and reported to the Manfredonia Security Council.';
                break;
            case 'matrix':
                response = 'PROTOCOL: DIGITAL_RAIN initiated...';
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: 'matrix' }));
                break;
            case 'gravity':
                response = 'WARNING: Gravitational anomaly detected.';
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: 'gravity' }));
                break;
            case 'disco':
                response = 'RAVE PROTOCOLS ACTIVATED. 🕺';
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: 'disco' }));
                break;
            case 'crash':
                response = 'CRITICAL ERROR: KERNEL PANIC. Re-initializing...';
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: 'crash' }));
                break;
            case 'kill':
                response = 'RESETTING SITE PROTOCOLS...';
                window.dispatchEvent(new CustomEvent('easter-egg', { detail: 'kill' }));
                break;
            case 'pwd':
                response = currentPath;
                break;
            case 'ls':
                const lsTarget = args[0] || '';
                let lsAbsPath = '';

                if (!lsTarget) {
                    lsAbsPath = currentPath;
                } else if (lsTarget.startsWith('/')) {
                    lsAbsPath = lsTarget;
                } else {
                    lsAbsPath = normalizePath(`${currentPath}/${lsTarget}`);
                }

                // Handle /mnt/intel manually
                if (lsAbsPath === '/mnt/intel') {
                    if (!config?.isIntelEnabled && !user?.permissions?.intel) {
                        response = 'ERROR: Access to classified storage is globally disabled.';
                    } else if (unlockedIntelIds.length === 0) {
                        response = 'total 0';
                    } else {
                        response = [
                            `total ${unlockedIntelIds.length}`,
                            ...unlockedIntelIds.map(id => {
                                return `-rw-r--r--  intel_${id.slice(0, 4)}.png      2026-01-23 18:44`;
                            })
                        ];
                    }
                } else if (lsAbsPath === '/mnt') {
                    response = [
                        'total 1',
                        'drwxr-xr-x  intel/               2026-01-23 18:44'
                    ];
                } else {
                    const node = findNode(lsAbsPath);
                    if (node && node.type === 'dir') {
                        if (!node.children || node.children.length === 0) {
                            response = 'total 0';
                        } else {
                            response = [
                                `total ${node.children.length}`,
                                ...node.children.map(c => {
                                    const typeChar = c.type === 'dir' ? 'd' : '-';
                                    const perms = c.permissions || (c.type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--');
                                    const name = c.type === 'dir' ? `${c.name}/` : c.name;
                                    return `${typeChar}${perms}  ${name.padEnd(20)} ${c.lastModified || '2026-01-13 21:22'}`;
                                })
                            ];
                        }
                    } else if (node && node.type === 'file') {
                        const perms = node.permissions || 'rw-r--r--';
                        response = `- ${perms}  ${node.name.padEnd(20)} ${node.lastModified || '2026-01-13 21:22'}`;
                    } else {
                        response = `ERROR: No such file or directory: ${lsTarget}`;
                    }
                }
                break;
            case 'cd':
                const cdTarget = args[0];
                if (!cdTarget || cdTarget === '~') {
                    setCurrentPath('/');
                } else {
                    const newPath = cdTarget.startsWith('/') ? cdTarget : normalizePath(`${currentPath}/${cdTarget}`);
                    const normalizedNewPath = normalizePath(newPath);

                    if (normalizedNewPath === '/mnt' || normalizedNewPath === '/mnt/intel') {
                        if (normalizedNewPath === '/mnt/intel' && !config?.isIntelEnabled && !user?.permissions?.intel) {
                            response = 'ERROR: Target directory restricted by G-PROTO_V4.';
                        } else {
                            setCurrentPath(normalizedNewPath);
                        }
                    } else {
                        const targetNode = findNode(normalizedNewPath);
                        if (targetNode && targetNode.type === 'dir') {
                            setCurrentPath(normalizedNewPath);
                        } else {
                            response = `ERROR: No such directory: ${cdTarget}`;
                        }
                    }
                }
                break;
            case 'cat':
                const catFile = args[0];
                if (!catFile) {
                    response = 'USAGE: cat <filename>';
                } else {
                    const catPath = catFile.startsWith('/') ? catFile : normalizePath(`${currentPath}/${catFile}`);
                    const fileNode = findNode(catPath);
                    if (fileNode && fileNode.type === 'file') {
                        if (fileNode.content?.startsWith('[INTEL_ASSET:')) {
                            const assetId = fileNode.content.split(':')[1].slice(0, -1);
                            const asset = intelAssets.find(a => a.id === assetId);
                            if (asset) {
                                if (!config?.isIntelEnabled && !user?.permissions?.intel) {
                                    response = 'ERROR: Resource retrieval protocol is offline.';
                                } else {
                                    response = `OPENING TACTICAL_VIEWER: ${fileNode.name}...`;
                                    setViewingIntel({ id: asset.id, name: asset.name, url: asset.image_url });
                                }
                            } else {
                                response = `ERROR: Asset metadata for ${assetId} not found.`;
                            }
                        } else {
                            response = fileNode.content || '(empty stream)';
                        }
                    } else if (fileNode && fileNode.type === 'dir') {
                        response = `ERROR: cat: ${catFile}: Is a directory`;
                    } else {
                        response = `ERROR: cat: ${catFile}: No such file or directory`;
                    }
                }
                break;
            case 'unlock':
                const code = args[0];
                if (!code) {
                    response = 'USAGE: unlock <code>';
                } else {
                    setHistory(prev => [...prev, `VERIFYING AUTH_CODE: ${code.toUpperCase()}...`]);
                    const result = await attemptUnlockWithCode(code);
                    response = result.success ? `SUCCESS: ${result.message}` : `ERROR: ${result.message}`;
                }
                break;
            case 'xp':
                const currentRank = user?.clearance_level >= 10 ? 'LEGACY' :
                    user?.clearance_level >= 9 ? 'SENTINEL' :
                        user?.clearance_level >= 8 ? 'OVERSEER' :
                            user?.clearance_level >= 7 ? 'COMMANDER' :
                                user?.clearance_level >= 6 ? 'VETERAN' :
                                    user?.clearance_level >= 5 ? 'ELITE' :
                                        user?.clearance_level >= 4 ? 'SPECIALIST' :
                                            user?.clearance_level >= 3 ? 'OPERATIVE' :
                                                user?.clearance_level >= 2 ? 'AGENT' : 'INITIATE';
                response = [
                    `SYSTEM_PROGRESS:`,
                    `> CURRENT_XP:  ${user?.experience_points || 0} XP`,
                    `> CLEARANCE:   ${currentRank} (LEVEL_${user?.clearance_level || 1})`,
                    `> NEXT_LEVEL:  ${user?.clearance_level >= 10 ? 'MAX_REACHED' : (1000 - ((user?.experience_points || 0) % 1000)) + ' XP REQUIRED'}`
                ];
                break;
            default:
                // Check for secret codes
                const secretMoves: Record<string, string> = {
                    'KORTEX2026': 'CHESS',
                    'MOLE_KILLER': 'MOLE',
                    'VOID_INVADER': 'INVADERS',
                    'CYBER_JACK': 'CARDS'
                };
                if (secretMoves[command.toUpperCase()]) {
                    setActiveGame(secretMoves[command.toUpperCase()]);
                    response = [
                        '+================================================+',
                        '|        EXTRACTING HIDDEN_PAYLOAD... [OK]       |',
                        '|        INITIALIZING VIRTUAL_ENV... [OK]        |',
                        '+================================================+',
                        `| STARTING SYSTEM_APP: ${secretMoves[command.toUpperCase()]} |`,
                        '+================================================+',
                        'Type "exit" to terminate sub-process.',
                        `RUN_APP:${secretMoves[command.toUpperCase()]}`
                    ];
                } else {
                    response = `ERROR: '${command}' is not recognized as a valid internal command. Type 'help' for options.`;
                }
        }

        if (response) {
            const linesToAdd = Array.isArray(response) ? response : [response];
            setHistory((prev) => [...prev.filter(l => l !== undefined), ...linesToAdd]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim();
        handleCommand(cmd);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const nextIndex = historyIndex + 1;
                setHistoryIndex(nextIndex);
                setInput(commandHistory[nextIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const nextIndex = historyIndex - 1;
                setHistoryIndex(nextIndex);
                setInput(commandHistory[nextIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const partial = input.toLowerCase().trim();
            if (partial) {
                const match = ALL_COMMANDS.find(c => c.startsWith(partial));
                if (match) setInput(match);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{
                        duration: 0.5,
                        ease: [0.23, 1, 0.32, 1]
                    }}
                    className="relative w-full h-full flex items-center justify-center pointer-events-none"
                >
                    <motion.div
                        className="w-full h-full max-w-[95vw] lg:max-w-6xl xl:max-w-7xl max-h-[75vh] aspect-video bg-black/60 border border-white/10 rounded-[2rem] overflow-hidden font-mono relative shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] backdrop-blur-xl pointer-events-auto flex flex-col"
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.focus();
                        }}
                    >
                        {/* BOOT SCREEN OVERLAY */}

                        {/* ACCESS REVOKED OVERLAY */}
                        {config && !config.isTerminalEnabled && !user?.isAdmin && !user?.permissions?.terminal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-12 bg-black/95 backdrop-blur-2xl text-center"
                            >
                                <div className="size-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 animate-pulse">
                                    <span className="material-symbols-outlined text-red-500 text-5xl">terminal</span>
                                </div>
                                <h2 className="text-3xl font-black text-red-500 uppercase italic tracking-tighter mb-4">Remote Access Revoked</h2>
                                <div className="flex flex-col gap-2 max-w-md">
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        Terminal interface has been locked by high-level administrative command. Order 66 is active.
                                    </p>
                                    <div className="h-px w-full bg-red-500/20 my-4" />
                                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Error Code: ERR_INTF_LOCKED_BY_ADMIN</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="mt-12 px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    Return to Interface
                                </button>
                            </motion.div>
                        )}

                        {/* Subtle Scanning Line */}
                        <motion.div
                            animate={{ top: ["-5%", "105%"] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-[1.5px] bg-emerald-500/[0.03] shadow-[0_0_10px_rgba(16,185,129,0.1)] z-30 pointer-events-none"
                        />

                        {/* Integrated Header */}
                        <div className="bg-white/[0.04] px-5 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between border-b border-white/5 relative z-40 shrink-0">
                            <div className="flex items-center gap-10">
                                <div className="flex gap-2">
                                    <div className="size-2.5 rounded-full bg-red-500/20 border border-red-500/10"></div>
                                    <div className="size-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/10"></div>
                                    <div className="size-2.5 rounded-full bg-green-500/20 border border-green-500/10"></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Terminal SVR_LOG_01</span>
                                    <div className="h-4 w-[1px] bg-white/10"></div>
                                    <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                                        <div className="size-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest">Active Link</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 rounded-full flex items-center justify-center text-white/10 hover:text-white/40 hover:bg-white/5 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Terminal Content Box / Unified Dashboard */}
                        <div className="flex-grow flex flex-col md:flex-row relative overflow-hidden">

                            {/* LEFT: MAIN OPERATIONS & MAP */}
                            <div className="flex-1 flex flex-col relative min-w-0">

                                {/* MAP HEADER - Persistent Visual */}
                                <div className="h-[45%] lg:h-[50%] min-h-[180px] w-full relative bg-transparent z-10 shrink-0">
                                    <TerminalMap coords={geoCoords} />
                                </div>

                                {/* SEPARATOR */}
                                <div className="h-8 w-full bg-emerald-900/5 border-y border-emerald-500/10 flex items-center justify-between px-4 shrink-0 relative z-20">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className={`w-0.5 h-2 ${i % 2 === 0 ? 'bg-emerald-500/40' : 'bg-emerald-500/10'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest">Command_Log</span>
                                    </div>
                                    <div className="text-[9px] font-mono text-emerald-500/20">
                                        // AWAITING_INSTRUCTION
                                    </div>
                                </div>

                                {/* TERMINAL CLI SCROLL AREA */}
                                <div
                                    ref={scrollRef}
                                    className={`flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-terminal-scrollbar terminal-scrollbar-hidden transition-all duration-700 ease-[0.23,1,0.32,1] relative ${activeGame ? 'opacity-40 pointer-events-none' : ''}`}
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        WebkitOverflowScrolling: 'touch'
                                    }}
                                >
                                    {/* Boot Progress Overlay */}
                                    <AnimatePresence>
                                        {isBooting && (
                                            <motion.div
                                                initial={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.8 }}
                                                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/60 backdrop-blur-sm"
                                            >
                                                <TerminalBootProgress />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="max-w-4xl space-y-4 min-h-[60%]">
                                        {history.map((line, i) => {
                                            if (!line) return null;

                                            // Handle React Nodes
                                            if (React.isValidElement(line)) {
                                                return <div key={i}>{line}</div>;
                                            }

                                            // Ensure line is a string
                                            if (typeof line !== 'string') return null;

                                            // Don't render active game in history list
                                            if (line.startsWith('RUN_APP:')) {
                                                const gameType = line.split(':')[1];
                                                if (gameType === activeGame) return null;
                                                return (
                                                    <div key={i} className="my-6 opacity-30 pointer-events-none grayscale">
                                                        <div className="text-[10px] uppercase tracking-widest text-white/20 mb-2">[ ARCHIVED_SESSION: {gameType} ]</div>
                                                    </div>
                                                );
                                            }

                                            const isUser = line.includes('@manfredonia') && line.includes('$ ');
                                            const isError = line.startsWith('ERROR:') || line.startsWith('CRITICAL') || line.startsWith('ACCESS DENIED');
                                            const isHeader = line.startsWith('AVAILABLE COMMANDS:') || line.startsWith('SYSTEM STATUS:') || line.startsWith('FEATURE ROADMAP:') || line.startsWith('PROTOCOL:') || line.startsWith('WARNING:') || line.startsWith('+===');

                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap font-mono tracking-tight"
                                                >
                                                    {isUser ? (
                                                        <div className="flex flex-col mb-2 mt-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-emerald-500/40 text-[10px] uppercase font-black tracking-widest">[USER_ACTION]</span>
                                                                <span className="text-white/30 text-[10px] uppercase font-black tracking-widest">In {line.split(']:')[1]?.split('$')[0] || '/'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-emerald-500 font-bold font-mono">~$</span>
                                                                <span className="text-white font-bold">{line.split('$ ')[1] || line.split('$')[1]}</span>
                                                            </div>
                                                        </div>
                                                    ) : isError ? (
                                                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl my-2">
                                                            <span className="text-red-500 font-black uppercase text-[10px] tracking-widest block mb-1">Critical Failure</span>
                                                            <span className="text-red-400 font-medium">{line}</span>
                                                        </div>
                                                    ) : isHeader ? (
                                                        <div className="pt-4 pb-2">
                                                            <span className="text-white/80 font-mono text-[13px] leading-tight">{line}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-emerald-400/80 font-medium">{line}</span>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {!isBooting && (
                                        <form onSubmit={handleSubmit} className="flex mt-6 group items-center relative max-w-4xl pb-4">
                                            <div className="flex items-center gap-4 mr-6 shrink-0">
                                                <span className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em]">Ready</span>
                                                <span className="text-emerald-500 font-bold font-mono">~$</span>
                                            </div>
                                            <div className="relative flex-grow">
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    className={`w-full bg-transparent border-none outline-none font-mono text-base caret-transparent ${activeGame ? 'text-white/30 cursor-not-allowed' : 'text-white'}`}
                                                    autoFocus
                                                    spellCheck={false}
                                                    autoComplete="off"
                                                    disabled={!!activeGame}
                                                />
                                                <div className="absolute top-0 left-0 pointer-events-none flex whitespace-pre h-full items-center">
                                                    <span className="opacity-0">{input}</span>
                                                    <motion.div
                                                        animate={{ opacity: [1, 0, 1] }}
                                                        transition={{ duration: 0.8, repeat: Infinity }}
                                                        className="w-2.5 h-6 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8),0_0_30px_rgba(16,185,129,0.4)]"
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                    <div ref={bottomRef} className="h-4 w-full" />
                                </div>

                                {/* Game Overlay - Now covers the left panel (Map + CLI) */}
                                <AnimatePresence mode="wait">
                                    {activeGame && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md overflow-auto"
                                        >
                                            <div className="min-h-full flex flex-col justify-center p-6 md:p-10">
                                                <div className="flex items-center gap-3 mb-6 opacity-40">
                                                    <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sub_Process: {activeGame}</span>
                                                </div>
                                                <TerminalMinigames
                                                    type={activeGame}
                                                    onComplete={(status) => handleGameComplete(activeGame, status)}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Intel Viewing Overlay */}
                                <AnimatePresence>
                                    {viewingIntel && (
                                        <motion.div
                                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                            className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-8 overflow-hidden"
                                        >
                                            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col">
                                                {/* Tactical Header */}
                                                <div className="bg-black/80 px-4 py-2 border-b border-emerald-500/20 flex justify-between items-center z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/80">Intel_Viewer // {viewingIntel.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setViewingIntel(null)}
                                                        className="text-white/40 hover:text-white transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </div>

                                                {/* Image Container */}
                                                <div className="flex-grow relative bg-black flex items-center justify-center overflow-hidden">
                                                    {/* Scanning Lines Effect */}
                                                    <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none z-10" />
                                                    <motion.div
                                                        animate={{ top: ["-5%", "105%"] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                        className="absolute left-0 right-0 h-[30px] bg-emerald-500/10 blur-xl z-10 pointer-events-none"
                                                    />

                                                    <img
                                                        src={viewingIntel.url}
                                                        alt={viewingIntel.name}
                                                        className="w-full h-full object-contain filter brightness-90 contrast-110"
                                                    />
                                                </div>

                                                {/* Tactical Footer */}
                                                <div className="bg-black/80 p-3 border-t border-emerald-500/20 font-mono text-[9px] text-white/40 flex justify-between items-center uppercase tracking-widest">
                                                    <div className="flex items-center gap-6">
                                                        <span>Status: Decrypted</span>
                                                        <span>Origin: Manfredonia_Core</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-emerald-500/40">Secure_Connection: [OK]</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* RIGHT: SIDEBAR (Hidden on small mobile, integrated on Desktop) */}
                            <div className="hidden lg:block w-72 xl:w-80 border-l border-white/5 bg-black/20 shrink-0 relative z-20">
                                <TerminalSidebar
                                    ip={clientIp}
                                    geo={geoInfo}
                                    version={buildRef}
                                    coords={geoCoords}
                                    xp={user?.experience_points || 0}
                                    level={user?.clearance_level ?? 0}
                                />
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div className="bg-white/[0.02] px-5 sm:px-6 lg:px-8 py-4 lg:py-5 border-t border-white/5 flex justify-between items-center text-white/20 z-40 backdrop-blur-3xl font-mono text-[9px] uppercase tracking-[0.4em] font-black shrink-0">
                            <div className="flex gap-12 items-center">
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                    <span className="text-emerald-500/40">Sequence: Verified</span>
                                </div>
                                <div className="hidden md:flex gap-8 opacity-40">
                                    <span>Enc: RSA-4096</span>
                                    <span>Auth: Level_5</span>
                                </div>
                            </div>
                            <div className="flex gap-10 items-center">
                                <span className="text-white/10">{new Date().toLocaleTimeString()}</span>
                                <span className="text-emerald-500/30">Session: {sessionTime}</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
};

export default Terminal;
