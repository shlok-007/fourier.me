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
socketio = SocketIO(app, cors_allowed_origins='*', max_http_buffer_size=20*1e6)

encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 10]
# b64_src = "data:image/jpg;base64,"

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
    emit('lineart', frame_encoded.tobytes(), namespace='/fourierify', callback=lambda : send_vector_data(conv_lineart))

    # arrow_dat = getVectors.get_vectors(conv_lineart)
    # emit('vectorData', arrow_dat.tolist(), namespace='/fourierify')

def send_vector_data(conv_lineart):
    arrow_dat = getVectors.get_vectors(conv_lineart)
    emit('vectorData', arrow_dat.tolist(), namespace='/fourierify')

@socketio.on('disconnect', namespace='/fourierify')
def fourierify_disconnect():
    socketio.disconnect()
    print('Client disconnected')
    

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5787)