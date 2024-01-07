"use client"

import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/ui/toggle-mode"
import {io, Socket} from 'socket.io-client'
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

import ImageSelector from "@/components/image-select"
import Epicycles from "@/components/epicycle-canvas"
import LineartPreview from "@/components/lineart-preview"

// import dummyVectorData from "@/components/dummy-vector-data"

let socketConn : Socket;

export default function Home() {

  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [lineartPreview, setLineartPreview] = useState<string | undefined>(undefined);
  const [vectorData, setVectorData] = useState<number[][] | undefined>(undefined);
  const {toast} = useToast();

  useEffect(() => {
    if (socketConnected) return;
        socketInitializer();

    return () => {
      socketConn.disconnect();
    };
  }, []);

  function socketInitializer() {
    socketConn = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/fourierify`);
    setSocketConnected(true);

    socketConn.on('connect', () => {
      console.log('Connected to server');
    });

    socketConn.on('lineart', (url: string) => {
        console.log('lineart fetched', url);
      setLineartPreview(url);
    });
  
    socketConn.on('vectorData', (data: number[][]) => {
      setLineartPreview(undefined);
      setVectorData(data);
      console.log("vectorData fetched", data);
    });
  }

  function getVectors( e: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: File | null, setImageSubmitted: React.Dispatch<React.SetStateAction<boolean>>){
    e.preventDefault();

    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event: ProgressEvent<FileReader>) {
      if(!event.target || !socketConn){
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request. Try reloading the page.",
          action: <ToastAction altText="Reload" onClick={()=> window.location.reload()}>Reload</ToastAction>,
        })
        return;
      }
      try{
        socketConn.emit('imageUpload', event.target.result);
        
        toast({
          title: "Image uploaded!",
          description: "Your image has been uploaded. Please wait while we process it.",
        })
        console.log('image emitted');
        setImageSubmitted(true);
        return;
      } catch (err) {
        console.log(err);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your image",
          // action: <ToastAction altText="Reload" onClick={()=> window.location.reload()}>Reload</ToastAction>,
        })
        return;
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
    <nav className="text-right mt-5 mr-5">
        <ModeToggle />
    </nav>
    <main className="flex flex-col items-center justify-center m-0">
      <h1
        className="text-6xl md:text-8xl font-bold text-center mt-15"
      >
        fourier.me
      </h1>
      <h2
        className="text-xl md:text-3xl text-muted-foreground text-center mt-5 px-10"
      >
        generate Fourier Epicycle Animations from your own images!
      </h2>
      <div className="mt-10">
        {!lineartPreview && !vectorData && 
          <ImageSelector getVectors={getVectors} />}
        
        {lineartPreview && !vectorData && (
          <LineartPreview imgUrl={lineartPreview} />
        )}

        {!lineartPreview && vectorData && (
            <>
            <Epicycles vector_data={vectorData} setVectorData={setVectorData}/>
            {/* <Epicycles vector_data={dummyVectorData} setVectorData={setVectorData}/> */}
            </>
        )}
        
      </div>
      
    </main>
    </>
  )
}
