import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useCreateRoom } from '../hooks/useQueries';
import { RoomType } from '../backend';

const LANGUAGES = ['English', 'Japanese', 'Bengali', 'Spanish', 'French', 'German', 'Korean', 'Mandarin'];
const TOPICS = ['Gaming', 'Travel', 'Skincare', 'Food', 'Music', 'Sports', 'Art', 'Technology', 'Fashion', 'Movies', 'Books', 'Fitness', 'Cooking'];

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const navigate = useNavigate();
  const { mutate: createRoom, isPending } = useCreateRoom();
  const [roomName, setRoomName] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else if (selectedTopics.length < 3) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName || !language) return;

    createRoom(
      {
        name: roomName,
        roomType: isPrivate ? RoomType.privateRoom : RoomType.publicRoom,
      },
      {
        onSuccess: (roomId) => {
          onOpenChange(false);
          setRoomName('');
          setLanguage('');
          setSelectedTopics([]);
          setIsPrivate(false);
          navigate({ to: `/room/${roomId}` });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a New Room</DialogTitle>
          <DialogDescription>Set up your room and start connecting with people worldwide</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name *</Label>
            <Input id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g., Gaming Lounge" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Select value={language} onValueChange={setLanguage} required>
              <SelectTrigger>
                <SelectValue placeholder="Select room language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Topics (Select up to 3)</Label>
              <span className="text-sm text-muted-foreground">{selectedTopics.length}/3</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                const isDisabled = !isSelected && selectedTopics.length >= 3;
                return (
                  <Badge
                    key={topic}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-terracotta to-coral text-white border-transparent'
                        : isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-terracotta'
                    }`}
                    onClick={() => !isDisabled && toggleTopic(topic)}
                  >
                    #{topic}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="private">Private Room</Label>
              <p className="text-sm text-muted-foreground">Only invited users can join</p>
            </div>
            <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !roomName || !language} className="flex-1 bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white">
              {isPending ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
