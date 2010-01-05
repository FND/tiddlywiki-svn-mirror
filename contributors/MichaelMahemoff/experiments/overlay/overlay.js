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
* html { overflow-y: hidden; }
* html body { height: 100%; overflow: auto; }
#overlay {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  zIndex: 1000;
  background: black
}
* html #overlay { position: absolute; }
#overlay button { margin: 10px; }
!code
{{{
***/

(function($) {

  version.extensions.portal = {installed:true};
  var $overlay;
  var allStylesFrag;

  // Dummy Macro so we can ensure a function will be run
  // after page has loaded (the init() function)
  var macro = config.macros.portal = {

    init: function() {
      makeOverlay();
    },

    handler: function() {
      $("<button>portal</button>")
      .click(toggle)
      .appendTo(place);
    }
  };

  function makeOverlay() {
    $overlay = $("<div id='overlay'/>").hide()
    .appendTo($("body"));

    $("<button>Admin</button>")
    .appendTo($overlay)
    .click(toggle);
  }

  function toggle() {

    $overlay.toggle();

    if ($overlay.css("display")=="block") {
      allStylesFrag = document.createDocumentFragment();
      $("style").each(function() {
        allStylesFrag.appendChild(this);
      });
      setStylesheet(store.getTiddlerText("overlay##StyleSheet"));
    } else {
      $("style").remove();
      $(allStylesFrag).children().each(function() {
        $("head").append(this);
      });
    }

  }

})(jQuery);

/*}}}*/
