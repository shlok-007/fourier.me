# fourier.me

In this project I am building an WebApp that takes your photos and turns them into Fourier Epicycle Drawings.

Not getting it ? Here's the inspiration: https://youtu.be/r6sGWTCMz2k

Here's a TLDR of how it works:

Takes any image(jpg/jpeg/png...etc) as input.
Resizes this image to feasible proportions.
Uses Canny Edge Detector(of the OpenCV library) to find the edges or outline of the image.
From this image, it gets the coordinates of the outline pixels.
Now, using the Christofides' algorithm, it find the shortest closed tour of the points.(doing this is important for the epicycles to work as intended)
Now, I take the Discrete Fourier Transform of these points(using numpy's fft(fast fourier transform) function).
Next, I save the fft data along with other details like frequency, amplitude in a csv file.
Now comes the animation part, the manim code reads this csv file and makes the corresponding rotating arrows and circles and animates them.
I have also added some optimizations in the manim code for faster rendering which is irrelevant for this TLDR.
I am planning to make a WebApp out of this. Let's see how it goes!!!
