class Ble {
    constructor() {
        this.SERVICE_UUID = '6E4000F0-B5A3-F393-E0A9-E50E24DCCA9E';
        this.WRITE_DEVICE_ID = '6E4000F1-B5A3-F393-E0A9-E50E24DCCA9E';
        this.READ_DEVICE_ID = '6E4000F2-B5A3-F393-E0A9-E50E24DCCA9E';
        this.WRITE_STATUS_UUID = '6E4000F3-B5A3-F393-E0A9-E50E24DCCA9E';
        this.READ_STATUS_UUID = '6E4000F4-B5A3-F393-E0A9-E50E24DCCA9E';
        this.READ_UUID_SSID = '6E4000F5-B5A3-F393-E0A9-E50E24DCCA9E';
        this.READ_UUID_PASS = '6E4000F6-B5A3-F393-E0A9-E50E24DCCA9E';
        this.WRITE_SERIAL_ID = '6E4000F7-B5A3-F393-E0A9-E50E24DCCA9E';
        this.str = new TextEncoder();
        this.hex = new TextDecoder();
        this.crc8 = new CRC8();
    }

    start(IDLength, err, next) {
        Promise.all([
            blePeripheral.createService(this.SERVICE_UUID),
            blePeripheral.addCharacteristic(this.SERVICE_UUID, this.WRITE_DEVICE_ID, blePeripheral.properties.WRITE, blePeripheral.permissions.WRITEABLE),
            blePeripheral.addCharacteristic(this.SERVICE_UUID, this.READ_DEVICE_ID, blePeripheral.properties.READ, blePeripheral.permissions.READABLE),
            blePeripheral.addCharacteristic(this.SERVICE_UUID, this.WRITE_STATUS_UUID, blePeripheral.properties.WRITE, blePeripheral.permissions.WRITEABLE),
            blePeripheral.addCharacteristic(this.SERVICE_UUID, this.READ_STATUS_UUID, blePeripheral.properties.READ, blePeripheral.permissions.READABLE),
            blePeripheral.addCharacteristic(this.SERVICE_UUID, this.READ_UUID_SSID, blePeripheral.properties.READ, blePeripheral.permissions.READABLE),
            blePeripheral.addCharacteristic(this.SERVICE_UUID, this.READ_UUID_PASS, blePeripheral.properties.READ, blePeripheral.permissions.READABLE),
            blePeripheral.addCharacteristic(this.SERVICE_UUID, this.WRITE_SERIAL_ID, blePeripheral.properties.WRITE, blePeripheral.permissions.WRITEABLE),
            blePeripheral.setCharacteristicValue(this.SERVICE_UUID, this.READ_DEVICE_ID, this.enCode(IDLength)),
            blePeripheral.setCharacteristicValue(this.SERVICE_UUID, this.READ_STATUS_UUID, this.enCode('null')),
            blePeripheral.setCharacteristicValue(this.SERVICE_UUID, this.READ_UUID_SSID, this.enCode('null')),
            blePeripheral.setCharacteristicValue(this.SERVICE_UUID, this.READ_UUID_PASS, this.enCode('null')),
            blePeripheral.publishService(this.SERVICE_UUID),
            blePeripheral.startAdvertising(this.SERVICE_UUID, 'MyGuard-B'),
        ]).catch((e) => {
            err(e);
        });

        blePeripheral.onWriteRequest(req => {
            next(req.characteristic.toUpperCase(), this.deCode(req.value));
        });
    }

    stop() {
        blePeripheral.stopAdvertising();
    }

    updateWiFi(ssid, password, next) {
        Promise.all([
            blePeripheral.setCharacteristicValue(this.SERVICE_UUID, this.READ_UUID_SSID, this.enCode(ssid)),
            blePeripheral.setCharacteristicValue(this.SERVICE_UUID, this.READ_UUID_PASS, this.enCode(password)),
        ]).then(next);
    }

    updateValue(uuid, value, next) {
        Promise.all([
            blePeripheral.setCharacteristicValue(this.SERVICE_UUID, uuid, this.enCode(value)),
        ]).then(next);
    }

    enCode(str) {
        return this.str.encode(str).buffer;
    }

    deCode(hex) {
        return this.hex.decode(new Uint8Array(hex));
    }

    crc(str) {
        let value = '0' + this.crc8.checksum(str.split('').map(function (x) {
            return x.charCodeAt(0)
        })).toString(16);
        return value.substr(value.length - 2);
    }
}

function CRC8(polynomial, initial_value) {
    if (polynomial == null) polynomial = CRC8.POLY.CRC8_CCITT
    this.table = CRC8.generateTable(polynomial);
    this.initial_value = initial_value;
}

CRC8.prototype.checksum = function (byte_array) {
    var c = this.initial_value;
    for (var i = 0; i < byte_array.length; i++)
        c = this.table[(c ^ byte_array[i]) % 256]
    return c;
}

CRC8.generateTable = function (polynomial) {
    var csTable = []
    for (var i = 0; i < 256; ++i) {
        var curr = i
        for (var j = 0; j < 8; ++j) {
            if ((curr & 0x80) !== 0) {
                curr = ((curr << 1) ^ polynomial) % 256
            } else {
                curr = (curr << 1) % 256
            }
        }
        csTable[i] = curr
    }
    return csTable
}

CRC8.POLY = {
    CRC8: 0xd5,
    CRC8_CCITT: 0x07,
    CRC8_DALLAS_MAXIM: 0x31,
    CRC8_SAE_J1850: 0x1D,
    CRC_8_WCDMA: 0x9b,
}