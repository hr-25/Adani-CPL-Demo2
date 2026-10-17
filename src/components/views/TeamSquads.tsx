import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  History,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Ban,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { Role, PlayerStatus, Player } from '../../types/auction';
import { formatPoints, formatPointsWithLabel } from '../../utils/formatters';

type SquadViewFilter = 'ALL' | 'SOLD' | 'UNSOLD' | 'BY_TEAM' | 'BY_ROLE';

export const TeamSquads: React.FC = () => {
  const {
    teams,
    players,
    activePlayer,
    currentBid,
    goToLot,
    setViewMode,
    openPlayerProfile,
  } = useAuction();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewFilter, setViewFilter] = useState<SquadViewFilter>('BY_TEAM');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');

  // Filtered players across global search
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cluster.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.soldToTeamId &&
          teams.find((t) => t.id === p.soldToTeamId)?.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRole = selectedRoleFilter === 'ALL' || p.role === selectedRoleFilter;
      const matchTeam = selectedTeamFilter === 'ALL' || p.soldToTeamId === selectedTeamFilter;

      if (!matchSearch || !matchRole || !matchTeam) return false;

      if (viewFilter === 'SOLD') return p.status === 'SOLD';
      if (viewFilter === 'UNSOLD') return p.status === 'UNSOLD';
      if (viewFilter === 'ALL') return true;

      return true;
    });
  }, [players, teams, searchTerm, selectedRoleFilter, selectedTeamFilter, viewFilter]);

  // Genuine Sold Records for the Recent Auction Results Table
  const recentResults = useMemo(() => {
    return players
      .filter((p) => p.status === 'SOLD' && p.soldToTeamId)
      .map((p, idx) => {
        const team = teams.find((t) => t.id === p.soldToTeamId);
        // Default realistic timestamp sequence based on lotNumber
        const hours = 14 + Math.floor((p.lotNumber - 1) / 10);
        const mins = ((p.lotNumber * 13) % 55).toString().padStart(2, '0');
        const timeStr = `${hours > 12 ? hours - 12 : hours}:${mins} PM`;

        return {
          id: p.id,
          lotNumber: p.lotNumber,
          player: p,
          team: team,
          price: p.soldPrice || p.basePrice,
          time: timeStr,
        };
      })
      .reverse(); // Newest first
  }, [players, teams]);

  return (
    <div className="w-full flex flex-col gap-6 py-6 px-4 lg:px-8 max-w-[1780px] mx-auto select-none">
      {/* ======================================================== */}
      {/* 1. BROADCAST TITLE & REAL-TIME CONTROLS BAR */}
      {/* ======================================================== */}
      <div className="w-full bg-[#0D131F] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title Group */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-cyan-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                CPL 2026 TEAM SQUADS & AUCTION RESULTS
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE UPDATED
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 mt-0.5">
              Official Franchises Squad Distribution • All Players Allocation & Live Ledger
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-[#151D2E] px-3.5 py-2 rounded-xl border border-white/10 focus-within:border-cyan-500/50 transition-colors">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search player, team, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-500 w-44 sm:w-56"
            />
          </div>

          {/* View Filter Pills */}
          <div className="flex items-center gap-1 bg-[#151D2E] p-1 rounded-xl border border-white/10">
            {(
              [
                { id: 'ALL', label: 'ALL' },
                { id: 'SOLD', label: 'SOLD' },
                { id: 'UNSOLD', label: 'UNSOLD' },
                { id: 'BY_TEAM', label: 'BY TEAM' },
                { id: 'BY_ROLE', label: 'BY ROLE' },
              ] as const
            ).map((tab) => {
              const isActive = viewFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-heading text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00D2FF] text-[#003543] shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN PLAYER DISTRIBUTION VIEWPORT */}
      {/* ======================================================== */}

      {/* VIEW A: BY TEAM (4 Columns matching screenshot) */}
      {viewFilter === 'BY_TEAM' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {teams.map((team) => {
            // Find all players assigned to this team
            const teamPlayers = players.filter((p) => p.soldToTeamId === team.id);
            const totalSpent = team.startingPurse - team.remainingPurse;
            const progressPercent = (team.squadCount / team.maxSquad) * 100;

            // Check if active in-ring player is leading with this team
            const isLeadingActive = activePlayer?.status === 'IN_RING';

            return (
              <div
                key={team.id}
                className="bg-[#0D131F] border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all"
                style={{
                  borderColor: `${team.color}40`,
                  boxShadow: `0 8px 30px ${team.glowColor}`,
                }}
              >
                {/* Team Card Header */}
                <div
                  className="p-4 border-b border-white/10 relative"
                  style={{
                    background: `linear-gradient(135deg, ${team.color}15, rgba(13,19,31,0.95))`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Team Logo / Initial Badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-lg shadow-md"
                        style={{ backgroundColor: team.color, color: '#070B12' }}
                      >
                        {team.shortName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-heading text-lg font-black text-white uppercase tracking-tight">
                            {team.shortName}
                          </h2>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">
                            {team.paddleNumber}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 block truncate max-w-[140px]">
                          {team.manager}
                        </span>
                      </div>
                    </div>

                    {/* Points Telemetry */}
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-slate-400 uppercase block font-semibold">
                        POINTS REMAINING
                      </span>
                      <span
                        className="font-mono text-lg font-black tracking-tight"
                        style={{ color: team.color }}
                      >
                        {formatPoints(team.remainingPurse)}
                      </span>
                    </div>
                  </div>

                  {/* Squad Capacity Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300 font-bold">
                        {team.squadCount} / {team.maxSquad} Players
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Points Spent: {formatPoints(totalSpent)} Points
                      </span>
                    </div>
                    <div className="w-full bg-[#151D2E] h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: team.color,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Team Players Roster List */}
                <div className="p-3 flex-1 flex flex-col gap-2 min-h-[360px] max-h-[500px] overflow-y-auto pr-1">
                  {teamPlayers.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
                      <Users className="w-8 h-8 mb-2 opacity-30" />
                      <span>No players acquired yet in this session.</span>
                    </div>
                  ) : (
                    teamPlayers.map((player) => {
                      // Highlight if this is the highlighted player from the demo
                      const isHighlighted = player.name === 'Arjun Shah';

                      return (
                        <div
                          key={player.id}
                          onClick={() => openPlayerProfile(player)}
                          title="Click to view full player profile dossier"
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-mono cursor-pointer group hover:border-cyan-500/50 ${
                            isHighlighted
                              ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.3)] ring-1 ring-cyan-400'
                              : 'bg-[#151D2E] border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar */}
                            <div className="relative w-9 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                              <img
                                src={player.image}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Player Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-heading font-bold text-white text-xs truncate">
                                  {player.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {player.role}
                              </span>
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-right shrink-0 pl-2">
                            <span
                              className={`font-bold block ${
                                isHighlighted ? 'text-[#00D2FF] text-sm' : 'text-slate-200 text-xs'
                              }`}
                            >
                              {player.soldPrice ? `${formatPoints(player.soldPrice)} Points` : '—'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Team Footer Quick Summary */}
                <div className="p-3 bg-[#0A0E15] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Roles:</span>
                    <span className="text-slate-200">
                      B:{team.squadRoleCounts.batters} • BW:{team.squadRoleCounts.bowlers} • AR:
                      {team.squadRoleCounts.allRounders} • WK:{team.squadRoleCounts.wicketkeepers}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {team.maxSquad - team.squadCount} SLOTS OPEN
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW B: BY ROLE (Batters, Bowlers, All-Rounders, Wicketkeepers) */}
      {viewFilter === 'BY_ROLE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {(['Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper'] as Role[]).map((role) => {
            const rolePlayers = filteredPlayers.filter((p) => p.role === role);
            const soldCount = rolePlayers.filter((p) => p.status === 'SOLD').length;

            return (
              <div
                key={role}
                className="bg-[#0D131F] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-4 bg-[#151D2E] border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-base font-bold text-white uppercase tracking-tight">
                      {role}S
                    </h2>
                    <span className="font-mono text-[10px] text-cyan-400">
                      {soldCount} SOLD / {rolePlayers.length} REGISTERED
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[#00D2FF] font-mono text-xs font-bold">
                    {role.toUpperCase()}
                  </span>
                </div>

                {/* List */}
                <div className="p-3 flex-1 flex flex-col gap-2 min-h-[380px] max-h-[520px] overflow-y-auto pr-1">
                  {rolePlayers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 font-mono text-xs">
                      No players in this category match search filter.
                    </div>
                  ) : (
                    rolePlayers.map((player) => {
                      const team = teams.find((t) => t.id === player.soldToTeamId);

                      return (
                        <div
                          key={player.id}
                          onClick={() => openPlayerProfile(player)}
                          title="Click to view full player profile dossier"
                          className="p-2.5 rounded-xl bg-[#151D2E] border border-white/5 hover:border-cyan-500/50 transition-all cursor-pointer group flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={player.image}
                              alt={player.name}
                              className="w-9 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-heading font-bold text-white block truncate">
                                {player.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Base Points: {formatPoints(player.basePrice)} Points
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {player.status === 'SOLD' && team ? (
                              <div>
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-bold block"
                                  style={{
                                    backgroundColor: `${team.color}20`,
                                    color: team.color,
                                    border: `1px solid ${team.color}40`,
                                  }}
                                >
                                  {team.shortName}
                                </span>
                                <span className="text-white font-bold text-xs mt-0.5 block">
                                  {formatPoints(player.soldPrice)} Points
                                </span>
                              </div>
                            ) : player.status === 'IN_RING' ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold animate-pulse">
                                IN AUCTION
                              </span>
                            ) : player.status === 'UNSOLD' ? (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                                UNSOLD
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                                AVAILABLE
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW C: ALL / SOLD / UNSOLD (Grid Table) */}
      {(viewFilter === 'ALL' || viewFilter === 'SOLD' || viewFilter === 'UNSOLD') && (
        <div className="bg-[#0D131F] border border-white/10 rounded-2xl overflow-hidden shadow-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {viewFilter} PLAYER DIRECTORY ({filteredPlayers.length} Athletes)
            </span>
            <span className="font-mono text-xs text-slate-400">
              CLICK PLAYER TO INSPECT OR BID IN CONSOLE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="text-[11px] text-slate-400 border-b border-white/10 bg-[#151D2E]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">LOT</th>
                  <th className="py-2.5 px-3 font-semibold">ATHLETE</th>
                  <th className="py-2.5 px-3 font-semibold">ROLE</th>
                  <th className="py-2.5 px-3 font-semibold">CLUSTER / DEPT</th>
                  <th className="py-2.5 px-3 text-right font-semibold">BASE POINTS</th>
                  <th className="py-2.5 px-3 font-semibold">ASSIGNED TEAM</th>
                  <th className="py-2.5 px-3 text-right font-semibold">FINAL SALE POINTS</th>
                  <th className="py-2.5 px-3 text-center font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No player records match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => {
                    const team = teams.find((t) => t.id === player.soldToTeamId);

                    return (
                      <tr
                        key={player.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => {
                          const idx = players.findIndex((p) => p.id === player.id);
                          if (idx !== -1) {
                            goToLot(idx);
                            setViewMode('admin');
                          }
                        }}
                      >
                        <td className="py-3 px-3 text-slate-400 font-bold">
                          #{player.lotNumber.toString().padStart(2, '0')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={player.image}
                              alt={player.name}
                              className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                            />
                            <span className="font-heading font-bold text-white text-sm">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-cyan-400 font-semibold">{player.role}</td>
                        <td className="py-3 px-3 text-slate-400">{player.cluster}</td>
                        <td className="py-3 px-3 text-right text-slate-300 font-bold">
                          {formatPoints(player.basePrice)} Points
                        </td>
                        <td className="py-3 px-3">
                          {team ? (
                            <span
                              className="px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1.5"
                              style={{
                                backgroundColor: `${team.color}20`,
                                color: team.color,
                                border: `1px solid ${team.color}40`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: team.color }}
                              ></span>
                              {team.name}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#F59E0B]">
                          {player.soldPrice ? `${formatPoints(player.soldPrice)} Points` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              player.status === 'SOLD'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : player.status === 'IN_RING'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                                : player.status === 'UNSOLD'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-cyan-500/10 text-cyan-400'
                            }`}
                          >
                            {player.status}
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

      {/* ======================================================== */}
      {/* 3. RECENT AUCTION RESULTS (Compact Real-Time Table) */}
      {/* ======================================================== */}
      <div className="w-full bg-[#0D131F] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="font-heading text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              RECENT AUCTION RESULTS
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-400">
            {recentResults.length} TOTAL PLAYERS TRANSFERRED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead className="text-[11px] text-slate-400 border-b border-white/10 bg-[#151D2E]/80">
              <tr>
                <th className="py-2.5 px-4 font-semibold">#</th>
                <th className="py-2.5 px-4 font-semibold">PLAYER</th>
                <th className="py-2.5 px-4 font-semibold">ROLE</th>
                <th className="py-2.5 px-4 font-semibold">SOLD TO</th>
                <th className="py-2.5 px-4 text-right font-semibold">FINAL SALE POINTS</th>
                <th className="py-2.5 px-4 text-right font-semibold">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No confirmed sales yet recorded in current session.
                  </td>
                </tr>
              ) : (
                recentResults.slice(0, 8).map((record, index) => {
                  return (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-bold">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={record.player.image}
                            alt={record.player.name}
                            className="w-7 h-7 rounded-lg object-cover bg-slate-800"
                          />
                          <span className="font-heading font-bold text-white text-sm">
                            {record.player.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-semibold">
                        {record.player.role}
                      </td>
                      <td className="py-3 px-4">
                        {record.team && (
                          <span
                            className="font-bold text-xs"
                            style={{ color: record.team.color }}
                          >
                            {record.team.shortName}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white text-sm">
                        {formatPoints(record.price)} Points
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-semibold">
                        {record.time}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
