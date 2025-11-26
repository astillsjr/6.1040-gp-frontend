import { useState } from 'react';
import { Item } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Calendar } from './ui/calendar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, MapPin, Star, Clock, Calendar as CalendarIcon } from 'lucide-react';

interface ItemDetailScreenProps {
  item: Item;
  onBack: () => void;
  onBorrow: () => void;
}

export function ItemDetailScreen({ item, onBack, onBorrow }: ItemDetailScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Generate availability for demo (showing available times)
  const availableTimes = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Item Image */}
        <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-gray-100 mb-6">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Item Info */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-gray-900">{item.name}</h1>
            <Badge variant="outline">{item.condition}</Badge>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary">{item.category}</Badge>
            {item.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <p className="text-gray-600 mb-4">{item.description}</p>

          {/* Location */}
          <Card className="p-4 mb-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Pickup Location</p>
                <p>{item.pickupLocation}</p>
                <p className="text-sm text-gray-500">{item.dorm}</p>
              </div>
            </div>
          </Card>

          {/* Owner Info */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <img 
                src={item.owner.avatar} 
                alt={item.owner.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <p>{item.owner.name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{item.owner.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">·</span>
                  <span className="text-sm text-gray-500">{item.owner.totalLends} items lent</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Availability Section */}
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Check Availability
          </h2>
          
          <Card className="p-4 mb-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0"
              disabled={(date) => date < new Date()}
            />
          </Card>

          {selectedDate && (
            <div>
              <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Available time slots for {selectedDate.toLocaleDateString()}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availableTimes.map((time, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="justify-start"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            className="w-full"
            size="lg"
            onClick={onBorrow}
          >
            Request to Borrow
          </Button>
        </div>
      </div>
    </div>
  );
}
