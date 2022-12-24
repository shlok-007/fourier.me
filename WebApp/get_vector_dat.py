import numpy as np
import tsp
import cv2
from time import time

PI=3.14159265359

#Parameters for get_epicycles_data
max_img_dim=150
max_coords_length=10
threshold_amp=0.01

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
