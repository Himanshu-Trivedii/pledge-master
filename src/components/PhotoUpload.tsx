import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { Card } from './ui/card';

interface PhotoUploadProps {
  onPhotoCapture: (photoData: string) => void;
  label: string;
  value?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoCapture, label, value }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      // Fallback to file upload if camera access fails
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      onPhotoCapture(photoData);
      setPreviewUrl(photoData);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onPhotoCapture(result);
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setPreviewUrl('');
    onPhotoCapture('');
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          {previewUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearPhoto}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isCapturing ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <Button onClick={capturePhoto} variant="secondary">
                Capture
              </Button>
              <Button onClick={stopCamera} variant="destructive">
                Cancel
              </Button>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button onClick={startCamera} variant="outline" className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PhotoUpload;
