On Arch Linux, if the Axidraw penplotter can not connect to the computer then make sure the user is added to the `dialout` group: 
```
sudo groupadd dialout
sudo gpasswd -a $USER dialout
sudo usermod -a -G dialout $USER
sudo chmod a+rw /dev/ttyACM0
```