import React from 'react';
import { Gavel, AlertCircle, Volume2, ShieldCheck, X } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

export const SoldConfirmModal: React.FC = () => {
  const { isSoldModalOpen, closeSoldModal, confirmSold, activePlayer, currentBid, highestBidder } = useAuction();

  if (!isSoldModalOpen || !activePlayer || !highestBidder) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#070B12]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#151D2E] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,210,255,0.25)] max-w-lg w-full flex flex-col gap-4 relative overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top glowing bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-[#00D2FF] to-blue-500"></div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00D2FF]">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white tracking-tight uppercase">
                CONFIRM HAMMER DROP
              </h2>
              <span className="font-mono text-xs text-[#F59E0B] font-semibold tracking-wider">
                LEGAL FINALITY PROTOCOL • ARENA FANFARE ARMED
              </span>
            </div>
          </div>
          <button
            onClick={closeSoldModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#0D131F] border border-white/10 rounded-xl flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>Target Lot:</span>
            <span className="text-white font-bold font-heading text-base">
              LOT #{activePlayer.lotNumber.toString().padStart(2, '0')} • {activePlayer.name}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>Winning Franchise:</span>
            <span className="font-bold text-cyan-400 font-heading text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: highestBidder.color }}></span>
              {highestBidder.name}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm text-slate-400 pt-2 border-t border-white/10">
            <span>Hammer Price:</span>
            <span className="text-[#F59E0B] font-mono text-2xl font-bold tracking-tight">
              ₹{currentBid.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center gap-2.5 text-xs font-mono text-cyan-300">
          <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Audio Payload: Master Gavel Impact + Corporate Brass Fanfare will sound across stadium PA.</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Executing this command will instantly lock this lot into the corporate ledger, deduct{' '}
          <strong className="text-white">₹{currentBid.toLocaleString('en-IN')}</strong> from{' '}
          <strong className="text-cyan-300">{highestBidder.name}</strong>'s purse, halt the auction clock, and activate arena celebratory audio.
        </p>

        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            onClick={closeSoldModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            CANCEL / ABORT
          </button>
          <button
            onClick={confirmSold}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#00D2FF] hover:brightness-110 text-[#003543] font-mono text-xs font-black tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            CONFIRM & RECORD SALE (DROP HAMMER)
          </button>
        </div>
      </div>
    </div>
  );
};
