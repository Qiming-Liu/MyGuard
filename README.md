# Introduction
> #### This project aims to design an indoor surveillance system which by using three devices: a set of Bluetooth sensors, a base station and a web camera. Users could install the sensor anywhere in their home and mount the camera at the right location to observe the surveillance region. If an unauthorised person has some unallowed actions, the sensor will notify the base station and the web camera will catch a photo for the surveillance region. The users will be notified and they can find the warning notification and photo via a phone APP. 

## Demo Video
https://user-images.githubusercontent.com/68600416/177585827-7ec9844e-c01c-421a-a3e2-1cd2729233d7.mp4

## Poster
![](https://github.com/Qiming-Liu/MyGuard/raw/main/Res/poster.png)  

# Feature
 - Firebase Authentication
 - Firebase Realtime Database
 - Scan QR code to connect to Wi-Fi via Bluetooth LE
 - Real-time camera stream
 - Pose estimation TFJS
 - Face recognition
 - CDN Vue2

# Device
1. Bluetooth motion sensor
2. Android
3. Camera
4. Raspberry Pi
![](https://github.com/Qiming-Liu/MyGuard/raw/main/Res/device.png)  

# Installation
> App:  
make sure you have installed npm and cordova  
```shell
npm i
cordova platform add android
cordova build
```

> Firebase: 
* Create a new Firebase project  
* Deploy hosting (optional)
* Set up realtime.database.json (required for DB)
* Replace all firebase related api id and keys in this project with yours  

> Pi:   
Raspberry pi os, set up rc.local (autorun) or run 
```shell
sudo python3 main.py
```
