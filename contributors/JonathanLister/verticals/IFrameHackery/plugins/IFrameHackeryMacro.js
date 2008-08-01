//{{{
config.macros.IFrameHackery = {
   defaultURL: "http://www.google.com",
   defaultFrom: "Lucky",
   defaultTo: "Unlucky"
};

config.macros.IFrameHackery.init = function()
{
   if(config.options.txtRemoteURL === undefined)
      config.options.txtRemoteURL = this.defaultURL;
   if(config.options.txtChangeFrom === undefined)
      config.options.txtChangeFrom = this.defaultFrom;
   if(config.options.txtChangeTo === undefined)
      config.options.txtChangeTo = this.defaultTo;
};

config.macros.IFrameHackery.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
   // get the remote page URL
   var url = config.options.txtRemoteURL;
   // get the word to change
   var from = config.options.txtChangeFrom;
   // get the word to change the target into
   var to = config.options.txtChangeTo;
   // create an iframe in place
   var ifr = new IFrame(place);
   var p = [url,from,to,ifr];
   // load the remote page and extract its HTML
   var x = doHttp("GET",url,null,null,null,null,config.macros.IFrameHackery.callback,p,null,true);
};

config.macros.IFrameHackery.callback = function(status,params,responseText,url,xhr)
{
   if(!responseText) {
	   displayMessage("Looks like there's nothing at that URL!");
	   return false;
   }
   var from = new RegExp(params[1],"img");
   var to = params[2];
   var ifr = params[3];
   var newHTML = responseText.replace(from,to);
   // have a go at fixing relative links
   newHTML = newHTML.replace(/(href|src|action)(=['\"])(?!http:\/\/)(\/)*/mg,function(match,m1,m2,m3) {
      if(!m3)
         m3 = "/";
      return m1+m2+url+m3;
   });
   // supplement this with support for @import "/blah"
   newHTML = newHTML.replace(/(@import ['\"])(\/)*/mg,function(match,m1,m2) {
      if(!m2)
         m2 = "/";
      return m1+url+m2;
   });
   // add a BASE tag to the HEAD to help with relative linking - perhaps not necessary...
   newHTML = newHTML.replace(/<head[^>]*?>/,function(match) {
      return match+"<"+"base href=\""+url+"\" />";
   });
   ifr.modify(newHTML);
};

//}}}