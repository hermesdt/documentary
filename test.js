var tele = require("./teledocumentales");
tele.get_iframe_url(process.argv[2], function(url){
  console.log(url);
});
