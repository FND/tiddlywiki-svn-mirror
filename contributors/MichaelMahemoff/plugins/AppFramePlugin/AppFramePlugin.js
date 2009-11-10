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
      config.shadowTiddlers["StyleSheetAppFramePlugin"] = stylesheet;
      store.addNotification("StyleSheetAppFramePlugin", refreshStyles);
    },

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      $(place).addClass("app");
      var macroParams = paramString.parseParams();
      var app = getParam(macroParams, "app") || tiddler.title;
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
    var htmlTemplate = store.getTiddlerText("AppFramePlugin##HTMLTemplate");
    var appHTML = htmlTemplate.replace("[[app]]", app);
    $.each(componentTypes, function(i, componentType) { 
      var component = store.getTiddlerText(app+componentType);
      appHTML = appHTML.replace("[["+componentType+"]]", component);
    });

    var linkedScripts = "";
    // log("jslib", $("#jslibArea").html());
    $.each(strip(getField(app+"Script", "scripts")).split(","), function(i, script) { 
      if (script=="_jQuery_") linkedScripts+= // special value
        "<script type='text/javascript'>"+$("#jslibArea").html()+"</script>\n";
      else if (isURL(script)) linkedScripts +=
        "<script type='text/javascript' src='"+script+"'></script>\n";
      else {
        var scriptTiddler = store.getTiddler(script);
        if (scriptTiddler) linkedScripts +=
          "<script type='text/javascript'>\n"+scriptTiddler.text+"</script>\n";
      }
    });
    appHTML = appHTML.replace("[[linkedScripts]]", "\n"+linkedScripts+"\n");

    var linkedStylesheets = "";
    $.each(strip(getField(app+"CSS", "stylesheets")).split(","), function(i, stylesheet) { 
      log("sty", stylesheet);
      if (isURL(stylesheet)) linkedStylesheets +=
        "<link rel='stylesheet' type='text/css' href='"+stylesheet+"'></link>";
      else {
        var stylesheetTiddler = store.getTiddler(stylesheet);
        if (stylesheetTiddler) linkedStylesheets +=
          "<style>\n"+stylesheetTiddler.text+"</style>\n\n";
      }
    });
    appHTML = appHTML.replace("[[linkedStylesheets]]", "\n"+linkedStylesheets+"\n");

    return appHTML;
  }

  $.fn.inject = function(content) {

    return $(this).filter("iframe").each(function() {
      var doc = this.contentDocument || this.document || this.contentWindow.document;
      doc.open();
      doc.writeln(content);
      doc.close();
    });

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

})(jQuery);

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!HTMLTemplate
<html>
  <head>
    <title>[[app]]</title>
    [[linkedScripts]]
    [[linkedStylesheets]]
    <script type="text/javascript">
      [[Script]]
    </script>
    <style>[[CSS]]</style>
  </head>
  <body>
    [[HTML]]
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
