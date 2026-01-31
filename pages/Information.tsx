import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { getReleases } from '../utils/githubCache';

interface Release {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
}

const Information: React.FC = () => {
  const { config } = useConfig();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config?.github?.repository) return;

    const fetchReleases = async () => {
      setLoading(true);
      try {
        const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
        if (config.github.token) {
          headers['Authorization'] = `token ${config.github.token}`;
        }

        const responseData = await getReleases(config.github.repository, 3);
        setReleases(responseData);
      } catch (error) {
        console.error('Failed to fetch releases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [config]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-16 relative">

      {/* Hero Section - Strict Alignment with Modpack.tsx */}
      <section className="w-full flex flex-col items-center text-center gap-6 py-6 relative">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg leading-tight uppercase italic">
          Server <br /><span className="text-white/40">Info</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 font-light leading-relaxed">
          A detailed overview of the technical infrastructure and the core team orchestrating the Manfredonia Hub.
        </p>
      </section>

      {/* Main Intel Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Server Specs Module - Home.tsx Card Style */}
        <section className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-transparent rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 overflow-hidden h-full flex flex-col shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">

            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[22px]">
              <div className="flex items-center gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 box-shadow-glow"></span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Internal Hardware</span>
              </div>
              <span className="material-symbols-outlined text-white/20 text-sm">memory</span>
            </div>

            <div className="p-8 md:p-12 flex flex-col gap-8 flex-1">
              {[
                { label: 'Processor Unit', val: 'Intel Core i5-8400 @3.2GHz', icon: 'developer_board' },
                { label: 'Memory Matrix', val: '16 GB DDR4 RAM', icon: 'rebase_edit' },
                { label: 'Data Storage', val: '256 GB NVMe Gen3', icon: 'database' },
                { label: 'Uplink Capacity', val: '10Gbps Signal Relay', icon: 'router' }
              ].map((spec, idx) => (
                <div key={idx} className="flex items-center gap-6 group/spec">
                  <div className="size-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover/spec:border-white/20 transition-all text-white/20 group-hover/spec:text-white/60">
                    <span className="material-symbols-outlined text-xl">{spec.icon}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{spec.label}</span>
                    <span className="text-lg font-bold text-white tracking-tight italic group-hover/spec:text-blue-400 transition-colors uppercase">{spec.val}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 mt-auto rounded-b-[22px] flex justify-between items-center">
              <span className="text-[8px] font-mono font-black text-white/10 uppercase tracking-[0.4em]">SVR_METRIC_FEED: CONTINUOUS_STABLE</span>
            </div>
          </div>
        </section>

        {/* Core Team Module - Home.tsx Card Style */}
        <section className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-l from-purple-500/10 to-transparent rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 overflow-hidden h-full flex flex-col shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">

            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[22px]">
              <div className="flex items-center gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 box-shadow-glow"></span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Personnel Records</span>
              </div>
              <span className="material-symbols-outlined text-white/20 text-sm">badge</span>
            </div>

            <div className="p-8 md:p-12 flex flex-col gap-8 flex-1">
              {[
                { name: 'Robert', role: 'Lead Developer', desc: 'Backend specialist & Modpack Architect' },
                { name: 'Giorgio', role: 'Tester & Integration', desc: 'Technical testing & performance debugging' },
                { name: 'Robert', role: 'Community Lead', desc: 'Events, Support & Social Infrastructure' }
              ].map((member, idx) => (
                <div key={idx} className="flex items-center gap-6 group/member cursor-default">
                  <div className="size-14 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center shrink-0 group-hover/member:border-purple-500/30 transition-all font-black text-xl text-purple-500/20 group-hover/member:text-purple-400">
                    {member.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-black text-white uppercase tracking-widest">{member.name}</h4>
                      <span className="text-[8px] font-black text-purple-500/40 uppercase tracking-widest bg-purple-500/5 px-2 py-0.5 rounded-full border border-purple-500/10">{member.role}</span>
                    </div>
                    <p className="text-xs text-white/20 mt-1 leading-relaxed font-medium">{member.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 mt-auto rounded-b-[22px] flex justify-between items-center">
              <span className="text-[8px] font-mono font-black text-white/10 uppercase tracking-[0.4em]">HUB_PERSONNEL: ACTIVE_SYNC</span>
            </div>
          </div>
        </section>
      </div>

      {/* Vision Highline Card - Home.tsx Card Style */}
      <section className="w-full relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
        <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 md:p-1.5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
          <div className="px-10 py-12 md:py-20 flex flex-col items-center text-center gap-10 relative">
            {/* Decorative Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

            <div className="flex flex-col gap-2 items-center relative z-10">
              <span className="material-symbols-outlined text-4xl text-white/5 mb-4">diamond</span>
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                Our <span className="text-white/20">Operational Vision</span>
              </h3>
            </div>

            <p className="text-lg md:text-2xl text-white/40 max-w-4xl mx-auto leading-relaxed font-medium tracking-tight px-4 italic relative z-10">
              "Server Manfredonia was founded on the principle of technical excellence. We believe that mods should not just add content, but create a cohesive, balanced world where creativity meets industry."
            </p>

            <div className="flex gap-6 relative z-10 opacity-20 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-white border border-white/10 p-3 rounded-2xl">verified</span>
              <span className="material-symbols-outlined text-4xl text-white border border-white/10 p-3 rounded-2xl">cloud_done</span>
              <span className="material-symbols-outlined text-4xl text-white border border-white/10 p-3 rounded-2xl">security</span>
            </div>
          </div>

          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between rounded-b-[22px]">
            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">System Philosophy established</span>
            <span className="text-[8px] font-mono text-white/5 uppercase tracking-widest">v2.5_ARCHITECTURE</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Information;
