
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Users, Bookmark, CheckCircle2, Heart, PictureInPicture2, Activity, Cpu, Volume2, VolumeX, ChevronDown, ChevronUp, Clock, Plus, Zap } from 'lucide-react';
import { Video } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface VideoCardProps {
  video?: Video;
  isSaved?: boolean;
  isLiked?: boolean;
  onToggleSave?: (e: React.MouseEvent, videoId: string) => void;
  onToggleLike?: (e: React.MouseEvent, videoId: string) => void;
  onPiP?: (e: React.MouseEvent, video: Video) => void;
  onClick?: (video: Video) => void;
  isLoading?: boolean;
  relatedVideos?: Video[];
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  isSaved, 
  isLiked,
  onToggleSave, 
  onToggleLike,
  onPiP,
  onClick, 
  isLoading,
  relatedVideos = []
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0); 
  const [volume, setVolume] = useState(80);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [localSummary, setLocalSummary] = useState(video?.summary || '');
  const [newNote, setNewNote] = useState('');

  // Helpers for time conversion
  const durationToSeconds = (dur: string) => {
    if (dur === 'LIVE') return 3600; // Arbitrary for live
    const parts = dur.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const secondsToTimestamp = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const mm = mins.toString().padStart(2, '0');
    const ss = secs.toString().padStart(2, '0');
    return hrs > 0 ? `${hrs}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const timestampToSeconds = (ts: string) => {
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const totalSeconds = useMemo(() => video ? durationToSeconds(video.duration) : 0, [video]);

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setProgress(parseInt(e.target.value));
  };

  const jumpToTimestamp = (ts: string) => {
    const targetSec = timestampToSeconds(ts);
    const newProgress = (targetSec / totalSeconds) * 100;
    setProgress(Math.min(100, Math.max(0, newProgress)));
  };

  const addCurrentTimestamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const currentSec = (progress / 100) * totalSeconds;
    const ts = secondsToTimestamp(currentSec);
    setLocalSummary(prev => `${prev}\n${ts} ${newNote}`);
    setNewNote('');
  };

  const renderDescriptionWithTimestamps = (text: string) => {
    const tsRegex = /(\d{1,2}:)?\d{1,2}:\d{2}/g;
    
    return text.split('\n').map((line, idx) => {
      const lineParts = line.split(/((?:\d{1,2}:)?\d{1,2}:\d{2})/g);
      return (
        <div key={idx} className="mb-1 leading-relaxed">
          {lineParts.map((part, pIdx) => {
            if (tsRegex.test(part)) {
              return (
                <button
                  key={pIdx}
                  onClick={(e) => { e.stopPropagation(); jumpToTimestamp(part); }}
                  className="text-cyan-400 font-black hover:underline mr-1"
                >
                  {part}
                </button>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  if (isLoading || !video) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 animate-pulse">
        <div className="aspect-video bg-zinc-900 flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <div className="p-4 space-y-3">
          <div className="h-4 w-3/4 bg-zinc-900 rounded"></div>
        </div>
      </div>
    );
  }

  const isLive = video.type === 'live';

  return (
    <div 
      className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(0,242,255,0.15)] hover:border-cyan-500/50"
    >
      <div 
        onClick={() => onClick?.(video)}
        className="relative aspect-video overflow-hidden"
      >
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
        
        {isLive ? (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-md z-10 shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-white/20">
            <Activity size={10} className="text-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Data</span>
          </div>
        ) : (
          <div className="absolute bottom-6 right-3 bg-cyan-500/90 px-3 py-1 rounded-md backdrop-blur-xl z-10 border border-white/20 shadow-xl shadow-cyan-900/50 transition-all group-hover:bottom-8">
            <span className="text-[11px] font-black text-black tracking-tight">{video.duration}</span>
          </div>
        )}

        {/* Video HUD Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 to-transparent">
          {!isLive && (
            <div className="relative w-full group/scrubber h-1.5 mb-1" onClick={(e) => e.stopPropagation()}>
              <input 
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleScrubberChange}
                className="absolute inset-0 w-full h-full appearance-none bg-zinc-800 rounded-full cursor-pointer overflow-hidden
                           [&::-webkit-slider-runnable-track]:h-full
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0
                           group-hover/scrubber:h-2 transition-all"
                style={{
                  background: `linear-gradient(to right, #06b6d4 ${progress}%, #27272a ${progress}%)`
                }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-cyan-500 rounded-full shadow-[0_0_10px_cyan] pointer-events-none transition-transform scale-0 group-hover/scrubber:scale-100"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                className="p-1.5 bg-black/40 hover:bg-cyan-500 hover:text-black rounded-lg backdrop-blur-md border border-white/10 transition-all"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <Play size={14} fill="currentColor" />
              </button>
              
              <div 
                className="flex items-center gap-2 group/volume relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="p-1.5 bg-black/40 hover:bg-zinc-800 rounded-lg backdrop-blur-md border border-white/10 transition-all text-white/80"
                >
                  {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                
                <div className={`flex items-center transition-all duration-300 ${showVolumeSlider ? 'w-20 opacity-100 scale-x-100 translate-x-0' : 'w-0 opacity-0 scale-x-0 -translate-x-2'} overflow-hidden h-8 bg-black/60 backdrop-blur-md rounded-lg border border-white/5 px-2`}>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => { e.stopPropagation(); setVolume(parseInt(e.target.value)); }}
                    className="w-full h-1 appearance-none bg-zinc-700 rounded-full accent-cyan-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">
                {isLive ? 'Link: EST' : `${secondsToTimestamp((progress/100)*totalSeconds)} / ${video.duration}`}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button onClick={(e) => onToggleLike?.(e, video.id)} className={`p-2.5 rounded-xl border ${isLiked ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]' : 'bg-black/60 border-white/10 text-white/70 hover:border-cyan-500/50'}`}>
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button onClick={(e) => onToggleSave?.(e, video.id)} className={`p-2.5 rounded-xl border ${isSaved ? 'bg-cyan-500 border-cyan-300 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-black/60 border-white/10 text-white/70 hover:border-cyan-500/50'}`}>
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onPiP?.(e, video); }} className="p-2.5 bg-black/60 border border-white/10 text-white/70 hover:border-cyan-500/50 rounded-xl backdrop-blur-md">
            <PictureInPicture2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 bg-zinc-950">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex gap-1 mb-2">
              {video.type === 'guide' && (
                <span className="flex items-center gap-1.5 text-[9px] font-black text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded border border-cyan-400/30 uppercase tracking-wider">
                  <Cpu size={10} /> Neural Insight 100%
                </span>
              )}
            </div>
            <h3 className="font-outfit font-black text-sm line-clamp-2 leading-tight text-white group-hover:text-cyan-400 transition-colors uppercase italic tracking-tighter">
              {video.title}
            </h3>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsDescriptionOpen(!isDescriptionOpen); }}
            className="ml-2 p-1 text-zinc-500 hover:text-cyan-400 transition-colors"
          >
            {isDescriptionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {isDescriptionOpen && (
          <div className="mt-4 pt-4 border-t border-zinc-900 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="text-[11px] text-zinc-400 font-medium mb-4">
              {localSummary ? renderDescriptionWithTimestamps(localSummary) : <span className="italic">Sin descripción.</span>}
            </div>
            
            {!isLive && (
              <form onSubmit={addCurrentTimestamp} className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  placeholder="Añadir nota en este momento..." 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-[10px] text-white focus:outline-none focus:border-cyan-500"
                />
                <button 
                  type="submit"
                  className="bg-cyan-500 text-black p-1.5 rounded-lg hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all"
                >
                  <Plus size={16} />
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-zinc-500 text-[10px]">
          <span className="font-bold flex items-center gap-2 group-hover:text-zinc-300 transition-colors uppercase tracking-widest">
            <div className="w-6 h-6 rounded border border-cyan-500/50 flex items-center justify-center text-[10px] text-cyan-400 font-black">
              {video.author[0]}
            </div>
            {video.author}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-black"><Users size={12} className="text-cyan-500" /> {video.views}</span>
          </div>
        </div>

        {/* Related Content Section */}
        {relatedVideos.length > 0 && (
          <div className="mt-6 border-t border-zinc-900 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} className="text-cyan-400" fill="currentColor" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Contenido Relacionado</span>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {relatedVideos.map(rv => (
                <div 
                  key={rv.id} 
                  onClick={(e) => { e.stopPropagation(); onClick?.(rv); }}
                  className="min-w-[120px] max-w-[120px] group/item"
                >
                  <div className="aspect-video rounded-lg overflow-hidden border border-zinc-800 group-hover/item:border-cyan-500/50 transition-all mb-1 relative">
                    <img src={rv.thumbnail} className="w-full h-full object-cover grayscale-[0.5] group-hover/item:grayscale-0 transition-all" alt={rv.title} />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[8px] font-black text-white">{rv.duration}</div>
                  </div>
                  <p className="text-[8px] font-bold text-zinc-500 line-clamp-1 uppercase group-hover/item:text-cyan-400 transition-colors">{rv.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
