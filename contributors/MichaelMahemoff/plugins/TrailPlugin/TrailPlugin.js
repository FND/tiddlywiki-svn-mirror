/*
  TrailsPlugin
*/

/***
|Name|TrailsPlugin|
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
if(!version.extensions.TrailsPlugin) {
  version.extensions.TrailsPlugin = {installed:true};

  var $ = jQuery;

  var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
  if (stylesheet) { // check necessary because it happens more than once for some reason
    config.shadowTiddlers["StyleSheetTrailPlugin"] = stylesheet;
    store.addNotification("StyleSheetTrailPlugin", refreshStyles);
  }

  var macro = config.macros.trail = {

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      console.log(store.getTiddler(params[0]));
      var trail = eval("(" + store.getTiddler(params[0]).text + ")");
      var resourcesEl = $("<div class='trail' />").appendTo(place);
      renderResources(resourcesEl, trail.resources, 1);
    }

  };

  function renderResources(resourcesEl, resources, level) {
    $.each(resources, function(i, resource) {
      console.log("resourcesEl", resourcesEl);
      var resourceEl = $("<div class='resource'/>")
        .append(renderResource(resource))
        .appendTo(resourcesEl);
      renderResources(resourceEl, resource.resources, level+1);
      console.log("done");
    });
  }

  function renderResource(resource) {
    var label = resource.title || resource.url.replace(/^#/, "");
    if (resource.url[0]=="#") {
      return $(createTiddlyLink(null, resource.url.substr(1))).html(label);
    }
  }

} // end of 'install only once'
})();

/***
!StyleSheet
#mainMenu { text-align: left; }
.trail div.resource { margin-left: 10px; }
!(end of StyleSheet)
***/

/*}}}*/
