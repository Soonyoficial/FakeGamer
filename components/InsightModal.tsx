
import React from 'react';
import { X, Sparkles, BrainCircuit, Trophy, Info, Cpu, ShieldAlert } from 'lucide-react';
import { AIInsight, Video } from '../types';

interface InsightModalProps {
  video: Video | null;
  insight: AIInsight | null;
  onClose: () => void;
}

export const InsightModal: React.FC<InsightModalProps> = ({ video, insight, onClose }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-6 sm:p-0">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-zinc-950 w-full max-w-md rounded-2xl border-2 border-cyan-500 animate-fade-in relative overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.2)]">
        {/* Animated Scanning Bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 z-10 animate-pulse shadow-[0_0_15px_cyan]"></div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.6)]">
                <BrainCircuit className="text-black" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-outfit font-black text-white leading-tight uppercase italic tracking-tighter">Neural Link Alpha</h2>
                <p className="text-[9px] text-cyan-400 uppercase tracking-[0.3em] font-black animate-pulse">Analysis in Progress...</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-cyan-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {!insight ? (
            <div className="py-16 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                <Cpu size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-xs text-cyan-500 font-black uppercase tracking-[0.2em] animate-pulse">Extrayendo datos de Gemini 3...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-zinc-900 border-l-4 border-cyan-500 p-5 rounded-r-xl shadow-inner relative group">
                <div className="absolute -left-1 top-0 bottom-0 w-1 bg-cyan-400 blur-sm"></div>
                <div className="flex items-center gap-2 mb-3 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Sparkles size={14} className="animate-spin-slow" /> Protocolo Secreto
                </div>
                <p className="text-white text-sm leading-relaxed font-bold italic">"{insight.tip}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-cyan-400/60 text-[9px] font-black uppercase tracking-[0.2em]">
                    <ShieldAlert size={14} /> Inteligencia
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-tight font-bold">{insight.whyTrending}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-cyan-400/60 text-[9px] font-black uppercase tracking-[0.2em]">
                    <Trophy size={14} /> Nivel de Riesgo
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {[1, 2, 3].map((lvl) => (
                      <div 
                        key={lvl} 
                        className={`h-2 flex-1 rounded-sm ${
                          lvl <= (insight.difficulty === 'Easy' ? 1 : insight.difficulty === 'Medium' ? 2 : 3)
                          ? 'bg-cyan-500 shadow-[0_0_8px_cyan]' : 'bg-zinc-800'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[9px] text-cyan-500 mt-2 block font-black uppercase tracking-widest">{insight.difficulty}</span>
                </div>
              </div>

              <button 
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-5 rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.5)] active:scale-[0.98] uppercase italic tracking-[0.2em]"
                onClick={onClose}
              >
                Ejecutar Operación
              </button>
            </div>
          )}
        </div>
        
        {/* Footer accents */}
        <div className="flex justify-between px-8 pb-4">
           <div className="flex gap-1">
             <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
             <div className="w-4 h-1 bg-cyan-500/30 rounded-full"></div>
           </div>
           <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">GamerFlow Neural OS v4.2</span>
        </div>
      </div>
    </div>
  );
};
