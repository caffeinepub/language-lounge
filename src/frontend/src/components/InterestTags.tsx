import { Badge } from '@/components/ui/badge';

interface InterestTagsProps {
  interests: string[];
}

export default function InterestTags({ interests }: InterestTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {interests.map((interest) => (
        <Badge key={interest} variant="outline" className="bg-peach/10 border-peach/30">
          {interest}
        </Badge>
      ))}
    </div>
  );
}
