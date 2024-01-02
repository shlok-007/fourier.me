from flask import Flask
from flask_socketio import SocketIO, emit

import numpy as np
import io
from PIL import Image

import getLineArt
import getVectors

import base64

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='http://localhost:3000')

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

    lineart = getLineArt.get_lineart(image)
    lineart_stream = base64.b64encode(lineart.tobytes())
    emit('lineart', lineart_stream, namespace='/fourierify')

    arrow_dat = getVectors.get_vectors(lineart)
    emit('vectorData', arrow_dat.tolist(), namespace='/fourierify')
    

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5787)