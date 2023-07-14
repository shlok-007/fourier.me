import os
import numpy as np
from flask import Flask, request, send_file, render_template
from manim import *
import cv2
import tsp
from time import time
from math import cos,sin
config.media_embed = True

# PI=3.14159265359

#Parameters for get_epicycles_data
max_img_dim=150
max_coords_length=10
threshold_amp=0.01

#Parameters for manim scene animation
max_n_vectors=10
play_time=5
speed=15
fps=30
min_rad=0.2


def get_epicycles_data(img):
    size=img.shape
    print("Dimentions of image:",size)
    mul_factor=max_img_dim/max(size)
    new_dim=(int(size[1]*mul_factor),int(size[0]*mul_factor))
    if(mul_factor>1):
        img=cv2.resize(img,new_dim,interpolation = cv2.INTER_CUBIC)
    else:
        img=cv2.resize(img,new_dim,interpolation = cv2.INTER_AREA)

    canny = cv2.Canny(img, 100, 200)

    points=[]
    x_shift=new_dim[0]/2
    y_shift=new_dim[1]/2
    sf=max_coords_length/max(new_dim)


    for i in range(new_dim[1]):
        for j in range(new_dim[0]):
            if(canny[i][j]==255):
                points.append([j,new_dim[1]-i-1])

    print(len(points))

    start=time()
    path_idx=tsp.christofides(points)
    print('Time taken by Christofides=',time()-start)

    x=[]
    y=[]

    path=[]
    for i in path_idx:
        path.append(complex((points[i][0]-x_shift)*sf,(points[i][1]-y_shift)*sf))
        x.append((points[i][0]-x_shift)*sf)
        y.append((points[i][1]-y_shift)*sf)

    del path[-1]

    x.clear()
    y.clear()
    points.clear()


    N=len(path)
    freqs=np.fft.fftfreq(N)*20*PI
    fft=np.fft.fft(path)/N

    mask=abs(fft)>=threshold_amp
    fft=fft[mask]
    freqs=freqs[mask]
    N=len(freqs)

    dtype = [('amp', float), ('freq', float), ('real', float), ('imag', float)]
    arrow_dat=[]
    for i in range(N):
        c=fft[i]
        amp=round(abs(c),4)
        freq=round(freqs[i],4)
        arrow_dat.append((amp,freq,round(c.real,4),round(c.imag,4)))

    # fft=None
    # freqs=None

    print("No. of arrows=",len(freqs))

    arrow_dat=np.array(arrow_dat,dtype=dtype)
    arrow_dat=np.sort(arrow_dat,order='amp')
    arrow_dat=arrow_dat[::-1]
    
    # np.savetxt("arrow_data\\arrow_dat_"+imgName+".csv", arrow_dat, delimiter=",")
    
    np.savetxt("arrow_data\\arrow_dat1.csv", arrow_dat, delimiter=",")


class Fourier_Epicycles(Scene):
    def construct(self):
        
        arrow_dat = np.genfromtxt("arrow_data\\arrow_dat1.csv", delimiter=",")

        N=len(arrow_dat)
        if(N>max_n_vectors):
            arrow_dat=arrow_dat[0:max_n_vectors]
            N=max_n_vectors

        print("Number of vectors being used:",N)
        print("Rendering in 720p 30 fps\n")
        
        ax = NumberPlane(y_range=[-5, 5], background_line_style={"stroke_opacity": 0.4})
        start_time=time()

        vg=VGroup()

        dat=arrow_dat[0]

        circ=Circle(radius=dat[0],color=BLUE_D)

        rotArrow=Arrow(start=ORIGIN,end=np.array([dat[2],dat[3],0]),color=WHITE,buff=0)
        rotArrow.set(freq=dat[1])
        vg.add(circ,rotArrow)
        vgl=2
        vg[1].add_updater(lambda x: x.put_start_and_end_on(start=ORIGIN , end=np.array([x.get_length()*cos(x.get_angle() + x.freq*speed/fps) , x.get_length()*sin(x.get_angle() + x.freq*speed/fps),0])))
        
        for i in range(1,N):
            
            prev_idx=vgl-1
            dat=arrow_dat[i]

            if(dat[0]>min_rad):
                circ=Circle(radius=dat[0],color=BLUE_D).move_to(vg[prev_idx].get_end())
                circ.set(idx=prev_idx)
                vg.add(circ)
                vgl+=1
                vg[vgl-1].add_updater(lambda x: x.move_to( vg[x.idx].get_end() ))

            rotArrow=Arrow(start=vg[prev_idx].get_end(),end=vg[prev_idx].get_end() + np.array([dat[2],dat[3],0]) ,color=WHITE,buff=0)
            rotArrow.set(idx=prev_idx)
            rotArrow.set(freq=dat[1])
            vg.add(rotArrow)
            vgl+=1
            vg[vgl-1].add_updater(lambda x: x.put_start_and_end_on(start=vg[x.idx].get_end() , end=vg[x.idx].get_end() + np.array([x.get_length()*cos(x.get_angle() + x.freq*speed/fps),x.get_length()*sin(x.get_angle() + x.freq*speed/fps),0])))

        trace=TracedPath(vg[vgl-1].get_end, stroke_width=10,stroke_color=YELLOW_C)
        vg.add(trace)
        new_height=2*(arrow_dat[0][0] + 3*arrow_dat[1][0])
        self.camera.frame_height=new_height
        self.camera.frame_width=16*new_height/9
        self.add(ax,vg)
        self.wait(play_time)

        print("Time Taken to render",time()-start_time)



app = Flask(__name__)

@app.route("/")
@app.route("/home")
def home():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    
    #getting img array
    file_str = request.files['image'].read()
    file_bytes = np.fromstring(file_str, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)

    get_epicycles_data(img)

    # render the animation
    os.system('cmd /c "manim -qm server.py Fourier_Epicycles"')
    # time.sleep(5)

    # output_file_path="media\\videos\\server\\480p15\\Fourier_Epicycles.mp4"
    output_file_path="media\\videos\\server\\720p30\\Fourier_Epicycles.mp4"
    # output_file_path="media\\videos\\server\\1080p60\\Fourier_Epicycles.mp4"

    return send_file(output_file_path, mimetype='video/mp4')



if __name__ == '__main__':
    app.run(debug=False)
