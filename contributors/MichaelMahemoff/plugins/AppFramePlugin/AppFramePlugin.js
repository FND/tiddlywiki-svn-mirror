/***
|Name|AppFramePlugin|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Requires|jquery.app|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|
***/

//################################################################################
//# CONFIGURABLE STUFF
//################################################################################

/***
!StyleSheet
.appFrame { width: 100%; height: 400px; }
.appPanel { margin: 10px 0; }
.appPanel a.tiddlyLink { background: #ffe; margin-right: 5px; border: 1px solid #ffc; padding: 2px; }
.appPanel a.tiddlyLink:hover { color: #008; }
.appPanel span { cursor: pointer; }
pre.component { font-size: normal; }

.appSource { display: none; width: 100%; height: 400px; }

!The plugin
***/

(function($) {

  version.extensions.AppFramePlugin = {installed:true};

  var componentTiddlerTypes = ["htm", "css", "javascript"];

  config.macros.appFrame = {

//################################################################################
//# MACRO INITIALISATION
//################################################################################

    init: function() {
      var stylesheet = store.getTiddlerText("AppFramePlugin##StyleSheet");
      config.shadowTiddlers["StyleSheetAppFramePlugin"] = stylesheet;
      store.addNotification("StyleSheetAppFramePlugin", refreshStyles);
    },

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {

      var macroParams = paramString.parseParams();
      var appTiddlerTitle = getParam(macroParams, "app") || tiddler.title;
      var app = makeApp(appTiddlerTitle);
      var appHTML = app.asHTML();

      $(place).addClass("app").append(makeAppPanel(appTiddlerTitle));
      $("<pre class='appSource'/>").text(appHTML).appendTo(place);

      var $iframe = $("<iframe class='appFrame' />").appendTo(place);
      setTimeout(function() { $iframe.inject(appHTML); }, 0);

    }

  };

  function makeApp(appTiddlerTitle) {
    var app = $.app();

    $.each(strip(store.getTiddlerText(appTiddlerTitle+"::libraryScripts")).split(","), function(i, script) { 
      if (script=="_jQuery_") app.attachScripts($("#jslibArea").html().replace(/^\/\/.*/mg, ""));
      else if (isURL(script)) app.attachLinkedScripts(script);
      else if (matches=script.match(/\[\[(.*)\]\]/)) app.attachScripts(extractCode(matches[1]));
    });

    $.each(strip(store.getTiddlerText(appTiddlerTitle+"::libraryStylesheets")).split(","), function(i, stylesheet) { 
      if (isURL(stylesheet)) app.attachLinkedStylesheets(stylesheet);
      else if (matches=stylesheet.match(/\[\[(.*)\]\]/)) app.attachStylesheets(extractCode(matches[1]));
    });

    app.attachHTML("core", extractCode(appTiddlerTitle+".htm"));
    app.attachHTML("title", appTiddlerTitle);
    app.attachStylesheets(extractCode(appTiddlerTitle+".css"));
    app.attachScripts(extractCode(appTiddlerTitle+".javascript"));

    return app;
  }

  function extractCode(tiddler) {
    var text = store.getTiddlerText(tiddler) || "";
    return text.replace(/(\s\S)*\n$/, "$1");
  }

  //################################################################################
  //# DECORATE THE FRAME
  //################################################################################

  function makeAppPanel(appTiddlerTitle, place) {
    var $panel = $("<div class='appPanel' />");
    $.each(componentTiddlerTypes, function(i, componentTiddlerType) {
      createTiddlyLink($panel[0], appTiddlerTitle+"."+componentTiddlerType, true);
    });
    $("<input type='checkbox' />")
    .click(function() { $(place).find(".appSource").toggleSlide(); })
    .appendTo($panel)
    .after($("<span>view source</span>").click(function() { $(this).prev().click(); }))
    return $panel;
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
        && parts.length>1 && componentTiddlerTypes.indexOf(suffix)!=-1) {
      return "ComponentViewTemplate";
    }
    return chooseTemplateForTiddler.apply(this, arguments);
  };

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

  $.fn.toggleSlide = function() {
    $(this).css("display")=="none" ? $(this).slideDown() : $(this).slideUp();
  }

})(jQuery);
/*}}}*/
