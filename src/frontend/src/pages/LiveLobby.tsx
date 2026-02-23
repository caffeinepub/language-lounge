import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Flame, Users, MessageSquare } from 'lucide-react';
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

const MOCK_ROOMS: MockRoom[] = [
  { id: 1, name: 'Gaming Lounge', language: 'English', topics: ['Gaming', 'Technology'], activeSpeakers: 8, totalParticipants: 15, isHot: true },
  { id: 2, name: 'Travel Stories', language: 'Spanish', topics: ['Travel', 'Photography'], activeSpeakers: 5, totalParticipants: 12, isHot: false },
  { id: 3, name: 'Japanese Practice', language: 'Japanese', topics: ['Language Learning', 'Anime'], activeSpeakers: 12, totalParticipants: 20, isHot: true },
  { id: 4, name: 'Skincare Tips', language: 'English', topics: ['Skincare', 'Fashion'], activeSpeakers: 3, totalParticipants: 8, isHot: false },
  { id: 5, name: 'Cooking Together', language: 'French', topics: ['Cooking', 'Food'], activeSpeakers: 6, totalParticipants: 10, isHot: false },
  { id: 6, name: 'K-Pop Fans', language: 'Korean', topics: ['Music', 'Entertainment'], activeSpeakers: 15, totalParticipants: 25, isHot: true },
  { id: 7, name: 'Tech Talk', language: 'English', topics: ['Technology', 'Programming'], activeSpeakers: 7, totalParticipants: 14, isHot: false },
  { id: 8, name: 'Bengali Culture', language: 'Bengali', topics: ['Culture', 'Art'], activeSpeakers: 4, totalParticipants: 9, isHot: false },
];

export default function LiveLobby() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [rooms, setRooms] = useState(MOCK_ROOMS);
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
          isHot: idx < 3 && room.activeSpeakers > 7,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-terracotta/20 via-sage/20 to-peach/20 p-8 md:p-12">
        <img
          src="/assets/generated/hero-banner.dim_1200x600.png"
          alt="Global Connect"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-terracotta via-coral to-peach bg-clip-text text-transparent">
            Welcome to Global Connect
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6">
            Connect with people worldwide through voice, video, and text. Practice languages, share interests, and build meaningful connections.
          </p>
          {!isAuthenticated && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              Login to create rooms and join conversations
            </Badge>
          )}
        </div>
      </div>

      {isAuthenticated && userProfile && <RoomSuggestions userProfile={userProfile} rooms={sortedRooms} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Live Rooms</h2>
            <p className="text-sm text-muted-foreground">Discover active conversations happening now</p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          )}
        </div>

        <LanguageFilterTabs selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} languages={LANGUAGES} />

        <TopicFilterBar selectedTopics={selectedTopics} onTopicsChange={setSelectedTopics} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRooms.map((room) => (
            <RoomCard key={room.id} room={room} onClick={() => navigate({ to: `/room/${room.id}` })} />
          ))}
        </div>

        {sortedRooms.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No rooms found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new room</p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateRoomModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
