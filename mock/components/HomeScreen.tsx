import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ItemCard } from './ItemCard';
import { mockItems } from '../data/mockData';
import { Item } from '../types';
import { Search, SlidersHorizontal } from 'lucide-react';

interface HomeScreenProps {
  onItemClick: (item: Item) => void;
}

export function HomeScreen({ onItemClick }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDorm, setSelectedDorm] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', 'Tools', 'Electronics', 'Professional Attire', 'Craft Materials', 'Photography'];
  const dorms = ['All Dorms', 'Simmons Hall', 'Next House', 'MacGregor House', 'Burton-Conner', 'New House'];

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesDorm = selectedDorm === 'all' || item.dorm === selectedDorm;
    return matchesSearch && matchesCategory && matchesDorm;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-gray-900">BorrowMIT</h1>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              1,250 pts
            </Badge>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full mb-3"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Dorm</label>
                <Select value={selectedDorm} onValueChange={setSelectedDorm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dorm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dorms</SelectItem>
                    {dorms.slice(1).map(dorm => (
                      <SelectItem key={dorm} value={dorm}>{dorm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Quick Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['All', 'Tools', 'Electronics', 'Attire', 'Craft'].map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat.toLowerCase() || (cat === 'All' && selectedCategory === 'all') ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(cat === 'All' ? 'all' : cat === 'Attire' ? 'Professional Attire' : cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {filteredItems.length} items available
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => onItemClick(item)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found matching your search.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDorm('all');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
