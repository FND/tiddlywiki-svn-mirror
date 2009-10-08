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

var $ = jQuery;

/*{{{*/
(function() {
if(!version.extensions.TrailsPlugin) {
  var plugin = version.extensions.TrailsPlugin = {installed:true};

  var $ = jQuery;
  jQuery.fn.attach = function(html) { return this.append(html).children(":last"); };

  var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
  if (stylesheet) { // check necessary because it happens more than once for some reason
    config.shadowTiddlers["StyleSheetTrailPlugin"] = stylesheet;
    store.addNotification("StyleSheetTrailPlugin", refreshStyles);
  }

  var macro = config.macros.trail = {

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      // var trail = eval("(" + store.getTiddler(params[0]).text + ")");
      var trail = plugin.parseTrailTiddler(store.getTiddlerText(params[0]));
      
      var container = $("<div id='trailContainer'/>").appendTo(place);
      resourcesEl = $("<ul id='trail' class='trail' />").appendTo(container);

      plugin.renderResources(resourcesEl, trail.resources);
      resourcesEl.NestedSortable({
        accept: "resource",
        opacity: 0.8,
        autoScroll: true,
        helperclass: 'helper', 
        handle: '.resourceLabel',
        // onHover: function() { $("body").css("background","pink"); console.log("hover"); },
        // onStart: function() { console.log("start"); },
        // onStop: function() { console.log("stop"); },
        // onChange: function(serialized) { alert("done"); }
        noNestingClass: "no-nesting",
        // noNestingClass: "no-nesting",
        // onChange: function(serialized) { console.log("done", serialized); }
      });

      $(".resourceLabel").hover(
        function() {
          $(this).addClass("draggableOn");
        }, 
        function() {
          $(this).removeClass("draggableOn");
        }
      );

    }

  };

  plugin.parseTrailTiddler = function(trailText) {
    // var matches = trailText.match(/^(\*)+\s*(\s\S)*?/g)
    // console.log(trailText);
    var trail = {url:"#", resources:[]};
    // var lines = trailText.match(/^\s*\*+ .+$/gm)
    var lines = trailText.match(/^\s*\*+\s*.*$/gm);
    var lastLevel = 0;
    var lastResource = trail;
    $.each(lines, function(i,line) {
      var line = line.replace(/[\[\]]/g, "");
      var matches = line.match(/^\s*(\*+) (.*?)\s*$/);
      var level = matches[1].length;
      var tiddlerTitle = matches[2];
      var daddy;
      if (level<lastLevel) daddy = lastResource.daddy.daddy;
      else if (level==lastLevel) daddy = lastResource.daddy;
      else if (level>lastLevel) daddy = lastResource;
      // if (!daddy.resources) daddy.resources = [];
      daddy.resources.push(lastResource = {url: "#"+tiddlerTitle, daddy: daddy, resources: [], level:level});
      lastLevel = level;
    });
    // console.log("trail", trail);
    return trail;
  }

  var count=0;
  plugin.renderResources = function(resourcesEl, resources) {
    if (!resources.length) return;
    var ul = $("<ul id=ul'"+(count++)+"'>").appendTo(resourcesEl);
    $.each(resources, function(i, resource) {
      var resourceEl = $("<li id=resource"+(count++) + " class='resource'/>")
        .data("resource", resource)
        // .append("<span class='handle'>handle</span>")
        .append($("<div class='resourceLabel' />").append(renderResource(resource)))
        .appendTo(ul);
      plugin.renderResources(resourceEl, resource.resources);
    });
  };

  plugin.flattenTreeByTiddler = function(trailTiddler) {
    // var trail = eval("("+store.getTiddlerText(trailTiddler)+")");
    var trail = plugin.parseTrailTiddler(store.getTiddlerText(trailTiddler));
    return plugin.flattenTree(trail);
  };

  plugin.flattenTree = function(trail) {
    // console.log("flatten", arguments);
    var resource = trail; // better internal name
    var resourcesSoFar = arguments[1] || []; // hide it from signature
    resourcesSoFar.push(resource.url);
    $.each(resource.resources, function(i, child) {
      resourcesSoFar=resourcesSoFar.concat(plugin.flattenTree(child));
    });
    return resourcesSoFar;
  };

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
