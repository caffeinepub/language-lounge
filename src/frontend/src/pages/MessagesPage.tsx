import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MessageSquare } from 'lucide-react';
import ConversationList from '../components/ConversationList';
import NewConversationModal from '../components/NewConversationModal';

export default function MessagesPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-4">Please login to view messages</p>
          <Button onClick={() => navigate({ to: '/' })}>Go to Live Lobby</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Your conversations and group chats</p>
        </div>
        <Button onClick={() => setIsNewConversationOpen(true)} className="bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="pl-10"
        />
      </div>

      <ConversationList searchQuery={searchQuery} />

      <NewConversationModal open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen} />
    </div>
  );
}
