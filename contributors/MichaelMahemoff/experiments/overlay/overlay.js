/***
|Name|portal|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

!StyleSheet

html, body {
  height: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
}

#overlay {
  position: absolute; top: 0; left: 0;
  width: 100%; 
  min-height: 100%;
  height: auto !important;
  height: 100%;
  zIndex: 1000;
  overflow: visible;
}
#overlay button { margin: 10px; }

!code
{{{
***/

(function($) {

  version.extensions.overlay = {installed:true};
  var $overlay, allStylesFrag, overlayStyleSheetContent;

  // Dummy Macro so we can ensure a function will be run
  // after page has loaded (the init() function)
  var macro = config.macros.overlay = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var macroParams = paramString.parseParams();
      createTiddlyButton(place,getParam(macroParams,"launchLabel")||"launch",null,version.extensions.overlay.toggle);
      var content = store.getTiddlerText(getParam(macroParams, "contentTiddler"));
      makeOverlay();
      if (content) $("#overlay").html(content);
      $("#closeOverlay").click(version.extensions.overlay.toggle);
      overlayStyleSheetContent = store.getTiddlerText("overlay##StyleSheet");
      var customOverlayStyleSheetContent = store.getTiddlerText(getParam(macroParams, "styleSheetTiddler"));
      if (customOverlayStyleSheetContent) overlayStyleSheetContent+=customOverlayStyleSheetContent;
    }
  };

  function makeOverlay() {
    $overlay = $("<div id='overlay'/>").hide()
    .appendTo($("body"));
  }

  version.extensions.overlay.toggle = function() {

    if ($overlay.css("display")=="none") {
      setStylesheet(overlayStyleSheetContent);
      overlayBaseStylesheet = $("style:last")[0];
      $overlay.fadeIn(1000, function() {
        allStylesFrag = document.createDocumentFragment();
        $("style").each(function() {
          if (this!=overlayBaseStylesheet) allStylesFrag.appendChild(this);
        });
        $.twStylesheet("#copyright,#saveTest,#backstage,#backstageButton,#storeArea,#shadowArea,#contentWrapper { display: none; }", {id:"main"});
      });
    } else {
      $.twStylesheet.remove({id:"main"});
      $(allStylesFrag).children().each(function() {
        $("head").append(this);
      });
      $overlay.fadeOut(function() {
        $(overlayBaseStylesheet).remove();
      });
    }

  }

})(jQuery);

/*}}}*/
