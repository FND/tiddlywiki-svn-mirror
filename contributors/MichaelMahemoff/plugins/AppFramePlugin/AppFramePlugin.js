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

  version.extensions.AppFramePlugin = {installed:true};

(function($) {

  var componentTypes = ["HTML", "CSS", "Script"];

  config.macros.appFrame = {

//################################################################################
//# MACRO INITIALISATION
//################################################################################

    init: function() {
      var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
      console.log("tid", tiddler);
      config.shadowTiddlers["StyleSheetAppFramePlugin"] = stylesheet;
      store.addNotification("StyleSheetAppFramePlugin", refreshStyles);
    },

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      $(place).addClass("app");
      var macroParams = paramString.parseParams();
      var app = getParam(macroParams, "app");
      var $iframe = $("<iframe class='appFrame' />").appendTo(place);
      setTimeout(function() { $iframe.inject(composeHTML(app)); }, 1);
      makeAppPanel(app, place);
    }

  };

  function makeAppPanel(app, place) {
    var $panel = $("<div class='appPanel' />").appendTo(place);
    $.each(componentTypes, function(i, componentType) {
      createTiddlyLink($panel[0], "events"+componentType, true);
    });
  }

  function composeHTML(app) {
    log("about");
    var htmlTemplate = store.getTiddlerText("AppFramePlugin##HTMLTemplate");
    log("htm", htmlTemplate);
    var coreHTML = store.getTiddlerText(app+"HTML");
    var coreCSS = store.getTiddlerText(app+"CSS");
    var coreScript = store.getTiddlerText(app+"Script");
    // return coreHTML+coreCSS+coreScript;
    var appHTML = htmlTemplate
      .replace("[[app]]", app)
      .replace("[[coreScript]]", coreScript)
      .replace("[[coreCSS]]", coreCSS)
      .replace("[[coreHTML]]", coreHTML);
    return appHTML;
  }

  $.fn.inject = function(content) {

    return $(this).filter("iframe").each(function() {
      var doc = this.contentDocument || this.document || this.contentWindow.document;
      doc.open();
      doc.writeln(content)
      doc.close();
    });

  }

  function log() {
    if (console && console.log) console.log.apply(console, arguments);
  }

})(jQuery);

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!HTMLTemplate
<html>
  <head>
    <title>[[app]]</title>
    <script>[[coreScript]]</script>
    <style>[[coreCSS]]</style>
  </head>
  <body>
    [[coreHTML]]
  </body>
</html>
!StyleSheet

.appFrame { width: 100%; height: 300px; }
.appPanel { margin: 5px 0; }
.appPanel .tiddlyLink { background: #ffe; margin-right: 5px; border: 1px solid #ffc; padding: 2px; }
.appPanel a.tiddlyLink:hover { color: #008; }

!(end of StyleSheet)
***/

/*}}}*/
