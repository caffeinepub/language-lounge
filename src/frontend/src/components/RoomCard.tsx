import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Users, Mic } from 'lucide-react';

interface Room {
  id: number;
  name: string;
  language: string;
  topics: string[];
  activeSpeakers: number;
  totalParticipants: number;
  isHot: boolean;
}

interface RoomCardProps {
  room: Room;
  onClick: () => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-terracotta/50 group"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-terracotta transition-colors">{room.name}</CardTitle>
          {room.isHot && (
            <Badge variant="destructive" className="bg-gradient-to-r from-orange-500 to-red-500 gap-1">
              <Flame className="h-3 w-3" />
              Hot
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-sage/10 border-sage/30">{room.language}</Badge>
          {room.topics.map((topic) => (
            <Badge key={topic} variant="outline" className="bg-peach/10 border-peach/30">
              #{topic}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mic className="h-4 w-4 text-terracotta" />
            <span className="font-medium text-foreground">{room.activeSpeakers}</span>
            <span>speaking</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">{room.totalParticipants}</span>
            <span>total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
