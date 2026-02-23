import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Gift } from 'lucide-react';
import { useSendMessage, useGetRoomGiftHistory } from '../hooks/useQueries';
import ChatMessage from './ChatMessage';
import GiftMessage from './GiftMessage';
import GiftPickerModal from './GiftPickerModal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Message } from '../backend';

interface Participant {
  id: string;
  name: string;
}

interface InRoomChatProps {
  roomId: number;
  messages: Message[];
  participants?: Participant[];
}

export default function InRoomChat({ roomId, messages, participants = [] }: InRoomChatProps) {
  const { identity } = useInternetIdentity();
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { data: giftHistory = [] } = useGetRoomGiftHistory(roomId);
  const [messageText, setMessageText] = useState('');
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const combinedTimeline = useMemo(() => {
    const messageItems = messages.map((msg) => ({
      type: 'message' as const,
      timestamp: Number(msg.timestamp),
      data: msg,
    }));

    const giftItems = giftHistory.map((gift) => ({
      type: 'gift' as const,
      timestamp: Number(gift.timestamp),
      data: gift,
    }));

    return [...messageItems, ...giftItems].sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, giftHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [combinedTimeline]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isPending) return;

    sendMessage(
      { roomId, content: messageText },
      {
        onSuccess: () => {
          setMessageText('');
          inputRef.current?.focus();
        },
      }
    );
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Room Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-3">
              {combinedTimeline.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                combinedTimeline.map((item, idx) => {
                  if (item.type === 'message') {
                    return (
                      <ChatMessage
                        key={`msg-${idx}`}
                        message={item.data}
                        isCurrentUser={item.data.sender.toString() === identity?.getPrincipal().toString()}
                        enableTranslation
                      />
                    );
                  } else {
                    return <GiftMessage key={`gift-${idx}`} transaction={item.data} />;
                  }
                })
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsGiftModalOpen(true)}
              className="shrink-0 rounded-full border-terracotta/30 hover:bg-terracotta/10"
              title="Send a gift"
            >
              <Gift className="h-4 w-4 text-terracotta" />
            </Button>
            <Input
              ref={inputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              placeholder="Type a message..."
              disabled={isPending}
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" disabled={!messageText.trim() || isPending} size="icon" className="bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white rounded-full shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <GiftPickerModal
        open={isGiftModalOpen}
        onOpenChange={setIsGiftModalOpen}
        roomId={roomId}
        participants={participants}
      />
    </>
  );
}
