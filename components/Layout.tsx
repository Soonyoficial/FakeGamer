
import React, { useState } from 'react';
import { Home, PlayCircle, Compass, User, Bell, Search, Bookmark, X, Cpu, BrainCircuit } from 'lucide-react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, searchQuery, setSearchQuery }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-black shadow-2xl relative border-x border-zinc-900">
      {/* Top Header - HUD Style */}
      <header className="sticky top-0 z-50 glass px-5 py-4 flex flex-col gap-3">
        <div className="flex justify-between items-center w-full">
          {!isSearchVisible ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center font-outfit font-black text-black text-2xl shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                  G
                </div>
                <div>
                  <h1 className="text-xl font-outfit font-black tracking-tighter text-white uppercase italic">GamerFlow</h1>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-[8px] text-cyan-400 font-bold tracking-[0.2em] uppercase">System Online</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSearchVisible(true)}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/50 transition-all text-zinc-400"
                >
                  <Search size={20} />
                </button>
                <button className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-cyan-500/50 transition-all relative text-zinc-400">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full border-2 border-black animate-ping"></span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full border-2 border-black"></span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center w-full gap-2 animate-fade-in">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Infiltrar sistema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-cyan-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all placeholder:text-zinc-600"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsSearchVisible(false);
                  setSearchQuery('');
                }}
                className="text-xs font-black text-cyan-500 uppercase px-2 hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 overflow-y-auto hide-scrollbar">
        {children}
      </main>

      {/* Bottom Navigation - HUD Overlay */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-cyan-500/20 px-2 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <NavButton 
          icon={<Home size={20} />} 
          label="Nexus" 
          active={activeView === 'home'} 
          onClick={() => setActiveView('home')} 
        />
        <NavButton 
          icon={<PlayCircle size={20} />} 
          label="Live" 
          active={activeView === 'live'} 
          isLiveTab={true}
          onClick={() => setActiveView('live')} 
        />
        <NavButton 
          icon={<BrainCircuit size={20} />} 
          label="AI Core" 
          active={activeView === 'neural'} 
          onClick={() => setActiveView('neural')} 
        />
        <NavButton 
          icon={<Bookmark size={20} />} 
          label="Saved" 
          active={activeView === 'saved'} 
          onClick={() => setActiveView('saved')} 
        />
        <NavButton 
          icon={<User size={20} />} 
          label="User" 
          active={activeView === 'profile'} 
          onClick={() => setActiveView('profile')} 
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isLiveTab?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, isLiveTab }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 relative ${
      active ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-zinc-600 grayscale opacity-60'
    }`}
  >
    {icon}
    {isLiveTab && (
      <span className="absolute top-0 right-1/4 w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse border-2 border-black shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
    )}
    <span className={`text-[8px] font-black uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    {active && (
      <div className="absolute -bottom-2 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"></div>
    )}
  </button>
);
