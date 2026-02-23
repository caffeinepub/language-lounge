import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message } from '../backend';
import TranslatableWord from './TranslatableWord';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  enableTranslation?: boolean;
}

export default function ChatMessage({ message, isCurrentUser, enableTranslation = false }: ChatMessageProps) {
  const getInitials = (principal: string) => {
    return principal.slice(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const words = message.content.split(' ');

  return (
    <div className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isCurrentUser ? 'bg-gradient-to-br from-terracotta to-coral text-white' : 'bg-muted'}>
          {getInitials(message.sender.toString())}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col gap-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2 ${isCurrentUser ? 'bg-gradient-to-r from-terracotta to-coral text-white' : 'bg-muted'}`}>
          <p className="text-sm break-words">
            {enableTranslation ? (
              words.map((word, idx) => (
                <span key={idx}>
                  <TranslatableWord word={word} />
                  {idx < words.length - 1 && ' '}
                </span>
              ))
            ) : (
              message.content
            )}
          </p>
        </div>
        <span className="text-xs text-muted-foreground px-2">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
