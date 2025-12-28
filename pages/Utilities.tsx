
import React, { useState } from 'react';
// import { ROADMAP_ITEMS } from '../constants'; // Replaced by dynamic config
// import { RoadmapStatus } from '../types';
import { useConfig } from '../contexts/ConfigContext';
import { RoadmapItem, RoadmapColumn } from '../types';

const Utilities: React.FC = () => {
  const { config, loading } = useConfig();
  const [suggestionUrls, setSuggestionUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'suggestions' | 'bugs'>('suggestions');

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!config || !config.feedbackRoadmap?.enabled) return <div className="min-h-screen flex items-center justify-center text-white">Feature disabled</div>;

  const { feedback, suggestions, roadmap } = config.feedbackRoadmap.sections;

  const renderRoadmapColumn = (column: RoadmapColumn) => {
    const items = roadmap.items.filter(i => i.column === column.id);

    return (
      <div key={column.id} className="flex flex-col gap-10 h-full">
        {/* Column Header - Hyper Premium */}
        <div className="flex items-center justify-between px-6 py-4 rounded-[24px] bg-black/40 border border-white/5 backdrop-blur-xl relative overflow-hidden group shrink-0">
          {/* Animated Background Glow */}
          <div
            className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-all duration-1000"
            style={{ backgroundColor: column.color }}
          ></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color, boxShadow: `0 0 15px ${column.color}` }}
              ></div>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: column.color }}></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] leading-none mb-1">Status</span>
              <span className="text-sm font-black text-white uppercase tracking-[0.1em]">{column.title}</span>
            </div>
          </div>

          <div className="flex flex-col items-end relative z-10">
            <span className="text-xl font-black text-white tabular-nums leading-none">{items.length < 10 ? `0${items.length}` : items.length}</span>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Assignments</span>
          </div>
        </div>

        {/* Task Cards - Hyper Premium */}
        <div className="flex flex-col gap-6 flex-grow">
          {items.map(item => (
            <div
              key={item.id}
              className="group relative flex flex-col"
            >
              {/* Card Ambient Glow (Hover) */}
              <div
                className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700 rounded-[40px]"
              ></div>

              <div className="relative glass-card p-7 rounded-[35px] border border-white/5 bg-[#0a0a0a]/40 group-hover:bg-white/[0.02] group-hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2 overflow-hidden flex flex-col">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <span className="material-symbols-outlined text-6xl select-none">data_object</span>
                </div>

                <div className="flex flex-col gap-6 flex-grow">
                  {/* Top Meta */}
                  <div className="flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-20"></div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                        {item.type || 'STND-R'}
                      </span>
                    </div>
                    {(item.priority === 'Alta' || item.priority === 'High') ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Priority</span>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-white/5 text-xl group-hover:text-white/20 transition-colors">grid_view</span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-black text-white group-hover:text-white transition-colors uppercase tracking-tight leading-snug">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-gray-500 text-[11px] leading-relaxed font-medium">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Section */}
                  {item.progress !== undefined && (
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/[0.02] mt-auto">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-white/20">query_stats</span>
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Deployment</span>
                        </div>
                        <span className="text-xs font-black text-white font-mono">{item.progress}%</span>
                      </div>
                      <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Footer Meta */}
                  <div className={"flex items-center justify-between pt-4 border-t border-white/5" + (item.progress === undefined ? " mt-auto" : "")}>
                    <div className="flex items-center gap-4">
                      {item.comments && (
                        <div className="flex items-center gap-2 py-1.5 px-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="material-symbols-outlined text-sm text-gray-400">forum</span>
                          <span className="text-[10px] font-bold text-gray-400">{item.comments}</span>
                        </div>
                      )}
                    </div>

                    <button className="flex items-center gap-2 text-white/10 group-hover:text-white transition-all">
                      <span className="text-[9px] font-black uppercase tracking-widest">Details</span>
                      <span className="material-symbols-outlined text-sm">arrow_outward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="flex-grow flex flex-col items-center justify-center gap-5 py-20 border border-dashed border-white/5 rounded-[40px] bg-black/20 h-full">
              <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center border border-white/5 shadow-inner">
                <span className="material-symbols-outlined text-white/10 text-3xl">hourglass_empty</span>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No Active Tasks</p>
                <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-1">Standby for updates</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 flex flex-col items-center gap-16">
      <section className="w-full flex flex-col items-center text-center gap-6 py-6 relative">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg leading-tight uppercase italic">
          Community <br /><span className="text-white/40">Utilities</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 font-light leading-relaxed">
          Submit whitelist requests, report critical bugs, and track our ongoing development roadmap.
        </p>
      </section>

      {/* Unified Feedback & Suggestions System */}
      <div className="w-full max-w-7xl">
        <div className="glass-card rounded-[40px] overflow-hidden border border-white/10 relative group shadow-2xl">
          {/* Subtle background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none group-hover:bg-white/[0.05] transition-all duration-1000"></div>

          {/* Tab Switcher - More refined and fixed for overlap */}
          <div className="flex gap-2 border-b border-white/5 bg-black/40 p-2">
            <button
              onClick={() => setActiveFormTab('suggestions')}
              className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-[22px] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 relative ${activeFormTab === 'suggestions' ? 'bg-white text-black shadow-2xl z-10' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined text-xl">lightbulb</span>
              <span className="hidden sm:inline">Suggestions</span>
              <span className="sm:hidden">Suggest</span>
              {activeFormTab === 'suggestions' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white blur-[2px] rounded-full"></div>}
            </button>
            <button
              onClick={() => setActiveFormTab('bugs')}
              className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-[22px] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 relative ${activeFormTab === 'bugs' ? 'bg-white text-black shadow-2xl z-10' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined text-xl">pest_control</span>
              <span className="hidden sm:inline">Bug Reports</span>
              <span className="sm:hidden">Reports</span>
              {activeFormTab === 'bugs' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white blur-[2px] rounded-full"></div>}
            </button>
          </div>

          <div className="p-8 md:p-16 relative z-10 min-h-[800px] flex flex-col">
            {activeFormTab === 'suggestions' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-12 flex-grow">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-4xl md:text-5xl font-black uppercase italic text-white tracking-tighter leading-none">{suggestions.title}</h3>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.4em]">{suggestions.subtitle}</p>
                  </div>
                  <div className="h-px flex-grow bg-white/5 mx-8 hidden md:block mb-3"></div>
                  <div className="flex items-center gap-3 text-white/20">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Community Hub</span>
                  </div>
                </div>

                <form action={suggestions.formspreeUrl} method="POST" className="flex flex-col gap-10 flex-grow">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-grow">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">References / Links</label>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <div className="relative flex-grow">
                          <input
                            type="url"
                            value={currentUrl}
                            onChange={(e) => setCurrentUrl(e.target.value)}
                            placeholder="Paste mod URL..."
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-sm focus:border-white/20 focus:bg-white/[0.06] transition-all outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addUrl(e as any);
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addUrl as any}
                          className="bg-white/10 hover:bg-white text-white hover:text-black py-4 px-6 rounded-2xl font-bold transition-all duration-500 active:scale-95 flex items-center justify-center border border-white/5 shadow-lg shadow-black/20"
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 p-6 bg-black/40 rounded-3xl border border-white/5 mt-2 overflow-y-auto flex-grow max-h-[300px]">
                        {suggestionUrls.length === 0 && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-3 text-white/5 py-4">
                            <span className="material-symbols-outlined text-4xl">folder_off</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">No references added</span>
                          </div>
                        )}
                        {suggestionUrls.map(url => (
                          <div key={url} className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl group hover:border-white/20 transition-all h-fit">
                            <span className="text-[10px] font-mono text-gray-500 max-w-[200px] truncate">{url}</span>
                            <input type="hidden" name="links[]" value={url} />
                            <button type="button" onClick={() => removeUrl(url)} className="text-gray-500 hover:text-white transition-colors">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">The Proposal</label>
                      <textarea
                        name="message"
                        placeholder="Detail the benefits, features, and why the community would love this..."
                        className="w-full h-full bg-white/[0.03] border border-white/5 rounded-[32px] p-8 text-sm focus:border-white/20 focus:bg-white/[0.06] transition-all outline-none resize-none leading-relaxed"
                        required
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className="shrink-0 w-full py-6 bg-white text-black font-black uppercase text-[11px] tracking-[0.5em] rounded-2xl hover:bg-gray-200 transition-all shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] group/btn mt-4">
                    <span className="flex items-center justify-center gap-3">
                      Submit Proposal
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-12 flex-grow">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-4xl md:text-5xl font-black uppercase italic text-white tracking-tighter leading-none">{feedback.title}</h3>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.4em]">{feedback.subtitle}</p>
                  </div>
                  <div className="h-px flex-grow bg-white/5 mx-8 hidden md:block mb-3"></div>
                  <div className="flex items-center gap-3 text-white/20">
                    <span className="material-symbols-outlined text-xl">bug_report</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Quality Control</span>
                  </div>
                </div>

                <form action={feedback.formspreeUrl} method="POST" className="flex flex-col gap-10 flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 shrink-0">
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Environment / Version</label>
                      <div className="relative">
                        <select
                          name="version"
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-sm focus:border-white/20 focus:bg-white/[0.06] transition-all outline-none appearance-none text-gray-400 focus:text-white"
                          required
                        >
                          <option className="bg-[#1a1a1a]" value="" disabled selected>Identify current version...</option>
                          <option className="bg-[#1a1a1a]" value={config.modpackVersion || 'Latest'}>{config.modpackVersion || 'Latest'} (Standard)</option>
                          <option className="bg-[#1a1a1a]" value="Legacy">Legacy / Custom Build</option>
                        </select>
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/10 pointer-events-none">expand_more</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Tracing / Log Link</label>
                      <div className="relative">
                        <input
                          type="url"
                          name="logLink"
                          placeholder="Pastebin or SwissTransfer link..."
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-sm focus:border-white/20 focus:bg-white/[0.06] transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 flex-grow">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Technical Brief</label>
                    <textarea
                      name="description"
                      placeholder="Describe the anomaly, steps to reproduce, and terminal output if available..."
                      className="w-full h-full bg-white/[0.03] border border-white/5 rounded-[32px] p-8 text-sm focus:border-white/20 focus:bg-white/[0.06] transition-all outline-none resize-none leading-relaxed flex-grow"
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="shrink-0 w-full py-6 bg-white text-black font-black uppercase text-[11px] tracking-[0.5em] rounded-2xl hover:bg-gray-200 transition-all shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] group/btn mt-4">
                    <span className="flex items-center justify-center gap-3">
                      Dispatch Bug Report
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">bolt</span>
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      {roadmap.enabled && (
        <section className="w-full max-w-7xl flex flex-col items-center gap-12">
          <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic text-center">{roadmap.title}</h2>
          <div className={`w-full grid grid-cols-1 md:grid-cols-${roadmap.columns.length} gap-8 items-start`}>
            {roadmap.columns.map(col => renderRoadmapColumn(col))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Utilities;
