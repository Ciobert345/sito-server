import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces
interface UnlockedIntel {
    id: string;
    name: string;
    description?: string;
    image_url: string;
    unlock_code?: string;
}

const PLACEHOLDER_INTEL = "https://placehold.co/600x800/0a0a0a/10b981/png?text=CLASSIFIED\\nDATA+MISSING&font=roboto";

const MobileAccount: React.FC = () => {
    const { user, loading: authLoading, updateProfile, updatePassword, uploadAvatar, verifyPassword, logout, unlockedIntelIds, setAuthModalOpen, markBannerAsRead, markAllBannersAsRead } = useAuth();
    const navigate = useNavigate();
    const { config, notifications, loading: configLoading } = useConfig();

    // UI States
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);

    useEffect(() => {
        const savedPush = localStorage.getItem('manfredonia_push_enabled');
        if (savedPush === 'true') setPushEnabled(true);
    }, []);

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

    const markAllAsRead = async () => {
        const enabledIds = notifications?.filter(b => b.enabled).map(b => b.id) || [];
        await markAllBannersAsRead(enabledIds);
    };

    // Read IDs
    const readIds = user?.read_banner_ids || [];

    // Config access (moved up or accessed here if possible, but hooks strict order)
    // We need config here for unreadCount. 
    // BUT config is loaded later at line 149. This is a problem.
    // We should move useConfig up.

    // TEMPORARY FIX: Define helpers here, move hook up in next step.


    // Accordion States for settings
    const [activeSection, setActiveSection] = useState<string | null>('identity');

    // Form State
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Helper: Markdown to HTML with Auto-Link
    const markdownToHtml = (text: string) => {
        if (!text) return '';
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Code blocks
        html = html.replace(/`([^`]+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-yellow-300 font-mono text-xs border border-white/10">$1</code>');
        // Links (Markdown)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors">$1</a>');

        // Auto-link Raw URLs (excluding existing tags)
        html = html.replace(/(<a\b[^>]*>.*?<\/a>|<code\b[^>]*>.*?<\/code>)|((?:https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g, (match, tag, url) => {
            if (tag) return tag;
            const href = url.startsWith('http') ? url : `https://${url}`;
            return `<a href="${href}" target="_blank" rel="noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors break-all">${url}</a>`;
        });

        // Bold
        html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
        // Italic
        html = html.replace(/\*([^*\n]+?)\*/g, '<em class="text-white/80 italic">$1</em>');
        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    };

    const enabledBanners = notifications?.filter(b => b.enabled) || [];
    const unreadCount = enabledBanners.filter(b => !readIds.includes(b.id)).length;

    // Feedback & Data
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [unlockedIntel, setUnlockedIntel] = useState<UnlockedIntel[]>([]);
    const [viewingIntel, setViewingIntel] = useState<UnlockedIntel | null>(null);
    const [imgLoading, setImgLoading] = useState(true);
    const [openedAssets, setOpenedAssets] = useState<Set<string>>(new Set());

    // Scroll Handler
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initialize State
    useEffect(() => {
        if (user?.username && !newUsername) setNewUsername(user.username);
        const loadedOpened = localStorage.getItem('intel_assets_opened');
        if (loadedOpened) setOpenedAssets(new Set(JSON.parse(loadedOpened)));
    }, [user?.username]);

    // Fetch Intel
    useEffect(() => {
        const fetchUnlockedIntel = async () => {
            if (!unlockedIntelIds || unlockedIntelIds.length === 0) {
                setUnlockedIntel([]);
                return;
            }
            const { data } = await supabase
                .from('intel_assets')
                .select('id, name, description, image_url, unlock_code')
                .in('id', unlockedIntelIds);

            if (data) setUnlockedIntel(data);
        };
        if (user) fetchUnlockedIntel();
    }, [unlockedIntelIds, user]);

    // Handlers

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            await updateProfile({ username: newUsername });
            setStatus({ type: 'success', msg: 'Profile updated' });
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'Error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', msg: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            const isValid = await verifyPassword(oldPassword);
            if (!isValid) throw new Error('Invalid current password');
            await updatePassword(newPassword);
            setStatus({ type: 'success', msg: 'Password updated' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'Error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setStatus({ type: 'error', msg: 'File too large (>2MB)' });
            return;
        }
        setUploadingAvatar(true);
        setStatus(null);
        try {
            await uploadAvatar(file);
            setStatus({ type: 'success', msg: 'Avatar updated' });
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'Upload failed' });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = PLACEHOLDER_INTEL;
    };

    // Redirect if not authenticated (after loading)
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/mobile', { replace: true });
        }
    }, [authLoading, user, navigate]);



    // Loading Screen
    if (authLoading || configLoading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden">
                <div className="size-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
                <div className="flex flex-col items-center gap-1 animate-pulse">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Authenticating</span>
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Verifying Clearance...</span>
                </div>
            </div>
        );
    }

    if (!user || !config || (!user.isApproved && !user.isAdmin)) {
        if (!user || !config) return null;
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="fixed inset-x-0 top-0 h-[300px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1)_0%,transparent_70%)] pointer-events-none" />

                <div className="relative group mb-8">
                    <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full"></div>
                    <div className="relative size-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500/40 shadow-2xl overflow-hidden">
                        <span className="material-symbols-outlined text-5xl">lock_clock</span>
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px]"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 size-4 bg-amber-500 rounded-full border-4 border-[#050505] animate-pulse"></div>
                </div>

                <div className="flex flex-col gap-4 mb-10 relative z-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                        Identity <br /> <span className="text-white/20 text-4xl">Under Review</span>
                    </h2>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] leading-relaxed max-w-[240px] mx-auto">
                        Your account is currently in the verification queue. Full access will be granted upon approval.
                    </p>
                </div>

                <div className="flex flex-col w-full gap-3 relative z-10">
                    <button
                        onClick={() => { logout(); navigate('/mobile'); }}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 active:scale-[0.98] transition-all"
                    >
                        Terminate Session
                    </button>
                    <button
                        onClick={() => navigate('/mobile')}
                        className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] active:scale-[0.98] transition-all"
                    >
                        Return Home
                    </button>
                </div>

                <div className="mt-12 opacity-20 flex flex-col items-center gap-2">
                    <span className="text-[8px] font-mono uppercase tracking-[0.4em]">Pending_Approval_V4</span>
                    <div className="h-px w-12 bg-white/20"></div>
                </div>
            </div>
        );
    }

    const navItems = [
        { href: "/mobile", icon: "schedule", label: "Status", action: () => { localStorage.setItem('mobileScrollTarget', 'top'); navigate('/mobile'); } },
        { href: "/mobile", icon: "terminal", label: "Dashboard", action: () => { localStorage.setItem('mobileScrollTarget', 'dashboard'); navigate('/mobile'); } },
        { href: "/mobile", icon: "newspaper", label: "Updates", action: () => { localStorage.setItem('mobileScrollTarget', 'updates'); navigate('/mobile'); } },
        { href: "/mobile", icon: "school", label: "Guides", action: () => { localStorage.setItem('mobileScrollTarget', 'guides'); navigate('/mobile'); } },
        { href: "/mobile", icon: "build", label: "Tools", action: () => { localStorage.setItem('mobileScrollTarget', 'richiedi-accesso'); navigate('/mobile'); } },
        { id: "account-nav", icon: "badge", label: "Account", active: true }
    ];

    return (
        <div className="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden pb-8 relative touch-manipulation">
            {/* Background */}
            <div className="fixed inset-x-0 top-0 h-[300px] bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1)_0%,transparent_70%)] pointer-events-none" />
            <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none" />

            {/* Dynamic Navbar with Scroll Effect & Action Pill */}
            <header
                className={`fixed left-0 w-full z-50 px-4 transition-all duration-300 ${scrolled ? 'py-3 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-5 bg-transparent backdrop-blur-sm border-b border-transparent'}`}
                style={{ top: 'var(--banner-height, 0px)' }}
            >
                <div className="flex justify-between items-center">
                    {/* Branding: Diamond + Text */}
                    <a href="#top" onClick={(e) => { e.preventDefault(); navigate('/mobile'); }} className="flex items-center gap-3 group">
                        <div className={`relative flex items-center justify-center rounded-xl transition-all duration-300 ${scrolled ? 'size-9' : 'size-10'}`}>
                            <img src="/site-icon-rack-white.svg" alt="Server Manfredonia Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                        </div>
                        <div className={`flex flex-col transition-all duration-300 ${scrolled ? 'opacity-100' : 'opacity-90'}`}>
                            <h1 className="font-black text-white uppercase tracking-tighter leading-none text-base md:text-lg">Server Manfredonia</h1>
                            <span className="text-[8px] md:text-[9px] font-bold text-white/40 uppercase tracking-[0.3em]">Operative Account</span>
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

            {/* Notifications Dropdown */}
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
                                <div key={banner.id} onClick={() => markBannerAsRead(banner.id)} className={`p-4 border-b border-white/5 relative group ${!readIds.includes(banner.id) ? 'bg-blue-500/[0.04]' : 'opacity-60'}`}>
                                    <div className="flex gap-3">
                                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${banner.style?.includes('red') ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                            !readIds.includes(banner.id) ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                'bg-white/5 border-white/10 text-white/20'
                                            }`}>
                                            <span className="material-symbols-outlined text-sm">{banner.icon === 'notification' ? 'priority_high' : (banner.icon || 'info')}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-white leading-tight">{banner.title}</h4>
                                                {!readIds.includes(banner.id) && <span className="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                                            </div>
                                            {banner.subtitle && <p className="text-xs text-gray-400">{banner.subtitle}</p>}
                                            <div className="text-xs text-gray-500 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: markdownToHtml(banner.message) }} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Navigation Drawer - Nano Dock */}
            <nav
                className={`fixed inset-x-2 z-40 bg-[#080808]/98 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1) shadow-2xl origin-top ${menuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
                style={{ top: scrolled ? 'calc(5rem + var(--banner-height, 0px))' : 'calc(6rem + var(--banner-height, 0px))' }}
            >
                <div className="flex items-center justify-between gap-1">
                    {navItems.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.href || '#'}
                            onClick={(e) => {
                                if (item.action) {
                                    e.preventDefault();
                                    item.action();
                                }
                                closeMenu();
                            }}
                            className={`group flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95 flex-1 min-w-0 ${item.active ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white'}`}
                        >
                            <div className={`flex items-center justify-center size-6 rounded-md border transition-colors mb-1 ${item.active ? 'bg-black/10 border-black/5 text-black' : 'bg-black/40 border-white/5 text-white/70 group-hover:text-white'}`}>
                                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{item.label}</span>
                        </a>
                    ))}
                </div>
            </nav>

            {/* Backdrops */}
            {notificationsOpen && <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm" onClick={() => setNotificationsOpen(false)}></div>}
            {menuOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={closeMenu}></div>}


            {/* Main Content Area */}
            <div className="mt-24 px-4 w-full max-w-md mx-auto flex flex-col gap-6" style={{ paddingTop: 'calc(5rem + var(--banner-height, 0px))' }}>

                {/* 1. Identity Card (Horizontal Layout) */}
                <div className="w-full bg-[#0F0F0F] rounded-2xl border border-white/10 p-4 relative overflow-hidden shadow-2xl">
                    {/* Decorative background for card */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full translate-x-10 -translate-y-10" />

                    <div className="flex items-center gap-4 relative z-10">
                        {/* Avatar */}
                        <label className="relative size-16 shrink-0 rounded-full overflow-hidden border-2 border-white/10 bg-black cursor-pointer active:scale-95 transition-transform">
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                    <span className="material-symbols-outlined text-white/30">person</span>
                                </div>
                            )}
                            {uploadingAvatar && <div className="absolute inset-0 bg-purple-500/50 flex items-center justify-center"><div className="size-4 border-2 border-white rounded-full border-t-transparent animate-spin" /></div>}
                        </label>

                        {/* Text Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-lg font-black text-white italic tracking-tighter truncate">{user.username}</h2>
                                <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold font-mono tracking-wider border border-purple-500/30">LVL {user.clearance_level ?? 0}</span>
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        {user?.clearance_level >= 10 ? 'LEGACY' :
                                            user?.clearance_level >= 9 ? 'SENTINEL' :
                                                user?.clearance_level >= 8 ? 'OVERSEER' :
                                                    user?.clearance_level >= 7 ? 'COMMANDER' :
                                                        user?.clearance_level >= 6 ? 'VETERAN' :
                                                            user?.clearance_level >= 5 ? 'ELITE' :
                                                                user?.clearance_level >= 4 ? 'SPECIALIST' :
                                                                    user?.clearance_level >= 3 ? 'OPERATIVE' :
                                                                        user?.clearance_level >= 2 ? 'NOVICE' :
                                                                            user?.clearance_level >= 1 ? 'AGENT' : 'INITIATE'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                                <span className="truncate">UUID: {user.id.substring(0, 8)}...</span>
                            </div>

                            {/* Compact XP Bar */}
                            <div className="mt-2 w-full">
                                <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider mb-1 text-white/30">
                                    <span>XP Progress</span>
                                    <span className="text-emerald-400">{user.experience_points || 0} XP</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"
                                        style={{ width: `${Math.min((((user.experience_points || 0) % 1000) / 1000) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Toast */}
                <AnimatePresence>
                    {status && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`w-full p-3 rounded-xl border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'} flex items-center gap-3`}>
                            <span className="material-symbols-outlined text-sm">{status.type === 'error' ? 'error' : 'check_circle'}</span>
                            <span className="text-xs font-bold uppercase tracking-wide">{status.msg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. List Settings Group */}
                <div className="flex flex-col gap-4">

                    {/* Identity Settings */}
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Identity Configuration</h3>
                        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                            <div className="p-4 flex flex-col gap-2">
                                <label className="text-[9px] font-mono text-white/30 uppercase">Operative Codename</label>
                                <form onSubmit={handleUpdateProfile} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-sm text-white font-medium focus:border-purple-500/50 outline-none transition-colors"
                                    />
                                    <button disabled={loading || newUsername === user.username} type="submit" className="px-4 h-10 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 disabled:opacity-30 transition-all">
                                        Save
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Security Protocol</h3>
                        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setActiveSection(activeSection === 'security' ? null : 'security')}
                                className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <span className="material-symbols-outlined text-lg">lock</span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-bold text-white">Password Update</span>
                                        <span className="text-[10px] text-white/40">Change your access token</span>
                                    </div>
                                </div>
                                <span className={`material-symbols-outlined text-white/30 transition-transform ${activeSection === 'security' ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            <AnimatePresence>
                                {activeSection === 'security' && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                        <form onSubmit={handleUpdatePassword} className="p-4 pt-0 flex flex-col gap-3">
                                            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Current Password" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:border-blue-500/50 outline-none" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:border-blue-500/50 outline-none" />
                                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm" className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-sm text-white focus:border-blue-500/50 outline-none" />
                                            </div>
                                            <button disabled={loading || !newPassword} className="w-full h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-500/30 transition-all">Update Credentials</button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Intel Assets */}
                    {unlockedIntel.length > 0 && (config.isIntelEnabled || user.isAdmin || user.permissions?.intel) ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Unlocked Intel</h3>
                                <span className="text-[9px] font-mono text-emerald-500/50">{unlockedIntel.length} FILES DECRYPTED</span>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-6 px-2 snap-x snap-mandatory mask-gradient-right">
                                {unlockedIntel.map(intel => (
                                    <div
                                        key={intel.id}
                                        onClick={() => {
                                            setViewingIntel(intel);
                                            setImgLoading(true);
                                            if (!openedAssets.has(intel.id)) {
                                                const s = new Set(openedAssets); s.add(intel.id); setOpenedAssets(s);
                                                localStorage.setItem('intel_assets_opened', JSON.stringify(Array.from(s)));
                                            }
                                        }}
                                        className="snap-start shrink-0 w-32 aspect-[3/4] rounded-xl bg-[#0F0F0F] border border-white/10 relative overflow-hidden group active:scale-95 transition-transform shadow-lg"
                                    >
                                        <img
                                            src={intel.image_url}
                                            onError={handleImageError}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                                        />

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-3 flex flex-col justify-end">
                                            <div className="w-8 h-0.5 bg-emerald-500 mb-2"></div>
                                            <span className="text-[10px] font-black text-white uppercase leading-tight line-clamp-2 drop-shadow-md whitespace-normal">{intel.name}</span>
                                        </div>

                                        {/* Status Indicators */}
                                        {!openedAssets.has(intel.id) ? (
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-wider rounded flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                                                <span>NEW</span>
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 left-2 text-white/20">
                                                <span className="material-symbols-outlined text-[14px]">lock_open</span>
                                            </div>
                                        )}

                                        {/* Scanline effect on hover */}
                                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>



                {/* Danger Zone */}
                <button
                    onClick={() => {
                        logout();
                        navigate('/mobile');
                    }}
                    className="w-full mt-4 bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-colors">
                            <span className="material-symbols-outlined">power_settings_new</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-bold text-red-400">Terminate Session</span>
                            <span className="text-[10px] text-red-400/50">Log out of this device</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-red-400/30">arrow_forward_ios</span>
                </button>

                <div className="flex justify-center py-6 opacity-30">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white">System Secure /// v1.2</span>
                </div>
            </div>

            {/* Intel Viewer Modal - High Fidelity */}
            {/* Intel Viewer Modal - TOP SECRET REDESIGN */}
            <AnimatePresence>
                {viewingIntel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col h-[100dvh] overflow-hidden"
                        onClick={() => setViewingIntel(null)}
                    >
                        {/* 1. Immersive Background Layer */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <img
                                src={viewingIntel.image_url}
                                onError={(e) => (e.currentTarget.src = PLACEHOLDER_INTEL)}
                                className="w-full h-full object-cover blur-3xl opacity-20 scale-125"
                            />
                            <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.3)_2px)] bg-[length:100%_4px]" />
                        </div>

                        {/* 2. Tactical Header */}
                        <div className="relative z-10 flex items-center justify-between p-4 pt-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 text-emerald-500 mb-0.5">
                                    <span className="material-symbols-outlined text-lg animate-pulse">lock_open</span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">Decrypted Asset</span>
                                </div>
                                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Clearance Level: OMEGA</span>
                            </div>
                            <button
                                onClick={() => setViewingIntel(null)}
                                className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* 3. Main Scrollable Content */}
                        <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center p-5 gap-8 pb-32" onClick={e => e.stopPropagation()}>

                            {/* Holographic Image Frame */}
                            <div className="w-full max-w-sm relative mt-4">
                                {/* Corners */}
                                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg z-20" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg z-20" />
                                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg z-20" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-emerald-500 rounded-br-lg z-20" />

                                <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/80 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                                    {/* Scanline */}
                                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_3px] pointer-events-none z-10 opacity-60"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 blur-[2px] animate-[scan_3s_linear_infinite]" />

                                    {/* Loading State */}
                                    {imgLoading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
                                            <div className="size-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-2" />
                                            <span className="text-[9px] font-mono text-emerald-500 animate-pulse">DECRYPTING VISUALS...</span>
                                        </div>
                                    )}

                                    <img
                                        src={viewingIntel.image_url}
                                        onLoad={() => setImgLoading(false)}
                                        onError={(e) => {
                                            e.currentTarget.src = PLACEHOLDER_INTEL;
                                            setImgLoading(false);
                                        }}
                                        className={`w-full h-auto max-h-[50vh] object-contain transition-opacity duration-500 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                                        alt="Intel Asset"
                                    />

                                    <div className="absolute bottom-3 left-3 z-20">
                                        <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-emerald-500/30">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Img_Ref_0{viewingIntel.id.substring(0, 3)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dossier Data Card */}
                            <div className="w-full max-w-sm relative">
                                {/* Connection Line */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-emerald-500/50 to-white/10" />

                                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 blur-3xl rounded-full" />

                                    <div className="flex flex-col gap-6 relative z-10">

                                        {/* Name & ID */}
                                        <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">Classified Object</span>
                                                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">ID #{viewingIntel.id}</span>
                                            </div>
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{viewingIntel.name}</h2>
                                        </div>

                                        {/* Description Block */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Analysis Log</span>
                                            </div>
                                            <p className="text-base text-gray-300 font-sans leading-7 font-light whitespace-pre-wrap">
                                                {viewingIntel.description || "No analysis data available provided by Central Command."}
                                            </p>
                                        </div>

                                        {/* Code Breaker Section */}
                                        {viewingIntel.unlock_code && (
                                            <div
                                                className="mt-2 bg-gradient-to-br from-emerald-900/10 to-transparent border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer group hover:border-emerald-500/40"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(viewingIntel.unlock_code!);
                                                    setStatus({ type: 'success', msg: 'Code Copied to Clipboard' }); // Re-using existing toast
                                                    setTimeout(() => setStatus(null), 3000);
                                                }}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-ultra-wide">Access Code</span>
                                                    <span className="text-xl font-mono font-bold text-white tracking-[0.15em] group-hover:text-emerald-400 transition-colors">{viewingIntel.unlock_code}</span>
                                                </div>
                                                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                                    <span className="material-symbols-outlined">content_copy</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileAccount;
