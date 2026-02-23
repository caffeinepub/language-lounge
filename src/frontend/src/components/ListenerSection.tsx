import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Hand } from 'lucide-react';

interface Listener {
  id: string;
  name: string;
  languageLevel: string;
}

interface ListenerSectionProps {
  listeners: Listener[];
  onRaiseHand: () => void;
  isListener: boolean;
}

export default function ListenerSection({ listeners, onRaiseHand, isListener }: ListenerSectionProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Listeners ({listeners.length})
          </CardTitle>
          {isListener && (
            <Button onClick={onRaiseHand} variant="outline" size="sm" className="gap-2 hover:bg-terracotta/10 hover:border-terracotta">
              <Hand className="h-4 w-4" />
              Raise Hand
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {listeners.map((listener) => (
            <div key={listener.id} className="flex flex-col items-center gap-1">
              <Avatar className="h-12 w-12 border border-border">
                <AvatarFallback className="bg-muted text-xs">{getInitials(listener.name)}</AvatarFallback>
              </Avatar>
              <p className="text-xs font-medium truncate w-full text-center">{listener.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
