import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Plane,
  User as UserIcon,
  Calendar,
  Users
} from 'lucide-react';
import LanguageLevelBadge from '../components/LanguageLevelBadge';
import InterestTags from '../components/InterestTags';
import ReportBlockMenu from '../components/ReportBlockMenu';

export default function UserProfile() {
  const { userId } = useParams({ from: '/profile/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: viewedProfile, isLoading } = useGetUserProfile(userId);
  const { data: currentUserProfile } = useGetCallerUserProfile();

  const isOwnProfile = identity?.getPrincipal().toString() === userId;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!viewedProfile) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => navigate({ to: '/' })}>Go to Live Lobby</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {isOwnProfile && (
          <Button variant="outline" onClick={() => navigate({ to: '/setup' })} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-terracotta/20">
                {viewedProfile.profilePicture ? (
                  <AvatarImage 
                    src={viewedProfile.profilePicture.getDirectURL()} 
                    alt={viewedProfile.name}
                  />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-terracotta to-coral text-white text-2xl">
                  {getInitials(viewedProfile.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl mb-2">{viewedProfile.name}</CardTitle>
                <p className="text-muted-foreground">Primary Language: {viewedProfile.primaryLanguage}</p>
              </div>
            </div>
            {!isOwnProfile && <ReportBlockMenu targetUserId={userId} targetName={viewedProfile.name} />}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* About Section */}
          {viewedProfile.selfIntroduction && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-terracotta" />
                  About
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {viewedProfile.selfIntroduction}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Personal Information Section */}
          {(viewedProfile.age || viewedProfile.gender || viewedProfile.relationshipStatus || 
            viewedProfile.location || viewedProfile.education || viewedProfile.occupation) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-terracotta" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewedProfile.age && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-coral" />
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium">{Number(viewedProfile.age)}</p>
                      </div>
                    </div>
                  )}
                  {viewedProfile.gender && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-coral" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="font-medium">{viewedProfile.gender}</p>
                      </div>
                    </div>
                  )}
                  {viewedProfile.relationshipStatus && (
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-coral" />
                      <div>
                        <p className="text-sm text-muted-foreground">Relationship Status</p>
                        <p className="font-medium">{viewedProfile.relationshipStatus}</p>
                      </div>
                    </div>
                  )}
                  {viewedProfile.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-coral" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{viewedProfile.location}</p>
                      </div>
                    </div>
                  )}
                  {viewedProfile.education && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-coral" />
                      <div>
                        <p className="text-sm text-muted-foreground">Education</p>
                        <p className="font-medium">{viewedProfile.education}</p>
                      </div>
                    </div>
                  )}
                  {viewedProfile.occupation && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-coral" />
                      <div>
                        <p className="text-sm text-muted-foreground">Occupation</p>
                        <p className="font-medium">{viewedProfile.occupation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Language Proficiency Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Language Proficiency</h3>
            <div className="flex flex-wrap gap-2">
              {viewedProfile.proficiencyLevels.length > 0 ? (
                viewedProfile.proficiencyLevels.map((level, idx) => (
                  <LanguageLevelBadge key={idx} language={level.language} level={level.level} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No language proficiency levels added</p>
              )}
            </div>
          </div>

          {/* Interests & Preferences Section */}
          {(viewedProfile.hobbies || viewedProfile.likes || viewedProfile.dislikes || 
            viewedProfile.interests.length > 0) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interests & Preferences</h3>
                
                {viewedProfile.hobbies && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Hobbies</p>
                    <p className="text-foreground">{viewedProfile.hobbies}</p>
                  </div>
                )}

                {viewedProfile.likes && (
                  <div className="flex items-start gap-3">
                    <ThumbsUp className="h-5 w-5 text-sage mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Likes</p>
                      <p className="text-foreground">{viewedProfile.likes}</p>
                    </div>
                  </div>
                )}

                {viewedProfile.dislikes && (
                  <div className="flex items-start gap-3">
                    <ThumbsDown className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Dislikes</p>
                      <p className="text-foreground">{viewedProfile.dislikes}</p>
                    </div>
                  </div>
                )}

                {viewedProfile.interests.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Interest Tags</p>
                    <InterestTags interests={viewedProfile.interests} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Travel & Exploration Section */}
          {viewedProfile.favoriteTravelDestinations && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Plane className="h-5 w-5 text-terracotta" />
                  Travel & Exploration
                </h3>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Favorite Travel Destinations
                  </p>
                  <p className="text-foreground">{viewedProfile.favoriteTravelDestinations}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
