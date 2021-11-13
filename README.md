![](https://github.com/Qiming-Liu/MyGuard/raw/main/Res/logo.png)  

## Demo Video
[![Download Demo Video](https://github.com/Qiming-Liu/MyGuard/raw/main/Res/demo.png "demo.png")](https://github.com/Qiming-Liu/MyGuard/raw/main/Res/demo.mp4)  

## Poster
![](https://github.com/Qiming-Liu/MyGuard/raw/main/Res/poster.png)  

# Introduction
> #### This project aims to design an indoor surveillance system which by using three devices: a set of Bluetooth sensors, a base station and a web camera. Users could install the sensor anywhere in their home and mount the camera at the right location to observe the surveillance region. If an unauthorised person has some unallowed actions, the sensor will notify the base station and the web camera will catch a photo for the surveillance region. The users will be notified and they can find the warning notification and photo via a phone APP. 

# Feature
 - Firebase Authentication
 - Firebase Realtime Database
 - Scan QR code to connect to Wi-Fi via Bluetooth LE
 - Real-time camera
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
> App: make you have installed npm and cordova  
```shell
npm i
cordova platform add android
cordova build
```
> Firebase: deploy hosting, set up realtime.database.json  
> Pi: Pi OS, set up rc.local or run 
```shell
sudo python3 main.py
```
