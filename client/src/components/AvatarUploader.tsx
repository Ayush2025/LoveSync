import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, X, Check } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploaderProps {
  onAvatarsUpdated: () => void;
}

export function AvatarUploader({ onAvatarsUpdated }: AvatarUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);

  const girlfriendNames = [
    "Luna", "Aria", "Sophia", "Isabella", "Maya", 
    "Zara", "Raven", "Scarlett", "Violet", "Phoenix"
  ];

  const roleplayNames = [
    { name: "Emma", relationship: "Stepsister" },
    { name: "Victoria", relationship: "Stepmom" },
    { name: "Jessica", relationship: "Sister's Best Friend" },
    { name: "Chloe", relationship: "College Classmate" },
    { name: "Lily", relationship: "Cute Neighbor" }
  ];

  const randomGirlNames = [
    { name: "Alexis", location: "Coffee Shop" },
    { name: "Savannah", location: "Gym" },
    { name: "Melody", location: "Library" },
    { name: "Brooklyn", location: "Bookstore" },
    { name: "Madison", location: "Art Gallery" },
    { name: "Taylor", location: "Park" },
    { name: "Autumn", location: "Wine Bar" },
    { name: "Skye", location: "Beach" },
    { name: "Raven", location: "Nightclub" },
    { name: "Phoenix", location: "Yoga Studio" }
  ];

  const handleImageUpload = async (file: File, girlfriendName: string) => {
    console.log('AvatarUploader - handleImageUpload called:', { fileName: file.name, fileType: file.type, girlfriendName });
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert image to base64 URL for immediate display
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('AvatarUploader - File read successfully for:', girlfriendName);
        const imageUrl = e.target?.result as string;
        setUploadedImages(prev => ({
          ...prev,
          [girlfriendName]: imageUrl
        }));
        
        // Store in localStorage for persistence - check character type
        const isRoleplay = roleplayNames.some(rp => rp.name === girlfriendName);
        const isRandomGirl = randomGirlNames.some(rg => rg.name === girlfriendName);
        
        let storageKey = `avatar_${girlfriendName}`;
        if (isRoleplay) storageKey = `roleplay_avatar_${girlfriendName}`;
        if (isRandomGirl) storageKey = `random_girl_avatar_${girlfriendName}`;
        
        console.log('AvatarUploader - Storing with key:', storageKey);
        localStorage.setItem(storageKey, imageUrl);
        
        toast.success(`${girlfriendName}'s avatar updated successfully!`);
        onAvatarsUpdated();
      };
      reader.onerror = () => {
        console.error('AvatarUploader - FileReader error');
        toast.error("Failed to read image file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('AvatarUploader - Error uploading image:', error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  const removeAvatar = (girlfriendName: string) => {
    setUploadedImages(prev => {
      const updated = { ...prev };
      delete updated[girlfriendName];
      return updated;
    });
    // Remove from appropriate storage location
    const isRoleplay = roleplayNames.some(rp => rp.name === girlfriendName);
    const isRandomGirl = randomGirlNames.some(rg => rg.name === girlfriendName);
    
    let storageKey = `avatar_${girlfriendName}`;
    if (isRoleplay) storageKey = `roleplay_avatar_${girlfriendName}`;
    if (isRandomGirl) storageKey = `random_girl_avatar_${girlfriendName}`;
    
    localStorage.removeItem(storageKey);
    toast.success(`${girlfriendName}'s avatar removed`);
    onAvatarsUpdated();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Custom Avatar Manager
        </CardTitle>
        <CardDescription>
          Upload your own bold and sexy images for each AI girlfriend. Recommended: High-quality photos with attractive women in fashionable outfits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Girlfriends Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">AI Girlfriends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {girlfriendNames.map((name) => (
            <div key={name} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">{name}</Label>
                {uploadedImages[name] && (
                  <Badge variant="secondary" className="text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Custom
                  </Badge>
                )}
              </div>
              
              {uploadedImages[name] ? (
                <div className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                    <img 
                      src={uploadedImages[name]} 
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => removeAvatar(name)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      console.log('AvatarUploader - File input changed for:', name);
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('AvatarUploader - File selected:', file.name);
                        handleImageUpload(file, name);
                      } else {
                        console.log('AvatarUploader - No file selected');
                      }
                    }}
                    className="hidden"
                    id={`upload-${name}`}
                    disabled={isUploading}
                  />
                  <Label
                    htmlFor={`upload-${name}`}
                    className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center">
                      Upload bold & sexy image for {name}
                    </span>
                  </Label>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>

        {/* Roleplay Characters Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Roleplay Characters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleplayNames.map(({ name, relationship }) => (
              <div key={name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{name}</Label>
                    <p className="text-xs text-muted-foreground">{relationship}</p>
                  </div>
                  {uploadedImages[name] && (
                    <Badge variant="secondary" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Custom
                    </Badge>
                  )}
                </div>
                
                {uploadedImages[name] ? (
                  <div className="relative">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                      <img 
                        src={uploadedImages[name]} 
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeAvatar(name)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, name);
                      }}
                      className="hidden"
                      id={`upload-roleplay-${name}`}
                      disabled={isUploading}
                    />
                    <Label
                      htmlFor={`upload-roleplay-${name}`}
                      className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center">
                        Upload bold image for {name}
                      </span>
                    </Label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Random Girls Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Random Encounter Girls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {randomGirlNames.map(({ name, location }) => (
              <div key={name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{name}</Label>
                    <p className="text-xs text-muted-foreground">{location}</p>
                  </div>
                  {uploadedImages[name] && (
                    <Badge variant="secondary" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Custom
                    </Badge>
                  )}
                </div>
                
                {uploadedImages[name] ? (
                  <div className="relative">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20">
                      <img 
                        src={uploadedImages[name]} 
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeAvatar(name)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, name);
                      }}
                      className="hidden"
                      id={`upload-random-${name}`}
                      disabled={isUploading}
                    />
                    <Label
                      htmlFor={`upload-random-${name}`}
                      className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground text-center">
                        Upload bold image for {name}
                      </span>
                    </Label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Tips for Best Results:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use high-resolution images (at least 512x512px)</li>
            <li>• Choose photos with attractive women in fashionable/bold outfits</li>
            <li>• Ensure good lighting and clear facial features</li>
            <li>• Portrait or full-body shots work best</li>
            <li>• Images will be cropped to square format automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}