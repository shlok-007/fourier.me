"use client"

import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/ui/toggle-mode"
import {io, Socket} from 'socket.io-client'
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

import ImageSelector from "@/components/image-select"
import Epicycles from "@/components/epicycle-canvas"


let socketConn : Socket;

const dummyVectorData = [
  [
      2.8875,
      0.0964,
      -0.9501,
      2.7267
  ],
  [
      1.1773,
      0.1927,
      -0.9725,
      0.6635
  ],
  [
      1.0462,
      -0.2891,
      -0.9195,
      -0.499
  ],
  [
      0.7828,
      0.3855,
      -0.757,
      -0.1994
  ],
  [
      0.6526,
      -0.1927,
      0.5159,
      0.3997
  ],
  [
      0.5445,
      -0.0964,
      -0.466,
      -0.2818
  ],
  [
      0.4321,
      -0.3855,
      -0.2952,
      -0.3155
  ],
  [
      0.3463,
      -0.4818,
      0.0383,
      0.3442
  ],
  [
      0.3268,
      -0.5782,
      0.2182,
      -0.2433
  ],
  [
      0.2292,
      0.2891,
      0.1456,
      -0.1769
  ],
  [
      0.1791,
      0.7709,
      -0.0286,
      0.1768
  ],
  [
      0.1661,
      0,
      -0.0604,
      0.1547
  ],
  [
      0.146,
      -0.9637,
      -0.0584,
      0.1339
  ],
  [
      0.1445,
      0.8673,
      -0.0765,
      0.1226
  ],
  [
      0.1033,
      0.5782,
      -0.0303,
      0.0988
  ],
  [
      0.099,
      -0.6746,
      0.096,
      0.0242
  ],
  [
      0.0988,
      0.9637,
      0.0384,
      -0.091
  ],
  [
      0.0881,
      -1.2528,
      -0.0819,
      -0.0324
  ],
  [
      0.0831,
      0.4818,
      0.0461,
      0.0692
  ],
  [
      0.0594,
      -0.8673,
      0.0593,
      -0.0042
  ],
  [
      0.0588,
      0.6746,
      -0.01,
      -0.058
  ],
  [
      0.0546,
      1.4455,
      -0.0474,
      -0.027
  ],
  [
      0.0516,
      -1.5419,
      0.0125,
      -0.0501
  ],
  [
      0.0501,
      1.2528,
      0.0389,
      0.0315
  ],
  [
      0.0454,
      1.6383,
      0.0347,
      -0.0293
  ],
  [
      0.0357,
      1.1564,
      0.0301,
      -0.0193
  ],
  [
      0.0345,
      1.06,
      -0.0167,
      -0.0302
  ],
  [
      0.0316,
      -1.831,
      0.0224,
      0.0222
  ],
  [
      0.0264,
      2.2165,
      -0.0221,
      0.0146
  ],
  [
      0.0261,
      -1.7346,
      -0.0194,
      -0.0175
  ],
  [
      0.0258,
      -1.6383,
      0.0112,
      0.0233
  ],
  [
      0.0253,
      -1.3492,
      0.0189,
      0.0168
  ],
  [
      0.0251,
      -1.4455,
      -0.0251,
      -0.0004
  ],
  [
      0.0249,
      1.9274,
      -0.0207,
      -0.0138
  ],
  [
      0.0216,
      -1.06,
      0.0123,
      0.0178
  ],
  [
      0.0212,
      -1.1564,
      0.0093,
      0.019
  ],
  [
      0.0207,
      3.1801,
      0.008,
      0.0191
  ],
  [
      0.0206,
      -2.5056,
      0.0186,
      -0.0089
  ],
  [
      0.0203,
      2.5056,
      0.0141,
      0.0146
  ],
  [
      0.0199,
      2.3128,
      0.0137,
      -0.0144
  ],
  [
      0.0197,
      2.4092,
      -0.0191,
      -0.0047
  ],
  [
      0.0193,
      -2.1201,
      -0.0159,
      0.0109
  ],
  [
      0.0187,
      2.9874,
      0.0172,
      -0.0071
  ],
  [
      0.0186,
      -2.0237,
      0.008,
      -0.0168
  ],
  [
      0.0184,
      1.3492,
      -0.0166,
      0.0079
  ],
  [
      0.018,
      4.0475,
      -0.0174,
      0.0048
  ],
  [
      0.0176,
      2.6983,
      -0.0067,
      0.0162
  ],
  [
      0.0171,
      2.1201,
      -0.0015,
      -0.017
  ],
  [
      0.0171,
      -2.2165,
      -0.0144,
      -0.0092
  ],
  [
      0.0163,
      2.7947,
      0.0059,
      -0.0152
  ],
  [
      0.0161,
      3.2765,
      0.0006,
      -0.0161
  ],
  [
      0.0154,
      -1.9274,
      -0.0034,
      0.015
  ],
  [
      0.0146,
      1.5419,
      -0.0145,
      -0.0016
  ],
  [
      0.0139,
      3.8547,
      -0.0046,
      0.0131
  ],
  [
      0.0139,
      3.4692,
      0.0131,
      -0.0048
  ],
  [
      0.0133,
      -2.891,
      -0.0099,
      0.0089
  ],
  [
      0.0123,
      -2.7947,
      0.0075,
      0.0098
  ],
  [
      0.0121,
      -5.3966,
      0.0073,
      0.0096
  ],
  [
      0.0118,
      -2.6983,
      -0.0082,
      -0.0085
  ],
  [
      0.0117,
      4.3366,
      0.0016,
      0.0116
  ],
  [
      0.0117,
      -3.0838,
      0.0056,
      0.0103
  ],
  [
      0.0117,
      -5.7821,
      -0.0039,
      -0.011
  ],
  [
      0.0116,
      5.0111,
      -0.0003,
      0.0116
  ],
  [
      0.0116,
      3.5656,
      -0.0084,
      -0.008
  ],
  [
      0.0114,
      3.662,
      0.0105,
      0.0042
  ],
  [
      0.0114,
      -3.1801,
      -0.0063,
      -0.0095
  ],
  [
      0.0114,
      -5.1075,
      0.0057,
      -0.0099
  ],
  [
      0.0112,
      -4.6257,
      -0.0037,
      -0.0106
  ],
  [
      0.0107,
      -3.5656,
      0.0015,
      0.0106
  ],
  [
      0.0107,
      -4.9148,
      0.0107,
      -0.0002
  ],
  [
      0.0107,
      -5.6857,
      -0.008,
      0.0071
  ],
  [
      0.0103,
      -2.6019,
      0.0033,
      0.0098
  ],
  [
      0.0102,
      7.324,
      -0.0018,
      -0.01
  ],
  [
      0.0102,
      4.1438,
      0.0072,
      0.0072
  ],
  [
      0.0102,
      3.7583,
      -0.0032,
      -0.0097
  ],
  [
      0.0102,
      -4.2402,
      0.0074,
      0.007
  ],
  [
      0.0101,
      4.722,
      -0.0091,
      -0.0042
  ],
  [
      0.01,
      4.9148,
      0.0059,
      -0.0081
  ],
  [
      0.01,
      -2.3128,
      0.006,
      0.008
  ]
]

export default function Home() {

  const [lineartPreview, setLineartPreview] = useState<string | undefined>(undefined);
  const [vectorData, setVectorData] = useState<number[][] | null>(null);
  const {toast} = useToast();
  const router = useRouter();

  useEffect(() => {
    socketInitializer();

    return () => {
      socketConn.disconnect();
    };
  }, []);

  function socketInitializer() {
    socketConn = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/fourierify`)

    socketConn.on('connect', () => {
      console.log('Connected to server');
    });

    socketConn.on('lineart', (url: string) => {
      setLineartPreview(url);
    });
  
    socketConn.on('vectorData', (data: number[][]) => {
      setVectorData(data);
      console.log("vectorData fetched", data);
    });
  }

  function getVectors( e: React.MouseEvent<HTMLButtonElement, MouseEvent>, file: File | null) {
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
      <div className="mt-10">
        <ImageSelector getVectors={getVectors} />
        
        {lineartPreview && (
        <div className="mt-10">
          <Card className="w-80 md:w-96">
            <img src={lineartPreview} alt="lineart" className="w-full h-full object-contain" />
          </Card>
        </div>
        )}

        {vectorData && <Epicycles vector_data={vectorData}/>}
      </div>
      
    </main>
    </>
  )
}
