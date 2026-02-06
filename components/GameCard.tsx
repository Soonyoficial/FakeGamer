
import React from 'react';
import { Star, Zap } from 'lucide-react';
import { Game } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface GameCardProps {
  game?: Game;
  isLoading?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isLoading }) => {
  if (isLoading || !game) {
    return (
      <div className="min-w-[280px] animate-pulse">
        <div className="aspect-video rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[280px] group cursor-pointer relative">
      <div className="aspect-video rounded-2xl overflow-hidden mb-3 border border-zinc-800 bg-zinc-950 shadow-2xl transition-all duration-500 group-hover:border-cyan-500 group-hover:shadow-[0_0_25px_rgba(0,242,255,0.3)] group-hover:-translate-y-2 relative">
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 opacity-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        <div className="absolute top-3 left-3">
           <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-cyan-500/50">
             <Zap size={10} className="text-cyan-400 animate-pulse" fill="currentColor" />
             <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Hot Zone</span>
           </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-lg font-outfit font-black text-white leading-tight uppercase italic tracking-tighter group-hover:text-cyan-400 transition-all drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
            {game.title}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] font-black text-cyan-400/80 uppercase tracking-widest">{game.category}</span>
            <div className="flex items-center bg-cyan-500 px-2 py-0.5 rounded text-black font-black text-[10px] shadow-[0_0_10px_rgba(6,182,212,0.5)]">
               <Star size={10} className="mr-1" fill="black" />
               {game.rating}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative corner accents */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};
