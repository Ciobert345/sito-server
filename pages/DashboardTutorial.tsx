import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DashboardTutorial: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { image: '/img/pannello1.png', caption: 'Remote Control Dashboard' },
        { image: '/img/pannello2.png', caption: 'Live Server Console Logs' },
        { image: '/img/pannello3.png', caption: 'Advanced Power Management' }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 flex flex-col gap-12 relative overflow-hidden">

            {/* Back Button - Absolutely Positioned to maintain title rhythm */}
            <Link
                to="/dashboard"
                className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group shadow-2xl z-50"
            >
                <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Console</span>
            </Link>

            {/* Hero Section - Technical Redesign */}
            <section className="relative pt-2 md:pt-4 flex flex-col items-center text-center gap-10">
                <div className="flex flex-col gap-4 relative">
                    <div className="flex items-center justify-center gap-3 opacity-60">
                        <span className="w-8 h-[1px] bg-white/20"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white">Documentation Protocol</span>
                        <span className="w-8 h-[1px] bg-white/20"></span>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black leading-none tracking-tighter text-white uppercase italic drop-shadow-[0_10px_50px_rgba(255,255,255,0.15)]">
                        Control <span className="text-white/40">Panel</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/40 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight px-4">
                        Our server features an advanced web-based orchestration system for real-time monitoring and interaction. Review the official operating manual below.
                    </p>
                </div>
            </section>

            {/* SSL Warning - Technical Alert Style */}
            <section className="w-full relative group">
                <div className="absolute -inset-1 bg-red-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                <div className="relative glass-card rounded-[2rem] p-8 md:p-12 border border-red-500/10 bg-red-500/[0.02] flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden shadow-2xl">
                    <div className="size-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-5xl text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">gpp_maybe</span>
                    </div>
                    <div className="flex flex-col gap-6 text-center md:text-left">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-red-500/40 uppercase tracking-[0.5em]">Critical Handshake Info</span>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter italic">Security & Encryption</h3>
                        </div>
                        <p className="text-white/40 leading-relaxed text-sm md:text-base font-medium">
                            If your browser flags the connection as insecure, proceed without hesitation. This is normal due to our private SSL certificate node. To unlock the integrated dashboard within this portal, click the button below and authorize the handshake with the remote node.
                        </p>
                        <div className="flex justify-center md:justify-start">
                            <a
                                href="https://server-manfredonia.ddns.net:25560/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-10 py-4 bg-red-600/10 border border-red-500/20 text-red-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl"
                            >
                                Authorize Dashboard Node
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Two Column Layout - Manual Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Access Guide */}
                <section className="flex flex-col gap-8 h-full">
                    <div className="flex items-center gap-4 px-2">
                        <span className="w-4 h-[1px] bg-white/20"></span>
                        <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Access Protocol</h2>
                    </div>

                    <div className="relative glass-card rounded-[2.5rem] border border-white/10 bg-white/[0.01] p-1 h-full shadow-2xl overflow-hidden group">
                        <div className="p-8 md:p-10 flex flex-col gap-10">
                            {[
                                { step: '01', title: 'Registration', desc: 'Secure your operating credentials once your Whitelist request is confirmed.' },
                                { step: '02', title: 'Discord Relay', desc: 'Navigate to the #link-⛓️‍💥 channel within our official tactical server.' },
                                { step: '03', title: 'Auth Gateway', desc: 'Use the provided uplink URL and enter your encrypted credentials.' },
                                { step: '04', title: 'Node Selection', desc: 'From the terminal list, select the Manfredonia Hub node to proceed.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 group/step">
                                    <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover/step:border-white/20 transition-all font-mono text-lg font-black text-white/20 group-hover/step:text-white/60">
                                        {item.step}
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">{item.title}</h4>
                                        <p className="text-xs text-white/30 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Management Guide */}
                <section className="flex flex-col gap-8 h-full">
                    <div className="flex items-center gap-4 px-2">
                        <span className="w-4 h-[1px] bg-purple-500/20"></span>
                        <h2 className="text-[10px] font-black text-purple-500/40 uppercase tracking-[0.4em]">Operational Management</h2>
                    </div>

                    <div className="relative glass-card rounded-[2.5rem] border border-purple-500/10 bg-purple-500/[0.01] p-1 h-full shadow-2xl overflow-hidden group">
                        <div className="p-8 md:p-10 flex flex-col gap-10">
                            {[
                                { step: '01', title: 'View Dashboard', desc: 'From the main server list, click on the target node to initialize the console.' },
                                { step: '02', title: 'Real-time Logs', desc: 'Monitor system telemetry and server communications as they happen.' },
                                { step: '03', title: 'Power Commands', desc: 'Deploy power-state changes: Initialize (Start), Shutdown, or Rapid Reboot.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 group/step">
                                    <div className="size-14 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center shrink-0 group-hover/step:border-purple-500/30 transition-all font-mono text-lg font-black text-purple-500/20 group-hover/step:text-purple-400">
                                        {item.step}
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">{item.title}</h4>
                                        <p className="text-xs text-white/30 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Pro Tip Detail */}
                            <div className="mt-4 p-6 rounded-3xl bg-purple-600/5 border border-purple-500/20 group-hover:bg-purple-600/10 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-purple-400 text-lg">info</span>
                                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Ethical Protocol</span>
                                </div>
                                <p className="text-[11px] text-white/40 leading-relaxed italic">
                                    Never terminate the server without notifying active users. Every power-state mutation is logged within the system's neural relay.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Panel Preview Carousel - Standardized Console Style */}
            <section className="w-full relative group">
                <div className="flex items-center gap-4 px-2 mb-8">
                    <span className="w-4 h-[1px] bg-blue-500/20"></span>
                    <h2 className="text-[10px] font-black text-blue-500/40 uppercase tracking-[0.4em]">Node Interface Preview</h2>
                </div>

                <div className="relative glass-card rounded-[2.5rem] border border-white/10 bg-[#080808]/80 p-1 md:p-1.5 overflow-hidden shadow-2xl transition-all duration-700">
                    <div className="relative w-full aspect-video rounded-[2.2rem] overflow-hidden bg-black flex items-center justify-center group/carousel">
                        {/* Control Buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-6 top-1/2 -translate-y-1/2 size-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 hover:scale-110 transition-all z-20 group/prev"
                        >
                            <span className="material-symbols-outlined text-3xl group-hover/prev:-translate-x-1 transition-transform">chevron_left</span>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-6 top-1/2 -translate-y-1/2 size-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 hover:scale-110 transition-all z-20 group/next"
                        >
                            <span className="material-symbols-outlined text-3xl group-hover/next:translate-x-1 transition-transform">chevron_right</span>
                        </button>

                        {/* Slide Display */}
                        <div className="absolute inset-0 p-12 md:p-24 flex items-center justify-center">
                            {slides.map((slide, index) => (
                                <div key={index} className={`absolute inset-0 transition-all duration-1000 transform ${index === currentSlide ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-12 pointer-events-none'}`}>
                                    <img
                                        src={slide.image}
                                        alt={slide.caption}
                                        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Scanline & Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_4px,3px_100%] z-10 pointer-events-none opacity-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[5]"></div>
                    </div>

                    {/* Carousel Footer */}
                    <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between rounded-b-[2.2rem]">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{slides[currentSlide].caption}</span>
                            <span className="text-[7px] font-mono text-white/10 uppercase tracking-[0.3em] mt-1">SVR_PREVIEW_MODE_0{currentSlide + 1}</span>
                        </div>
                        <div className="flex gap-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-1 transition-all duration-500 rounded-full ${index === currentSlide ? 'w-8 bg-white' : 'w-4 bg-white/10 hover:bg-white/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardTutorial;
