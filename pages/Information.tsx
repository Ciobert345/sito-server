
import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';

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

        const response = await fetch(
          `https://api.github.com/repos/${config.github.repository}/releases?per_page=3`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          setReleases(data);
        }
      } catch (error) {
        console.error('Failed to fetch releases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [config]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-12 flex flex-col gap-16">
      <header className="flex flex-col gap-6 items-center text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white italic">The Server <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white">Architecture</span></h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="glass-card rounded-3xl p-10 flex flex-col gap-8">
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-4">
            <span className="material-symbols-outlined">dns</span> Server Specs
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {[
              { label: 'Processor', val: 'Intel Core i5-8400 @3.2GHz' },
              { label: 'Memory', val: '16 GB DDR4 RAM' },
              { label: 'Storage', val: '256 GB NVMe Gen3' },
              { label: 'Network', val: '10Gbps Uplink' }
            ].map(spec => (
              <div key={spec.label} className="flex flex-col gap-1 border-b border-white/5 pb-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{spec.label}</span>
                <span className="text-lg font-bold text-white tracking-tight">{spec.val}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-3xl p-10 flex flex-col gap-8">
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-4">
            <span className="material-symbols-outlined">shield_person</span> The Core Team
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { name: 'Robert', role: 'Lead Developer', desc: 'Backend specialist & Modpack Architect' },
              { name: 'Robert', role: 'Community Manager', desc: 'Events, Support & Social Relations' },
              { name: 'Giorgio', role: 'Modpack Tester & more', desc: 'Testing & Debugging' }
            ].map(member => (
              <div key={member.name} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default group">
                <div className="size-14 rounded-xl bg-white/10 flex items-center justify-center font-black text-2xl text-white group-hover:bg-white group-hover:text-black transition-all">
                  {member.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-tight">{member.name}</h4>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{member.role}</p>
                  <p className="text-xs text-gray-600">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="w-full glass-card rounded-3xl p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none"></div>
        <h3 className="text-3xl font-black uppercase italic tracking-tight relative z-10">Our idea</h3>
        <p className="text-gray-400 max-w-3xl leading-relaxed relative z-10 italic">
          "Server Manfredonia was founded on the principle of technical excellence. We believe that mods should not just add content, but create a cohesive, balanced world where creativity meets industry."
        </p>
        <div className="flex gap-4 relative z-10">
          <span className="material-symbols-outlined text-4xl text-white/20">verified</span>
          <span className="material-symbols-outlined text-4xl text-white/20">cloud_done</span>
          <span className="material-symbols-outlined text-4xl text-white/20">security</span>
        </div>
      </section>
    </div>
  );
};

export default Information;
