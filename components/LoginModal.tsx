
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LoginModal: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Use refs for uncontrolled inputs to avoid conflicts with password managers in Firefox
    const emailRef = React.useRef<HTMLInputElement>(null);
    const usernameRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);
    const confirmPasswordRef = React.useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, signup, resetPassword, setAuthModalOpen } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const email = emailRef.current?.value || '';
        const password = passwordRef.current?.value || '';
        const username = usernameRef.current?.value || '';
        const confirm = confirmPasswordRef.current?.value || '';

        try {
            if (isForgotPassword) {
                await resetPassword(email);
                setRecoveryEmailSent(true);
            } else if (isSignUp) {
                if (password !== confirm) {
                    throw new Error("L_SEC_ERR: Passwords mismatch");
                }
                await signup(email, password, username);
                setSuccess(true);
            } else {
                await login(email, password);
                setAuthModalOpen(false); // Close modal on success
            }
        } catch (err: any) {
            setError(err.message || 'L_AUTH_ERR: Invalid clearance codes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center select-none">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[440px] glass-card rounded-2xl border border-white/10 bg-[#0A0A0A]/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col p-10 backdrop-blur-xl"
            >
                {/* Close Button */}
                <button
                    onClick={() => setAuthModalOpen(false)}
                    className="absolute top-6 right-6 size-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all z-20 group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">close</span>
                </button>

                <AnimatePresence mode="wait">
                    {recoveryEmailSent ? (
                        <motion.div
                            key="recovery-success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1 flex flex-col gap-8 items-center justify-center text-center py-4"
                        >
                            <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined text-4xl">mail</span>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                                    Recovery <br /><span className="text-emerald-500">Sent</span>
                                </h2>
                                <p className="text-xs font-mono text-white/40 uppercase tracking-[0.2em] leading-relaxed max-w-[280px]">
                                    Link di ripristino inviato. Controlla la tua casella di posta per procedere con il reset della password.
                                </p>
                            </div>

                            <button
                                onClick={() => { setRecoveryEmailSent(false); setIsForgotPassword(false); }}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all transition-colors"
                            >
                                Back to Login
                            </button>
                        </motion.div>
                    ) : success ? (
                        <motion.div
                            key="success-state"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1 flex flex-col gap-8 items-center justify-center text-center py-4"
                        >
                            <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined text-4xl">verified_user</span>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                                    Request <br /><span className="text-emerald-500">Sent</span>
                                </h2>
                                <p className="text-xs font-mono text-white/40 uppercase tracking-[0.2em] leading-relaxed max-w-[280px]">
                                    Access verified. Account pending administrator approval. <br /><span className="text-yellow-500/80 mt-2 block font-bold">Process may take up to 24h.</span>
                                </p>
                            </div>

                            <button
                                onClick={() => { setSuccess(false); setIsSignUp(false); }}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-all transition-colors"
                            >
                                Back to Entry
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="mb-10 text-center">
                                <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-[0.8]">
                                    {isForgotPassword ? 'Reset' : isSignUp ? 'Request' : 'Login'} <br /><span className="text-white/30 text-4xl">{isForgotPassword ? 'Password' : isSignUp ? 'Access' : 'Area'}</span>
                                </h1>
                                <div className="mt-4 flex justify-center">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] border-t border-white/5 pt-2 px-8">
                                        {loading ? 'Processing...' : 'Identification Required'}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                {isSignUp && (
                                    <div className="space-y-2">
                                        <label htmlFor="signup-username" className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Username</label>
                                        <input
                                            ref={usernameRef}
                                            id="signup-username"
                                            name="username"
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-white transition-all outline-none placeholder:text-white/10"
                                            placeholder="YOUR NAME"
                                            required={isSignUp}
                                            autoComplete="username"
                                            spellCheck="false"
                                            autoCorrect="off"
                                            autoCapitalize="off"
                                            data-bwignore="true"
                                            data-1p-ignore="true"
                                            data-lpignore="true"
                                            data-form-type="other"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="auth-email" className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Email</label>
                                    <input
                                        ref={emailRef}
                                        id="auth-email"
                                        name="email"
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-white transition-all outline-none placeholder:text-white/10"
                                        placeholder="YOUR@EMAIL"
                                        required
                                        autoComplete="email"
                                        spellCheck="false"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        data-bwignore="true"
                                        data-1p-ignore="true"
                                        data-lpignore="true"
                                        data-form-type="other"
                                    />
                                </div>

                                {!isForgotPassword && (
                                    <>
                                        <div className="space-y-2">
                                            <label htmlFor="auth-password" className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Password</label>
                                            <div className="relative group/input">
                                                <input
                                                    ref={passwordRef}
                                                    id="auth-password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-white transition-all outline-none placeholder:text-white/10 pr-12"
                                                    placeholder="••••••••"
                                                    required={!isForgotPassword}
                                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                                    spellCheck="false"
                                                    autoCorrect="off"
                                                    autoCapitalize="off"
                                                    data-bwignore="true"
                                                    data-1p-ignore="true"
                                                    data-lpignore="true"
                                                    data-form-type="other"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/20 hover:text-white/60 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {showPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {isSignUp && (
                                            <div className="space-y-2">
                                                <label htmlFor="confirm-password" className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Confirm</label>
                                                <div className="relative group/input">
                                                    <input
                                                        ref={confirmPasswordRef}
                                                        id="confirm-password"
                                                        name="confirmPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:border-white transition-all outline-none placeholder:text-white/10 pr-12"
                                                        placeholder="••••••••"
                                                        required={isSignUp}
                                                        autoComplete="new-password"
                                                        spellCheck="false"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        data-bwignore="true"
                                                        data-1p-ignore="true"
                                                        data-lpignore="true"
                                                        data-form-type="other"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-red-400 font-mono text-[10px] uppercase tracking-widest text-center py-2"
                                    >
                                        // Error: {error}
                                    </motion.div>
                                )}

                                <button
                                    disabled={loading}
                                    className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {isForgotPassword ? 'Reset Codes' : isSignUp ? 'Submit Request' : 'Login'}
                                            <span className="material-symbols-outlined text-sm">{isForgotPassword ? 'key' : isSignUp ? 'send' : 'login'}</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-10 flex flex-col gap-6">
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            if (isForgotPassword) {
                                                setIsForgotPassword(false);
                                            } else {
                                                setIsSignUp(!isSignUp);
                                            }
                                            setError(null);
                                        }}
                                        className="text-[10px] font-black text-white/30 hover:text-white uppercase tracking-[0.3em] transition-all"
                                    >
                                        {isForgotPassword ? 'Back to Login' : isSignUp ? 'Already have an account? Login' : 'New user? Request Access'}
                                    </button>

                                    {!isSignUp && !isForgotPassword && (
                                        <button
                                            onClick={() => { setIsForgotPassword(true); setError(null); }}
                                            className="text-[10px] font-black text-emerald-500/40 hover:text-emerald-500 uppercase tracking-[0.3em] transition-all"
                                        >
                                            Forgot Security Codes?
                                        </button>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-white/5 opacity-40">
                                    <p className="text-[8px] font-mono text-center text-white/20 uppercase tracking-[0.5em]">
                                        Secure Link Established // RSA-4096
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default LoginModal;
