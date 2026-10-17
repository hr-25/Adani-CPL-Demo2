import React from 'react';
import { Ban, X } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';
import { formatPoints } from '../../utils/formatters';

export const UnsoldConfirmModal: React.FC = () => {
  const { isUnsoldModalOpen, closeUnsoldModal, confirmUnsold, activePlayer } = useAuction();

  if (!isUnsoldModalOpen || !activePlayer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#070B12]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#151D2E] border border-red-500/40 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] max-w-lg w-full flex flex-col gap-4 relative overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500"></div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white tracking-tight uppercase">
                MARK PLAYER UNSOLD
              </h2>
              <span className="font-mono text-xs text-red-400 font-semibold tracking-wider">
                PASS LOT TO ARCHIVE / RE-ENTRY POOL
              </span>
            </div>
          </div>
          <button
            onClick={closeUnsoldModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#0D131F] border border-white/10 rounded-xl flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>Target Lot:</span>
            <span className="text-white font-bold font-heading text-base">
              LOT #{activePlayer.lotNumber.toString().padStart(2, '0')} • {activePlayer.name}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>Base Points:</span>
            <span className="text-slate-200 font-mono text-lg font-bold">
              {formatPoints(activePlayer.basePrice)} Points
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Marking this player as UNSOLD will conclude the current bidding round with no winning bidder. No points will be deducted from any team. The player will be filed under unsold lots.
        </p>

        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            onClick={closeUnsoldModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            CANCEL / BACK
          </button>
          <button
            onClick={confirmUnsold}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-mono text-xs font-black tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Ban className="w-4 h-4" />
            CONFIRM UNSOLD
          </button>
        </div>
      </div>
    </div>
  );
};
