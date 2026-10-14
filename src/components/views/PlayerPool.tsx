import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Gavel,
  CheckCircle,
  Clock,
  Ban,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { Role, PlayerStatus } from '../../types/auction';

export const PlayerPool: React.FC = () => {
  const { players, teams, goToLot, setViewMode } = useAuction();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.cluster.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || player.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || player.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleLoadToRing = (idx: number) => {
    goToLot(idx);
    setViewMode('admin');
  };

  return (
    <div className="w-full flex flex-col gap-6 py-6 px-4 lg:px-8 max-w-[1720px] mx-auto">
      {/* Header Banner */}
      <div className="w-full bg-[#0D131F] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white uppercase tracking-tight">
            CPL 2026 PLAYER CATALOGUE & SQUAD MATRIX
          </h1>
          <p className="font-mono text-xs text-slate-400 mt-0.5">
            Verified Player Pool • {players.length} Total Registered Athletes
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#151D2E] px-3.5 py-2 rounded-xl border border-white/10">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search athlete, cluster, unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-500 w-48 sm:w-64"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#151D2E] text-slate-300 font-mono text-xs px-3 py-2 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL ROLES</option>
            <option value="Batter">BATTER</option>
            <option value="Bowler">BOWLER</option>
            <option value="All-Rounder">ALL-ROUNDER</option>
            <option value="Wicketkeeper">WICKETKEEPER</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#151D2E] text-slate-300 font-mono text-xs px-3 py-2 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="IN_RING">IN RING</option>
            <option value="SOLD">SOLD</option>
            <option value="UNSOLD">UNSOLD</option>
          </select>
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
                ₹{team.remainingPurse.toLocaleString('en-IN')}
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

      {/* Player Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredPlayers.map((player) => {
          const soldTeam = teams.find((t) => t.id === player.soldToTeamId);
          const originalIdx = players.findIndex((p) => p.id === player.id);

          return (
            <div
              key={player.id}
              className={`bg-[#0D131F] rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xl ${
                player.status === 'IN_RING'
                  ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,210,255,0.2)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Header Strip */}
                <div className="p-3.5 bg-[#151D2E] border-b border-white/5 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    LOT #{player.lotNumber.toString().padStart(2, '0')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      player.status === 'IN_RING'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : player.status === 'SOLD'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : player.status === 'UNSOLD'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-cyan-500/10 text-cyan-300'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>

                {/* Portrait & Details */}
                <div className="p-4 flex gap-3.5">
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 shadow-md">
                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">
                      {player.role}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-white truncate">{player.name}</h3>
                    <p className="font-mono text-[11px] text-amber-400 font-medium truncate">
                      {player.specialism}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{player.cluster}</p>
                    <p className="text-[10px] text-slate-500 truncate">{player.department}</p>
                  </div>
                </div>

                {/* Stats Matrix */}
                <div className="px-4 pb-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[#151D2E] p-2 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">BASE VALUATION</span>
                    <span className="text-white font-bold">₹{player.basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-[#151D2E] p-2 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">EXPERIENCE</span>
                    <span className="text-cyan-400 font-bold truncate block">{player.experience}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3.5 bg-[#151D2E]/80 border-t border-white/5 flex items-center justify-between">
                {player.status === 'SOLD' ? (
                  <div className="flex items-center justify-between w-full font-mono text-xs">
                    <span className="text-slate-400">Sold to:</span>
                    <span className="font-bold text-emerald-400">
                      {soldTeam?.shortName} (₹{player.soldPrice?.toLocaleString('en-IN')})
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleLoadToRing(originalIdx)}
                    className="w-full py-2 bg-slate-800 hover:bg-[#00D2FF] hover:text-[#003543] text-white rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>{player.status === 'IN_RING' ? 'VIEW IN CONSOLE' : 'LOAD TO AUCTION RING'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
