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
  AlertCircle,
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
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Eye,
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { Role, Player } from '../../types/auction';
import { sound } from '../../utils/soundEngine';
import { formatPoints, formatPointsWithLabel } from '../../utils/formatters';
import { getPlayerProfile } from '../../utils/playerProfileHelper';

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
    selectedCategory,
    setSelectedCategory,
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
    loadPlayerToRing,
    goToLot,
    soundEnabled,
    masterVolume,
    setMasterVolume,
    toggleSound,
    getCategoryEligiblePlayers,
    getCategoryAllPlayers,
    openPlayerProfile,
  } = useAuction();

  const [customBidInput, setCustomBidInput] = useState<string>('');
  const [selectedAttributeTeam, setSelectedAttributeTeam] = useState<string>('titans');
  const [bidFeedback, setBidFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [historyTab, setHistoryTab] = useState<'queue' | 'results' | 'stream'>('queue');
  const [queueMode, setQueueMode] = useState<'eligible' | 'all'>('eligible');
  const [resultsFilter, setResultsFilter] = useState<'ALL' | 'SOLD' | 'UNSOLD'>('ALL');
  const [emergencyFreeze, setEmergencyFreeze] = useState<boolean>(false);

  // Eligible and all players for current category
  const categoryEligiblePlayers = getCategoryEligiblePlayers(selectedCategory);
  const categoryAllPlayers = getCategoryAllPlayers(selectedCategory);

  // Selected team metrics for live bidding
  const currentSelectedTeam = teams.find((t) => t.id === selectedAttributeTeam) || teams[0];
  const remainingSlotsForSelected = Math.max(0, currentSelectedTeam.maxSquad - currentSelectedTeam.squadCount - 1);
  const reserveNeededForSelected = remainingSlotsForSelected * currentSelectedTeam.minReservePerSlot;
  const maxSafeBidForSelected = Math.max(0, currentSelectedTeam.remainingPurse - reserveNeededForSelected);

  const handleApplyCustomBid = () => {
    setBidFeedback(null);

    if (!customBidInput || customBidInput.trim() === '') {
      const msg = 'Please enter a custom points amount.';
      setBidFeedback({ type: 'error', message: msg });
      sound.playWarning();
      return;
    }

    const val = parseInt(customBidInput.trim(), 10);
    if (isNaN(val) || val <= 0) {
      const msg = 'Invalid bid amount. Points must be a positive number.';
      setBidFeedback({ type: 'error', message: msg });
      sound.playWarning();
      return;
    }

    const res = placeBid(selectedAttributeTeam, val);
    if (res.success) {
      setCustomBidInput('');
      setBidFeedback({
        type: 'success',
        message: `✓ Custom bid of ${formatPointsWithLabel(val)} confirmed for ${currentSelectedTeam.name}!`,
      });
    } else {
      setBidFeedback({
        type: 'error',
        message: res.message,
      });
      sound.playWarning();
    }
  };

  const handleManualIncrement = (increment: number) => {
    setBidFeedback(null);
    const res = placeIncrementBid(increment, selectedAttributeTeam);
    if (res.success) {
      setBidFeedback({
        type: 'success',
        message: `✓ Quick bid (+${formatPointsWithLabel(increment)}) confirmed for ${currentSelectedTeam.name}! New Highest Bid: ${formatPointsWithLabel(currentBid + increment)}`,
      });
    } else {
      setBidFeedback({
        type: 'error',
        message: res.message,
      });
      sound.playWarning();
    }
  };

  const handleNextLotClick = () => {
    const res = advanceNextLot();
    if (!res.success) {
      alert(res.message);
    }
  };

  const filteredHistoryPlayers = players.filter((p) => {
    if (resultsFilter === 'ALL') return p.status === 'SOLD' || p.status === 'UNSOLD';
    return p.status === resultsFilter;
  });

  // Calculate timer ring percentage
  const timerPercent = (timerSeconds / 15) * 100;
  const isUrgentTimer = timerSeconds <= 4;

  const categories: Role[] = ['Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper'];

  return (
    <div className="w-full flex flex-col gap-5 py-4 px-4 lg:px-8 max-w-[1780px] mx-auto select-none">
      {/* ========================================================= */}
      {/* Top Telemetry & Audio Dispatcher Bar */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* Main 3-Column Tactical Command Hub */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* COLUMN 1: CATEGORY SELECTION & ELIGIBLE QUEUE (xl:col-span-4) */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* CATEGORY SELECTOR CARD */}
          <div className="bg-[#0D131F] border border-cyan-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#00D2FF]" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  AUCTION CATEGORY SELECTOR
                </span>
              </div>
              <span className="font-mono text-[10px] text-cyan-400 font-bold">
                MANDATORY RULE: ASCENDING BASE PRICE
              </span>
            </div>

            {/* 4 Category Selector Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const availableCount = getCategoryEligiblePlayers(cat).length;
                const totalCount = getCategoryAllPlayers(cat).length;
                const categoryLabel =
                  cat === 'Batter' ? 'Batsman' : cat === 'Wicketkeeper' ? 'Wicket Keeper' : cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-2.5 rounded-xl font-heading text-xs font-bold tracking-wider uppercase transition-all flex flex-col items-start gap-1 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#00D2FF] text-[#003543] border-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.4)] font-black scale-[1.02]'
                        : 'bg-[#151D2E] text-slate-300 hover:text-white hover:bg-[#1E293B] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{categoryLabel}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#003543] animate-ping"></span>}
                    </div>
                    <span
                      className={`font-mono text-[10px] font-normal ${
                        isSelected ? 'text-[#003543]/90 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {availableCount} Available / {totalCount} Total
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Obvious Current Category Indicator */}
            <div className="p-2.5 rounded-xl bg-[#151D2E] border border-cyan-500/30 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse"></span>
                <span className="text-slate-400 text-[11px]">ACTIVE POOL:</span>
                <span className="font-black text-[#00D2FF] uppercase">
                  {selectedCategory === 'Batter'
                    ? 'Batsman'
                    : selectedCategory === 'Wicketkeeper'
                    ? 'Wicket Keeper'
                    : selectedCategory}
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">
                {categoryEligiblePlayers.length} ELIGIBLE QUEUED
              </span>
            </div>
          </div>

          {/* CATEGORY QUEUE & HISTORY TABS */}
          <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col flex-1">
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setHistoryTab('queue')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    historyTab === 'queue'
                      ? 'bg-[#00D2FF] text-[#003543] shadow-md'
                      : 'bg-[#151D2E] text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{selectedCategory.toUpperCase()} QUEUE</span>
                </button>
                <button
                  onClick={() => setHistoryTab('results')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    historyTab === 'stream'
                      ? 'bg-[#00D2FF] text-[#003543] shadow-md'
                      : 'bg-[#151D2E] text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>LIVE AUDIT</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CATEGORY QUEUE (Sorted ascending by base points, excluding sold/in-ring) */}
            {historyTab === 'queue' && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">VIEW:</span>
                    <button
                      onClick={() => setQueueMode('eligible')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        queueMode === 'eligible'
                          ? 'bg-[#00D2FF] text-[#003543]'
                          : 'bg-[#151D2E] text-slate-400 hover:text-white'
                      }`}
                    >
                      ELIGIBLE QUEUE ({categoryEligiblePlayers.length})
                    </button>
                    <button
                      onClick={() => setQueueMode('all')}
                      className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                        queueMode === 'all'
                          ? 'bg-[#00D2FF] text-[#003543]'
                          : 'bg-[#151D2E] text-slate-400 hover:text-white'
                      }`}
                    >
                      ALL LOTS ({categoryAllPlayers.length})
                    </button>
                  </div>
                  <span className="text-cyan-400 font-bold">
                    SORTED: BASE POINTS ASCENDING
                  </span>
                </div>

                {queueMode === 'eligible' && categoryEligiblePlayers.length === 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                    <p className="font-heading font-bold text-amber-400 text-xs uppercase">
                      ⚠️ ALL {(selectedCategory === 'Batter' ? 'Batsman' : selectedCategory === 'Wicketkeeper' ? 'Wicket Keeper' : selectedCategory).toUpperCase()}S COMPLETED
                    </p>
                    <p className="font-mono text-[11px] text-slate-300 mt-1">
                      No eligible {selectedCategory === 'Batter' ? 'Batsman' : selectedCategory === 'Wicketkeeper' ? 'Wicket Keeper' : selectedCategory}s remaining in available queue. Please select another category above.
                    </p>
                  </div>
                )}

                {/* Player List */}
                <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {(queueMode === 'eligible' ? categoryEligiblePlayers : categoryAllPlayers).map((p) => {
                    const isInRing = p.status === 'IN_RING';
                    const isSold = p.status === 'SOLD';
                    const isUnsold = p.status === 'UNSOLD';
                    const isNextOnDeck = nextPlayerOnDeck?.id === p.id;
                    const soldTeam = teams.find((t) => t.id === p.soldToTeamId);
                    const profile = getPlayerProfile(p);

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs font-mono ${
                          isInRing
                            ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                            : isNextOnDeck
                            ? 'bg-[#151D2E] border-cyan-400/50 shadow-[0_0_15px_rgba(0,210,255,0.1)]'
                            : 'bg-[#151D2E] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div
                          onClick={() => openPlayerProfile(p)}
                          className="flex items-center gap-3 min-w-0 cursor-pointer group"
                          title="Click to view full registration profile dossier"
                        >
                          {/* Photo */}
                          <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10 group-hover:border-cyan-400 transition-colors">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
                                {p.name}
                              </span>
                              {profile.employeeId && (
                                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                                  {profile.employeeId}
                                </span>
                              )}
                              {isNextOnDeck && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold">
                                  NEXT
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {profile.department} • {profile.workLocation}
                            </span>
                            <span className="font-mono text-cyan-400 font-bold text-[11px] block mt-0.5">
                              Base Points: {formatPoints(p.basePrice)} Points
                            </span>
                          </div>
                        </div>

                        {/* Status / Action */}
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => openPlayerProfile(p)}
                            title="View full registration profile dossier"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {isInRing ? (
                            <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-bold animate-pulse">
                              IN AUCTION
                            </span>
                          ) : isSold && soldTeam ? (
                            <div>
                              <span
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                style={{
                                  backgroundColor: `${soldTeam.color}20`,
                                  color: soldTeam.color,
                                }}
                              >
                                SOLD: {soldTeam.shortName}
                              </span>
                              <span className="text-white text-[10px] font-bold block mt-0.5">
                                {formatPoints(p.soldPrice)} Points
                              </span>
                            </div>
                          ) : isUnsold ? (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">
                              UNSOLD
                            </span>
                          ) : (
                            <button
                              onClick={() => loadPlayerToRing(p.id)}
                              className="px-2.5 py-1 rounded bg-[#00D2FF] hover:bg-cyan-300 text-[#003543] font-mono text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                            >
                              <Gavel className="w-3 h-3" />
                              <span>LOAD TO AUCTION</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: RESULTS TABLE */}
            {historyTab === 'results' && (
              <div className="flex flex-col flex-1">
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
                    {filteredHistoryPlayers.length} LOTS
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[320px] overflow-y-auto pr-1">
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
                      {filteredHistoryPlayers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-500 text-xs">
                            No lot records match filter.
                          </td>
                        </tr>
                      ) : (
                        filteredHistoryPlayers.map((p) => {
                          const soldTeam = teams.find((t) => t.id === p.soldToTeamId);
                          return (
                            <tr
                              key={p.id}
                              onClick={() => {
                                const idx = players.findIndex((item) => item.id === p.id);
                                if (idx !== -1) goToLot(idx);
                              }}
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
                                {p.soldPrice ? `${formatPoints(p.soldPrice)} Points` : '—'}
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
            )}

            {/* TAB 3: LIVE AUDIT STREAM */}
            {historyTab === 'stream' && (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] font-mono text-xs pr-1">
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
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: CENTER STAGE HAMMER & EXECUTIVE DECK (xl:col-span-5) */}
        {/* ========================================================= */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          {/* Main Gavel Cockpit Card */}
          <div className="bg-[#0D131F] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header Telemetry Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-mono text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  LIVE BIDDING ROUND
                </span>
                <span className="font-mono text-xs text-slate-400">
                  LOT #{activePlayer?.lotNumber.toString().padStart(2, '0')} • {activePlayer?.role}
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

            {/* Current In Ring Athlete Mini Card */}
            {activePlayer && (
              <div
                onClick={() => openPlayerProfile(activePlayer)}
                className="mt-4 p-3 bg-[#151D2E] border border-white/10 hover:border-cyan-400/50 rounded-xl flex items-center justify-between gap-3 relative z-10 transition-colors cursor-pointer group"
                title="Click to view full player profile dossier"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activePlayer.image}
                    alt={activePlayer.name}
                    className="w-12 h-14 rounded-lg object-cover bg-slate-800 shrink-0 group-hover:border group-hover:border-cyan-400 transition-colors"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-white text-base truncate group-hover:text-cyan-300 transition-colors">
                        {activePlayer.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[#00D2FF] font-mono text-[10px] font-bold">
                        {activePlayer.tier}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#F59E0B] font-semibold block truncate">
                      {activePlayer.specialism}
                    </span>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
                      <span>Base Points: <strong className="text-white">{formatPoints(activePlayer.basePrice)} Points</strong></span>
                      <span>•</span>
                      <span>{activePlayer.cluster}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPlayerProfile(activePlayer);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-mono text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>DOSSIER</span>
                </button>
              </div>
            )}

            {/* Central Numbers Grid */}
            <div className="my-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10">
              {/* Valuation Card (md:col-span-7) */}
              <div className="md:col-span-7 bg-[#151D2E] border border-white/10 p-4 rounded-2xl shadow-inner flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    CURRENT HIGHEST BID
                  </span>
                  <div className="font-mono text-4xl sm:text-5xl text-[#00D2FF] font-black tracking-tight my-1 flex items-baseline drop-shadow-[0_0_20px_rgba(0,210,255,0.4)]">
                    <span>{formatPoints(currentBid)}</span>
                    <span className="text-xl sm:text-2xl text-cyan-400 font-bold ml-2">Points</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">LEADING:</span>
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

              {/* Countdown Dial (md:col-span-5) */}
              <div className="md:col-span-5 bg-[#151D2E] border border-white/10 p-4 rounded-2xl shadow-inner flex flex-col items-center justify-center text-center min-h-[140px]">
                <span className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  GAVEL COUNTDOWN
                </span>

                <div className="relative w-20 h-20 my-1 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-slate-800" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="7" />
                    <circle
                      className={`transition-all duration-1000 ease-linear ${isUrgentTimer ? 'text-red-500' : 'text-[#00D2FF]'}`}
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
                      className={`font-mono text-2xl font-black tracking-tight leading-none ${
                        isUrgentTimer ? 'text-red-400 animate-pulse' : 'text-white'
                      }`}
                    >
                      {timerSeconds.toString().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[8px] text-slate-400 mt-0.5">SEC</span>
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
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Broadcast Banner */}
            <div className="mb-4 p-3 bg-[#151D2E] border border-cyan-500/20 rounded-xl flex items-center justify-between text-slate-200">
              <div className="flex items-center gap-2">
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
                  className="py-3 px-3 bg-gradient-to-r from-cyan-500 to-[#00D2FF] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-[#003543] rounded-xl font-heading font-black text-sm uppercase flex flex-col items-center justify-center transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] active:scale-95 cursor-pointer"
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

                {/* NEXT LOT (Category-Based & Ascending Base Price) */}
                <button
                  onClick={handleNextLotClick}
                  disabled={!nextPlayerOnDeck}
                  className={`py-3 px-3 rounded-xl font-heading font-black text-xs uppercase flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer border ${
                    nextPlayerOnDeck
                      ? 'bg-slate-800 hover:bg-slate-700 text-[#00D2FF] border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                      : 'bg-slate-900 text-slate-600 border-white/5 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <SkipForward className="w-4 h-4" />
                    <span>NEXT LOT</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-300 font-normal truncate max-w-[140px]">
                    {nextPlayerOnDeck
                      ? `${nextPlayerOnDeck.name} (${formatPoints(nextPlayerOnDeck.basePrice)} Points)`
                      : `NO ${selectedCategory.toUpperCase()}S`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Floor & Telephone Bidding Dispatcher Module */}
          <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00D2FF]" />
                <span className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                  FLOOR / TELEPHONE BID DISPATCHER
                </span>
              </div>
              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                CHAIR OVERRIDE PERMITTED
              </span>
            </div>

            {/* Live Telemetry: Current Highest Bid & Selected Team's Available Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#151D2E] rounded-xl border border-white/5 font-mono text-xs">
              <div className="flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  CURRENT HIGHEST BID
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-amber-400 text-lg sm:text-xl font-bold font-mono">
                    {formatPoints(currentBid)}
                  </span>
                  <span className="text-xs text-cyan-400 font-bold">Points</span>
                </div>
                <span className="text-[11px] text-slate-400 truncate mt-0.5">
                  Leader:{' '}
                  {highestBidder ? (
                    <span className="font-bold text-white" style={{ color: highestBidder.color }}>
                      {highestBidder.name} ({highestBidder.paddleNumber})
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">No bidder yet</span>
                  )}
                </span>
              </div>

              <div className="flex flex-col justify-between sm:border-l sm:border-white/10 sm:pl-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {currentSelectedTeam.shortName} AVAILABLE POINTS
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-emerald-400 text-lg sm:text-xl font-bold font-mono">
                    {formatPoints(currentSelectedTeam.remainingPurse)}
                  </span>
                  <span className="text-xs text-cyan-400 font-bold">Points</span>
                </div>
                <span className="text-[11px] text-slate-400 truncate mt-0.5">
                  Max Safe Bid: <strong className="text-cyan-300 font-mono">{formatPoints(maxSafeBidForSelected)} Points</strong>
                </span>
              </div>
            </div>

            {/* Franchise Attribute Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
                  SELECT BIDDING FRANCHISE:
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Paddle: <strong className="text-white">{currentSelectedTeam.paddleNumber}</strong> • {11 - currentSelectedTeam.squadCount} slots needed
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {teams.map((t) => {
                  const isSelected = selectedAttributeTeam === t.id;
                  const isLeader = highestBidder?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedAttributeTeam(t.id);
                        setBidFeedback(null);
                      }}
                      className={`px-3 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-[#1E293B] text-white ring-2 ring-cyan-400 shadow-md'
                          : 'bg-[#151D2E] text-slate-400 hover:text-white border-white/5'
                      }`}
                      style={{ borderColor: isSelected ? t.color : undefined }}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{t.shortName}</span>
                        {isLeader && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                            LEAD
                          </span>
                        )}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }}></span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Increment Buttons: +10,000 Points, +25,000 Points, +50,000 Points */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
                QUICK BID INCREMENTS:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleManualIncrement(10000)}
                  className="py-2.5 px-2 bg-[#151D2E] hover:bg-[#00D2FF] hover:text-[#003543] rounded-xl font-heading text-xs font-bold text-[#00D2FF] border border-cyan-500/30 transition-all text-center cursor-pointer active:scale-95 shadow-sm"
                >
                  +10,000 Points
                </button>
                <button
                  type="button"
                  onClick={() => handleManualIncrement(25000)}
                  className="py-2.5 px-2 bg-[#151D2E] hover:bg-[#00D2FF] hover:text-[#003543] rounded-xl font-heading text-xs font-bold text-[#00D2FF] border border-cyan-500/30 transition-all text-center cursor-pointer active:scale-95 shadow-sm"
                >
                  +25,000 Points
                </button>
                <button
                  type="button"
                  onClick={() => handleManualIncrement(50000)}
                  className="py-2.5 px-2 bg-[#151D2E] hover:bg-[#00D2FF] hover:text-[#003543] rounded-xl font-heading text-xs font-bold text-[#00D2FF] border border-cyan-500/30 transition-all text-center cursor-pointer active:scale-95 shadow-sm"
                >
                  +50,000 Points
                </button>
              </div>
            </div>

            {/* Custom Points Bidding Control: Input & PLACE CUSTOM BID Button */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
                  CUSTOM TOTAL POINTS BID:
                </span>
                <span className="font-mono text-[10px] text-cyan-400">
                  Target: New total valuation (Min: {formatPoints(currentBid + 10000)} Points)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1 flex items-center gap-2 bg-[#151D2E] px-3.5 py-2.5 rounded-xl border border-white/10 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                  <span className="text-[#00D2FF] font-mono font-bold text-xs shrink-0">PTS</span>
                  <input
                    type="number"
                    min={currentBid + 10000}
                    step="1000"
                    placeholder="Enter custom points"
                    value={customBidInput}
                    onChange={(e) => {
                      setCustomBidInput(e.target.value);
                      if (bidFeedback) setBidFeedback(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCustomBid();
                      }
                    }}
                    className="w-full bg-transparent text-white font-mono text-sm font-semibold focus:outline-none placeholder:text-slate-600"
                  />
                  {customBidInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomBidInput('');
                        setBidFeedback(null);
                      }}
                      className="text-slate-500 hover:text-white font-mono text-xs px-1 cursor-pointer"
                      title="Clear input"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleApplyCustomBid}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 via-[#00D2FF] to-blue-500 hover:brightness-110 active:scale-95 text-[#003543] rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] shrink-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  <span>PLACE CUSTOM BID</span>
                </button>
              </div>
            </div>

            {/* Validation Feedback Banner */}
            {bidFeedback && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-mono transition-all animate-in fade-in duration-150 ${
                  bidFeedback.type === 'error'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                }`}
              >
                {bidFeedback.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-semibold leading-relaxed">{bidFeedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBidFeedback(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: TEAM POINTS BUDGETS (xl:col-span-3) */}
        {/* ========================================================= */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Team Points Budget Matrix */}
          <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                TEAM POINTS BUDGETS
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
                        {formatPoints(team.remainingPurse)} Points
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
                      <span>Squad: {team.squadCount}/{team.maxSquad}</span>
                      <span>Reserve Cap: {formatPoints((team.maxSquad - team.squadCount) * 20000)} Points</span>
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
                alert('Resync broadcast signal triggered across all team consoles.');
              }}
              className="py-2 px-3 bg-[#151D2E] hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>RESYNC ALL CONSOLES</span>
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
