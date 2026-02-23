import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';
import PulsingAvatar from './PulsingAvatar';

interface Speaker {
  id: string;
  name: string;
  languageLevel: string;
  isSpeaking: boolean;
  isMuted: boolean;
}

interface SpeakerSectionProps {
  speakers: Speaker[];
}

export default function SpeakerSection({ speakers }: SpeakerSectionProps) {
  return (
    <Card className="border-2 border-terracotta/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-terracotta" />
          Speakers ({speakers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="flex flex-col items-center gap-2">
              <PulsingAvatar name={speaker.name} isActive={speaker.isSpeaking} isMuted={speaker.isMuted} />
              <div className="text-center">
                <p className="text-sm font-medium truncate w-full">{speaker.name}</p>
                <p className="text-xs text-muted-foreground">{speaker.languageLevel}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
