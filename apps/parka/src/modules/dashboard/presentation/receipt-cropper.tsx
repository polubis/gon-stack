import { useEffect, useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/shared/ui/controls';
import { CROPPED_RECEIPT_QUALITY } from '../configuration/constraints';
import { DialogActions } from './detail-dialog';

const cropToFile = (
  image: HTMLImageElement,
  crop: PixelCrop,
  source: File,
): Promise<File> =>
  new Promise((resolve) => {
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(crop.width * scaleX);
    canvas.height = Math.round(crop.height * scaleY);
    const context = canvas.getContext('2d');
    if (!context) return resolve(source);
    context.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    canvas.toBlob(
      (blob) =>
        resolve(
          blob ? new File([blob], 'receipt.jpg', { type: blob.type }) : source,
        ),
      'image/jpeg',
      CROPPED_RECEIPT_QUALITY,
    );
  });

/** Photo preview with a draggable frame; no frame means the whole photo. */
export const ReceiptCropper = ({
  file,
  onConfirm,
  onCancel,
}: {
  file: File;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [crop, setCrop] = useState<Crop>();
  const [completed, setCompleted] = useState<PixelCrop>();

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(String(reader.result));
    reader.readAsDataURL(file);
    return () => {
      reader.onload = null;
    };
  }, [file]);

  const confirm = async () => {
    const image = imageRef.current;
    if (!image || !completed || completed.width === 0) return onConfirm(file);
    onConfirm(await cropToFile(image, completed, file));
  };

  return (
    <div className="space-y-3" data-e2e="dashboard:receipt-cropper">
      <p className="text-sm text-ink-soft">
        Zaznacz paragon na zdjęciu. Bez zaznaczenia użyjemy całego zdjęcia.
      </p>
      <ReactCrop
        crop={crop}
        onChange={(_, percent) => setCrop(percent)}
        onComplete={setCompleted}
        className="max-h-[60dvh] w-full justify-center"
      >
        <img
          ref={imageRef}
          src={previewUrl}
          alt="Podgląd zdjęcia paragonu"
          className="max-h-[60dvh] object-contain"
        />
      </ReactCrop>
      <DialogActions>
        <Button
          variant="ghost"
          className="w-auto"
          data-e2e="dashboard:receipt-crop-cancel"
          onClick={onCancel}
        >
          Anuluj
        </Button>
        <Button
          className="w-auto"
          data-e2e="dashboard:receipt-crop-confirm"
          onClick={confirm}
        >
          Użyj zdjęcia
        </Button>
      </DialogActions>
    </div>
  );
};
