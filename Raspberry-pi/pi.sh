#!/bin/bash
cd /home/pi/Pi/
sudo python main.py -u > log.log 2>&1 &
echo MyGuard-B Start Success!
