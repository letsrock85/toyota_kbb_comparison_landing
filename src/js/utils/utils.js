var utils = {};

// Image loader
utils.loadImg = function(url, callback) {
  var img = new Image();
  img.addEventListener('load', function() {
    callback(null, img);
  });
  img.addEventListener('error', function(err) {
    return callback(new Error("Cannot load an image: " + url));
  });
  img.src = url;
}

utils.redirect = function (url) {
  window.location.replace(url);
}

utils.openInNewTab = function (url) {
  var win = window.open(url, '_blank');
  win.focus();
}

module.exports = utils;
