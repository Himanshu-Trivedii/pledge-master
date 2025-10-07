import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Camera, Upload } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void;
  label: string;
}

const CustomerPhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, label }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
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

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium">{label}</label>
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
      ) : (
        <Button onClick={startCamera} variant="outline" className="w-full">
          <Camera className="w-4 h-4 mr-2" />
          Open Camera
        </Button>
      )}
    </div>
  );
};

export default CustomerPhotoCapture;
