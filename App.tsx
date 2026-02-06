
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { VideoCard } from './components/VideoCard';
import { GameCard } from './components/GameCard';
import { InsightModal } from './components/InsightModal';
import { AICore } from './components/AICore';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PiPPlayer } from './components/PiPPlayer';
import { Game, Video, ViewType, AIInsight } from './types';
import { getGameInsight, analyzeVideoContent } from './services/geminiService';
import { Flame, Star, Zap, Play, Bookmark, Info, Search, ChevronRight, Activity, Terminal, BrainCircuit } from 'lucide-react';

const MOCK_GAMES: Game[] = [
  { 
    id: '1', 
    title: 'Cyberpunk 2077', 
    category: 'RPG', 
    thumbnail: 'https://images.unsplash.com/photo-1605898835373-02f740d05d1d?q=80&w=1000&auto=format&fit=crop', 
    rating: 4.8, 
    trending: true 
  },
  { 
    id: '2', 
    title: 'Valorant', 
    category: 'FPS', 
    thumbnail: 'https://images.unsplash.com/photo-1614027126733-75778006768e?q=80&w=1000&auto=format&fit=crop', 
    rating: 4.9, 
    trending: true 
  },
  { 
    id: '3', 
    title: 'Elden Ring', 
    category: 'Action', 
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop', 
    rating: 5.0, 
    trending: true 
  },
  { 
    id: '4', 
    title: 'Minecraft', 
    category: 'Sandbox', 
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1000&auto=format&fit=crop', 
    rating: 4.7, 
    trending: false 
  },
];

const MOCK_VIDEOS: Video[] = [
  { 
    id: 'v1', 
    gameId: '2', 
    title: 'Como dominar a Jett en 5 minutos (Guía Pro)', 
    author: 'TenZ Official', 
    views: '2.4M', 
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop', 
    duration: '5:42', 
    type: 'guide',
    summary: '00:45 Equipamiento básico. 02:15 Uso de humos. 04:30 Combinación de ulti.'
  },
  { 
    id: 'v2', 
    gameId: '3', 
    title: '¡LIVE! Derrotando a Malenia con nivel 1', 
    author: 'SoulsMaster', 
    views: '12K', 
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop', 
    duration: 'LIVE', 
    type: 'live',
    summary: 'Stream épico intentando el no-hit.'
  },
  { 
    id: 'v3', 
    gameId: '1', 
    title: 'Cyberpunk Phantom Liberty: El final secreto', 
    author: 'GameLeaks', 
    views: '800K', 
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop', 
    duration: '12:15', 
    type: 'guide',
    summary: '01:10 Requisitos de misión. 05:20 Localización clave. 10:45 Cinemática final.'
  },
  { 
    id: 'v4', 
    gameId: '2', 
    title: 'Torneo Mundial: Gran Final EN VIVO', 
    author: 'Riot Games', 
    views: '150K', 
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop', 
    duration: 'LIVE', 
    type: 'live' 
  },
  { 
    id: 'v5', 
    gameId: '4', 
    title: '100 Días Hardcore: Construcción Épica', 
    author: 'DreamTeam', 
    views: '5.1M', 
    thumbnail: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?q=80&w=1000&auto=format&fit=crop', 
    duration: '45:00', 
    type: 'highlight',
    summary: '05:00 Primer diamante. 15:30 Granja de hierro. 32:45 El castillo final.'
  },
];

const LIVE_CATEGORIES = ['Nexus', 'FPS', 'RPG', 'Action', 'Survival'];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [pipVideo, setPipVideo] = useState<Video | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>([]);
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveCategory, setLiveCategory] = useState('Nexus');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDataLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeView]);

  useEffect(() => {
    const saved = localStorage.getItem('gamerflow_saved_videos');
    const liked = localStorage.getItem('gamerflow_liked_videos');
    if (saved) try { setSavedVideoIds(JSON.parse(saved)); } catch (e) {}
    if (liked) try { setLikedVideoIds(JSON.parse(liked)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('gamerflow_saved_videos', JSON.stringify(savedVideoIds));
  }, [savedVideoIds]);

  useEffect(() => {
    localStorage.setItem('gamerflow_liked_videos', JSON.stringify(likedVideoIds));
  }, [likedVideoIds]);

  const toggleSaveVideo = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    setSavedVideoIds(prev => prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]);
  };

  const toggleLikeVideo = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    setLikedVideoIds(prev => prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]);
  };

  const handleVideoClick = async (video: Video) => {
    if (pipVideo?.id === video.id) setPipVideo(null);
    setSelectedVideo(video);
    setIsInsightLoading(true);
    setAiInsight(null);
    const game = MOCK_GAMES.find(g => g.id === video.gameId);
    const insight = await getGameInsight(game?.title || "Gaming");
    setAiInsight(insight);
    setIsInsightLoading(false);
  };

  const handleDeepAnalysis = async (video: Video) => {
    setIsInsightLoading(true);
    const analysis = await analyzeVideoContent(video.title, video.summary || "");
    setAiInsight({
      tip: analysis || "Análisis fallido.",
      whyTrending: "Análisis Profundo con Gemini 3 Pro",
      difficulty: 'Hard'
    });
    setIsInsightLoading(false);
  };

  const handlePiP = (e: React.MouseEvent, video: Video) => {
    e.stopPropagation();
    if (selectedVideo?.id === video.id) setSelectedVideo(null);
    setPipVideo(video);
  };

  const handleExpandPiP = (video: Video) => {
    setPipVideo(null);
    handleVideoClick(video);
  };

  const filteredVideos = useMemo(() => {
    let base = MOCK_VIDEOS;
    if (activeView === 'live') {
      base = MOCK_VIDEOS.filter(v => v.type === 'live');
      if (liveCategory !== 'Nexus') {
        base = base.filter(v => {
          const game = MOCK_GAMES.find(g => g.id === v.gameId);
          return game?.category.toLowerCase() === liveCategory.toLowerCase();
        });
      }
    }
    else if (activeView === 'discover') base = MOCK_VIDEOS.filter(v => v.type === 'guide');
    else if (activeView === 'saved') base = MOCK_VIDEOS.filter(v => savedVideoIds.includes(v.id));

    if (!searchQuery.trim()) return base;
    const query = searchQuery.toLowerCase();
    return base.filter(v => v.title.toLowerCase().includes(query) || v.author.toLowerCase().includes(query));
  }, [activeView, savedVideoIds, searchQuery, liveCategory]);

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={(v) => { setIsDataLoading(true); setActiveView(v); }}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {activeView === 'neural' ? (
        <AICore />
      ) : (
        <div className="px-5 py-6 min-h-full">
          {/* Trending Home Section */}
          {activeView === 'home' && !searchQuery && (
            <section className="mb-12 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-outfit font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
                  <div className="p-2 bg-cyan-500 rounded text-black shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                    <Flame size={20} fill="black" />
                  </div>
                  Tendencias Globales
                </h2>
              </div>
              
              <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-6 -mx-5 px-5">
                {isDataLoading 
                  ? Array.from({ length: 4 }).map((_, i) => <GameCard key={i} isLoading={true} />)
                  : MOCK_GAMES.map(game => <GameCard key={game.id} game={game} />)
                }
              </div>
            </section>
          )}

          {/* Live HUD Special */}
          {activeView === 'live' && !searchQuery && (
            <div className="mb-10 animate-fade-in">
              <div className="flex gap-3 overflow-x-auto hide-scrollbar mb-8 -mx-5 px-5">
                {LIVE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setLiveCategory(cat)}
                    className={`px-6 py-2.5 rounded border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap italic ${
                      liveCategory === cat 
                      ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Feed HUD */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-l-4 border-cyan-500 pl-4 bg-cyan-500/5 py-2 rounded-r-xl">
              <h2 className="text-xl font-outfit font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
                {searchQuery ? (
                  <><Search className="text-cyan-400" size={20} /> Query: "{searchQuery}"</>
                ) : activeView === 'live' ? (
                  <><Zap className="text-cyan-500" size={20} fill="currentColor" /> Streams Activos</>
                ) : activeView === 'discover' ? (
                  <><Star className="text-cyan-400" size={20} fill="currentColor" /> Deep Learning</>
                ) : activeView === 'saved' ? (
                  <><Bookmark className="text-cyan-400" size={20} fill="currentColor" /> Archivo Encriptado</>
                ) : (
                  <><Terminal className="text-cyan-400" size={20} /> Feed de Sistema</>
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {isDataLoading 
                ? Array.from({ length: 3 }).map((_, i) => <VideoCard key={i} isLoading={true} />)
                : filteredVideos.length > 0 ? (
                  filteredVideos.map(video => {
                    const videoGame = MOCK_GAMES.find(g => g.id === video.gameId);
                    const relatedGames = MOCK_GAMES.filter(g => 
                      videoGame && g.category === videoGame.category && g.id !== videoGame.id
                    );
                    
                    return (
                      <VideoCard 
                        key={video.id} 
                        video={video} 
                        isSaved={savedVideoIds.includes(video.id)}
                        isLiked={likedVideoIds.includes(video.id)}
                        onToggleSave={toggleSaveVideo}
                        onToggleLike={toggleLikeVideo}
                        onPiP={handlePiP}
                        onClick={handleVideoClick}
                        onAnalyze={() => handleDeepAnalysis(video)}
                        relatedVideos={MOCK_VIDEOS.filter(v => v.gameId === video.gameId && v.id !== video.id)}
                        relatedGames={relatedGames}
                      />
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-zinc-900 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-500">
                      {searchQuery ? <Search size={40} /> : activeView === 'saved' ? <Bookmark size={40} /> : <Info size={40} />}
                    </div>
                  </div>
                )
              }
            </div>
          </section>
        </div>
      )}

      {/* User Terminal View */}
      {activeView === 'profile' && !isDataLoading && (
        <div className="px-5 py-12 flex flex-col items-center animate-fade-in text-center min-h-full bg-black relative">
          <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none"></div>
          <div className="relative">
             <div className="w-28 h-28 bg-black border-4 border-cyan-500 rounded-2xl mb-6 flex items-center justify-center text-5xl font-outfit font-black text-cyan-400 shadow-[0_0_30px_rgba(0,242,255,0.4)] relative overflow-hidden group">
               JD
             </div>
          </div>
          <h2 className="text-3xl font-outfit font-black text-white italic uppercase tracking-tighter">John_Doe.exe</h2>
          <div className="w-full space-y-4 mt-10">
             <button onClick={() => setActiveView('neural')} className="w-full bg-cyan-500 text-black font-black py-5 rounded-xl flex items-center justify-center gap-3 uppercase italic tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95">
               <BrainCircuit size={20} fill="black" /> Acceder al Núcleo Neuronal
             </button>
          </div>
        </div>
      )}

      <PiPPlayer video={pipVideo} onClose={() => setPipVideo(null)} onExpand={handleExpandPiP} />
      <InsightModal video={selectedVideo} insight={aiInsight} onClose={() => setSelectedVideo(null)} />
    </Layout>
  );
};

export default App;
