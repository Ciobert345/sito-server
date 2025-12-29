
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';

const Navbar: React.FC = () => {
  const { config } = useConfig();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Persistence and Push Logic
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
        new window.Notification(banner.title, {
          body: banner.message.replace(/<[^>]*>?/gm, ''),
          icon: '/favicon.ico'
        });
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


  // Add scroll effect transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Modpack', path: '/modpack' },
    { name: 'Utilities', path: '/utilities' },
    { name: 'Updates', path: '/updates' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Info', path: '/info' },
  ];

  const copyIp = () => {
    if (config?.serverMetadata?.ip) {
      navigator.clipboard.writeText(config.serverMetadata.ip);
    }
  };

  const serverIp = config?.serverMetadata?.ip || 'server-manfredonia.ddns.net';

  return (
    <>
      <div
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${scrolled
          ? 'glass-card border-white/5 shadow-lg bg-black/40 backdrop-blur-xl'
          : 'border-transparent bg-transparent backdrop-blur-sm'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Area */}
            {/* Logo Area */}
            <Link to="/" className="flex items-center gap-3 group relative">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="relative size-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-white to-gray-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <span className="material-symbols-outlined text-2xl font-variation-fill">diamond</span>
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-lg md:text-xl tracking-tight leading-none text-white uppercase group-hover:text-shadow-glow transition-all whitespace-nowrap">Server Manfredonia</h1>
                <span className="text-[10px] text-gray-400 font-medium tracking-[0.2em] uppercase group-hover:text-white transition-colors hidden xl:block">Community Hub</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isActive(link.path)
                    ? 'text-black bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-white transition-all relative group"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                    {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute top-14 right-0 w-80 sm:w-96 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-white uppercase tracking-wider text-[10px]">Security Protocol 1.0</h3>
                        <span className="text-[9px] text-gray-500 font-mono">
                          {unreadCount} Unread Events
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePush}
                          className={`size-8 rounded-lg flex items-center justify-center border transition-all ${pushEnabled ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                          title={pushEnabled ? "Disable Browser Push" : "Enable Browser Push"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {pushEnabled ? 'notifications_paused' : 'add_alert'}
                          </span>
                        </button>
                        <button
                          onClick={markAllAsRead}
                          className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/30 transition-all"
                          title="Mark all as read"
                        >
                          <span className="material-symbols-outlined text-[18px]">done_all</span>
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {config?.infoBanners?.filter(b => b.enabled).length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-4xl opacity-20">notifications_off</span>
                          <span className="text-xs font-medium">No new notifications</span>
                        </div>
                      ) : (
                        config?.infoBanners?.filter(b => b.enabled).map(banner => (
                          <div
                            key={banner.id}
                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative group ${!readIds.includes(banner.id) ? 'bg-blue-500/[0.02]' : ''}`}
                            onClick={() => setReadIds(prev => Array.from(new Set([...prev, banner.id])))}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <div className={`size-8 rounded-lg flex items-center justify-center ${banner.style?.includes('red') ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                  <span className="material-symbols-outlined text-sm">
                                    {banner.icon === 'notification' ? 'priority_high' : (banner.icon || 'info')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-white leading-tight">{banner.title}</h4>
                                  {!readIds.includes(banner.id) && (
                                    <span className="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                  )}
                                </div>
                                {banner.subtitle && <p className="text-xs text-gray-400">{banner.subtitle}</p>}
                                <div className="text-xs text-gray-500 mt-1 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: banner.message }} />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Backdrop for closing dropdown */}
              {notificationsOpen && (
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setNotificationsOpen(false)}
                ></div>
              )}

              <button
                onClick={copyIp}
                className="hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-white transition-colors">content_copy</span>
                <span className="text-xs font-bold text-gray-300 group-hover:text-white tracking-widest uppercase">{serverIp}</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-center h-10 w-10 lg:hidden rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-black/90 backdrop-blur-3xl transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
          {navLinks.map((link, idx) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-2xl font-black uppercase tracking-tight transition-all transform hover:scale-110 ${isActive(link.path) ? 'text-white scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/20'
                }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}

          <div className="mt-8 p-6 w-full max-w-xs rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Server IP</span>
            <div
              onClick={copyIp}
              className="flex items-center gap-2 text-white font-mono text-lg cursor-pointer active:scale-95 transition-transform"
            >
              {serverIp}
              <span className="material-symbols-outlined text-sm opacity-50">content_copy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
