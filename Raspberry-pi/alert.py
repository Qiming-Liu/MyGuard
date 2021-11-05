import os
import sensor
import time
if __name__ == '__main__':
    while 1:
        if sensor.alert() == 1:
            print("take photo")
            os.system("fswebcam --timestamp %Y-%m-%d/%H:%M   -S 10 /home/pi/Pi/static/" + str(int(time.time())) + ".jpg")
        time.sleep(1)    
        print("restart")
#     if os.system('sudo python sensor.py') == 'None!':
#         print("123")
#     a = os.system('sudo python sensor.py')
#     print(os.system('sudo python sensor.py'))
