import React, { useState, useEffect } from 'react';
import Countdown from '../components/Countdown';
// import { APP_CONFIG } from '../constants'; // Replaced by useConfig
import { useConfig } from '../contexts/ConfigContext';

const Home: React.FC = () => {
  const { config, loading } = useConfig();
  const [serverStatus, setServerStatus] = useState<{ online: boolean; players?: { online: number } }>({ online: false });
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [hideCountdown, setHideCountdown] = useState(false);

  useEffect(() => {
    if (config?.countdown?.date) {
      setHideCountdown(new Date(config.countdown.date).getTime() < new Date().getTime());
    }
  }, [config]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('https://api.mcsrvstat.us/2/server-manfredonia.ddns.net');
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
        const response = await fetch('https://api.github.com/repos/Ciobert345/Mod-server-Manfredonia/releases/latest');
        const data = await response.json();
        if (data.tag_name) {
          setLatestVersion(data.tag_name);
        }
      } catch (error) {
        console.error('Error fetching latest version:', error);
      }
    };

    fetchStatus();
    fetchVersion();
    const interval = setInterval(fetchStatus, 60000); // Update status every minute
    return () => clearInterval(interval);
  }, []);

  const isCountdownExpired = () => {
    if (!config?.countdown?.date) return true;
    return new Date(config.countdown.date).getTime() < new Date().getTime();
  };

  const copyIp = () => {
    const ip = config?.serverMetadata?.ip || 'server-manfredonia.ddns.net';
    navigator.clipboard.writeText(ip);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-[0.5em] animate-pulse">Initializing Hub...</div>;
  if (!config) return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase">Configuration Error</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-12 flex flex-col gap-12 relative">


      {/* Upcoming Update Box - FULL WIDTH RE-IMPLEMENTATION */}
      {config.updateNotice.enabled && !isCountdownExpired() && (
        <section className="w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
          <div className="relative glass-card rounded-3xl p-8 md:p-12 border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center justify-between relative z-10">
              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    Upcoming Update
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic drop-shadow-glow-sm">
                    {config.updateNotice.title}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.updateNotice.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all group/item">
                      <span className="material-symbols-outlined text-green-400 text-xl font-variation-fill group-hover/item:scale-110 transition-transform">verified</span>
                      <span className="text-xs text-white/60 font-bold uppercase tracking-tight" dangerouslySetInnerHTML={{ __html: feature }}></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined absolute right-[-50px] top-1/2 -translate-y-1/2 text-[250px] text-white/[0.03] rotate-12 pointer-events-none group-hover:text-white/[0.07] group-hover:scale-110 transition-all duration-1000">rocket_launch</span>
          </div>
        </section>
      )}

      {/* Hero Section - Technical Redesign */}
      <section className="relative pt-2 md:pt-4 flex flex-col items-center text-center gap-10">
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center justify-center gap-3 opacity-60">
            <span className="w-8 h-[1px] bg-white/20"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white">System established</span>
            <span className="w-8 h-[1px] bg-white/20"></span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black leading-none tracking-tighter text-white uppercase italic drop-shadow-[0_10px_50px_rgba(255,255,255,0.15)]">
            {config.siteInfo.title}
          </h1>
          <p className="text-lg md:text-xl text-white/40 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight px-4">
            {config.siteInfo.description}
          </p>
        </div>

        {/* MISSION COUNTDOWN - Ultra-Compact Implementation */}
        {!hideCountdown && (
          <div className="w-full max-w-7xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
            <div className="relative glass-card rounded-3xl p-6 md:p-8 border border-white/5 bg-white/[0.01] overflow-hidden flex flex-col items-center gap-4 shadow-2xl">
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-full px-4 py-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">{config.countdown.title}</span>
                </div>
              </div>

              <div className="w-full flex justify-center transform-gpu">
                <Countdown onExpire={() => setHideCountdown(true)} />
              </div>

              <div className="flex items-center gap-8 opacity-20">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-white"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Critical Mission Boundary</span>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-white"></div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SERVER IDENTITY DASHBOARD */}
      <section className="w-full max-w-7xl mx-auto relative group mb-20">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>

        <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 md:p-1.5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
          {/* Header Bar - Fixed Corners Clipping */}
          <div className="px-10 py-5 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[22px]">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500/30"></div>
                <div className="size-2.5 rounded-full bg-yellow-500/30"></div>
                <div className="size-2.5 rounded-full bg-green-500/30"></div>
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">Terminal SVR_LOG_01</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-white/30">sensors</span>
              <span className="text-[10px] font-black text-green-500/50 uppercase tracking-widest">Active Sequence</span>
            </div>
          </div>

          <div className="p-8 md:p-14 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            {/* Server Intel */}
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Global Identification</span>
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-glow-sm">
                    {config.siteInfo.title}
                  </h2>
                  <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/50 tracking-widest uppercase shadow-inner">Alpha-1</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Release</span>
                  <div className="flex flex-col">
                    <span className="text-white font-mono font-black text-2xl tracking-tighter leading-none">{latestVersion || config.serverMetadata?.modpackVersion || 'v2.5'}</span>
                    <span className="text-[8px] font-black text-white/30 uppercase mt-1 tracking-widest">Sourced from github</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Frequency</span>
                  <div className="flex items-center gap-3 group/status">
                    <div className={`size-3 rounded-full ${serverStatus.online ? 'bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`}></div>
                    <div className="flex flex-col">
                      <span className="text-white font-black text-lg uppercase tracking-widest leading-none">{serverStatus.online ? 'Online' : 'Offline'}</span>
                      {serverStatus.online && serverStatus.players && (
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{serverStatus.players.online} Nodes Connected</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Protocol</span>
                  <span className="text-white/40 font-mono text-sm uppercase tracking-tight">LEGACY-HUB.SVR</span>
                </div>
              </div>
            </div>

            {/* Action Identity - Simplified & High Contrast */}
            <div className="flex flex-col items-center lg:items-end w-full lg:w-auto">
              <button
                onClick={copyIp}
                className="group/copy-btn relative overflow-hidden bg-white text-black rounded-3xl px-10 py-6 flex items-center gap-6 hover:bg-white/90 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
              >
                <div className="flex flex-col items-start leading-none gap-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Click to Synchronize</span>
                  <span className="text-xl md:text-2xl font-black font-mono tracking-tighter">
                    {config?.serverMetadata?.ip || 'JOINHUB.NET'}
                  </span>
                </div>
                <div className="w-px h-8 bg-black/10"></div>
                <span className="material-symbols-outlined text-2xl group-hover/copy-btn:rotate-12 transition-transform">content_copy</span>

                {/* Subtle internal shimmer */}
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-black/[0.05] to-transparent rotate-45 group-hover/copy-btn:animate-shimmer pointer-events-none"></div>
              </button>
            </div>
          </div>

          {/* Footer Bar - Fixed Corners Clipping */}
          <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 rounded-b-[22px]">
            <div className="flex items-center gap-4 font-mono text-[10px] text-white/10 uppercase tracking-widest overflow-hidden whitespace-nowrap mask-fade-right">
              root@manfredonia:~$ sudo sync-status --endpoint="{config?.serverMetadata?.ip}" --verbose
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 shadow-inner hover:bg-white/10 transition-colors">{i}</div>
                ))}
              </div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Validated instances</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

