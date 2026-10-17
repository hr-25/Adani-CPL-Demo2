import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Award,
  Activity,
  HeartPulse,
  Gavel,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Lock,
  Unlock,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Player, Role } from '../../types/auction';
import { useAuction } from '../../context/AuctionContext';
import { formatPoints, formatPointsWithLabel } from '../../utils/formatters';
import { getPlayerProfile, maskMobileNumber, maskEmail } from '../../utils/playerProfileHelper';

interface PlayerProfileModalProps {
  player?: Player | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player: propPlayer,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    inspectPlayer: contextPlayer,
    isProfileModalOpen: contextIsOpen,
    closePlayerProfile,
    viewMode,
    teams,
    currentBid,
    activePlayer,
  } = useAuction();

  const player = propPlayer !== undefined ? propPlayer : contextPlayer;
  const isOpen = propIsOpen !== undefined ? propIsOpen : contextIsOpen;
  const handleClose = propOnClose !== undefined ? propOnClose : closePlayerProfile;

  // Role authorization state: default to true if viewMode === 'admin', otherwise false
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(viewMode === 'admin');

  // Sync with viewMode changes
  useEffect(() => {
    setIsAdminAuthorized(viewMode === 'admin');
  }, [viewMode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !player) return null;

  const profile = getPlayerProfile(player);
  const soldTeam = teams.find((t) => t.id === player.soldToTeamId);
  const isCurrentlyInRing = player.status === 'IN_RING' || activePlayer?.id === player.id;

  const renderStars = (rating: number, max = 5) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < rating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-slate-600 fill-slate-800'
            }`}
          />
        ))}
        <span className="font-mono text-xs font-bold text-slate-300 ml-1.5">
          {rating}/{max}
        </span>
      </div>
    );
  };

  const renderValueOrFallback = (val?: string | number | null) => {
    if (val === undefined || val === null || val === '' || val === 'NA') {
      return <span className="text-slate-500 italic text-xs">Not Provided</span>;
    }
    return <span className="text-white font-medium">{val}</span>;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070B12]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-[#0D131F] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,210,255,0.25)] max-w-4xl w-full flex flex-col relative overflow-hidden my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glowing accent border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-[#00D2FF] to-blue-500"></div>

        {/* Modal Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#151D2E]/90 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00D2FF]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  CPL 2026 OFFICIAL PLAYER REGISTRATION FORM
                </span>
                <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  LOT #{player.lotNumber.toString().padStart(2, '0')}
                </span>
              </div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight uppercase mt-0.5">
                {player.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Privacy Clearance Switch */}
            <button
              onClick={() => setIsAdminAuthorized(!isAdminAuthorized)}
              title="Toggle role clearance view between public and authorized CPL Admin"
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isAdminAuthorized
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
              }`}
            >
              {isAdminAuthorized ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ADMIN CLEARANCE: ACTIVE</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>PUBLIC VIEW (RESTRICTED)</span>
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Hero Summary Strip */}
          <div className="bg-[#151D2E] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center md:items-start gap-5 shadow-lg">
            {/* Photo with glowing ring */}
            <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden bg-slate-800 shrink-0 border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
              <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
              <div className="absolute top-1.5 left-1.5 bg-[#070B12]/80 backdrop-blur-xs px-2 py-0.5 rounded font-mono text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                LOT #{player.lotNumber}
              </div>
            </div>

            {/* Quick Metadata */}
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-cyan-500/20 text-[#00D2FF] border border-cyan-500/40 uppercase">
                  {profile.primaryCategory}
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {player.tier} Tier
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Role: {profile.rolePreference}
                </span>

                {/* Auction Status Pill */}
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase ${
                    player.status === 'IN_RING' || isCurrentlyInRing
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : player.status === 'SOLD'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : player.status === 'UNSOLD'
                      ? 'bg-slate-700 text-slate-300 border border-slate-600'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {player.status === 'UPCOMING'
                    ? 'AVAILABLE'
                    : player.status === 'IN_RING' || isCurrentlyInRing
                    ? 'IN AUCTION RING'
                    : player.status}
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {player.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-mono text-slate-400 mt-1">
                <span className="text-amber-400 font-bold">EMP ID: {profile.employeeId || 'Not Provided'}</span>
                <span>•</span>
                <span>{player.specialism}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="bg-[#0D131F] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Base Points</span>
                  <span className="text-white font-bold text-sm">{formatPoints(player.basePrice)} Points</span>
                </div>

                <div className="bg-[#0D131F] p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Batting / Bowling</span>
                  <span className="text-cyan-400 font-bold truncate block">
                    {profile.battingStyle} • {profile.bowlingStyle}
                  </span>
                </div>

                <div className="bg-[#0D131F] p-2.5 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Experience Level</span>
                  <span className="text-amber-400 font-bold block">{profile.experienceLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section A: Employee Details */}
          <div className="bg-[#151D2E] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/10">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                SECTION A — EMPLOYEE DETAILS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Full Name</span>
                <span className="text-white font-bold text-sm">{profile.fullName}</span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Employee ID</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {profile.employeeId || <span className="text-slate-500 italic">Not Provided</span>}
                </span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Department / Function
                </span>
                <span className="text-white font-medium">{profile.department}</span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Work Location</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  {profile.workLocation}
                </span>
              </div>

              {/* Mobile Number (Masked for Non-Admin) */}
              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  <span>Mobile Number</span>
                  {!isAdminAuthorized && <span className="text-amber-400 text-[9px]">MASKED</span>}
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                  {isAdminAuthorized ? (
                    <span className="text-white">{profile.mobileNumber || 'Not Provided'}</span>
                  ) : (
                    <span className="text-slate-400">{maskMobileNumber(profile.mobileNumber)}</span>
                  )}
                </div>
              </div>

              {/* Email ID (Masked for Non-Admin) */}
              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  <span>Official Email</span>
                  {!isAdminAuthorized && <span className="text-amber-400 text-[9px]">MASKED</span>}
                </div>
                <div className="flex items-center gap-1.5 font-bold truncate">
                  <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                  {isAdminAuthorized ? (
                    <span className="text-white truncate">{profile.email || 'Not Provided'}</span>
                  ) : (
                    <span className="text-slate-400 truncate">{maskEmail(profile.email)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Cricket Registration */}
          <div className="bg-[#151D2E] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/10">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                SECTION B — CRICKET REGISTRATION
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Participation Confirmation
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed & Verified
                </span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Role Preference</span>
                <span className="text-amber-400 font-bold">{profile.rolePreference}</span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Primary Playing Category
                </span>
                <span className="text-cyan-400 font-bold">{profile.primaryCategory}</span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Batting Style</span>
                <span className="text-white font-medium">{profile.battingStyle}</span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Bowling Style</span>
                <span className="text-white font-medium">{profile.bowlingStyle}</span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Cricket Experience Level
                </span>
                <span className="text-amber-400 font-bold">{profile.experienceLevel}</span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5 sm:col-span-2 lg:col-span-3">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Previous Plant / Company / Team Representation
                </span>
                {renderValueOrFallback(profile.previousRepresentation)}
              </div>
            </div>
          </div>

          {/* Section C: Skills & Achievements */}
          <div className="bg-[#151D2E] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/10">
              <Award className="w-4 h-4 text-cyan-400" />
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                SECTION C — SKILLS & ACHIEVEMENTS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-2">
                  Batting Skill Rating
                </span>
                {renderStars(profile.battingRating)}
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-2">
                  Bowling Skill Rating
                </span>
                {renderStars(profile.bowlingRating)}
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-2">
                  Fielding Skill Rating
                </span>
                {renderStars(profile.fieldingRating)}
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-2">
                  Overall Self-Rating
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-amber-400 h-full rounded-full"
                      style={{ width: `${(profile.overallRating / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-white text-xs">{profile.overallRating}/10</span>
                </div>
              </div>

              <div className="bg-[#0D131F] p-3.5 rounded-xl border border-white/5 sm:col-span-2 lg:col-span-4">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Cricket Achievements & Honors
                </span>
                {renderValueOrFallback(profile.achievements)}
              </div>
            </div>
          </div>

          {/* Section D: Auction Details */}
          <div className="bg-[#151D2E] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/10">
              <Gavel className="w-4 h-4 text-cyan-400" />
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                SECTION D — AUCTION STATUS & DETAILS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Base Points</span>
                <span className="text-white font-bold text-sm">{formatPoints(player.basePrice)} Points</span>
              </div>

              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Auction Status</span>
                <span
                  className={`font-bold text-sm uppercase ${
                    player.status === 'IN_RING' || isCurrentlyInRing
                      ? 'text-red-400 animate-pulse'
                      : player.status === 'SOLD'
                      ? 'text-emerald-400'
                      : player.status === 'UNSOLD'
                      ? 'text-slate-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {player.status === 'UPCOMING'
                    ? 'AVAILABLE'
                    : player.status === 'IN_RING' || isCurrentlyInRing
                    ? 'IN AUCTION RING'
                    : player.status}
                </span>
              </div>

              {/* Current Bid (if currently in ring) */}
              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Current Live Bid
                </span>
                {isCurrentlyInRing ? (
                  <span className="text-[#00D2FF] font-bold text-sm">
                    {formatPoints(currentBid)} Points
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Not Active</span>
                )}
              </div>

              {/* Final Sale Points / Winning Team */}
              <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Final Sale Points
                </span>
                {player.status === 'SOLD' && player.soldPrice ? (
                  <span className="text-[#F59E0B] font-bold text-sm">
                    {formatPoints(player.soldPrice)} Points
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Unsold / Pending</span>
                )}
              </div>

              {/* Assigned Team Banner if Sold */}
              {player.status === 'SOLD' && soldTeam && (
                <div
                  className="sm:col-span-2 lg:col-span-4 p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3"
                  style={{
                    backgroundColor: `${soldTeam.color}15`,
                    borderColor: `${soldTeam.color}40`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: soldTeam.color }}></span>
                    <span className="font-heading font-bold text-white text-sm">
                      ASSIGNED FRANCHISE: {soldTeam.name} ({soldTeam.shortName})
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-slate-400 mr-2">Acquisition Points:</span>
                    <span className="font-bold text-[#F59E0B] text-sm">
                      {formatPoints(player.soldPrice)} Points
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section E: Medical / Injury Information (Restricted to Authorized Admin) */}
          <div className="bg-[#151D2E] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                  SECTION E — MEDICAL & INJURY CLEARANCE
                </h3>
              </div>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isAdminAuthorized
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                }`}
              >
                {isAdminAuthorized ? 'AUTHORIZED ADMIN CLEARANCE' : 'RESTRICTED / SENSITIVE'}
              </span>
            </div>

            {isAdminAuthorized ? (
              /* Authorized Admin View */
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-300 block text-xs">
                      OFFICIAL MEDICAL BOARD CLEARANCE: GRANTED
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Player has undergone pre-tournament physical examination and cleared for competitive cricket.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Fitness Status
                    </span>
                    {renderValueOrFallback(profile.fitnessStatus)}
                  </div>

                  <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Recent Injury History
                    </span>
                    {renderValueOrFallback(profile.injuryHistory)}
                  </div>

                  <div className="bg-[#0D131F] p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Emergency Contact Relation
                    </span>
                    {renderValueOrFallback(profile.emergencyContactRelation)}
                  </div>
                </div>

                <div className="p-3 bg-[#0D131F] border border-white/5 rounded-xl text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Adani Occupational Health & Wellness Registry • Confidentiality Level: Class A</span>
                  <span className="text-amber-400 font-bold">Demo CPL Registration Dataset</span>
                </div>
              </div>
            ) : (
              /* Non-Admin Restricted View */
              <div className="p-5 bg-[#0D131F] border border-amber-500/30 rounded-xl flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm uppercase">
                    CONFIDENTIAL MEDICAL RECORD RESTRICTED
                  </h4>
                  <p className="font-mono text-xs text-slate-400 max-w-lg mt-1">
                    Under Adani Employee Data Privacy Policy and CPL Tournament Regulations, detailed medical records,
                    injury disclosures, and emergency contacts are strictly restricted to authorized CPL Admin
                    officials. This section is hidden from franchise managers, players, and spectators.
                  </p>
                </div>
                <button
                  onClick={() => setIsAdminAuthorized(true)}
                  className="mt-1 px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Authenticate Admin Key to Reveal Medical Dossier</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#151D2E]/90 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20 backdrop-blur-md">
          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>CPL 2026 Registration Dataset • Verified Official Employee Schema</span>
          </div>

          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all cursor-pointer border border-white/10"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
