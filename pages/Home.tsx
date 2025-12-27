
import React, { useState, useEffect } from 'react';
import Countdown from '../components/Countdown';
// import { APP_CONFIG } from '../constants'; // Replaced by useConfig
import { useConfig } from '../contexts/ConfigContext';

const Home: React.FC = () => {
  const { config, loading } = useConfig();


  const isCountdownExpired = () => {
    if (!config?.countdown?.date) return true;
    return new Date(config.countdown.date).getTime() < new Date().getTime();
  };

  const copyIp = () => {
    if (config?.serverIp) {
      navigator.clipboard.writeText(config.serverIp);
      // Toast or feedback could go here
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!config) return <div className="min-h-screen flex items-center justify-center text-white">Error loading configuration</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-8">

      {/* Update Notice Box */}
      {config.updateNotice.enabled && !isCountdownExpired() && (
        <section className="glass-card rounded-2xl p-8 relative overflow-hidden group border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm -z-10"></div>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="flex items-center gap-3">
                {config.updateNotice.showBadge && (
                  <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                    {config.updateNotice.badgeText}
                  </span>
                )}
                <h3 className="text-2xl font-bold text-white">{config.updateNotice.title}</h3>
              </div>
              {config.updateNotice.subtitle && <p className="text-white/70">{config.updateNotice.subtitle}</p>}

              <div className="grid gap-2">
                {config.updateNotice.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="material-symbols-outlined text-green-400 text-lg">check</span>
                    <span dangerouslySetInnerHTML={{ __html: feature }}></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Icon */}
            <div className="hidden md:block absolute right-[-50px] top-[-50px] opacity-10 rotate-12 pointer-events-none">
              <span className="material-symbols-outlined text-[300px] text-white">rocket_launch</span>
            </div>
          </div>
        </section>
      )}



      {/* Hero Section */}
      <section className="glass-card rounded-2xl p-8 md:p-16 text-center relative overflow-hidden group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center gap-8">


          <h1 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter text-white drop-shadow-2xl uppercase italic">
            {config.siteInfo.title}
          </h1>

          <p className="text-xl text-white/60 max-w-2xl leading-relaxed font-light">
            {config.siteInfo.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 w-full justify-center">
            <button
              onClick={copyIp}
              className="w-full sm:w-auto flex items-center justify-center gap-3 h-14 px-10 bg-white hover:bg-gray-200 text-black rounded-xl font-bold tracking-wide transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] group/btn active:scale-95"
            >
              <span className="material-symbols-outlined">content_copy</span>
              <span>{config?.serverMetadata?.ip || 'server-manfredonia.ddns.net'}</span>
              <span className="bg-black/10 px-2 py-0.5 rounded text-[10px] ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity">COPY IP</span>
            </button>
          </div>
        </div>
      </section>



      {/* Countdown Timer */}
      <Countdown />


    </div>
  );
};

export default Home;
