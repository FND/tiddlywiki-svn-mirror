(function() {

  var stylesheet = store.getTiddlerText(tiddler.title + "##InclusifierStyleSheet");
  if (stylesheet) { // check necessary because it happens more than once for some reason
    config.shadowTiddlers["InclusifierStyleSheet"] = stylesheet;
    store.addNotification("InclusifierStyleSheet", refreshStyles);
  }

  config.macros.inclusifier = {

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var trailText = store.getTiddlerText(params[0]);
      var trail = version.extensions.TrailsPlugin.parseTrailTiddler(trailText);
      trailEl = $("<ul class='inclusifier'/>").appendTo(place);
      version.extensions.TrailsPlugin.renderResources(trailEl, trail.resources);
      $("a", trailEl).each(function() {
        var tiddler = store.getTiddler($(this).attr("tiddlylink"));
        var checkbox = 
          $("<input type='checkbox' />")
          .attr("checked", !tiddler.isTagged("noShow"))
          .insertBefore($(this));
      });
    }

  };

})();


/***
!InclusifierStyleSheet
.inclusifier li { list-style-type: none; }
!(end of StyleSheet)
***/

