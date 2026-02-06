
import React from 'react';
import { X, Maximize2, Play, Pause } from 'lucide-react';
import { Video } from '../types';

interface PiPPlayerProps {
  video: Video | null;
  onClose: () => void;
  onExpand: (video: Video) => void;
}

export const PiPPlayer: React.FC<PiPPlayerProps> = ({ video, onClose, onExpand }) => {
  if (!video) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[60] w-48 aspect-video rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/30 border border-zinc-800 animate-fade-in group">
      <div className="absolute inset-0 bg-black">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>
      
      {/* Controls Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex justify-between items-start">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 bg-black/60 rounded-lg text-white/80 hover:text-white"
          >
            <X size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onExpand(video); }}
            className="p-1 bg-black/60 rounded-lg text-white/80 hover:text-white"
          >
            <Maximize2 size={14} />
          </button>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <Play size={14} fill="white" className="text-white ml-0.5" />
          </div>
        </div>

        <div className="w-full">
          <p className="text-[10px] font-bold text-white truncate drop-shadow-md">
            {video.title}
          </p>
          <div className="w-full h-0.5 bg-zinc-700 rounded-full mt-1 overflow-hidden">
            <div className="w-1/3 h-full bg-indigo-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Live Badge if applicable */}
      {video.type === 'live' && (
        <div className="absolute top-2 left-2 bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase group-hover:opacity-0 transition-opacity">
          LIVE
        </div>
      )}
    </div>
  );
};
