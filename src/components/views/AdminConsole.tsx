import React, { useState } from 'react';
import {
  Gavel,
  Ban,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Sliders,
  DollarSign,
  TrendingUp,
  Clock,
  Radio,
  History,
  Shield,
  Layers,
  ChevronRight,
  UserCheck,
  AlertOctagon,
  Search,
  Filter,
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { sound } from '../../utils/soundEngine';

export const AdminConsole: React.FC = () => {
  const {
    players,
    teams,
    activePlayer,
    activePlayerIndex,
    currentBid,
    highestBidder,
    timerSeconds,
    timerRunning,
    isPaused,
    lastActionMessage,
    bidRecords,
    auditLogs,
    nextPlayerOnDeck,
    placeBid,
    placeIncrementBid,
    toggleTimerPause,
    adjustTimer,
    startTimer,
    triggerWarning,
    openSoldModal,
    openUnsoldModal,
    advanceNextLot,
    goToLot,
    soundEnabled,
    masterVolume,
    setMasterVolume,
    toggleSound,
  } = useAuction();

  const [customBidInput, setCustomBidInput] = useState<string>('');
  const [selectedAttributeTeam, setSelectedAttributeTeam] = useState<string>('titans');
  const [historyTab, setHistoryTab] = useState<'results' | 'stream'>('results');
  const [resultsFilter, setResultsFilter] = useState<'ALL' | 'SOLD' | 'UNSOLD'>('ALL');
  const [emergencyFreeze, setEmergencyFreeze] = useState<boolean>(false);

  const handleApplyCustomBid = () => {
    const val = parseInt(customBidInput, 10);
    if (!isNaN(val) && val > 0) {
      const res = placeBid(selectedAttributeTeam, val);
      if (res.success) {
        setCustomBidInput('');
      } else {
        alert(res.message);
      }
    }
  };

  const handleManualIncrement = (increment: number) => {
    const res = placeIncrementBid(increment, selectedAttributeTeam);
    if (!res.success) {
      alert(res.message);
    }
  };

  const filteredPlayers = players.filter((p) => {
    if (resultsFilter === 'ALL') return p.status === 'SOLD' || p.status === 'UNSOLD';
    return p.status === resultsFilter;
  });

  // Calculate timer ring percentage
  const timerPercent = (timerSeconds / 15) * 100;
  const isUrgentTimer = timerSeconds <= 4;

  return (
    <div className="w-full flex flex-col gap-5 py-4 px-4 lg:px-8 max-w-[1720px] mx-auto">
      {/* Top Telemetry & Audio Dispatcher Bar */}
      <div className="w-full bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Audio Controller Section */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00D2FF]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
                  AUDIO DISPATCHER & PA CONTROLLER
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-[#00D2FF] border border-cyan-500/30">
                  DSP READY • 48kHz
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                <span className="text-cyan-400 font-semibold">WebAudio Synthesizer: 4.2ms</span>
                <span>•</span>
                <span>Output: Stereo Arena PA</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">VU: PEAK SAFE</span>
              </div>
            </div>
          </div>

          {/* Micro VU equalizer bars */}
          <div className="hidden xl:flex items-end gap-1 h-6 px-3 py-1 bg-[#151D2E] rounded-lg border border-white/10">
            <div className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-4 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-5 bg-[#00D2FF] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-4 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-1 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
          </div>
        </div>

        {/* Rehearsal Audio Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => sound.playBidClick()}
            className="px-2.5 py-1.5 rounded-lg bg-[#151D2E] hover:bg-[#1E293B] text-slate-300 hover:text-white font-mono text-[11px] font-bold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Rehearse Bid Sound"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>TEST BID</span>
          </button>
          <button
            onClick={() => sound.playWarning(1)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151D2E] hover:bg-[#1E293B] text-slate-300 hover:text-white font-mono text-[11px] font-bold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Rehearse Warning Chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>TEST WARN</span>
          </button>
          <button
            onClick={() => sound.playSoldFanfare()}
            className="px-2.5 py-1.5 rounded-lg bg-[#151D2E] hover:bg-[#1E293B] text-slate-300 hover:text-white font-mono text-[11px] font-bold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Rehearse Sold Fanfare"
          >
            <Gavel className="w-3.5 h-3.5 text-cyan-300" />
            <span>TEST SOLD</span>
          </button>

          {/* Volume slider */}
          <div className="flex items-center gap-2 bg-[#151D2E] px-3 py-1.5 rounded-lg border border-white/10">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseInt(e.target.value, 10))}
              className="w-16 accent-[#00D2FF] cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="font-mono text-[11px] text-cyan-400 font-bold w-7 text-right">{masterVolume}%</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Tactical Command Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* COLUMN 1: Player Queue & Lot History (xl:col-span-3) */}
        {/* ========================================================= */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Active Lot Overview Card */}
          <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-[10px] font-bold tracking-wider animate-pulse">
                CURRENT IN RING
              </span>
              <span className="font-mono text-xs text-[#00D2FF] font-bold">
                LOT #{activePlayer?.lotNumber.toString().padStart(2, '0')} / {players.length}
              </span>
            </div>

            {activePlayer ? (
              <div className="flex gap-3.5 items-center">
                <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-slate-800 shadow-md shrink-0 border border-white/10">
                  <img
                    src={activePlayer.image}
                    alt={activePlayer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback sports silhouette
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-mono font-bold text-white bg-black/60 px-1 rounded">
                    {activePlayer.role.toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-heading text-lg font-bold text-white truncate">{activePlayer.name}</h3>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[9px] font-bold shrink-0">
                      {activePlayer.tier}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[#F59E0B] font-bold truncate">{activePlayer.specialism}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{activePlayer.cluster}</p>

                  <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] font-mono">
                    <div className="text-slate-400">
                      Base:{' '}
                      <span className="text-white font-bold">₹{activePlayer.basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-slate-400">
                      Exp: <span className="text-cyan-400 font-bold">{activePlayer.experience.split(' ')[0]} Yrs</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 font-mono text-xs">No active player lot.</div>
            )}

            {/* Current Lot Holder Pill */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between bg-[#151D2E] px-3 py-1.5 rounded-xl">
              <span className="font-mono text-[11px] text-slate-400">CURRENT HOLDER:</span>
              <span className="font-mono text-xs text-[#00D2FF] font-bold flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: highestBidder?.color || '#00D2FF' }}
                ></span>
                {highestBidder ? `${highestBidder.shortName} (₹${currentBid.toLocaleString('en-IN')})` : 'NO BIDDER'}
              </span>
            </div>
          </div>

          {/* Results Table & Live Stream Tabs */}
          <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col flex-1">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setHistoryTab('results')}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    historyTab === 'results'
                      ? 'bg-[#00D2FF] text-[#003543] shadow-md'
                      : 'bg-[#151D2E] text-slate-400 hover:text-white'
                  }`}
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>LOT RESULTS</span>
                </button>
                <button
                  onClick={() => setHistoryTab('stream')}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    historyTab === 'stream'
                      ? 'bg-[#00D2FF] text-[#003543] shadow-md'
                      : 'bg-[#151D2E] text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>LIVE AUDIT</span>
                </button>
              </div>
              <span className="font-mono text-[10px] text-slate-500">SYNC: IMMUTABLE</span>
            </div>

            {historyTab === 'results' ? (
              <div className="flex flex-col flex-1">
                {/* Filter Pill */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span className="text-slate-500">FILTER:</span>
                    {(['ALL', 'SOLD', 'UNSOLD'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setResultsFilter(filter)}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          resultsFilter === filter
                            ? 'bg-[#00D2FF] text-[#003543]'
                            : 'bg-[#151D2E] text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">
                    {filteredPlayers.length} LOTS
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead className="text-[10px] text-slate-500 border-b border-white/10 sticky top-0 bg-[#0D131F]">
                      <tr>
                        <th className="pb-1.5 font-semibold">LOT</th>
                        <th className="pb-1.5 font-semibold">PLAYER</th>
                        <th className="pb-1.5 font-semibold">SOLD TO</th>
                        <th className="pb-1.5 text-right font-semibold">PRICE</th>
                        <th className="pb-1.5 text-center font-semibold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredPlayers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-500 text-xs">
                            No lot records match filter.
                          </td>
                        </tr>
                      ) : (
                        filteredPlayers.map((p) => {
                          const soldTeam = teams.find((t) => t.id === p.soldToTeamId);
                          return (
                            <tr
                              key={p.id}
                              onClick={() => goToLot(p.lotNumber - 1)}
                              className="hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                              <td className="py-2 text-slate-500 font-bold">
                                #{p.lotNumber.toString().padStart(2, '0')}
                              </td>
                              <td className="py-2 text-white font-semibold truncate max-w-[85px] group-hover:text-cyan-300">
                                {p.name}
                              </td>
                              <td className="py-2 text-cyan-400 font-bold truncate max-w-[70px]">
                                {soldTeam ? soldTeam.shortName : '—'}
                              </td>
                              <td className="py-2 text-right font-bold text-slate-200">
                                {p.soldPrice ? `₹${p.soldPrice.toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td className="py-2 text-center">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    p.status === 'SOLD'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-rose-500/20 text-rose-400'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Live Audit Stream */
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] font-mono text-xs pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-[#151D2E] rounded-xl flex flex-col gap-0.5 border border-white/5">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>{log.timestamp}</span>
                      <span className="text-[#00D2FF] font-bold">{log.title}</span>
                    </div>
                    <p className="text-white font-medium text-xs leading-snug">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* On Deck Next Player Preview */}
          {nextPlayerOnDeck && (
            <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  NEXT ON DECK
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  LOT #{nextPlayerOnDeck.lotNumber.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={nextPlayerOnDeck.image}
                  alt={nextPlayerOnDeck.name}
                  className="w-11 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-bold text-white text-sm truncate">{nextPlayerOnDeck.name}</div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">
                    {nextPlayerOnDeck.role.toUpperCase()} • {nextPlayerOnDeck.cluster}
                  </div>
                  <div className="font-mono text-xs text-[#00D2FF] font-bold mt-0.5">
                    BASE: ₹{nextPlayerOnDeck.basePrice.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: Center Stage Hammer, Gavel & Bidding Deck (xl:col-span-6) */}
        {/* ========================================================= */}
        <div className="xl:col-span-6 flex flex-col gap-5">
          {/* Main Gavel Cockpit Card */}
          <div className="bg-[#0D131F] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Top spotlight glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header Telemetry Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-mono text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  LIVE BIDDING ROUND
                </span>
                <span className="font-mono text-xs text-slate-400">
                  TELEMETRY ID #CPL26-LOT{activePlayer?.lotNumber.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Warning Trigger Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => triggerWarning('GOING ONCE')}
                  className="px-2.5 py-1 bg-[#151D2E] hover:bg-[#1E293B] text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30 transition-all cursor-pointer"
                >
                  GOING ONCE
                </button>
                <button
                  onClick={() => triggerWarning('GOING TWICE')}
                  className="px-2.5 py-1 bg-[#151D2E] hover:bg-[#1E293B] text-orange-400 font-mono text-xs font-bold rounded-lg border border-orange-500/30 transition-all cursor-pointer"
                >
                  GOING TWICE
                </button>
                <button
                  onClick={() => triggerWarning('FINAL CALL')}
                  className="px-2.5 py-1 bg-[#151D2E] hover:bg-[#1E293B] text-red-400 font-mono text-xs font-bold rounded-lg border border-red-500/30 transition-all cursor-pointer"
                >
                  FINAL CALL
                </button>
              </div>
            </div>

            {/* Central Numbers Grid */}
            <div className="my-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10">
              {/* Current Active Highest Valuation Card (md:col-span-7) */}
              <div className="md:col-span-7 bg-[#151D2E] border border-white/10 p-5 rounded-2xl shadow-inner flex flex-col justify-between min-h-[160px]">
                <div>
                  <span className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    ACTIVE HIGHEST VALUATION
                  </span>
                  <div className="font-mono text-4xl sm:text-5xl text-[#00D2FF] font-black tracking-tight my-1.5 flex items-baseline drop-shadow-[0_0_20px_rgba(0,210,255,0.4)]">
                    <span className="text-3xl text-cyan-400 mr-1">₹</span>
                    <span>{currentBid.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">LEADING PADDLE:</span>
                    <span
                      className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold tracking-wide"
                      style={{
                        backgroundColor: highestBidder?.glowColor || 'rgba(0,210,255,0.2)',
                        color: highestBidder?.color || '#00D2FF',
                      }}
                    >
                      {highestBidder ? highestBidder.name.toUpperCase() : 'NO BIDDER YET'}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {highestBidder ? highestBidder.paddleNumber : ''}
                  </span>
                </div>
              </div>

              {/* Countdown Dial & Clock Cockpit (md:col-span-5) */}
              <div className="md:col-span-5 bg-[#151D2E] border border-white/10 p-5 rounded-2xl shadow-inner flex flex-col items-center justify-center text-center min-h-[160px]">
                <span className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  GAVEL COUNTDOWN
                </span>

                <div className="relative w-24 h-24 my-1 flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-slate-800"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="7"
                    />
                    <circle
                      className={`transition-all duration-1000 ease-linear ${
                        isUrgentTimer ? 'text-red-500' : 'text-[#00D2FF]'
                      }`}
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * timerPercent) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`font-mono text-3xl font-black tracking-tight leading-none ${
                        isUrgentTimer ? 'text-red-400 animate-pulse' : 'text-white'
                      }`}
                    >
                      {timerSeconds.toString().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 mt-0.5">SEC</span>
                  </div>
                </div>

                {/* Clock Quick Control Buttons */}
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    onClick={() => adjustTimer(5)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[10px] font-bold cursor-pointer"
                  >
                    +5s
                  </button>
                  <button
                    onClick={() => adjustTimer(10)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[10px] font-bold cursor-pointer"
                  >
                    +10s
                  </button>
                  <button
                    onClick={toggleTimerPause}
                    className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Broadcast Banner */}
            <div className="mb-5 p-3.5 bg-[#151D2E] border border-cyan-500/20 rounded-xl flex items-center justify-between text-slate-200">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-[#00D2FF] shrink-0 animate-pulse" />
                <span className="font-mono text-xs font-semibold">{lastActionMessage}</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                AUDIENCE SYNCED
              </span>
            </div>

            {/* Executive Auctioneer Control Buttons */}
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">
                  AUCTIONEER EXECUTIVE CONTROLS
                </span>
                <span className="font-mono text-[10px] text-cyan-400 font-bold">CRITICAL GAVEL GATEWAY</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* SOLD Button */}
                <button
                  onClick={openSoldModal}
                  disabled={!highestBidder}
                  className="py-3 px-3 bg-gradient-to-r from-cyan-500 to-[#00D2FF] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-[#003543] rounded-xl font-heading font-black text-sm uppercase flex flex-col items-center justify-center transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] active:scale-95 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Gavel className="w-4 h-4" />
                    <span>SOLD</span>
                  </div>
                  <span className="font-mono text-[9px] text-[#003543]/80 font-normal">DROP THE HAMMER</span>
                </button>

                {/* UNSOLD Button */}
                <button
                  onClick={openUnsoldModal}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-heading font-black text-sm uppercase flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer border border-white/10"
                >
                  <div className="flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span>UNSOLD</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 font-normal">PASS TO ARCHIVE</span>
                </button>

                {/* PAUSE / RESUME */}
                <button
                  onClick={toggleTimerPause}
                  className="py-3 px-3 bg-[#151D2E] hover:bg-[#1E293B] text-amber-400 rounded-xl font-heading font-black text-sm uppercase flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer border border-amber-500/30"
                >
                  <div className="flex items-center gap-1.5">
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 font-normal">HALT BID COUNTERS</span>
                </button>

                {/* NEXT LOT */}
                <button
                  onClick={advanceNextLot}
                  className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-[#00D2FF] rounded-xl font-heading font-black text-sm uppercase flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer border border-cyan-500/30"
                >
                  <div className="flex items-center gap-1.5">
                    <SkipForward className="w-4 h-4" />
                    <span>NEXT LOT</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 font-normal">
                    {nextPlayerOnDeck ? `LOAD LOT #${nextPlayerOnDeck.lotNumber}` : 'CATALOGUE END'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Floor & Telephone Bidding Dispatcher Module */}
          <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#00D2FF]" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  FLOOR / TELEPHONE BID DISPATCHER
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">CHAIR OVERRIDE PERMITTED</span>
            </div>

            {/* Quick Increment Buttons + Custom Amount */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-6 flex gap-2">
                <button
                  onClick={() => handleManualIncrement(10000)}
                  className="flex-1 py-2 bg-[#151D2E] hover:bg-[#00D2FF] hover:text-[#003543] rounded-xl font-mono text-xs font-bold text-[#00D2FF] border border-cyan-500/30 transition-all text-center cursor-pointer active:scale-95"
                >
                  +₹10k
                </button>
                <button
                  onClick={() => handleManualIncrement(25000)}
                  className="flex-1 py-2 bg-[#151D2E] hover:bg-[#00D2FF] hover:text-[#003543] rounded-xl font-mono text-xs font-bold text-[#00D2FF] border border-cyan-500/30 transition-all text-center cursor-pointer active:scale-95"
                >
                  +₹25k
                </button>
                <button
                  onClick={() => handleManualIncrement(50000)}
                  className="flex-1 py-2 bg-[#151D2E] hover:bg-[#00D2FF] hover:text-[#003543] rounded-xl font-mono text-xs font-bold text-[#00D2FF] border border-cyan-500/30 transition-all text-center cursor-pointer active:scale-95"
                >
                  +₹50k
                </button>
              </div>

              <div className="md:col-span-6 flex items-center gap-2 bg-[#151D2E] px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-[#00D2FF] font-mono font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="Custom value (e.g. 260000)"
                  value={customBidInput}
                  onChange={(e) => setCustomBidInput(e.target.value)}
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-600"
                />
                <button
                  onClick={handleApplyCustomBid}
                  className="px-3 py-1 bg-[#00D2FF] text-[#003543] rounded-lg font-mono text-xs font-bold hover:brightness-110 transition-colors shrink-0 cursor-pointer"
                >
                  SET
                </button>
              </div>
            </div>

            {/* Quick Franchise Attribute Selector */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="font-mono text-[10px] text-slate-400 uppercase">
                ATTRIBUTE RAISE TO FRANCHISE:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {teams.map((t) => {
                  const isSelected = selectedAttributeTeam === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedAttributeTeam(t.id)}
                      className={`px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-[#1E293B] text-white ring-1 ring-cyan-400'
                          : 'bg-[#151D2E] text-slate-400 hover:text-white border-white/5'
                      }`}
                      style={{ borderColor: isSelected ? t.color : undefined }}
                    >
                      <span>{t.shortName}</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: Franchise Purse Telemetry & Safety Matrix (xl:col-span-3) */}
        {/* ========================================================= */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Franchise Purse Matrix */}
          <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                FRANCHISE PURSE TELEMETRY
              </span>
              <Shield className="w-4 h-4 text-[#00D2FF]" />
            </div>

            <div className="flex flex-col gap-2.5">
              {teams.map((team) => {
                const percent = (team.remainingPurse / team.startingPurse) * 100;
                const isLeading = highestBidder?.id === team.id;

                return (
                  <div
                    key={team.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isLeading
                        ? 'bg-[#151D2E] border-cyan-500/50 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
                        : 'bg-[#151D2E]/60 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }}></span>
                        <span className="font-heading font-bold text-white text-sm">{team.shortName}</span>
                        {isLeading && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[#00D2FF] font-mono text-[9px] font-bold">
                            LEADER
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-sm text-[#00D2FF]">
                        ₹{team.remainingPurse.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 my-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: team.color,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Squad: {team.squadCount}/11</span>
                      <span>Reserve Cap: ₹2.0L</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety & Emergency Protocols */}
          <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-2.5">
            <span className="font-mono text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              SAFETY & EMERGENCY PROTOCOLS
            </span>

            <button
              onClick={() => {
                sound.playWarning(1);
                alert('Resync broadcast signal triggered across all team paddles.');
              }}
              className="py-2 px-3 bg-[#151D2E] hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>RESYNC ALL PADDLES</span>
              <span className="text-cyan-400 text-[10px]">BROADCAST</span>
            </button>

            <button
              onClick={() => {
                setEmergencyFreeze(!emergencyFreeze);
                if (!emergencyFreeze) {
                  toggleTimerPause();
                }
              }}
              className={`py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                emergencyFreeze
                  ? 'bg-rose-500 text-white'
                  : 'bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{emergencyFreeze ? 'UNFREEZE BIDDING DESK' : 'EMERGENCY FREEZE BIDDING'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
