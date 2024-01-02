import * as React from "react"
import { ChangeEvent, FC, useState } from 'react';

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

export default function ImageSelector( {getVectors}: {getVectors: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: File | null) => void}) {

    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        // check if the file is an image
        if (e.target.files[0].type.split('/')[0] !== 'image') {
          alert('Please upload an image file');
          return;
        }
        setSelectedImage(e.target.files[0]);
      }
    };

  return (
    <Card className="w-96">
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
            onClick={(e) => { getVectors(e, selectedImage) } }
            
        >Submit</Button>
      </CardFooter>
    </Card>
  )
}
