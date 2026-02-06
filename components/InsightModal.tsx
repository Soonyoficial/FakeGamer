
import React from 'react';
import { X, Sparkles, BrainCircuit, Trophy, Info, Cpu, ShieldAlert, FileText, Terminal } from 'lucide-react';
import { AIInsight, Video } from '../types';

interface InsightModalProps {
  video: Video | null;
  insight: AIInsight | null;
  onClose: () => void;
}

export const InsightModal: React.FC<InsightModalProps> = ({ video, insight, onClose }) => {
  if (!video) return null;

  const isDeepAnalysis = insight?.whyTrending.includes("Análisis Profundo");

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-6 sm:p-0">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-zinc-950 w-full max-w-md rounded-2xl border-2 border-cyan-500 animate-fade-in relative overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.2)]">
        {/* Animated Scanning Bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 z-10 animate-pulse shadow-[0_0_15px_cyan]"></div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.6)]">
                {isDeepAnalysis ? <FileText className="text-black" size={28} /> : <BrainCircuit className="text-black" size={28} />}
              </div>
              <div>
                <h2 className="text-xl font-outfit font-black text-white leading-tight uppercase italic tracking-tighter">
                  {isDeepAnalysis ? 'Deep Neural Analysis' : 'Neural Link Alpha'}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-cyan-400 uppercase tracking-[0.3em] font-black animate-pulse">
                    {insight ? 'System Ready' : 'Analyzing Data...'}
                  </span>
                </div>
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
              <p className="text-xs text-cyan-500 font-black uppercase tracking-[0.2em] animate-pulse text-center">
                Sincronizando con Gemini Pro...<br/><span className="text-[10px] opacity-60">Analizando estructura de video</span>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative ${isDeepAnalysis ? 'max-h-[350px] overflow-y-auto hide-scrollbar' : ''}`}>
                <div className="sticky top-0 z-10 bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Terminal size={12} className="text-cyan-400" />
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">DATA_EXTRACT_0x04</span>
                   </div>
                   <div className="flex gap-1">
                     <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                     <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-75"></div>
                   </div>
                </div>
                
                <div className="p-5">
                  {isDeepAnalysis ? (
                    <div className="text-zinc-200 text-sm leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                      {insight.tip}
                    </div>
                  ) : (
                    <div className="bg-cyan-500/5 p-4 rounded-lg border border-cyan-500/10">
                      <div className="flex items-center gap-2 mb-3 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <Sparkles size={14} className="animate-spin-slow" /> Protocolo Secreto
                      </div>
                      <p className="text-white text-sm leading-relaxed font-bold italic">"{insight.tip}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-cyan-400/60 text-[9px] font-black uppercase tracking-[0.2em]">
                    <ShieldAlert size={14} /> Metadatos
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-tight font-bold uppercase italic tracking-tighter">{insight.whyTrending}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-cyan-400/60 text-[9px] font-black uppercase tracking-[0.2em]">
                    <Trophy size={14} /> Dificultad
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
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.5)] active:scale-[0.98] uppercase italic tracking-[0.2em] text-xs"
                onClick={onClose}
              >
                Cerrar Protocolo
              </button>
            </div>
          )}
        </div>
        
        {/* Footer accents */}
        <div className="flex justify-between px-6 pb-4">
           <div className="flex gap-1 items-center">
             <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
             <span className="text-[7px] text-zinc-700 font-black uppercase tracking-widest">ENCRYPTED_LINK_ESTABLISHED</span>
           </div>
           <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Neural OS v4.5.1</span>
        </div>
      </div>
    </div>
  );
};
