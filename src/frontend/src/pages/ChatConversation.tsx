import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetRoomMessages, useSendMessage } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Users } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatConversation() {
  const { roomId } = useParams({ from: '/chat/$roomId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: messages = [], isLoading } = useGetRoomMessages(Number(roomId));
  const { mutate: sendMessage, isPending } = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isPending) return;

    sendMessage(
      { roomId: Number(roomId), content: messageText },
      {
        onSuccess: () => {
          setMessageText('');
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-muted-foreground mb-4">Please login to view conversations</p>
          <Button onClick={() => navigate({ to: '/' })}>Go to Live Lobby</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/messages' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Messages
        </Button>
        <Button variant="outline" size="icon" className="rounded-full">
          <Users className="h-4 w-4" />
        </Button>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <ChatMessage
                    key={idx}
                    message={message}
                    isCurrentUser={message.sender.toString() === identity?.getPrincipal().toString()}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              disabled={isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={!messageText.trim() || isPending} size="icon" className="bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
