import React from 'react';
import { useAuction } from './context/AuctionContext';
import { Header } from './components/Header';
import { AdminConsole } from './components/views/AdminConsole';
import { TeamManager } from './components/views/TeamManager';
import { ProjectorDisplay } from './components/views/ProjectorDisplay';
import { TeamSquads } from './components/views/TeamSquads';
import { PlayerPool } from './components/views/PlayerPool';
import { SoldConfirmModal } from './components/modals/SoldConfirmModal';
import { UnsoldConfirmModal } from './components/modals/UnsoldConfirmModal';
import { ResetConfirmModal } from './components/modals/ResetConfirmModal';
import { PlayerProfileModal } from './components/modals/PlayerProfileModal';

export const App: React.FC = () => {
  const { viewMode } = useAuction();

  return (
    <div className="min-h-screen bg-[#070B12] text-[#dfe2ed] flex flex-col font-sans selection:bg-[#00D2FF] selection:text-[#003543]">
      {/* Sticky Broadcast Header */}
      <Header />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 flex flex-col w-full">
        {viewMode === 'admin' && <AdminConsole />}
        {viewMode === 'team' && <TeamManager />}
        {viewMode === 'projector' && <ProjectorDisplay />}
        {viewMode === 'squads' && <TeamSquads />}
        {viewMode === 'pool' && <PlayerPool />}
      </main>

      {/* Global Interactive Modals */}
      <SoldConfirmModal />
      <UnsoldConfirmModal />
      <ResetConfirmModal />
      <PlayerProfileModal />

      {/* Corporate Presentation Footer */}
      <footer className="w-full bg-[#0A0E15] py-3.5 px-4 lg:px-8 border-t border-white/5 text-xs font-mono text-slate-400">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">ADANI CEMENT CPL 2026</span>
            <span>•</span>
            <span>CORPORATE PREMIER LEAGUE AUCTION ENGINE DEMO</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>FOR MANAGEMENT REVIEW & APPROVAL</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">ALL SAMPLE DATA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
