# import os
import numpy as np
from flask import Flask, request, send_file, render_template
from manim import *
import cv2
import tsp
from time import time
from get_vector_dat import get_epicycles_data
# from math import cos,sin
import subprocess
config.media_embed = True

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
    # os.system('cmd /c "manim -qm server.py Fourier_Epicycles"')
    subprocess.run(["manim","-ql", "Manim_Epicycles_Animation.py", "Fourier_Epicycles"])    #480p15
    # time.sleep(5)

    output_file_path="media/videos/Manim_Epicycles_Animation/480p15/Fourier_Epicycles.mp4"
    # output_file_path="media\\videos\\Manim_Epicycles_Animation\\480p15\\Fourier_Epicycles.mp4"
    # output_file_path="media\\videos\\server\\720p30\\Fourier_Epicycles.mp4"
    # output_file_path="media\\videos\\server\\1080p60\\Fourier_Epicycles.mp4"

    return send_file(output_file_path, mimetype='video/mp4')


if __name__ == '__main__':
    app.run(debug=False)
