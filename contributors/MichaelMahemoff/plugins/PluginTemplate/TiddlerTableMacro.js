/*
  Tiddler Table Macro

*/

/***
|Name|TiddlerTableMacro|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

  version.extensions.TiddlerTableMacro = {installed:true};

  var macro = config.macros.comments = {

  //################################################################################
  //# MACRO INITIALISATION
  //################################################################################

  init: function() {
    var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
    config.shadowTiddlers["StyleSheetTiddlerTableMacro"] = stylesheet;
    store.addNotification("StyleSheetTiddlerTableMacro", refreshStyles);
  },

  handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    var macroParams = paramString.parseParams();
    macro.buildCommentsArea(tiddler, place, macroParams);
    macro.refreshComments(story.getTiddler(tiddler.title).commentsEl, tiddler, macroParams);
    var tiddler = getParam(macroParams, "tiddler") || tiddler;
  }

  //################################################################################
  //# MORE ...
  //################################################################################

}

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!StyleSheet

!(end of StyleSheet)

***/

/*}}}*/
