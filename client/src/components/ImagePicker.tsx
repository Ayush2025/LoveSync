import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

// Import your provided local images - NEW BATCH 2025
import img1 from "@assets/1_1753173971094.jpg";
import img2 from "@assets/2_1753173971094.jpg";
import img3 from "@assets/3_1753173971094.jpg";
import img4 from "@assets/4_1753173971093.jpg";
import img5 from "@assets/5_1753173971093.jpg";
import img6 from "@assets/6_1753173971093.jpg";

interface ImagePickerProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage: string;
  trigger?: React.ReactNode;
}

export function ImagePicker({ onImageSelect, currentImage, trigger }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    if (imageUrl || previewUrl) {
      onImageSelect(previewUrl || imageUrl);
      setIsOpen(false);
      setImageUrl("");
      setPreviewUrl("");
      toast.success("Image updated successfully!");
    } else {
      toast.error("Please select an image first");
    }
  };

  const predefinedImages = [
    img1, img2, img3, img4, img5, img6
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Change Image
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Image Preview */}
          <div className="text-center">
            <img
              src={previewUrl || currentImage}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg mx-auto border"
            />
          </div>

          {/* Predefined Images */}
          <div>
            <Label className="text-sm font-medium">Choose from collection:</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {predefinedImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => handleUrlChange(img)}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                >
                  <img
                    src={img}
                    alt={`Option ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div>
            <Label htmlFor="imageUrl">Or paste image URL:</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="mt-2"
            />
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="fileUpload">Or upload image:</Label>
            <div className="mt-2">
              <Input
                id="fileUpload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}