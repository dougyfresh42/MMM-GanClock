# MMM-GanClock
This is a clock for MagicMirror which uses a Neural Net generator trained as a GAN on the MNIST digits dataset to "handwrite" the digits in the clock.  The seed updates each time a digit which isn't already on the screen is drawn, so the numbers will change.

## Installation
Disclaimer: I have gone through hell and back to get this running on a Raspberry
Pi Model B Rev 1.  Will these instructions work on your fancy ARMv7 Pi 2+?  I
have no idea.  Let me know, so I can update them.

1. Raspberry Pi 2+ (armv7)
  1. [Install nvm](https://github.com/cncjs/cncjs/wiki/Setup-Guide:-Raspberry-Pi-%7C-Install-Node.js-via-Node-Version-Manager-(NVM))

  2. Install the version of NodeJS corresponding to the version MagicMirror uses with Electron.
```bash
nvm install 12.4.0
```

2. Raspberry Pi Zero, 1 (armv6)
  1. Perhaps Unnecessarily Install 12.4.0
```bash
wget https://unofficial-builds.nodejs.org/download/release/v12.4.0/node-v12.4.0-linux-armv6l.tar.gz`
tar xzvf node-v12.4.0-linux-armv6l.tar.gz
echo "export PATH=/home/pi/node-v12.4.0-linux-armv6l/bin:$PATH" >> ~/.bashrc
source ~/.bashrc
```

  2. NB: I don't think that this is even necessary.  In this instance, you can't
run electron on the Pi anyway, you'll have to `node serveronly`, so I think that
`sudo apt install node` should work Ok? <- Testing

3. Install this module to Magic Mirror
```bash
cd modules
git clone https://github.com/dougyfresh42/MMM-GanClock.git
cd MMM-GanClock
```

4. Make sure that you're using the node version installed above now, so you can install dependencies
  1. Pi 2
```bash
npm install
npm rebuild @tensorflow/tfjs-node --build-from-source
sudo apt install pkgconfig libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
node_modules/.bin/electron-rebuild -o canvas
```

  2. Pi 1
```bash
# Do you need to install above packages to get canvas to install?  I don't know
npm install canvas #I had to do this separately to get it to work
npm install @tensorflow/tfjs-node
# Follow instructions lower down to rebuild tensorflow
```

5. Add to your config.js and you're all set

## Why was that so difficult?
Electron uses a different node version than the node that's installed on your
computer.  In theory, this is what the `electron-rebuild` command fixes.  For
some reason, for me anyways, this command failed to rebuild tensorflowjs for the
correct node version.  To this end, I installed tfjs using the same node version
as electron, and then had to rebuild canvas because somehow the NVM supplied
Node version is 1 (72 vs 73) version behind the Electron one.  This is only
true on the x86 computers I used.

Do you understand my problems better than me?  Please let me know so that this installation can be easier

On the Pi 1, I had issues because electron doesn't have an ARMv6 package.  This
is nice - because you can install any version of Node that you want.  This is
rough, because it's harder to setup MM.  And build Tensorflow.

## It is crashing silently
I had this issue, and if I ran serveronly it would say "tensorflow Illegal Instruction".
This was on an Intel Atom processor and I had to rebuild libtensorflow.
I followed [The tfjs recompile instructions](https://github.com/tensorflow/tfjs/tree/master/tfjs-node#optional-build-optimal-tensorflow-from-source)
and set `march=bonnell` in the configure script.  The processor had a bonnell
architecture, change this line to match your architecture. After copying to deps
do a `npm rebuild @tensorflow/tfjs-node --build-from-source`

This is potentially solveable with an older TF version but I didn't try that.

## Rebuild Tensorflow for Pi
I had to checkout version 1.15 of tf, because that was the version tfjs-node wanted
(TODO: Add how to check this).  Then I followed [instructions to build tf for pi](https://www.tensorflow.org/install/source_rpi)
with one change per [this issue](https://github.com/tensorflow/tensorflow/issues/35062)
```bash
git clone https://github.com/tensorflow/tensorflow.git
cd tensorflow/
git checkout v1.15.0
git cherry-pick 20dfc83d
vim tensorflow/tools/ci_build/pi/build_raspberry_pi.sh
# Look for the bazel build command and add
# //tensorflow/tools/lib_package:libtensorflow
```

## Configure options
Coming soon (:

## Make SD Readonly
To make my SD ReadOnly I followed this script:
https://gitlab.com/larsfp/rpi-readonly/-/blob/master/setup.sh

Another approach that I would consider if I had more RAM on my Pi 1 is:
https://www.raspberrypi.org/forums/viewtopic.php?f=63&t=161416

## Make all this garbage run on boot
I downloaded [kweb and installed it as a display](https://www.raspberrypi.org/forums/viewtopic.php?t=40860)
I set my /home/pi/.config/lxsession/LXDE-pi/autostart to:
```bash
@xset s off
@xset -dpms
@xset s noblank
/home/pi/startbrowser.sh
```
```bash
#!/bin/bash
cd MagicMirror/
nohup /home/pi/node_install/node-v12.4.0-linux-armv6l/bin/node serveronly >/dev/null 2>&1 &
echo "Sleeping"
sleep 60
nohup kweb -KHUJZ http://localhost:8080 >/dev/null 2>&1
```
For some reason if I `&` the last command, bash exits and everything with it.
Obviously the `nohup`s were an attempt to avoid that but it didn't work.  More
experimentation would be good.

## Set my flash drive to swap space
I added a flash drive to swap to, because the SD is readonly, and TF+Node+kweb
wants more than 200 Mb of RAM, go figure.  [The guide is here](https://www.addictivetips.com/ubuntu-linux-tips/use-swap-space-on-usb-drive-in-rasbian-linux/)
but for posterity
1. Format drive as ext4 (likely unimportant)
2. `sudo mkdir -p /mnt/usb-flash/`
3. `sudo echo '/dev/sda1 /mnt/usb-flash/ ext4 noatime,defaults 0 2' >> /etc/fstab`
4. `sudo vim /etc/dphys-swapfile`
  1. Change `#CONF_SWAPFILE=` to `CONF_SWAPFILE=/mnt/usb-flash/swap.file`
  2. Change `CONF_SWAPSIZE=?` to make it bigger if you want (in mb)
5. reboot and profit
