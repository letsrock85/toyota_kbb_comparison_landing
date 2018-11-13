var $ = require("jquery");

// My modules
var displayKelleyBlueBookContent = require("./kbb/displayKelleyBlueBookContent");
var displayVideoContent = require("./video/displayVideoContent");
var loadBodyHtml = require('./loadBodyHtml');

// Custom wraper for a jquery plugin
require('./jquery-easing')($);

// Root folder at TCAA ftp
var TCAA_ROOT_FOLDER = "https://services.serving-sys.com/custprojassets/prd/features/static/0368b9e.netsolvps.com";
var TCAA_APP_FODLER = "se/kbb_landing";
var TCAA_DATA_FODLER = "se/kbb_automation_app/output";
// Path to HTML views
var KELLEY_BLUE_BOOK_VIEW = "views/kelley-blue-book.html";
var VIDEO_VIEW = "views/video.html";
var EDMUNDS_VIEW = "views/edmunds.html";
var DEFAULT_VIEW = "views/default.html";
// Main container name
var CONTAINER_ID = "kkb_landing_main_container";
// Live or Prod
var IS_STAGING = false;

// Global variables
var _$container;
var _isLocalHost;
var _regionName;
var _regionKey;

// On DOM init
$(function() {

  console.info("Version: 3.0.5");
  console.log("");

  // Get environment
  var environment = getEnv(window.location.href);

  // To update some HTML on BAT
  updateBatStyle(environment);

  // Fill globals
  _isLocalHost = environment.isLocalHost;
  _regionName = environment.name;
  _regionKey = environment.key;
  _$container = $("#" + CONTAINER_ID);

  // Debug
  // _isLocalHost = false;

  _$container.html("");

  // Check for being undefined
  if(!_$container.length) return console.error("Can not find container");

  var pathToDataFile = getDataFileUrl(_regionKey, _isLocalHost);

  console.log("Path to the data file: " + pathToDataFile);
  console.log("");

  getDataFile(pathToDataFile, function(err, data) {
    if(err) return triggerErrorState(err);

    var qs;
    var isRandom = getParameterByName("random");

    if(isRandom) {
      findRadomData(data, function(err, result) {
        if(err) return triggerErrorState(err);
        parseData(result);
      });
      return;
    }

    try {
      // Get url params and prepare series object to compare
      qs = getUrlParams();
    } catch (e) {
      return triggerErrorState(e);
    }

    findData(qs, data, function(err, result) {
      if(err) return triggerErrorState(err);
      parseData(result);
    });

  });

});

// Get environment data
function getEnv(url) {
  var NE = "newengland";
  var CN = "cincinnati";
  var WW = "westernwashington";
  var LOCAL = "localhost";
  var res;

  if(url.indexOf(NE) >= 0) {
    res = { key: "ne", name: NE };
  } else if (url.indexOf(CN) >= 0) {
    res = { key: "cn", name: CN };
  } else if (url.indexOf(WW) >= 0) {
    res = { key: "ww", name: WW };
  } else if (url.indexOf(LOCAL) >= 0) {
    res = { key: "ne", name: NE, isLocalHost: true };
  } else {
    res = { key: "ne", name: NE };
  }

  return res;
}

// URL parser
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  var name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  var val = results[2].replace(/\+/g, " ");
  try {
    val = decodeURIComponent(val);
  } catch (e) {
    console.warn(e);
  } finally {
    return val;
  }
}

// To update BAT styles
function updateBatStyle(environment) {
  $('.ts-row').css('max-width', 'none');
  //To remove BAT logo
  if(environment.key == "ne") {
      $('#site-logo').hide();
  }
}

function getDataFile(url, callback) {
  $.getJSON(url).done(function(data) {
    callback(null, data);
  }).fail(function(data) {
    callback(new Error("Cannnot fetch the data file"))
  });
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

// Find applicable data
function getDataType(data, callback) {
  var errors = [];
  if(data.kbb.error || isEmpty(data.kbb)) {
    errors.push(data.kbb.error);
    if(data.video.error || isEmpty(data.video)) {
      errors.push(data.video.error);
      var message = errors.reduce(function(prev, curr) {
        return prev + ". " + curr;
      });
      callback(new Error(message));
    } else {
      callback(null, null, true);
    }
  } else {
    callback(null, true);
  }
}

function getUrlParams() {
  // Get boss model
  var boss = getParameterByName('series');
  // Get competitor string
  var competitor = getParameterByName('competitor');

  // If Boss or competitor is undefined throw an error
  if (!boss) throw new Error("Boss model is not found in URL");
  if (!competitor) throw new Error("Competitor model is not found in URL");

  console.info("URL params are OK");
  console.log("\n");

  var qs = boss + "&competitor=" + competitor;

  return qs;
}

function findRadomData(array, callback) {
  var obj = array[getRandomIntInclusive(0, array.length)];

  if(!obj) return callback(new Error("No data for a random match"));

  callback(null, obj);
}

function findData(qs, array, callback) {

  function serialize(str) {
    return str.toLowerCase();
  }

  var res = array.filter(function(item) {
    return serialize(item.queryStringValue) === serialize(qs);
  });

  if(!res.length) return callback(new Error("The given query string could not be found in the data file"));
  if(res.length > 1) {
    console.warn("More than 1 valid result in the data file");
    console.log("");
  }

  var data = res[0];

  if(!data) return callback(new Error("No data found"));

  if(data.kbb.errors) return callback(new Error("The result has errors"));

  callback(null, data);
}

function triggerErrorState(err) {

  var error;

  try {
    err.message;
    error = err;
  } catch (e) {
    error = {};
    error.message = "undefined";
  }

  var url = getBodyHtmlUrl(DEFAULT_VIEW, _isLocalHost);

  console.error("Error. " + error.message);
  console.log("\n");

  loadBodyHtml(url, _$container, function(err) {
    if(err) return console.error(err.message);
    $('.error-log', _$container).show();
    $('.error-log', _$container).text("Error. " + error.message);
  });

}

/*
TCAA_ROOT_FOLDER = "https://services.serving-sys.com/custprojassets/prd/features/static/0368b9e.netsolvps.com";
TCAA_APP_FODLER = "se/kbb_landing";
TCAA_DATA_FODLER = "se/kbb_automation_app/output";
KELLEY_BLUE_BOOK_VIEW = "views/kelley-blue-book.html";
VIDEO_VIEW = "views/video.html";
EDMUNDS_VIEW = "views/edmunds.html";
DEFAULT_VIEW = "views/default.html";
*/

function getBodyHtmlUrl(view, isLocalHost) {
  if(isLocalHost) {
    return window.location.origin + "/" + view;
  } else {
    return TCAA_ROOT_FOLDER + "/" + TCAA_APP_FODLER + "/" + view;
  }
}

function getDataFileUrl(region, isLocalHost) {
  if(isLocalHost) {
    return window.location.origin + "/local/data.dev.json";
  } else {
    return TCAA_ROOT_FOLDER + "/" + TCAA_DATA_FODLER + "/" + region + "/" + "data" + (IS_STAGING ? ".staging" : "") + ".json";
  }
}

function parseData(data) {

  try {
    if(!data.hasOwnProperty("kbb")) throw new Error();
    if(!data.hasOwnProperty("video")) throw new Error();
  } catch (e) {
    return triggerErrorState(new Error("Invalid data file"));
  }

  getDataType(data, function(err, isKbb, isVideo) {
    if(err) return triggerErrorState(err);

    var url;
    var foo;

    if(isKbb) {
      url = getBodyHtmlUrl(KELLEY_BLUE_BOOK_VIEW, _isLocalHost);
      foo = displayKelleyBlueBookContent;
    } else if(isVideo) {
      url = getBodyHtmlUrl(VIDEO_VIEW, _isLocalHost);
      foo = displayVideoContent;
    } else {
      return triggerErrorState(new Error("Critical error occured"));
    }

    foo(data, url, _$container, _regionKey, _regionName, _isLocalHost, function(err) {
      if(err) return triggerErrorState(err);

      console.info("Done");
    });

  });
}

function getRandomIntInclusive(min, max) {
  var min = Math.ceil(min);
  var max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
