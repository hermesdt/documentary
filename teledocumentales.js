var html = require("./html");
var documentary = require("./documentary");
var Video = require("./video");
var Encoder = require('node-html-encoder').Encoder;

var encoder = new Encoder('entity');

exports.fetch_all = function(){
  
}

function fetch_page(page_url){
  html.download(page_url, function(txt){
    var lines = txt.split("\n");
    var videos_section_started = false;
    var h3_started = false;
    var urls = [];

    for(i = 0;i<lines.length;i++){
      var line = lines[i];
      if(line.match(/<div id="izquierda">/)){
        videos_section_started = true;
        continue;
      }

      if(line.match(/<h3>/){
        h3_started = true;
        continue;
      }

      if(videos_section_started && h3_started && line.match(/<a href=/)){
        var href = line.match(//);
      }
    }
  });
}

exports.get_iframe_url = function(url, callback){
  get_embed_iframe_url(url, function(video, embed_url){
    video.setUrl(embed_url);
    callback(video);

    /*get_iframe_by_provider(embed_url, function(final_url){
      video.setUrl(final_url);
      callback(video);
    });*/
  });
};

function get_embed_iframe_url(url, callback){
  html.download(url, function(txt){
    var attributes = get_attributes_from_text(txt);
    var video = new Video(attributes);
    video.attributes.title = txt.match(/<h1><span class="flecha">&raquo;<\/span> (.*)<\/h1>/)[1];
    if(txt.match(/end navigation -->\s+<iframe.*src=.(.*). frameborder/)){
      var match = txt.match(/end navigation -->\s+<iframe.*src=.(.*). frameborder/);
      callback(video, match[1]);
    }else if(txt.match(/end navigation -->\s+<div id="mediaspace">Reproductor Flash<\/div>/)){
      var match = txt.match(/so.addVariable\('playlistfile','(.*)'\);/);
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
  txt = txt.replace(/<br\s*\/>/, "");
  txt = txt.replace(/<p>/g, "").replace(/<\/p>/g, "");

  var lines = txt.match(/id="informax">([\s\S]*)<\/div>\s+<\/div>\s+<\/div>\s+<div style="clear:both">/)[1].split("\n");
  var readingSinopsis = false;
  var sinopsis = "";
  lines.forEach(function(line){
    if(readingSinopsis && line.match("<strong>")){
      readingSinopsis = false;
      sinopsis = sinopsis.replace("<div>", "");
      attributes["Sinopsis"] = sinopsis;
    }

    if(readingSinopsis){
      // sinopsis += line.match(/<p>(.*)(<\/p>)?/)[1] + "\n";
      sinopsis += line + "\n";
    }else if(line.match("<strong>")){
      var match = line.match(/<strong>(.*): <\/strong>(.*)/);
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
