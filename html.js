var http = require('http');
var URL = require('url');

function download(url, callback){
  var url_params = URL.parse(url);
  var options = {
    host: url_params.host,
    path: url_params.path,
    port: '80'
  };

  // console.log("[GET_CONTENT] " + url);
  var request = http.get(options, function(res) {
    var str = "";
    res.on("data", function(chunk) {
      str += chunk;
    });

    res.on("end", function(a){
      callback(str);
    });
  });

  request.on("error", function(err){
    console.error("error downloading: "+url+". Trying again");
    download(url, callback);
  });
}
exports.download = download;
