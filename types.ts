
export interface Game {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  rating: number;
  trending: boolean;
}

export interface Video {
  id: string;
  gameId: string;
  title: string;
  author: string;
  views: string;
  thumbnail: string;
  duration: string;
  type: 'guide' | 'highlight' | 'live';
  summary?: string;
}

export type ViewType = 'home' | 'live' | 'discover' | 'saved' | 'profile' | 'neural';

export interface AIInsight {
  tip: string;
  whyTrending: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  thinking?: string;
  sources?: { title: string; uri: string }[];
}
