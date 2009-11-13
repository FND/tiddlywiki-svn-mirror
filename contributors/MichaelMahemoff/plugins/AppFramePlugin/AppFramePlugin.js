/***
|Name|AppFramePlugin|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

//################################################################################
//# CONFIGURABLE STUFF
//################################################################################

/***
!HTMLTemplate
<html>
  <head>
    <title>[[app]]</title>
    [[linkedScripts]]
    [[linkedStylesheets]]
    <script type="text/javascript">
      [[javascript]]
    </script>
    <style>[[css]]</style>
  </head>
  <body>
    [[htm]]
  </body>
</html>

!StyleSheet
.appFrame { width: 100%; height: 300px; }
.appPanel { margin: 10px 0; }
.appPanel .tiddlyLink { background: #ffe; margin-right: 5px; border: 1px solid #ffc; padding: 2px; }
.appPanel a.tiddlyLink:hover { color: #008; }
pre.component { font-size: normal; }

!The plugin
***/

(function($) {

  version.extensions.AppFramePlugin = {installed:true};

  config.macros.appFrame = {

//################################################################################
//# MACRO INITIALISATION
//################################################################################

    init: function() {
      var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
      config.shadowTiddlers["StyleSheetAppFramePlugin"] = stylesheet;
      store.addNotification("StyleSheetAppFramePlugin", refreshStyles);

      // config.shadowTiddlers["AppFramePreHTML"] = store.getTiddlerText(tiddler.title + "##StyleSheet");
      // config.shadowTiddlers["AppFramePostHTML"] = store.getTiddlerText(tiddler.title + "##StyleSheet");
    },

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var macroParams = paramString.parseParams();
      var app = getParam(macroParams, "app") || tiddler.title;

      $(place).addClass("app").append(makeAppPanel(app));
      var $iframe = $("<iframe class='appFrame' />").appendTo(place);
      setTimeout(function() { $iframe.inject(composeHTML(app)); }, 0);
    }

  };

  //################################################################################
  //# DECORATE THE FRAME
  //################################################################################

  function makeAppPanel(app, place) {
    log("making ", app);
    var $panel = $("<div class='appPanel' />");
    $.each(getComponents(app), function(i, component) {
      log("comp", component);
      createTiddlyLink($panel[0], component.title, true);
    });
    return $panel;
  }

  //################################################################################
  // COMPOSE THE HTML
  // This is the guts of the plugin. Takes the template from this very plugin,
  // and the linked scripts/stylesheets from the app tiddler; and puts it all
  // together.
  //################################################################################

  function composeHTML(app) {
    var htmlTemplate = store.getTiddlerText("AppFramePlugin##HTMLTemplate");
    var appHTML = htmlTemplate.replace("[[app]]", app);
    $.each(componentTypes, function(i, componentType) { 
      var component = store.getTiddlerText(app+"."+componentType);
      appHTML = appHTML.replace("[["+componentType+"]]", component);
    });

    var matches, linkedScripts = "";
    $.each(strip(store.getTiddlerText(app+"::linkedScripts")).split(","), function(i, script) { 
      if (script=="_jQuery_") linkedScripts+= // special value
        "<script type='text/javascript'>"+$("#jslibArea").html()+"</script>\n";
      else if (isURL(script)) linkedScripts +=
        "<script type='text/javascript' src='"+script+"'></script>\n";
      else if (matches=script.match(/\[\[(.*)\]\]/)) {
        var text = store.getTiddlerText(matches[1]);
        if (text && strip(text).length) linkedScripts +=
          "<script type='text/javascript'>\n"+text+"</script>\n";
      }
    });
    appHTML = appHTML.replace("[[linkedScripts]]", "\n"+linkedScripts+"\n");

    var linkedStylesheets = "";
    $.each(strip(store.getTiddlerText(app+"::linkedStylesheets")).split(","), function(i, stylesheet) {
      var matches;
      if (isURL(stylesheet)) {
        linkedStylesheets +=
          "<link rel='stylesheet' type='text/css' href='"+stylesheet+"'></link>";
      } else if (matches=stylesheet.match(/\[\[(.*)\]\]/)) {
        log("matches", matches);
        var text = store.getTiddlerText(matches[1]);
        if (text && strip(text).length) linkedStylesheets +=
          "<style>\n"+text+"</style>\n\n";
      }
    });
    appHTML = appHTML.replace("[[linkedStylesheets]]", "\n"+linkedStylesheets+"\n");

    return appHTML;
  }

//################################################################################
//# CHANGE PRESENTATION OF COMPONENT TIDDLERS (use <pre/> tag)
//################################################################################

  config.shadowTiddlers.ComponentViewTemplate = config.shadowTiddlers.ViewTemplate.replace(
    /<div.*class='viewer'.*<\/div>/,
    "<pre class='component' macro='view text'></pre>");

  var chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler;
  c=Story.prototype.chooseTemplateForTiddler = function(title, template) {
    var parts = title.split(".");
    var suffix = parts[parts.length-1];
    if ((!template||template==DEFAULT_VIEW_TEMPLATE)
        && parts.length>1 && componentTypes.indexOf(suffix)!=-1) {
      return "ComponentViewTemplate";
    }
    return chooseTemplateForTiddler.apply(this, arguments);
  };

//################################################################################
//# COMPONENTS
//################################################################################
//
  var componentTypes = ["htm", "css", "javascript"];
  // if i implement hierarchies, this might climb up the inheritance tree until a match is found
  function getComponents(app) {
    return $.map(componentTypes, function(componentType) {
      return store.getTiddler(app+"."+componentType);
    });
  }

//################################################################################
//# UTILS
//################################################################################

  function isURL(s) { return (/^\S+:\/\/.+/).test(s); }

  function getField(tiddler, field) {
    tiddler = store.getTiddler(tiddler)||tiddler;
    return tiddler && tiddler.fields ? tiddler.fields[field] : "";
  }

  function log() { if (console && console.log) console.log.apply(console, arguments); }
  function strip(s) { return s ? s.replace(/\s+/g, "") : ""; }

  $.fn.inject = function(content) {
    return $(this).filter("iframe").each(function() {
      var doc = this.contentDocument || this.document || this.contentWindow.document;
      doc.open();
      doc.writeln(content);
      doc.close();
    });
  };

})(jQuery);
/*}}}*/
