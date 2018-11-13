
function loadBodyHtml(url, $container, callback) {
  $container.empty();
  $container.load(url, function(response, status, xhr) {
    if(status === "error") return callback(new Error("Cannot load " + url + " file"));
    return callback(null);
  });
}

module.exports = loadBodyHtml;
