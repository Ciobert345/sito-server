
import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';

interface ReleaseUpdate {
  version: string;
  date: string;
  title: string;
  body: string;
}

const Updates: React.FC = () => {
  const { config } = useConfig();
  const [releases, setReleases] = useState<ReleaseUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Simple Markdown to HTML parser (based on legacy logic)
  const markdownToHtml = (text: string) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/`([^`]+?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-yellow-300 font-mono text-sm border border-white/10">$1</code>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors">$1</a>');
    // Bold
    html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    // Italic
    html = html.replace(/\*([^*\n]+?)\*/g, '<em class="text-white/80 italic">$1</em>');
    // Headers
    html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-white mt-6 mb-3 text-xl font-bold border-l-4 border-white/30 pl-4">$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-white mt-8 mb-4 text-2xl font-bold border-l-4 border-white/40 pl-4">$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-white mt-8 mb-5 text-3xl font-bold border-l-4 border-white/50 pl-4">$1</h1>');
    // Lists
    html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-5 mb-2 list-disc text-white/90 pl-1">$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-5 mb-2 list-decimal text-white/90 pl-1">$1</li>');
    // Wrap lists (simplified)
    html = html.replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gs, '<ul class="my-4 pl-4">$1</ul>');
    // Line breaks
    html = html.replace(/\n\n+/g, '</p><p class="mb-4 text-white/95">');
    html = html.replace(/\n/g, '<br>');

    return '<p class="mb-2 text-white/95">' + html + '</p>';
  };

  useEffect(() => {
    if (!config?.github?.repository) return;

    const fetchReleases = async () => {
      setLoading(true);
      try {
        const repo = config.github.repository;
        const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
        if (config.github.token) {
          headers['Authorization'] = `token ${config.github.token}`;
        }

        const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=4`, { headers });
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        const releasesData = data.map((release: any) => ({
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [config]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-white">Changelogs & <br /><span className="text-white/30">Wiki Hub</span></h1>
        <p className="text-gray-400 max-w-2xl text-lg font-light">Stay updated with the latest mechanical tweaks and community guides.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Left: Wiki Cards / Iframe Trigger */}
        <div className="lg:col-span-1 flex flex-col h-full gap-6">
          <div className="flex items-center justify-between px-2 h-8">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Essential Wiki</h3>
          </div>

          {/* Notion Embed Wrapper */}
          <div className="glass-card rounded-2xl overflow-hidden flex-grow relative group border border-white/10 min-h-[500px]">
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none group-hover:opacity-0 transition-opacity">
              <span className="bg-black/80 px-4 py-2 rounded-xl text-white font-bold uppercase tracking-widest text-xs border border-white/20">Interactive Wiki</span>
            </div>
            <iframe
              src="https://dent-comte-e60.notion.site/ebd/20e1a36dbdb98050b8fac5ae5f158659?v=20e1a36dbdb98036aa1f000c15ecf1b2"
              className="w-full h-full border-none bg-[#191919] min-h-full"
              title="Manfredonia Wiki"
            ></iframe>
          </div>

          <div className="glass-card rounded-3xl p-6 flex flex-col gap-3 shrink-0">
            <div className="flex flex-col gap-1 text-center">
              <span className="material-symbols-outlined text-3xl text-white/30">support_agent</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Need Support?</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed">Request support in the discord server</p>
            </div>

            <form action="https://formspree.io/f/mqabzreg" method="POST" className="flex flex-col gap-2">
              <input
                type="text"
                id="support-name"
                name="name"
                placeholder="Nome (Max)"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-white transition-all outline-none"
                required
              />

              <input
                type="email"
                id="support-email"
                name="email"
                placeholder="Email (maxverstappen@live.it)"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-white transition-all outline-none"
                required
              />

              <input
                type="text"
                id="support-discord"
                name="discord"
                placeholder="Discord Username (max#3)"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-white transition-all outline-none"
                required
              />

              <input type="hidden" name="_subject" value="Nuova richiesta di accesso al supporto" />
              <input type="hidden" name="_next" value="#success" />
              <input type="hidden" name="_autoresponse" value="Grazie per la tua richiesta di accesso al supporto. Abbiamo ricevuto i tuoi dati e ti contatteremo presto." />

              <button type="submit" className="w-full py-2 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-gray-200 transition-all mt-1">
                Send Request
              </button>
            </form>
          </div>
        </div>

        {/* Right: Changelogs */}
        <div className="lg:col-span-2 flex flex-col h-full gap-6">
          <div className="flex items-center justify-between px-2 h-8">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Latest Releases</h3>
            {releases.length > 0 && <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">{releases.length} Updates</span>}
          </div>

          {loading ? (
            <div className="glass-card rounded-2xl flex-grow flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : releases.length > 0 ? (
            <div className="flex flex-col gap-6">
              {releases.map((release, index) => {
                const isLatest = index === 0;
                const isExpanded = expandedIndex === index;

                return (
                  <div
                    key={release.version}
                    className="glass-card rounded-2xl p-8 relative overflow-hidden group transition-all cursor-pointer hover:border-white/20"
                    onClick={() => {
                      if (expandedIndex !== index) {
                        setExpandedIndex(index);
                      }
                    }}
                  >
                    <div className="absolute top-0 right-0 py-2 px-6 bg-white/5 text-white/20 font-black text-4xl group-hover:text-white/10 transition-colors uppercase tracking-widest select-none">{release.version}</div>

                    <div className="flex flex-col gap-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {isLatest && (
                            <span className="text-xs font-black text-white px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 uppercase tracking-widest">Latest</span>
                          )}
                          <span className="text-xs font-black text-white px-3 py-1 rounded-full bg-white/10 border border-white/10 uppercase tracking-widest">Stable Build</span>
                          <span className="text-xs font-medium text-gray-500">{release.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{release.title}</h2>
                        {!isExpanded && (
                          <div className="flex items-center justify-center size-10 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all flex-shrink-0">
                            <span className="material-symbols-outlined text-white/60 text-xl transition-transform" style={{ transform: 'rotate(0deg)' }}>
                              keyboard_arrow_down
                            </span>
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div
                          className="text-gray-300 leading-relaxed space-y-4 h-[229px] overflow-y-auto pr-2 animate-in fade-in slide-in-from-top-4 duration-300"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                          }}
                          dangerouslySetInnerHTML={{ __html: markdownToHtml(release.body) }}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center text-gray-500">
              <p>No release notes found or unable to fetch from GitHub.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Updates;
