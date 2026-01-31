
import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  onExpire?: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ onExpire }) => {
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

        if (difference < (3 * 60 * 60 * 1000)) {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
        }
        setIsExpired(false);
      } else {
        setIsExpired(true);
        setIsMaintenance(false);
        if (onExpire) onExpire();
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

  if (isExpired) return null;

  return (
    <section className={`w-full flex flex-col items-center gap-5 relative transition-all duration-1000`}>
      {/* Integrated Technical Status Header */}
      <div className={`flex flex-col md:flex-row items-center justify-between w-full max-w-4xl px-4 py-2 border-y transition-all duration-700 gap-2 md:gap-0 ${isMaintenance ? 'border-red-500/20 bg-red-500/5' : 'border-white/[0.02]'}`}>
        <div className="flex items-center gap-3">
          <div className={`size-1.5 rounded-full ${isMaintenance ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-green-500/30'}`}></div>
          <span className={`text-[10px] md:text-[9px] font-black uppercase tracking-widest md:tracking-[0.4em] ${isMaintenance ? 'text-red-500' : 'text-white/20'}`}>
            {isMaintenance ? 'SYSTEM_STATUS: MAINTENANCE' : 'STATUS: CORE_STABLE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isMaintenance ? 'text-red-400' : 'text-white/5'}`}>REF://HUB_2.5_NOMINAL</span>
        </div>
      </div>

      <div className="flex flex-col items-center w-full z-10">

        {/* DESKTOP VIEW (Original Boxed Layout) */}
        <div className="hidden md:flex flex-row flex-nowrap justify-center gap-5 lg:gap-10 w-full px-2">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds, pulse: true }
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <div className="flex flex-col gap-3 items-center group/num">
                <div className="relative">
                  <div className={`absolute -inset-1 rounded-xl opacity-20 blur-xl transition-all duration-700 ${item.pulse || isMaintenance ? 'bg-red-500' : 'bg-white/5'}`}></div>

                  <div className={`relative w-28 h-32 lg:w-32 lg:h-34 rounded-xl flex items-center justify-center border transition-all duration-500 bg-[#050505] shadow-inner overflow-hidden ${isMaintenance ? 'border-red-500/20' : 'border-white/5 group-hover/num:border-white/10'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent"></div>

                    <span className={`text-6xl lg:text-[4.2rem] font-black text-white italic tracking-tighter transition-all duration-700 ${item.pulse || isMaintenance ? 'drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]'}`}>
                      {formatNumber(item.value)}
                    </span>

                    <div className={`absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.01)_50%)] bg-[length:100%_4px] pointer-events-none ${isMaintenance ? 'opacity-20' : 'opacity-10'}`}></div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-700 ${isMaintenance ? 'text-red-500/50' : 'text-white/10'}`}>{item.label}</span>
                </div>
              </div>

              {idx < arr.length - 1 && (
                <div className="h-32 lg:h-34 flex items-center text-white/5 text-2xl font-thin opacity-20 px-0.5">
                  /
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* MOBILE VIEW (Compact Glass Cards - Desktop Aesthetic) */}
        <div className="flex md:hidden flex-row flex-nowrap justify-center gap-2 sm:gap-3 w-full px-2">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds, pulse: true }
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <div className="flex flex-col gap-2 items-center group/num flex-1 min-w-0">
                <div className="relative w-full">
                  {/* Glow effect - more visible on mobile */}
                  <div className={`absolute -inset-0.5 rounded-lg opacity-20 blur-sm transition-all duration-700 ${item.pulse || isMaintenance ? 'bg-red-500' : 'bg-white/10'}`}></div>

                  {/* Glass card container */}
                  <div className={`relative w-full aspect-[0.75] min-h-[70px] sm:min-h-[80px] rounded-lg flex items-center justify-center border transition-all duration-500 bg-[#050505] shadow-inner overflow-hidden ${isMaintenance ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/15 shadow-[0_0_15px_rgba(0,0,0,0.3)]'}`}>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent"></div>

                    {/* Number display */}
                    <span className={`text-3xl sm:text-4xl font-black text-white italic tracking-tighter transition-all duration-700 relative z-10 ${item.pulse || isMaintenance ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' : 'drop-shadow-[0_0_6px_rgba(255,255,255,0.08)]'}`}>
                      {formatNumber(item.value)}
                    </span>

                    {/* Scanline effect */}
                    <div className={`absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.015)_50%)] bg-[length:100%_3px] pointer-events-none ${isMaintenance ? 'opacity-30' : 'opacity-15'}`}></div>
                  </div>
                </div>

                {/* Label */}
                <div className="flex flex-col items-center w-full">
                  <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-700 ${isMaintenance ? 'text-red-500/60' : 'text-white/30'}`}>
                    {item.label.length > 6 ? item.label.substring(0, 6) : item.label}
                  </span>
                </div>
              </div>

              {/* Separator */}
              {idx < arr.length - 1 && (
                <div className="flex items-center justify-center h-[70px] sm:h-[80px] text-white/10 text-lg sm:text-xl font-thin opacity-20 px-0.5">
                  /
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Countdown;
