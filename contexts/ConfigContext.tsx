
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Config } from '../types';

interface ConfigContextType {
    config: Config | null;
    loading: boolean;
    error: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
    config: null,
    loading: true,
    error: null
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/config.json');
                if (!response.ok) {
                    throw new Error('Failed to load configuration');
                }
                const data = await response.json();
                setConfig(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                console.error('Error loading config:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading, error }}>
            {children}
        </ConfigContext.Provider>
    );
};
