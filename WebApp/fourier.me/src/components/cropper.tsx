import React, { useState, useRef } from "react";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

import ReactCrop, { Crop, makeAspectCrop, centerCrop, convertToPixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface CropperProps {
  imgUrl: string;
  setImage: React.Dispatch<React.SetStateAction<File | null>>;
  setDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const CropperComponent: React.FC<CropperProps> = ({imgUrl, setImage, setDialog}) => {

    const [crop, setCrop] = useState<Crop>()
    const MIN_DIMENSION = 50;

    const onImageLoad = (e : React.SyntheticEvent<HTMLImageElement, Event>) => {
        const { width, height } = e.currentTarget;
        // const cropWidthInPercent = (MIN_DIMENSION / width) * 100;
        const cropWidthInPercent = 90;
        const crop = makeAspectCrop(
          {
            unit: "%",
            width: cropWidthInPercent,
          },
          1,
          width,
          height
        );
        const centeredCrop = centerCrop(crop, width, height);
        setCrop(centeredCrop);
    };

    const imgRef = useRef<HTMLImageElement>(null);

    const getCroppedImg = async ( image: HTMLImageElement, crop: Crop) => {
      const canvas = document.createElement('canvas');

      const pixelRatio = window.devicePixelRatio;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("No 2d context");
      }

      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";
      ctx.save();

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      ctx.translate(-cropX, -cropY);
    
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
      );

      ctx.restore();

      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          setImage(blob as File);
          setDialog(false);
          console.log("Image cropped successfully!");
          resolve(blob);
        }, 'image/jpeg');
      });
    }

    return (
      <DialogContent className="w-80 md:w-96">
        <DialogHeader>
          <DialogTitle>Crop your Image</DialogTitle>
          <DialogDescription>
            It works better few subjects and a clear background.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 text-center">
            <ReactCrop
              crop={crop}
              onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
              keepSelection
              minWidth={MIN_DIMENSION}
              minHeight={MIN_DIMENSION}
            >
                <img
                ref={imgRef}
                src={imgUrl}
                alt="uploaded image"
                className="object-contain w-full h-full" 
                onLoad={onImageLoad}
                />
            </ReactCrop>
        </div>

        <DialogFooter className='sm:justify-center'>
          <Button
          onClick={async (e) => {
            e.preventDefault();
            if (imgRef.current && crop) {
              await getCroppedImg(imgRef.current, convertToPixelCrop(
                crop,
                imgRef.current.width,
                imgRef.current.height
              ));
            }
          }}
          >Save changes</Button>
        </DialogFooter>
      </DialogContent>
    )
}

export default CropperComponent;