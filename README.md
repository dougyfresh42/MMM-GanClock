* install nvm *
nvm install 12.4.0
cd modules
git clone https://github.com/dougyfresh42/MMM-GanClock.git
mv ganclock.js MMM-GanClock.js?
mv ganclock.css MMM-GanClock.css?
vim MMM-GanClock.js (:s/ganclock/MMM-GanClock)
here I had to nvm use 12.4.0; maybe bc new terminal?
npm install?

----------------------------------------
npm rebuild @tensorflow/tfjs-node --build-from-source
^ didn't work
THIS SHOULD WORK ON A PI
I believe it didn't work b/c i need to rebuild libtensorflow
working on that rn

----------------------------------------
I think i need to electron-reconfig here BUT
Adding to config.js
