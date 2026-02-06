
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Users, Bookmark, Heart, Activity, Cpu, Volume2, VolumeX, ChevronDown, ChevronUp, Clock, Plus, Zap, BrainCircuit, Gamepad2, Target, Layers, Sparkles, PictureInPicture2 } from 'lucide-react';
import { Video, Game } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface VideoCardProps {
  video?: Video;
  isSaved?: boolean;
  isLiked?: boolean;
  onToggleSave?: (e: React.MouseEvent, videoId: string) => void;
  onToggleLike?: (e: React.MouseEvent, videoId: string) => void;
  onPiP?: (e: React.MouseEvent, video: Video) => void;
  onClick?: (video: Video) => void;
  onAnalyze?: () => void;
  isLoading?: boolean;
  relatedVideos?: Video[];
  relatedGames?: Game[];
}

interface Chapter {
  timestamp: string;
  label: string;
  seconds: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  isSaved, 
  isLiked,
  onToggleSave, 
  onToggleLike,
  onPiP,
  onClick, 
  onAnalyze,
  isLoading,
  relatedVideos = [],
  relatedGames = []
}) => {
  const [progress, setProgress] = useState(0); 
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [localSummary, setLocalSummary] = useState(video?.summary || '');
  const [newNote, setNewNote] = useState('');
  
  const [hoverInfo, setHoverInfo] = useState<{ x: number, time: string, percent: number } | null>(null);

  const durationToSeconds = (dur: string) => {
    if (dur === 'LIVE') return 3600;
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
    const parts = ts.split(':').map(Number).filter(n => !isNaN(n));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const totalSeconds = useMemo(() => video ? durationToSeconds(video.duration) : 0, [video]);

  const chapters = useMemo(() => {
    if (!localSummary) return [];
    const tsRegex = /((?:\d{1,2}:)?\d{1,2}:\d{2})/g;
    const lines = localSummary.split(/[.\n]/);
    const extracted: Chapter[] = [];
    lines.forEach(line => {
      const match = line.match(tsRegex);
      if (match) {
        const timestamp = match[0];
        const label = line.replace(timestamp, '').trim();
        if (label) extracted.push({ 
          timestamp, 
          label,
          seconds: timestampToSeconds(timestamp)
        });
      }
    });
    return extracted.sort((a, b) => a.seconds - b.seconds);
  }, [localSummary]);

  const currentChapter = useMemo(() => {
    const currentSec = (progress / 100) * totalSeconds;
    return [...chapters].reverse().find(c => c.seconds <= currentSec);
  }, [chapters, progress, totalSeconds]);

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setProgress(parseInt(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVol = parseInt(e.target.value);
    setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleScrubberHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    const timeInSeconds = (percent / 100) * totalSeconds;
    setHoverInfo({ x, percent, time: secondsToTimestamp(timeInSeconds) });
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
        <div className="aspect-video bg-zinc-900 flex items-center justify-center"><LoadingSpinner /></div>
      </div>
    );
  }

  const isLive = video.type === 'live';

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(0,242,255,0.15)] hover:border-cyan-500/50">
      <div onClick={() => onClick?.(video)} className="relative aspect-video overflow-hidden">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
        
        {isLive ? (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded-md z-10 shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-white/20">
            <Activity size={10} className="text-white animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Data</span>
          </div>
        ) : (
          <div className="absolute bottom-6 right-3 bg-cyan-500/90 px-3 py-1 rounded-md backdrop-blur-xl z-10 border border-white/20 shadow-xl shadow-cyan-900/50 transition-all group-hover:bottom-12">
            <span className="text-[11px] font-black text-black tracking-tight">{video.duration}</span>
          </div>
        )}

        {/* Video HUD Scrubber & Controls */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/95 to-transparent backdrop-blur-[2px]">
          {!isLive && (
            <div 
              className="relative w-full group/scrubber h-2 mb-2 cursor-pointer flex items-center" 
              onClick={(e) => e.stopPropagation()} 
              onMouseMove={handleScrubberHover} 
              onMouseLeave={() => setHoverInfo(null)}
            >
              {/* Preview Thumbnail HUD */}
              {hoverInfo && (
                <div 
                  className="absolute bottom-8 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50 animate-fade-in" 
                  style={{ left: `${hoverInfo.percent}%` }}
                >
                  <div className="bg-black/90 border-2 border-cyan-500 rounded-xl overflow-hidden w-40 aspect-video shadow-[0_0_30px_rgba(0,242,255,0.5)] backdrop-blur-md relative border-b-0">
                    <img 
                      src={video.thumbnail} 
                      className="w-full h-full object-cover brightness-75 contrast-125 saturate-150" 
                      style={{ filter: `hue-rotate(${hoverInfo.percent}deg)` }} 
                      alt="preview" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent pointer-events-none"></div>
                    <div className="absolute top-1 left-1.5 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-[7px] font-black text-white/80 uppercase tracking-widest italic">Analyzing Frame_{Math.floor(hoverInfo.percent * 14)}</span>
                    </div>
                    <div className="absolute top-1 right-1.5">
                      <Target size={10} className="text-cyan-400/50" />
                    </div>
                    <div className="absolute bottom-1 right-1.5 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                      <span className="text-[10px] font-black text-cyan-400 italic">{hoverInfo.time}</span>
                    </div>
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>
                  </div>
                  <div className="w-[1px] h-4 bg-gradient-to-b from-cyan-500 to-transparent shadow-[0_0_10px_cyan]"></div>
                </div>
              )}

              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress} 
                onChange={handleScrubberChange} 
                className="absolute inset-0 w-full h-1.5 appearance-none bg-zinc-800/80 rounded-full cursor-pointer overflow-hidden [&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 group-hover/scrubber:h-2 transition-all" 
                style={{ background: `linear-gradient(to right, #00f2ff ${progress}%, #27272a ${progress}%)` }} 
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] pointer-events-none transition-transform scale-0 group-hover/scrubber:scale-100 z-10"
                style={{ left: `calc(${progress}% - 6px)` }}
              ></div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 bg-black/40 hover:bg-cyan-500 hover:text-black rounded-lg backdrop-blur-md border border-white/10 transition-all" onClick={(e) => e.stopPropagation()}><Play size={16} fill="currentColor" /></button>
              
              {/* Refined Volume Control */}
              <div 
                className="flex items-center gap-2 group/volume relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button 
                  onClick={toggleMute}
                  className="p-2 bg-black/40 hover:bg-zinc-800 rounded-lg backdrop-blur-md border border-white/10 transition-all text-white"
                >
                  {(isMuted || volume === 0) ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                
                <div className={`flex items-center transition-all duration-300 origin-left ${showVolumeSlider ? 'w-24 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-2 overflow-hidden'}`}>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={isMuted ? 0 : volume} 
                    onChange={handleVolumeChange}
                    onClick={e => e.stopPropagation()}
                    className="w-full h-1 appearance-none bg-zinc-700 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_8px_cyan]" 
                    style={{ background: `linear-gradient(to right, #06b6d4 ${isMuted ? 0 : volume}%, #3f3f46 ${isMuted ? 0 : volume}%)` }}
                  />
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); onAnalyze?.(); }} 
                className="p-2 bg-black/40 hover:bg-cyan-500 hover:text-black rounded-lg backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 text-[10px] font-black px-3 uppercase italic tracking-widest"
              >
                <BrainCircuit size={14} /> Analyze
              </button>

              <button 
                onClick={(e) => onPiP?.(e, video as Video)} 
                className="p-2 bg-black/40 hover:bg-cyan-500 hover:text-black rounded-lg backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 text-[10px] font-black px-2 uppercase italic tracking-widest"
                title="Mini Player"
              >
                <PictureInPicture2 size={14} />
              </button>
            </div>
            
            {!isLive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-black/60 rounded-md border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] font-mono font-black text-cyan-400 tracking-wider">
                  {secondsToTimestamp((progress/100)*totalSeconds)} / {video?.duration}
                </span>
              </div>
            )}

            {currentChapter && !showVolumeSlider && (
              <div className="px-3 py-1 bg-cyan-500/20 rounded-md border border-cyan-500/30 backdrop-blur-sm animate-fade-in hidden sm:block">
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest truncate max-w-[120px] block italic">
                  Ch: {currentChapter.label}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button onClick={(e) => onToggleLike?.(e, video?.id || '')} className={`p-2.5 rounded-xl border ${isLiked ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]' : 'bg-black/60 border-white/10 text-white/70 hover:border-cyan-500/50'}`}><Heart size={16} fill={isLiked ? "currentColor" : "none"} /></button>
          <button onClick={(e) => onToggleSave?.(e, video?.id || '')} className={`p-2.5 rounded-xl border ${isSaved ? 'bg-cyan-500 border-cyan-300 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-black/60 border-white/10 text-white/70 hover:border-cyan-500/50'}`}><Bookmark size={16} fill={isSaved ? "currentColor" : "none"} /></button>
        </div>
      </div>

      <div className="p-4 bg-zinc-950">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex gap-1 mb-2">
              {video?.type === 'guide' && <span className="flex items-center gap-1.5 text-[9px] font-black text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded border border-cyan-400/30 uppercase tracking-wider"><Cpu size={10} /> Neural Insight 100%</span>}
            </div>
            <h3 className="font-outfit font-black text-sm line-clamp-2 leading-tight text-white group-hover:text-cyan-400 transition-colors uppercase italic tracking-tighter">{video?.title}</h3>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsDescriptionOpen(!isDescriptionOpen); }} className="ml-2 p-1 text-zinc-500 hover:text-cyan-400 transition-colors">{isDescriptionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
        </div>

        {isDescriptionOpen && (
          <div className="mt-4 pt-4 border-t border-zinc-900 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="text-[11px] text-zinc-400 font-medium mb-6">
              {localSummary ? renderDescriptionWithTimestamps(localSummary) : <span className="italic">Sin descripción.</span>}
            </div>

            {/* Prominent Analyze Video Content Button */}
            <div className="mb-6">
              <button 
                onClick={(e) => { e.stopPropagation(); onAnalyze?.(); }}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-zinc-900 to-black border border-cyan-500/30 py-4 rounded-xl text-cyan-400 font-black uppercase italic tracking-widest text-[11px] hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all group/analyze"
              >
                <Sparkles size={16} className="group-hover/analyze:animate-pulse" />
                Analyze Video Content
                <BrainCircuit size={16} className="text-zinc-500" />
              </button>
            </div>

            {/* Neural Timeline Chapters */}
            {chapters.length > 0 && (
              <div className="mb-8 p-4 bg-black/40 border border-zinc-800/50 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50 blur-[2px]"></div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] italic">Timeline de Segmentos</span>
                  </div>
                  <span className="text-[8px] text-zinc-600 font-mono tracking-tighter">NODE_SEGMENTATION_04</span>
                </div>

                <div className="space-y-3">
                  {chapters.map((chapter, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => jumpToTimestamp(chapter.timestamp)}
                      className={`w-full group/chapter flex items-center gap-4 p-3 rounded-xl transition-all border ${
                        currentChapter?.timestamp === chapter.timestamp 
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,255,0.1)]' 
                        : 'bg-zinc-900/40 border-zinc-800/40 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-outfit font-black text-[9px] border transition-all ${
                        currentChapter?.timestamp === chapter.timestamp 
                        ? 'bg-cyan-500 border-white/20 text-black shadow-[0_0_10px_cyan]' 
                        : 'bg-zinc-800 border-white/5 text-zinc-500 group-hover/chapter:border-cyan-500/50 group-hover/chapter:text-cyan-400'
                      }`}>
                        {String(cIdx + 1).padStart(2, '0')}
                      </div>

                      <div className="flex-1 text-left">
                        <p className={`text-[11px] font-black uppercase italic tracking-tight transition-colors ${
                          currentChapter?.timestamp === chapter.timestamp ? 'text-cyan-400' : 'text-zinc-300 group-hover/chapter:text-white'
                        }`}>
                          {chapter.label}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={10} className="text-zinc-600" />
                          <span className="text-[10px] font-black font-mono text-zinc-600 tracking-widest">{chapter.timestamp}</span>
                        </div>
                      </div>

                      <div className={`transition-all duration-300 ${
                        currentChapter?.timestamp === chapter.timestamp ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                      }`}>
                        <Play size={12} fill="currentColor" className="text-cyan-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {!isLive && (
              <form onSubmit={addCurrentTimestamp} className="flex gap-2 mb-2">
                <input type="text" placeholder="Añadir nota en este momento..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-[10px] text-white focus:outline-none focus:border-cyan-500" />
                <button type="submit" className="bg-cyan-500 text-black p-1.5 rounded-lg hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all"><Plus size={16} /></button>
              </form>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-zinc-500 text-[10px]">
          <span className="font-bold flex items-center gap-2 group-hover:text-zinc-300 transition-colors uppercase tracking-widest"><div className="w-6 h-6 rounded border border-cyan-500/50 flex items-center justify-center text-[10px] text-cyan-400 font-black">{video?.author[0]}</div>{video?.author}</span>
          <div className="flex items-center gap-3"><span className="flex items-center gap-1 font-black"><Users size={12} className="text-cyan-500" /> {video?.views}</span></div>
        </div>

        {/* Related Content Section: Videos */}
        {relatedVideos.length > 0 && (
          <div className="mt-6 border-t border-zinc-900 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} className="text-cyan-400" fill="currentColor" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Videos Relacionados</span>
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

        {/* Related Content Section: Games */}
        {relatedGames.length > 0 && (
          <div className="mt-4 border-t border-zinc-900 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 size={12} className="text-purple-400" fill="currentColor" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Juegos Similares</span>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {relatedGames.map(rg => (
                <div 
                  key={rg.id} 
                  className="min-w-[100px] max-w-[100px] group/game"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden border border-zinc-800 group-hover/game:border-purple-500/50 transition-all mb-1 relative">
                    <img src={rg.thumbnail} className="w-full h-full object-cover grayscale-[0.3] group-hover/game:grayscale-0 transition-all" alt={rg.title} />
                    <div className="absolute top-1 right-1 bg-black/80 px-1 rounded text-[7px] font-black text-purple-400 border border-purple-500/30">
                      {rg.rating}
                    </div>
                  </div>
                  <p className="text-[8px] font-bold text-zinc-500 line-clamp-1 uppercase group-hover/game:text-purple-400 transition-colors">{rg.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
