
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const serverUrl = 'https://server-manfredonia.ddns.net:25560/';

  useEffect(() => {
    const checkServer = async () => {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);

        await fetch(serverUrl, { mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeout);
        setServerAvailable(true);
      } catch (error) {
        setServerAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-12">
      {/* Header */}
      <header className="flex flex-col items-center text-center gap-6 py-6 mb-12">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-lg leading-tight uppercase italic">
          Server <br /><span className="text-white/40">Dashboard</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 font-light leading-relaxed">
          Controlla e gestisci il server Minecraft in tempo reale attraverso la dashboard remota.
        </p>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_6fr] gap-8 items-start">
        {/* Left Column - Content */}
        <div className="flex flex-col gap-4">
          {/* Tutorial Banner */}
          <div className="glass-card rounded-3xl px-6 py-[25px] flex flex-col gap-5 border-l-4 border-purple-500/40">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-4xl text-purple-400">info</span>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Prima di iniziare</h3>
                <p className="text-sm text-gray-500">Consulta il tutorial completo</p>
              </div>
            </div>
            <Link
              to="/dashboard-tutorial"
              className="w-full py-3.5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-200 transition-all text-center block"
            >
              Vedi Tutorial
            </Link>
          </div>

          {/* Info Cards */}
          <div className="glass-card rounded-3xl px-6 py-[25px] flex items-start gap-4">
            <span className="material-symbols-outlined text-3xl text-white/30 flex-shrink-0 mt-0.5">security</span>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">Connessione Sicura</h3>
              <p className="text-sm text-gray-500 leading-relaxed">La dashboard utilizza una connessione HTTPS crittografata per i tuoi dati.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl px-6 py-[25px] flex items-start gap-4">
            <span className="material-symbols-outlined text-3xl text-white/30 flex-shrink-0 mt-0.5">update</span>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">Aggiornamenti Real-Time</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Monitora lo stato del server con aggiornamenti ogni 10 secondi.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl px-6 py-[25px] flex items-start gap-4">
            <span className="material-symbols-outlined text-3xl text-white/30 flex-shrink-0 mt-0.5">terminal</span>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">Controllo Completo</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Accedi alla console e gestisci tutti gli aspetti del tuo mondo.</p>
            </div>
          </div>
        </div>

        {/* Right Column - Dashboard iframe with 16:9 aspect ratio */}
        <div className="glass-card rounded-3xl overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
              <p className="text-white font-bold uppercase tracking-widest text-sm">Connessione al server...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && serverAvailable === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20 p-8">
              <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center gap-4 border-2 border-red-500/30">
                <span className="material-symbols-outlined text-6xl text-red-400">warning</span>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Server Non Raggiungibile</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    Il server dashboard non è attualmente disponibile.
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <p>• Verifica che il server sia online</p>
                    <p>• Controlla la connessione internet</p>
                    <p>• Riprova tra qualche minuto</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-200 transition-all mt-2"
                >
                  Ricarica Pagina
                </button>
              </div>
            </div>
          )}

          {/* iframe */}
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none z-10"></div>
            <iframe
              src={serverUrl}
              className="w-full h-full border-none bg-black"
              title="Server Dashboard"
              allowFullScreen
              style={{ display: serverAvailable === true ? 'block' : 'none' }}
            />
          </div>

          {/* Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 px-6 py-3 flex items-center justify-between z-30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${serverAvailable === true ? 'bg-green-400 animate-pulse' : serverAvailable === false ? 'bg-red-400' : 'bg-gray-400'}`}></span>
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                  {serverAvailable === true ? 'Connesso' : serverAvailable === false ? 'Disconnesso' : 'Verifica...'}
                </span>
              </div>
              <span className="text-white/20">•</span>
              <span className="text-xs font-mono text-white/40">{serverUrl}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="text-white/40 hover:text-white transition-colors"
                title="Ricarica"
              >
                <span className="material-symbols-outlined text-xl">refresh</span>
              </button>
              <button
                onClick={() => window.open(serverUrl, '_blank')}
                className="text-white/40 hover:text-white transition-colors"
                title="Apri in nuova finestra"
              >
                <span className="material-symbols-outlined text-xl">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
