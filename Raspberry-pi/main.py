import os
import time

import psutil
import cv2

import wifi_ble
import sensor
import faceid

from flask import Flask, Response
from flask_socketio import SocketIO, emit
from threading import Thread
import logging

logging.basicConfig(filename='./error.log', level=logging.DEBUG)

check_photo_sta = False
notify_dict = {}

# Web
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(16)
socketio = SocketIO(app, cors_allowed_origins='*')


# Camera
def take_pic():
    while True:
        if sensor.alert() == 1:
            global check_photo_sta
            global notify_dict
            correct_time = int(time.time())
            notify_dict[correct_time] = False
            os.system(
                "fswebcam -r 640x480 --no-banner -S 10 /home/pi/Pi/static/catch_images/" + str(
                    correct_time) + ".jpg")
            print("catch!")
            check_photo_sta = True
        else:
            continue
        time.sleep(5)
        print("restart")


def get_camera_frame(camera_id):
    camera = cv2.VideoCapture(camera_id)
    fps = camera.get(cv2.CAP_PROP_FPS)

    while True:
        success, frame = camera.read()
        print(fps)
        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


# face recognition
def get_face_res():
    while True:
        global check_photo_sta
        if check_photo_sta:
            faceid.get_res()
            check_photo_sta = False
            print("Finished")


@app.route("/")
def index():
    return "<p>Hi, there. This is the Pi from MyGuard-B.</p>"


@app.route('/camera/<camera_id>')
def video_feed(camera_id):
    camera_id = int(camera_id)
    return Response(get_camera_frame(camera_id), mimetype='multipart/x-mixed-replace; boundary=frame')


# pi system status
@socketio.on('status')
def status():
    cpu_percent = str(psutil.cpu_percent(1)) + '%'

    mem = psutil.virtual_memory()
    mem_total = mem.total / 1024 / 1024
    mem_percent = '%s%%' % mem.percent

    disk_stat = psutil.disk_usage('/')
    disk_total = disk_stat.total / 1024 / 1024
    disk_percent = '%s%%' % disk_stat.percent
    return {
        'cpu_percent': cpu_percent,
        'mem_total': mem_total, 'mem_percent': mem_percent,
        'disk_total': disk_total, 'disk_percent': disk_percent
    }


# catch images
@socketio.on('catch_images')
def catch_images(url):
    g = os.walk(r"./static/catch_images")
    imageList = []
    for path, dir_list, file_list in g:
        for file_name in file_list:
            try:
                imageList.append({
                    'url': url + os.path.join(path, file_name)[1:],
                    'sort': int(os.path.join(path, file_name)[-14:-4])
                })
            except:
                pass
    imageList.sort(key=lambda s: s['sort'])
    return {'imageList': imageList}


# face images
@socketio.on('face_images')
def face_images(url):
    g = os.walk(r"./static/face_images")
    imageList = []
    for path, dir_list, file_list in g:
        for file_name in file_list:
            try:
                imageList.append({
                    'url': url + os.path.join(path, file_name)[1:],
                    'sort': int(os.path.join(path, file_name)[-14:-4])
                })
            except:
                pass
    imageList.sort(key=lambda s: s['sort'])
    return {'imageList': imageList}


# notify
@socketio.on('notify')
def notify():
    global notify_dict
    for key, value in notify_dict.items():
        if not value:
            notify_dict[key] = True
            return {'time': key}


if __name__ == '__main__':
    # check wifi
    wifi_ble.start()

    # sensor thread
    t1 = Thread(target=take_pic)
    t1.start()
    print('Start camera thread')

    # face thread
    t2 = Thread(target=get_face_res)
    t2.start()
    print('Start face thread')

    os.system('echo %s|sudo -S %s' % ('raspberry', 'sudo systemctl restart frpc'))

    # flask
    print('Start flask server')
    socketio.run(app, host='0.0.0.0', debug=True, use_reloader=False)
