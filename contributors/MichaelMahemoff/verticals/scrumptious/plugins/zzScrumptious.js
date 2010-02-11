/*
(function(){
  // http://paulirish.com/2009/fighting-the-font-face-fout/
  // if firefox 3.5+, hide content till load (or 3 seconds) to prevent FOUT
  var d = document, e = d.documentElement, s = d.createElement('style');
  if (e.style.MozTransform === ''){ // gecko 1.9.1 inference
    s.textContent = 'body{visibility:hidden}';
    e.firstChild.appendChild(s);
    function f(){ s.parentNode && s.parentNode.removeChild(s); }
    addEventListener('load',f,false);
    setTimeout(f,2000); 
  }
})();
*/

if (version.extensions.TrailPlayer.syncFromFragmentID()) {
  version.extensions.overlay.toggle();
}

config.options.chkAutoSave = true;
config.options.chkTiddlerTabs = false;

(function($) {

  var editBookmark = config.macros.editBookmark = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      $("<div>URL: </div>").appendTo(place);
      $("<input class='bookmarkURL'/>")
      .val(store.getTiddlerText(tiddler.title+"::url"))
      .keyup(function() {
        editBookmark.updateText(this);
      })
      .appendTo(place);

      $("<div>Description (optional): </div>").appendTo(place);
      $("<input class='bookmarkDescription'/>")
      .val(store.getTiddlerText(tiddler.title+"##Description"))
      .keyup(function() {
        editBookmark.updateText(this);
      })
      .appendTo(place);

    },
    updateText: function(src) {
      var $bookmarkTiddler = $(src).parents(".bookmarkEditTiddler");
      var text = "url: " + $bookmarkTiddler.find(".bookmarkURL").val();
      var description = $bookmarkTiddler.find(".bookmarkDescription").val();
      if ($.trim(description).length) text+="\n!Description\n"+description;
      $bookmarkTiddler.find("textArea").val(text);
    }
  }

  function log() { if (console && console.log) console.log.apply(console, arguments); }

})(jQuery);
