(function() {

if (!version.extensions.InclusifierPlugin) {

  var plugin = version.extensions.InclusifierPlugin = {installed:true};

  plugin.getTiddlersForShow = function(trailTiddler) {
    // var trailText = store.getTiddlerText(trailTiddler);
    // console.log("trailText", trailText);
    var showTiddlers = [];
    $.each(version.extensions.TrailsPlugin.flattenTreeByTiddler(trailTiddler),
           function(i,resource) {
      console.log(resource);
      var tiddlerTitle = resource.substr(1);
      var tiddler = store.getTiddler(tiddlerTitle);
      if (tiddler && !tiddler.isTagged("noShow")) {
        showTiddlers.push(tiddler.title);
      }
    });
    return showTiddlers;
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
        var tiddlerTitle = $(this).attr("tiddlylink")
        var tiddler = store.getTiddler(tiddlerTitle);
        var checkbox = 
          $("<input type='checkbox' />")
          .attr("checked", tiddler && !tiddler.isTagged("noShow"))
          .change(function() {
            var tiddler = store.getTiddler(tiddlerTitle); // load again in case changed
            if (tiddler) {
              store.setTiddlerTag(tiddler.title,! $(this).attr("checked"),"noShow");
              saveTiddler(tiddler);
            }
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
.inclusifier { text-align: left; }
.inclusifier li { list-style-type: none; }
!(end of StyleSheet)
***/

}

})();
