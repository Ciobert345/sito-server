import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { getLatestRelease } from '../utils/githubCache';

const Dashboard: React.FC = () => {
  const { config, loading: configLoading } = useConfig();
  const navigate = useNavigate();
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [serverStatus, setServerStatus] = useState<{ online: boolean; players?: { online: number } }>({ online: false });
  const [latestRelease, setLatestRelease] = useState<string>('Checking...');
  const [logs, setLogs] = useState<{ time: string; tag: string; msg: string; color?: string }[]>([]);

  const serverUrl = "https://server-manfredonia.ddns.net:25560/";

  // Log sequence generator
  const addLog = (tag: string, msg: string, color?: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev.slice(-9), { time: `[${time}]`, tag, msg, color }]);
  };

  useEffect(() => {
    const checkServer = async () => {
      addLog('SYS_INIT:', 'Initializing command deck protocols...', 'text-white/40');

      try {
        // Fetch server status (players/online)
        const statusRes = await fetch(`https://api.mcsrvstat.us/2/${config?.serverMetadata?.ip || 'server-manfredonia.ddns.net'}`);
        const statusData = await statusRes.json();
        setServerStatus({ online: statusData.online, players: statusData.players });
        addLog('SYS_SYNC:', `Neural relay established with ${config?.serverMetadata?.ip || 'node_01'}.`, 'text-white/40');

        // Fetch GitHub release
        if (config?.github?.repository) {
          const githubData = await getLatestRelease(config.github.repository);
          setLatestRelease(githubData.tag_name || 'v1.0.0');
          addLog('SYS_INFO:', `Static config synchronized (v${githubData.tag_name || '1.0.0'}).`, 'text-blue-500/40');
        }

        // Check if iframe target is reachable
        const response = await fetch(serverUrl, { mode: 'no-cors' });
        setServerAvailable(true);
        addLog('SYS_DONE:', 'Handshake result: SVR_PONG 24ms.', 'text-green-500/40');
      } catch (error) {
        setServerAvailable(false);
        addLog('SYS_ERR:', 'Handshake timeout. Retrying protocol...', 'text-red-500/40');
      } finally {
        setTimeout(() => {
          setLoading(false);
          addLog('SYS_KEEP:', 'Protocol heartbeat stable (100% Signal).', 'text-white/40');
        }, 1500);
      }
    };

    if (!configLoading) {
      checkServer();
    }
  }, [config, configLoading]);

  // Handle Quick Directive actions
  const handleAction = (action: string) => {
    switch (action) {
      case 'Report Bug':
        navigate('/utilities');
        break;
      case 'Suggestions':
        navigate('/utilities');
        break;
      case 'Roadmap':
        navigate('/utilities');
        break;
      case 'Download':
        navigate('/modpack');
        break;
      default:
        break;
    }
  };

  if (configLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing Data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-16 relative overflow-hidden">

      {/* Hero Section - Strict Alignment with Modpack/Information */}
      <section className="w-full relative py-6 flex flex-col items-center text-center gap-6">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg leading-tight uppercase italic">
          Remote <br /><span className="text-white/40">Console</span>
        </h1>
        <p className="max-w-2xl text-lg text-white/40 leading-relaxed font-light">
          Real-time telemetry and advanced node management for the {config?.siteInfo?.title || 'Manfredonia Hub'}.
        </p>
      </section>

      {/* INTEGRATED COMMAND DECK */}
      <section className="w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-transparent to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>

        <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 md:p-1.5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-700">
          {/* Header Bar */}
          <div className="px-5 md:px-10 py-5 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[22px]">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5 shrink-0">
                <div className="size-2.5 rounded-full bg-red-500/30"></div>
                <div className="size-2.5 rounded-full bg-yellow-500/30"></div>
                <div className="size-2.5 rounded-full bg-green-500/30"></div>
              </div>
              <div className="h-4 w-px bg-white/5 mx-2 hidden md:block"></div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all group/toggle ${!sidebarOpen ? 'bg-purple-500/10 border-purple-500/30' : ''}`}
              >
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-500 ${!sidebarOpen ? 'rotate-180 text-purple-400' : 'text-white/40'}`}>
                  {sidebarOpen ? 'dock_to_left' : 'dock_to_right'}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:block ${!sidebarOpen ? 'text-purple-400' : 'text-white/20'}`}>
                  {sidebarOpen ? 'Collapse Data' : 'Expand Data'}
                </span>
              </button>
              <div className="h-4 w-px bg-white/5 mx-2 hidden md:block"></div>

              {/* NEW LIVE PLAYER BADGE - Prominent Visibility */}
              <div className="flex items-center gap-3 px-4 py-1.5 bg-purple-500/5 border border-purple-500/20 rounded-xl group/players animate-pulse hover:animate-none hover:bg-purple-500/10 transition-all">
                <span className="material-symbols-outlined text-[18px] text-purple-400">group</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none bg-clip-text">
                    {serverStatus.players?.online ?? 0} ACTIVE
                  </span>
                  <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] mt-0.5">Live Feed</span>
                </div>
              </div>

              <div className="h-4 w-px bg-white/5 mx-2 hidden lg:block"></div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hidden xl:block">Command Deck // SVR_CONSOLE_v3.0</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-sm text-green-500/30">broadcast_on_home</span>
              <span className="text-[10px] font-black text-green-500/30 uppercase tracking-widest leading-none hidden sm:block">Continuous Stream</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">

            {/* SIDE INTELLIGENCE MODULE - Collapsible Version */}
            <div
              style={{ width: sidebarOpen ? '220px' : '0px', opacity: sidebarOpen ? 1 : 0 }}
              className="transition-all duration-700 ease-in-out overflow-hidden shrink-0 flex flex-col bg-white/[0.01]"
            >
              <div className="p-6 md:p-8 flex flex-col gap-10 w-[220px]">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-[1px] bg-purple-500/40"></span>
                      <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400">Intelligence</span>
                    </div>
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none truncate">{config?.siteInfo?.title || 'Manfredonia'}</h4>
                    <div className="flex items-center gap-2">
                      <div className={`size-1.5 rounded-full ${serverStatus.online ? 'bg-green-500/60 shadow-[0_0_4px_#22c55e]' : 'bg-red-500/60 shadow-[0_0_4px_#ef4444]'}`}></div>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">{serverStatus.online ? 'Uplink Established' : 'Node Disconnect'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {[
                      { label: 'Uplink Target', value: config?.serverMetadata?.ip || 'Connecting...', color: 'bg-blue-500' },
                      { label: 'Live Population', value: `${serverStatus.players?.online ?? 0} ACTIVE`, color: 'bg-purple-500' },
                      { label: 'Latest Pack', value: latestRelease, color: 'bg-green-500' }
                    ].map((stat) => (
                      <div key={stat.label} className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                          <span className="text-[10px] font-mono font-black text-white/80 tracking-tighter">{stat.value}</span>
                        </div>
                        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.color} w-[85%] opacity-30 animate-pulse`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                  <Link
                    to="/dashboard-tutorial"
                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all rounded-xl flex items-center justify-center group/btn"
                  >
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Manual</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* PRIMARY MONITOR MODULE - Ultra Wide */}
            <div className="relative bg-black group/monitor overflow-hidden flex-1 flex flex-col items-center justify-center">
              <div className="w-full aspect-video relative">
                {/* Tactical Brackets */}
                <div className="absolute top-8 left-8 size-16 border-t border-l border-white/10 rounded-tl-xl z-20 pointer-events-none group-hover/monitor:border-white/20 transition-colors"></div>
                <div className="absolute top-8 right-8 size-16 border-t border-r border-white/10 rounded-tr-xl z-20 pointer-events-none group-hover/monitor:border-white/20 transition-colors"></div>
                <div className="absolute bottom-8 left-8 size-16 border-b border-l border-white/10 rounded-bl-xl z-20 pointer-events-none group-hover/monitor:border-white/20 transition-colors"></div>
                <div className="absolute bottom-8 right-8 size-16 border-b border-r border-white/10 rounded-br-xl z-20 pointer-events-none group-hover/monitor:border-white/20 transition-colors"></div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] z-20 pointer-events-none opacity-10"></div>

                {/* Loading / Error States */}
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-30">
                    <div className="size-20 border border-white/10 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="mt-8 text-[10px] font-black text-white/10 uppercase tracking-[0.5em] animate-pulse italic">Connecting to Remote Node...</p>
                  </div>
                ) : serverAvailable === false ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080303] z-30 p-12">
                    <div className="glass-card rounded-3xl p-10 border border-red-500/20 text-center flex flex-col items-center gap-6 max-w-sm bg-black/40 backdrop-blur-md">
                      <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                        <span className="material-symbols-outlined text-4xl">gpp_maybe</span>
                      </div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Handshake Timeout</h3>
                      <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-600/20 border border-red-500/20 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all">Force Sync</button>
                    </div>
                  </div>
                ) : null}

                <iframe
                  src={serverUrl}
                  className="w-full h-full border-none opacity-0 transition-opacity duration-1000"
                  title="Server Dashboard"
                  style={{ opacity: serverAvailable === true ? 1 : 0 }}
                  allowFullScreen
                  onLoad={(e) => (e.target as HTMLIFrameElement).style.opacity = '1'}
                />
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="px-5 md:px-10 py-6 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 rounded-b-[22px]">
            <div className="flex items-center gap-6 font-mono text-[9px] text-white/10 uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap lg:max-w-md xl:max-w-none">
              <span className="text-purple-500/30">CMD:</span> root@manfredonia:~$ sudo access-console --target="{config?.serverMetadata?.ip || 'HUB_SVR_PROD'}"
            </div>
            <div className="flex items-center gap-4 md:gap-8 shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
                  <div className={`size-2 rounded-full ${serverStatus.online ? 'bg-green-500/40 shadow-[0_0_4px_#22c55e]' : 'bg-red-500/40 shadow-[0_0_4px_#ef4444]'}`}></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">Established</span>
                    <span className="text-[8px] font-mono text-white/20 mt-1 uppercase">NODE_STATUS: {serverStatus.online ? 'SYNCED' : 'OFFLINE'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <button
                  onClick={() => window.location.reload()}
                  className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-all group"
                  title="Refresh Hardware"
                >
                  <span className="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-700">sync</span>
                </button>
                <button
                  onClick={() => window.open(serverUrl, '_blank')}
                  className="px-4 md:px-6 py-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-600/20 transition-all flex items-center gap-3"
                >
                  <span className="hidden sm:inline">Full Access</span>
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT OPERATIONAL MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* MODULAR BOX 1: CONSOLE INTELLIGENCE (Logs) */}
        <section className="lg:col-span-2 relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-transparent rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 overflow-hidden h-full flex flex-col shadow-2xl">
            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[23px]">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="size-1.5 rounded-full bg-purple-500/40"></div>
                  <div className="size-1.5 rounded-full bg-purple-500/20"></div>
                </div>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Terminal SVR_LOGS_STREAM</span>
              </div>
              <span className="text-[8px] font-mono text-purple-500/40 uppercase tracking-widest animate-pulse">Live Link</span>
            </div>

            <div className="p-8 flex flex-col gap-3 font-mono text-[10px] text-white/20 leading-relaxed min-h-[160px]">
              {logs.map((log, i) => (
                <p key={i} className="flex gap-4 border-l border-white/5 pl-4 ml-1">
                  <span className="text-white/10 tabular-nums shrink-0">{log.time}</span>
                  <span className={`${log.color || "text-white/40"} shrink-0 w-20`}>{log.tag}</span>
                  <span className="truncate">{log.msg}</span>
                </p>
              ))}
              <div className="flex items-center gap-2 border-l border-white/5 pl-4 ml-1">
                <span className="animate-pulse text-white/40">_</span>
              </div>
            </div>

            <div className="px-8 py-4 bg-white/[0.01] border-t border-white/5 mt-auto rounded-b-[23px]">
              <div className="font-mono text-[9px] text-white/5 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">terminal</span>
                tail -f /var/log/manfredonia/console.log
              </div>
            </div>
          </div>
        </section>

        {/* MODULAR BOX 2: TACTICAL DIRECTIVES (Quick Actions) */}
        <section className="relative group h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-l from-blue-500/10 to-transparent rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          <div className="relative glass-card rounded-3xl border border-white/10 bg-[#080808]/80 p-1 overflow-hidden h-full flex flex-col shadow-2xl">
            <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between rounded-t-[23px]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm text-blue-500/30">settings_remote</span>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Tactical Directives</span>
              </div>
              <div className="size-1.5 rounded-full bg-blue-500/30 animate-ping"></div>
            </div>

            <div className="p-6 flex flex-col gap-3">
              {[
                { label: 'Report Bug', icon: 'gpp_maybe', color: 'text-red-400', desc: 'SVR_ERR_REPORT' },
                { label: 'Suggestions', icon: 'chat', color: 'text-purple-400', desc: 'SYNC_FEEDBACK' },
                { label: 'Roadmap', icon: 'rebase_edit', color: 'text-green-400', desc: 'PROJECT_TRACK' },
                { label: 'Download', icon: 'download', color: 'text-blue-400', desc: 'ASSET_UPGRADE' }
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action.label)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all group/item text-left overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-lg ${action.color} group-hover/item:scale-110 transition-transform`}>{action.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{action.label}</span>
                      <span className="text-[6px] font-mono text-white/10 uppercase tracking-[0.3em] font-black group-hover/item:text-white/20 transition-colors">{action.desc}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xs text-white/5 group-hover/item:text-white/20 -translate-x-4 group-hover/item:translate-x-0 transition-all">chevron_right</span>
                </button>
              ))}
            </div>

            <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 mt-auto text-center rounded-b-[23px]">
              <span className="text-[8px] font-black text-white/5 uppercase tracking-[0.4em]">Neural Link Status: SEC_READY</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
