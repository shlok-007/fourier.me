import React, {useRef} from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "./ui/card"
import { Button } from "./ui/button"
import { useToast } from './ui/use-toast';
import { Slider } from './ui/slider';

import dynamic from 'next/dynamic'

import { P5CanvasInstance, P5WrapperProps } from 'react-p5-wrapper';
const ReactP5Wrapper = dynamic(() => import('react-p5-wrapper')
    .then(mod => mod.ReactP5Wrapper as any), {
    ssr: false
}) as unknown as React.NamedExoticComponent<P5WrapperProps>;

interface EpicyclesProps {
    vector_data: number[][];
    setVectorData: React.Dispatch<React.SetStateAction<number[][] | undefined>>;
    setLineartPreview: React.Dispatch<React.SetStateAction<string | undefined>>;
}

interface Vector {
    x: number;
    y: number;
}

const Epicycles: React.FC<EpicyclesProps> = ({ vector_data, setVectorData, setLineartPreview }) => {

    const dt : number = 0.1;
    const inpadding = 5;
    const max_vectors = 200;
    const min_radius = 0.1;
    const credits = "github.com/shlok-007/fourier.me";
    
    var min_freq : number = 999999;
    var path : Vector[] = [];
    var time : number = 0;
    var scalingFactor : number = 1;

    const og_num_vectors = vector_data.length;
    const {toast} = useToast();

    let downloadGif : (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

    const parameters = useRef({
        num_vectors: Math.min(max_vectors, vector_data.length),
        strokeWeight: 2,
        freqScalingFactor: 1.5
    });

    // console.log("num_vectors", parameters.current.num_vectors)
    // console.log("strokeWeight", parameters.current.strokeWeight)
    // console.log("freqScalingFactor", parameters.current.freqScalingFactor)

    const sketch = (p5: P5CanvasInstance) => {
        p5.setup = () => {
            const canvasDiv = document.getElementById('epicycle-canvas');
            if(canvasDiv){
                let canvas = p5.createCanvas(canvasDiv.clientWidth - inpadding, canvasDiv.clientHeight - inpadding);
                // console.log(canvasDiv?.clientWidth, canvasDiv?.clientHeight);
                canvas.parent('epicycle-canvas');
                scalingFactor = canvasDiv.clientWidth / 12;
            }
            
            for (let i = 0; i < vector_data.length; i++){
                if(vector_data[i].length === 4)
                    vector_data[i] = [ vector_data[i][0], vector_data[i][1], p5.atan2( vector_data[i][3], vector_data[i][2] ) ];
                if(Math.abs(vector_data[i][1]) < min_freq && vector_data[i][1]!=0 )
                    min_freq = Math.abs(vector_data[i][1]);
            }
            console.log("min_freq", min_freq);
            p5.textSize(10);
        };

        p5.windowResized = () => {
            const canvasDiv = document.getElementById('epicycle-canvas');
            if(canvasDiv){
                p5.resizeCanvas(canvasDiv.clientWidth - inpadding, canvasDiv.clientHeight - inpadding);
                scalingFactor = canvasDiv.clientWidth / 12;
                console.log(canvasDiv.clientWidth, canvasDiv.clientHeight);
            }
        }

        const arrow = (start: Vector, end : Vector, idx: number) => {
            p5.stroke(255);
            p5.line(start.x, start.y, end.x, end.y);
            p5.vertex(end.x, end.y);
            p5.strokeWeight(1);

            p5.push();
            let side = 12 * vector_data[idx][0] / vector_data[0][0];
            let m = p5.atan2(start.y - end.y, start.x - end.x); // angle of the line
            let offset_x = side * p5.cos(m);
            let offset_y = side * p5.sin(m);
            let m_perp = p5.atan2(start.x - end.x , end.y - start.y); // perpendicular angle
            p5.fill(255);
            p5.triangle((side/2) * p5.cos(m_perp) + end.x + offset_x, (side/2) * p5.sin(m_perp) + end.y + offset_y,
                        -(side/2) * p5.cos(m_perp) + end.x + offset_x, -(side/2) * p5.sin(m_perp) + end.y + offset_y,
                        end.x, end.y
                        );
            p5.pop();
        }

        const epicycles = () => {
            let x = 0;
            let y = 0;
            for (let i = 0; i < parameters.current.num_vectors; i++) {
                let prevx = x;
                let prevy = y;
                let [radius, freq, phase] = vector_data[i];
                radius *= scalingFactor;
                freq *= parameters.current.freqScalingFactor;

                x += radius * p5.cos(freq * time + phase);
                y += radius * p5.sin(freq * time + phase);
                // console.log(radius, freq, phase, x, y);
                p5.strokeWeight(2);
                p5.stroke(55, 198, 255, 100);
                if(radius / scalingFactor > min_radius){
                    p5.ellipse(prevx, prevy, radius * 2);
                    arrow(p5.createVector(prevx, prevy), p5.createVector(x, y), i);
                } else{
                    p5.stroke(255);
                    p5.line(prevx, prevy, x, y);
                    p5.strokeWeight(1);
                }
            }
            return p5.createVector(x, y);
        }

        downloadGif = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            const options = {
                unit: 'frames',
                delay: 0,
                silent: true
            }
            const num_frames = Math.ceil( p5.TWO_PI / (min_freq*parameters.current.freqScalingFactor*dt*60) );
            console.log(num_frames);
            try{
                p5.saveGif('epicycle.gif', num_frames, options);
                toast({
                    title: "Rendering...",
                    description: "Your GIF is being exported. It may take around a minute.",
                });
            } catch (err) {
                console.log(err);
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "Please try again",
                })
            }
        }

        p5.draw = () => {
            p5.background(0);

            p5.fill('white');
            p5.stroke(0);
            p5.text(credits, p5.width/2 + 8, p5.height - 5);
            p5.noFill();

            p5.translate(p5.width / 2, p5.height / 2);
            p5.scale(1, -1);

            let v = epicycles();
            path.unshift(v);
            
            p5.strokeWeight(parameters.current.strokeWeight);
            p5.stroke(255, 255, 0);
            p5.beginShape();
            p5.noFill();
            for (let i = 0; i < path.length; i++)
                p5.vertex(path[i].x, path[i].y);
            
            p5.endShape();
            p5.strokeWeight(1); 

            time += dt;

            if (time > p5.TWO_PI / (min_freq*parameters.current.freqScalingFactor)) {
                // wait for 0.5 seconds
                
                time = 0;
                path = [];
            }
        }   
    };

    return (
    // <Card className="w-80 md:w-96 h-80 md:h-96 flex flex-col items-center justify-center border-2 rounded-lg bg-black">
    <Card className="w-80 md:w-96 flex flex-col items-center border-2 rounded-lg">
        <CardHeader className="text-center">
            <CardTitle>Here it is!</CardTitle>
            <CardDescription>Enjoy ;)</CardDescription>
        </CardHeader>
        <CardContent id="epicycle-canvas" className="w-80 h-80 border-2 rounded-lg flex flex-col items-center justify-center p-0 bg-black">
            <ReactP5Wrapper sketch={sketch} />
        </CardContent>
        <div className='text-left w-72 md:w-80 mt-5'
        >
            Speed
        </div>
        <Slider defaultValue={[parameters.current.freqScalingFactor]} max={5} step={0.1}
        className="w-72 md:w-80 mt-3" 
        onValueChange={(val) => {parameters.current.freqScalingFactor = val[0]; path=[]; time=0;}}
        />

        <div className='text-left w-72 md:w-80 mt-6'
        >
            Number of vectors
        </div>
        <Slider defaultValue={[max_vectors]} min={1} max={og_num_vectors} step={1}
        className="w-72 md:w-80 mt-3" 
        onValueChange={(val) => {parameters.current.num_vectors = val[0]; path=[]; time=0;}}
        />

        <div className='text-left w-72 md:w-80 mt-6'
        >
            Stroke-width
        </div>
        <Slider defaultValue={[parameters.current.strokeWeight]} min={1} max={10} step={1}
        className="w-72 md:w-80 mt-3 mb-3" 
        onValueChange={(val) => {parameters.current.strokeWeight = val[0]; path=[]; time=0;}}
        />


        <CardFooter className="flex justify-between gap-20 mt-5
        ">

        <Button 
            variant="outline"
            onClick={(e)=> {e.preventDefault(); setLineartPreview(undefined); setVectorData(undefined);}}
        >
            Try another
        </Button>
        <Button 
            onClick={(e) => { 
                downloadGif(e);
            } }
        >Save GIF</Button>
      </CardFooter>
    </Card>)
};

export default Epicycles;

// code inspired from https://thecodingtrain.com/challenges/130-drawing-with-fourier-transform-and-epicycles
