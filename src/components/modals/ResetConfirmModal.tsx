import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

export const ResetConfirmModal: React.FC = () => {
  const { isResetModalOpen, closeResetModal, resetDemo } = useAuction();

  if (!isResetModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#070B12]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#151D2E] border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] max-w-lg w-full flex flex-col gap-4 relative overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400"></div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white tracking-tight uppercase">
                RESTART DEMO ENVIRONMENT
              </h2>
              <span className="font-mono text-xs text-amber-400 font-semibold tracking-wider">
                RESET SAMPLE FRANCHISES & PLAYER LOTS
              </span>
            </div>
          </div>
          <button
            onClick={closeResetModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#0D131F] border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            This action will restore all 4 team points budgets to their baseline demo balance, reset Lot #04 (Arjun Shah) as the active live player, re-arm the auction timer, and restore the sample audit log.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            onClick={closeResetModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={resetDemo}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-[#070B12] font-mono text-xs font-black tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            CONFIRM & RESET DEMO
          </button>
        </div>
      </div>
    </div>
  );
};
