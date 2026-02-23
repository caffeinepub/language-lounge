import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useJoinStrangerQueue, usePairWithStranger, useRemoveFromStrangerQueue, useGetStrangerRoomMessages, useGetUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Globe, Sparkles } from 'lucide-react';
import StrangerWaitingRoom from '../components/StrangerWaitingRoom';
import VideoCallInterface from '../components/VideoCallInterface';
import { Principal } from '@dfinity/principal';

type MatchingState = 'idle' | 'searching' | 'matched';

export default function StrangerVideoCall() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const joinQueue = useJoinStrangerQueue();
  const pairWithStranger = usePairWithStranger();
  const removeFromQueue = useRemoveFromStrangerQueue();

  const [matchingState, setMatchingState] = useState<MatchingState>('idle');
  const [matchedRoomId, setMatchedRoomId] = useState<number | null>(null);
  const [matchedStrangerId, setMatchedStrangerId] = useState<string | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const { data: strangerProfile } = useGetUserProfile(matchedStrangerId || '');
  const { data: messages = [] } = useGetStrangerRoomMessages(matchedRoomId || 0);

  const isAuthenticated = !!identity;

  // Polling for stranger match
  useEffect(() => {
    if (matchingState !== 'searching') return;

    const pollInterval = setInterval(async () => {
      try {
        const roomId = await pairWithStranger.mutateAsync();
        if (roomId !== null && roomId !== undefined) {
          setMatchedRoomId(roomId);
          setMatchingState('matched');
          // Note: In a real implementation, we'd get the stranger's principal from the backend
          // For now, we'll use a mock principal
          setMatchedStrangerId('2vxsx-fae'); // Mock stranger ID
        }
      } catch (error: any) {
        // If no match yet, continue polling
        if (!error.message?.includes('No available strangers')) {
          console.error('Pairing error:', error);
        }
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [matchingState, pairWithStranger]);

  const handleStartVideoCall = async () => {
    try {
      await joinQueue.mutateAsync();
      setMatchingState('searching');
    } catch (error) {
      console.error('Failed to join queue:', error);
    }
  };

  const handleCancelSearch = async () => {
    try {
      await removeFromQueue.mutateAsync();
      setMatchingState('idle');
    } catch (error) {
      console.error('Failed to cancel search:', error);
    }
  };

  const handleEndCall = async () => {
    setMatchingState('idle');
    setMatchedRoomId(null);
    setMatchedStrangerId(null);
    setIsChatExpanded(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access stranger video calling</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You need to be logged in to connect with strangers for video calls.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (matchingState === 'searching') {
    return <StrangerWaitingRoom onCancel={handleCancelSearch} />;
  }

  if (matchingState === 'matched' && matchedRoomId !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Video Call with Stranger</h1>
            <p className="text-sm text-muted-foreground">
              Connected with {strangerProfile?.name || 'a stranger'}
            </p>
          </div>
          <Button
            onClick={handleEndCall}
            variant="destructive"
            className="rounded-full"
          >
            End Call & Find New Stranger
          </Button>
        </div>
        <VideoCallInterface
          roomId={matchedRoomId}
          messages={messages}
          isChatExpanded={isChatExpanded}
          onToggleChat={() => setIsChatExpanded(!isChatExpanded)}
          unreadCount={0}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-terracotta/20 to-coral/20 mb-4">
          <Video className="w-10 h-10 text-terracotta" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-terracotta via-coral to-peach bg-clip-text text-transparent">
          Stranger Video Calling
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with random people from around the world for live video conversations. 
          Practice languages, make new friends, and explore different cultures!
        </p>
      </div>

      {userProfile && (
        <Card className="border-2 border-terracotta/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-terracotta" />
              Your Profile
            </CardTitle>
            <CardDescription>This is what strangers will see about you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Name</p>
              <p className="text-lg">{userProfile.name}</p>
            </div>
            {userProfile.proficiencyLevels.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Language Levels</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.proficiencyLevels.map((level, index) => (
                    <Badge key={index} variant="secondary" className="bg-sage/20 text-sage">
                      {level.language} - {level.level}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {userProfile.interests.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.slice(0, 5).map((interest, index) => (
                    <Badge key={index} variant="outline" className="border-peach/40 text-peach">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-terracotta/5 via-coral/5 to-peach/5 border-2 border-terracotta/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coral" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-terracotta text-white font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Click "Start Video Call"</p>
              <p className="text-sm text-muted-foreground">Join the waiting queue to be matched with a stranger</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-coral text-white font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Wait for a match</p>
              <p className="text-sm text-muted-foreground">We'll connect you with someone who's also looking to chat</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-peach text-white font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Start your conversation</p>
              <p className="text-sm text-muted-foreground">Use video, audio, and text chat to communicate</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sage text-white font-bold text-sm flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-medium">End and find new strangers</p>
              <p className="text-sm text-muted-foreground">When you're ready, end the call and search for someone new</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleStartVideoCall}
          disabled={joinQueue.isPending}
          size="lg"
          className="bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {joinQueue.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Joining Queue...
            </>
          ) : (
            <>
              <Globe className="w-5 h-5 mr-2" />
              Start Video Call
            </>
          )}
        </Button>
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Safety Tip:</strong> Be respectful and kind to everyone you meet. 
            If you encounter inappropriate behavior, you can end the call immediately and report the user.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
