import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslateText } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface TranslatableWordProps {
  word: string;
}

export default function TranslatableWord({ word }: TranslatableWordProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutate: translate, data: translation, isPending } = useTranslateText();

  const handleClick = () => {
    if (!isOpen && userProfile && !translation) {
      translate({
        text: word,
        sourceLang: 'auto',
        targetLang: userProfile.primaryLanguage,
      });
    }
    setIsOpen(!isOpen);
  };

  const cleanWord = word.replace(/[.,!?;:]$/, '');

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span onClick={handleClick} className="cursor-pointer hover:underline decoration-dotted underline-offset-2">
          {word}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <p className="text-sm font-medium">Translation</p>
          {isPending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Translating...
            </div>
          ) : translation ? (
            <p className="text-sm">{translation}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Click to translate "{cleanWord}"</p>
          )}
          {userProfile && (
            <p className="text-xs text-muted-foreground">To: {userProfile.primaryLanguage}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
