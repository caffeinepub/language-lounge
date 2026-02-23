import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const TOPICS = [
  'Gaming',
  'Travel',
  'Skincare',
  'Food',
  'Music',
  'Sports',
  'Art',
  'Technology',
  'Fashion',
  'Movies',
  'Books',
  'Fitness',
  'Cooking',
];

interface TopicFilterBarProps {
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
}

export default function TopicFilterBar({ selectedTopics, onTopicsChange }: TopicFilterBarProps) {
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onTopicsChange(selectedTopics.filter((t) => t !== topic));
    } else {
      onTopicsChange([...selectedTopics, topic]);
    }
  };

  const clearAll = () => {
    onTopicsChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Filter by Topics</h3>
        {selectedTopics.length > 0 && (
          <button onClick={clearAll} className="text-xs text-terracotta hover:text-coral transition-colors flex items-center gap-1">
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => {
          const isSelected = selectedTopics.includes(topic);
          return (
            <Badge
              key={topic}
              variant={isSelected ? 'default' : 'outline'}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isSelected
                  ? 'bg-gradient-to-r from-terracotta to-coral text-white border-transparent'
                  : 'hover:border-terracotta'
              }`}
              onClick={() => toggleTopic(topic)}
            >
              #{topic}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
