import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, X } from 'lucide-react';

interface StrangerWaitingRoomProps {
  onCancel: () => void;
}

export default function StrangerWaitingRoom({ onCancel }: StrangerWaitingRoomProps) {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full border-2 border-terracotta/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-terracotta/20 to-coral/20 flex items-center justify-center">
                <Users className="w-10 h-10 text-terracotta" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-terracotta/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-coral/30 animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-2xl">Searching for a stranger...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-terracotta animate-spin" />
              <p className="text-sm text-muted-foreground">Looking for available users</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-sage/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-sage animate-pulse"></div>
              </div>
              <p className="text-sm text-muted-foreground">Matching based on availability</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-peach/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-peach animate-pulse"></div>
              </div>
              <p className="text-sm text-muted-foreground">Preparing video connection</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <p className="text-sm text-center text-muted-foreground">
              This usually takes a few seconds. We're finding the perfect stranger for you to connect with!
            </p>
          </div>

          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Search
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
