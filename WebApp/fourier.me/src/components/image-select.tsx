import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageIcon } from "@radix-ui/react-icons"
import { Skeleton } from "./ui/skeleton";

import {
  Dialog,
} from "@/components/ui/dialog"

import CropperComponent from "./cropper"

interface ImageSelectorProps {
  getVectors: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, imageURL: File | null, setImageSubmitted: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export default function ImageSelector<Props extends ImageSelectorProps>({ getVectors }: Props) {

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageSubmitted, setImageSubmitted] = useState<boolean>(false);
    const [cropDialogOpen, setCropDialogOpen] = useState<boolean>(false);

    const {toast} = useToast();

    const MIN_DIMENSION = 50;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target && e.target.files) {
        if (e.target.files[0].type.split('/')[0] !== 'image') {
          console.log("Invalid file type");
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: "Please upload an image file",
          })
          return;
        }
        // check for min img dimensions
        const img = new Image();
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = function() {
          if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
            console.log("Image too small");
            toast({
              variant: "destructive",
              title: "Image too small",
              description: `Please upload an image with minimum ${MIN_DIMENSION}px width and height`,
            })
            setImageFile(null);
            setCropDialogOpen(false);
            return;
          } else if(e.target.files)
            setImageFile(e.target.files[0]);
          setCropDialogOpen(true);
          }
      } else {
        console.log("No file selected");
        toast({
          variant: "destructive",
          title: "Invalid Selection",
          description: "No file selected.",
        })
      }
    };

  return (
    <>
    { cropDialogOpen && imageFile && (
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <CropperComponent imgUrl={URL.createObjectURL(imageFile)} setImage={setImageFile} setDialog={setCropDialogOpen}/>
      </Dialog>

    )
    }
    <Card className="w-80 md:w-96
    ">
      {!imageSubmitted ?
      <>
      <CardHeader className="text-center">
        <CardTitle>Upload your image</CardTitle>
        <CardDescription>and see the magic !</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
            <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full h-60 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary-600"
            >
                {imageFile ? (
                    <img
                    src={URL.createObjectURL(imageFile)}
                    alt="uploaded image"
                    // make it fit in the box
                    className="object-contain w-full h-full"
                    />) : 
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                }
                
            </label>
        </div>
        <Input className="mt-5" id="image-upload" type="file" accept="image/*" onChange={handleImageChange} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
            className="w-64 h-14"
            disabled={!imageFile}
            onClick={(e) => { getVectors(e, imageFile, setImageSubmitted) } }
            
        >Submit</Button>
      </CardFooter>
      </>
      :
      <>
        <CardHeader className="text-center">
          <CardTitle>Let him cook!</CardTitle>
          <CardDescription>It may take around 30 seconds</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center mb-8">
          <Skeleton className="w-80 h-80" />
        </CardContent>
      </>
      }
    </Card>
    </>
  )
}
