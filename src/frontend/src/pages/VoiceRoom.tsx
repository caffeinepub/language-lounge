import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetRoomMessages } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Bookmark, Users, MessageSquare, Video, X } from 'lucide-react';
import SpeakerSection from '../components/SpeakerSection';
import ListenerSection from '../components/ListenerSection';
import InRoomChat from '../components/InRoomChat';
import HandRaiseQueue from '../components/HandRaiseQueue';
import RoomSettingsModal from '../components/RoomSettingsModal';
import VideoCallInterface from '../components/VideoCallInterface';

interface MockParticipant {
  id: string;
  name: string;
  languageLevel: string;
  isSpeaking: boolean;
  isMuted: boolean;
}

const MOCK_SPEAKERS: MockParticipant[] = [
  { id: '1', name: 'Alice Chen', languageLevel: 'Japanese N2', isSpeaking: true, isMuted: false },
  { id: '2', name: 'Bob Smith', languageLevel: 'Native English', isSpeaking: false, isMuted: false },
  { id: '3', name: 'Carlos Rodriguez', languageLevel: 'Spanish Native', isSpeaking: false, isMuted: false },
];

const MOCK_LISTENERS: MockParticipant[] = [
  { id: '4', name: 'Diana Park', languageLevel: 'Korean N5', isSpeaking: false, isMuted: true },
  { id: '5', name: 'Emma Wilson', languageLevel: 'French B1', isSpeaking: false, isMuted: true },
  { id: '6', name: 'Frank Zhang', languageLevel: 'Mandarin Native', isSpeaking: false, isMuted: true },
  { id: '7', name: 'Grace Lee', languageLevel: 'Japanese N4', isSpeaking: false, isMuted: true },
];

export default function VoiceRoom() {
  const { roomId } = useParams({ from: '/room/$roomId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: messages = [] } = useGetRoomMessages(Number(roomId));
  const [speakers, setSpeakers] = useState(MOCK_SPEAKERS);
  const [listeners, setListeners] = useState(MOCK_LISTENERS);
  const [isHost, setIsHost] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [handRaiseRequests, setHandRaiseRequests] = useState<string[]>([]);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0);

  const isAuthenticated = !!identity;
  const unreadCount = Math.max(0, messages.length - lastReadMessageCount);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeakers((prev) =>
        prev.map((speaker, idx) => ({
          ...speaker,
          isSpeaking: Math.random() > 0.7 && idx === 0,
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isChatExpanded) {
      setLastReadMessageCount(messages.length);
    }
  }, [isChatExpanded, messages.length]);

  const handleRaiseHand = () => {
    if (userProfile) {
      setHandRaiseRequests((prev) => [...prev, userProfile.name]);
    }
  };

  const handleApproveRequest = (name: string) => {
    setHandRaiseRequests((prev) => prev.filter((n) => n !== name));
    const listener = listeners.find((l) => l.name === name);
    if (listener) {
      setListeners((prev) => prev.filter((l) => l.name !== name));
      setSpeakers((prev) => [...prev, { ...listener, isMuted: false }]);
    }
  };

  const handleDenyRequest = (name: string) => {
    setHandRaiseRequests((prev) => prev.filter((n) => n !== name));
  };

  const toggleChat = () => {
    setIsChatExpanded((prev) => !prev);
  };

  const toggleVideoMode = () => {
    setIsVideoMode((prev) => !prev);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-muted-foreground mb-4">Please login to join voice rooms</p>
          <Button onClick={() => navigate({ to: '/' })}>Go to Live Lobby</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Lobby
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant={isVideoMode ? 'default' : 'outline'}
            size="icon"
            onClick={toggleVideoMode}
            className="rounded-full"
            title={isVideoMode ? 'Switch to Voice Only' : 'Switch to Video Mode'}
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <Bookmark className="h-4 w-4" />
          </Button>
          {isHost && (
            <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta/10 via-sage/10 to-peach/10 p-8"
        style={{
          backgroundImage: 'url(/assets/generated/voice-room-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gaming Lounge</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-background/80 backdrop-blur">English</Badge>
                <Badge variant="outline" className="bg-background/80 backdrop-blur">#Gaming</Badge>
                <Badge variant="outline" className="bg-background/80 backdrop-blur">#Technology</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2">
              <Users className="h-4 w-4 text-terracotta" />
              <span className="font-medium">{speakers.length + listeners.length}</span>
            </div>
          </div>
        </div>
      </div>

      {isHost && handRaiseRequests.length > 0 && (
        <HandRaiseQueue requests={handRaiseRequests} onApprove={handleApproveRequest} onDeny={handleDenyRequest} />
      )}

      <div className="relative">
        {isVideoMode ? (
          <VideoCallInterface roomId={Number(roomId)} messages={messages} isChatExpanded={isChatExpanded} onToggleChat={toggleChat} unreadCount={unreadCount} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SpeakerSection speakers={speakers} />
              <ListenerSection listeners={listeners} onRaiseHand={handleRaiseHand} isListener={true} />
            </div>

            <div className="lg:col-span-1 relative">
              {isChatExpanded ? (
                <InRoomChat roomId={Number(roomId)} messages={messages} />
              ) : (
                <div className="fixed bottom-6 right-6 z-50">
                  <Button
                    onClick={toggleChat}
                    size="lg"
                    className="rounded-full shadow-lg bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white h-14 w-14 relative"
                  >
                    <MessageSquare className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              )}
              {isChatExpanded && (
                <Button
                  onClick={toggleChat}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <RoomSettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} roomId={Number(roomId)} />
    </div>
  );
}
