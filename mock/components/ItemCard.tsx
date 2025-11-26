import { Item } from '../types';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Star } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="flex-1">{item.name}</h3>
          <Badge variant="outline" className="text-xs">
            {item.condition}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{item.dorm}</span>
        </div>
        <div className="flex items-center gap-2">
          <img 
            src={item.owner.avatar} 
            alt={item.owner.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600">{item.owner.name}</span>
          <div className="flex items-center gap-1 ml-auto">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{item.owner.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
