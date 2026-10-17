export type Role = 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';

export type PlayerStatus = 'UPCOMING' | 'IN_RING' | 'SOLD' | 'UNSOLD';

export type PlayerTier = 'Marquee' | 'Elite' | 'Premium';

export interface PlayerStats {
  matches: number;
  runs?: number;
  strikeRate?: number;
  wickets?: number;
  economy?: number;
  catches?: number;
  average?: number;
}

export type PlayingCategory = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper';
export type BattingStyle = 'Right Hand' | 'Left Hand';
export type BowlingStyle = 'Fast' | 'Medium' | 'Spin' | 'NA';
export type ExperienceLevel = 'Advanced' | 'Intermediate' | 'Beginner';
export type RolePreference = 'Captain' | 'Player' | 'Team Manager';

export interface PlayerRegistrationProfile {
  // A. Employee Details
  fullName: string;
  employeeId?: string;
  department: string;
  workLocation: string;
  mobileNumber?: string;
  email?: string;

  // B. Cricket Registration
  participationConfirmed: boolean;
  rolePreference: RolePreference;
  primaryCategory: PlayingCategory;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
  experienceLevel: ExperienceLevel;
  previousRepresentation?: string;

  // C. Skills & Achievements
  battingRating: number; // 1-5
  bowlingRating: number; // 1-5
  fieldingRating: number; // 1-5
  overallRating: number; // 0-10
  achievements?: string;

  // E. Medical / Injury Information (Admin Only)
  medicalClearance?: boolean;
  fitnessStatus?: string;
  injuryHistory?: string;
  emergencyContactRelation?: string;
  isDemoSampleData?: boolean;
}

export interface Player {
  id: string;
  lotNumber: number;
  name: string;
  role: Role;
  specialism: string;
  cluster: string;
  department: string;
  basePrice: number;
  experience: string;
  previousTournament: string;
  stats: PlayerStats;
  image: string;
  tier: PlayerTier;
  status: PlayerStatus;
  soldToTeamId?: string | null;
  soldPrice?: number | null;
  registrationProfile?: PlayerRegistrationProfile;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  paddleNumber: string;
  color: string;
  glowColor: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  manager: string;
  division: string;
  startingPurse: number;
  remainingPurse: number;
  squadCount: number;
  maxSquad: number;
  minReservePerSlot: number;
  squadRoleCounts: {
    batters: number;
    bowlers: number;
    allRounders: number;
    wicketkeepers: number;
  };
}

export interface BidRecord {
  id: string;
  lotNumber: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: string;
  increment: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: 'BID' | 'SOLD' | 'UNSOLD' | 'START' | 'PAUSE' | 'RESUME' | 'WARNING' | 'RESET' | 'SYSTEM';
  title: string;
  details: string;
  teamId?: string;
}

export type ViewMode = 'admin' | 'team' | 'projector' | 'squads' | 'pool';
