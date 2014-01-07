var html = require("./html");
var documentary = require("./documentary");
var Video = require("./video");
var Encoder = require('node-html-encoder').Encoder;

var encoder = new Encoder('entity');

exports.fetch_all = function(){
  
}

function fetch_page(page_url, callback){
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

      if(line.match(/<h3>/)){
        h3_started = true;
        continue;
      }

      if(videos_section_started && h3_started && line.match(/<a href=/)){
        urls.push( line.match(/<a href="(.*)">/)[1] );
        h3_started = false;
      }

      if(line.match(/<div id="derecha">/)){
        break;
      }
    }

    // callback(urls);
    urls.forEach(function(url){
      get_iframe_url(url, callback);
    });

  });
}
exports.fetch_page = fetch_page;

function get_iframe_url(url, callback){
  get_embed_iframe_url(url, function(video, embed_url){
    video.setUrl(embed_url);
    callback(video);

    /*get_iframe_by_provider(embed_url, function(final_url){
      video.setUrl(final_url);
      callback(video);
    });*/
  });
};
exports.get_iframe_url = get_iframe_url; 

function get_embed_iframe_url(url, callback){
  html.download(url, function(txt){
    // console.log(url);
    var attributes = get_attributes_from_text(txt);

    var video = new Video(attributes);
    video.attributes.title = txt.match(/<h1><span class="flecha">&raquo;<\/span> (.*)<\/h1>/)[1];
    if(txt.match(/end navigation -->\s+<iframe.*src=["'](\S+)["']/)){
      var match = txt.match(/end navigation -->\s+<iframe.*src=["'](\S+)["']/);
      callback(video, match[1]);
    }else if(txt.match(/end navigation -->\s+<iframe.*src=.(.*).><\/iframe>/)){
      var match = txt.match(/end navigation -->\s+<iframe.*src=.(.*).><\/iframe>/);
      callback(video, match[1]);
    }else if(txt.match(/end navigation -->\s+<div id="mediaspace">Reproductor Flash<\/div>/)){
      var match = txt.match(/so.addVariable\('playlistfile','(.*)'\);/);
      callback(video, match[1]);
    }else if(txt.match(/end navigation -->\s+<\/div><!--Box-->/)){
    }else if(txt.match(/end navigation -->\s+<script src="http:\/\/player.ooyala.com\/player.js?/)){
    }else if(txt.match(/end navigation -->\s+<embed id=VideoPlayback src=http:\/\/video.google.com\/googleplayer/)){
    }else if(txt.match(/<embed id=VideoPlayback src=http:\/\/video.google.es/)){
    }else if(txt.match(/<object width="650" height="380"><param name="movie" value="http:\/\/www.dailymotion.com\/swf/)){
    }else if(txt.match(/<object width="650" height="380"><param name="movie" value="http:\/\/tu.tv\/tutvw/)){
    }else if(txt.match(/<object width="650" height="380"><param name="movie" value="http:\/\/www.megavideo.com/)){
    }else{
      // var tag = txt.match(/end navigation -->\s+<(.*)>(.*)<\/(.*)/);
      // throw new Error("unkown error. " + url + " - " + tag[2]);
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
      if(line != "<div>"){
        sinopsis += line + "\n";
      }
    }else if(line.match(/<strong>(.*):\s*<\/strong>(.*)/)){
      // console.log(line);
      var match = line.match(/<strong>(.*):\s*<\/strong>(.*)/);
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
