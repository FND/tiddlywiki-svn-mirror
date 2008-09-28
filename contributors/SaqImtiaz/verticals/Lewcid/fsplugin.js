window.lewcidFullScreen = false;

var lewcid_fullscreen_closeTiddler = Story.prototype.closeTiddler;
Story.prototype.closeTiddler =function(title,animate,slowly)
{
           lewcid_fullscreen_closeTiddler.apply(this,arguments);
           if (window.lewcidFullScreen == true)
              setStylesheet(" ","lewcidFullScreenStyle");
}

config.macros.goFullScreen={};
config.macros.goFullScreen.handler =  function(place,macroName,params,wikifier,paramString,tiddler)
{
      window.lewcidFullScreen = true;
      var tiddler = story.findContainingTiddler(place).getAttribute("tiddler");
      setStylesheet("#sidebar, #header, #mainMenu{display:none;} #displayArea{margin:0em 0 0 0 !important;} html {border:none;} .tiddler {display:none;} #tiddler"+tiddler+"{display:block;}","lewcidFullScreenStyle");
}


config.macros.exitFullScreen={};
config.macros.exitFullScreen.handler =  function(place,macroName,params,wikifier,paramString,tiddler)
{
    var tiddler = story.findContainingTiddler(place).getAttribute("tiddler");
    createTiddlyButton(place,params[0],"exit this guide",function(){config.options.chkSinglePageMode=true;story.displayTiddler(null,"User Guides");setStylesheet(" ","lewcidFullScreenStyle");window.lewcidFullScreen = false;});
}

//do I even need this? I think only if im going to save tiddler history.
config.macros.fsLink={};
config.macros.fsLink.handler =  function(place,macroName,params,wikifier,paramString,tiddler)
{

    createTiddlyButton(place,params[0],params[0],function(){config.options.chkSinglePageMode=false;story.displayTiddler(null,params[1]);return false;},"tiddlyLink tiddlyLinkExisting");

}

//if this approach doesnt work and we want to be able to start tutorials from any page and go back to that when saved, then save last open tiddler as tiddler histroy in button code for opening tutorial and then go back to it when closed.