import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  CheckCircle,
  Clock,
  Ban,
  ArrowUpDown,
  ExternalLink,
  Award,
  Sparkles,
  Info,
  Eye,
  MapPin,
  Briefcase,
  Activity,
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { Player, Role } from '../../types/auction';
import { formatPoints } from '../../utils/formatters';
import { getPlayerProfile } from '../../utils/playerProfileHelper';

type SortOption = 'BASE_ASC' | 'BASE_DESC' | 'LOT_ASC' | 'NAME_ASC';

export const PlayerPool: React.FC = () => {
  const { players, teams, openPlayerProfile } = useAuction();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('BASE_ASC'); // Default sort: Base Points ascending

  // Filtered and Sorted Athletes
  const filteredAndSortedPlayers = useMemo(() => {
    return players
      .filter((player) => {
        const profile = getPlayerProfile(player);
        const searchLower = searchTerm.trim().toLowerCase();

        const matchesSearch =
          !searchLower ||
          player.name.toLowerCase().includes(searchLower) ||
          (profile.employeeId && profile.employeeId.toLowerCase().includes(searchLower)) ||
          profile.department.toLowerCase().includes(searchLower) ||
          profile.workLocation.toLowerCase().includes(searchLower) ||
          player.cluster.toLowerCase().includes(searchLower) ||
          player.specialism.toLowerCase().includes(searchLower);

        const category = profile.primaryCategory;
        const matchesCategory =
          selectedCategory === 'ALL' ||
          category.toLowerCase() === selectedCategory.toLowerCase() ||
          player.role.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCategory === 'Batsman' && player.role === 'Batter') ||
          (selectedCategory === 'Wicket Keeper' && player.role === 'Wicketkeeper');

        const matchesStatus =
          selectedStatus === 'ALL' ||
          (selectedStatus === 'UPCOMING' && player.status === 'UPCOMING') ||
          (selectedStatus === 'IN_RING' && player.status === 'IN_RING') ||
          (selectedStatus === 'SOLD' && player.status === 'SOLD') ||
          (selectedStatus === 'UNSOLD' && player.status === 'UNSOLD');

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'BASE_ASC') {
          return a.basePrice - b.basePrice || a.lotNumber - b.lotNumber;
        }
        if (sortBy === 'BASE_DESC') {
          return b.basePrice - a.basePrice || a.lotNumber - b.lotNumber;
        }
        if (sortBy === 'LOT_ASC') {
          return a.lotNumber - b.lotNumber;
        }
        if (sortBy === 'NAME_ASC') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [players, searchTerm, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="w-full flex flex-col gap-6 py-6 px-4 lg:px-8 max-w-[1780px] mx-auto select-none">
      {/* Header Banner */}
      <div className="w-full bg-[#0D131F] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              OFFICIAL PLAYER CATALOGUE & REGISTRATION DOSSIER
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white uppercase tracking-tight mt-1">
            CPL 2026 PLAYER POOL & TALENT MATRIX
          </h1>
          <p className="font-mono text-xs text-slate-400 mt-0.5">
            Verified Player Pool • {players.length} Total Registered Athletes Across All Adani Business Units
          </p>
        </div>

        {/* Search, Filters & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search by Name or Employee ID */}
          <div className="flex items-center gap-2 bg-[#151D2E] px-3.5 py-2 rounded-xl border border-white/10 focus-within:border-cyan-500/50 transition-colors">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, emp ID, unit, function..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-500 w-48 sm:w-64"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#151D2E] text-slate-300 font-mono text-xs px-3 py-2 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL CATEGORIES</option>
            <option value="Batsman">BATSMAN</option>
            <option value="Bowler">BOWLER</option>
            <option value="All-Rounder">ALL-ROUNDER</option>
            <option value="Wicket Keeper">WICKET KEEPER</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#151D2E] text-slate-300 font-mono text-xs px-3 py-2 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="UPCOMING">AVAILABLE / UPCOMING</option>
            <option value="IN_RING">IN AUCTION RING</option>
            <option value="SOLD">SOLD</option>
            <option value="UNSOLD">UNSOLD</option>
          </select>

          {/* Sort By Filter (Ascending Base Points default) */}
          <div className="flex items-center gap-1.5 bg-[#151D2E] px-3 py-1.5 rounded-xl border border-white/10">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-cyan-300 font-mono text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="BASE_ASC" className="bg-[#151D2E] text-white">
                BASE POINTS: LOW TO HIGH
              </option>
              <option value="BASE_DESC" className="bg-[#151D2E] text-white">
                BASE POINTS: HIGH TO LOW
              </option>
              <option value="LOT_ASC" className="bg-[#151D2E] text-white">
                LOT NUMBER: ASCENDING
              </option>
              <option value="NAME_ASC" className="bg-[#151D2E] text-white">
                PLAYER NAME: A TO Z
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Team Squad Status Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-[#0D131F] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></span>
                <span className="font-heading font-bold text-white text-base">{team.shortName}</span>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-400">
                {formatPoints(team.remainingPurse)} Points
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Squad: {team.squadCount}/11</span>
              <span>Slots Open: {11 - team.squadCount}</span>
            </div>

            <div className="w-full bg-[#151D2E] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(team.remainingPurse / team.startingPurse) * 100}%`,
                  backgroundColor: team.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
        <span>
          SHOWING <span className="text-cyan-400 font-bold">{filteredAndSortedPlayers.length}</span> OF{' '}
          <span className="text-white font-bold">{players.length}</span> REGISTERED ATHLETES
        </span>
        <span className="text-slate-500 text-[11px] hidden sm:inline">
          Click any athlete card or "VIEW DETAILS" button to inspect full CPL profile dossier
        </span>
      </div>

      {/* Upgraded Player Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAndSortedPlayers.map((player) => {
          const profile = getPlayerProfile(player);
          const soldTeam = teams.find((t) => t.id === player.soldToTeamId);
          const isInRing = player.status === 'IN_RING';

          return (
            <div
              key={player.id}
              onClick={() => openPlayerProfile(player)}
              className={`bg-[#0D131F] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xl cursor-pointer group hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(0,210,255,0.18)] ${
                isInRing
                  ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,210,255,0.25)] ring-1 ring-cyan-400'
                  : 'border-white/10 hover:border-cyan-500/50'
              }`}
            >
              <div>
                {/* Header Strip with Lot Number, Employee ID & Auction Status Badge */}
                <div className="p-3.5 bg-[#151D2E] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      LOT #{player.lotNumber.toString().padStart(2, '0')}
                    </span>
                    {profile.employeeId && (
                      <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                        {profile.employeeId}
                      </span>
                    )}
                  </div>

                  {/* Auction Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isInRing
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : player.status === 'SOLD'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : player.status === 'UNSOLD'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    }`}
                  >
                    {player.status === 'UPCOMING' ? 'AVAILABLE' : isInRing ? 'IN AUCTION' : player.status}
                  </span>
                </div>

                {/* Portrait & Core Identity */}
                <div className="p-4 flex gap-3.5">
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 shadow-md relative group-hover:border-cyan-500/40 transition-colors">
                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider truncate">
                          {profile.primaryCategory}
                        </span>
                        <span className="text-[9px] font-mono text-purple-300 bg-purple-500/15 px-1.5 py-0.2 rounded shrink-0">
                          {player.tier}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {player.name}
                      </h3>
                      <p className="font-mono text-[11px] text-amber-400 font-medium truncate mt-0.5">
                        {player.specialism}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-white/5 text-[10px] font-mono text-slate-400 space-y-0.5">
                      <p className="truncate text-slate-300">{profile.department}</p>
                      <p className="truncate text-slate-500 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                        {profile.workLocation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cricket Specification Strip: Batting Style, Bowling Style, Experience Level */}
                <div className="px-4 pb-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div className="bg-[#151D2E] p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Batting</span>
                    <span className="text-white font-bold truncate block">{profile.battingStyle}</span>
                  </div>

                  <div className="bg-[#151D2E] p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Bowling</span>
                    <span className="text-white font-bold truncate block">{profile.bowlingStyle}</span>
                  </div>

                  <div className="bg-[#151D2E] p-2 rounded-lg border border-white/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Experience</span>
                    <span className="text-amber-400 font-bold truncate block">{profile.experienceLevel}</span>
                  </div>
                </div>

                {/* Base Points / Valuation Strip */}
                <div className="px-4 pb-3 flex items-center justify-between text-xs font-mono bg-[#151D2E]/40 mx-4 rounded-xl p-2.5 border border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase">Base Points</span>
                  <span className="text-cyan-400 font-bold text-sm">
                    {formatPoints(player.basePrice)} Points
                  </span>
                </div>
              </div>

              {/* Card Footer: Sold Details OR View Details Action (NO AUCTION CONTROLS) */}
              <div className="p-3.5 bg-[#151D2E] border-t border-white/5 flex flex-col gap-2">
                {/* Sold State Summary */}
                {player.status === 'SOLD' && soldTeam && (
                  <div
                    className="flex items-center justify-between w-full font-mono text-xs p-2 rounded-xl border mb-1"
                    style={{
                      backgroundColor: `${soldTeam.color}15`,
                      borderColor: `${soldTeam.color}35`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: soldTeam.color }}></span>
                      <span className="text-slate-400 text-[11px]">Sold:</span>
                      <span className="font-bold text-white truncate">{soldTeam.shortName}</span>
                    </div>
                    <span className="font-bold text-[#F59E0B] shrink-0 text-xs">
                      {formatPoints(player.soldPrice)} Points
                    </span>
                  </div>
                )}

                {/* VIEW DETAILS ACTION BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPlayerProfile(player);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-[#003543] rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-white/10 hover:border-cyan-400"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>VIEW DETAILS</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
