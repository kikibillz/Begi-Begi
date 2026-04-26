export type Category = 'Items' | 'Favors' | 'Money' | 'Experiences';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  points: number;
  level: number;
  xp: number;
}

export interface Beg {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string;
  category: Category;
  image_url?: string;
  points_reward: number;
  status: 'pending' | 'granted';
  is_urgent: boolean;
  location?: string;
  author?: {
    username: string;
    avatar_url: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  granted_to: string;
  points: number;
  type: 'grant' | 'creation';
  timestamp: string;
  icon: string;
}
