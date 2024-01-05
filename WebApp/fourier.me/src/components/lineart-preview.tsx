import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

const LineartPreview : React.FC<{imgUrl: string}> = ({imgUrl}) => {
    return (
        <Card className="w-80 md:w-96 flex flex-col items-center justify-center">
            <CardHeader className="text-center">
                <CardTitle>Let him cook!</CardTitle>
                <CardDescription>It may take around 30 seconds</CardDescription>
            </CardHeader>
            <CardContent className="w-full h-96 flex items-center justify-center">
                <img 
                src={imgUrl}
                // src="https://images.pexels.com/photos/15484104/pexels-photo-15484104/free-photo-of-snow-istanbul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="lineart" 
                className="object-contain w-full h-full animate-pulse" 
                />
            </CardContent>
        </Card>
    )
}

export default LineartPreview;