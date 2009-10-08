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
  jQuery.fn.attach = function(html) { return this.append(html).children(":last"); };

  var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
  if (stylesheet) { // check necessary because it happens more than once for some reason
    config.shadowTiddlers["StyleSheetTrailPlugin"] = stylesheet;
    store.addNotification("StyleSheetTrailPlugin", refreshStyles);
  }

  var macro = config.macros.trail = {

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      console.log(store.getTiddler(params[0]));
      var trail = eval("(" + store.getTiddler(params[0]).text + ")");
      
      var container = $("<div id='trailContainer'/>").appendTo(place);
      resourcesEl = $("<ul id='trail' class='trail' />").appendTo(container);

      renderResources(resourcesEl, trail.resources, 1);
      resourcesEl.NestedSortable({
        accept: "resource",
        opacity: 0.8,
        autoScroll: true,
        noNestingClass: "no-nesting",
        onChange: function(serialized) { }
      });
    }

  };

  var count=0;
  function renderResources(resourcesEl, resources, level) {
    if (!resources.length) return;
    var ul = $("<ul/>").appendTo(resourcesEl);
    $.each(resources, function(i, resource) {
      console.log("resourcesEl", resourcesEl);
      var resourceEl = $("<li id=resource"+(count++) + " class='resource'/>")
        .append("<span class='handle'>handle</span>")
        .append(renderResource(resource))
        .appendTo(ul);
      renderResources(resourceEl, resource.resources, level+1);
    });
  }

  function renderResource(resource) {
    var label = resource.title || resource.url.replace(/^#/, "");
    if (resource.url[0]=="#") {
      return $(createTiddlyLink(null, resource.url.substr(1))).html(label);
    } else {
      return resource.url;
    }
  }

} // end of 'install only once'
})();

/***
!StyleSheet
#mainMenu { text-align: left; width: 800px; }
.resource { margin-left: 10px; }
ul.trail { cursor: pointer; }
ul.trail, ul.trail ul { list-style-type: none; margin-left: 5px; padding-left: 5px; }
ul.trail ul, ul.trail li { margin-left: 5px; padding-left: 5px; }
!(end of StyleSheet)
***/

/*}}}*/
