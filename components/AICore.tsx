
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Search, BrainCircuit, Terminal, Sparkles, X, Loader2, Link as LinkIcon, Camera } from 'lucide-react';
import { chatWithThinking, searchGrounding, editGameImage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

export const AICore: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'chat' | 'search' | 'image'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendChat = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      if (activeTool === 'chat') {
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
        const response = await chatWithThinking(userMsg, history);
        
        // Extract thinking part from candidates when using models with reasoning capabilities
        const thinkingPart = response.candidates?.[0]?.content?.parts?.find((p: any) => 'thought' in p);
        const thinking = thinkingPart ? (thinkingPart as any).thought : undefined;

        setMessages(prev => [...prev, { 
          role: 'model', 
          text: response.text || "Operación fallida.",
          thinking: thinking
        }]);
      } else if (activeTool === 'search') {
        const response = await searchGrounding(userMsg);
        // Correctly extraction of grounding chunks for Google Search sources
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
          title: c.web?.title || 'Fuente',
          uri: c.web?.uri || '#'
        })).filter((s: any) => s.uri !== '#');
        
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: response.text || "No se encontraron resultados.",
          sources: sources
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Error en el enlace neuronal." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = async () => {
    if (!previewImage || !input.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const edited = await editGameImage(previewImage, input);
      if (edited) setPreviewImage(edited);
      setInput('');
    } catch (e) {
      alert("Error al editar imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black animate-fade-in relative">
      {/* Tool Selector HUD */}
      <div className="flex gap-2 p-4 bg-zinc-950 border-b border-cyan-500/20 sticky top-0 z-10">
        {[
          { id: 'chat', label: 'Neural Chat', icon: <BrainCircuit size={16} /> },
          { id: 'search', label: 'Grounding Search', icon: <Search size={16} /> },
          { id: 'image', label: 'Image Forge', icon: <Image size={16} /> }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id as any);
              setMessages([]);
            }}
            className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all border font-outfit uppercase italic font-black text-[9px] tracking-widest ${
              activeTool === tool.id 
              ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {tool.icon}
            {tool.label}
          </button>
        ))}
      </div>

      {/* Main Experience Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        {activeTool === 'image' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="aspect-square w-full bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-800 relative overflow-hidden flex items-center justify-center group">
              {previewImage ? (
                <>
                  <img src={previewImage} className="w-full h-full object-contain" alt="Preview" />
                  <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white">
                    <X size={20} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4 text-zinc-600 group-hover:text-cyan-400 transition-colors"
                >
                  <Camera size={48} />
                  <span className="font-black uppercase italic tracking-widest text-xs">Cargar Imagen de Juego</span>
                </button>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                  <LoadingSpinner size={40} />
                  <span className="text-cyan-400 font-black uppercase italic tracking-[0.2em] animate-pulse">Redibujando...</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase italic text-center px-4 leading-relaxed">
              Describe los cambios: "Añade un filtro retro", "Quita al personaje", "Haz que parezca de noche".
            </p>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <BrainCircuit size={64} className="text-cyan-500 mb-6" />
                <p className="font-outfit font-black uppercase italic tracking-[0.3em] text-cyan-400">Enlace Neuronal Listo</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                <div className={`max-w-[85%] p-4 rounded-2xl font-bold text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-cyan-500 text-black rounded-tr-none' 
                  : 'bg-zinc-900 text-white border border-zinc-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                {msg.thinking && (
                  <div className="mt-2 w-[85%] p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-[10px] text-zinc-600 font-mono overflow-x-auto">
                    <div className="flex items-center gap-2 mb-1 text-zinc-700">
                      <Terminal size={10} /> <span>LOG_THINKING.SYS</span>
                    </div>
                    {msg.thinking}
                  </div>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.sources.map((s, si) => (
                      <a 
                        key={si} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-cyan-500/20 rounded-full text-[9px] text-cyan-400 font-black hover:bg-cyan-500 hover:text-black transition-all"
                      >
                        <LinkIcon size={10} /> {s.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-cyan-500 animate-pulse">
                <LoadingSpinner size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Procesando...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Command Input HUD */}
      <div className="p-4 bg-zinc-950 border-t border-cyan-500/20 sticky bottom-0">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (activeTool === 'image' ? handleEditImage() : handleSendChat())}
            placeholder={activeTool === 'image' ? "Comando de edición..." : "Enviar comando a la IA..."}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-zinc-600"
          />
          <button 
            onClick={activeTool === 'image' ? handleEditImage : handleSendChat}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 p-2.5 rounded-xl transition-all ${
              !input.trim() || isLoading ? 'text-zinc-700' : 'text-cyan-400 hover:bg-cyan-500/10'
            }`}
          >
            {activeTool === 'image' ? <Sparkles size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
