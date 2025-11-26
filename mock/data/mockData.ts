import { Item, User, Badge } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Alex Chen',
  dorm: 'Simmons Hall',
  rating: 4.8,
  totalLends: 24,
  points: 1250,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
};

export const mockUsers: User[] = [
  {
    id: '2',
    name: 'Sarah Kim',
    dorm: 'MacGregor House',
    rating: 4.9,
    totalLends: 18,
    points: 890,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: '3',
    name: 'Jordan Lee',
    dorm: 'Next House',
    rating: 4.7,
    totalLends: 32,
    points: 1520,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'
  },
  {
    id: '4',
    name: 'Maya Patel',
    dorm: 'Simmons Hall',
    rating: 5.0,
    totalLends: 12,
    points: 650,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya'
  },
  {
    id: '5',
    name: 'Chris Martinez',
    dorm: 'Burton-Conner',
    rating: 4.6,
    totalLends: 28,
    points: 1340,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris'
  },
  {
    id: '6',
    name: 'Emma Wilson',
    dorm: 'Burton-Conner',
    rating: 4.8,
    totalLends: 15,
    points: 720,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
  }
];

export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Cordless Drill',
    category: 'Tools',
    image: 'https://images.unsplash.com/photo-1606676539940-12768ce0e762?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMGRyaWxsJTIwdG9vbHxlbnwxfHx8fDE3NjMyMzk2MzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    condition: 'Good',
    description: 'DeWalt 20V cordless drill with battery and charger. Perfect for furniture assembly or quick dorm projects.',
    owner: mockUsers[0],
    dorm: 'MacGregor House',
    pickupLocation: 'MacGregor Lobby',
    tags: ['tools', 'power-tools', 'DIY']
  },
  {
    id: '2',
    name: 'Black Suit Jacket (Size 40R)',
    category: 'Professional Attire',
    image: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHN1aXQlMjBqYWNrZXR8ZW58MXx8fHwxNzYzMzE3MTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    condition: 'Like New',
    description: 'Professional black suit jacket, dry cleaned and ready for interviews. Size 40R.',
    owner: mockUsers[1],
    dorm: 'Next House',
    pickupLocation: 'Next House Desk',
    tags: ['clothing', 'professional', 'interview']
  },
  {
    id: '3',
    name: 'HDMI to USB-C Adapter',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1603899122911-27c0cb85824a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIRE1JJTIwY2FibGUlMjBhZGFwdGVyfGVufDF8fHx8MTc2MzMxNzE0OXww&ixlib=rb-4.1.0&q=80&w=1080',
    condition: 'Good',
    description: 'HDMI to USB-C adapter for presentations. Works with MacBooks and other USB-C devices.',
    owner: mockUsers[2],
    dorm: 'Simmons Hall',
    pickupLocation: 'Simmons 5th Floor Lounge',
    tags: ['electronics', 'adapter', 'presentation']
  },
  {
    id: '4',
    name: 'Assorted Yarn Collection',
    category: 'Craft Materials',
    image: 'https://images.unsplash.com/photo-1617960591870-62ca23993500?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMHlhcm4lMjBrbml0dGluZ3xlbnwxfHx8fDE3NjMzMTcxNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    condition: 'Good',
    description: 'Various colors of yarn available for small projects. Can lend specific colors or small amounts as needed.',
    owner: mockUsers[3],
    dorm: 'Simmons Hall',
    pickupLocation: 'Simmons Hall Lobby',
    tags: ['craft', 'materials', 'yarn', 'knitting']
  },
  {
    id: '5',
    name: 'Sewing Machine',
    category: 'Tools',
    image: 'https://images.unsplash.com/photo-1605002619330-080580537d72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXdpbmclMjBtYWNoaW5lJTIwY3JhZnR8ZW58MXx8fHwxNzYzMzE3MTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    condition: 'Good',
    description: 'Singer sewing machine, great for costume making or quick repairs. Thread included.',
    owner: mockUsers[4],
    dorm: 'Burton-Conner',
    pickupLocation: 'BC Main Desk',
    tags: ['tools', 'sewing', 'craft']
  },
  {
    id: '6',
    name: 'Camera Tripod',
    category: 'Photography',
    image: 'https://images.unsplash.com/photo-1762592818521-1dbbea6139a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjB0cmlwb2QlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjMzMTcxNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    condition: 'Like New',
    description: 'Adjustable tripod for cameras and phones. Perfect for class presentations or project documentation.',
    owner: mockUsers[0],
    dorm: 'MacGregor House',
    pickupLocation: 'MacGregor Courtyard',
    tags: ['photography', 'camera', 'tripod']
  }
];

export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Sharing Star',
    description: 'Lent 10+ items',
    icon: '⭐',
    earned: true
  },
  {
    id: '2',
    name: 'Eco Warrior',
    description: 'Saved 50 lbs of waste',
    icon: '🌱',
    earned: true
  },
  {
    id: '3',
    name: 'Early Adopter',
    description: 'One of the first 100 users',
    icon: '🚀',
    earned: true
  },
  {
    id: '4',
    name: 'Reliable Borrower',
    description: 'Perfect return record',
    icon: '✅',
    earned: false
  },
  {
    id: '5',
    name: 'Community Champion',
    description: 'Top lender in your dorm',
    icon: '🏆',
    earned: false
  }
];

export const dormLeaderboard = [
  { dorm: 'Simmons Hall', points: 4520, items: 87 },
  { dorm: 'Next House', points: 3890, items: 72 },
  { dorm: 'MacGregor House', points: 3650, items: 68 },
  { dorm: 'Burton-Conner', points: 2980, items: 54 },
  { dorm: 'New House', points: 2340, items: 41 }
];
