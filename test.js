var tele = require("./teledocumentales");
var fs = require("fs");

if(process.argv[2] != null){
  tele.get_iframe_url(process.argv[2], function(url){
    console.log(url);
  });
}else{
  var videos = [];
  for(i = 0;i<169;i++){
    tele.fetch_page("http://www.teledocumentales.com/page/"+i+"/", function(video){
      var str = JSON.stringify(video.attributes);
      fs.writeFile("videos/" + video.attributes.url, str, function(err){
        console.log("err writing: "+video.attributes.url+". "+err);
      });
    });
  }
}

