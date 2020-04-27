# MMM-GanClock
This is a clock for MagicMirror which uses a Neural Net generator trained as a GAN on the MNIST digits dataset to "handwrite" the digits in the clock.  The seed updates each time a digit which isn't already on the screen is drawn, so the numbers will change.

## Installation

1. [Install nvm](https://github.com/cncjs/cncjs/wiki/Setup-Guide:-Raspberry-Pi-%7C-Install-Node.js-via-Node-Version-Manager-(NVM))

2. Install the version of NodeJS corresponding to the version MagicMirror uses with Electron:
```bash
nvm install 12.4.0
```

3. Install this module to Magic Mirror
```bash
cd modules
git clone https://github.com/dougyfresh42/MMM-GanClock.git
cd MMM-GanClock
```

4. Make sure that you're using the node version installed above now, so you can install dependencies
```bash
npm install
npm rebuild @tensorflow/tfjs-node --build-from-source
```

5. You (probably) have to rebuild canvas now for electron so
```bash
sudo apt install pkgconfig libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
node_modules/.bin/electron-rebuild -o canvas
```

6. Add to your config.js and you're all set

## Why was that so difficult?
Electron uses a different node version than the node that's installed on your computer.  In theory, this is what the `electron-rebuild` command fixes.  For some reason, for me anyways, this command failed to rebuild tensorflowjs for the correct node version.  To this end, I installed tfjs using the same node version as electron, and then had to rebuild canvas because somehow the NVM supplied Node version is 1 (72 vs 73) version behind the Electron one.

Do you understand my problems better than me?  Please let me know so that this installation can be easier

## It is crashing silently
I had this issue, and if I ran serveronly it would say "tensorflow Illegal Instruction".  This was on an Intel Atom processor and I had to rebuild libtensorflow.  I followed [The tfjs recompile instructions](https://github.com/tensorflow/tfjs/tree/master/tfjs-node#optional-build-optimal-tensorflow-from-source) and set `march=bonnell` in the configure script.  The processor had a bonnell architecture, change this line to match your architecture.

This is potentially solveable with an older TF version but I didn't try that.

## Configure options
Coming soon (:
