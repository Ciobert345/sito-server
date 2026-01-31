import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface MinigameProps {
    type: string;
    onComplete: (status: 'win' | 'loss' | 'quit', score?: number) => void;
}

// Componente animazione CRT shutdown (TV retrò) - VERSIONE POTENZIATA LENTA
const CRTShutdown: React.FC<{ isActive: boolean; children: React.ReactNode }> = ({ isActive, children }) => {
    return (
        <div className="relative overflow-hidden">
            {/* Contenuto principale con effetti di distorsione */}
            <motion.div
                animate={isActive ? {
                    filter: ['brightness(1)', 'brightness(1)', 'brightness(1.5)', 'brightness(3)', 'brightness(0)'],
                    opacity: [1, 1, 1, 0.6, 0]
                } : {}}
                transition={{ duration: 7, ease: 'easeInOut', delay: 0 }}
            >
                {children}
            </motion.div>

            <AnimatePresence>
                {isActive && (
                    <>
                        {/* Flash luminoso bianco intenso */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0, 0.6, 0.9, 1, 0] }}
                            transition={{
                                duration: 7,
                                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                ease: 'easeInOut',
                                delay: 0
                            }}
                            className="absolute inset-0 bg-white pointer-events-none"
                            style={{ mixBlendMode: 'screen' }}
                        />

                        {/* Effetto collasso orizzontale con glow */}
                        <motion.div
                            initial={{ scaleY: 1, scaleX: 1, opacity: 1 }}
                            animate={{
                                scaleY: [1, 1, 1, 0.5, 0.02, 0],
                                scaleX: [1, 1, 0.8, 0.3, 0.05, 0],
                                opacity: [1, 1, 1, 1, 0.5, 0],
                                filter: ['blur(0px)', 'blur(0px)', 'blur(1px)', 'blur(3px)', 'blur(6px)', 'blur(10px)']
                            }}
                            transition={{
                                duration: 7,
                                times: [0, 0.2, 0.4, 0.6, 0.85, 1],
                                ease: [0.6, 0, 0.4, 1],
                                delay: 0
                            }}
                            className="absolute inset-0 bg-gradient-to-b from-white via-cyan-300 to-white pointer-events-none"
                            style={{
                                transformOrigin: 'center center',
                                boxShadow: '0 0 100px 50px rgba(255,255,255,0.9), inset 0 0 100px rgba(255,255,255,0.5)'
                            }}
                        />

                        {/* Linea di scansione finale */}
                        <motion.div
                            initial={{ scaleY: 1, opacity: 0 }}
                            animate={{
                                scaleY: [1, 1, 1, 0.2, 0.02, 0.005, 0],
                                opacity: [0, 0, 1, 1, 1, 0.8, 0]
                            }}
                            transition={{
                                duration: 7,
                                times: [0, 0.4, 0.6, 0.75, 0.88, 0.95, 1],
                                ease: 'easeOut',
                                delay: 0
                            }}
                            className="absolute inset-0 bg-white pointer-events-none"
                            style={{
                                transformOrigin: 'center center',
                                boxShadow: '0 0 80px 40px rgba(0,255,255,1)'
                            }}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// Componente banner risultato partita - STILE TERMINALE
const ResultBanner: React.FC<{ result: 'win' | 'loss' | null; message?: string }> = ({ result, message }) => {
    if (!result) return null;

    const isWin = result === 'win';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed inset-0 flex items-start justify-center pt-[15vh] z-[9998] pointer-events-none"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            >
                <div className={`font-mono text-center ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                    {/* Box ASCII superiore */}
                    <div className="text-xs opacity-70">
                        ╔══════════════════════════════════════════╗
                    </div>
                    <div className="text-xs opacity-70">
                        ║{'                                          '}║
                    </div>

                    {/* Titolo principale */}
                    <motion.div
                        animate={{ opacity: [1, 0.6, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-2xl font-black tracking-widest my-2"
                    >
                        {isWin ? '[ MISSION COMPLETE ]' : '[ MISSION FAILED ]'}
                    </motion.div>

                    {/* Messaggio */}
                    {message && (
                        <div className="text-sm opacity-80 my-1">
                            {`>> ${message}`}
                        </div>
                    )}

                    {/* Status */}
                    <div className="text-xs opacity-60 my-2">
                        {isWin ? 'STATUS: SUCCESS | CODE: 0x00' : 'STATUS: TERMINATED | CODE: 0xFF'}
                    </div>

                    {/* Box ASCII inferiore */}
                    <div className="text-xs opacity-70">
                        ║{'                                          '}║
                    </div>
                    <div className="text-xs opacity-70">
                        ╚══════════════════════════════════════════╝
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};


// Componente barra caricamento missione - STILE TERMINALE
const MissionCompleteBar: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isActive) return;
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1.25; // 100% in 8 secondi (100/80 = 1.25 ogni 100ms)
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isActive]);

    if (!isActive) return null;

    // Genera barra ASCII
    const barLength = 30;
    const filled = Math.floor((progress / 100) * barLength);
    const empty = barLength - filled;
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="fixed top-[45vh] left-1/2 -translate-x-1/2 z-[10050] font-mono"
        >
            <div className="bg-black/95 border border-emerald-500/50 px-6 py-4 text-emerald-400">
                {/* Header */}
                <div className="text-xs opacity-60 mb-2">
                    ┌─────────────────────────────────────────────┐
                </div>

                {/* Titolo */}
                <motion.div
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-sm font-bold tracking-wider mb-2"
                >
                    {'>> SYNCING DATA TO MAINFRAME...'}
                </motion.div>

                {/* Progress bar */}
                <div className="text-sm mb-1">
                    [{progressBar}] {Math.floor(progress)}%
                </div>

                {/* Status line */}
                <div className="text-xs opacity-50">
                    {progress < 100 ? 'STATUS: UPLOADING...' : 'STATUS: COMPLETE'}
                </div>

                {/* Footer */}
                <div className="text-xs opacity-60 mt-2">
                    └─────────────────────────────────────────────┘
                </div>
            </div>
        </motion.div>
    );
};

const GameAbortController: React.FC<{ onAbort: () => void }> = ({ onAbort }) => {
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const isAbortingRef = useRef(false);
    const onAbortRef = useRef(onAbort);

    useEffect(() => {
        onAbortRef.current = onAbort;
    }, [onAbort]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (!startTimeRef.current && !isAbortingRef.current) {
                    startTimeRef.current = Date.now();
                    if (intervalRef.current) clearInterval(intervalRef.current);

                    intervalRef.current = setInterval(() => {
                        const elapsed = Date.now() - (startTimeRef.current || Date.now());
                        const newProgress = Math.min((elapsed / 3000) * 100, 100);
                        setProgress(newProgress);

                        if (newProgress >= 100) {
                            if (intervalRef.current) clearInterval(intervalRef.current);
                            isAbortingRef.current = true;
                            setProgress(100);

                            setTimeout(() => {
                                if (onAbortRef.current) onAbortRef.current();
                                startTimeRef.current = null;
                                setProgress(0);
                                isAbortingRef.current = false;
                            }, 500);
                        }
                    }, 50);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isAbortingRef.current) return;

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                startTimeRef.current = null;
                setProgress(0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    if (progress <= 0) return null;

    return (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none">
            <div className={`bg-red-950/90 border ${progress >= 100 ? 'border-red-500 bg-red-900/90' : 'border-red-500/50'} p-3 rounded font-mono text-xs text-red-400 transition-colors duration-300`}>
                <div className="flex justify-between mb-1">
                    <span className="font-bold">{progress >= 100 ? 'MISSION ABORTED' : 'ABORTING MISSION...'}</span>
                    <span>{Math.floor(progress)}%</span>
                </div>
                <div className="w-48 h-1.5 bg-red-900/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-red-500 transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className={`mt-1 text-[9px] text-red-500/70 text-center ${progress >= 100 ? 'invisible' : ''}`}>
                    HOLD [ESC] TO FORCE QUIT
                </div>
            </div>
        </div>
    );
};

export const TerminalMinigames: React.FC<MinigameProps> = ({ type, onComplete }) => {


    const renderGame = () => {
        switch (type) {
            case 'CHESS':
                return <ChessGame onComplete={onComplete} />;
            case 'MOLE':
                return <MoleHacker onComplete={onComplete} />;
            case 'INVADERS':
                return <SpaceVoid onComplete={onComplete} />;
            case 'CARDS':
                return <CyberJack onComplete={onComplete} />;
            default:
                return <div className="text-red-500">ERROR: Unknown process.</div>;
        }
    };

    return (
        <>
            {renderGame()}
            <GameAbortController onAbort={() => onComplete('loss')} />
        </>
    );
};

/**
 * MOLE_HACK: Type coordinates (A1-C3) to "hit" appearing moles.
 * Includes flickering ASCII art and fake error messages.
 */
const MoleHacker: React.FC<{ onComplete: (s: 'win' | 'loss' | 'quit') => void }> = ({ onComplete }) => {
    const [target, setTarget] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30); // Aumentato a 30 secondi per dare più tempo per 20 punti
    const [isFinished, setIsFinished] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [result, setResult] = useState<'win' | 'loss' | null>(null);
    const [lastHit, setLastHit] = useState<string | null>(null);
    const [cursor, setCursor] = useState({ r: 0, c: 0 });
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const spawnTimeRef = useRef<NodeJS.Timeout | null>(null);
    const { addXP } = useAuth();

    const coords = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
    const rows = ['A', 'B', 'C'];
    const cols = ['1', '2', '3'];
    const WIN_SCORE = 20; // Punti necessari per vincere

    // Timer separato che non dipende da score
    useEffect(() => {
        if (isFinished) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setIsFinished(true);
                    const gameResult = score >= WIN_SCORE ? 'win' : 'loss';
                    setResult(gameResult);
                    if (spawnTimeRef.current) clearInterval(spawnTimeRef.current);
                    if (timerRef.current) clearInterval(timerRef.current);
                    if (gameResult === 'win') {
                        addXP(250);
                        setTimeout(() => setIsClosing(true), 8000);
                        setTimeout(() => onComplete(gameResult), 10000);
                    } else {
                        setTimeout(() => onComplete(gameResult), 2000);
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isFinished, onComplete, score]);

    // Spawn dei target - dipende da score per la velocità
    useEffect(() => {
        if (isFinished) return;
        inputRef.current?.focus();

        // Spawn first target immediately
        if (!target) {
            setTarget(coords[Math.floor(Math.random() * coords.length)]);
        }

        // Dynamic speed: starts at 1200ms, decreases as score increases
        const speed = Math.max(400, 1200 - (score * 30));

        spawnTimeRef.current = setInterval(() => {
            if (isFinished) {
                if (spawnTimeRef.current) clearInterval(spawnTimeRef.current);
                return;
            }
            setTarget(coords[Math.floor(Math.random() * coords.length)]);
            setLastHit(null);
        }, speed);

        return () => {
            if (spawnTimeRef.current) {
                clearInterval(spawnTimeRef.current);
                spawnTimeRef.current = null;
            }
        };
    }, [isFinished, score, target]);

    // Controllo vittoria immediata quando si raggiungono 20 punti
    useEffect(() => {
        if (score >= WIN_SCORE && !isFinished) {
            setIsFinished(true);
            setResult('win');
            if (spawnTimeRef.current) clearInterval(spawnTimeRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            addXP(250);
            setTimeout(() => setIsClosing(true), 8000);
            setTimeout(() => onComplete('win'), 10000);
        }
    }, [score, isFinished, onComplete, addXP]);

    // Gestione tastiera
    useEffect(() => {
        if (isFinished) return;

        const handleKeys = (e: KeyboardEvent) => {
            if (isFinished) return;
            if (e.key === 'ArrowUp') setCursor(prev => ({ ...prev, r: Math.max(0, prev.r - 1) }));
            if (e.key === 'ArrowDown') setCursor(prev => ({ ...prev, r: Math.min(2, prev.r + 1) }));
            if (e.key === 'ArrowLeft') setCursor(prev => ({ ...prev, c: Math.max(0, prev.c - 1) }));
            if (e.key === 'ArrowRight') setCursor(prev => ({ ...prev, c: Math.min(2, prev.c + 1) }));
            if (e.key === 'Enter') {
                const currentCoord = `${rows[cursor.r]}${cols[cursor.c]}`;
                handleHit(currentCoord);
            }
        };

        window.addEventListener('keydown', handleKeys);
        return () => {
            window.removeEventListener('keydown', handleKeys);
        };
    }, [isFinished, cursor]);

    const handleHit = (coord: string) => {
        if (isFinished) return;

        if (coord === target) {
            setScore(s => s + 1);
            setLastHit(target);
            setTarget('');
        } else {
            // Penalità per colpire una casella vuota
            setScore(s => Math.max(0, s - 1));
            setLastHit(null);
        }
    };

    const renderGrid = () => {
        return (
            <div className="flex flex-col items-center gap-1 font-mono">
                <div className="flex gap-4 mb-1 text-[10px] text-emerald-500/30 pl-6">
                    <span>1</span><span>2</span><span>3</span>
                </div>
                {rows.map((row, rIdx) => (
                    <div key={row} className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-500/30 w-4">{row}</span>
                        {cols.map((col, cIdx) => {
                            const id = `${row}${col}`;
                            const isTarget = target === id;
                            const isHit = lastHit === id;
                            const isCursor = cursor.r === rIdx && cursor.c === cIdx;
                            return (
                                <div
                                    key={id}
                                    onClick={() => {
                                        setCursor({ r: rIdx, c: cIdx });
                                        handleHit(id);
                                    }}
                                    className={`size-10 border flex items-center justify-center transition-all duration-150 cursor-pointer
                                        ${isTarget ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-emerald-500/10'}
                                        ${isHit ? 'bg-white/20 border-white' : ''}
                                        ${isCursor ? 'ring-2 ring-emerald-400 ring-inset' : ''}
                                        hover:bg-white/5
                                    `}
                                >
                                    {isTarget ? (
                                        <span className="text-emerald-500 font-bold animate-pulse text-xs">ERR</span>
                                    ) : isHit ? (
                                        <span className="text-white font-bold text-xs">HIT</span>
                                    ) : (
                                        <span className="text-emerald-500/5 text-[8px]">{id}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <div className={`p-6 border ${isFinished ? 'border-white/5 opacity-50' : 'border-emerald-500/20 bg-emerald-500/8'} rounded-2xl space-y-6 relative`}>
                <ResultBanner result={result} message={result === 'win' ? `Score finale: ${score}/${WIN_SCORE}` : `Hai totalizzato solo ${score}/${WIN_SCORE} punti`} />
                <MissionCompleteBar isActive={result === 'win'} />

                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500/40">
                    <span>SCORE: {score}/{WIN_SCORE}</span>
                    <span className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : ''}>TIME: {timeLeft}s</span>
                </div>

                {renderGrid()}

                {!isFinished && (
                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                        <span className="text-emerald-500 font-black text-[10px] tracking-widest shrink-0">TERMINAL_IN:</span>
                        <input
                            ref={inputRef}
                            className="bg-transparent border-none outline-none text-emerald-500 w-full font-mono text-sm"
                            placeholder="CLICK, USE ARROWS + ENTER, OR TYPE"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleHit((e.target as HTMLInputElement).value.toUpperCase());
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

/**
 * CYBER_JACK: Quick Blackjack-lite with ASCII cards.
 */
const CyberJack: React.FC<{ onComplete: (s: 'win' | 'loss' | 'quit') => void }> = ({ onComplete }) => {
    const [playerHand, setPlayerHand] = useState<number[]>([]);
    const [dealerHand, setDealerHand] = useState<number[]>([]);
    const [gameState, setGameState] = useState<'deal' | 'playing' | 'result'>('deal');
    const [msg, setMsg] = useState('DEAL NEW HAND? [Y/N]');
    const [isClosing, setIsClosing] = useState(false);
    const [result, setResult] = useState<'win' | 'loss' | null>(null);
    const { addXP } = useAuth();

    const sum = (hand: number[]) => hand.reduce((a, b) => a + b, 0);

    const hit = () => {
        const card = Math.floor(Math.random() * 10) + 1;
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        if (sum(newHand) > 21) {
            setGameState('result');
            setMsg('BUST! OVERLOAD DETECTED.');
            setResult('loss');
            setTimeout(() => onComplete('loss'), 2000);
        }
    };

    const stand = () => {
        let dHand = [...dealerHand];
        while (sum(dHand) < 17) {
            dHand.push(Math.floor(Math.random() * 10) + 1);
        }
        setDealerHand(dHand);
        setGameState('result');
        const pSum = sum(playerHand);
        const dSum = sum(dHand);
        if (dSum > 21 || pSum > dSum) {
            setMsg('PROTOCOL_BYPASS_SUCCESS. YOU WIN.');
            setResult('win');
            addXP(250);
            setTimeout(() => setIsClosing(true), 8000);
            setTimeout(() => onComplete('win'), 10000); // 8s barra + 2s buffer
        } else {
            setMsg('SYSTEM_ACCESS_DENIED. DEALER WINS.');
            setResult('loss');
            setTimeout(() => onComplete('loss'), 2000);
        }
    };

    return (
        <>
            <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg space-y-4 font-mono relative">
                <ResultBanner result={result} message={result === 'win' ? 'Hai battuto il dealer!' : 'Il dealer ha vinto'} />
                <MissionCompleteBar isActive={result === 'win'} />

                <div className="text-xs text-blue-500/50">MODE: CYBER_JACK_CASINO</div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-[10px] text-white/30 lowercase">player_buffer: {sum(playerHand)}</div>
                        <div className="flex gap-2">
                            {playerHand.map((c, i) => <div key={i} className="px-2 py-4 border border-blue-500 text-blue-500 rounded text-center min-w-[30px]">{c}</div>)}
                        </div>
                    </div>
                    <div className="space-y-2 text-right">
                        <div className="text-[10px] text-white/30 lowercase">system_buffer: {gameState === 'result' ? sum(dealerHand) : '??'}</div>
                        <div className="flex gap-2 justify-end">
                            {dealerHand.map((c, i) => <div key={i} className="px-2 py-4 border border-white/10 text-white/20 rounded text-center min-w-[30px]">{gameState === 'result' ? c : '?'}</div>)}
                        </div>
                    </div>
                </div>

                <div className="text-center py-2 text-blue-400 font-bold">{msg}</div>

                {gameState === 'deal' && (
                    <div className="flex justify-center gap-4">
                        <button onClick={() => {
                            setPlayerHand([Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1]);
                            setDealerHand([Math.floor(Math.random() * 10) + 1]);
                            setGameState('playing');
                            setMsg('[H]IT OR [S]TAND?');
                        }} className="px-4 py-1 border border-blue-500 text-blue-500 hover:bg-blue-500/20 uppercase text-xs">Deal</button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="flex justify-center gap-4">
                        <button onClick={hit} className="px-4 py-1 border border-white/20 text-white/50 hover:bg-white/10 uppercase text-xs">Hit</button>
                        <button onClick={stand} className="px-4 py-1 border border-blue-500 text-blue-500 hover:bg-blue-500/20 uppercase text-xs">Stand</button>
                    </div>
                )}
            </div>
        </>
    );
};

/**
 * SPACE_VOID: Side-scroller ASCII game (left/right/shoot).
 */
const SpaceVoid: React.FC<{ onComplete: (s: 'win' | 'loss' | 'quit') => void }> = ({ onComplete }) => {
    const [pos, setPos] = useState(10);
    const [bullets, setBullets] = useState<{ x: number, y: number }[]>([]);
    const [enemies, setEnemies] = useState<{ x: number, y: number }[]>([]);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [result, setResult] = useState<'win' | 'loss' | null>(null);
    const { addXP } = useAuth();

    useEffect(() => {
        if (isFinished) return;
        const moveEnemies = setInterval(() => {
            setEnemies(prev => {
                const updated = prev.map(e => ({ ...e, y: e.y + 1 })).filter(e => e.y < 12);
                if (Math.random() > 0.7) updated.push({ x: Math.floor(Math.random() * 20), y: 0 });
                return updated;
            });
        }, 300);

        const moveBullets = setInterval(() => {
            setBullets(prev => prev.map(b => ({ ...b, y: b.y - 1 })).filter(b => b.y > -1));
        }, 100);

        return () => { clearInterval(moveEnemies); clearInterval(moveBullets); };
    }, [isFinished]);

    useEffect(() => {
        if (isFinished) return;
        // Collision detection
        enemies.forEach(e => {
            bullets.forEach(b => {
                if (e.x === b.x && e.y === b.y) {
                    setScore(s => s + 1);
                    setEnemies(prev => prev.filter(en => en !== e));
                }
            });
            if (e.y === 11 && e.x === pos) {
                setIsFinished(true);
                setResult('loss');
                setTimeout(() => onComplete('loss'), 2000);
            }
        });
        if (score >= 10) {
            setIsFinished(true);
            setResult('win');
            addXP(500); // Space Void is harder
            setTimeout(() => setIsClosing(true), 8000);
            setTimeout(() => onComplete('win'), 10000); // 8s barra + 2s buffer
        }
    }, [enemies, bullets, pos, score, onComplete, isFinished]);

    useEffect(() => {
        if (isFinished) return;
        const handleKeys = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') setPos(p => Math.max(0, p - 1));
            if (e.key === 'ArrowRight') setPos(p => Math.min(19, p + 1));
            if (e.key === ' ' || e.key === 'Control') setBullets(prev => [...prev, { x: pos, y: 10 }]);
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [pos, isFinished]);

    const renderFrame = () => {
        let lines = Array.from({ length: 12 }, () => ' '.repeat(20).split(''));
        enemies.forEach(e => { if (lines[e.y] && lines[e.y][e.x] !== undefined) lines[e.y][e.x] = 'X'; });
        bullets.forEach(b => { if (lines[b.y] && lines[b.y][b.x] !== undefined) lines[b.y][b.x] = '|'; });
        if (lines[11] && lines[11][pos] !== undefined) lines[11][pos] = '^';
        return lines.map(l => l.join('')).join('\n');
    };

    return (
        <>
            <div className={`p-4 border ${isFinished ? 'border-white/5 opacity-50' : 'border-red-500/20 bg-red-500/5'} rounded font-mono text-center relative`}>
                <ResultBanner result={result} message={result === 'win' ? 'Tutti i nemici distrutti!' : 'Sei stato colpito!'} />
                <MissionCompleteBar isActive={result === 'win'} />

                <div className="text-[10px] text-red-500/50 mb-2">SECTOR: SPACE_VOID | SCORE: {score}/10</div>
                <pre className="text-red-500 leading-none bg-black/40 p-2 inline-block rounded">{renderFrame()}</pre>
                <div className="text-[9px] text-red-500/30 mt-2">LEFT/RIGHT TO MOVE | SPACE TO FIRE</div>
            </div>
        </>
    );
};

const ChessGame: React.FC<{ onComplete: (s: 'win' | 'loss' | 'quit') => void }> = ({ onComplete }) => {
    const [state, setState] = useState({
        board: [
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
        ],
        turn: 'user' as 'user' | 'ai',
        history: ['[SYSTEM]: DEEP_BLUE_V5 initialized. White to move.'],
        isFinished: false,
        result: null as 'win' | 'loss' | 'draw' | null,
        selected: null as { y: number, x: number } | null,
        cursor: { y: 7, x: 4 },
        castlingRights: {
            white: { K: true, Q: true },
            black: { k: true, q: true }
        },
        enPassantTarget: null as { y: number, x: number } | null,
        promotionPending: null as { from: { y: number, x: number }, to: { y: number, x: number } } | null
    });

    const [isClosing, setIsClosing] = useState(false);
    const { addXP } = useAuth();
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [state.history]);

    // --- CHESS LOGIC UTILS ---
    const isWhite = (piece: string) => piece === piece.toLowerCase() && piece !== '.';

    // Simulate move helper
    const simulateMove = (board: string[][], from: { y: number, x: number }, to: { y: number, x: number }) => {
        const newBoard = board.map(row => [...row]);
        newBoard[to.y][to.x] = newBoard[from.y][from.x];
        newBoard[from.y][from.x] = '.';
        return newBoard;
    };

    // Attack detection
    const isSquareAttacked = (board: string[][], y: number, x: number, byWhite: boolean) => {
        if (byWhite) { // Attacked by White Pawn?
            if (y + 1 <= 7 && x - 1 >= 0 && board[y + 1][x - 1] === 'p') return true;
            if (y + 1 <= 7 && x + 1 <= 7 && board[y + 1][x + 1] === 'p') return true;
        } else { // Attacked by Black Pawn?
            if (y - 1 >= 0 && x - 1 >= 0 && board[y - 1][x - 1] === 'P') return true;
            if (y - 1 >= 0 && x + 1 <= 7 && board[y - 1][x + 1] === 'P') return true;
        }
        // Knights
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for (const [dy, dx] of knightMoves) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny <= 7 && nx >= 0 && nx <= 7) {
                const p = board[ny][nx];
                if ((byWhite && p === 'n') || (!byWhite && p === 'N')) return true;
            }
        }
        // Sliders (Rook, Bishop, Queen)
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dy, dx] of dirs) {
            for (let i = 1; i < 8; i++) {
                const ny = y + dy * i, nx = x + dx * i;
                if (ny < 0 || ny > 7 || nx < 0 || nx > 7) break;
                const p = board[ny][nx];
                if (p === '.') continue;
                const isDiagonal = Math.abs(dy) === Math.abs(dx);
                // White attackers
                if (byWhite) {
                    if (isDiagonal && (p === 'b' || p === 'q')) return true;
                    if (!isDiagonal && (p === 'r' || p === 'q')) return true;
                } else {
                    if (isDiagonal && (p === 'B' || p === 'Q')) return true;
                    if (!isDiagonal && (p === 'R' || p === 'Q')) return true;
                }
                break;
            }
        }
        // Kings
        const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        for (const [dy, dx] of kingMoves) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny <= 7 && nx >= 0 && nx <= 7) {
                const p = board[ny][nx];
                if ((byWhite && p === 'k') || (!byWhite && p === 'K')) return true;
            }
        }
        return false;
    };

    const isInCheck = (board: string[][], whiteKing: boolean) => {
        let ky = -1, kx = -1;
        board.forEach((row, r) => row.forEach((p, c) => {
            if (p === (whiteKing ? 'k' : 'K')) { ky = r; kx = c; }
        }));
        if (ky === -1) return true;
        return isSquareAttacked(board, ky, kx, !whiteKing);
    };

    const getPseudolegalMoves = (board: string[][], r: number, c: number, castlingRights: any, enPassantTarget: any) => {
        const piece = board[r][c];
        if (piece === '.') return [];
        const moves: { y: number, x: number, special?: string }[] = [];
        const white = isWhite(piece);
        const type = piece.toLowerCase();

        const addMove = (y: number, x: number, special?: string) => {
            if (y >= 0 && y <= 7 && x >= 0 && x <= 7) {
                const target = board[y][x];
                if (target === '.' || (white !== isWhite(target))) {
                    moves.push({ y, x, special });
                }
            }
        };

        if (type === 'p') {
            const dir = white ? -1 : 1;
            const startRank = white ? 6 : 1;
            if (board[r + dir] && board[r + dir][c] === '.') {
                addMove(r + dir, c, r + dir === (white ? 0 : 7) ? 'promotion' : undefined);
                if (r === startRank && board[r + 2 * dir] && board[r + 2 * dir][c] === '.') {
                    addMove(r + 2 * dir, c, 'double-pawn');
                }
            }
            [-1, 1].forEach(dc => {
                const tr = r + dir, tc = c + dc;
                if (tr >= 0 && tr <= 7 && tc >= 0 && tc <= 7) {
                    const target = board[tr][tc];
                    if (target !== '.' && white !== isWhite(target)) {
                        addMove(tr, tc, tr === (white ? 0 : 7) ? 'promotion' : undefined);
                    }
                    if (enPassantTarget && enPassantTarget.y === tr && enPassantTarget.x === tc) {
                        addMove(tr, tc, 'en-passant');
                    }
                }
            });
        } else if (type === 'n') {
            [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => addMove(r + dr, c + dc));
        } else if (type === 'k') {
            [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => addMove(r + dr, c + dc));
            // Castling
            if (white) {
                if (castlingRights.white.K && board[7][5] === '.' && board[7][6] === '.' && !isSquareAttacked(board, 7, 4, false) && !isSquareAttacked(board, 7, 5, false) && !isSquareAttacked(board, 7, 6, false)) moves.push({ y: 7, x: 6, special: 'castle-short' });
                if (castlingRights.white.Q && board[7][1] === '.' && board[7][2] === '.' && board[7][3] === '.' && !isSquareAttacked(board, 7, 4, false) && !isSquareAttacked(board, 7, 3, false) && !isSquareAttacked(board, 7, 2, false)) moves.push({ y: 7, x: 2, special: 'castle-long' });
            } else {
                if (castlingRights.black.k && board[0][5] === '.' && board[0][6] === '.' && !isSquareAttacked(board, 0, 4, true) && !isSquareAttacked(board, 0, 5, true) && !isSquareAttacked(board, 0, 6, true)) moves.push({ y: 0, x: 6, special: 'castle-short' });
                if (castlingRights.black.q && board[0][1] === '.' && board[0][2] === '.' && board[0][3] === '.' && !isSquareAttacked(board, 0, 4, true) && !isSquareAttacked(board, 0, 3, true) && !isSquareAttacked(board, 0, 2, true)) moves.push({ y: 0, x: 2, special: 'castle-long' });
            }
        } else {
            // Sliders
            const dirs = type === 'r' ? [[0, 1], [0, -1], [1, 0], [-1, 0]] : type === 'b' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
            dirs.forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const nr = r + dr * i, nc = c + dc * i;
                    if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
                    const target = board[nr][nc];
                    addMove(nr, nc);
                    if (target !== '.') break;
                }
            });
        }
        return moves;
    };

    const getLegalMoves = (board: string[][], r: number, c: number, castlingRights: any, enPassantTarget: any) => {
        const moves = getPseudolegalMoves(board, r, c, castlingRights, enPassantTarget);
        const white = isWhite(board[r][c]);
        return moves.filter(m => {
            let nextBoard = simulateMove(board, { y: r, x: c }, { y: m.y, x: m.x });
            if (m.special === 'en-passant') nextBoard[r][m.x] = '.';
            return !isInCheck(nextBoard, white);
        });
    };

    const hasAnyLegalMoves = (board: string[][], whiteTurn: boolean, castlingRights: any, enPassantTarget: any) => {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p !== '.' && isWhite(p) === whiteTurn) {
                    if (getLegalMoves(board, r, c, castlingRights, enPassantTarget).length > 0) return true;
                }
            }
        }
        return false;
    };

    const makeMove = (targetY: number, targetX: number, fromOverride?: { y: number, x: number }) => {
        const from = fromOverride || state.selected;
        if (!from || state.isFinished) return;

        const piece = state.board[from.y][from.x];
        const isUserTurn = state.turn === 'user';

        // Validate IF user
        const legalMoves = getLegalMoves(state.board, from.y, from.x, state.castlingRights, state.enPassantTarget);
        const move = legalMoves.find(m => m.y === targetY && m.x === targetX);

        if (!move && !fromOverride) {
            setState(prev => ({ ...prev, selected: null }));
            return;
        }

        const special = move?.special;

        // PROMOTION INTERCEPTION: If user moves Pawn to end, STOP and ask.
        if (special === 'promotion' && isUserTurn) {
            setState(prev => ({ ...prev, promotionPending: { from, to: { y: targetY, x: targetX } } }));
            return;
        }

        executeMoveLogic(from, { y: targetY, x: targetX }, special || '', piece, isUserTurn ? 'q' : 'Q'); // Default auto-queen for AI or non-promotion
    };

    const executeMoveLogic = (from: { y: number, x: number }, to: { y: number, x: number }, special: string, piece: string, promoteTo: string) => {
        const newBoard = state.board.map(row => [...row]);
        let newEnPassant = null;
        const newCastling = JSON.parse(JSON.stringify(state.castlingRights));
        const isUserTurn = state.turn === 'user';

        // EXECUTE
        newBoard[to.y][to.x] = piece;
        newBoard[from.y][from.x] = '.';

        // HANDLERS
        if (special === 'en-passant') newBoard[from.y][to.x] = '.';
        if (special === 'double-pawn') newEnPassant = { y: (from.y + to.y) / 2, x: to.x };
        if (special === 'promotion') newBoard[to.y][to.x] = promoteTo;

        if (special === 'castle-short') {
            const row = isUserTurn ? 7 : 0;
            if (newBoard[row][7].toLowerCase() === 'r') { newBoard[row][5] = newBoard[row][7]; newBoard[row][7] = '.'; }
        }
        if (special === 'castle-long') {
            const row = isUserTurn ? 7 : 0;
            if (newBoard[row][0].toLowerCase() === 'r') { newBoard[row][3] = newBoard[row][0]; newBoard[row][0] = '.'; }
        }

        // Rights Update
        if (piece === 'k') { newCastling.white.K = false; newCastling.white.Q = false; }
        if (piece === 'K') { newCastling.black.k = false; newCastling.black.q = false; }
        if (piece === 'r' && from.x === 0) newCastling.white.Q = false;
        if (piece === 'r' && from.x === 7) newCastling.white.K = false;
        if (piece === 'R' && from.x === 0) newCastling.black.q = false;
        if (piece === 'R' && from.x === 7) newCastling.black.k = false;

        // End Check
        const nextTurnWhite = !isUserTurn; // If user moved, next is AI (black, false)
        const nextHasMoves = hasAnyLegalMoves(newBoard, nextTurnWhite, newCastling, newEnPassant);
        const kingInCheck = isInCheck(newBoard, nextTurnWhite);

        let finished = false;
        let result: 'win' | 'loss' | 'draw' | null = null;
        let msg = '';

        if (!nextHasMoves) {
            finished = true;
            if (kingInCheck) {
                result = isUserTurn ? 'win' : 'loss';
                msg = result === 'win' ? 'CHECKMATE. YOU WIN.' : 'CHECKMATE. SYSTEM WINS.';
            } else {
                result = 'draw';
                msg = 'STALEMATE. GAME DRAWN.';
            }
        }

        const notation = `${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][from.x]}${8 - from.y} -> ${['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][to.x]}${8 - to.y}`;

        setState(prev => ({
            ...prev,
            board: newBoard,
            turn: prev.turn === 'user' ? 'ai' : 'user',
            selected: null,
            enPassantTarget: newEnPassant,
            castlingRights: newCastling,
            history: [...prev.history, `[MOVE]: ${notation}${finished ? (result === 'draw' ? ' (1/2-1/2)' : '#') : ''}`],
            isFinished: finished,
            result: result,
            promotionPending: null
        }));

        if (finished) handleEndInfo(result, msg);
    };

    const handlePromotionSelect = (type: string) => {
        if (!state.promotionPending) return;
        const { from, to } = state.promotionPending;
        executeMoveLogic(from, to, 'promotion', 'p', type);
    };

    const handleEndInfo = (res: any, msg: string) => {
        if (res === 'win') addXP(500);
        if (res === 'draw') addXP(100);
        setTimeout(() => setState(p => ({ ...p, history: [...p.history, `[GAME OVER]: ${msg}`] })), 500);
        if (res === 'win') {
            setTimeout(() => setIsClosing(true), 8000);
            setTimeout(() => onComplete('win'), 10000);
        } else if (res === 'draw') {
            setTimeout(() => setIsClosing(true), 8000);
            setTimeout(() => onComplete('win'), 10000);
        } else {
            setTimeout(() => onComplete(res || 'quit'), 2000);
        }
    };

    // AI Logic
    useEffect(() => {
        if (state.turn === 'ai' && !state.isFinished) {
            const timeout = setTimeout(() => {
                const moves = getAllAllLegalMoves(state.board, false, state.castlingRights, state.enPassantTarget);
                if (moves.length > 0) {
                    const captureMoves = moves.filter(m => state.board[m.to.y][m.to.x] !== '.');
                    const move = captureMoves.length > 0
                        ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
                        : moves[Math.floor(Math.random() * moves.length)];
                    makeMove(move.to.y, move.to.x, move.from);
                } else {
                    console.log('AI HAS NO MOVES BUT GAME NOT FLAGGED?');
                }
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [state.turn, state.isFinished]);

    const getAllAllLegalMoves = (board: string[][], white: boolean, castling: any, ep: any) => {
        const allMoves: { from: { y: number, x: number }, to: { y: number, x: number } }[] = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] !== '.' && isWhite(board[r][c]) === white) {
                    const legs = getLegalMoves(board, r, c, castling, ep);
                    legs.forEach(m => allMoves.push({ from: { y: r, x: c }, to: { y: m.y, x: m.x } }));
                }
            }
        }
        return allMoves;
    };

    const handleDrawOffer = () => {
        if (state.isFinished) return;
        let score = 0;
        const vals: any = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        state.board.flat().forEach(p => { if (p !== '.') { const val = vals[p.toLowerCase()] || 0; score += isWhite(p) ? val : -val; } });
        if (score > 3 || Math.random() > 0.8) {
            setState(p => ({ ...p, isFinished: true, result: 'draw', history: [...p.history, '[DRAW]: Proposal ACCEPTED.'] }));
            handleEndInfo('draw', 'AGREED DRAW');
        } else {
            setState(p => ({ ...p, history: [...p.history, '[DRAW]: Proposal DECLINED.'] }));
        }
    };

    const handleAction = (y: number, x: number) => {
        if (state.isFinished || state.turn === 'ai' || state.promotionPending) return;
        const p = state.board[y][x];
        const isU = p !== '.' && isWhite(p);

        if (state.selected) {
            if (state.selected.y === y && state.selected.x === x) { setState(prev => ({ ...prev, selected: null, cursor: { y, x } })); return; }
            const legalMoves = getLegalMoves(state.board, state.selected.y, state.selected.x, state.castlingRights, state.enPassantTarget);
            if (legalMoves.some(m => m.y === y && m.x === x)) { makeMove(y, x); }
            else if (isU) { setState(prev => ({ ...prev, selected: { y, x }, cursor: { y, x } })); }
            else { setState(prev => ({ ...prev, selected: null, cursor: { y, x } })); }
        } else if (isU) {
            setState(prev => ({ ...prev, selected: { y, x }, cursor: { y, x } }));
        } else {
            setState(prev => ({ ...prev, cursor: { y, x } }));
        }
    };

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (state.isFinished || state.turn === 'ai' || state.promotionPending) return;
            const { y, x } = state.cursor;
            let ny = y, nx = x;
            if (e.key === 'ArrowUp') ny = Math.max(0, y - 1);
            else if (e.key === 'ArrowDown') ny = Math.min(7, y + 1);
            else if (e.key === 'ArrowLeft') nx = Math.max(0, x - 1);
            else if (e.key === 'ArrowRight') nx = Math.min(7, x + 1);
            else if (e.key === 'Enter') handleAction(ny, nx);
            if (ny !== y || nx !== x) setState(prev => ({ ...prev, cursor: { y: ny, x: nx } }));
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [state.cursor, state.isFinished, state.turn, state.board, state.selected, state.promotionPending]);

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl h-full p-4 items-center justify-center font-mono">
            {state.isFinished && (
                <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center pointer-events-none">
                    <ResultBanner result={state.result === 'draw' ? 'win' : state.result as any} message={state.result === 'win' ? 'CHECKMATE: YOU WIN' : state.result === 'loss' ? 'CHECKMATE: SYSTEM WINS' : 'GAME DRAWN'} />
                </div>
            )}
            <MissionCompleteBar isActive={state.result === 'win' || state.result === 'draw'} />

            {/* PROMOTION MODAL */}
            {state.promotionPending && (
                <div className="absolute inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="text-xl text-emerald-400 font-bold mb-6 tracking-widest">[ PAWN PROMOTION ]</div>
                    <div className="flex gap-4">
                        {[
                            { id: 'q', label: 'QUEEN', icon: '♛' },
                            { id: 'r', label: 'ROOK', icon: '♜' },
                            { id: 'b', label: 'BISHOP', icon: '♝' },
                            { id: 'n', label: 'KNIGHT', icon: '♞' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => handlePromotionSelect(opt.id)}
                                className="size-24 border-2 border-emerald-500/30 bg-emerald-900/20 hover:bg-emerald-500/20 hover:scale-110 hover:border-emerald-400 transition-all rounded-xl flex flex-col items-center justify-center gap-2 group"
                            >
                                <span className="text-4xl text-emerald-300 group-hover:text-emerald-100 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">{opt.icon}</span>
                                <span className="text-[10px] text-emerald-500/70 group-hover:text-emerald-400 uppercase tracking-widest">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 text-xs text-emerald-500/40 animate-pulse">Select tactical upgrade...</div>
                </div>
            )}

            <div className="flex flex-col gap-2 items-center">
                <div className="relative w-[clamp(150px,44vmin,420px)] aspect-square grid grid-cols-8 gap-px border-4 border-emerald-900/50 bg-black p-1 shadow-2xl">
                    {state.board.map((row, r) => row.map((piece, c) => {
                        const isSelected = state.selected?.y === r && state.selected?.x === c;
                        const moves = state.selected ? getLegalMoves(state.board, state.selected.y, state.selected.x, state.castlingRights, state.enPassantTarget) : [];
                        const validMove = moves.find(m => m.y === r && m.x === c);
                        const isDark = (r + c) % 2 === 1;
                        const displayPiece = piece === '.' ? '' : piece === 'p' ? '♟' : piece === 'r' ? '♜' : piece === 'n' ? '♞' : piece === 'b' ? '♝' : piece === 'q' ? '♛' : piece === 'k' ? '♚' : piece === 'P' ? '♙' : piece === 'R' ? '♖' : piece === 'N' ? '♘' : piece === 'B' ? '♗' : piece === 'Q' ? '♕' : '♔';

                        return (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => handleAction(r, c)}
                                className={`w-full h-full aspect-square flex items-center justify-center cursor-pointer select-none transition-colors relative text-[clamp(11px,2.6vmin,17px)]
                                    ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-900/40'}
                                    ${isSelected ? '!bg-emerald-500/50 ring-2 ring-white z-10' : ''}
                                    ${state.cursor.y === r && state.cursor.x === c ? 'ring-1 ring-white/50' : ''}
                                    hover:bg-emerald-500/30
                                `}
                            >
                                {validMove && (<div className={`absolute rounded-full ${piece !== '.' ? 'inset-0 border-4 border-red-500/50' : 'size-3 bg-emerald-400/40'}`} />)}
                                <span className={`${isWhite(piece) ? 'text-emerald-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'text-emerald-700'} relative z-0`}>{displayPiece}</span>
                            </div>
                        );
                    }))}
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-500/50 px-1">
                    <span>STATUS: {state.turn === 'user' ? 'AWAITING_INPUT' : 'CALCULATING...'}</span>
                    <button onClick={handleDrawOffer} className="hover:text-white hover:bg-white/10 px-2 rounded border border-transparent hover:border-white/20 transition-all uppercase" disabled={state.isFinished || state.turn !== 'user'}> [ PROPOSE DRAW ] </button>
                </div>
            </div>

            <div className="w-full md:w-64 h-48 md:h-auto md:aspect-square bg-black/40 border border-emerald-500/20 rounded-xl p-3 overflow-hidden flex flex-col shadow-lg">
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2 shrink-0">session_log:</div>
                <div ref={logRef} className="flex-grow overflow-y-auto text-[11px] space-y-1.5 pr-2 custom-terminal-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                    {state.history.map((line, i) => (
                        <div key={i} className={`break-words leading-tight ${line.includes('SYSTEM') ? 'text-yellow-500/80' : line.includes('MOVE') ? 'text-emerald-500/60' : 'text-emerald-400/80'}`}>
                            <span className="text-white/10 mr-2 text-[9px]">{(i + 1).toString().padStart(2, '0')}</span>{line}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
