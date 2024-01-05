from flask import Flask
from flask_socketio import SocketIO, emit

import numpy as np
import io
from PIL import Image
import cv2

import getLineArt
import getVectors

import base64

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='http://localhost:3000')

encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]
b64_src = "data:image/jpg;base64,"

@socketio.on('connect', namespace='/fourierify')
def fourierify_connect():
    print('Client connected')

@socketio.on('imageUpload', namespace='/fourierify')
def process_image(image_base64):
    print('Image received')

    # Decode the base64 string to a bytes object
    image_bytes = base64.b64decode(image_base64.split(',')[1])

    # Convert the bytes object to a numpy array
    image = np.array(Image.open(io.BytesIO(image_bytes)))

    conv_lineart, lineart = getLineArt.get_lineart(image)
    result, frame_encoded = cv2.imencode(".jpg", lineart, encode_param)
    processed_img_data = base64.b64encode(frame_encoded).decode()
    processed_img_data = b64_src + processed_img_data
    # lineart_stream = base64.b64encode(lineart.tobytes())
    emit('lineart', processed_img_data, namespace='/fourierify')

    arrow_dat = getVectors.get_vectors(conv_lineart)
    emit('vectorData', arrow_dat.tolist(), namespace='/fourierify')
    

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5787)