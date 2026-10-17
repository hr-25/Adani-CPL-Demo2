import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Gavel,
  History,
  Users,
  Wallet,
  TrendingUp,
  Volume2,
  Lock,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatPoints, formatPointsWithLabel } from '../../utils/formatters';
import { sound } from '../../utils/soundEngine';

export const TeamManager: React.FC = () => {
  const {
    teams,
    players,
    activePlayer,
    currentBid,
    highestBidder,
    highestBidderTeamId,
    selectedTeamId,
    setSelectedTeamId,
    placeBid,
    placeIncrementBid,
    timerSeconds,
    validateBid,
    openPlayerProfile,
  } = useAuction();

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const isWinningBidder = highestBidderTeamId === currentTeam.id;

  const nextBidIncrement = currentBid >= 200000 ? 20000 : 10000;
  const nextTargetBid = currentBid + nextBidIncrement;

  const validation = validateBid(currentTeam.id, nextTargetBid);
  const canPlaceBid = validation.valid && !isWinningBidder;

  // Remaining slots & reserve check
  const remainingSlots = currentTeam.maxSquad - currentTeam.squadCount - 1;
  const reserveNeeded = Math.max(0, remainingSlots) * currentTeam.minReservePerSlot;
  const maxSafeBid = Math.max(0, currentTeam.remainingPurse - reserveNeeded);
  const purseAfterNextBid = currentTeam.remainingPurse - nextTargetBid;

  // Custom Bidding State
  const [customBidInput, setCustomBidInput] = useState<string>('');
  const [bidFeedback, setBidFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dynamic preview for custom bid
  const customBidParsed = parseInt(customBidInput.trim(), 10);
  const isCustomInputValidNum = !isNaN(customBidParsed) && customBidParsed > 0;
  const purseAfterCustomBid = isCustomInputValidNum ? currentTeam.remainingPurse - customBidParsed : null;
  const isCustomBidOverSafeMax = isCustomInputValidNum && customBidParsed > maxSafeBid;

  // Players acquired by this team
  const mySquadPlayers = players.filter((p) => p.soldToTeamId === currentTeam.id);

  // Recently sold players in general
  const recentSoldPlayers = players
    .filter((p) => p.status === 'SOLD' || p.status === 'UNSOLD')
    .slice(-5);

  const handleBidClick = () => {
    setBidFeedback(null);
    if (!canPlaceBid) return;
    const res = placeBid(currentTeam.id, nextTargetBid);
    if (res.success) {
      setBidFeedback({
        type: 'success',
        message: `✓ Quick bid of ${formatPointsWithLabel(nextTargetBid)} placed for ${currentTeam.name}!`,
      });
    } else {
      setBidFeedback({
        type: 'error',
        message: res.message,
      });
      sound.playWarning();
    }
  };

  const handleApplyCustomBid = () => {
    setBidFeedback(null);

    if (!activePlayer || activePlayer.status !== 'IN_RING') {
      const msg = 'No active player is currently under the hammer in the auction ring.';
      setBidFeedback({ type: 'error', message: msg });
      sound.playWarning();
      return;
    }

    if (!customBidInput || customBidInput.trim() === '') {
      const msg = 'Please enter a valid bid amount in Points.';
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

    if (val <= currentBid) {
      const msg = `Custom bid of ${formatPointsWithLabel(val)} must be higher than the Current Highest Bid (${formatPointsWithLabel(currentBid)}).`;
      setBidFeedback({ type: 'error', message: msg });
      sound.playWarning();
      return;
    }

    const minIncrement = 10000;
    if (val - currentBid < minIncrement) {
      const msg = `Custom bid must follow the minimum bid increment of at least ${formatPointsWithLabel(minIncrement)} above Current Highest Bid (Minimum required: ${formatPointsWithLabel(currentBid + minIncrement)}).`;
      setBidFeedback({ type: 'error', message: msg });
      sound.playWarning();
      return;
    }

    if (val > currentTeam.remainingPurse) {
      const msg = `Custom bid of ${formatPointsWithLabel(val)} exceeds ${currentTeam.shortName}'s available Points Balance (${formatPointsWithLabel(currentTeam.remainingPurse)}).`;
      setBidFeedback({ type: 'error', message: msg });
      sound.playWarning();
      return;
    }

    if (val > maxSafeBid) {
      const msg = `Reserve Rule Violation: Minimum ${formatPointsWithLabel(reserveNeeded)} must be preserved for ${remainingSlots} remaining squad slots. Maximum safe bid for ${currentTeam.shortName} is ${formatPointsWithLabel(maxSafeBid)}.`;
      setBidFeedback({ type: 'error', message: msg });
      sound.playWarning();
      return;
    }

    const res = placeBid(currentTeam.id, val);
    if (res.success) {
      setCustomBidInput('');
      setBidFeedback({
        type: 'success',
        message: `✓ Custom bid of ${formatPointsWithLabel(val)} confirmed for ${currentTeam.name}! You now hold the highest bid.`,
      });
    } else {
      setBidFeedback({
        type: 'error',
        message: res.message,
      });
      sound.playWarning();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 py-6 px-4 lg:px-8 max-w-[1600px] mx-auto">
      {/* Franchise Switcher Bar */}
      <div className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400" />
          <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            AUTHENTICATED TEAM WAR ROOM PADDLE:
          </span>
        </div>

        {/* Team Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {teams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            return (
              <button
                key={team.id}
                onClick={() => {
                  setSelectedTeamId(team.id);
                  setBidFeedback(null);
                  setCustomBidInput('');
                }}
                className={`px-3.5 py-2 rounded-xl font-heading text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#151D2E] text-white shadow-lg ring-2'
                    : 'bg-[#151D2E]/60 text-slate-400 hover:text-white border-white/5'
                }`}
                style={{
                  borderColor: isSelected ? team.color : undefined,
                  // @ts-ignore
                  ringColor: isSelected ? team.color : undefined,
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }}></span>
                <span>{team.shortName}</span>
                <span className="font-mono text-[10px] text-slate-400">{team.paddleNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP SECTION: TEAM SUMMARY & PURSE TELEMETRY */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: Team Financial Card (xl:col-span-8) */}
        <div className="xl:col-span-8 bg-[#0D131F] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: currentTeam.color }}
          ></div>

          <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-xl shadow-lg"
                style={{ backgroundColor: currentTeam.color, color: '#070B12' }}
              >
                {currentTeam.shortName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-heading text-2xl text-white font-black tracking-tight uppercase">
                    {currentTeam.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-white/10 text-white">
                    {currentTeam.paddleNumber}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-400 mt-1">
                  Manager: <span className="text-white font-semibold">{currentTeam.manager}</span> • {currentTeam.division}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                BIDDING DESK ACTIVE
              </span>
            </div>
          </div>

          {/* 4 Points Meters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 bg-[#151D2E]/80 p-4 rounded-xl border border-white/5 relative z-10">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-slate-400 uppercase">POINTS REMAINING</span>
              <div className="font-mono text-2xl font-bold text-white mt-1">
                {formatPoints(currentTeam.remainingPurse)}
              </div>
              <span className="text-[11px] text-cyan-400 font-mono mt-0.5">
                Starting Points: {formatPoints(currentTeam.startingPurse)} Points
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-slate-400 uppercase">POINTS SPENT</span>
              <div className="font-mono text-2xl font-bold text-amber-400 mt-1">
                {formatPoints(currentTeam.startingPurse - currentTeam.remainingPurse)}
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5">Verified Ledger</span>
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-slate-400 uppercase">SQUAD ACQUIRED</span>
              <div className="font-mono text-2xl font-bold text-white mt-1 flex items-baseline gap-1">
                <span>{currentTeam.squadCount}</span>
                <span className="text-sm text-slate-500 font-normal">/ 11</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono mt-0.5">
                {11 - currentTeam.squadCount} Slots Needed
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-slate-400 uppercase">MAXIMUM SAFE BID</span>
              <div className="font-mono text-2xl font-bold text-cyan-400 mt-1">
                {formatPoints(Math.max(0, currentTeam.remainingPurse - reserveNeeded))}
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-0.5">Reserve Guarded</span>
            </div>
          </div>

          {/* Reserve Alert Bar */}
          <div className="mt-3.5 flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-[#151D2E] text-slate-400 text-xs border border-white/5">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong className="text-white">Reserve Requirement:</strong> Min. points reserved for{' '}
                {11 - currentTeam.squadCount} remaining squad slots ({formatPoints(currentTeam.minReservePerSlot)} Points base). Points guard is active.
              </span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold shrink-0">
              GUARD ACTIVE
            </span>
          </div>
        </div>

        {/* Right: Desk Identity (xl:col-span-4) */}
        <div className="xl:col-span-4 bg-[#0D131F] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 font-mono text-xs">
              <span>AUTHORIZED BIDDER</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> SECURE DESK
              </span>
            </div>

            <h2 className="font-heading text-xl font-bold text-white mt-2">{currentTeam.manager}</h2>
            <p className="font-mono text-xs text-cyan-400">{currentTeam.name} Authorized Delegate</p>
          </div>

          <div className="space-y-2.5 my-4 font-mono text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-[#151D2E] border border-white/5">
              <span className="text-slate-400">AUCTION NETWORK:</span>
              <span className="text-cyan-400 font-bold">SYNCHRONIZED (12ms)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#151D2E] border border-white/5">
              <span className="text-slate-400">CURRENT ROUND:</span>
              <span className="text-amber-400 font-bold">
                LOT #{activePlayer?.lotNumber || 4} • {activePlayer?.tier || 'MARQUEE'}
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 font-mono">
            <span>Simulation Note: State is shared instantaneously across all demo stations.</span>
          </div>
        </div>
      </div>

      {/* MAIN CENTER SECTION: 2-COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Current Lot Profile (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#0D131F] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {activePlayer ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                    LOT #{activePlayer.lotNumber.toString().padStart(2, '0')}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    UNDER THE HAMMER
                  </span>
                </div>
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase">{activePlayer.role}</span>
              </div>

              {/* Player Portrait & Card */}
              <div
                onClick={() => openPlayerProfile(activePlayer)}
                className="bg-[#151D2E] p-4 rounded-2xl border border-white/5 mb-4 flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:border-cyan-500/30 transition-all group"
                title="Click to view full player profile"
              >
                <div className="relative w-28 h-32 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 shadow-md">
                  <img src={activePlayer.image} alt={activePlayer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white">
                    LOT #{activePlayer.lotNumber}
                  </span>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <span className="inline-block px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold mb-1">
                    {activePlayer.role.toUpperCase()}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{activePlayer.name}</h3>
                  <p className="font-mono text-xs text-[#F59E0B] font-semibold">{activePlayer.specialism}</p>
                  <p className="text-xs text-slate-400 mt-1">{activePlayer.cluster}</p>
                  <p className="text-[11px] text-slate-500 truncate">{activePlayer.department}</p>
                </div>
              </div>

              {/* Player Detailed Matrices */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2.5 rounded-xl bg-[#151D2E] border border-white/5">
                  <span className="text-slate-400">Batting / Bowling</span>
                  <span className="text-white font-semibold">{activePlayer.specialism}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-[#151D2E] border border-white/5">
                  <span className="text-slate-400">Tournament Record</span>
                  <span className="text-amber-400 font-semibold">{activePlayer.previousTournament}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-[#151D2E] border border-white/5">
                  <span className="text-slate-400">Corporate Experience</span>
                  <span className="text-white font-semibold">{activePlayer.experience}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-[#151D2E] border border-white/5">
                  <span className="text-slate-400">Base Points</span>
                  <span className="text-cyan-400 font-bold">{formatPoints(activePlayer.basePrice)} Points</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 font-mono">No active player lot in ring.</div>
          )}
        </div>

        {/* Right Column: Primary Live Bid Action Center (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-[#0D131F] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-col gap-5">
            {/* Top Bid Numbers + Clock */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Active Bid Display */}
              <div className="md:col-span-7 bg-[#151D2E] border border-white/10 p-5 rounded-2xl shadow-inner flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    CURRENT HIGHEST BID
                  </span>
                  <div className="font-mono text-3xl sm:text-4xl text-white font-black tracking-tight my-1 flex items-baseline gap-2">
                    <span>{formatPoints(currentBid)}</span>
                    <span className="text-xl sm:text-2xl text-cyan-400 font-bold">Points</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="font-mono text-[11px] text-slate-400">HELD BY:</span>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold"
                    style={{
                      backgroundColor: highestBidder?.glowColor || 'rgba(0,210,255,0.2)',
                      color: highestBidder?.color || '#00D2FF',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: highestBidder?.color || '#00D2FF' }}
                    ></span>
                    <span>
                      {highestBidder
                        ? `${highestBidder.name} ${isWinningBidder ? '(YOU)' : ''}`
                        : 'NO BIDDER YET'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown Dial */}
              <div className="md:col-span-5 bg-[#151D2E] border border-white/10 p-5 rounded-2xl shadow-inner flex flex-col justify-between items-center text-center">
                <span className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  GAVEL COUNTDOWN
                </span>

                <div className="my-1">
                  <span
                    className={`font-mono text-4xl font-black ${
                      timerSeconds <= 4 ? 'text-red-400 animate-pulse' : 'text-amber-400'
                    }`}
                  >
                    {timerSeconds.toString().padStart(2, '0')}
                  </span>
                  <span className="block font-mono text-[10px] text-slate-500">SECONDS REMAINING</span>
                </div>

                <span
                  className={`font-mono text-[11px] font-bold ${
                    timerSeconds <= 4 ? 'text-red-400 animate-pulse' : 'text-slate-400'
                  }`}
                >
                  {timerSeconds <= 4 ? 'FINAL CALL / HAMMER FALLING' : 'ROUND ACTIVE'}
                </span>
              </div>
            </div>

            {/* Dynamic Status Callout Banner */}
            <div
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                isWinningBidder
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    isWinningBidder ? 'bg-emerald-500 text-slate-900' : 'bg-rose-500 text-white'
                  }`}
                >
                  {isWinningBidder ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-heading font-bold text-sm tracking-wide">
                    {isWinningBidder
                      ? '✓ YOU CURRENTLY HOLD THE HIGHEST BID'
                      : 'OUTBID — ANOTHER FRANCHISE HOLDS THE LEAD'}
                  </div>
                  <p className="font-mono text-xs opacity-80 mt-0.5">
                    {isWinningBidder
                      ? `Your paddle (${currentTeam.paddleNumber}) leads Lot #${activePlayer?.lotNumber}. Awaiting counters.`
                      : `Target bid to regain lead: ${formatPoints(nextTargetBid)} Points`}
                  </p>
                </div>
              </div>

              <span
                className={`font-mono text-xs font-bold px-3 py-1 rounded-lg ${
                  isWinningBidder ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isWinningBidder ? 'IN THE LEAD' : 'OUTBID'}
              </span>
            </div>

            {/* THE BIG ACTION BUTTON: PLACE BID */}
            <div className="flex flex-col gap-3">
              {isWinningBidder ? (
                /* Already winning state */
                <div className="w-full py-8 px-6 rounded-2xl bg-[#151D2E] border border-emerald-500/40 shadow-xl flex flex-col items-center justify-center text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                  <h4 className="font-heading text-xl font-bold text-emerald-400 uppercase tracking-tight">
                    YOU HOLD THE HIGHEST BID
                  </h4>
                  <p className="font-mono text-sm text-white mt-1">
                    Current Bid: <span className="text-amber-400 font-bold">{formatPoints(currentBid)} Points</span>
                  </p>
                  <p className="font-mono text-xs text-slate-400 mt-2">
                    Waiting for another franchise to raise the paddle before you can counter...
                  </p>
                </div>
              ) : (
                /* Active Bid Button */
                <button
                  onClick={handleBidClick}
                  disabled={!canPlaceBid}
                  className={`w-full py-6 px-6 rounded-2xl font-heading text-2xl font-black uppercase tracking-wider transition-all shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-98 cursor-pointer ${
                    canPlaceBid
                      ? 'bg-gradient-to-r from-cyan-400 via-[#00D2FF] to-blue-500 hover:brightness-110 text-[#003543] shadow-[0_0_40px_rgba(0,210,255,0.4)]'
                      : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Gavel className="w-6 h-6" />
                    <span>PLACE BID: {formatPoints(nextTargetBid)} Points</span>
                  </div>
                  <span className="font-mono text-xs font-bold tracking-normal opacity-90">
                    {canPlaceBid
                      ? `RAISE BID (+${formatPoints(nextBidIncrement)} Points) VIA PADDLE ${currentTeam.paddleNumber}`
                      : validation.reason || 'INSUFFICIENT POINTS BALANCE / SQUAD RESERVE'}
                  </span>
                </button>
              )}

              {/* Points impact preview */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#151D2E] font-mono text-xs text-slate-400 border border-white/5">
                <span>Points Remaining after this bid:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">
                    {formatPoints(Math.max(0, purseAfterNextBid))} Points
                  </span>
                  <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded">
                    ● SQUAD RESERVE COMPLIANT
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CUSTOM POINTS BID SECTION */}
            {/* ========================================================= */}
            <div className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-3.5">
              {/* Section Title Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                    CUSTOM POINTS BID
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                  DIRECT TOTAL ENTRY • PADDLE {currentTeam.paddleNumber}
                </span>
              </div>

              {/* Telemetry Strip: Current Highest Bid, Points Balance, Min Increment, Max Safe Bid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                <div className="bg-[#151D2E] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">CURRENT HIGHEST BID</span>
                  <span className="text-amber-400 font-bold text-sm truncate block mt-0.5">
                    {formatPoints(currentBid)} Points
                  </span>
                </div>

                <div className="bg-[#151D2E] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">{currentTeam.shortName} BALANCE</span>
                  <span className="text-emerald-400 font-bold text-sm truncate block mt-0.5">
                    {formatPoints(currentTeam.remainingPurse)} Points
                  </span>
                </div>

                <div className="bg-[#151D2E] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">MIN INCREMENT</span>
                  <span className="text-cyan-400 font-bold text-sm truncate block mt-0.5">
                    +{formatPoints(10000)} Points
                  </span>
                </div>

                <div className="bg-[#151D2E] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">MAX SAFE BID</span>
                  <span className="text-white font-bold text-sm truncate block mt-0.5">
                    {formatPoints(maxSafeBid)} Points
                  </span>
                </div>
              </div>

              {/* Quick Increment Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="text-slate-500 text-[10px] uppercase">PRESETS:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomBidInput((currentBid + 10000).toString());
                    setBidFeedback(null);
                  }}
                  className="px-2.5 py-1 bg-[#151D2E] hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 text-[11px] font-bold transition-all cursor-pointer"
                >
                  Min Required ({formatPoints(currentBid + 10000)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomBidInput((currentBid + 25000).toString());
                    setBidFeedback(null);
                  }}
                  className="px-2.5 py-1 bg-[#151D2E] hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 text-[11px] font-bold transition-all cursor-pointer"
                >
                  +25,000 Points
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomBidInput((currentBid + 50000).toString());
                    setBidFeedback(null);
                  }}
                  className="px-2.5 py-1 bg-[#151D2E] hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 text-[11px] font-bold transition-all cursor-pointer"
                >
                  +50,000 Points
                </button>
              </div>

              {/* Numeric Input & PLACE CUSTOM BID Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1 flex items-center gap-2 bg-[#151D2E] px-3.5 py-3 rounded-xl border border-white/10 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
                  <span className="text-[#00D2FF] font-mono font-bold text-xs shrink-0">PTS</span>
                  <input
                    type="number"
                    min={currentBid + 10000}
                    step="1000"
                    placeholder="Enter bid amount in Points"
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
                    className="w-full bg-transparent text-white font-mono text-sm font-semibold focus:outline-none placeholder:text-slate-500"
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
                  className="py-3 px-5 bg-gradient-to-r from-cyan-400 via-[#00D2FF] to-blue-500 hover:brightness-110 text-[#003543] rounded-xl font-heading text-xs font-black tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(0,210,255,0.3)] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <Gavel className="w-4 h-4" />
                  <span>PLACE CUSTOM BID</span>
                </button>
              </div>

              {/* Dynamic Points Remaining Preview for Custom Bid */}
              {isCustomInputValidNum && (
                <div
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl font-mono text-xs border transition-all ${
                    isCustomBidOverSafeMax
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-[#151D2E] border-white/5 text-slate-300'
                  }`}
                >
                  <span>Points Remaining after this Custom Bid:</span>
                  <div className="flex items-center gap-2 font-bold">
                    <span className={isCustomBidOverSafeMax ? 'text-rose-400' : 'text-cyan-300'}>
                      {formatPoints(Math.max(0, purseAfterCustomBid || 0))} Points
                    </span>
                    {isCustomBidOverSafeMax ? (
                      <span className="text-[10px] text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                        ⚠ EXCEEDS MAX SAFE BID ({formatPoints(maxSafeBid)} Points)
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        ● RESERVE SAFE
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Alert Banner (Error / Success Messages) */}
              {bidFeedback && (
                <div
                  className={`p-3 rounded-xl font-mono text-xs border flex items-center gap-2.5 transition-all animate-in fade-in duration-150 ${
                    bidFeedback.type === 'success'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-rose-950/50 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  }`}
                >
                  {bidFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="font-semibold leading-relaxed">{bidFeedback.message}</span>
                </div>
              )}

              {/* Contextual Rule Guidance */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                <span>Total valuation entry • Points are deducted only if player is marked SOLD.</span>
                <span>Authorized Franchise: {currentTeam.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: MY SQUAD ROSTER & RECENT GAVEL RECORD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: My Squad Roster (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-[#0D131F] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00D2FF]" />
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                  {currentTeam.shortName} SQUAD ROSTER ({currentTeam.squadCount} / 11)
                </h3>
              </div>
              <span className="font-mono text-xs text-cyan-400">
                POINTS SPENT: {formatPoints(currentTeam.startingPurse - currentTeam.remainingPurse)} Points
              </span>
            </div>

            <div className="space-y-2 mt-3 max-h-64 overflow-y-auto pr-1">
              {mySquadPlayers.length === 0 ? (
                <div className="py-6 text-center text-slate-500 font-mono text-xs">
                  No players acquired in current auction session yet.
                </div>
              ) : (
                mySquadPlayers.map((p, idx) => {
                  const isHighlighted = p.name === 'Arjun Shah';
                  return (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                        isHighlighted
                          ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                          : 'bg-[#151D2E] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-bold w-4">#{idx + 1}</span>
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0 border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-white font-heading text-sm">{p.name}</p>
                          <span className="text-[11px] text-slate-400">
                            {p.role} • {p.cluster}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${isHighlighted ? 'text-[#00D2FF] text-sm' : 'text-cyan-400'}`}>
                          {formatPoints(p.soldPrice)} Points
                        </span>
                        <span className="block text-[10px] text-slate-500">Lot #{p.lotNumber}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Recent Gavel Results (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-[#0D131F] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                  OFFICIAL AUCTION RECORD
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">{recentSoldPlayers.length} LOTS RECORDED</span>
            </div>

            <div className="space-y-2 mt-3 max-h-64 overflow-y-auto pr-1">
              {recentSoldPlayers.map((p) => {
                const soldTeam = teams.find((t) => t.id === p.soldToTeamId);
                const isMine = soldTeam?.id === currentTeam.id;

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                      isMine ? 'bg-[#151D2E] border-cyan-500/40 shadow-sm' : 'bg-[#151D2E]/60 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-bold">#{p.lotNumber.toString().padStart(2, '0')}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-heading text-sm">{p.name}</span>
                          {isMine && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[#00D2FF] text-[9px] font-bold">
                              MY SQUAD
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {p.role} • {soldTeam ? soldTeam.name : 'UNSOLD'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-white font-bold">
                        {p.soldPrice ? `${formatPoints(p.soldPrice)} Points` : '—'}
                      </span>
                      <span
                        className={`block text-[10px] font-bold ${
                          p.status === 'SOLD' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
