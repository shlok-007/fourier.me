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
# heartRate = 100

session_data = dict()

@socketio.on('connect', namespace='/fourierify')
def fourierify_connect():
    print('Client connected')
    return True
    # def send_ping():
    #     while True:
    #         socketio.sleep(heartRate)
    #         socketio.server.emit('ping', namespace='/fourierify')
    # socketio.start_background_task(send_ping)

@socketio.on('clientID', namespace='/fourierify')
def check_cache(clientID):
    print('Client ID received: ', clientID)
    if clientID in session_data:
        print('Client ID found')
        if(session_data[clientID][2] is not None):
            print('Sending cached vector data')
            emit('vectorData', session_data[clientID][2].tolist(), namespace='/fourierify', callback = lambda : session_data.pop(clientID))
        if(session_data[clientID][1] is not None):
            print('Sending cached lineart')
            emit('lineart', session_data[clientID][1].tobytes(), namespace='/fourierify', callback=lambda : send_vector_data(session_data[clientID][0], clientID))
        if(session_data[clientID][0] is not None):
            print('Processing cached image')
            process_image({'clientID': clientID, 'imgData': session_data[clientID][0]})
    else:
        session_data[clientID] = [None, None, None]
    return True

@socketio.on('pong', namespace='/fourierify')
def handle_pong():
    print('-- PONG --')
    return True

@socketio.on('imageUpload', namespace='/fourierify')
def process_image(data):

    clientID = data['clientID']
    session_data[clientID] = [None, None, None]

    image_base64 = data['imgData']
    session_data[clientID][0] = image_base64

    print('Image received')

    image_bytes = base64.b64decode(image_base64.split(',')[1])
    image = np.array(Image.open(io.BytesIO(image_bytes)))

    conv_lineart, lineart = getLineArt.get_lineart(image)
    result, frame_encoded = cv2.imencode(".jpg", lineart, encode_param)
    session_data[clientID][1] = frame_encoded

    emit('lineart', frame_encoded.tobytes(), namespace='/fourierify', callback=lambda : send_vector_data(conv_lineart, clientID))

    return True

def send_vector_data(conv_lineart, clientID):
    arrow_dat = getVectors.get_vectors(conv_lineart)
    session_data[clientID][2] = arrow_dat
    emit('vectorData', arrow_dat.tolist(), namespace='/fourierify', callback = lambda : session_data.pop(clientID))
    return True

@socketio.on('disconnect', namespace='/fourierify')
def fourierify_disconnect():
    print('Client disconnected')
    return True
    

if __name__ == "__main__":
    socketio.run(app, debug=False, host="0.0.0.0", port=5787)