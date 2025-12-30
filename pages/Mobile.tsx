import React, { useState, useEffect } from 'react';
import bgImage from '../src/assets/bk.jpg';
import { useConfig } from '../contexts/ConfigContext';
import Countdown from '../components/Countdown';
import { getLatestRelease, getReleases } from '../utils/githubCache';

// Tailwind replacements for custom animations
// Note: Some complex animations like 'kenBurns' might be simplified or handled via standard Tailwind classes where possible, 
// or kept if essential. For this standardization, we focus on the static "glass" aesthetic and standard interactions.

const Mobile: React.FC = () => {
    const { config, loading } = useConfig();
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('tab-access');
    const [activeFilter, setActiveFilter] = useState('all');
    const [links, setLinks] = useState<string[]>([]);
    const [linkInput, setLinkInput] = useState('');

    // Guide Tabs State
    const [guideTab, setGuideTab] = useState<'install' | 'optimize'>('install');
    const [installTab, setInstallTab] = useState<'curseforge' | 'modrinth' | 'sklauncher'>('curseforge');
    // const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 }); // Removed in favor of component
    const [countdownComplete, setCountdownComplete] = useState(false);

    // Notification System State
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [readIds, setReadIds] = useState<string[]>([]);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Server Status State
    const [serverStatus, setServerStatus] = useState<{ online: boolean; players?: { online: number } }>({ online: false });
    const [latestVersion, setLatestVersion] = useState<string>('');

    // Updates State
    const [releases, setReleases] = useState<Array<{ version: string; date: string; title: string; body: string }>>([]);
    const [releasesLoading, setReleasesLoading] = useState(true);
    const [expandedReleaseIndex, setExpandedReleaseIndex] = useState<number>(0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch server status and version
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch(`https://api.mcsrvstat.us/2/${config?.serverMetadata?.ip || 'server-manfredonia.ddns.net'}`);
                const data = await response.json();
                setServerStatus({
                    online: data.online,
                    players: data.players
                });
            } catch (error) {
                console.error('Error fetching server status:', error);
            }
        };

        const fetchVersion = async () => {
            try {
                const latest = await getLatestRelease('Ciobert345/Mod-server-Manfredonia');
                if (latest?.tag_name) {
                    setLatestVersion(latest.tag_name);
                }
            } catch (error) {
                console.error('Error fetching latest version:', error);
            }
        };

        if (config) {
            fetchStatus();
            fetchVersion();
            const interval = setInterval(fetchStatus, 60000); // Update status every minute
            return () => clearInterval(interval);
        }
    }, [config]);

    // Fetch releases
    useEffect(() => {
        if (!config?.github?.repository) return;

        const fetchReleases = async () => {
            setReleasesLoading(true);
            try {
                const repo = config.github.repository;
                const data = await getReleases(repo, 10);

                // Sorting is now handled globally in getReleases (githubCache.ts)
                const sortedData = (data || []).slice(0, 4);

                const releasesData = sortedData.map((release: any) => ({
                    version: release.tag_name,
                    date: new Date(release.published_at).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    }),
                    title: release.name || release.tag_name,
                    body: release.body
                }));
                setReleases(releasesData);
                // Assicura che la prima card sia sempre aperta
                if (releasesData.length > 0) {
                    setExpandedReleaseIndex(0);
                }
            } catch (err) {
                console.error('Error fetching releases:', err);
            } finally {
                setReleasesLoading(false);
            }
        };

        fetchReleases();
    }, [config]);


    // Persistence and Push Logic (Copied from Navbar.tsx)
    useEffect(() => {
        const savedRead = localStorage.getItem('manfredonia_read_notifications');
        if (savedRead) setReadIds(JSON.parse(savedRead));

        const savedPush = localStorage.getItem('manfredonia_push_enabled');
        if (savedPush === 'true') setPushEnabled(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('manfredonia_read_notifications', JSON.stringify(readIds));
    }, [readIds]);

    useEffect(() => {
        if (!config?.infoBanners || !pushEnabled) return;
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        const enabledBanners = config.infoBanners.filter(b => b.enabled);
        const lastKnownIds = JSON.parse(localStorage.getItem('manfredonia_last_banner_ids') || '[]');
        const newBanners = enabledBanners.filter(b => !lastKnownIds.includes(b.id));

        if (newBanners.length > 0) {
            newBanners.forEach(banner => {
                try {
                    new Notification(banner.title, {
                        body: banner.message.replace(/<[^>]*>?/gm, ''),
                        icon: '/favicon.ico'
                    });
                } catch (e) {
                    console.error("Notification error:", e);
                }
            });
        }
        localStorage.setItem('manfredonia_last_banner_ids', JSON.stringify(enabledBanners.map(b => b.id)));
    }, [config?.infoBanners, pushEnabled]);

    const togglePush = async () => {
        if (!pushEnabled) {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setPushEnabled(true);
                    localStorage.setItem('manfredonia_push_enabled', 'true');
                }
            }
        } else {
            setPushEnabled(false);
            localStorage.setItem('manfredonia_push_enabled', 'false');
        }
    };

    const markAllAsRead = () => {
        const enabledIds = config?.infoBanners?.filter(b => b.enabled).map(b => b.id) || [];
        setReadIds(prev => Array.from(new Set([...prev, ...enabledIds])));
    };

    const unreadCount = config?.infoBanners?.filter(b => b.enabled && !readIds.includes(b.id)).length || 0;



    // ... (Existing helper functions: toggleMenu, closeMenu, handleTabClick, etc.)
    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
    };

    const addLink = () => {
        const trimmed = linkInput.trim();
        if (!trimmed) return;
        try {
            new URL(trimmed);
            setLinks([...links, trimmed]);
            setLinkInput('');
        } catch {
            alert('Please enter a valid URL.');
        }
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const copyIp = () => {
        const ip = config?.serverMetadata?.ip || 'server-manfredonia.ddns.net';
        navigator.clipboard.writeText(ip);
    };

    // Markdown to HTML parser
    const markdownToHtml = (text: string) => {
        if (!text) return '';
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Code blocks
        html = html.replace(/`([^`]+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-yellow-300 font-mono text-xs border border-white/10">$1</code>');
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors">$1</a>');
        // Bold
        html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
        // Italic
        html = html.replace(/\*([^*\n]+?)\*/g, '<em class="text-white/80 italic">$1</em>');
        // Headers
        html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-white mt-4 mb-2 text-base font-bold border-l-4 border-white/30 pl-3">$1</h3>');
        html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-white mt-6 mb-3 text-lg font-bold border-l-4 border-white/40 pl-3">$1</h2>');
        html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-white mt-6 mb-4 text-xl font-bold border-l-4 border-white/50 pl-3">$1</h1>');
        // Lists
        html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 mb-1.5 list-disc text-white/90 pl-1 text-xs">$1</li>');
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 mb-1.5 list-decimal text-white/90 pl-1 text-xs">$1</li>');
        // Wrap lists
        html = html.replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gs, '<ul class="my-3 pl-3">$1</ul>');
        // Line breaks
        html = html.replace(/\n\n+/g, '</p><p class="mb-2 text-white/95 text-xs">');
        html = html.replace(/\n/g, '<br>');

        return '<p class="mb-2 text-white/95 text-xs">' + html + '</p>';
    };

    // ... (Roadmap sorting logic)
    const columnToStatus: Record<string, string> = {
        'backlog': 'backlog',
        'nextup': 'planned',
        'inprogress': 'inProgress',
        'done': 'completed'
    };

    const statusText: Record<string, string> = {
        'backlog': 'Backlog',
        'planned': 'Planned',
        'inProgress': 'In Progress',
        'completed': 'Completed'
    };

    const roadmapItems = config?.feedbackRoadmap?.sections?.roadmap?.items || [];
    const sortedRoadmap = [...roadmapItems].sort((a, b) => {
        const columnOrder: Record<string, number> = { backlog: 0, nextup: 1, inprogress: 2, done: 3 };
        const priorityOrder: Record<string, number> = { 'Alta': 0, 'Media': 1, 'Bassa': 2, 'alta': 0, 'media': 1, 'bassa': 2 };

        const ca = columnOrder[a.column] ?? 99;
        const cb = columnOrder[b.column] ?? 99;
        if (ca !== cb) return ca - cb;

        const pa = priorityOrder[a.priority] ?? 99;
        const pb = priorityOrder[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;

        return (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase());
    });
    const filteredRoadmap = activeFilter === 'all'
        ? sortedRoadmap
        : sortedRoadmap.filter(item => columnToStatus[item.column] === activeFilter);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-black uppercase tracking-widest animate-pulse">Loading...</div>;
    }

    if (!config) {
        return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-black uppercase tracking-widest text-red-500">Error loading configuration</div>;
    }

    const enabledBanners = config.infoBanners?.filter(b => b.enabled) || [];

    return (
        <div className="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden pb-12">

            {/* Dynamic Navbar with Scroll Effect & Action Pill */}
            <header className={`fixed top-0 left-0 w-full z-50 px-4 transition-all duration-300 ${scrolled ? 'py-3 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-5 bg-transparent backdrop-blur-sm border-b border-transparent'}`}>
                <div className="flex justify-between items-center">
                    {/* Branding: Diamond + Text */}
                    <a href="#top" className="flex items-center gap-3 group">
                        <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-white to-gray-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 ${scrolled ? 'size-9' : 'size-10'}`}>
                            <span className={`material-symbols-outlined font-variation-fill transition-all ${scrolled ? 'text-lg' : 'text-2xl'}`}>diamond</span>
                        </div>
                        <div className={`flex flex-col transition-all duration-300 ${scrolled ? 'opacity-100' : 'opacity-90'}`}>
                            <h1 className="font-black text-white uppercase tracking-tighter leading-none text-base md:text-lg">Server Manfredonia</h1>
                            <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">Community Hub</span>
                        </div>
                    </a>

                    {/* Action Pill: Bell + Menu */}
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md shadow-lg">
                        {/* Bell */}
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 ${notificationsOpen ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                            </span>
                            {unreadCount > 0 && !notificationsOpen && (
                                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-black animate-pulse"></span>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="w-px h-4 bg-white/10 mx-1"></div>

                        {/* Menu */}
                        <button
                            onClick={toggleMenu}
                            className={`flex flex-col justify-center items-center w-10 h-10 rounded-full transition-all active:scale-95 ${menuOpen ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}
                        >
                            <div className="flex flex-col gap-[3px] items-center">
                                <span className={`block w-4 h-0.5 rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px] bg-black' : 'bg-white'}`}></span>
                                <span className={`block w-4 h-0.5 rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[0px] bg-black' : 'bg-white'}`}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>
            {/* Notifications Dropdown (Mobile Full/Large) */}
            {notificationsOpen && (
                <div className="fixed inset-x-4 top-20 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-4">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-white uppercase tracking-wider text-[10px]">System Alerts</h3>
                            <span className="text-[9px] text-gray-500 font-mono">
                                {unreadCount} Unread
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={togglePush} className={`size-8 rounded-lg flex items-center justify-center border transition-all ${pushEnabled ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-[18px]">{pushEnabled ? 'notifications_paused' : 'add_alert'}</span>
                            </button>
                            <button onClick={markAllAsRead} className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                            </button>
                            <button onClick={() => setNotificationsOpen(false)} className="size-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {enabledBanners.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined text-4xl opacity-20">notifications_off</span>
                                <span className="text-xs font-medium">No new notifications</span>
                            </div>
                        ) : (
                            enabledBanners.map(banner => (
                                <div key={banner.id} onClick={() => setReadIds(prev => Array.from(new Set([...prev, banner.id])))} className={`p-4 border-b border-white/5 relative group ${!readIds.includes(banner.id) ? 'bg-blue-500/[0.02]' : ''}`}>
                                    <div className="flex gap-3">
                                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${banner.style?.includes('red') ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                            <span className="material-symbols-outlined text-sm">{banner.icon === 'notification' ? 'priority_high' : (banner.icon || 'info')}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-white leading-tight">{banner.title}</h4>
                                                {!readIds.includes(banner.id) && <span className="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                                            </div>
                                            {banner.subtitle && <p className="text-xs text-gray-400">{banner.subtitle}</p>}
                                            <div className="text-xs text-gray-500 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: banner.message }} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {/* Backdrop for notifications */}
            {notificationsOpen && <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm" onClick={() => setNotificationsOpen(false)}></div>}



            {/* Mobile Navigation Drawer - Nano Dock (Below Header) */}
            <nav className={`fixed inset-x-2 z-40 bg-[#080808]/98 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1) shadow-2xl origin-top ${scrolled ? 'top-20' : 'top-24'} ${menuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="flex items-center justify-between gap-1">
                    {[
                        { href: "#top", icon: "schedule", label: "Status" },
                        { href: "#dashboard", icon: "terminal", label: "Dashboard" },
                        { href: "#updates", icon: "newspaper", label: "Updates" },
                        { href: "#guides", icon: "school", label: "Guides" },
                        { href: "#richiedi-accesso", icon: "build", label: "Tools" }
                    ].map((item, idx) => (
                        <a
                            key={idx}
                            href={item.href}
                            onClick={closeMenu}
                            className="group flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 flex-1 min-w-0"
                        >
                            <div className="flex items-center justify-center size-6 rounded-md bg-black/40 border border-white/5 text-white/70 group-hover:text-white transition-colors mb-1">
                                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider truncate w-full text-center">{item.label}</span>
                        </a>
                    ))}
                </div>
            </nav>

            {/* Backdrop for Menu */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={closeMenu}
                ></div>
            )}

            <main className="flex flex-col gap-12 pt-20 px-4">
                {/* Hero Section */}
                <section id="stato-server" className="relative flex flex-col items-center gap-8 py-6">
                    {/* Background Image Overlay */}
                    <div
                        className="fixed inset-0 z-[-1] opacity-20"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
                    </div>


                    {/* MISSION COUNTDOWN - Mobile Optimized */}
                    {config.countdown?.enabled && !countdownComplete && (
                        <div className="w-full max-w-7xl mx-auto relative group mb-4">
                            {/* Subtle glow effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 rounded-2xl blur-lg opacity-50"></div>

                            {/* Glass card container */}
                            <div className="relative glass-card rounded-2xl p-4 sm:p-6 border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col items-center gap-4 shadow-2xl">
                                {/* Title badge */}
                                <div className="flex flex-col items-center gap-2 relative z-10 w-full">
                                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 sm:px-4 py-1.5">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] font-black text-white/50 uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                                            {config.countdown.title}
                                        </span>
                                    </div>
                                </div>

                                {/* Countdown component - full width for better mobile display */}
                                <div className="w-full flex justify-center transform-gpu">
                                    <Countdown onExpire={() => setCountdownComplete(true)} />
                                </div>

                                {/* Decorative separator */}
                                <div className="flex items-center gap-4 sm:gap-8 opacity-15 w-full max-w-xs">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/30"></div>
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/20 whitespace-nowrap">
                                        Mission Boundary
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/30"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* SERVER IDENTITY DASHBOARD - Mobile Optimized */}
                <section id="server-identity" className="scroll-mt-24">
                    <div className="w-full relative group">
                        {/* Subtle glow effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl blur-lg opacity-50"></div>

                        {/* Glass card container */}
                        <div className="relative glass-card rounded-2xl border border-white/10 bg-[#080808]/80 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                            {/* Header Bar - Terminal Style */}
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[18px]">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex gap-1">
                                        <div className="size-2 rounded-full bg-red-500/30"></div>
                                        <div className="size-2 rounded-full bg-yellow-500/30"></div>
                                        <div className="size-2 rounded-full bg-green-500/30"></div>
                                    </div>
                                    <span className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-2">
                                        Terminal SVR_LOG_01
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="material-symbols-outlined text-xs sm:text-sm text-white/30">sensors</span>
                                    <span className="text-[8px] sm:text-[9px] font-black text-green-500/50 uppercase tracking-widest hidden xs:inline">
                                        Active
                                    </span>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-4 sm:p-6 flex flex-col gap-6 sm:gap-8">
                                {/* Global Identification */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-[0.4em] sm:tracking-[0.5em]">
                                            Global Identification
                                        </span>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter drop-shadow-glow-sm">
                                                {config.siteInfo.title}
                                            </h2>
                                            <div className="px-2 sm:px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-black text-white/50 tracking-widest uppercase shadow-inner">
                                                Alpha-1
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid - Mobile Optimized */}
                                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                        {/* Release */}
                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <span className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest">
                                                Release
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-white font-mono font-black text-lg sm:text-xl tracking-tighter leading-none">
                                                    {latestVersion || config.serverMetadata?.modpackVersion || 'v2.5'}
                                                </span>
                                                <span className="text-[7px] sm:text-[8px] font-black text-white/30 uppercase mt-0.5 sm:mt-1 tracking-widest">
                                                    GitHub
                                                </span>
                                            </div>
                                        </div>

                                        {/* Frequency/Status */}
                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <span className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest">
                                                Frequency
                                            </span>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className={`size-2.5 sm:size-3 rounded-full ${serverStatus.online ? 'bg-green-500 animate-pulse shadow-[0_0_12px_#22c55e]' : 'bg-red-500 shadow-[0_0_12px_#ef4444]'}`}></div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black text-sm sm:text-base uppercase tracking-widest leading-none">
                                                        {serverStatus.online ? 'Online' : 'Offline'}
                                                    </span>
                                                    {serverStatus.online && serverStatus.players && (
                                                        <span className="text-[7px] sm:text-[8px] font-black text-white/30 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5">
                                                            {serverStatus.players.online} Nodes
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Protocol - Full Width */}
                                        <div className="flex flex-col gap-1.5 sm:gap-2 col-span-2 border-t border-white/5 pt-4">
                                            <span className="text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest">
                                                Protocol
                                            </span>
                                            <span className="text-white/40 font-mono text-xs sm:text-sm uppercase tracking-tight">
                                                LEGACY-HUB.SVR
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button - Copy IP */}
                                <div className="flex flex-col items-center w-full">
                                    <button
                                        onClick={copyIp}
                                        className="group/copy-btn relative overflow-hidden bg-white text-black rounded-2xl px-6 sm:px-8 py-4 sm:py-5 w-full flex items-center justify-between active:scale-95 transition-all shadow-[0_15px_30px_-10px_rgba(255,255,255,0.2)]"
                                    >
                                        <div className="flex flex-col items-start leading-none gap-1">
                                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] opacity-40">
                                                Tap to Sync
                                            </span>
                                            <span className="text-base sm:text-lg font-black font-mono tracking-tighter">
                                                {config?.serverMetadata?.ip || 'JOINHUB.NET'}
                                            </span>
                                        </div>
                                        <span className="material-symbols-outlined text-xl sm:text-2xl group-active/copy-btn:rotate-12 transition-transform">
                                            content_copy
                                        </span>

                                        {/* Shimmer effect */}
                                        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-black/[0.05] to-transparent rotate-45 group-active/copy-btn:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                                    </button>
                                </div>
                            </div>

                            {/* Footer Bar - Terminal Command */}
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 rounded-b-[18px]">
                                <div className="flex items-center gap-2 sm:gap-3 font-mono text-[8px] sm:text-[9px] text-white/10 uppercase tracking-widest overflow-hidden">
                                    <span className="whitespace-nowrap">root@manfredonia:~$</span>
                                    <span className="text-white/5 truncate">sync-status --endpoint="{config?.serverMetadata?.ip}"</span>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="size-6 sm:size-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white/40 shadow-inner">
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-[0.15em] sm:tracking-[0.2em] hidden sm:inline">
                                        Validated
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Section - Mobile Optimized */}
                <section id="dashboard" className="scroll-mt-24">
                    <div className="glass-card bg-[#080808]/80 rounded-2xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
                        {/* Header Bar - Terminal Style */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[18px]">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex gap-1">
                                    <div className="size-2 rounded-full bg-red-500/30"></div>
                                    <div className="size-2 rounded-full bg-yellow-500/30"></div>
                                    <div className="size-2 rounded-full bg-green-500/30"></div>
                                </div>
                                <div className="h-4 w-px bg-white/5 mx-2 hidden sm:block"></div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                                    <span className="material-symbols-outlined text-sm text-purple-400">group</span>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none">
                                            {serverStatus.players?.online ?? 0} ACTIVE
                                        </span>
                                        <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.15em] mt-0.5 hidden sm:block">Live Feed</span>
                                    </div>
                                </div>
                                <div className="h-4 w-px bg-white/5 mx-2 hidden sm:block"></div>
                                <span className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] sm:tracking-[0.4em] hidden xs:block">
                                    Command Deck
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="material-symbols-outlined text-xs text-green-500/30">broadcast_on_home</span>
                                <span className="text-[8px] font-black text-green-500/30 uppercase tracking-widest leading-none hidden sm:block">Stream</span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-4 sm:p-6 flex flex-col gap-6">
                            {/* Server Intelligence */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-[1px] bg-purple-500/40"></span>
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-400">Intelligence</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Uplink Target</span>
                                        <span className="text-[9px] font-mono font-black text-white/80 tracking-tighter truncate">
                                            {config?.serverMetadata?.ip || 'Connecting...'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Latest Pack</span>
                                        <span className="text-[9px] font-mono font-black text-white/80 tracking-tighter">
                                            {latestVersion || config?.serverMetadata?.modpackVersion || 'v2.5'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                    <div className={`size-2 rounded-full ${serverStatus.online ? 'bg-green-500/60 shadow-[0_0_4px_#22c55e]' : 'bg-red-500/60 shadow-[0_0_4px_#ef4444]'}`}></div>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                                        {serverStatus.online ? 'Uplink Established' : 'Node Disconnect'}
                                    </span>
                                </div>
                            </div>

                            {/* Access Protocol - Quick Guide */}
                            <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-[1px] bg-blue-500/40"></span>
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">Access Protocol</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {[
                                        { step: '01', title: 'Registration', desc: 'Secure credentials after Whitelist confirmation.' },
                                        { step: '02', title: 'Discord Relay', desc: 'Navigate to #link-⛓️‍💥 channel.' },
                                        { step: '03', title: 'Auth Gateway', desc: 'Use uplink URL and enter credentials.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <div className="size-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 font-mono text-xs font-black text-white/20">
                                                {item.step}
                                            </div>
                                            <div className="flex flex-col gap-0.5 flex-1">
                                                <h4 className="text-xs font-black text-white uppercase tracking-widest">{item.title}</h4>
                                                <p className="text-[9px] text-white/30 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Button - Open Dashboard */}
                            <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                                <a
                                    href="https://server-manfredonia.ddns.net:25560/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                                    <span>Open Dashboard</span>
                                </a>

                                {/* SSL Warning */}
                                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-2">
                                    <span className="material-symbols-outlined text-red-400 text-base shrink-0">gpp_maybe</span>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Security Notice</span>
                                        <p className="text-[9px] text-white/40 leading-relaxed">
                                            If your browser flags the connection as insecure, proceed anyway. This is normal due to our private SSL certificate.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Bar */}
                        <div className="px-4 sm:px-6 py-3 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-b-[18px]">
                            <div className="flex items-center gap-2 font-mono text-[8px] text-white/10 uppercase tracking-widest overflow-hidden">
                                <span className="text-purple-500/30">CMD:</span>
                                <span className="text-white/5 truncate">access-console --target="{config?.serverMetadata?.ip || 'HUB_SVR_PROD'}"</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className={`size-1.5 rounded-full ${serverStatus.online ? 'bg-green-500/40' : 'bg-red-500/40'}`}></div>
                                <span className="text-[8px] font-mono text-white/20 uppercase">
                                    {serverStatus.online ? 'SYNCED' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Updates Section - Mobile Optimized */}
                <section id="updates" className="scroll-mt-24">
                    <div className="glass-card bg-[#080808]/80 rounded-2xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Latest <br />Releases</h2>
                            {releases.length > 0 && (
                                <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                                    {releases.length} Updates
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6">
                            {releasesLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                                </div>
                            ) : releases.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {releases.map((release, index) => {
                                        const isLatest = index === 0;
                                        const isExpanded = expandedReleaseIndex === index;

                                        return (
                                            <div
                                                key={release.version}
                                                className={`glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden group transition-all border border-white/5 hover:border-white/20 ${isExpanded ? '' : 'cursor-pointer active:scale-[0.98]'}`}
                                                onClick={() => {
                                                    // Se la card è già aperta, non fare nulla (non è collassabile)
                                                    if (isExpanded) return;
                                                    // Altrimenti, apri questa card
                                                    setExpandedReleaseIndex(index);
                                                }}
                                            >
                                                {/* Version Badge - Background */}
                                                <div className="absolute top-0 right-0 py-1.5 px-4 bg-white/5 text-white/10 font-black text-2xl sm:text-3xl uppercase tracking-widest select-none rounded-bl-xl">
                                                    {release.version}
                                                </div>

                                                <div className="flex flex-col gap-4 relative z-10">
                                                    {/* Header with badges */}
                                                    <div className="flex flex-wrap items-center gap-2 pr-20 sm:pr-24">
                                                        {isLatest && (
                                                            <span className="text-[9px] font-black text-white px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 uppercase tracking-widest">
                                                                Latest
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] font-black text-white px-2 py-1 rounded-full bg-white/10 border border-white/10 uppercase tracking-widest">
                                                            Stable Build
                                                        </span>
                                                        <span className="text-[9px] font-medium text-gray-500">
                                                            {release.date}
                                                        </span>
                                                    </div>

                                                    {/* Title and expand button */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex-1 pr-2">
                                                            {release.title}
                                                        </h3>
                                                        {/* Mostra il pulsante solo se la card è chiusa */}
                                                        {!isExpanded && (
                                                            <div className="flex items-center justify-center size-8 rounded-lg bg-white/5 border border-white/10 transition-all flex-shrink-0">
                                                                <span className="material-symbols-outlined text-white/60 text-lg">
                                                                    keyboard_arrow_down
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Expanded content - sempre visibile se la card è aperta */}
                                                    {isExpanded && (
                                                        <div
                                                            className="text-gray-300 leading-relaxed space-y-3 max-h-[300px] overflow-y-auto pr-2 animate-in fade-in slide-in-from-top-2 duration-300"
                                                            style={{
                                                                scrollbarWidth: 'thin',
                                                                scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            dangerouslySetInnerHTML={{ __html: markdownToHtml(release.body) }}
                                                        ></div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <p className="text-xs">No release notes found or unable to fetch from GitHub.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Guides & Resources Section - Mobile Optimized */}
                <section id="guides" className="scroll-mt-24">
                    <div className="glass-card bg-[#080808]/80 rounded-2xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
                        {/* Main Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setGuideTab('install')}
                                className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-widest transition-all ${guideTab === 'install' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                Installation
                            </button>
                            <div className="w-px bg-white/10"></div>
                            <button
                                onClick={() => setGuideTab('optimize')}
                                className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-widest transition-all ${guideTab === 'optimize' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                Optimization
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-4 sm:p-6">
                            {/* INSTALLATION CONTENT */}
                            {guideTab === 'install' && (
                                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* Launcher Selector */}
                                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                                        {[
                                            { id: 'curseforge', label: 'CurseForge' },
                                            { id: 'modrinth', label: 'Modrinth' },
                                            { id: 'sklauncher', label: 'SKLauncher' }
                                        ].map((launcher) => (
                                            <button
                                                key={launcher.id}
                                                onClick={() => setInstallTab(launcher.id as any)}
                                                className={`px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-wide ${installTab === launcher.id ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'}`}
                                            >
                                                {launcher.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Launcher Specific Steps */}
                                    <div className="flex flex-col gap-6 mt-2">
                                        {installTab === 'curseforge' && [
                                            { step: '01', title: 'Get the App', desc: 'Download and install the CurseForge App from their official website.', link: 'https://www.curseforge.com/download/app', color: 'text-purple-400' },
                                            { step: '02', title: 'Download Pack', desc: 'Download the Modpack .zip file from the button above.' },
                                            { step: '03', title: 'Import', desc: 'Open CurseForge, click "Create Custom Profile", then "Import" and select the downloaded .zip.' }
                                        ].map(item => (
                                            <div key={item.step} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <span className="text-4xl font-black text-white/5 tracking-tighter">{item.step}</span>
                                                <h4 className="text-base font-bold text-white uppercase">{item.title}</h4>
                                                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                                                {item.link && (
                                                    <a href={item.link} target="_blank" rel="noreferrer" className={`text-[10px] ${item.color || 'text-purple-400'} hover:underline underline-offset-4 mt-1 inline-block`}>
                                                        Download App →
                                                    </a>
                                                )}
                                            </div>
                                        ))}

                                        {installTab === 'modrinth' && [
                                            { step: '01', title: 'Get the App', desc: 'Download and install the Modrinth App.', link: 'https://modrinth.com/app', color: 'text-green-400' },
                                            { step: '02', title: 'Create Instance', desc: 'Click the "+" button to create a new instance.' },
                                            { step: '03', title: 'Import', desc: 'Select "Import from File" and choose the .mrpack file downloaded above.' }
                                        ].map(item => (
                                            <div key={item.step} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <span className="text-4xl font-black text-white/5 tracking-tighter">{item.step}</span>
                                                <h4 className="text-base font-bold text-white uppercase">{item.title}</h4>
                                                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                                                {item.link && (
                                                    <a href={item.link} target="_blank" rel="noreferrer" className={`text-[10px] ${item.color || 'text-green-400'} hover:underline underline-offset-4 mt-1 inline-block`}>
                                                        Download App →
                                                    </a>
                                                )}
                                            </div>
                                        ))}

                                        {installTab === 'sklauncher' && [
                                            { step: '01', title: 'Prepare', desc: 'Download SKLauncher and run it.', link: 'https://skmedix.pl/', color: 'text-blue-400' },
                                            { step: '02', title: 'Extract', desc: 'Extract the contents of the Modpack .zip directly into your .minecraft folder (replace existing files).' },
                                            { step: '03', title: 'Configure', desc: 'Launch with "fabric-loader-0.14.21-1.20.1" and allocate 6-8GB RAM.' }
                                        ].map(item => (
                                            <div key={item.step} className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <span className="text-4xl font-black text-white/5 tracking-tighter">{item.step}</span>
                                                <h4 className="text-base font-bold text-white uppercase">{item.title}</h4>
                                                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                                                {item.link && (
                                                    <a href={item.link} target="_blank" rel="noreferrer" className={`text-[10px] ${item.color || 'text-blue-400'} hover:underline underline-offset-4 mt-1 inline-block`}>
                                                        Visit Site →
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* OPTIMIZATION CONTENT */}
                            {guideTab === 'optimize' && (
                                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* RAM Allocation */}
                                    <div className="flex flex-col gap-6 border-b border-white/5 pb-6">
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase italic mb-3">Memory Allocation</h3>
                                            <p className="text-xs text-gray-400 leading-relaxed mb-4">
                                                Correct RAM allocation is critical for stability. Too little causes lag, too much causes garbage collection stutters.
                                            </p>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Device RAM {'≤'} 8GB</span>
                                                    <span className="text-lg font-bold text-white">Allocate 5.0 - 5.5 GB</span>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 block">Device RAM {'>'} 8GB</span>
                                                    <span className="text-lg font-bold text-white">Allocate 8.0 GB</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/5 border border-yellow-500/30 rounded-2xl flex flex-col relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
                                            <h4 className="text-yellow-400 font-black uppercase text-sm mb-2 flex items-center gap-2 relative z-10">
                                                <span className="material-symbols-outlined text-xl">warning</span>
                                                <span>Important</span>
                                            </h4>
                                            <p className="text-xs text-yellow-100/80 leading-relaxed font-medium relative z-10">
                                                Never allocate more than half your system RAM if you have 8GB or less.
                                                Always check <span className="text-yellow-400 font-bold underline underline-offset-2">Task Manager</span> to verify your total available RAM before configuring.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Video Settings & Drivers */}
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white uppercase mb-4">Video Settings</h3>
                                            <ul className="space-y-3">
                                                {[
                                                    { label: 'Render Distance', value: '6-8 Chunks' },
                                                    { label: 'Simulation Distance', value: 'Minimum (5)' },
                                                    { label: 'VSync', value: 'OFF' },
                                                    { label: 'Entity Shadows', value: 'OFF' },
                                                    { label: 'Particles', value: 'Decreased / Minimal' }
                                                ].map(setting => (
                                                    <li key={setting.label} className="flex items-center justify-between border-b border-white/5 pb-2">
                                                        <span className="text-gray-400 text-xs">{setting.label}</span>
                                                        <span className="text-white font-mono text-xs">{setting.value}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-white uppercase mb-4">Drivers & Java</h3>
                                            <div className="flex flex-col gap-3">
                                                <a href="https://www.nvidia.com/Download/index.aspx" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                                    <span className="text-xs font-bold text-white">NVIDIA Drivers</span>
                                                    <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors text-sm">open_in_new</span>
                                                </a>
                                                <a href="https://www.amd.com/en/support" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                                    <span className="text-xs font-bold text-white">AMD Drivers</span>
                                                    <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors text-sm">open_in_new</span>
                                                </a>
                                                <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                                    <p className="text-[10px] text-purple-200/80 leading-relaxed">
                                                        <strong>Java Tip:</strong> Use GraalVM or Java 21+ for best performance on 1.18+ packs.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Utilities Section */}
                <section id="richiedi-accesso" className="scroll-mt-24">
                    <div className="glass-card bg-[#080808]/80 rounded-2xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
                        {/* Header Bar - Terminal Style */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[18px]">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex gap-1">
                                    <div className="size-2 rounded-full bg-blue-500/30"></div>
                                    <div className="size-2 rounded-full bg-purple-500/30"></div>
                                    <div className="size-2 rounded-full bg-green-500/30"></div>
                                </div>
                                <div className="h-4 w-px bg-white/5 mx-2 hidden sm:block"></div>
                                <span className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                                    Community Tools
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="material-symbols-outlined text-xs text-blue-500/30">settings_remote</span>
                                <span className="text-[8px] font-black text-blue-500/30 uppercase tracking-widest leading-none hidden sm:block">Active</span>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="px-4 sm:px-6 pt-4 pb-2">
                            <div className="flex flex-wrap justify-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                                {[
                                    { id: 'tab-access', label: 'Access', icon: 'key', color: 'text-green-400' },
                                    { id: 'tab-feedback', label: 'Report', icon: 'bug_report', color: 'text-red-400' },
                                    { id: 'tab-suggestions', label: 'Ideas', icon: 'lightbulb', color: 'text-purple-400' },
                                    { id: 'tab-roadmap', label: 'Roadmap', icon: 'map', color: 'text-blue-400' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`flex-1 min-w-[70px] py-2.5 sm:py-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[16px] sm:text-[18px] ${activeTab === tab.id ? '' : tab.color}`}>{tab.icon}</span>
                                        <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-4 sm:p-6">

                            {/* ACCESS TAB */}
                            {activeTab === 'tab-access' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-3 h-[1px] bg-green-500/40"></span>
                                        <h3 className="text-lg font-black text-white uppercase italic">Request Access</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-6">Fill out the form to join the server.</p>

                                    <form action="https://formspree.io/f/mqabzreg" method="POST" className="flex flex-col gap-4">
                                        {[
                                            { id: "name", label: "Full Name", placeholder: "Max Verstappen" },
                                            { id: "email", label: "Email", placeholder: "maxverstappen@live.en", type: "email" },
                                            { id: "minecraft", label: "Minecraft Username", placeholder: "MaxVerstappen69" },
                                            { id: "discord", label: "Discord Username", placeholder: "Max#3" }
                                        ].map(field => (
                                            <div key={field.id} className="flex flex-col gap-2">
                                                <label htmlFor={field.id} className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{field.label}</label>
                                                <input type={field.type || "text"} name={field.id} id={field.id} placeholder={field.placeholder} required
                                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                                />
                                            </div>
                                        ))}
                                        <input type="hidden" name="_subject" value="New Minecraft Server Access Request" />
                                        <button type="submit" className="mt-2 w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-gray-200 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group">
                                            <span>Send Request</span>
                                            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">send</span>
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* FEEDBACK TAB */}
                            {activeTab === 'tab-feedback' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-3 h-[1px] bg-red-500/40"></span>
                                        <h3 className="text-lg font-black text-white uppercase italic">Report Issue</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-6">Report bugs or technical issues.</p>

                                    <form action="https://formspree.io/f/xblavdda" method="POST" className="flex flex-col gap-4">
                                        {[
                                            { id: "name", label: "Name", placeholder: "Max Verstappen" },
                                            { id: "email", label: "Email", placeholder: "maxverstappen@live.en", type: "email" },
                                            { id: "modpack-version", label: "Modpack Version", placeholder: "e.g. 1.5.0" },
                                        ].map(field => (
                                            <div key={field.id} className="flex flex-col gap-2">
                                                <label htmlFor={field.id} className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{field.label}</label>
                                                <input type={field.type || "text"} name={field.id} id={field.id} placeholder={field.placeholder} required
                                                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                                />
                                            </div>
                                        ))}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="description" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Description</label>
                                            <textarea name="description" id="description" rows={4} placeholder="Problem details..." required
                                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                            ></textarea>
                                        </div>
                                        <input type="hidden" name="_subject" value="Server Issue Report" />
                                        <button type="submit" className="mt-2 w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 active:scale-95 font-black uppercase text-xs tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 group">
                                            <span>Report Bug</span>
                                            <span className="material-symbols-outlined text-base group-hover:rotate-12 transition-transform">bug_report</span>
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* SUGGESTIONS TAB */}
                            {activeTab === 'tab-suggestions' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-3 h-[1px] bg-purple-500/40"></span>
                                        <h3 className="text-lg font-black text-white uppercase italic">Suggest Feature</h3>
                                    </div>

                                    <form action={config.feedbackRoadmap?.sections?.suggestions?.formspreeUrl || 'https://formspree.io/f/xblavdda'} method="POST" className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Category</label>
                                            <div className="relative">
                                                <select name="suggestion-type" required className="w-full appearance-none bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors">
                                                    <option value="" disabled selected hidden>Select Type...</option>
                                                    <option value="gameplay">Gameplay</option>
                                                    <option value="interface">Interface</option>
                                                    <option value="mod">New Mod</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="suggestion-description" className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Idea</label>
                                            <textarea name="description" id="suggestion-description" rows={4} placeholder="Describe your suggestion..." required
                                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                            ></textarea>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Link (Optional)</label>
                                            <div className="flex gap-2">
                                                <input type="url" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="https://..."
                                                    className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
                                                />
                                                <button type="button" onClick={addLink} className="w-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">+</button>
                                            </div>
                                            {links.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {links.map((link, i) => (
                                                        <div key={i} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300">
                                                            <span className="truncate max-w-[150px]">{link}</span>
                                                            <button type="button" onClick={() => removeLink(i)} className="hover:text-white">×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {links.map((link, idx) => (
                                                <input key={idx} type="hidden" name="links[]" value={link} />
                                            ))}
                                        </div>

                                        <input type="hidden" name="_subject" value="New Server Suggestion" />
                                        <button type="submit" className="mt-2 w-full py-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 active:scale-95 font-black uppercase text-xs tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2 group">
                                            <span>Submit Idea</span>
                                            <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">lightbulb</span>
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* ROADMAP TAB */}
                            {activeTab === 'tab-roadmap' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-3 h-[1px] bg-blue-500/40"></span>
                                        <h3 className="text-lg font-black text-white uppercase italic">Project Roadmap</h3>
                                    </div>

                                    <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-4">
                                        {[
                                            { id: 'all', label: 'All' },
                                            { id: 'backlog', label: 'Backlog', dot: 'bg-purple-500' },
                                            { id: 'planned', label: 'Planned', dot: 'bg-blue-500' },
                                            { id: 'inProgress', label: 'In Dev', dot: 'bg-yellow-500' },
                                            { id: 'completed', label: 'Done', dot: 'bg-green-500' }
                                        ].map(filter => (
                                            <button
                                                key={filter.id}
                                                onClick={() => handleFilterClick(filter.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === filter.id ? 'bg-white border-white text-black' : 'bg-transparent border-white/10 text-gray-400'}`}
                                            >
                                                {filter.dot && <span className={`w-1.5 h-1.5 rounded-full ${filter.dot}`}></span>}
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {filteredRoadmap.map(item => {
                                            const status = columnToStatus[item.column] || 'planned';
                                            const statusColor = {
                                                backlog: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                                                planned: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                                                inProgress: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                                                completed: 'text-green-400 bg-green-500/10 border-green-500/20'
                                            }[status] || 'text-gray-400';

                                            return (
                                                <div key={item.id} className="p-4 rounded-xl bg-[#050505] border border-white/5 flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${statusColor}`}>
                                                            {statusText[status]}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-white/30">{item.priority} Priority</span>
                                                    </div>
                                                    <h4 className="font-bold text-sm text-gray-200">{item.title}</h4>
                                                    <p className="text-xs text-gray-500">{item.type}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Bar */}
                        <div className="px-4 sm:px-6 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between rounded-b-[18px]">
                            <div className="flex items-center gap-2 font-mono text-[8px] text-white/10 uppercase tracking-widest overflow-hidden">
                                <span className="text-blue-500/30">TOOLS:</span>
                                <span className="text-white/5 truncate">community-feedback --mode="{activeTab.replace('tab-', '')}"</span>
                            </div>
                            <div className="size-1.5 rounded-full bg-green-500/30 animate-pulse shrink-0"></div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="px-6 py-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                <p>&copy; 2025 Server Manfredonia. All rights reserved.</p>
            </footer>
        </div >
    );
};

export default Mobile;
