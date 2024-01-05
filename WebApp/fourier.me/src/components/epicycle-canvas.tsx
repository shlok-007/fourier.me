import React, {useState} from 'react';
import { Card } from './ui/card';
import { P5CanvasInstance, ReactP5Wrapper } from 'react-p5-wrapper';

interface EpicyclesProps {
    vector_data: number[][];
}

interface Vector {
    x: number;
    y: number;
}

const Epicycles: React.FC<EpicyclesProps> = ({ vector_data }) => {
    
    const dt : number = 0.1;
    const inpadding = 5;
    const lineGap = 10;

    var path : Vector[] = [];
    var time : number = 0;
    var scalingFactor : number = 1;

    const sketch = (p5: P5CanvasInstance) => {
        p5.setup = () => {
            const canvasDiv = document.getElementById('epicycle-canvas');
            if(canvasDiv){
                let canvas = p5.createCanvas(canvasDiv.clientWidth - inpadding, canvasDiv.clientHeight - inpadding);
                // console.log(canvasDiv?.clientWidth, canvasDiv?.clientHeight);
                canvas.parent('epicycle-canvas');
                scalingFactor = canvasDiv.clientWidth / 10;
            }

            if(vector_data[0].length === 4){
                for (let i = 0; i < vector_data.length; i++){
                    vector_data[i] = [ vector_data[i][0], vector_data[i][1], p5.atan2( vector_data[i][3], vector_data[i][2] ) ];
                }
            }
            
        };

        p5.windowResized = () => {
            const canvasDiv = document.getElementById('epicycle-canvas');
            if(canvasDiv){
                p5.resizeCanvas(canvasDiv.clientWidth - inpadding, canvasDiv.clientHeight - inpadding);
                scalingFactor = canvasDiv.clientWidth / 10;
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
            for (let i = 0; i < vector_data.length; i++) {
                let prevx = x;
                let prevy = y;
                let [radius, freq, phase] = vector_data[i];
                radius *= scalingFactor;

                x += radius * p5.cos(freq * time + phase);
                y += radius * p5.sin(freq * time + phase);

                p5.strokeWeight(2);
                p5.stroke(55, 198, 255, 100);
                p5.ellipse(prevx, prevy, radius * 2);
                
                arrow(p5.createVector(prevx, prevy), p5.createVector(x, y), i);
            }
            return p5.createVector(x, y);
        }

        p5.draw = () => {
            p5.background(0);
            p5.translate(p5.width / 2, p5.height / 2);
            p5.scale(1, -1);

            let v = epicycles();
            path.unshift(v);
            
            p5.strokeWeight(5);
            p5.stroke(255, 255, 0);
            p5.beginShape();
            p5.noFill();
            for (let i = 0; i < path.length; i++)
                p5.vertex(path[i].x, path[i].y);
            
            p5.endShape();
            p5.strokeWeight(1); 

            time += dt;

            if (time > p5.TWO_PI / vector_data[0][1]) {
                time = 0;
                path = [];
            }
        }   
    };

    return (
    <Card id="epicycle-canvas" className="w-80 md:w-96 h-80 md:h-96 flex items-center justify-center border-2 rounded-lg bg-black">
        <ReactP5Wrapper sketch={sketch} />
    </Card>)
};

export default Epicycles;

// code inspired from https://thecodingtrain.com/challenges/130-drawing-with-fourier-transform-and-epicycles
