import type { Beg, Profile, Badge, HistoryItem } from './types';

export const mockProfile: Profile = {
  id: 'user_1',
  username: 'Beggy McBegface',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
  bio: 'Professional dream-beggar & high-fiver based in London. Spare some kindness? ✨',
  points: 4820,
  level: 12,
  xp: 1180
};

export const mockBegs: Beg[] = [
  {
    id: 'beg_1',
    created_at: new Date().toISOString(),
    user_id: 'user_2',
    title: 'Math Homework Help',
    description: 'Who can help me with my math homework? Integration is killing me! 📐😩',
    category: 'Favors',
    points_reward: 50,
    status: 'pending',
    is_urgent: true,
    location: 'Central Library',
    author: {
      username: 'Sarah B.',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    }
  },
  {
    id: 'beg_2',
    created_at: new Date().toISOString(),
    user_id: 'user_3',
    title: 'Coffee Boost',
    description: 'Need a coffee boost! ☕ First person to bring me a Latte gets a legendary badge.',
    category: 'Coffee',
    points_reward: 75,
    status: 'pending',
    is_urgent: false,
    location: 'Campus Cafe',
    author: {
      username: 'Marco Polo',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco'
    }
  },
  {
    id: 'beg_3',
    created_at: new Date().toISOString(),
    user_id: 'user_4',
    title: 'Spare Charger',
    description: 'Spare charger? My phone is at 2%... 🔋🆘',
    category: 'Items',
    points_reward: 35,
    status: 'pending',
    is_urgent: false,
    location: 'Science Building',
    author: {
      username: 'Luna',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'
    }
  }
];

export const mockBadges: Badge[] = [
  { id: 'b1', name: 'Generous Hero', description: 'Shared 50+ Begs', icon: 'volunteer_activism', color: 'bg-begi-yellow' },
  { id: 'b2', name: 'Creative Beggar', description: '10+ Unique Requests', icon: 'palette', color: 'bg-begi-orange' }
];

export const mockHistory: HistoryItem[] = [
  { id: 'h1', title: 'Morning Coffee Wish', granted_to: '@alice_w', points: 50, type: 'grant', timestamp: '2h ago', icon: 'coffee' },
  { id: 'h2', title: 'Birthday Shoutout', granted_to: '@bob_builder', points: 120, type: 'grant', timestamp: 'Yesterday', icon: 'auto_awesome' },
  { id: 'h3', title: 'Walk the Dog Beg', granted_to: '@cat_lady', points: 80, type: 'grant', timestamp: '3 days ago', icon: 'pets' }
];

export const mockLeaders = [
  { id: 'l1', username: 'The_Don', points: 15400, level: 25, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Don' },
  { id: 'l2', username: 'Sarah_P', points: 12100, level: 20, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahP' },
  { id: 'l3', username: 'Alex99', points: 9800, level: 15, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'l4', username: 'PixelPusher', points: 8200, level: 12, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pixel' },
  { id: 'l5', username: 'BegiMaster', points: 7500, level: 10, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master' },
];
