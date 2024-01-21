"use client"

import { useEffect, useState, useRef } from "react"
import { ModeToggle } from "@/components/ui/toggle-mode"
import {io, Socket} from 'socket.io-client'
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

import ImageSelector from "@/components/image-select"
import Epicycles from "@/components/epicycle-canvas"
import LineartPreview from "@/components/lineart-preview"
import Footer from "@/components/footer"

import generateClientId from "@/lib/generateClientID"

// import dummyVectorData from "../lib/dummyVectorData"


export default function Home() {
  const [socketConn, setSocketConn] = useState<Socket>();

  const [clientID, setClientID] = useState<number | undefined>(undefined);
  const [lineartPreview, setLineartPreview] = useState<string | undefined>(undefined);
  const [vectorData, setVectorData] = useState<number[][] | undefined>(undefined);
  const {toast} = useToast();

  useEffect(()=>{
    if(!clientID){
      setClientID(generateClientId());
    }
  }, []);

  useEffect(() => {
    if(clientID && !socketConn){
      console.log(clientID);
      socketInitializer();
    }

    return () => {
      if(socketConn)
        socketConn.disconnect();
    };
  }, [clientID, socketConn]);

  function socketInitializer() {

    if(socketConn)  return;

    let conn : Socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/fourierify`,
                    {autoConnect: true, 
                      transports: ['polling']
                    });
    
    setSocketConn(conn);

    conn.on('connect', () => {
      console.log('Connected to server: ', conn.id);
      conn.emit('clientID', clientID);
    });

    conn.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    conn.on('lineart', (data : ArrayBuffer, ack) => {
      // console.log('lineart fetched', data);
      if(vectorData)  return;
      var arrayBufferView = new Uint8Array( data );
      var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL( blob );
      console.log(imageUrl);
      setLineartPreview(imageUrl);
      ack();
      // socketInitializer();
    });
  
    conn.on('vectorData', (data: number[][], ack) => {
      setLineartPreview(undefined);
      setVectorData(data);
      console.log("Total vectors: ", data.length);
      ack();
    });

    conn.on('connect_error', (err) => {
      console.log("connect_error", err.message); // prints the message associated with the error
    });

    conn.on('connect_timeout', (timeout) => {
      console.log("connect_timeout", timeout);
    });

    conn.on('connect_failed', (err) => {
      console.log("connect_failed", err.message);
    });

    conn.on('ping', () => {
      console.log('PING');
      conn.emit('pong');  // respond with a 'pong'
    });
    
  }

  function getVectors( e: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: File | null, setImageSubmitted: React.Dispatch<React.SetStateAction<boolean>>){
    e.preventDefault();
    // socketInitializer();
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
        socketConn.emit('imageUpload', {clientID: clientID, imgData: event.target.result});
        
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

  const epicycleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineartPreview && vectorData && epicycleRef.current) {
        epicycleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [lineartPreview, vectorData]);

  return (
    <>
    <nav className="text-right mt-5 mr-5">
        <ModeToggle />
    </nav>
    <main className="flex flex-col items-center justify-center m-0">
      <h1
        className="text-6xl md:text-8xl font-bold text-center"
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

        {vectorData && (
            <div ref = {epicycleRef}>
            <Epicycles vector_data={vectorData} setVectorData={setVectorData} setLineartPreview={setLineartPreview}/>
            {/* <Epicycles vector_data={dummyVectorData} setVectorData={setVectorData}/> */}
            </div>
        )}
        
      </div>
      <Footer />
      
    </main>
    </>
  )
}
