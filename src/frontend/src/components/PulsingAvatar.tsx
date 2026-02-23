import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff } from 'lucide-react';

interface PulsingAvatarProps {
  name: string;
  isActive: boolean;
  isMuted: boolean;
}

export default function PulsingAvatar({ name, isActive, isMuted }: PulsingAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      <div
        className={`relative ${
          isActive ? 'animate-pulse-ring' : ''
        }`}
      >
        {isActive && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-terracotta to-coral opacity-50 blur-md animate-pulse" />
        )}
        <Avatar className={`h-16 w-16 relative z-10 ${isActive ? 'ring-4 ring-terracotta/50' : 'border-2 border-border'}`}>
          <AvatarFallback className="bg-gradient-to-br from-sage to-peach text-white">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border-2 border-background">
        {isMuted ? (
          <MicOff className="h-3 w-3 text-muted-foreground" />
        ) : (
          <Mic className="h-3 w-3 text-terracotta" />
        )}
      </div>
    </div>
  );
}
