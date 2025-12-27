
import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown: React.FC = () => {
  const { config, loading } = useConfig();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!config?.countdown?.enabled || !config?.countdown?.date) return;

    const calculateTimeLeft = () => {
      const targetDate = new Date(config.countdown.date);
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      let timeLeftObj = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeftObj = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };

        // Final 2 hours maintenance mode
        if (difference < (2 * 60 * 60 * 1000)) {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
        }
        setIsExpired(false);
      } else {
        setIsExpired(true);
        setIsMaintenance(false);
      }
      return timeLeftObj;
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  if (loading || !config || !config.countdown.enabled) return null;

  if (isExpired) {
    return (
      <section className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden border-green-500/30">
        <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none"></div>
        <div className="absolute top-0 w-full bg-green-500/10 py-1 text-center border-b border-green-500/20">
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-[0.3em]">Status Update</span>
        </div>

        <div className="flex flex-col items-center gap-4 z-10 text-center py-6">
          <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <span className="material-symbols-outlined text-3xl text-green-400">check_circle</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase drop-shadow-lg">
            {config.countdown.expiredMessage}
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className={`glass-card rounded-2xl p-8 flex flex-col items-center justify-center gap-8 relative overflow-hidden transition-all duration-500 ${isMaintenance ? 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-glass-border'}`}>
      {isMaintenance && (
        <div className="absolute top-0 w-full bg-red-500/10 py-1 text-center border-b border-red-500/20">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em] animate-pulse">Maintenance Mode Active</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none"></div>

      <div className="flex flex-col items-center gap-2 z-10 text-center">
        <h2 className="text-2xl font-bold text-white tracking-wide">
          {isMaintenance ? 'Server Maintenance Underway' : config.countdown.title}
        </h2>
        <p className="text-sm text-white/50 uppercase tracking-[0.2em]">{isMaintenance ? 'Preparing for launch sequence' : 'Don\'t miss the next major update'}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 z-10">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds, pulse: true }
        ].map((item, idx, arr) => (
          <React.Fragment key={item.label}>
            <div className="flex flex-col gap-2 items-center">
              <div className={`glass-card w-20 h-24 sm:w-24 sm:h-28 rounded-xl flex items-center justify-center border-t border-white/20 shadow-lg relative overflow-hidden transition-all ${item.pulse ? 'ring-1 ring-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`}>
                {item.pulse && <div className="absolute inset-0 bg-white/5 animate-pulse"></div>}
                <span className={`relative text-4xl sm:text-5xl font-bold text-white ${item.pulse ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}>
                  {formatNumber(item.value)}
                </span>
              </div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
            </div>
            {idx < arr.length - 1 && (
              <div className="h-24 sm:h-28 flex items-center text-white/20 text-4xl font-light pb-2 hidden sm:flex">:</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default Countdown;
