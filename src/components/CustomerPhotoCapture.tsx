import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Camera, Upload } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void;
  label: string;
  value?: string; // base64 data URL for preview
  required?: boolean;
}

const CustomerPhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, label, value, required }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    setError(null);
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(err?.message || 'Unable to access camera. Check permissions.');
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const sourceWidth = videoRef.current.videoWidth;
      const sourceHeight = videoRef.current.videoHeight;

      // Downscale to reduce payload size while keeping aspect ratio
      const maxDimension = 1024; // px
      const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
      const targetWidth = Math.round(sourceWidth * scale);
      const targetHeight = Math.round(sourceHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, targetWidth, targetHeight);
      // Try compressing until the data URL is within ~900KB to satisfy backend @Size
      let quality = 0.7;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      const maxLength = 900_000; // characters
      while (dataUrl.length > maxLength && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      if (dataUrl.length > maxLength) {
        setError('Photo is too large. Try moving the camera back.');
      } else {
        setError(null);
        onPhotoCapture(dataUrl);
      }
      stopCamera();
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result) return;
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1024;
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        let quality = 0.7;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        const maxLength = 900_000;
        while (dataUrl.length > maxLength && quality > 0.4) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length > maxLength) {
          setError('Photo is too large. Try a smaller image.');
        } else {
          setError(null);
          onPhotoCapture(dataUrl);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = () => {
    const activeStream = (videoRef.current?.srcObject as MediaStream) || streamRef.current;
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    streamRef.current = null;
    setIsCapturing(false);
  };

  useEffect(() => {
    // When we enter capturing mode and already have a stream, attach it once the video mounts
    if (isCapturing && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCapturing]);

  useEffect(() => {
    return () => {
      // Ensure camera is stopped on unmount
      const s = (videoRef.current?.srcObject as MediaStream) || streamRef.current;
      if (s) {
        s.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      streamRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium">{label}</label>
      {value && (
        <img src={value} alt={`${label} preview`} className="w-full rounded-lg border border-border" />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {isCapturing ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            <Button type="button" onClick={capturePhoto} variant="secondary">
              Capture
            </Button>
            <Button type="button" onClick={stopCamera} variant="destructive">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button type="button" onClick={startCamera} variant="outline" className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Open Camera
          </Button>
          <label className="w-full">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFileSelected}
            />
            <span className="inline-flex w-full">
              <Button type="button" variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo{required ? ' *' : ''}
              </Button>
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default CustomerPhotoCapture;
