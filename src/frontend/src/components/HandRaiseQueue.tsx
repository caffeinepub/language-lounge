import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Hand, Check, X } from 'lucide-react';

interface HandRaiseQueueProps {
  requests: string[];
  onApprove: (name: string) => void;
  onDeny: (name: string) => void;
}

export default function HandRaiseQueue({ requests, onApprove, onDeny }: HandRaiseQueueProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-2 border-terracotta/30 bg-terracotta/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hand className="h-5 w-5 text-terracotta" />
          Hand Raise Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((name) => (
            <div key={name} className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-sage to-peach text-white text-sm">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => onApprove(name)} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Check className="h-4 w-4" />
                </Button>
                <Button onClick={() => onDeny(name)} size="sm" variant="destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
