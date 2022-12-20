from manim import *
from math import cos,sin
import numpy as np
from time import time
config.media_embed = True

n_vectors=116
speed=10
play_time=20
fps=30
min_rad=0.2

arrow_dat = np.genfromtxt("arrow_data\\arrow_dat_shlok.jpg.csv", delimiter=",")
N=len(arrow_dat)
print(N)

arrow_dat=arrow_dat[0:n_vectors]
N=n_vectors



class Fourier_Epicycles(Scene):
    def construct(self):

        start_time=time()

        vg=VGroup()

        # arrow_dat[0][0]=5
        # arrow_dat[0][2]=2
        # arrow_dat[0][3]=0

        dat=arrow_dat[0]
        print(arrow_dat)

        circ=Circle(radius=dat[0],color=YELLOW)
        rotArrow=Arrow(start=ORIGIN,end=np.array([dat[2],dat[3],0]),color=WHITE,buff=0)
        rotArrow.set_freq(dat[1])
        vg.add(circ,rotArrow)
        vgl=2
        vg[1].add_updater(lambda x: x.put_start_and_end_on(start=ORIGIN , end=np.array([x.get_length()*cos(x.get_angle() + x.get_freq()*speed/fps) , x.get_length()*sin(x.get_angle() + x.get_freq()*speed/fps),0])))
        
        for i in range(1,N):
            
            prev_idx=vgl-1
            dat=arrow_dat[i]

            if(dat[0]>min_rad):
                circ=Circle(radius=dat[0],color=YELLOW).move_to(vg[prev_idx].get_end())
                circ.set_foo(prev_idx)
                vg.add(circ)
                vgl+=1
                vg[vgl-1].add_updater(lambda x: x.move_to( vg[x.get_foo()].get_end() ))

            rotArrow=Arrow(start=vg[prev_idx].get_end(),end=vg[prev_idx].get_end() + np.array([dat[2],dat[3],0]) ,color=WHITE,buff=0)
            rotArrow.set_foo(prev_idx)
            rotArrow.set_freq(dat[1])
            vg.add(rotArrow)
            vgl+=1
            vg[vgl-1].add_updater(lambda x: x.put_start_and_end_on(start=vg[x.get_foo()].get_end() , end=vg[x.get_foo()].get_end() + np.array([x.get_length()*cos(x.get_angle() + x.get_freq()*speed/fps),x.get_length()*sin(x.get_angle() + x.get_freq()*speed/fps),0])))


        trace=TracedPath(vg[vgl-1].get_end, stroke_width=10)
        vg.add(trace)
        new_height=2*(arrow_dat[0][0] + 3*arrow_dat[1][0])
        self.camera.frame_height=new_height
        self.camera.frame_width=16*new_height/9
        # self.add(trace)
        self.add(vg)
        self.wait(play_time)

        print("Time Taken",time()-start_time)


