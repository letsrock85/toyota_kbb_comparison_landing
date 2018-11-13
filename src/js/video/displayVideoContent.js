var videojs = require('video.js');
var $ = require("jquery");

// My modules
var redirect = require("../utils/utils").redirect;
var openInNewTab = require("../utils/utils").openInNewTab;
var loadBodyHtml = require("../loadBodyHtml");

var _$container;
var _isLocalHost;
var _regionName;
var _regionKey;

function displayVideoContent(data, bodyUrl, $container, regionKey, regionName, isLocalHost, callback) {

  // Set globals
  _$container = $container;
  _isLocalHost = isLocalHost;
  _regionName = regionName;
  _regionKey = regionKey;

  // Get body HTML code
  loadBodyHtml(bodyUrl, _$container, function(err) {
    if(err) return callback(err);

    _$container.addClass("video-content");

    try {
      // Generate HTML and display data
      display(data.video.url, data.video.boss, data.video.competitor, function(err) {
        if(err) return callback(err);
        callback(null);
      });
    } catch (e) {
      return callback(e);
    }

  });

}

function display(videoUrl, boss, competitor, callback) {

  // Set texts to HTML nodes
  $('.boss-series').text(boss.series);
  $('.competitor-series').text(competitor.series);
  $('.competitor-manufacturer').text(competitor.manufacturer);

  // Show nodes
  $('.header .title').show();

  generateHtmlComponents(videoUrl, boss, competitor, callback);
}

// Generate in JS instad of pushing it as HTML on BAT
function generateHtmlComponents(videoUrl, boss, competitor, callback) {
  generateBottomRedButtons(boss, competitor);
  if(videoUrl) {
    console.info("Getting a video file...");
    console.log("");
    try {
      generateVideoSection(videoUrl, callback);
    } catch (e) {
      callback(e);
    }
  } else {
    callback(new Error("The video is not available"));
  }
}

// Generate red buttons at the bottom
function generateBottomRedButtons(boss, competitor) {
  var $main = $('.main', _$container);
  var $containerSheel = $main.parent();

  var btn1text = "View Offers";
  var btn2text = "View Inventory";
  var btn3text = "View Dealers";

  var btn1url = "http://www." + _regionName + ".buyatoyota.com/en/offers";
  var btn2url = "http://www." + _regionName + ".buyatoyota.com/en/inventory";
  var btn3url = "http://www." + _regionName + ".buyatoyota.com/en/dealers";

  var str =
    "<div class='bottom-buttons'>" +
      "<div class='button view-offers'><div>" + btn1text + "</div></div>" +
      "<div class='button view-inventory'><div>" + btn2text + "</div></div>" +
      "<div class='button find-a-dealer'><div>" + btn3text + "</div></div>" +
    "</div>";

  $containerSheel.append(str);

  // Attach listeners
  $('.bottom-buttons .view-offers').on('click', function() {
    openInNewTab(btn1url);
  });
  $('.bottom-buttons .view-inventory').on('click', function() {
    openInNewTab(btn2url);
  });
  $('.bottom-buttons .find-a-dealer').on('click', function() {
    openInNewTab(btn3url);
  });
}

function generateVideoSection(videoUrl, callback) {

  // Build HTML
  var str =
    "<div id='kbb-video-player'>" +
      "<video width='900px' class='video-js' controls preload='auto'>" +
        "<source src='" + videoUrl + "' type='video/mp4'>" +
        "<p class='js-no-js'>" +
          "To view this video please enable JavaScript, and consider upgrading to a web browser that" +
          "<a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>" +
        "</p>" +
      "</video>" +
    "</div>";

  // Append
  $(str).insertBefore($(".main"));

  // Get those guys
  var $videoTag = $('#kbb-video-player video');
  var $kbbVideoPlayer = $('#kbb-video-player');
  var vjs;

  console.log("videojs: " + typeof videojs);
  console.log("");

  // Conflicts on BAT mess up videojs globals therefore we need this strange condition
  if(typeof videojs == "object") {
    vjs = videojs.default;
  } else if (typeof videojs == "function") {
    vjs = videojs;
  } else {
    return callback(new Error());
  }

  // On load create a player
  var player = vjs($videoTag[0], { preload: 'auto' });

  // On video data
  player.on('loadedmetadata',function(){
    // Show video container
    $kbbVideoPlayer.show();
    // Play the video
    this.play();
  });

  // On player ready
  player.on('ready',function() {
    callback();
  });

}

module.exports = displayVideoContent;
