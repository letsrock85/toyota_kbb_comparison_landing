var videojs = require('video.js');
var $ = require("jquery");

// My modules
var loadImg = require("../utils/utils").loadImg;
var redirect = require("../utils/utils").redirect;
var openInNewTab = require("../utils/utils").openInNewTab;
var loadBodyHtml = require("../loadBodyHtml");

var _$container;
var _isLocalHost;
var _regionName;
var _regionKey;

function displayKelleyBlueBookContent(data, bodyUrl, $container, regionKey, regionName, isLocalHost, callback) {

  // Set globals
  _$container = $container;
  _isLocalHost = isLocalHost;
  _regionName = regionName;
  _regionKey = regionKey;

  // Get body HTML code
  loadBodyHtml(bodyUrl, _$container, function(err) {
    if(err) return callback(err);

    // Extract data from the data file
    score(data, function(err, fireFunc) {
      if(err) return callback(err);

      try {
        // Generate HTML and display data
        display(data.bossImageUrl,
                data.kbb.boss,
                data.competitorImageUrl,
                data.kbb.competitor,
                fireFunc,
                data.video.url);
      } catch (e) {
        return callback(e);
      }

      callback(null);
    });
  });

}

function executeOldIntCode() {
  // ???
  $('a.sprite-moremob', _$container).click(function() {
    var $parent = $(this).parent();
    var $popuper = $('.popuper', $parent);
    $popuper.fadeIn(500);
    $("body").append("<div id='kbb-overlay'></div>");
    $('#kbb-overlay').show().css({
      'filter': 'alpha(opacity=80)'
    });
    return false;
  });

  $('a.sprite-close', _$container).click(function() {
    $(this).parent().fadeOut(100);
    $('#kbb-overlay').remove('#kbb-overlay');
    return false;
  });

  var showChar = 0;

  var MORE_TEXT = "More info";
  var LESS_TEXT = "Less";

  // ???
  $('.more').each(function() {
    var content = $(this).html();

    var $parent = $(this).parent();

    var $ratetitle = $('.ratetitle', $parent);
    var $rates = $ratetitle.parent();

    $rates.addClass('has-more-link');

    $ratetitle.append('<div class="sprite sprite-shadow"></div>');

    if (content.length > showChar) {
      var c = content.substr(0, showChar);
      var h = content.substr(showChar, content.length - showChar);
      var html = c +
        '<span class="morecontent">' +
          '<div>' +
            h +
          '</div>' +
          '<a href="" class="more-link sprite sprite-morebg">' +
            MORE_TEXT +
          '</a>' +
        '</span>';
      $(this).html(html);
    }
  });

  $(".more-link").click(function() {
    var $this = $(this);

    if ($this.hasClass("sprite-lessbg")) {
      $this.removeClass("sprite-lessbg");
      $this.addClass("sprite-morebg");
      $this.html(MORE_TEXT);
    } else {
      $this.removeClass("sprite-morebg");
      $this.addClass("sprite-lessbg");
      $this.html(LESS_TEXT);
    }
    // ???
    if ($(this).parent().parent().prev().find('.ratetitle').hasClass("opened")) {
      $(this).parent().parent().prev().find('.ratetitle').removeClass("opened");
    } else {
      $(this).parent().parent().prev().find('.ratetitle').addClass("opened");
    }
    // ???
    $(this).parent().prev().toggle();
    $(this).prev().toggle();

    return false;
  });
}

// Generate red buttons at the bottom
function generateBottomRedButtons() {
  var $main = $('.main', _$container);
  var $containerSheel = $main.parent();
  var btn1text = "Click Here to get a Free Trade-in Valuation in Seconds!";
  var btn2text = "Find a Dealer";
  var btn1url = "http://www." + _regionName + ".buyatoyota.com/en/trade-in-value";
  var btn2url = "http://www." + _regionName + ".buyatoyota.com/en/dealers";

  var str =
    "<div class='bottom-buttons'>" +
      "<div class='button click-here'><div>" + btn1text + "</div></div>" +
      "<div class='button submit-a-lead'><div>" + btn2text + "</div></div>" +
    "</div>";

  $containerSheel.append(str);

  // Attach listeners
  $('.bottom-buttons .click-here').on('click', function() {
    openInNewTab(btn1url);
  });

  $('.bottom-buttons .submit-a-lead').on('click', function() {
    openInNewTab(btn2url);
  });
}


// Ready to display the data
function display(bossImageUrl, bossInfo, competitorImageUrl, competitorInfo, fireFunc, videoUrl) {
  
  // Shourtcuts
  var boss = bossInfo;
  var competitor = competitorInfo;

  // Set texts to HTML nodes
  $('.boss-series').text(boss.series);
  $('.competitor-series').text(competitor.series);

  $('.boss-year').text(boss.year);
  $('.competitor-year').text(competitor.year);

  $('.competitor-manufacturer').text(competitor.manufacturer);

  // Generate HTML
  generateHtmlComponents(videoUrl, function() {
    // Clear empty indexs
    fireFunc = fireFunc.filter(function(n){ return n != undefined });

    // Show nodes
    $('.header .title').show();
    $('.vs-block').addClass('show');
    $('.info-td').css({ opacity: 1 });

    // Moved from HTML
    executeOldIntCode();

    // If two sections add a certain class
    if(fireFunc.length > 1) {
      $('.main', _$container).addClass('two-sections');
    }

    // Fire functions
    for (var i = 0; i < fireFunc.length; i++) {
      if (!fireFunc[i]) continue;
      var foo = fireFunc[i];
      foo(i * 1500);
    }

  });

  // The images URLs are supposed to be alway fine
  loadImg(bossImageUrl, function(err, img) {
    if (err) return console.error("Boss image loading error");
    $('.car-box.car-2 .car-image-loading-icon').remove();
    $('.car-box.car-2 .car-image').append($(img));
    $('.car-box.car-2 .sprite-winner').show();
  });

  // The images URLs are supposed to be alway fine
  loadImg(competitorImageUrl, function(err, img) {
    if (err) return console.error("Competitor image loading error");
    $('.car-box.car-1 .car-image-loading-icon').remove();
    $('.car-box.car-1 .car-image').append($(img));
  });

}

function findWinningSections(boss, competitor) {
  var boss = boss.ratings;
  var competitor = competitor.ratings;
  var winningSections = {};

  for (var key in boss) {
    var val1 = boss[key];
    var val2 = competitor[key];
    if(val1 > val2) {
      winningSections[key] = {
        boss: val1,
        competitor: val2
      }
    }
  }

  return winningSections;
}

function mapConsumerData(data, details) {

  function serialize(val) {
    var str = String(val);
    return str.length == 1 ? str + ".0" : str;
  }

  var $parent = $('#kbb-consumer__title').parent();
  var $targetNode = $('#kbb-consumer__title');
  var defineParam = "consumer";

  var $value = $('#kbb-consumer__value');
  var $reliability = $('#kbb-consumer__reliability');
  var $comfort = $('#kbb-consumer__comfort');
  var $quality = $('#kbb-consumer__quality');
  var $performance = $('#kbb-consumer__performance');
  var $styling = $('#kbb-consumer__styling');

  var overall;

  try {
    overall = {
      boss: serialize(data.overall.boss),
      competitor: serialize(data.overall.competitor)
    };
  } catch (e) {
    console.warn("Cannot get overall score for Consumer");
    console.log("");
    return null;
  }

  if(data.comfort) {
    $comfort.show();
    $comfort.find('.rate.marginleft').html(serialize(data.comfort.competitor));
    $comfort.find('.rate.marginright').html(serialize(data.comfort.boss));
  }

  if(data.performance) {
    $performance.show();
    $performance.find('.rate.marginleft').html(serialize(data.performance.competitor));
    $performance.find('.rate.marginright').html(serialize(data.performance.boss));
  }

  if(data.quality) {
    $quality.show();
    $quality.find('.rate.marginleft').html(serialize(data.quality.competitor));
    $quality.find('.rate.marginright').html(serialize(data.quality.boss));
  }

  if(data.reliability) {
    $reliability.show();
    $reliability.find('.rate.marginleft').html(serialize(data.reliability.competitor));
    $reliability.find('.rate.marginright').html(serialize(data.reliability.boss));
  }

  if(data.styling) {
    $styling.show();
    $styling.find('.rate.marginleft').html(serialize(data.styling.competitor));
    $styling.find('.rate.marginright').html(serialize(data.styling.boss));
  }

  if(data.value) {
    $value.show();
    $value.find('.rate.marginleft').html(serialize(data.value.competitor));
    $value.find('.rate.marginright').html(serialize(data.value.boss));
  }

  if(details) addConsumerDetails(details, $parent);

  console.info("Consumer is good to go");
  console.log("");

  return function(delay) {
    // Show
    $parent.css({
      display: 'block'
    });
    // Create HTML representation for details
    $('.ranks', $parent).delay(delay).slideDown("slow", function() {
      // The animation is complete
      drawTitleRange($targetNode, overall.boss, overall.competitor);
      defineWinner(defineParam);
    });
  }
}

function mapExpertData(data) {

  function serialize(val) {
    var str = String(val);
    return str.length == 1 ? str + ".0" : str;
  }

  var $parent = $('#kbb-expert__title').parent();
  var $targetNode = $('#kbb-expert__title');
  var defineParam = "kbb";

  var $dynamics = $('#kbb-expert__driving');
  var $comfort = $('#kbb-expert__convenience');
  var $design = $('#kbb-expert__interior');
  var $value = $('#kbb-expert__value');

  var overall;

  try {
    overall = {
      boss: serialize(data.overall.boss),
      competitor: serialize(data.overall.competitor)
    };
  } catch (e) {
    console.warn("Cannot get overall score for Expert");
    console.log("");
    return null;
  }

  if(data.dynamics) {
    $dynamics.show();
    $dynamics.find('.rate.marginleft').html(serialize(data.dynamics.competitor));
    $dynamics.find('.rate.marginright').html(serialize(data.dynamics.boss));
  }

  if(data.comfort) {
    $comfort.show();
    $comfort.find('.rate.marginleft').html(serialize(data.comfort.competitor));
    $comfort.find('.rate.marginright').html(serialize(data.comfort.boss));
  }

  if(data.design) {
    $design.show();
    $design.find('.rate.marginleft').html(serialize(data.design.competitor));
    $design.find('.rate.marginright').html(serialize(data.design.boss));
  }

  if(data.value) {
    $value.show();
    $value.find('.rate.marginleft').html(serialize(data.value.competitor));
    $value.find('.rate.marginright').html(serialize(data.value.boss));
  }

  console.info("Expert is good to go");
  console.log("");

  return function(delay) {
    // Show
    $parent.css({
      display: 'block'
    });
    // Create HTML representation for details
    $('.ranks', $parent).delay(delay).slideDown("slow", function() {
      // The animation is complete
      drawTitleRange($targetNode, overall.boss, overall.competitor);
      defineWinner(defineParam);
    });
  }
}

function addConsumerDetails(details, $parent) {

  function isRange(num1, num2) {
    var num1 = parseInt(num1);
    var num2 = parseInt(num2);
    if(num1 === num2) {
      return String(num1);
    } else {
      return String(num1 + ' - ' + num2);
    }
  }

  var str =
    '<div class="details">' +
      '<div class="col-1">Based on ' + details.competitor.numberOfRatings + ' Ratings for the ' + isRange(details.competitor.generationStart, details.competitor.generationEnd) + ' models</div>' +
      '<div class="col-2">Based on ' + details.boss.numberOfRatings + ' Ratings for the ' + isRange(details.boss.generationStart, details.boss.generationEnd) + ' models</div>' +
    '</div>';

  $parent.append(str);
}

function generateMobileButtonsMore() {
  // For each node which is a .more class
  $(".more", _$container).each(function() {
    var $elem = $(this);
    // Get text related to .more
    var moreText = $elem.text();
    // Get its parent
    var $parent = $elem.parent();
    // Get related title
    var moreTitle = $('.ratetitle', $parent).text();
    // Generate a tree of nodes
    var str =
    "<div class='moremob'>" +
      "<div class='seemob'>" +
        "<a class='sprite sprite-moremob'></a>" +
        "<div class='popuper'>" +
          "<a class='sprite sprite-close'></a>" +
          "<h2>" + moreTitle + "</h2>" +
          moreText +
        "</div>" +
      "</div>" +
    "</div>";
    // Append after .more node
    $parent.append(str);
  });
}

function generateVideoSection(videoUrl, callback) {

  var DISCLAIMER_TEXT = "Video shows most up-to-date model year comparisons. Model years may differ from the Kelley Blue Book comparison below.";

  // Build HTML
  var str =
    "<div id='kbb-video-player'>" +
      "<video width='800px' class='video-js' controls preload='auto'>" +
        "<source src='" + videoUrl + "' type='video/mp4'>" +
        "<p class='js-no-js'>" +
          "To view this video please enable JavaScript, and consider upgrading to a web browser that" +
          "<a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>" +
        "</p>" +
      "</video>" +
    "</div>" +
    "<div class='video-disclaimer'>" + DISCLAIMER_TEXT + "</div>";

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

// Generate in JS instad of pushing it as HTML on BAT
function generateHtmlComponents(videoUrl, callback) {
  generateMobileButtonsMore();
  generateBottomRedButtons();
  if(videoUrl) {
    console.info("Getting a video file...");
    console.log("");
    try {
      generateVideoSection(videoUrl, callback);
    } catch (e) {
      console.warn(e.message);
      console.log("");
      callback();
    }
  } else {
    console.info("Video is not available");
    console.log("");
    callback();
  }
}

function score(data, callback) {
  var data;
  var boss;
  var competitor;
  var consumerData;
  var expertData;
  var fireFunc = [];

  console.log(data);
  console.log("");

  try {
    data = data.kbb;
    boss = data.boss;
    competitor = data.competitor;
  } catch (e) {
    return callback(new Error("Critical error occured"));
  }

  try {
    consumerData = data.result.consumer;
  } catch (e) {
    console.log(e.message);
  }

  try {
    expertData = data.result.expert;
  } catch (e) {
    console.log(e.message);
  }

  if(!(expertData || consumerData)) return callback(new Error("Critical error occured"));

  if(expertData) {
    if(!expertData.wins) {
      console.info("Expert rating has failed");
      console.log("");
    } else {
      console.info("Got Expert data");
      console.log("");
      var expertResults = findWinningSections(expertData.boss, expertData.competitor);
      var expertFoo = mapExpertData(expertResults);
      fireFunc.push(expertFoo);
    }
  }

  if(consumerData) {
    if(!consumerData.wins) {
      console.info("Consumer rating has failed");
      console.log("");
    } else {
      console.info("Got Consumer data");
      console.log("");
      var consumerResults = findWinningSections(consumerData.boss, consumerData.competitor);
      var details = {};
      try {
        details.boss = consumerData.boss.details;
        details.competitor = consumerData.competitor.details;

        details.boss.generationEnd = details.boss.generationEnd || boss.year;
        details.competitor.generationEnd = details.boss.generationEnd || competitor.year;

        if(parseInt(details.boss.generationEnd) > parseInt(boss.year)) {
          details.boss.generationEnd = boss.year;
        }

        if(parseInt(details.competitor.generationEnd) > parseInt(competitor.year)) {
          details.competitor.generationEnd = competitor.year;
        }

        if(!details.boss.generationStart) throw new Error("No start year for Boss ratings");
        if(!details.competitor.generationStart) throw new Error("No start year for Competitor ratings");
      } catch (e) {
        console.warn(e.message);
      }
      var consumerFoo = mapConsumerData(consumerResults, details);
      fireFunc.push(consumerFoo);
    }
  }

  return callback(null, fireFunc);
}

// Move loading bars
var defineWinner = function(str) {

  var ranks = $('.ranks-' + str + ' .rates');
  var delay = 0;

  ranks.each(function() {
    var $this = $(this);
    var left = $('.rate-left', $this);
    var right = $('.rate-right', $this);
    var leftBar = $('.barwrapperleft .bar', $this);
    var rightBar = $('.barwrapperright .bar', $this);

    // Get numbers from HTML nodes
    var leftOffset = left.html();
    var rightOffset = right.html();

    rightBar.addClass('bar-winner')
            .css('width', 0)
            .delay(delay)
            .animate({
              width: rightOffset * 10 + '%'
            }, 2000, "easeInOutCubic", function() {
              $this.append('<div class="sprite sprite-smalwinner"></div>');
            });

    leftBar.addClass('bar-loser')
           .css('width', 0)
           .delay(delay)
           .animate({
             width: leftOffset * 10 + '%'
           }, 2000, "easeInOutCubic");

    delay += 100;

  });

}

// Something is happening with tilte blocks elements (expert, consumer)
// Selecing a winnner..
function drawTitleRange(el, value1, value2) {

  // value1 belongs to Boss average score
  // value belongs to competitor average score

  // Get markers from incoming el HTML node
  var $markerLeft = $('.bar-wrapper.left .marker', el);
  var $markerRight = $('.bar-wrapper.right .marker', el);

  // Get bars from incoming el HTML node
  var $barLeft = $('.bar-wrapper.left .bar', el);
  var $barRight = $('.bar-wrapper.right .bar', el);

  // Display as a sprite
  $markerLeft.addClass('sprite');
  $markerRight.addClass('sprite');

  // Add as text
  $markerLeft.html(value2);
  $markerRight.html(value1);

  // Handle as percent value
  var obj1ShitftInPercents = value1 * 10 + '%';
  var obj2ShitftInPercents = value2 * 10 + '%';

  var conf = {
    duration: 1500,
    easing: "easeOutSine"
  };

  // Move markers
  $markerLeft.animate({
    right: obj2ShitftInPercents
  }, conf);

  $markerRight.animate({
    left: obj1ShitftInPercents
  }, conf);

  // Animation of loading bars
  $barLeft.css({
            width: 0 + '%'
          })
          .addClass('bar-bg-left')
          .animate({
            width: obj2ShitftInPercents
          }, conf);

  $barRight.css({
             width: 0 + '%'
           })
           .addClass('bar-bg-right')
           .animate({
             width: obj1ShitftInPercents
           }, conf);

}


module.exports = displayKelleyBlueBookContent;
