Module.register("ganclock", {
  // Default module config.
  defaults  : {
  },

  start     : function() {
    this.loaded = false;
  },

  getDom    : function() {
    /*if (this.loaded) {
      var image = document.createElement("img");
      image.src   = this.png;
      return image;
    } else {*/
      var wrapper = document.createElement("div");
      wrapper.innerHTML = "Loading Clock";
      Log.log("==================");
      return wrapper;
    //}
  },

  notificationReceived: function(notification, payload, sender) {
    this.loaded = true;
    this.png = payload;
//    this.updateDom();
  },
});
