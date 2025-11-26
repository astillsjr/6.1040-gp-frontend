import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { currentUser, mockBadges, dormLeaderboard } from '../data/mockData';
import { ArrowLeft, Trophy, Award, TrendingUp, Leaf, Star } from 'lucide-react';

interface DashboardScreenProps {
  onBack: () => void;
}

export function DashboardScreen({ onBack }: DashboardScreenProps) {
  const nextMilestone = 1500;
  const progressToNext = (currentUser.points / nextMilestone) * 100;
  const wasteSaved = 47.3; // lbs

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
          <h1 className="text-gray-900">My Dashboard</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User Profile */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-gray-900">{currentUser.name}</h2>
              <p className="text-gray-600">{currentUser.dorm}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{currentUser.rating} rating</span>
                </div>
                <span className="text-sm text-gray-500">·</span>
                <span className="text-sm text-gray-600">{currentUser.totalLends} items shared</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl text-green-600">{currentUser.points}</div>
              <p className="text-sm text-gray-600">points</p>
            </div>
          </div>
        </Card>

        {/* Points Progress */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2>Points Progress</h2>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Current: {currentUser.points} pts</span>
              <span className="text-gray-600">Next Milestone: {nextMilestone} pts</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
          <p className="text-sm text-gray-600">
            {nextMilestone - currentUser.points} points until you unlock exclusive perks!
          </p>
        </Card>

        {/* Impact Stats */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-6 h-6 text-green-600" />
            <h2 className="text-gray-900">Environmental Impact</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl text-green-700">{wasteSaved}</div>
              <p className="text-sm text-gray-700">lbs of waste saved</p>
            </div>
            <div>
              <div className="text-3xl text-blue-700">32</div>
              <p className="text-sm text-gray-700">items reused</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/60 rounded-lg">
            <p className="text-sm text-gray-700">
              🌍 That's equivalent to recycling <strong>156 plastic bottles</strong> or saving <strong>2.1 trees</strong>!
            </p>
          </div>
        </Card>

        {/* Badges */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <h2>Your Badges</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mockBadges.map(badge => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 ${
                  badge.earned
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className={`text-sm mb-1 ${badge.earned ? 'text-gray-900' : 'text-gray-600'}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-gray-600">{badge.description}</p>
                {badge.earned && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Earned
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Dorm Leaderboard */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h2>Dorm Leaderboard</h2>
          </div>
          <div className="space-y-3">
            {dormLeaderboard.map((dorm, index) => {
              const isUserDorm = dorm.dorm === currentUser.dorm;
              return (
                <div
                  key={dorm.dorm}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    isUserDorm ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={isUserDorm ? '' : 'text-gray-900'}>
                      {dorm.dorm}
                      {isUserDorm && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Your Dorm
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{dorm.items} items shared</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600">{dorm.points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-3">
            💡 <strong>Earn more points:</strong> List an item to lend (+50 pts) or refer a friend (+100 pts)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="bg-white">
              List an Item
            </Button>
            <Button variant="outline" className="bg-white">
              Invite Friends
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
