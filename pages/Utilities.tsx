
import React, { useState } from 'react';
// import { ROADMAP_ITEMS } from '../constants'; // Replaced by dynamic config
// import { RoadmapStatus } from '../types';
import { useConfig } from '../contexts/ConfigContext';
import { RoadmapItem, RoadmapColumn } from '../types';

const Utilities: React.FC = () => {
  const { config, loading } = useConfig();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!config || !config.feedbackRoadmap?.enabled) return <div className="min-h-screen flex items-center justify-center text-white">Feature disabled</div>;

  const { feedback, suggestions, roadmap } = config.feedbackRoadmap.sections;

  const renderRoadmapColumn = (column: RoadmapColumn) => {
    const items = roadmap.items.filter(i => i.column === column.id);

    // Map existing columns to colors if not fully specified in config (config has hex codes)
    // The previous CSS classes were convenient. We might use inline styles for the hex codes from config.

    return (
      <div key={column.id} className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: column.color }}
            ></div>
            <span className="text-sm font-black text-white/50 uppercase tracking-[0.2em]">{column.title}</span>
          </div>
          <span className="text-xs font-bold text-white bg-white/10 px-3 py-0.5 rounded-full border border-white/10">{items.length}</span>
        </div>

        <div className="flex flex-col gap-4 min-h-[300px]">
          {items.map(item => (
            <div key={item.id} className="glass-card p-5 rounded-2xl group hover:border-white/30 transition-all hover:-translate-y-1">
              <div className="flex justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/10 text-white border border-white/20 uppercase tracking-widest">{item.type || 'General'}</span>
                <span className="material-symbols-outlined text-white/20 text-sm group-hover:text-white transition-colors">more_horiz</span>
              </div>
              <h4 className="text-white font-bold text-base mb-2 group-hover:text-white transition-colors uppercase tracking-tight">{item.title}</h4>
              {item.description && <p className="text-gray-500 text-xs mb-4 leading-relaxed">{item.description}</p>}

              {/* Logic for showing progress bar if mapped? The old config doesn't have progress %. We can omit or assume. */}
              {item.progress !== undefined && (
                <div className="mb-4">
                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-white h-full shadow-[0_0_10px_rgba(255,255,255,0.6)]" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-white/20 group-hover:text-white/50 transition-colors">
                  {item.comments && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                      <span className="text-[10px] font-bold">{item.comments}</span>
                    </div>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-white/5 ${item.priority === 'Alta' ? 'text-red-400 bg-red-400/5' : 'text-gray-500'}`}>
                    {item.priority || 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          ))}
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

      {/* Forms & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Suggestion System */}
        {suggestions.enabled && (
          <section className="glass-card glass-card-hover rounded-3xl p-16 flex flex-col gap-8 relative overflow-hidden group border-b-4 border-purple-500/20 h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined text-9xl">school</span>
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">{suggestions.title}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest">{suggestions.subtitle}</p>
            </div>

            {/* Note: In a real app we would submit to suggestions.formspreeUrl */}
            <form action={suggestions.formspreeUrl} method="POST" className="flex flex-col gap-8">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="Add mod link (Modrinth/CurseForge)..."
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white transition-all outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addUrl(e as any);
                    }
                  }}
                />
                <button type="button" onClick={addUrl as any} className="bg-white text-black px-4 rounded-xl font-bold hover:scale-105 transition-transform active:scale-95">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[80px] p-4 bg-black/40 rounded-2xl border border-white/5">
                {suggestionUrls.length === 0 && <span className="text-xs text-white/20 font-bold uppercase tracking-widest self-center w-full text-center italic">No links added yet</span>}
                {suggestionUrls.map(url => (
                  <div key={url} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-full group hover:bg-white/20 transition-all">
                    <span className="text-[10px] font-bold text-gray-400 max-w-[200px] truncate">{url}</span>
                    <input type="hidden" name="links[]" value={url} />
                    <button type="button" onClick={() => removeUrl(url)} className="text-gray-500 hover:text-white">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>

              <textarea
                name="message"
                placeholder="Tell us why this would benefit the community..."
                className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-white transition-all outline-none resize-none"
                required
              ></textarea>

              <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Submit Suggestion
              </button>
            </form>
          </section>
        )}

        {/* Bug Report Form */}
        {feedback.enabled && (
          <section className="glass-card glass-card-hover rounded-3xl p-16 flex flex-col gap-8 relative overflow-hidden group border-b-4 border-orange-500/20 h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined text-9xl">pest_control</span>
            </div>
            <div className="flex flex-col gap-2 relative z-10">
              <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">{feedback.title}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest">{feedback.subtitle}</p>
            </div>

            <form action={feedback.formspreeUrl} method="POST" className="flex flex-col gap-8 h-full relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <select name="version" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white transition-all outline-none appearance-none text-gray-400 focus:text-white">
                    <option className="bg-black" value="" disabled selected>Select Modpack Version...</option>
                    <option className="bg-black text-white" value={config.modpackVersion || 'Latest'}>{config.modpackVersion || 'Latest'} (Current)</option>
                    <option className="bg-black text-white" value="Old">Older Version</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    name="logLink"
                    placeholder="Log File Link (SwissTransfer / Pastebin)..."
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white transition-all outline-none"
                  />
                </div>
              </div>

              <textarea
                name="description"
                placeholder="Describe the issue and how to replicate it..."
                className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-white transition-all outline-none resize-none"
                required
              ></textarea>

              <button type="submit" className="mt-auto w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Submit Bug Report
              </button>
            </form>
          </section>
        )}
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
