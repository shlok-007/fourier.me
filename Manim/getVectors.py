import numpy as np
import cv2
import matplotlib.pyplot as plt
from time import time

import Christofides as christofides
import getLineArt

# Parameters
max_img_dim = 512
max_coords_length = 10
threshold_amp = 0.01

debug = __name__ == "__main__"

def get_vectors(lineart):

    dim = lineart.shape

    if debug:
        plt.imshow(lineart)
        plt.show()

    points = []
    x_shift = dim[1] / 2
    y_shift = dim[0] / 2
    sf = max_coords_length / max(dim)

    for i in range(dim[0]):
        for j in range(dim[1]):
            if lineart[i][j] == 255:
                points.append([j, dim[0] - i - 1])

    print("Number of points=", len(points))

    start = time()
    print("Running Christofides...")
    path_idx = christofides.tsp(points)
    print("Time taken by Christofides=", time() - start)

    x = []
    y = []

    path = []
    for i in path_idx:
        path.append(
            complex((points[i][0] - x_shift) * sf, (points[i][1] - y_shift) * sf)
        )
        if debug:
            x.append((points[i][0] - x_shift) * sf)
            y.append((points[i][1] - y_shift) * sf)

    if debug:
        plt.scatter(x, y, s=1)
        plt.show()
        x.clear()
        y.clear()

    del path[-1]

    N = len(path)
    freqs = np.fft.fftfreq(N) * 20 * np.pi
    fft = np.fft.fft(path) / N

    mask = abs(fft) >= threshold_amp
    fft = fft[mask]
    freqs = freqs[mask]
    N = len(freqs)

    dtype = [("amp", float), ("freq", float), ("real", float), ("imag", float)]
    arrow_dat = []
    for i in range(N):
        c = fft[i]
        amp = round(abs(c), 4)
        freq = round(freqs[i], 4)
        arrow_dat.append((amp, freq, round(c.real, 4), round(c.imag, 4)))

    if debug:
        plt.scatter(freqs, abs(fft), s=3)
        plt.show()

    print("Number of vectors=", N)

    arrow_dat = np.array(arrow_dat, dtype=dtype)
    arrow_dat = np.sort(arrow_dat, order="amp")
    arrow_dat = arrow_dat[::-1]
    
    if debug:
        np.savetxt("../arrow_data/arrow_dat_" + imgName + ".csv", arrow_dat, delimiter=",")
    else:
        np.savetxt("../arrow_data/arrow_dat_last.csv", arrow_dat, delimiter=",")

    return arrow_dat


if __name__ == "__main__":
    imgName = "pi-symbol.png"   # "Robot.png"  "celeb1.jpeg"  "pi-symbol.png"
    image = cv2.imread("../images/" + imgName)
    lineart = getLineArt.get_lineart(image)
    get_vectors(lineart)
