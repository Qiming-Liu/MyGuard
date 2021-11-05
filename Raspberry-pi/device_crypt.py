import base64
from Crypto import Random
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5 as PKCS1_cipher
from Crypto.Cipher import AES

BLOCK_SIZE = 16
pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)
unpad = lambda s: s[:-ord(s[len(s) - 1:])]
vi = '0102030405060708'


def key_generator():
    random_generator = Random.new().read
    rsa = RSA.generate(1024, random_generator)
    private_key = rsa.exportKey()
    print(private_key.decode('utf-8'))
    public_key = rsa.publickey().exportKey()
    print(public_key.decode('utf-8'))
    with open('rsa_private_key.pem', 'wb') as f:
        f.write(private_key)
    with open('rsa_public_key.pem', 'wb') as f:
        f.write(public_key)


def get_key(key_file):
    with open(key_file) as f:
        data = f.read()
        key = RSA.importKey(data)
    return key


def encrypt_rsa(msg):
    public_key = get_key('rsa_public_key.pem')
    cipher = PKCS1_cipher.new(public_key)
    encrypt_text = base64.b64encode(cipher.encrypt(bytes(msg.encode("utf8"))))
    return encrypt_text.decode('utf-8')


def decrypt_rsa(msg):
    private_key = get_key('rsa_private_key.pem')
    cipher = PKCS1_cipher.new(private_key)
    back_text = cipher.decrypt(base64.b64decode(msg), 0)
    return back_text.decode('utf-8')


def encrypt_aes(key, data):
    data = pad(data)
    cipher = AES.new(key.encode('utf8'), AES.MODE_CBC, vi.encode('utf8'))
    encryptedbytes = cipher.encrypt(data.encode('utf8'))
    encodestrs = base64.b64encode(encryptedbytes)
    enctext = encodestrs.decode('utf8')
    return enctext


def decrypt_aes(key, data):
    data = data.encode('utf8')
    encodebytes = base64.decodebytes(data)
    cipher = AES.new(key.encode('utf8'), AES.MODE_CBC, vi.encode('utf8'))
    text_decrypted = cipher.decrypt(encodebytes)
    text_decrypted = unpad(text_decrypted)
    text_decrypted = text_decrypted.decode('utf8')
    return text_decrypted


def get_serial():
    cpu_serial = "0000000000000000"
    try:
        f = open('/proc/cpuinfo', 'r')
        for line in f:
            if line[0:6] == 'Serial':
                cpu_serial = line[10:26]
        f.close()
    except:
        cpu_serial = "ERROR000000000"
    return cpu_serial


def device_id_generator():  # need to url-encode before generate qrcode
    serial = get_serial()
    return encrypt_rsa(serial)


def verify(device_id):
    return decrypt_rsa(device_id) == get_serial()
