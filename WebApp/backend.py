import os
import tempfile

from flask import Flask, request, send_file, render_template
from manim import *

app = Flask(__name__)


@app.route("/")
@app.route("/home")
def home():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    # Get the image file from the request
    image_file = request.files['image']

    # Save the image file to a temporary location
    temp_image_file = tempfile.NamedTemporaryFile(delete=False)
    image_file.save(temp_image_file.name)

    # Create a manim Scene using the image file
    class MyScene(Scene):
        def construct(self):
            self.add(Write(temp_image_file.name))

    # Create a temporary directory for the output video file
    with tempfile.TemporaryDirectory() as temp_dir:
        # Render the Scene as a video file
        output_file = os.path.join(temp_dir, "output.mp4")
        MyScene.construct(output_file=output_file)

        # Return the output video file as a response
        return send_file(output_file, mimetype='video/mp4')

if __name__ == '__main__':
    app.run()



# import os
# import numpy as np
# import tempfile
# from flask import Flask, request, send_file, render_template
# from manim import *
# import cv2
# import time
# import urllib
# config.media_embed = True
# config.save_last_frame=False

# class MyScene(Scene):
#     def construct(self):
#         circ=Circle(radius=5,color=WHITE)
#         self.add(circ)
#         self.wait(2)

# def manim_render():
#     if(__name__=='__main__'):
#         scene=MyScene()
#         scene.render()


# app = Flask(__name__)

# @app.route("/")
# @app.route("/home")
# def home():
#     return render_template('index.html')

# @app.route('/process_image', methods=['POST'])
# def process_image():
#     # Get the image file from the request
#     # image_file = request.files['image']

#     # print("\n\n\n",type(image_file),"\n\n\n")

#     # temp_image_file = tempfile.NamedTemporaryFile(delete=False)
#     # image_file.save(temp_image_file.name)

#     # img = np.asarray(bytearray(image_file.read()), dtype="uint8")

#     # print("\n\n\n",img.shape,type(img),"\n\n\n")


#     #read image file string data
#     filestr = request.files['image'].read()
#     #convert string data to numpy array
#     file_bytes = np.fromstring(filestr, np.uint8)
#     # convert numpy array to image
#     img = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)
#     print("\n\n\n",img.shape,type(img),"\n\n\n")


#     # manim_render()
#     os.system('cmd /c "manim -ql server.py MyScene"')
#     # time.sleep(5)

#     # Save the image file to a temporary location
#     # temp_image_file = tempfile.NamedTemporaryFile(delete=False)
#     # image_file.save(temp_image_file.name)

#     # Create a manim Scene using the image file

#     # Create a temporary directory for the output video file
#     # with tempfile.TemporaryDirectory() as temp_dir:
#         # Render the Scene as a video file
#         # output_file = os.path.join(temp_dir, "output.mp4")
    

#     # time.sleep(10)

#     output_file_path="media\\videos\\server\\480p15\\MyScene.mp4"
#         # MyScene.construct(output_file=output_file)

#         # Return the output video file as a response
#     return send_file(output_file_path, mimetype='video/mp4')

# if __name__ == '__main__':
#     app.run(debug=True)
