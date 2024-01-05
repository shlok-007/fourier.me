import * as React from "react"
import { ChangeEvent, FC, useState } from 'react';
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

interface ImageSelectorProps {
  getVectors: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, selectedImage: File | null, setImageSubmitted: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export default function ImageSelector<Props extends ImageSelectorProps>({ getVectors }: Props) {

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageSubmitted, setImageSubmitted] = useState<boolean>(false);
    const {toast} = useToast();

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        if (e.target.files[0].type.split('/')[0] !== 'image') {
          console.log("Invalid file type");
          toast({
            title: "Invalid file type",
            description: "Please upload an image file",
          })
          return;
        }
        setSelectedImage(e.target.files[0]);
      }
    };

  return (
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
                {selectedImage ? (
                    <img
                    src={URL.createObjectURL(selectedImage)}
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
            disabled={!selectedImage}
            onClick={(e) => { getVectors(e, selectedImage, setImageSubmitted) } }
            
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
  )
}
