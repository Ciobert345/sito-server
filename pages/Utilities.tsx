
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import { RoadmapColumn } from '../types';

const Utilities: React.FC = () => {
  const { config, roadmapItems, loading } = useConfig();
  const { user, setAuthModalOpen } = useAuth();
  const navigate = useNavigate();
  const [suggestionUrls, setSuggestionUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');

  const addUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUrl && !suggestionUrls.includes(currentUrl)) {
      setSuggestionUrls([...suggestionUrls, currentUrl]);
      setCurrentUrl('');
    }
  };

  const removeUrl = (url: string) => {
    setSuggestionUrls(suggestionUrls.filter(u => u !== url));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-[0.5em] animate-pulse">Syncing Core...</div>;
  if (!config || !config.feedbackRoadmap?.enabled) return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase">Feature disabled</div>;

  const { feedback, suggestions, roadmap } = config.feedbackRoadmap.sections;

  const renderRoadmapColumn = (column: RoadmapColumn) => {
    const items = roadmapItems.filter(i => i.column === column.id);

    return (
      <div key={column.id} className="flex flex-col gap-4 min-w-0">
        {/* Column Header */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color, boxShadow: `0 0 10px ${column.color}` }}></div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] truncate">{column.title}</span>
          </div>
          <span className="text-[10px] font-mono text-white/20">{items.length < 10 ? `0${items.length}` : items.length}</span>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {items.map(item => (
            <div key={item.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3 group">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-white leading-tight group-hover:text-white transition-colors">{item.title}</h4>
                {(item.priority === 'Alta' || item.priority === 'High') && (
                  <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 shrink-0 ml-2">High</span>
                )}
              </div>
              {item.description && <p className="text-[10px] text-white/30 line-clamp-2 leading-relaxed">{item.description}</p>}
              {item.progress !== undefined && (
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-white/60 rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-white/30">{item.progress}%</span>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="h-20 rounded-xl border border-dashed border-white/5 flex items-center justify-center">
              <span className="text-[9px] text-white/10 uppercase tracking-widest">Empty</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-16 relative">

      {/* Hero Section - Information.tsx Style */}
      <section className="w-full flex flex-col items-center text-center gap-6 py-6 relative">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg leading-tight uppercase italic">
          Community <br /><span className="text-white/40">Utilities</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 font-light leading-relaxed">
          Track our development roadmap, submit suggestions, and report bugs to help improve the community.
        </p>
      </section>

      {/* Split Section: Roadmap & Community Stats */}
      {roadmap.enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">

          {/* Roadmap (2/3 width) */}
          <section className="lg:col-span-2 relative group h-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 overflow-hidden h-full flex flex-col shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">

              <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[22px]">
                <div className="flex items-center gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">{roadmap.title}</span>
                </div>
                <span className="text-[10px] font-mono text-white/20">{roadmapItems.length} Objectives</span>
              </div>

              <div className="p-6 md:p-8 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {roadmap.columns.map(col => renderRoadmapColumn(col))}
                </div>
              </div>

              <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 rounded-b-[22px]">
                <span className="text-[8px] font-mono font-black text-white/10 uppercase tracking-[0.4em]">DEV_ROADMAP_FEED: ACTIVE_SYNC</span>
              </div>
            </div>
          </section>

          {/* Sidebar (1/3 width) - "Something Missing" Filler */}
          <section className="lg:col-span-1 flex flex-col gap-8">
            {/* Quick Stats Card */}
            <div className="glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-6 flex flex-col gap-6 relative overflow-hidden group">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10"><span className="material-symbols-outlined text-sm text-white/40">bar_chart</span></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Completion Rate</span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                    {(() => {
                      if (roadmapItems.length === 0) return 0;
                      const totalProgress = roadmapItems.reduce((acc, item) => {
                        // If item is 'done', it counts as 100% regardless of progress value
                        if (item.column === 'done') return acc + 100;
                        // Otherwise use the progress value if available, defaulting to 0
                        return acc + (item.progress || 0);
                      }, 0);
                      return Math.round(totalProgress / roadmapItems.length);
                    })()}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mt-1">Global Progress</span>
                </div>
                <div className="size-16 relative">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="text-emerald-500 transition-all duration-1000 ease-out"
                      strokeDasharray={`${(() => {
                        if (roadmapItems.length === 0) return 0;
                        const totalProgress = roadmapItems.reduce((acc, item) => {
                          if (item.column === 'done') return acc + 100;
                          return acc + (item.progress || 0);
                        }, 0);
                        return Math.round(totalProgress / roadmapItems.length);
                      })()}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Links Card */}
            <div className="glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-6 flex flex-col gap-4 relative overflow-hidden flex-1">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10"><span className="material-symbols-outlined text-sm text-white/40">link</span></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">External Uplinks</span>
              </div>

              <div className="flex flex-col gap-2">
                <a href="https://manfredonia-pack-wiki.netlify.app/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/link">
                  <span className="text-xs font-bold text-gray-400 group-hover/link:text-white transition-colors">Wiki & Docs</span>
                  <span className="material-symbols-outlined text-xs text-white/20 group-hover/link:text-white transition-colors">description</span>
                </a>

                {/* Auth Gated Discord Link */}
                <button
                  onClick={() => {
                    if (!user) setAuthModalOpen(true);
                    else if (user.isApproved || user.isAdmin) window.open(config.socials?.discord || 'https://discord.gg/8b8s3wFats', '_blank');
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all group/link w-full text-left ${user && (user.isApproved || user.isAdmin) ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-white/[0.01] border-white/5 opacity-60'}`}
                >
                  <span className="text-xs font-bold text-gray-400 group-hover/link:text-white transition-colors">Discord Server</span>
                  {(user && (user.isApproved || user.isAdmin)) ? (
                    <span className="material-symbols-outlined text-xs text-white/20 group-hover/link:text-white transition-colors">arrow_outward</span>
                  ) : (
                    <span className="material-symbols-outlined text-xs text-white/20 group-hover/link:text-white transition-colors">lock</span>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate('/dashboard-tutorial')}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/link text-left"
                  >
                    <span className="text-xs font-bold text-gray-400 group-hover/link:text-white transition-colors">Control Manual</span>
                    <span className="material-symbols-outlined text-xs text-white/20 group-hover/link:text-white transition-colors">menu_book</span>
                  </button>

                  <button
                    onClick={() => navigate('/info')}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/link text-left"
                  >
                    <span className="text-xs font-bold text-gray-400 group-hover/link:text-white transition-colors">Personnel</span>
                    <span className="material-symbols-outlined text-xs text-white/20 group-hover/link:text-white transition-colors">badge</span>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Direct Connection</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(config.serverMetadata.ip)}
                    className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all group/ip w-full"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-[10px] text-purple-300 font-mono">{config.serverMetadata.ip}</span>
                      <span className="text-[8px] text-purple-400/60 uppercase tracking-wider group-hover/ip:text-purple-300 transition-colors">Click to Copy</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-purple-400 group-hover/ip:text-white transition-colors">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Forms Grid - Information.tsx Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Suggestions Form */}
        <section className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-transparent rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 overflow-hidden h-full flex flex-col shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">

            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[22px]">
              <div className="flex items-center gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">{suggestions.title}</span>
              </div>
              <span className="material-symbols-outlined text-white/20 text-sm">lightbulb</span>
            </div>

            <form action={suggestions.formspreeUrl} method="POST" className="p-6 md:p-8 flex flex-col gap-6 flex-1">
              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">References / Links</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    placeholder="Paste mod URL..."
                    className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-purple-500/30 outline-none transition-all"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(e as any); } }}
                  />
                  <button type="button" onClick={addUrl as any} className="px-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-all">
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
                {suggestionUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {suggestionUrls.map(url => (
                      <div key={url} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-[9px] font-mono text-white/40">
                        <span className="max-w-[120px] truncate">{url}</span>
                        <input type="hidden" name="links[]" value={url} />
                        <button type="button" onClick={() => removeUrl(url)} className="text-white/20 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Your Proposal</label>
                <textarea
                  name="message"
                  placeholder="Describe your suggestion in detail..."
                  className="w-full flex-1 min-h-[120px] bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm focus:border-purple-500/30 outline-none resize-none transition-all"
                  required
                ></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-xl hover:bg-gray-100 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.15)]">
                Submit Suggestion
              </button>
            </form>
          </div>
        </section>

        {/* Bug Report Form */}
        <section className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-l from-red-500/10 to-transparent rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 overflow-hidden h-full flex flex-col shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">

            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[22px]">
              <div className="flex items-center gap-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/50"></span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">{feedback.title}</span>
              </div>
              <span className="material-symbols-outlined text-white/20 text-sm">bug_report</span>
            </div>

            <form action={feedback.formspreeUrl} method="POST" className="p-6 md:p-8 flex flex-col gap-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Version</label>
                  <select name="version" defaultValue="" className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-red-500/30 outline-none transition-all appearance-none text-white/50" required>
                    <option className="bg-[#1a1a1a]" value="" disabled>Select...</option>
                    <option className="bg-[#1a1a1a]" value={config.modpackVersion || 'Latest'}>{config.modpackVersion || 'Latest'}</option>
                    <option className="bg-[#1a1a1a]" value="Legacy">Legacy</option>
                  </select>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Log Link</label>
                  <input
                    type="url"
                    name="logLink"
                    placeholder="Pastebin URL..."
                    className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-red-500/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Bug Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the bug, steps to reproduce..."
                  className="w-full flex-1 min-h-[120px] bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm focus:border-red-500/30 outline-none resize-none transition-all"
                  required
                ></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-xl hover:bg-gray-100 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.15)]">
                Submit Bug Report
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Utilities;
