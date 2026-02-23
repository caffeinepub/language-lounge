import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Video, Mic, MicOff, VideoOff, X } from 'lucide-react';
import InRoomChat from './InRoomChat';
import type { Message } from '../backend';

interface VideoCallInterfaceProps {
  roomId: number;
  messages: Message[];
  isChatExpanded: boolean;
  onToggleChat: () => void;
  unreadCount: number;
}

interface MockVideoParticipant {
  id: string;
  name: string;
  languageLevel: string;
  isVideoOn: boolean;
  isMuted: boolean;
}

const MOCK_VIDEO_PARTICIPANTS: MockVideoParticipant[] = [
  { id: '1', name: 'Alice Chen', languageLevel: 'Japanese N2', isVideoOn: true, isMuted: false },
  { id: '2', name: 'Bob Smith', languageLevel: 'Native English', isVideoOn: true, isMuted: false },
  { id: '3', name: 'Carlos Rodriguez', languageLevel: 'Spanish Native', isVideoOn: false, isMuted: false },
  { id: '4', name: 'Diana Park', languageLevel: 'Korean N5', isVideoOn: true, isMuted: true },
  { id: '5', name: 'Emma Wilson', languageLevel: 'French B1', isVideoOn: true, isMuted: false },
  { id: '6', name: 'Frank Zhang', languageLevel: 'Mandarin Native', isVideoOn: true, isMuted: true },
];

export default function VideoCallInterface({ roomId, messages, isChatExpanded, onToggleChat, unreadCount }: VideoCallInterfaceProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`${isChatExpanded ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {MOCK_VIDEO_PARTICIPANTS.map((participant) => (
                <div key={participant.id} className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-terracotta/20 via-sage/20 to-peach/20 border-2 border-border">
                  {participant.isVideoOn ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta/10 to-coral/10">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-coral flex items-center justify-center text-white text-2xl font-bold mb-2 mx-auto">
                          {participant.name.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-foreground">{participant.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <VideoOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">{participant.name}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/80">
                      {participant.languageLevel}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {participant.isMuted ? (
                        <div className="bg-destructive/90 backdrop-blur-sm rounded-full p-1">
                          <MicOff className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="bg-sage/90 backdrop-blur-sm rounded-full p-1">
                          <Mic className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-terracotta/5 to-coral/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" variant="outline" className="rounded-full">
                <Mic className="h-5 w-5 mr-2" />
                Mute
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                <Video className="h-5 w-5 mr-2" />
                Stop Video
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {isChatExpanded ? (
        <div className="lg:col-span-1 relative">
          <InRoomChat roomId={roomId} messages={messages} />
          <Button
            onClick={onToggleChat}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={onToggleChat}
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
    </div>
  );
}
