var NodeHelper = require('node_helper');

const tf = require('@tensorflow/tfjs-node');
const { createCanvas, loadImage } = require('canvas');

const digit_width = 28;
const digit_height = 28;
const colon_width = 15;

const canvas = createCanvas(4*digit_width + colon_width, digit_height);
const ctx = canvas.getContext('2d');
loadImage('modules/MMM-GanClock/background.png').then((image) => {
  ctx.drawImage(image, 0, 0);
});

// Actually not sure what this "Loading" png is, perhaps it's not so useful
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAPFBMVEX///8AAABQQSlbSS+AgIBPT08nJydBQUFmUjUwJxhmZmbAwMBANCGZmZm/v791Xj1HOiSMjIwzMzNzc3Ne3LViAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfWCQUNGyc2mSpzAAAB/klEQVRYw+2X2XLDMAhFC1q9Zev//2sBIVnJ1LLlpG8lM81Lz/EVIM/k6+u/egrgzX99X9CT9i8E0Newzwugd2afFkD/2nxWAGc295MCOHd51sV+RwAQI5w6gVakgn4FQAgBYIiJj50pGHduGIQkFmOXIuP8aO89qgbxmALAuYRHBL8siwfFD6VYn04ILHC5LGC9UXxX8YRHby8UwFo7emMUx3meodn5kPEYg+UaqYJGQOa3BIIPK05fIYyCB0RT8C0BfHMNWHD6RuRIjJsVd1sCJ82P11iGFqNhCeGm4LMLm4IHfQZjrlkhjmfckwAagkACzAospym4H/0Mmz0gnBLIE0mxDn7FeZ6NJqYEeKMMuB6kxpPAtRMYEfAfVjzj9k6C3R4UgYyuxlWw0wMhTRKYK2ZcVvp+pAdE3lhwywLG6Ubxlbjv9OChCVSAIvAFJ962e+ByAo5/wyxQvAjc5mVyOQFmiwpsqVaClCEdAZMAfxW4xvvAyRhFIB8RaP8OJGADb6IMoBLYIhh3EpAhCXKGIsi8LtLUMMj8UhfyGFUwCi+LNE0NASaBqQV3xdMeEr8pmJIAXwUv+DZPAu2fNEIFr3hLMEFSpEspguN4Moii2oMeXA2rQgQ9eKXIgrkTf0qRXii9eK2QV2I/Xh/kJF4pzuJFcR4viv9fq39fP445JiZZCgYcAAAAAElFTkSuQmCC';

// Class that loads the tfjs models and generates the digit sprite
class digit_gen {
  constructor(digit) {
    this.loaded = false;
    this.digit = digit;
  }

  async load_gens() {
    this.model =
      await tf.loadLayersModel('file://modules/MMM-GanClock/models/'+this.digit+'/model.json');
    await this.init_seed();

    this.loaded = true;
  }

  init_seed() {
    this.seed = tf.randomNormal([1,100], 0, 1);
    this.sprite = this.model.predict(this.seed).flatten().arraySync();
  }

  get_sprite() {
    return this.sprite;
  }
};

class clock_gen {
  constructor() {
    this.digit_gens = [];
    this.digits = [-1, -1, -1, -1];
    this.png = png;
    this.init_clock();
    this.callback_set = false;
    this.callback = null;
    this.running = true;
    this.timer = false;
  }

  set_callback(callback) {
    this.callback = callback;
    this.callback_set = true;
    this.callback(this.png);
  }

  draw_digit(position) {
    let imgData = ctx.createImageData(28, 28);

    let x = digit_width * position;
    if (position > 1) x += colon_width;

    let digit = this.digits[position];

    if (this.digit_gens[digit].loaded) {
      let digit_array = this.digit_gens[digit].get_sprite();

      for (let i = 0; i < digit_array.length; i += 1) {
        let num = Math.min(Math.max(digit_array[i], 0), 1);
        imgData.data[i*4+0] = 255 * num;
        imgData.data[i*4+1] = 255 * num;
        imgData.data[i*4+2] = 255 * num;
        imgData.data[i*4+3] = 255;
      }

      ctx.putImageData(imgData, x, 0);
    }
  }

  async update_digits(new_digits) {
    let updated = []
    for(let i = 0; i < 4; i++) {
      updated.push(new_digits[i] == this.digits[i]);
      if (!this.digits.includes(new_digits[i]))
        if (this.digit_gens[new_digits[i]].loaded)
          await this.digit_gens[new_digits[i]].init_seed();
    }

    this.digits = new_digits;

    //let index = 0;
    while (!updated.every(x=>x)) {
      for (let i = 0; i < 4; i++) {
        if (!updated[i]) {
          this.draw_digit(i);
          updated[i] = true;
        }
      }
    }

    this.new_png = canvas.toDataURL();
  }

  async init_clock() {
    for(let i = 0; i < 10; i++) {
      let dg = new digit_gen(i);
      await dg.load_gens();
      this.digit_gens.push(dg);
    }

    let date = new Date()
    let h = date.getHours();
    let m = date.getMinutes();

    await this.update_digits([Math.floor(h/10), h%10, Math.floor(m/10), m%10]);
    this.update_clock();
  }

  update_clock() {
    this.png = this.new_png;

    if (this.callback_set) 
    {
      this.callback(this.png);
    }

    let date = new Date()
    date.setMinutes(date.getMinutes() + 1);
    let h = date.getHours();
    let m = date.getMinutes();

    this.update_digits([Math.floor(h/10), h%10, Math.floor(m/10), m%10]);
    if (this.running)
      this.timer = setTimeout(this.update_clock.bind(this), 1000 * (61 - date.getSeconds()));
  }

  quit() {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
};

module.exports = NodeHelper.create({
  start: function() {
    this.clock = new clock_gen();
  },
  socketNotificationReceived: function(notification, payload) {
    if (notification == "INIT")
      this.clock.set_callback(x=>this.sendSocketNotification('NEW_PNG', x));
  },
  stop : function() {
    
    this.clock.quit();
  }
});
