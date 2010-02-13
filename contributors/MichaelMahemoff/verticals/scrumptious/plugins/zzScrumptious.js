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

  /******************************************************************
   * Bookmark
   ******************************************************************/

  var editBookmark = config.macros.editBookmark = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      $("<div>URL: </div>").appendTo(place);
      $("<input class='bookmarkURL'/>")
      .val(store.getTiddlerText(tiddler.title+"::url")||"")
      .keyup(function() {
        editBookmark.updateText(this);
      })
      .appendTo(place);

      $("<div>Description (optional): </div>").appendTo(place);
      $("<input class='bookmarkDescription'/>")
      .val(store.getTiddlerText(tiddler.title+"##Description")||"")
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

  config.macros.bookmarkURL = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      var url = store.getTiddlerText(tiddler.title+"::url");
      $("<a class='url'/>").appendTo(place).attr("href", url).html(url);
    }
  }

  config.macros.bookmarkDescription = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      $("<div class='description'/>")
        .appendTo(place)
        .html(store.getTiddlerText(tiddler.title+"##Description"));
    }
  }

  /******************************************************************
   * Trail
   ******************************************************************/

  var editTrail = config.macros.editTrail = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {

      $("<div>Description (optional): </div>").appendTo(place);
      $("<input class='trailDescription'/>")
      .val(store.getTiddlerText(tiddler.title+"##Description")||"")
      .keyup(function() {
        editTrail.updateText(this);
      })
      .appendTo(place);

      renderBookmarks(place, tiddler, true);

    },

    updateText: function(src) {

      var $trailTiddler = $(src).parents(".trailEditTiddler");
      console.log($trailTiddler);
      var text = "";

      var description = $trailTiddler.find(".trailDescription").val();
      if ($.trim(description).length) text+="\n!Description\n"+description;

      var $bookmarkLinks = $trailTiddler.find(".bookmarkLink");
      if ($bookmarkLinks.length) {
        text += "\n!Bookmarks\n";
        $bookmarkLinks.each(function(i, bookmarkLink) {
          text += "[[" + $(bookmarkLink).html() + "]]";
          var note = $(bookmarkLink).parents("tr").find(".bookmarkNote").val();
          console.log(note);
          if (note.length) text+=" " + note;
          text += "\n";
        });
      }

      $trailTiddler.find(".editor").find("textArea").val(text);

    }

  }

  config.macros.bookmarksView = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      renderBookmarks(place, tiddler, false);
    }
  }

  function renderBookmarks(place, tiddler, editable) {
      var trail = version.extensions.TrailPlugin.extractTrail(tiddler);
      $("<h2>Bookmarks on this Trail</h2>").appendTo(place);
      var $bookmarkTable = $("<table/>").appendTo(place);
      var $bookmarkList = $("<tbody/>").appendTo($bookmarkTable);
      $.each(trail.bookmarks, function(i, bookmark) {
        var $bookmarkItem = $("<tr/>").appendTo($bookmarkList);
        $bookmarkLinkCell = $("<td class='bookmarkLinkCell' />").appendTo($bookmarkItem);
        var $bookmarkLink;
        if (editable) {
          $bookmarkLink = $("<span/>").appendTo($bookmarkLinkCell);
        } else {
          $bookmarkLink = $(createTiddlyLink($bookmarkLinkCell.get(0), bookmark.title, true));
          console.log($bookmarkLink)
        }
        $bookmarkLink.addClass("bookmarkLink").html(bookmark.title)

        var $noteCell = $("<td/>").appendTo($bookmarkItem);
        var $note;
        if (editable) {
          var $note = $("<textarea type='text' class='bookmarkNote'/>")
            .val(bookmark.note)
            .keyup(function() {
              editTrail.updateText(this);
            })
        } else {
          $note = $("<span>"+bookmark.note+"</span>");
        }
        $note.appendTo($noteCell)
      });

      if (editable) {
        $bookmarkTable.tableDnD({
          onDrop: function(table, row) {
            editTrail.updateText(row);
          },
          dragHandle: ".bookmarkLink"
        });
      }

  }

  /******************************************************************
   * General Utility
   ******************************************************************/

  function log() { if (console && console.log) console.log.apply(console, arguments); }

  _getValue = store.getValue;
  store.getValue = function(tiddler, field, value) {
    tiddler = store.resolveTiddler(tiddler);
    var sectionContent = store.getTiddlerText(tiddler.title+"##"+field);
    if (sectionContent) return sectionContent;
    var sliceContent = store.getTiddlerText(tiddler.title+"::"+field);
    if (sliceContent) return sliceContent;
    return _getValue.apply(this, arguments);
  }

})(jQuery);
