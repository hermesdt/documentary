var html = require("./html");

exports.get_iframe_url = function(url, callback){
  html.download(url, function(txt){
    var embed_iframe_url = extract_embed_iframe_url_from_text(txt);
    get_iframe_from_embed_url(embed_iframe_url, callback);
  });
}

function extract_embed_iframe_url_from_text(txt){
  var regexp = /<div id="content" role="main">\s+<iframe src=.(.*). frameborder/;
  var match = txt.match(regexp);
  if(match == null){
    console.log("[ERROR - extract_embed_iframe_url] iframe not found");
  }else{
    return match[1];
  }
}


function get_iframe_from_embed_url(url, callback){
  html.download(url, function(txt){
    var orig_url = extract_orig_iframe_url_from_text(txt);
    callback(orig_url);
  });
}
exports.get_iframe_from_embed_url = get_iframe_from_embed_url; 

function extract_orig_iframe_url_from_text(txt){
  var regexp = /<iframe.*src=.(.*). frame/;
  var match = txt.match(regexp);
  if(match == null){
    console.log("[ERROR - extract_orig_iframe_url] iframe not found");
  }else{
    return match[1];
  }
}
