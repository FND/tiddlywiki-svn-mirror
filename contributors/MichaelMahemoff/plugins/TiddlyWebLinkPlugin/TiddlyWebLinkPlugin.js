/*
  TiddlyWebLinkPlugin

*/

/***
|Name|TiddlyWebLinkPlugin|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

(function() { 
  
  if(version.extensions.TiddlyWebLinkPlugin) {
    version.extensions.TiddlyWebLinkPlugin = {installed:true}; return;
  }

  $ = jQuery;

  config.macros.tiddlyWebLink = {

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {

      var macroParams = paramString.parseParams();
      var bag = getParam(macroParams, "bag");
      var message = getParam(macroParams, message) || (bag+" feed");
      var contentType = getParam(macroParams, message) || "atom";
      var link = "/bags/" + bag + "/tiddlers" + contentType;

      $("<a href='"+link+"' />")
      .html(message)
      .appendTo(place);

    }

  }

})(); // end of 'install only once'
