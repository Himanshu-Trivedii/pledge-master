import React, { useState } from 'react';
import { Card } from './ui/card';

interface PhotoUploadProps {
  onPhotoCapture: (photoData: string) => void;
  label: string;
  value?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoCapture, label, value }) => {
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');

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
            <button onClick={clearPhoto} type="button" style={{ color: 'red' }}>Clear</button>
          )}
        </div>
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="w-full h-48 object-cover rounded-lg" />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ width: '100%' }}
            capture="environment"
          />
        )}
      </div>
    </Card>
  );
};

export default PhotoUpload;
