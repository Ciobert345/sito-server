import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { updatePassword, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords mismatch");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await updatePassword(password);
            setSuccess(true);
            // Logout after reset to force a fresh login and clear any temporary session
            await logout();
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            setError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-mono">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            </div>

            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[440px] glass-card rounded-2xl border border-white/10 bg-[#0A0A0A]/60 p-10 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
                >
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8 py-6"
                            >
                                <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                                        Password <br /><span className="text-emerald-500">Updated</span>
                                    </h2>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] leading-relaxed">
                                        Security integrity restored. Redirecting to access terminal...
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="form" className="space-y-10">
                                <div className="text-center">
                                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-[0.8]">
                                        Secure <br /><span className="text-white/30 text-4xl">Reset</span>
                                    </h1>
                                    <div className="mt-4 flex justify-center">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] border-t border-white/5 pt-2 px-8">
                                            Security Protocol Alpha
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-white transition-all outline-none pr-12"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {showPassword ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-white transition-all outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-[10px] uppercase font-bold text-center italic tracking-widest">
                                            // Error: {error}
                                        </p>
                                    )}

                                    <button
                                        disabled={loading}
                                        className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 mt-4"
                                    >
                                        {loading ? 'Processing...' : 'Update Protocol'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default ResetPassword;
