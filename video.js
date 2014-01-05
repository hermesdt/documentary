module.exports = function (attributes){
  this.attributes = attributes;


  this.setUrl = function(url){
    this.attributes.url = url;
  };
}
