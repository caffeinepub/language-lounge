import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const INTERESTS = [
  'Resident Evil',
  'Photography',
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
  'Anime',
  'Manga',
  'Hiking',
  'Coffee',
  'Pets',
  'Gardening',
  'DIY',
];

interface InterestSelectorProps {
  value: string[];
  onChange: (interests: string[]) => void;
}

export default function InterestSelector({ value, onChange }: InterestSelectorProps) {
  const toggleInterest = (interest: string) => {
    if (value.includes(interest)) {
      onChange(value.filter((i) => i !== interest));
    } else if (value.length < 10) {
      onChange([...value, interest]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Interests (Select up to 10)</Label>
        <span className="text-sm text-muted-foreground">{value.length}/10</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const isSelected = value.includes(interest);
          const isDisabled = !isSelected && value.length >= 10;
          return (
            <Badge
              key={interest}
              variant={isSelected ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-terracotta to-coral text-white border-transparent'
                  : isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-terracotta hover:scale-105'
              }`}
              onClick={() => !isDisabled && toggleInterest(interest)}
            >
              {interest}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
