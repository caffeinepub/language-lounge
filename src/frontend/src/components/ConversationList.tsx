import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 1, name: 'Alice Chen', lastMessage: 'See you in the gaming room!', timestamp: '2m ago', unreadCount: 2, isGroup: false },
  { id: 2, name: 'Travel Enthusiasts', lastMessage: 'Bob: Anyone been to Japan?', timestamp: '15m ago', unreadCount: 5, isGroup: true },
  { id: 3, name: 'Carlos Rodriguez', lastMessage: 'Thanks for the language tips', timestamp: '1h ago', unreadCount: 0, isGroup: false },
];

interface ConversationListProps {
  searchQuery: string;
}

export default function ConversationList({ searchQuery }: ConversationListProps) {
  const navigate = useNavigate();

  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (filteredConversations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No conversations found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {filteredConversations.map((conversation) => (
        <Card
          key={conversation.id}
          onClick={() => navigate({ to: `/chat/${conversation.id}` })}
          className="cursor-pointer transition-all hover:shadow-md hover:border-terracotta/50"
        >
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-sage to-peach text-white">
                {getInitials(conversation.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold truncate">{conversation.name}</h3>
                <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
            </div>
            {conversation.unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-terracotta to-coral text-white">
                {conversation.unreadCount}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
