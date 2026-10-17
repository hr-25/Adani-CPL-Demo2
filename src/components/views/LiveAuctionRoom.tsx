import React from 'react';
import {
  Radio,
  Gavel,
  Shield,
  TrendingUp,
  Clock,
  Sparkles,
  Users,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatPoints } from '../../utils/formatters';

export const LiveAuctionRoom: React.FC = () => {
  const {
    activePlayer,
    currentBid,
    highestBidder,
    timerSeconds,
    teams,
    bidRecords,
    placeIncrementBid,
    openSoldModal,
    openUnsoldModal,
    toggleTimerPause,
    advanceNextLot,
    isPaused,
  } = useAuction();

  return (
    <div className="w-full flex flex-col gap-6 py-6 px-4 lg:px-8 max-w-[1720px] mx-auto">
      {/* Live Stage Banner */}
      <div className="w-full bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
          <div>
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-tight">
              LIVE AUCTION BROADCAST STAGE
            </h2>
            <span className="font-mono text-xs text-slate-400">
              Synchronized Command Center • Live Paddle Interactivity
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#151D2E] rounded-xl font-mono text-xs text-cyan-400 border border-cyan-500/30">
            AUDIENCE LINK: 12ms LATENCY
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Player In Spotlight (xl:col-span-8) */}
        <div className="xl:col-span-8 bg-[#0D131F] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-48 h-60 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-cyan-500/30 shadow-xl">
              <img src={activePlayer?.image} alt={activePlayer?.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-cyan-500 text-slate-900 font-mono text-xs font-bold">
                LOT #{activePlayer?.lotNumber || 4}
              </span>
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                {activePlayer?.tier?.toUpperCase() || 'MARQUEE SET'} • {activePlayer?.role?.toUpperCase()}
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
                {activePlayer?.name}
              </h1>
              <p className="font-heading text-base text-[#00D2FF] font-bold uppercase">{activePlayer?.specialism}</p>
              <p className="font-mono text-xs text-slate-400">
                {activePlayer?.cluster} • {activePlayer?.department}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-slate-300 bg-[#151D2E] px-3 py-1 rounded-lg border border-white/5">
                  Base Points: <strong>{formatPoints(activePlayer?.basePrice)} Points</strong>
                </span>
                <span className="font-mono text-xs text-slate-300 bg-[#151D2E] px-3 py-1 rounded-lg border border-white/5">
                  Experience: <strong>{activePlayer?.experience}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Center Stage Valuation & Countdown */}
          <div className="my-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#151D2E] border border-white/10 p-6 rounded-2xl">
            <div className="md:col-span-8 flex flex-col justify-between">
              <span className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">
                CURRENT HIGHEST BID
              </span>
              <div className="font-mono text-4xl sm:text-5xl text-[#00D2FF] font-black tracking-tight my-2 flex items-baseline gap-2">
                <span>{formatPoints(currentBid)}</span>
                <span className="text-xl sm:text-2xl text-cyan-400 font-bold">Points</span>
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs text-slate-300">
                <span>HELD BY:</span>
                <span
                  className="font-bold px-2 py-0.5 rounded text-slate-900"
                  style={{ backgroundColor: highestBidder?.color || '#00D2FF' }}
                >
                  {highestBidder ? highestBidder.name : 'NO BIDS YET'}
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#0D131F] rounded-xl border border-white/5">
              <span className="font-mono text-xs text-slate-400 uppercase font-bold">GAVEL CLOCK</span>
              <span
                className={`font-mono text-4xl font-black my-1 ${
                  timerSeconds <= 4 ? 'text-red-400 animate-pulse' : 'text-amber-400'
                }`}
              >
                00:{timerSeconds.toString().padStart(2, '0')}
              </span>
              <span className="font-mono text-[10px] text-slate-500">AWAITING HAMMER</span>
            </div>
          </div>

          {/* Quick Auctioneer Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={openSoldModal}
              disabled={!highestBidder}
              className="py-3 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 rounded-xl font-heading font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Gavel className="w-4 h-4" />
              <span>DROP HAMMER</span>
            </button>
            <button
              onClick={openUnsoldModal}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-heading font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              <span>MARK UNSOLD</span>
            </button>
            <button
              onClick={toggleTimerPause}
              className="py-3 px-4 bg-[#151D2E] hover:bg-slate-700 text-amber-400 rounded-xl font-heading font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer border border-amber-500/30"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>
            <button
              onClick={advanceNextLot}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl font-heading font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/30"
            >
              <SkipForward className="w-4 h-4" />
              <span>NEXT LOT</span>
            </button>
          </div>
        </div>

        {/* Right: Live 4-Team Interactive Paddle Board (xl:col-span-4) */}
        <div className="xl:col-span-4 bg-[#0D131F] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                  RAPID BID PADDLES
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">SELECT TO RAISE</span>
            </div>

            <div className="space-y-3 mt-4">
              {teams.map((t) => {
                const isLeading = highestBidder?.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isLeading
                        ? 'bg-[#151D2E] border-cyan-500/50 shadow-lg'
                        : 'bg-[#151D2E]/60 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></span>
                        <div>
                          <h4 className="font-heading font-bold text-white text-base leading-tight">
                            {t.shortName}
                          </h4>
                          <span className="font-mono text-[10px] text-slate-400">{t.paddleNumber}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-white text-sm">
                          {formatPoints(t.remainingPurse)} Points
                        </span>
                        <span className="block text-[10px] text-slate-400">Squad: {t.squadCount}/11</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => placeIncrementBid(10000, t.id)}
                        disabled={isLeading}
                        className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                          isLeading
                            ? 'bg-cyan-500/20 text-cyan-400 cursor-default'
                            : 'bg-white/10 hover:bg-[#00D2FF] hover:text-[#003543] text-white'
                        }`}
                      >
                        {isLeading ? 'HOLDING LEAD' : '+10k Pts'}
                      </button>
                      <button
                        onClick={() => placeIncrementBid(25000, t.id)}
                        disabled={isLeading}
                        className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                          isLeading
                            ? 'bg-cyan-500/20 text-cyan-400 cursor-default'
                            : 'bg-white/10 hover:bg-[#00D2FF] hover:text-[#003543] text-white'
                        }`}
                      >
                        +25k Pts
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-[#151D2E] rounded-xl border border-white/5 font-mono text-xs text-slate-400 text-center">
            Clicking a paddle instantly places that franchise's bid into the live auction stream.
          </div>
        </div>
      </div>
    </div>
  );
};
