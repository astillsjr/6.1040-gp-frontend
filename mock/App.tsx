export interface User {
  id: string;
  name: string;
  dorm: string;
  rating: number;
  totalLends: number;
  points: number;
  avatar?: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  image: string;
  condition: 'Like New' | 'Good' | 'Fair';
  description: string;
  owner: User;
  dorm: string;
  availableFrom?: Date;
  availableUntil?: Date;
  pickupLocation: string;
  tags: string[];
}

export interface BorrowRequest {
  itemId: string;
  startTime: Date;
  endTime: Date;
  meetingPoint: string;
  notes?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}
