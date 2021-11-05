import device_crypt
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate('./firebase_key.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://myguard-9a9cb-default-rtdb.asia-southeast1.firebasedatabase.app'
})


def get(db_url):
    ref = db.reference(db_url)
    return ref.get()


def get_bind():
    return get('device/' + device_crypt.get_serial())


def get_sensor_mac():
    sensorid = get_bind().get('sensorid')
    return get('sensor_map/' + sensorid)
