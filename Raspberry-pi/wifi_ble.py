from bluepy.btle import Peripheral, Scanner, DefaultDelegate
from urllib.request import urlopen
import device_crypt, os, crc8, time


class ScanDelegate(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleDiscovery(self, dev, isNewDev, isNewData):
        pass


def bluetooth_scan():
    scanner = Scanner().withDelegate(ScanDelegate())
    devices = scanner.scan(5.0)
    match_devices = []
    for dev in devices:
        for (adtype, desc, value) in dev.getScanData():
            if value == "6e4000f0-b5a3-f393-e0a9-e50e24dcca9e":
                match_devices.append(dev)
                continue
    return match_devices


def byte2str(b):
    return str(b)[2:-1]


def scan():
    match_devices = bluetooth_scan()
    for dev in match_devices:
        print("[Wi-Fi link] A possible device found %s (%s)" % (dev.addr, dev.addrType))
        try:
            connection = Peripheral(dev.addr, dev.addrType)
            serv = connection.getServiceByUUID("6e4000f0-b5a3-f393-e0a9-e50e24dcca9e")
            WRITE_DEVICE = serv.getCharacteristics("6e4000f1-b5a3-f393-e0a9-e50e24dcca9e")[0]
            READ_DEVICE = serv.getCharacteristics("6e4000f2-b5a3-f393-e0a9-e50e24dcca9e")[0]
            WRITE_STATUS = serv.getCharacteristics("6e4000f3-b5a3-f393-e0a9-e50e24dcca9e")[0]
            READ_STATUS = serv.getCharacteristics("6e4000f4-b5a3-f393-e0a9-e50e24dcca9e")[0]
            READ_SSID = serv.getCharacteristics("6e4000f5-b5a3-f393-e0a9-e50e24dcca9e")[0]
            READ_PASS = serv.getCharacteristics("6e4000f6-b5a3-f393-e0a9-e50e24dcca9e")[0]
            WRITE_SERIAL = serv.getCharacteristics("6e4000f7-b5a3-f393-e0a9-e50e24dcca9e")[0]
            if READ_DEVICE.supportsRead() and READ_STATUS.supportsRead() and READ_SSID.supportsRead() and READ_PASS.supportsRead():
                device_id = get_device_id(READ_DEVICE, WRITE_DEVICE)
                if device_crypt.verify(device_id):
                    return [WRITE_STATUS, READ_STATUS, READ_SSID, READ_PASS, WRITE_SERIAL]
        except Exception as e:
            print(e)
    return [0, 0, 0, 0, 0]


def get_device_id(READ_DEVICE, WRITE_DEVICE):
    device_id_list = []
    i = 0
    now = time.time()
    while True:
        WRITE_DEVICE.write(str.encode(str(i)), withResponse=False)
        time.sleep(0.1)
        data = READ_DEVICE.read()
        print(data)
        crc = crc8.crc8()
        crc.update(data[:-2])
        if int(byte2str(data)[1:3]) == i and crc.hexdigest() == byte2str(data)[-2:]:
            i += 1
            device_id_list.append(data)
            if byte2str(data)[0] == '1':
                break
        elif time.time() - now > 10:
            break
    device_id = ""
    for i in device_id_list:
        device_id += byte2str(i)[3:-2]
    return device_id


def connect_wifi(ssid, password):
    print('wifi: ' + ssid + ', ' + password)
    os.system("wpa_passphrase '" + ssid + "' '" + password + "' > wpa.conf")
    os.system("wpa_supplicant -iwlan0 -c./wpa.conf -B")


def get_wifi_connected():
    r = os.popen("iw dev wlan0 link")
    text = r.read()
    r.close()
    return text != "Not connected.\n"


def get_internet_connected():
    try:
        urlopen('https://www.google.com/', timeout=1)
        return True
    except Exception:
        return False


def start():
    if os.path.exists('./wifilock'):
        print('[Wi-Fi link] Wi-Fi connect skipped due to initialized')
    else:
        print('[Wi-Fi link] Starting...')
        while True:
            if get_wifi_connected() and get_internet_connected():
                try:
                    print('[Wi-Fi link] Internet access success')
                    WRITE_STATUS.write(b'03', withResponse=False)
                    serial = device_crypt.get_serial()
                    WRITE_SERIAL.write(str.encode(str(serial)), withResponse=False)
                    os.mknod('./wifilock')
                    print('[Wi-Fi link] Initialized')
                except:
                    pass
                break
            WRITE_STATUS, READ_STATUS, READ_SSID, READ_PASS, WRITE_SERIAL = scan()
            if WRITE_STATUS == 0:
                print('[Wi-Fi link] Bluetooth LE scanning...')
            else:
                print('[Wi-Fi link] Bluetooth LE connected')
                WRITE_STATUS.write(b'01', withResponse=False)
                try:
                    last_status = ''
                    while True:
                        if get_wifi_connected() and get_internet_connected():
                            break
                        elif last_status != READ_STATUS.read() and READ_STATUS.read() != b'null':
                            WRITE_STATUS.write(b'02', withResponse=False)
                            ssid = byte2str(READ_SSID.read())
                            password = byte2str(READ_PASS.read())
                            connect_wifi(ssid, password)
                            last_status = READ_STATUS.read()
                except Exception as e:
                    print(e)
    print('[Wi-Fi link] End')
