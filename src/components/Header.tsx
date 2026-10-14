import React from 'react';
import {
  Gavel,
  Shield,
  Tv,
  Users,
  Layers,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Activity,
  Maximize2
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { ViewMode } from '../types/auction';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    teams,
    nextPlayerOnDeck,
    soundEnabled,
    toggleSound,
    openResetModal,
    activePlayer,
  } = useAuction();

  const navItems: { mode: ViewMode; label: string; icon: React.ReactNode; isLive?: boolean }[] = [
    { mode: 'admin', label: 'Admin Console', icon: <Gavel className="w-4 h-4" />, isLive: true },
    { mode: 'team', label: 'Team Manager', icon: <Shield className="w-4 h-4" /> },
    { mode: 'projector', label: 'Projector Display', icon: <Tv className="w-4 h-4" /> },
    { mode: 'live-room', label: 'Live Arena', icon: <Activity className="w-4 h-4" /> },
    { mode: 'pool', label: 'Player Pool', icon: <Users className="w-4 h-4" /> },
  ];

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-[#0A0E15]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Upper Brand & Navigation Bar */}
      <div className="h-20 w-full px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Group */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 pl-1 py-1">
            {/* Elegant Corporate Crest */}
            <div className="h-11 px-3 py-1.5 bg-gradient-to-r from-white to-slate-100 rounded-lg flex items-center justify-center shadow-lg border border-white/40 ring-1 ring-cyan-500/30">
              <span className="font-heading font-black text-[#003543] text-sm tracking-tight leading-none uppercase">
                ADANI <span className="text-[#00677F] font-semibold">CEMENT</span>
              </span>
            </div>

            <div className="flex flex-col justify-center border-l border-white/15 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-heading font-black tracking-wider text-base uppercase">
                  CPL 2026
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase bg-cyan-500/20 text-[#00D2FF] border border-cyan-500/40">
                  AUCTION ENGINE
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase font-mono">
                CORPORATE PREMIER LEAGUE
              </span>
              <span className="text-[8px] font-medium text-amber-400/90 tracking-widest uppercase font-mono">
                PLAY. CONNECT. BELONG.
              </span>
            </div>
          </div>

          <span className="hidden 2xl:inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono text-[10px] tracking-wider">
            CONCEPT DEMO • SAMPLE DATA
          </span>
        </div>

        {/* View Navigation Switcher */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#101520] p-1.5 rounded-xl border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const isActive = viewMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setViewMode(item.mode)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00D2FF] text-[#003543] shadow-[0_0_16px_rgba(0,210,255,0.4)] scale-100'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.isLive && (
                  <span className="relative flex h-2 w-2 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Disable Arena Audio' : 'Enable Arena Audio'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(0,210,255,0.2)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">ARENA AUDIO: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">AUDIO MUTED</span>
              </>
            )}
          </button>

          {/* Full Screen Toggle (esp for Projector) */}
          <button
            onClick={handleToggleFullScreen}
            title="Toggle Stage Full Screen"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={openResetModal}
            title="Reset Demo Data & Purses"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET DEMO</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <div className="md:hidden flex items-center justify-around bg-[#0D131F] py-2 px-2 border-t border-white/10 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = viewMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => setViewMode(item.mode)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-heading font-bold whitespace-nowrap ${
                isActive ? 'bg-[#00D2FF] text-[#003543]' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Financial Telemetry Ticker Strip */}
      <div className="h-10 w-full bg-[#101622] px-4 lg:px-8 flex items-center justify-between overflow-hidden border-t border-white/5 text-xs font-mono">
        <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap py-1">
          <div className="flex items-center gap-1.5 text-[#00D2FF] font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse"></span>
            <span className="tracking-wider uppercase">PURSE TELEMETRY:</span>
          </div>

          {teams.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-white/5">
              <span className="text-slate-400 font-semibold">{t.shortName}:</span>
              <span className="font-bold text-white tabular-nums">
                ₹{t.remainingPurse.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500">({t.squadCount}/11)</span>
            </div>
          ))}

          <span className="text-slate-600 hidden sm:inline">|</span>

          {nextPlayerOnDeck && (
            <div className="hidden lg:flex items-center gap-2 text-slate-300 shrink-0">
              <span className="text-slate-500">ON DECK:</span>
              <span className="font-bold text-white">
                #{nextPlayerOnDeck.lotNumber} {nextPlayerOnDeck.name} ({nextPlayerOnDeck.role})
              </span>
              <span className="text-cyan-400 font-semibold">
                BASE: ₹{nextPlayerOnDeck.basePrice.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        <div className="hidden xl:flex items-center gap-3 text-slate-400 text-[11px] shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            PA NETWORK ARMED
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-medium">AUDIO DSP: 48kHz LOW LATENCY</span>
        </div>
      </div>
    </header>
  );
};
