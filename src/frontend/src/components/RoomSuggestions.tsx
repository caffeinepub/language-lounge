import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import RoomCard from './RoomCard';
import type { UserProfile } from '../backend';
import { useNavigate } from '@tanstack/react-router';

interface Room {
  id: number;
  name: string;
  language: string;
  topics: string[];
  activeSpeakers: number;
  totalParticipants: number;
  isHot: boolean;
}

interface RoomSuggestionsProps {
  userProfile: UserProfile;
  rooms: Room[];
}

export default function RoomSuggestions({ userProfile, rooms }: RoomSuggestionsProps) {
  const navigate = useNavigate();

  const suggestedRooms = rooms
    .filter((room) => {
      const matchesInterests = room.topics.some((topic) => userProfile.interests.includes(topic));
      const matchesLanguage = room.language === userProfile.primaryLanguage || userProfile.proficiencyLevels.some((l) => l.language === room.language);
      return matchesInterests || matchesLanguage;
    })
    .slice(0, 3);

  if (suggestedRooms.length === 0) return null;

  return (
    <Card className="border-2 border-terracotta/20 bg-gradient-to-br from-terracotta/5 to-coral/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-terracotta" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedRooms.map((room) => (
            <RoomCard key={room.id} room={room} onClick={() => navigate({ to: `/room/${room.id}` })} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
