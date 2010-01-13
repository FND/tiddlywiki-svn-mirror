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

  var macro = config.macros.overlay = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var macroParams = paramString.parseParams();
      createTiddlyButton(place,getParam(macroParams,"launchLabel")||"launch",null,version.extensions.overlay.toggle);
    }
  };

  function makeOverlay() {
    if (! $("#overlay").length) {
      var overlays = store.getTaggedTiddlers("overlay");
      if (!overlays.length) return;
      // var content = store.getTiddlerText(getParam(macroParams, "contentTiddler"));
      overlay = overlays[0];
      $overlay = $("<div id='overlay'/>").hide().html(store.getTiddlerText(overlay.title+"##Content")).appendTo("body");
      call(config[overlay.title].onLoad);
      // $("#closeOverlay").click(version.extensions.overlay.toggle);
      overlayStyleSheetContent = store.getTiddlerText("overlay##StyleSheet");
      var customOverlayStyleSheetContent = store.getTiddlerText(overlay.title+"##StyleSheet");
      if (customOverlayStyleSheetContent) overlayStyleSheetContent+=customOverlayStyleSheetContent;
    }
  }

  version.extensions.overlay.toggle = function() {

    makeOverlay();
    var overlayTiddlerTitle = store.getTaggedTiddlers("overlay")[0].title;
    if ($overlay.css("display")=="none") {
      $.twStylesheet(overlayStyleSheetContent, {id: "overlayStyleSheet"});
      overlayBaseStylesheet = $("style:last")[0];
      call(config[overlayTiddlerTitle].onOpen);
      $overlay.fadeIn(1000, function() {
        allStylesFrag = document.createDocumentFragment();
        $("style").each(function() {
          if (this!=overlayBaseStylesheet) allStylesFrag.appendChild(this);
        });
        $.twStylesheet("#copyright,#saveTest,#backstage,#backstageCloak,#backstageArea,#backstageButton,#storeArea,#shadowArea,#contentWrapper { display: none; }", {id:"main"});
        $("#backstageArea,#backstageButton").hide();
      });
    } else {
      $.twStylesheet.remove({id:"main"});
      $(allStylesFrag).children().each(function() {
        $("head").append(this);
      });
      $("#backstageArea,#backstageButton").show();
      call(config[overlayTiddlerTitle].onClose);
      $overlay.fadeOut(function() {
        $.twStylesheet.remove({id:"overlayStyleSheet"});
        // $(overlayBaseStylesheet).remove();
      });
    }

  }

  version.extensions.overlay.toggle();

  function call(fn) { if (fn) fn(); }

})(jQuery);

/*}}}*/
