"use client"

import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/ui/toggle-mode"
import ImageSelector from "@/components/image-select"
import {io, Socket} from 'socket.io-client'


let socketConn : Socket;

export default function ButtonSecondary() {

  const [lineartImage, setLineartImage] = useState<File | null>(null);
  const [vectorData, setVectorData] = useState<JSON | null>(null);

  useEffect(() => {
    socketInitializer();

    return () => {
      socketConn.disconnect();
    };
  }, []);

  function socketInitializer() {
    socketConn = io('http://localhost:5787/fourierify')

    socketConn.on('connect', () => {
      console.log('Connected to server');
    });
  
    socketConn.on('lineart', (data: any) => {
      console.log("lineart", data);
      setLineartImage(data);
    });
  
    socketConn.on('vectorData', (data: any) => {
      console.log("vectorData", data);
      setVectorData(data);
    });
  }

  function getVectors( e: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: File | null) {
    e.preventDefault();

    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event: any) {
        socketConn.emit('imageUpload', event.target.result);
        console.log('image emitted');
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
    <nav className="text-right mt-5 mr-5"
    >
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
      <div className="flex justify-center mt-10">
          <ImageSelector getVectors={getVectors} />
      </div>
      {/* <div>
        {lineartImage && <img src={URL.createObjectURL(lineartImage)} alt="lineart" />}
      </div> */}
    </main>
    </>
  )
}
