import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Player, Team, BidRecord, AuditLog, ViewMode } from '../types/auction';
import { INITIAL_TEAMS, INITIAL_PLAYERS, INITIAL_BIDS_LOT4, INITIAL_AUDIT_LOGS } from '../data/initialData';
import { sound } from '../utils/soundEngine';

interface AuctionContextType {
  players: Player[];
  teams: Team[];
  activePlayer: Player | null;
  activePlayerIndex: number;
  currentBid: number;
  highestBidder: Team | null;
  highestBidderTeamId: string | null;
  bidRecords: BidRecord[];
  auditLogs: AuditLog[];
  timerSeconds: number;
  timerRunning: boolean;
  isPaused: boolean;
  viewMode: ViewMode;
  selectedTeamId: string;
  soundEnabled: boolean;
  masterVolume: number;
  lastActionMessage: string;
  isSoldModalOpen: boolean;
  isUnsoldModalOpen: boolean;
  isResetModalOpen: boolean;
  nextPlayerOnDeck: Player | null;
  totalLots: number;
  completedLotsCount: number;
  
  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSelectedTeamId: (teamId: string) => void;
  placeBid: (teamId: string, customAmount?: number) => { success: boolean; message: string };
  placeIncrementBid: (increment: number, teamId?: string) => { success: boolean; message: string };
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  toggleTimerPause: () => void;
  adjustTimer: (seconds: number) => void;
  resetTimer: (seconds?: number) => void;
  triggerWarning: (stage: 'GOING ONCE' | 'GOING TWICE' | 'FINAL CALL') => void;
  confirmSold: () => void;
  confirmUnsold: () => void;
  advanceNextLot: () => void;
  goToLot: (index: number) => void;
  resetDemo: () => void;
  openSoldModal: () => void;
  closeSoldModal: () => void;
  openUnsoldModal: () => void;
  closeUnsoldModal: () => void;
  openResetModal: () => void;
  closeResetModal: () => void;
  toggleSound: () => void;
  setMasterVolume: (val: number) => void;
  validateBid: (teamId: string, bidAmount: number) => { valid: boolean; reason?: string };
}

const AuctionContext = createContext<AuctionContextType | null>(null);

const DEFAULT_TIMER = 15;

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => INITIAL_PLAYERS);
  const [teams, setTeams] = useState<Team[]>(() => INITIAL_TEAMS);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(3); // Lot #04 Arjun Shah initially
  const [currentBid, setCurrentBid] = useState<number>(240000);
  const [highestBidderTeamId, setHighestBidderTeamId] = useState<string | null>('strikers');
  const [bidRecords, setBidRecords] = useState<BidRecord[]>(() => INITIAL_BIDS_LOT4);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => INITIAL_AUDIT_LOGS);
  
  const [timerSeconds, setTimerSeconds] = useState<number>(8);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('titans');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [masterVolume, setMasterVolumeState] = useState<number>(85);
  const [lastActionMessage, setLastActionMessage] = useState<string>(
    'Stage Broadcast: Gavel ticking. Awaiting final corporate counter-bid.'
  );

  const [isSoldModalOpen, setIsSoldModalOpen] = useState<boolean>(false);
  const [isUnsoldModalOpen, setIsUnsoldModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const activePlayer = players[activePlayerIndex] || null;
  const highestBidder = teams.find((t) => t.id === highestBidderTeamId) || null;

  // Next on deck player
  const nextPlayerOnDeck = players.slice(activePlayerIndex + 1).find((p) => p.status === 'UPCOMING') || null;
  const totalLots = players.length;
  const completedLotsCount = players.filter((p) => p.status === 'SOLD' || p.status === 'UNSOLD').length;

  const timerRef = useRef<number | null>(null);

  // Timer Tick Effect
  useEffect(() => {
    if (timerRunning && !isPaused && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            sound.playCountdownTick(true);
            return 0;
          }
          if (prev <= 4) {
            sound.playCountdownTick(true);
          } else {
            sound.playCountdownTick(false);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning, isPaused, timerSeconds]);

  // Log helper
  const addAuditLog = useCallback(
    (type: AuditLog['type'], title: string, details: string, teamId?: string) => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newLog: AuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: timeStr,
        type,
        title,
        details,
        teamId,
      };
      setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    },
    []
  );

  // Validation function
  const validateBid = useCallback(
    (teamId: string, bidAmount: number): { valid: boolean; reason?: string } => {
      if (!activePlayer || activePlayer.status !== 'IN_RING') {
        return { valid: false, reason: 'No active player is currently under the hammer.' };
      }
      if (bidAmount <= currentBid) {
        return { valid: false, reason: `Bid must be higher than current bid (₹${currentBid.toLocaleString('en-IN')}).` };
      }
      const team = teams.find((t) => t.id === teamId);
      if (!team) {
        return { valid: false, reason: 'Invalid franchise selected.' };
      }
      if (bidAmount > team.remainingPurse) {
        return {
          valid: false,
          reason: `Bid exceeds remaining purse (₹${team.remainingPurse.toLocaleString('en-IN')}).`,
        };
      }
      // Squad budget reserve validation
      const remainingSlots = team.maxSquad - team.squadCount - 1;
      const minRequiredReserve = Math.max(0, remainingSlots) * team.minReservePerSlot;
      if (team.remainingPurse - bidAmount < minRequiredReserve) {
        return {
          valid: false,
          reason: `Reserve Rule: Minimum ₹${minRequiredReserve.toLocaleString('en-IN')} must be preserved for ${remainingSlots} remaining squad slots.`,
        };
      }
      return { valid: true };
    },
    [activePlayer, currentBid, teams]
  );

  // Place bid
  const placeBid = useCallback(
    (teamId: string, customAmount?: number): { success: boolean; message: string } => {
      const increment = currentBid >= 200000 ? 20000 : 10000;
      const nextAmount = customAmount !== undefined ? customAmount : currentBid + increment;

      const validation = validateBid(teamId, nextAmount);
      if (!validation.valid) {
        return { success: false, message: validation.reason || 'Invalid bid.' };
      }

      const team = teams.find((t) => t.id === teamId)!;
      const prevBidderId = highestBidderTeamId;

      setCurrentBid(nextAmount);
      setHighestBidderTeamId(teamId);
      setTimerSeconds(DEFAULT_TIMER);
      setTimerRunning(true);
      setIsPaused(false);

      sound.playBidClick();

      // If another team was outbid, play alert
      if (prevBidderId && prevBidderId !== teamId) {
        setTimeout(() => sound.playOutbidAlert(), 120);
      }

      // Record bid in history
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newRecord: BidRecord = {
        id: `bid-${Date.now()}`,
        lotNumber: activePlayer?.lotNumber || 0,
        playerId: activePlayer?.id || '',
        playerName: activePlayer?.name || '',
        teamId: team.id,
        teamName: team.name,
        amount: nextAmount,
        timestamp: timeStr,
        increment: nextAmount - currentBid,
      };
      setBidRecords((prev) => [newRecord, ...prev]);

      const logMsg = `${team.name} raised valuation to ₹${nextAmount.toLocaleString('en-IN')} (+₹${(nextAmount - currentBid).toLocaleString('en-IN')}).`;
      setLastActionMessage(logMsg);
      addAuditLog('BID', `BID: ₹${nextAmount.toLocaleString('en-IN')}`, logMsg, team.id);

      return { success: true, message: `Bid of ₹${nextAmount.toLocaleString('en-IN')} accepted for ${team.name}!` };
    },
    [activePlayer, currentBid, highestBidderTeamId, teams, validateBid, addAuditLog]
  );

  const placeIncrementBid = useCallback(
    (increment: number, teamId?: string): { success: boolean; message: string } => {
      const targetTeamId = teamId || selectedTeamId;
      const nextAmount = currentBid + increment;
      return placeBid(targetTeamId, nextAmount);
    },
    [currentBid, placeBid, selectedTeamId]
  );

  // Timer actions
  const startTimer = useCallback(() => {
    setTimerRunning(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    addAuditLog('PAUSE', 'AUCTION PAUSED', 'Timer paused by Auctioneer.');
  }, [addAuditLog]);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    setTimerRunning(true);
    addAuditLog('RESUME', 'AUCTION RESUMED', 'Timer resumed by Auctioneer.');
  }, [addAuditLog]);

  const toggleTimerPause = useCallback(() => {
    if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  }, [isPaused, pauseTimer, resumeTimer]);

  const adjustTimer = useCallback(
    (seconds: number) => {
      setTimerSeconds((prev) => Math.min(60, prev + seconds));
      setTimerRunning(true);
      setIsPaused(false);
      addAuditLog('SYSTEM', 'TIMER ADJUSTED', `Clock increased by +${seconds} seconds.`);
    },
    [addAuditLog]
  );

  const resetTimer = useCallback(
    (seconds = DEFAULT_TIMER) => {
      setTimerSeconds(seconds);
      setTimerRunning(true);
      setIsPaused(false);
    },
    []
  );

  const triggerWarning = useCallback(
    (stage: 'GOING ONCE' | 'GOING TWICE' | 'FINAL CALL') => {
      const mult = stage === 'GOING ONCE' ? 1 : stage === 'GOING TWICE' ? 1.25 : 1.5;
      sound.playWarning(mult);
      const msg = `AUCTION GAVEL CALL: ${stage} for Lot #${activePlayer?.lotNumber} (${activePlayer?.name}) at ₹${currentBid.toLocaleString('en-IN')}!`;
      setLastActionMessage(msg);
      addAuditLog('WARNING', stage, msg, highestBidderTeamId || undefined);
    },
    [activePlayer, currentBid, highestBidderTeamId, addAuditLog]
  );

  // Confirm SOLD
  const confirmSold = useCallback(() => {
    if (!activePlayer || !highestBidderTeamId) return;

    const winningTeam = teams.find((t) => t.id === highestBidderTeamId);
    if (!winningTeam) return;

    // 1. Update player status
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === activePlayer.id
          ? { ...p, status: 'SOLD', soldToTeamId: winningTeam.id, soldPrice: currentBid }
          : p
      )
    );

    // 2. Deduct money & update team squad count
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === winningTeam.id) {
          const roleKey =
            activePlayer.role === 'Batter'
              ? 'batters'
              : activePlayer.role === 'Bowler'
              ? 'bowlers'
              : activePlayer.role === 'All-Rounder'
              ? 'allRounders'
              : 'wicketkeepers';

          return {
            ...t,
            remainingPurse: t.remainingPurse - currentBid,
            squadCount: t.squadCount + 1,
            squadRoleCounts: {
              ...t.squadRoleCounts,
              [roleKey]: (t.squadRoleCounts[roleKey] || 0) + 1,
            },
          };
        }
        return t;
      })
    );

    // 3. Stop timer & close modal
    setTimerRunning(false);
    setIsSoldModalOpen(false);

    // 4. Sound & Visual Fanfare
    sound.playSoldFanfare();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00D2FF', '#FFB95F', '#10B981', '#FFFFFF'],
      });
    } catch (e) {
      // Confetti fallback
    }

    const soldMsg = `HAMMER DOWN! Lot #${activePlayer.lotNumber} ${activePlayer.name} SOLD to ${winningTeam.name} for ₹${currentBid.toLocaleString('en-IN')}!`;
    setLastActionMessage(soldMsg);
    addAuditLog('SOLD', `SOLD: LOT #${activePlayer.lotNumber}`, soldMsg, winningTeam.id);
  }, [activePlayer, currentBid, highestBidderTeamId, teams, addAuditLog]);

  // Confirm UNSOLD
  const confirmUnsold = useCallback(() => {
    if (!activePlayer) return;

    setPlayers((prev) =>
      prev.map((p) => (p.id === activePlayer.id ? { ...p, status: 'UNSOLD' } : p))
    );

    setTimerRunning(false);
    setIsUnsoldModalOpen(false);

    sound.playUnsold();

    const unsoldMsg = `Lot #${activePlayer.lotNumber} ${activePlayer.name} passed as UNSOLD at base ₹${activePlayer.basePrice.toLocaleString('en-IN')}.`;
    setLastActionMessage(unsoldMsg);
    addAuditLog('UNSOLD', `UNSOLD: LOT #${activePlayer.lotNumber}`, unsoldMsg);
  }, [activePlayer, addAuditLog]);

  // Advance to Next Lot
  const advanceNextLot = useCallback(() => {
    // Find next UPCOMING player index
    const nextIdx = players.findIndex((p, idx) => idx > activePlayerIndex && p.status === 'UPCOMING');
    const targetIdx = nextIdx !== -1 ? nextIdx : players.findIndex((p) => p.status === 'UPCOMING');

    if (targetIdx !== -1) {
      const nextP = players[targetIdx];
      setActivePlayerIndex(targetIdx);
      setCurrentBid(nextP.basePrice);
      setHighestBidderTeamId(null);
      setTimerSeconds(DEFAULT_TIMER);
      setTimerRunning(true);
      setIsPaused(false);

      setPlayers((prev) =>
        prev.map((p, idx) => (idx === targetIdx ? { ...p, status: 'IN_RING' } : p))
      );

      sound.playBidClick();

      const introMsg = `LOT #${nextP.lotNumber} ${nextP.name} (${nextP.role}) introduced to auction stage at base price ₹${nextP.basePrice.toLocaleString('en-IN')}.`;
      setLastActionMessage(introMsg);
      addAuditLog('START', `LOT #${nextP.lotNumber} OPENED`, introMsg);
    } else {
      setLastActionMessage('All player lots in pool have been completed.');
      addAuditLog('SYSTEM', 'AUCTION COMPLETED', 'All lots in player catalogue have concluded.');
    }
  }, [activePlayerIndex, players, addAuditLog]);

  // Go to specific lot
  const goToLot = useCallback(
    (index: number) => {
      if (index < 0 || index >= players.length) return;
      const targetP = players[index];
      setActivePlayerIndex(index);
      setCurrentBid(targetP.soldPrice || targetP.basePrice);
      setHighestBidderTeamId(targetP.soldToTeamId || null);
      setTimerSeconds(DEFAULT_TIMER);
      setTimerRunning(targetP.status === 'IN_RING');
      setIsPaused(false);

      if (targetP.status === 'UPCOMING') {
        setPlayers((prev) =>
          prev.map((p, idx) => (idx === index ? { ...p, status: 'IN_RING' } : p))
        );
      }

      addAuditLog('SYSTEM', `NAVIGATED TO LOT #${targetP.lotNumber}`, `Display shifted to Lot #${targetP.lotNumber} (${targetP.name}).`);
    },
    [players, addAuditLog]
  );

  // Reset Demo
  const resetDemo = useCallback(() => {
    setPlayers(INITIAL_PLAYERS);
    setTeams(INITIAL_TEAMS);
    setActivePlayerIndex(3); // Lot #04 Arjun Shah
    setCurrentBid(240000);
    setHighestBidderTeamId('strikers');
    setBidRecords(INITIAL_BIDS_LOT4);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTimerSeconds(8);
    setTimerRunning(true);
    setIsPaused(false);
    setIsResetModalOpen(false);
    setIsSoldModalOpen(false);
    setIsUnsoldModalOpen(false);

    sound.playBidClick();
    setLastActionMessage('DEMO ENVIRONMENT RESET: Sample rosters, telemetry, and balances restored.');
    addAuditLog('RESET', 'DEMO RESET COMPLETE', 'All franchise purses, rosters, and lot states reverted to default state.');
  }, [addAuditLog]);

  // Sound Controls
  const toggleSound = useCallback(() => {
    const state = sound.toggle();
    setSoundEnabled(state);
  }, []);

  const setMasterVolume = useCallback((val: number) => {
    setMasterVolumeState(val);
    sound.setVolume(val / 100);
  }, []);

  // Modal open/close
  const openSoldModal = useCallback(() => setIsSoldModalOpen(true), []);
  const closeSoldModal = useCallback(() => setIsSoldModalOpen(false), []);
  const openUnsoldModal = useCallback(() => setIsUnsoldModalOpen(true), []);
  const closeUnsoldModal = useCallback(() => setIsUnsoldModalOpen(false), []);
  const openResetModal = useCallback(() => setIsResetModalOpen(true), []);
  const closeResetModal = useCallback(() => setIsResetModalOpen(false), []);

  return (
    <AuctionContext.Provider
      value={{
        players,
        teams,
        activePlayer,
        activePlayerIndex,
        currentBid,
        highestBidder,
        highestBidderTeamId,
        bidRecords,
        auditLogs,
        timerSeconds,
        timerRunning,
        isPaused,
        viewMode,
        selectedTeamId,
        soundEnabled,
        masterVolume,
        lastActionMessage,
        isSoldModalOpen,
        isUnsoldModalOpen,
        isResetModalOpen,
        nextPlayerOnDeck,
        totalLots,
        completedLotsCount,
        setViewMode,
        setSelectedTeamId,
        placeBid,
        placeIncrementBid,
        startTimer,
        pauseTimer,
        resumeTimer,
        toggleTimerPause,
        adjustTimer,
        resetTimer,
        triggerWarning,
        confirmSold,
        confirmUnsold,
        advanceNextLot,
        goToLot,
        resetDemo,
        openSoldModal,
        closeSoldModal,
        openUnsoldModal,
        closeUnsoldModal,
        openResetModal,
        closeResetModal,
        toggleSound,
        setMasterVolume,
        validateBid,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = (): AuctionContextType => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
