Module.register("MMM-GanClock", {
  // Default module config.
  defaults  : {
    size: "medium",
  },

  getStyles : function() {
    return ['MMM-GanClock.css'];
  },

  start     : function() {
    this.loaded = false;
    this.sendSocketNotification("INIT", 0);
  },

  getDom    : function() {
    if (this.loaded) {
      var image = document.createElement("img");
      image.id    = "ganclock";
      image.src   = this.png;
      image.className = this.config.size;
      return image;
    } else {
      var wrapper = document.createElement("div");
      wrapper.innerHTML = "Loading Clock";
      return wrapper;
    }
  },

  socketNotificationReceived: function(notification, payload) {

    if (notification == 'NEW_PNG') {
      this.png = payload;
      this.loaded = true;
      this.updateDom();
    };
  },
});
