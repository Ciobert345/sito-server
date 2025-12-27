
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DashboardTutorial: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { image: '/img/pannello1.png', caption: 'Dashboard del pannello di controllo' },
        { image: '/img/pannello2.png', caption: 'Console con log del server' },
        { image: '/img/pannello3.png', caption: 'Controlli di gestione del server' }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-12">
            {/* Back Button */}
            <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all mb-8"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="font-bold uppercase text-sm tracking-widest">Torna indietro</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic leading-tight">
                    Pannello di <br /><span className="text-white/40">Controllo</span>
                </h1>
                <p className="text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto">
                    Il nostro server dispone di un pannello di controllo web che permette ai membri di monitorare lo stato del server e interagire con esso. Ecco come utilizzarlo:
                </p>
            </div>

            {/* SSL Warning */}
            <div className="glass-card rounded-3xl p-8 mb-12 border-l-4 border-red-500/50 bg-gradient-to-r from-red-500/10 to-transparent">
                <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-5xl text-red-400 flex-shrink-0">warning</span>
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">⚠️ Attenzione ⚠️</h3>
                        <p className="text-base text-gray-300 leading-relaxed mb-6">
                            Se il tuo browser ti dice che il sito non è sicuro o che la connessione non è privata prosegui lo stesso, questo è dovuto alla mancanza dei certificati SSL (che sono a pagamento) di cui la dashboard non dispone. Se nel sito non viene caricata la dashboard e non ti viene mostrato questo errore clicca il tasto qui sotto e autorizza la connessione.
                        </p>
                        <a
                            href="https://server-manfredonia.ddns.net:25560/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-8 py-4 bg-white text-black font-black uppercase text-sm tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                        >
                            Autorizza la dashboard
                        </a>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Access Guide */}
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-6 border-l-4 border-white pl-4">
                        Come accedere al pannello
                    </h2>
                    <div className="glass-card rounded-3xl p-8 h-full">
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <span className="text-lg font-black text-white">1</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        <strong className="text-white">Registrazione:</strong> Dopo l'approvazione della tua richiesta di whitelist, riceverai le credenziali di accesso al pannello.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <span className="text-lg font-black text-white">2</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        <strong className="text-white">Accesso tramite Discord:</strong> Entra nel nostro server Discord e vai al canale <span className="text-white font-semibold">"link-⛓️‍💥"</span>.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <span className="text-lg font-black text-white">3</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        <strong className="text-white">Login al pannello:</strong> Utilizza il link fornito nel canale Discord per accedere al pannello e inserisci le tue credenziali.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <span className="text-lg font-black text-white">4</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        <strong className="text-white">Visualizzazione server:</strong> Una volta effettuato l'accesso, vedrai la lista dei server disponibili.
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* Server Management Guide */}
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-6 border-l-4 border-white pl-4">
                        Gestione del server
                    </h2>
                    <div className="glass-card rounded-3xl p-8 h-full">
                        <ol className="space-y-6">
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <span className="text-lg font-black text-white">1</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        <strong className="text-white">Accedi alla dashboard:</strong> Dalla lista dei server, clicca su <span className="text-white font-semibold">"View Dashboard"</span> per accedere al pannello di controllo del server.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <span className="text-lg font-black text-white">2</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        <strong className="text-white">Controllo server:</strong> Nella dashboard, potrai visualizzare la console del server e monitorare le attività in tempo reale.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                    <span className="text-lg font-black text-white">3</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        <strong className="text-white">Gestione server:</strong> In alto a destra troverai un pulsante che ti permetterà di <span className="text-white font-semibold">avviare</span>, <span className="text-white font-semibold">spegnere</span> o <span className="text-white font-semibold">riavviare</span> il server.
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Important Warning */}
            <div className="glass-card rounded-3xl p-8 mb-12 border-l-4 border-red-500/50 bg-gradient-to-r from-red-500/10 to-transparent">
                <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-5xl text-red-400 flex-shrink-0">warning</span>
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">⚠️ Importante</h3>
                        <p className="text-base text-gray-300 leading-relaxed">
                            Utilizza le funzioni di avvio e spegnimento del server <strong className="text-white">con parsimonia</strong>. Un uso improprio può causare danni ai dati di gioco e disturbare l'esperienza degli altri giocatori. Non spegnere mai il server senza prima avvisare gli altri utenti online.
                        </p>
                    </div>
                </div>
            </div>

            {/* Panel Preview Carousel */}
            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-6 border-l-4 border-white pl-4">
                    Anteprima del pannello
                </h2>
                <div className="glass-card rounded-3xl p-6 relative" style={{ aspectRatio: '16/9' }}>
                    {/* Carousel Container */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/50 border border-white/10">
                        {/* Previous Button */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-0 bottom-0 w-16 bg-black/50 hover:bg-black/80 border-r border-white/10 z-10 flex items-center justify-center transition-all group"
                        >
                            <span className="material-symbols-outlined text-white/60 group-hover:text-white text-3xl">chevron_left</span>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-0 bottom-0 w-16 bg-black/50 hover:bg-black/80 border-l border-white/10 z-10 flex items-center justify-center transition-all group"
                        >
                            <span className="material-symbols-outlined text-white/60 group-hover:text-white text-3xl">chevron_right</span>
                        </button>

                        {/* Slides */}
                        <div className="absolute inset-0 flex items-center justify-center p-20">
                            {slides.map((slide, index) => (
                                <img
                                    key={index}
                                    src={slide.image}
                                    alt={slide.caption}
                                    className={`absolute max-w-full max-h-full object-contain transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Caption and Indicators */}
                    <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4">
                        <p className="text-white text-lg font-semibold">{slides[currentSlide].caption}</p>
                        <div className="flex gap-3">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                                            ? 'bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                                            : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTutorial;
