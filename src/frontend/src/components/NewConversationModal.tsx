import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateRoom } from '../hooks/useQueries';
import { RoomType } from '../backend';
import { useNavigate } from '@tanstack/react-router';

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewConversationModal({ open, onOpenChange }: NewConversationModalProps) {
  const navigate = useNavigate();
  const { mutate: createRoom, isPending } = useCreateRoom();
  const [conversationName, setConversationName] = useState('');
  const [isGroup, setIsGroup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationName) return;

    createRoom(
      {
        name: conversationName,
        roomType: RoomType.privateRoom,
      },
      {
        onSuccess: (roomId) => {
          onOpenChange(false);
          setConversationName('');
          setIsGroup(false);
          navigate({ to: `/chat/${roomId}` });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Start a new direct message or group chat</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="group">Group Chat</Label>
              <p className="text-sm text-muted-foreground">Create a group conversation</p>
            </div>
            <Switch id="group" checked={isGroup} onCheckedChange={setIsGroup} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{isGroup ? 'Group Name' : 'Recipient'} *</Label>
            <Input
              id="name"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              placeholder={isGroup ? 'Enter group name' : 'Search for a user'}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !conversationName} className="flex-1 bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white">
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
