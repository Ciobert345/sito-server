
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabase';
import { MCSSService } from '../services/mcss';
import { useConfig } from './ConfigContext';

// Control verbosity of Auth/Intel logs
const DEBUG_AUTH = false;

const debugLog = (...args: any[]) => {
    if (DEBUG_AUTH) console.log('[AuthContext]', ...args);
};

export type AuthLoadStatus = 'IDLE' | 'SESSION' | 'SYNCING' | 'RETRY' | 'TIMEOUT' | 'READY' | 'ERROR';

interface UserProfile {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
    isApproved: boolean;
    avatar_url: string | null;
    mcss_config_id: string | null;
    read_banner_ids: string[];
    clearance_level: number;
    experience_points: number;
    permissions: {
        terminal?: boolean;
        intel?: boolean;
        dashboard?: boolean;
    };
}

interface AuthContextType {
    user: UserProfile | null;
    mcssKey: string | null;
    mcssService: MCSSService | null;
    loading: boolean;
    authStatus: AuthLoadStatus;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, username: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: { username?: string, avatar_url?: string | null }) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    uploadAvatar: (file: File) => Promise<string>;
    verifyPassword: (password: string) => Promise<boolean>;
    markBannerAsRead: (bannerId: string) => Promise<void>;
    markAllBannersAsRead: (bannerIds: string[]) => Promise<void>;
    addXP: (amount: number) => Promise<void>;
    unlockIntel: (intelId: string) => Promise<void>;
    attemptUnlockWithCode: (code: string) => Promise<{ success: boolean; message: string }>;
    unlockedIntelIds: string[];
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [mcssKey, setMcssKey] = useState<string | null>(null);
    const [mcssService, setMcssService] = useState<MCSSService | null>(null);
    const [loading, setLoading] = useState(true);
    const [authStatus, setAuthStatus] = useState<AuthLoadStatus>('IDLE');
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [unlockedIntelIds, setUnlockedIntelIds] = useState<string[]>([]);

    const { config } = useConfig();
    const isMounted = useRef(true);
    const updateInProgress = useRef(false);
    const hasFinishedInitialLoad = useRef(false);

    debugLog(`Rendering AuthProvider - Status: ${authStatus}, Loading: ${loading}`);

    useEffect(() => {
        if (!isMounted.current) return;
        if (user?.isApproved && mcssKey && config?.mcss?.defaultBaseUrl) {
            setMcssService(new MCSSService(mcssKey, config.mcss.defaultBaseUrl));
        } else {
            setMcssService(null);
        }
    }, [mcssKey, config?.mcss?.defaultBaseUrl, user?.isApproved]);

    const finishLoading = (status: AuthLoadStatus = 'READY') => {
        if (!isMounted.current) return;

        setAuthStatus(status);
        setLoading(false);

        if (!hasFinishedInitialLoad.current) {
            hasFinishedInitialLoad.current = true;
            debugLog(`Initial load finished via ${status}`);
        } else {
            debugLog(`Status updated to ${status}`);
        }
    };

    const syncUser = async (userId: string, email: string, metadata: any) => {
        if (updateInProgress.current) return;
        updateInProgress.current = true;

        try {
            setAuthStatus('SYNCING');
            debugLog(`Syncing profile: ${email}`);
            const [profileResult, unlocksResult] = await Promise.all([
                supabase.from('profiles').select('*, mcss_config:mcss_configs!mcss_config_id(mcss_api_key)').eq('id', userId).single(),
                supabase.from('user_unlocks').select('intel_id').eq('user_id', userId)
            ]);

            if (!isMounted.current) return;

            const profile = profileResult.data;

            const currentUnlocks = unlocksResult.data ? unlocksResult.data.map((u: any) => u.intel_id) : [];
            setUnlockedIntelIds(currentUnlocks);

            if (profile) {
                setUser({
                    id: userId, email: email || '', username: profile.username || metadata?.username || 'User',
                    isApproved: profile.is_approved, isAdmin: profile.is_admin, avatar_url: profile.avatar_url,
                    mcss_config_id: profile.mcss_config_id, read_banner_ids: profile.read_banner_ids || [],
                    clearance_level: profile.clearance_level || 1, experience_points: profile.experience_points || 0,
                    permissions: profile.permissions || {}
                });

                const mcssConfig = Array.isArray(profile.mcss_config) ? profile.mcss_config[0] : profile.mcss_config;
                setMcssKey(mcssConfig?.mcss_api_key || null);
            }
        } catch (err) {
            console.error('[AuthContext] Sync Error:', err);
        } finally {
            updateInProgress.current = false;
            finishLoading('READY');
        }
    };

    useEffect(() => {
        isMounted.current = true;
        const safetyTimeout = setTimeout(() => {
            if (!hasFinishedInitialLoad.current) {
                // console.warn('⚠ AUTH: Safety timeout triggered');
                finishLoading('TIMEOUT');
            }
        }, 6000);

        const initAuth = async () => {
            try {
                setAuthStatus('SESSION');
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && isMounted.current) {
                    await syncUser(session.user.id, session.user.email || '', session.user.user_metadata);
                } else {
                    finishLoading('READY');
                }
            } catch (err) {
                finishLoading('ERROR');
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted.current) return;
            if (event === 'SIGNED_IN' && session?.user) {
                syncUser(session.user.id, session.user.email || '', session.user.user_metadata);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setMcssKey(null);
                finishLoading('READY');
            }
        });

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const login = async (e: string, p: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email: e, password: p });
            if (error) {
                setLoading(false);
                throw error;
            }
            // SUCCESS: We don't call setLoading(false) here. 
            // syncUser (triggered by onAuthStateChange) will call finishLoading()
        } catch (err) {
            setLoading(false);
            throw err;
        }
    };
    const signup = async (e: string, p: string, u: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({ email: e, password: p, options: { data: { username: u } } });
            if (error) {
                setLoading(false);
                throw error;
            }
        } catch (err) {
            setLoading(false);
            throw err;
        }
    };
    const logout = async () => { setLoading(true); try { await supabase.auth.signOut(); setUser(null); setMcssKey(null); } finally { setLoading(false); } };
    const updateProfile = async (u: any) => { if (!user) return; await supabase.from('profiles').update(u).eq('id', user.id); setUser({ ...user, ...u }); };
    const updatePassword = async (p: string) => { await supabase.auth.updateUser({ password: p }); };
    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/#/reset-password`,
        });
        if (error) throw error;
    };
    const uploadAvatar = async (f: File) => { if (!user) throw new Error('NA'); const ext = f.name.split('.').pop(); const path = `${user.id}/${Math.random()}.${ext}`; await supabase.storage.from('avatars').upload(path, f); const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path); await updateProfile({ avatar_url: publicUrl }); return publicUrl; };
    const verifyPassword = async (p: string) => { if (!user?.email) return false; return !(await supabase.auth.signInWithPassword({ email: user.email, password: p })).error; };
    const markBannerAsRead = async (b: string) => { if (!user) return; const n = [...user.read_banner_ids, b]; await updateProfile({ read_banner_ids: n }); };
    const markAllBannersAsRead = async (b: string[]) => { if (!user) return; await updateProfile({ read_banner_ids: b }); };
    const addXP = async (a: number) => { if (!user) return; await updateProfile({ experience_points: user.experience_points + a }); };
    const unlockIntel = async (i: string) => { if (!user) return; if (!(await supabase.from('user_unlocks').insert({ user_id: user.id, intel_id: i })).error) setUnlockedIntelIds(p => [...p, i]); };
    const attemptUnlockWithCode = async (c: string) => { const { data } = await supabase.from('intel_assets').select('id, name').eq('unlock_code', c).single(); if (!data) return { success: false, message: 'Invalid code' }; if (unlockedIntelIds.includes(data.id)) return { success: true, message: 'Already granted' }; await unlockIntel(data.id); return { success: true, message: `Access granted: ${data.name}` }; };

    return (
        <AuthContext.Provider value={{
            user, mcssKey, mcssService, loading, authStatus, login, signup, logout,
            updateProfile, updatePassword, resetPassword, uploadAvatar, verifyPassword,
            markBannerAsRead, markAllBannersAsRead, addXP, unlockIntel,
            attemptUnlockWithCode, unlockedIntelIds, isAuthModalOpen, setAuthModalOpen
        }}>
            {children}
        </AuthContext.Provider>
    );
};
