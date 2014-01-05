var html = require("./html");
var documentary = require("./documentary");
var Video = require("./video");
var Encoder = require('node-html-encoder').Encoder;

var encoder = new Encoder('entity');

exports.get_iframe_url = function(url, callback){
  get_embed_iframe_url(url, function(video, embed_url){
    get_iframe_by_provider(embed_url, function(final_url){
      video.setUrl(final_url);
      callback(video);
    });
  });
};

function get_embed_iframe_url(url, callback){
  html.download(url, function(txt){
    var regexp = /end navigation -->\s+<iframe.*src=.(.*). frameborder/;
    var match = txt.match(regexp);
    if(match != null){
      var attributes = get_attributes_from_text(txt);
      var video = new Video(attributes);

      callback(video, match[1]);
    }else{
      var tag = txt.match(/end navigation -->\s+<(.*)>(.*)<\/(.*)/);
      throw new Error("unkown error. " + url + " - " + tag[2]);
    }
  });
}

function get_attributes_from_text(txt){
  var attributes = {};
  var txt = encoder.htmlDecode(txt);

  var lines = txt.match(/id="informax">([\s\S]*)<\/div>\s+<\/div>\s+<\/div>\s+<div style="clear:both">/)[1].split("\n");
  var readingSinopsis = false;
  var sinopsis = "";
  lines.forEach(function(line){
    if(readingSinopsis && line.match("<strong>")){
      readingSinopsis = false;
      attributes["Sinopsis"] = sinopsis;
    }

    if(readingSinopsis && line.match("<p>")){
      sinopsis += line.match(/<p>(.*)<\/p>/)[1] + "\n";
    }else if(line.match("<strong>")){
      var match = line.match(/<strong>(.*): <\/strong>(.*)<\/p>/);
      if(match[1] != "Visitas" && match[1] != "Fuente")
        if(match[1] == "Sinopsis")
          readingSinopsis = true;
        else if(match[1] == "Etiquetas"){
          var tagsTokens = match[2].split(",");
          var tags = [];
          tagsTokens.forEach(function(tagToken){
            tags.push(tagToken.match(/<a.*>(.*)<\/a>/)[1]);
          });

          attributes["Etiquetas"] = tags;
        }else
          attributes[match[1]] = match[2];
    }
  });

  return attributes;
}

function get_iframe_by_provider(provider_url, callback){
  if(provider_url.match(/http:\/\/documentary/)){
    documentary.get_iframe_from_embed_url(provider_url, callback);
  }else{
    throw new Error("unkown source: " + provider_url);
  }
}
