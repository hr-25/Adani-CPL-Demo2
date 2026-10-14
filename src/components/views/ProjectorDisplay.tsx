import React from 'react';
import {
  Tv,
  Maximize2,
  Minimize2,
  Radio,
  Gavel,
  History,
  Shield,
  Clock,
  Sparkles,
  CheckCircle,
  Ban,
  ArrowRight
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

export const ProjectorDisplay: React.FC = () => {
  const {
    activePlayer,
    currentBid,
    highestBidder,
    timerSeconds,
    teams,
    players,
    nextPlayerOnDeck,
  } = useAuction();

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isFullScreen = !!document.fullscreenElement;

  // Recent auction lot transactions
  const recentResults = players
    .filter((p) => p.status === 'SOLD' || p.status === 'UNSOLD')
    .slice(-4);

  return (
    <div className="w-full min-h-[calc(100vh-120px)] flex flex-col justify-between p-4 md:p-8 max-w-[1920px] mx-auto select-none relative">
      {/* Stadium Ambient Radial Spotlights */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[850px] h-[850px] bg-cyan-500/10 rounded-full blur-[180px]"></div>
        <div className="absolute top-1/3 right-1/4 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[190px]"></div>
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[160px]"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-6 w-full">
        {/* Projector Subheader / Live Arena Banner */}
        <div className="w-full flex items-center justify-between bg-[#0D131F]/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-mono text-xs font-bold tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              ● STADIUM JUMBOTRON FEED
            </span>
            <span className="hidden sm:inline font-mono text-xs text-slate-400">
              AUDITORIUM PROJECTION • 4K ULTRA-CONTRAST
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#151D2E] rounded-xl font-mono text-xs text-cyan-400 border border-cyan-500/30">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ROUND 1 • LOT #{activePlayer?.lotNumber.toString().padStart(2, '0') || '04'}</span>
            </div>
            <button
              onClick={handleToggleFullScreen}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
              title="Toggle Auditorium Fullscreen"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Recent Results Ribbon */}
        <div className="w-full bg-[#0A0E15]/90 border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between overflow-x-auto gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold shrink-0">
            <History className="w-4 h-4" />
            <span>RECENT HAMMER RESULTS:</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 overflow-x-auto whitespace-nowrap">
            {recentResults.map((r, i) => {
              const wonTeam = teams.find((t) => t.id === r.soldToTeamId);
              return (
                <div key={r.id} className="flex items-center gap-1.5 shrink-0">
                  <span className="text-white font-bold">#{r.lotNumber} {r.name}</span>
                  <span>→</span>
                  <span className="font-bold text-cyan-400">{wonTeam ? wonTeam.shortName : 'UNSOLD'}</span>
                  {r.soldPrice && (
                    <span className="text-amber-400 font-bold">₹{r.soldPrice.toLocaleString('en-IN')}</span>
                  )}
                  {i < recentResults.length - 1 && <span className="text-slate-600 mx-2">•</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* HERO STAGE JUMBOTRON CARD */}
        <div className="w-full rounded-3xl bg-[#0D131F]/95 border-2 border-cyan-500/30 shadow-[0_30px_90px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
            {/* Left Zone: Cinematic Player Spotlight (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-[#070B12]/90 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative">
              {/* Category Chips */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-heading text-sm uppercase tracking-wider font-bold">
                  LOT #{activePlayer?.lotNumber.toString().padStart(2, '0') || '04'} • {activePlayer?.tier?.toUpperCase() || 'MARQUEE SET'}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[#00D2FF] font-heading text-sm uppercase tracking-wider font-bold">
                  BASE: ₹{activePlayer?.basePrice.toLocaleString('en-IN') || '50,000'}
                </span>
              </div>

              {/* Player Portrait & Hero Title */}
              <div className="my-6 flex flex-col xl:flex-row items-center xl:items-end gap-6">
                <div className="relative w-52 h-64 sm:w-56 sm:h-72 rounded-2xl overflow-hidden bg-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.8)] ring-2 ring-cyan-500/30 shrink-0">
                  <img
                    src={activePlayer?.image}
                    alt={activePlayer?.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 py-1 bg-[#0A0E15]/90 backdrop-blur-md rounded-lg text-center border border-cyan-500/30">
                    <span className="font-heading text-xs tracking-widest text-cyan-400 font-bold uppercase">
                      {activePlayer?.role || 'ALL-ROUNDER'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col text-center xl:text-left space-y-2">
                  <span className="font-mono text-xs tracking-widest text-slate-400 font-bold uppercase">
                    CURRENT ATHLETE IN ARENA
                  </span>
                  <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white font-black tracking-tight uppercase leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    {activePlayer?.name || 'ARJUN SHAH'}
                  </h1>
                  <p className="font-heading text-sm sm:text-base text-amber-400 font-bold uppercase tracking-wider">
                    {activePlayer?.specialism || 'RIGHT HAND BAT • RIGHT ARM PACE'}
                  </p>

                  <div className="pt-2 grid grid-cols-2 gap-2.5 w-full max-w-sm">
                    <div className="bg-[#151D2E] border border-white/10 p-2.5 rounded-xl">
                      <span className="block font-mono text-[10px] text-slate-400 uppercase">CLUSTER UNIT</span>
                      <span className="font-heading text-sm text-cyan-400 font-bold truncate block">
                        {activePlayer?.cluster || 'Ahmedabad Cluster'}
                      </span>
                    </div>
                    <div className="bg-[#151D2E] border border-white/10 p-2.5 rounded-xl">
                      <span className="block font-mono text-[10px] text-slate-400 uppercase">EXPERIENCE</span>
                      <span className="font-heading text-sm text-white font-bold truncate block">
                        {activePlayer?.experience || '3 Yrs Inter-Unit'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{activePlayer?.department || 'Logistics & Supply Chain'}</span>
                <span className="text-cyan-400 font-bold">{activePlayer?.previousTournament}</span>
              </div>
            </div>

            {/* Right Zone: Stadium Scoreboard (lg:col-span-7) */}
            <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-[#0F141B]/80 relative">
              {/* Leading Team Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#151D2E] border border-white/10 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-2xl shadow-lg shrink-0"
                    style={{
                      backgroundColor: highestBidder?.color || '#00D2FF',
                      color: '#070B12',
                    }}
                  >
                    {highestBidder ? highestBidder.shortName[0] : '—'}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
                      CURRENT LEADING FRANCHISE
                    </span>
                    <span className="font-heading text-2xl sm:text-3xl text-white uppercase font-black tracking-tight truncate">
                      {highestBidder ? highestBidder.name : 'WAITING FOR FIRST BID'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-full shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00D2FF] animate-ping"></span>
                  <span className="font-mono text-xs text-[#00D2FF] font-bold uppercase tracking-wider">
                    {highestBidder ? highestBidder.paddleNumber : 'OPEN'}
                  </span>
                </div>
              </div>

              {/* Massive Center Price & Countdown */}
              <div className="my-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00D2FF] animate-pulse"></span>
                    <span className="font-mono text-xs sm:text-sm text-cyan-400 font-black uppercase tracking-widest">
                      CURRENT HIGHEST BID
                    </span>
                  </div>
                  <div className="flex items-baseline flex-nowrap">
                    <span className="font-mono text-4xl sm:text-5xl text-cyan-400 font-bold mr-2 leading-none">
                      ₹
                    </span>
                    <span className="font-mono text-5xl sm:text-6xl xl:text-7xl text-white font-black tracking-tighter drop-shadow-[0_0_40px_rgba(0,210,255,0.45)] leading-none truncate">
                      {currentBid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="font-mono text-xs sm:text-sm text-slate-400 pt-1">
                    Standard Minimum Step: <strong className="text-white">+₹10,000 / +₹20,000</strong>
                  </p>
                </div>

                {/* Clock Cockpit */}
                <div
                  className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 shrink-0 min-w-[220px] transition-all ${
                    timerSeconds <= 4
                      ? 'bg-red-950/40 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]'
                      : 'bg-[#151D2E] border-cyan-500/40 shadow-[0_0_30px_rgba(0,210,255,0.2)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono text-xs tracking-wider font-bold uppercase mb-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className={timerSeconds <= 4 ? 'text-red-400' : 'text-slate-300'}>
                      TIME REMAINING
                    </span>
                  </div>
                  <div className="my-1">
                    <span
                      className={`font-mono text-5xl sm:text-6xl font-black tracking-tight leading-none ${
                        timerSeconds <= 4 ? 'text-red-400 animate-pulse' : 'text-white'
                      }`}
                    >
                      00:{timerSeconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider mt-1 ${
                      timerSeconds <= 4
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {timerSeconds <= 4 ? 'FINAL CALL / HAMMER FALLING' : 'ROUND IN PROGRESS'}
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">STAGE PROTOCOL:</span>
                  <span className="text-amber-400 font-bold uppercase">ROUND 1 • MARQUEE LOTS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400 font-bold">ALL PADDLES LINKED</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 FRANCHISE PURSE TELEMETRY CARDS (BOTTOM) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00D2FF]" />
              <span className="font-heading text-sm text-white font-bold uppercase tracking-widest">
                FRANCHISE PURSE & SQUAD CAPACITIES
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">TOTAL CAP: ₹10,00,000 PER TEAM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((t) => {
              const percent = (t.remainingPurse / t.startingPurse) * 100;
              const isLeading = highestBidder?.id === t.id;

              return (
                <div
                  key={t.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isLeading
                      ? 'bg-[#151D2E] border-cyan-400 shadow-[0_0_30px_rgba(0,210,255,0.25)] ring-1 ring-cyan-400'
                      : 'bg-[#0D131F] border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-lg shadow"
                        style={{ backgroundColor: t.color, color: '#070B12' }}
                      >
                        {t.shortName[0]}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg text-white uppercase font-black leading-tight">
                          {t.shortName}
                        </h3>
                        <span className="font-mono text-[11px] text-slate-400">{t.paddleNumber}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold ${
                        isLeading
                          ? 'bg-cyan-500 text-slate-900 shadow-sm'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {isLeading ? 'LEADING BIDDER' : 'IN AUCTION'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-xs text-slate-400 font-semibold">REMAINING PURSE</span>
                      <span className="font-mono text-xl text-white font-black">
                        ₹{t.remainingPurse.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="w-full bg-[#0A0E15] h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: t.color }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-slate-400 font-mono text-xs pt-1">
                      <span>
                        SQUAD: <strong className="text-white">{t.squadCount} / 11</strong>
                      </span>
                      <span>
                        SLOTS: <strong className="text-white">{11 - t.squadCount}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
