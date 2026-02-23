import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen } from 'lucide-react';

interface LanguageLevelBadgeProps {
  language: string;
  level: string;
}

export default function LanguageLevelBadge({ language, level }: LanguageLevelBadgeProps) {
  const isNative = level.toLowerCase().includes('native');

  return (
    <Badge variant="outline" className={`gap-2 ${isNative ? 'bg-terracotta/10 border-terracotta/30' : 'bg-sage/10 border-sage/30'}`}>
      {isNative ? <GraduationCap className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
      <span className="font-medium">{language}</span>
      <span className="text-muted-foreground">·</span>
      <span>{level}</span>
    </Badge>
  );
}
