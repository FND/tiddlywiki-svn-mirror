(function() {

if (!version.extensions.InclusifierPlugin) {

  var plugin = version.extensions.InclusifierPlugin = {installed:true};

  plugin.getTiddlersForShow = function(trailTiddler) {
    return ["Introduction", "Background", "The Gettysburg Address"];
    var trailText = store.getTiddlerText(trailTiddler);
    var resources = version.extensions.TrailsPlugin.flattenTree(trailText);
    return resources;
  }

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
          .change(function() {
            // store.setTiddlerTag(tiddler.title,! $(this).attr("checked"),"noShow");
            saveTiddler(tiddler);
          })
          .insertBefore($(this));
      });
    }

  };

  function saveTiddler(tiddler) {
    var tiddler = (typeof(tiddler)=="string") ? store.getTiddler(tiddler) : tiddler; 
    store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier, tiddler.modified, tiddler.tags, mergeReadOnly(config.defaultCustomFields, tiddler.fields), false, tiddler.created)
  }

  function mergeReadOnly(first, second) {
    var merged = {};
    for (var field in first) { merged[field] = first[field]; }
    for (var field in second) { merged[field] = second[field]; }
    return merged;
  }

/***
!InclusifierStyleSheet
.inclusifier li { list-style-type: none; }
!(end of StyleSheet)
***/

}

})();

