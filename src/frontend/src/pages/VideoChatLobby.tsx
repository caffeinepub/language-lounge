import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Camera } from 'lucide-react';
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

const MOCK_VIDEO_ROOMS: MockRoom[] = [
  { id: 201, name: 'Video Language Exchange', language: 'English', topics: ['Language Learning'], activeSpeakers: 8, totalParticipants: 15, isHot: true },
  { id: 202, name: 'Japanese Video Chat', language: 'Japanese', topics: ['Language Learning', 'Culture'], activeSpeakers: 12, totalParticipants: 20, isHot: true },
  { id: 203, name: 'Gaming Stream Party', language: 'English', topics: ['Gaming', 'Entertainment'], activeSpeakers: 15, totalParticipants: 25, isHot: true },
  { id: 204, name: 'Cooking Show Live', language: 'Spanish', topics: ['Cooking', 'Food'], activeSpeakers: 6, totalParticipants: 12, isHot: false },
  { id: 205, name: 'K-Pop Dance Practice', language: 'Korean', topics: ['Music', 'Entertainment'], activeSpeakers: 10, totalParticipants: 18, isHot: true },
  { id: 206, name: 'Art & Design Showcase', language: 'English', topics: ['Art', 'Design'], activeSpeakers: 5, totalParticipants: 10, isHot: false },
  { id: 207, name: 'Travel Vlog Session', language: 'French', topics: ['Travel', 'Photography'], activeSpeakers: 7, totalParticipants: 14, isHot: false },
];

export default function VideoChatLobby() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [rooms, setRooms] = useState(MOCK_VIDEO_ROOMS);
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-coral/20 via-peach/20 to-terracotta/20 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-coral/10 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-coral/20 backdrop-blur">
              <Camera className="h-8 w-8 text-coral" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-coral via-peach to-terracotta bg-clip-text text-transparent">
              Video Chat Rooms
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join video-enabled conversations for face-to-face interactions, live demonstrations, and immersive cultural exchanges.
          </p>
        </div>
      </div>

      {isAuthenticated && userProfile && <RoomSuggestions userProfile={userProfile} rooms={sortedRooms} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Active Video Rooms</h2>
            <p className="text-sm text-muted-foreground">Video-enabled conversations happening now</p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-gradient-to-r from-coral to-peach hover:from-coral/90 hover:to-peach/90 text-white rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Video Room
            </Button>
          )}
        </div>

        <LanguageFilterTabs selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} languages={LANGUAGES} />

        <TopicFilterBar selectedTopics={selectedTopics} onTopicsChange={setSelectedTopics} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRooms.map((room) => (
            <div key={room.id} className="relative">
              <Badge className="absolute -top-2 -right-2 z-10 bg-coral text-white border-0">
                <Camera className="h-3 w-3 mr-1" />
                Video
              </Badge>
              <RoomCard room={room} onClick={() => navigate({ to: `/room/${room.id}` })} />
            </div>
          ))}
        </div>

        {sortedRooms.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Camera className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No video rooms found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new video room</p>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateRoomModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
}
