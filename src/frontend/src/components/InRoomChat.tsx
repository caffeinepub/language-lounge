import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import { useSendMessage } from '../hooks/useQueries';
import ChatMessage from './ChatMessage';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Message } from '../backend';

interface InRoomChatProps {
  roomId: number;
  messages: Message[];
}

export default function InRoomChat({ roomId, messages }: InRoomChatProps) {
  const { identity } = useInternetIdentity();
  const { mutate: sendMessage, isPending } = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, idx) => (
                <ChatMessage
                  key={idx}
                  message={message}
                  isCurrentUser={message.sender.toString() === identity?.getPrincipal().toString()}
                  enableTranslation
                />
              ))
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2">
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
  );
}
