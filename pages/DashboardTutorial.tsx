import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardTutorial: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [progress, setProgress] = useState(0);

    const slides = [
        { image: '/img/pannello1.png', title: 'Integrated Uplink', desc: 'Secure connection to the remote MCSS orchestration node for real-time data sync.' },
        { image: '/img/pannello2.png', title: 'Neural Console', desc: 'Low-latency relay for monitoring server communications and executing manual protocols.' },
        { image: '/img/pannello3.png', title: 'Core Lifecycle', desc: 'Initialize, reboot, or suspend the server core with granular hardware metrics.' }
    ];

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) {
                    setCurrentSlide((prev) => (prev + 1) % slides.length);
                    return 0;
                }
                return p + 0.4; // Controlled progress speed
            });
        }, 30);
        return () => clearInterval(interval);
    }, [isAutoPlaying, slides.length]);

    const handleManualNav = (index: number) => {
        setCurrentSlide(index);
        setProgress(0);
        setIsAutoPlaying(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 flex flex-col gap-12 relative overflow-hidden">
            {/* Back Button - Breadcrumb Style */}
            <div className="flex justify-start">
                <Link
                    to="/utilities"
                    className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group shadow-2xl z-50 overflow-hidden"
                >
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Utilities</span>
                </Link>
            </div>

            {/* Hero Section */}
            <section className="relative pt-2 md:pt-4 flex flex-col items-center text-center gap-10">
                <div className="flex flex-col gap-4 relative">
                    <div className="flex items-center justify-center gap-4 opacity-40">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-white" />
                        <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white">Instructional Protocol</span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-white" />
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black leading-none tracking-tighter text-white uppercase italic drop-shadow-[0_10px_60px_rgba(255,255,255,0.2)]">
                        Command <span className="text-white/30">Manual</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/40 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight px-4 border-l-2 border-white/5 ml-4">
                        The Manfredonia Hub utilizes an integrated MCSS v4 orchestration system for high-fidelity server management. Review the operational guidelines below.
                    </p>
                </div>
            </section>

            {/* Premium Carousel - The Node Interface */}
            <section className="w-full relative py-12">
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-4">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                        <h2 className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Integrated UI Preview</h2>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="w-6 h-1 bg-white/10 rounded-full overflow-hidden">
                                {i === currentSlide && (
                                    <motion.div
                                        className="h-full bg-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ ease: "linear" }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* LEFT SIDE: The 3D-styled Frame */}
                    <div className="lg:col-span-8 relative group">
                        {/* Decorative Corners */}
                        <div className="absolute -top-4 -left-4 size-12 border-t-2 border-l-2 border-white/10 rounded-tl-3xl z-20 pointer-events-none" />
                        <div className="absolute -bottom-4 -right-4 size-12 border-b-2 border-r-2 border-white/10 rounded-br-3xl z-20 pointer-events-none" />

                        <div className="relative aspect-video rounded-[2.5rem] border border-white/10 bg-black/80 p-2 overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,1)] group-hover:scale-[1.01] transition-transform duration-700">
                            {/* Inner Screen Effect */}
                            <div className="absolute inset-0 z-[5] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                            <div className="absolute inset-0 z-[6] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-10" />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, scale: 1.1, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="w-full h-full"
                                >
                                    <img
                                        src={slides[currentSlide].image}
                                        alt={slides[currentSlide].title}
                                        className="w-full h-full object-cover rounded-[2rem]"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Data Overlays */}
                            <div className="absolute top-8 left-8 z-10 flex flex-col gap-1">
                                <span className="text-[7px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active Uplink</span>
                                <span className="text-[6px] font-mono text-white/20 uppercase">SEC_CHNL_0{currentSlide + 1}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Tactical Navigation & Info */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-3"
                                >
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                                        {slides[currentSlide].title.split(' ')[0]} <br />
                                        <span className="text-white/20">{slides[currentSlide].title.split(' ')[1]}</span>
                                    </h3>
                                    <p className="text-sm text-white/40 leading-relaxed font-medium">
                                        {slides[currentSlide].desc}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mt-4">
                            {slides.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleManualNav(i)}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${i === currentSlide
                                        ? 'bg-white/5 border-white/20 shadow-lg translate-x-2'
                                        : 'bg-transparent border-transparent hover:bg-white/[0.02]'
                                        }`}
                                >
                                    <div className={`size-10 rounded-xl flex items-center justify-center border transition-all ${i === currentSlide
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'bg-white/5 border-white/5 text-white/20 group-hover:text-white/40'
                                        }`}>
                                        <span className="font-mono text-xs font-black">0{i + 1}</span>
                                    </div>
                                    <div className="flex flex-col items-start gap-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${i === currentSlide ? 'text-white' : 'text-white/20'
                                            }`}>{s.title}</span>
                                        <span className="text-[8px] font-mono text-white/10 uppercase group-hover:text-white/20 transition-colors tracking-tighter">View Protocol Detail</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SSL Warning - Enhanced Security Alert */}
            <section className="w-full relative mt-12">
                <div className="absolute -inset-4 bg-red-600/5 rounded-[3rem] blur-3xl opacity-50 pointer-events-none" />
                <div className="relative glass-card rounded-[2.5rem] p-8 md:p-12 border border-red-500/10 bg-[#0a0a0a]/60 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
                        <div className="size-28 rounded-[2rem] bg-red-500/5 border-2 border-red-500/20 flex items-center justify-center shrink-0 shadow-[0_0_40px_rgba(239,68,68,0.1)] group-hover:border-red-500/40 transition-colors">
                            <span className="material-symbols-outlined text-6xl text-red-500 animate-pulse">lock_person</span>
                        </div>

                        <div className="flex flex-col gap-6 text-center md:text-left flex-1">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.6em]">Security Handshake Required</span>
                                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Encryption & Trust</h3>
                            </div>
                            <p className="text-white/40 leading-relaxed text-sm md:text-base font-medium max-w-2xl">
                                Our tactical nodes use private encryption certificates. If your browser flags the link, you must manually authorize the handshake by proceeding to the local node endpoint below. This is strictly required to enable integrated telemetry within this site.
                            </p>
                            <div className="flex justify-center md:justify-start pt-2">
                                <a
                                    href="https://server-manfredonia.ddns.net:25560/api/v2/servers"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative px-12 py-4 bg-red-600/10 border border-red-500/20 text-red-400 font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-2xl overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none" />
                                    Authorize Remote Node
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Manual Sections - Technical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
                {/* Access Guide */}
                <section className="flex flex-col gap-8 h-full">
                    <div className="flex items-center gap-4 px-2">
                        <div className="size-1.5 rounded-full bg-white/20" />
                        <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Access Protocol</h2>
                    </div>

                    <div className="relative glass-card rounded-[2.5rem] border border-white/10 bg-[#080808]/60 p-2 h-full shadow-2xl overflow-hidden group">
                        <div className="p-8 md:p-10 flex flex-col gap-10">
                            {[
                                { step: '01', title: 'Identity Registration', desc: 'Secure your profile through our unified login system to begin the operative onboarding.' },
                                { step: '02', title: 'Verification Queue', desc: 'Accounts enter a 24-hour verification window. Clearance is granted after staff audit.' },
                                { step: '03', title: 'Node Handshake', desc: 'Establish a secure uplink by authorizing the remote node certificate in your current session.' },
                                { step: '04', title: 'Full Deployment', desc: 'Master access to hardware telemetry, console relay, and system-level power management.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-8 group/step">
                                    <div className="size-16 rounded-[1.2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 group-hover/step:border-white/20 group-hover/step:bg-white/[0.05] transition-all font-mono text-xl font-black text-white/10 group-hover/step:text-emerald-400">
                                        {item.step}
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-base font-black text-white uppercase tracking-wider">{item.title}</h4>
                                        <p className="text-xs text-white/30 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Integrated Features */}
                <section className="flex flex-col gap-8 h-full">
                    <div className="flex items-center gap-4 px-2">
                        <div className="size-1.5 rounded-full bg-purple-500/30" />
                        <h2 className="text-[10px] font-black text-purple-500/40 uppercase tracking-[0.4em]">Management Suite</h2>
                    </div>

                    <div className="relative glass-card rounded-[2.5rem] border border-purple-500/10 bg-[#080808]/60 p-2 h-full shadow-2xl overflow-hidden group">
                        <div className="p-8 md:p-10 flex flex-col gap-10">
                            {[
                                { step: '01', title: 'System Telemetry', desc: 'High-fidelity monitoring of CPU utilization and RAM saturation across all virtual nodes.' },
                                { step: '02', title: 'Neural Relay', desc: 'A dedicated low-latency stream for interacting with the server engine and console logs.' },
                                { step: '03', title: 'Power Vectoring', desc: 'Precise control over the server heart: Initialize, Restart, or Suspend core operations.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-8 group/step">
                                    <div className="size-16 rounded-[1.2rem] bg-purple-500/5 border border-purple-500/10 flex items-center justify-center shrink-0 group-hover/step:border-purple-500/30 group-hover/step:bg-purple-500/10 transition-all font-mono text-xl font-black text-purple-500/10 group-hover/step:text-purple-400">
                                        {item.step}
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h4 className="text-base font-black text-white uppercase tracking-wider">{item.title}</h4>
                                        <p className="text-xs text-white/30 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-4 p-8 rounded-[2rem] bg-purple-600/5 border border-purple-500/10 relative overflow-hidden group/tip">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/tip:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-6xl">priority_high</span>
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-400 text-sm">shield</span>
                                    </div>
                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Operational Integrity</span>
                                </div>
                                <p className="text-[11px] text-white/40 leading-relaxed italic font-medium">
                                    Executions are logged and mapped to your operative footprint. Core termination is prohibited if active neural sessions (players) are detected.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardTutorial;
