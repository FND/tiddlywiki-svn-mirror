/*
  SnapshotPlugin
*/

/***
|Name|SnapshotPlugin|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

/*{{{*/
(function() {
  if(!version.extensions.SnapshotPlugin) {

    version.extensions.SnapshotPlugin = {installed:true};

    config.macros.snapshot = {

      //################################################################################
      //# MACRO INITIALISATION
      //################################################################################

      handler: function(place,macroName,params,wikifier,paramString,tiddler) {
        createTiddlyButton(place, "snapshot", null, doSnapshot);
      }

    }

    function doSnapshot() {
      var storyTiddlers = "";
      story.forEachTiddler(function(title) {
        storyTiddlers += "[[" + title + "]]\n";
      });
      store.getTiddler("DefaultTiddlers").text = storyTiddlers;
      store.saveTiddler("DefaultTiddlers");
      autoSaveChanges(false);
    }

  }
})();
/*}}}*/
