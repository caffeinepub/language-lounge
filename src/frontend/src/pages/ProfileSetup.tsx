import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProficiencySelector from '../components/ProficiencySelector';
import InterestSelector from '../components/InterestSelector';
import { Camera, Loader2 } from 'lucide-react';
import type { UserProfile, ProficiencyLevel } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

const LANGUAGES = ['English', 'Japanese', 'Bengali', 'Spanish', 'French', 'German', 'Korean', 'Mandarin', 'Hindi', 'Arabic'];

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Custom'];

const RELATIONSHIP_OPTIONS = ['Single', 'In a relationship', 'Married', "It's complicated", 'Prefer not to say'];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  
  // Basic Info
  const [name, setName] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [customGender, setCustomGender] = useState('');
  
  // Profile Picture
  const [profilePicture, setProfilePicture] = useState<ExternalBlob | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // About You
  const [selfIntroduction, setSelfIntroduction] = useState('');
  const [hobbies, setHobbies] = useState('');
  
  // Personal Details
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  
  // Interests
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  
  // Travel
  const [favoriteTravelDestinations, setFavoriteTravelDestinations] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Please upload a PNG or JPEG image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      setProfilePicture(blob);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
      
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !primaryLanguage) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate age if provided
    if (age) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        toast.error('Age must be between 13 and 120');
        return;
      }
    }

    const finalGender = gender === 'Custom' ? customGender : gender;

    const profile: UserProfile = {
      name,
      primaryLanguage,
      proficiencyLevels,
      interests,
      profilePicture: profilePicture || undefined,
      selfIntroduction,
      likes,
      dislikes,
      hobbies,
      favoriteTravelDestinations,
      location,
      education,
      occupation,
      age: age ? BigInt(parseInt(age)) : undefined,
      gender: finalGender,
      relationshipStatus,
    };

    saveProfile(profile, {
      onSuccess: () => {
        navigate({ to: '/' });
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Global Connect!</CardTitle>
          <CardDescription>Let's set up your profile to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-terracotta">Basic Info</h3>
              
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border-4 border-terracotta/20"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-terracotta to-coral flex items-center justify-center">
                        <Camera className="h-10 w-10 text-white" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <span className="text-white text-sm font-medium">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG or JPEG, max 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="13"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {gender === 'Custom' && (
                  <Input
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    placeholder="Please specify"
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            {/* About You Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-terracotta">About You</h3>
              
              <div className="space-y-2">
                <Label htmlFor="selfIntroduction">
                  Self Introduction
                  <span className="text-xs text-muted-foreground ml-2">
                    ({selfIntroduction.length}/500)
                  </span>
                </Label>
                <Textarea
                  id="selfIntroduction"
                  value={selfIntroduction}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setSelfIntroduction(e.target.value);
                    }
                  }}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies">
                  Hobbies
                  <span className="text-xs text-muted-foreground ml-2">
                    ({hobbies.length}/200)
                  </span>
                </Label>
                <Input
                  id="hobbies"
                  value={hobbies}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setHobbies(e.target.value);
                    }
                  }}
                  placeholder="Reading, hiking, photography..."
                />
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-terracotta">Personal Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location
                  <span className="text-xs text-muted-foreground ml-2">
                    ({location.length}/100)
                  </span>
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      setLocation(e.target.value);
                    }
                  }}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">
                  Education
                  <span className="text-xs text-muted-foreground ml-2">
                    ({education.length}/150)
                  </span>
                </Label>
                <Input
                  id="education"
                  value={education}
                  onChange={(e) => {
                    if (e.target.value.length <= 150) {
                      setEducation(e.target.value);
                    }
                  }}
                  placeholder="Computer Science at MIT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">
                  Occupation
                  <span className="text-xs text-muted-foreground ml-2">
                    ({occupation.length}/100)
                  </span>
                </Label>
                <Input
                  id="occupation"
                  value={occupation}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      setOccupation(e.target.value);
                    }
                  }}
                  placeholder="Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipStatus">Relationship Status</Label>
                <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your relationship status" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interests Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-terracotta">Interests & Preferences</h3>
              
              <div className="space-y-2">
                <Label htmlFor="likes">
                  Likes
                  <span className="text-xs text-muted-foreground ml-2">
                    ({likes.length}/200)
                  </span>
                </Label>
                <Input
                  id="likes"
                  value={likes}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setLikes(e.target.value);
                    }
                  }}
                  placeholder="What do you enjoy?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dislikes">
                  Dislikes
                  <span className="text-xs text-muted-foreground ml-2">
                    ({dislikes.length}/200)
                  </span>
                </Label>
                <Input
                  id="dislikes"
                  value={dislikes}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setDislikes(e.target.value);
                    }
                  }}
                  placeholder="What do you avoid?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryLanguage">Primary Language *</Label>
                <Select value={primaryLanguage} onValueChange={setPrimaryLanguage} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary language" />
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

              <ProficiencySelector value={proficiencyLevels} onChange={setProficiencyLevels} />

              <InterestSelector value={interests} onChange={setInterests} />
            </div>

            {/* Travel Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-terracotta">Travel & Exploration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="favoriteTravelDestinations">
                  Favorite Travel Destinations
                  <span className="text-xs text-muted-foreground ml-2">
                    ({favoriteTravelDestinations.length}/200)
                  </span>
                </Label>
                <Input
                  id="favoriteTravelDestinations"
                  value={favoriteTravelDestinations}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setFavoriteTravelDestinations(e.target.value);
                    }
                  }}
                  placeholder="Tokyo, Paris, New York..."
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending || !name || !primaryLanguage || isUploading} 
              className="w-full bg-gradient-to-r from-terracotta to-coral hover:from-terracotta/90 hover:to-coral/90 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
