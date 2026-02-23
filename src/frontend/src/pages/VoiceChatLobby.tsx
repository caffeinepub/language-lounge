import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Mic } from 'lucide-react';
import LanguageFilterTabs from '../components/LanguageFilterTabs';
import TopicFilterBar from '../components/TopicFilterBar';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';
import RoomSuggestions from '../components/RoomSuggestions';

const LANGUAGES = ['All', 'English', 'Japanese', 'Bengali', 'Spanish', 'French', 'German', 'Korean', 'Mandarin'];

interface MockRoom {
  id: number;
  name: string;
  language: string;
  topics: string[];
  activeSpeakers: number;
  totalParticipants: number;
  isHot: boolean;
}

const MOCK_VOICE_ROOMS: MockRoom[] = [
  { id: 101, name: 'Voice Practice English', language: 'English', topics: ['Language Learning'], activeSpeakers: 6, totalParticipants: 12, isHot: false },
  { id: 102, name: 'Japanese Conversation', language: 'Japanese', topics: ['Language Learning', 'Culture'], activeSpeakers: 10, totalParticipants: 18, isHot: true },
  { id: 103, name: 'Spanish Speaking Club', language: 'Spanish', topics: ['Language Learning'], activeSpeakers: 4, totalParticipants: 9, isHot: false },
  { id: 104, name: 'Tech Discussion Voice', language: 'English', topics: ['Technology', 'Programming'], activeSpeakers: 8, totalParticipants: 14, isHot: true },
  { id: 105, name: 'Music Talk', language: 'Korean', topics: ['Music', 'Entertainment'], activeSpeakers: 5, totalParticipants: 11, isHot: false },
  { id: 106, name: 'French Pronunciation', language: 'French', topics: ['Language Learning'], activeSpeakers: 3, totalParticipants: 7, isHot: false },
];

export default function VoiceChatLobby() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [rooms, setRooms] = useState(MOCK_VOICE_ROOMS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prevRooms) => {
        const updated = [...prevRooms].map((room) => ({
          ...room,
          activeSpeakers: Math.max(1, room.activeSpeakers + Math.floor(Math.random() * 3) - 1),
        }));
        return updated.sort((a, b) => b.activeSpeakers - a.activeSpeakers).map((room, idx) => ({
          ...room,
          isHot: idx < 2 && room.activeSpeakers > 7,
        }));
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredRooms = rooms
    .filter((room) => selectedLanguage === 'All' || room.language === selectedLanguage)
    .filter((room) => selectedTopics.length === 0 || room.topics.some((topic) => selectedTopics.includes(topic)));

  const sortedRooms = [...filteredRooms].sort((a, b) => b.activeSpeakers - a.activeSpeakers);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sage/20 via-terracotta/20 to-coral/20 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-sage/20 backdrop-blur">
              <Mic className="h-8 w-8 text-sage" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sage via-terracotta to-coral bg-clip-text text-transparent">
              Voice Chat Rooms
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join voice-only conversations to practice languages, discuss topics, and connect with others through audio.
          </p>
        </div>
      </div>

      {isAuthenticated && userProfile && <RoomSuggestions userProfile={userProfile} rooms={sortedRooms} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Active Voice Rooms</h2>
            <p className="text-sm text-muted-foreground">Voice-only conversations happening now</p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-sage to-terracotta hover:from-sage/90 hover:to-terracotta/90 text-white rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Voice Room
            </Button>
          )}
        </div>

        <LanguageFilterTabs selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} languages={LANGUAGES} />

        <TopicFilterBar selectedTopics={selectedTopics} onTopicsChange={setSelectedTopics} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRooms.map((room) => (
            <div key={room.id} className="relative">
              <Badge className="absolute -top-2 -right-2 z-10 bg-sage text-white border-0">
                <Mic className="h-3 w-3 mr-1" />
                Voice
              </Badge>
              <RoomCard room={room} onClick={() => navigate({ to: `/room/${room.id}` })} />
            </div>
          ))}
        </div>

        {sortedRooms.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mic className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No voice rooms found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new voice room</p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateRoomModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
