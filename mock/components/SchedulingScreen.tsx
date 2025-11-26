import { useState } from 'react';
import { Item } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Clock, MapPin, MessageSquare, CheckCircle2 } from 'lucide-react';

interface SchedulingScreenProps {
  item: Item;
  onBack: () => void;
  onConfirm: () => void;
}

export function SchedulingScreen({ item, onBack, onConfirm }: SchedulingScreenProps) {
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [notes, setNotes] = useState('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const meetingPoints = [
    `${item.dorm} - Main Lobby`,
    `${item.dorm} - Front Desk`,
    `${item.dorm} - Courtyard`,
    'Student Center',
    'Infinite Corridor - Lobby 7',
    'Other (specify in notes)'
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const duration = () => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return Math.max(0, end - start);
  };

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
          <h1 className="text-gray-900">Schedule Pickup</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Item Summary */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p>{item.name}</p>
              <p className="text-sm text-gray-600">{item.owner.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                {item.dorm}
              </div>
            </div>
          </div>
        </Card>

        {/* Time Selection */}
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Borrowing Period
          </h2>
          
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Start Time</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">End Time</label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {duration() > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-blue-900">
                  Duration: {duration()} hour{duration() > 1 ? 's' : ''}
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  {formatTime(startTime)} - {formatTime(endTime)} today
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Meeting Point */}
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Meeting Point
          </h2>
          
          <Card className="p-4">
            <Select value={meetingPoint} onValueChange={setMeetingPoint}>
              <SelectTrigger>
                <SelectValue placeholder="Select a meeting point..." />
              </SelectTrigger>
              <SelectContent>
                {meetingPoints.map(point => (
                  <SelectItem key={point} value={point}>
                    {point}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {meetingPoint && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Meeting at: {meetingPoint}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Chat Preview */}
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message to Lender
          </h2>
          
          <Card className="p-4">
            <Textarea
              placeholder="Add any additional notes or questions for the lender..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              You'll be able to chat with {item.owner.name} once the request is confirmed.
            </p>
          </Card>
        </div>

        {/* Summary */}
        <Card className="p-4 bg-gray-50">
          <p className="text-sm mb-2">Request Summary:</p>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• {duration()} hour borrowing period</li>
            <li>• Pickup: {formatTime(startTime)} at {meetingPoint || 'TBD'}</li>
            <li>• Return: {formatTime(endTime)}</li>
            <li>• You'll earn 25 points for responsible borrowing</li>
          </ul>
        </Card>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            className="w-full"
            size="lg"
            onClick={onConfirm}
            disabled={!meetingPoint || duration() <= 0}
          >
            Confirm Request
          </Button>
        </div>
      </div>
    </div>
  );
}
