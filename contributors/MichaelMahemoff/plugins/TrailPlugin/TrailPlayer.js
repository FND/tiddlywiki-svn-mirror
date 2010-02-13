/***
|Name|TrailPlayer|
|Description||
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

!Content
<div id="topBar">

  <div id="playControls">

    <!-- TRAIL INFO -->

    <select id="trail"></select>
    <div id="infoLink">&nbsp;</div>

    <!-- FLOATING LEFT -->

    <div id="nav">
      <span id="start" class="navigator">&nbsp;</span>
      <span id="prev" class="navigator">&nbsp;</span>
      <span id="next" class="navigator">&nbsp;</span>
      <span id="end" class="navigator">&nbsp;</span>
    </div>

    <select id="bookmark"></select>

    <div id="progressHolder">
      <img id="progress" src="images/progress.gif" />
      <img id="reload" src="images/reload.gif" />
    </div>

  </div>

  <!-- FLOATING RIGHT -->

  <a id="close" class="clickster">
    <div class="icon">X</div>
    <div class="prompt">close</div>
  </a>

  <div id="hide" class="clickster">
    <div class="icon">&uarr;</div>
    <div class="prompt">hide</div>
  </div>

  <div id="noteControl" class="clickster showing">
    <div title="note" class="icon">&nbsp;</div>
    <div class="prompt">note</div>
    <div id="commentStat" class="stat"><span id="commentCount">--</span> comments from users</div>
  </div>

</div>

<div id="miniBar">
  <div id="controls">
    <span id="restore">&darr;trail</span>
    <span id="miniPrev" class="navigator">&laquo;</span>
    <span id="miniNext" class="navigator">&raquo;</span>
    <!-- <a id="miniLink">#</a> -->
  </div>
</div>


<div id="note">
  <div id="noteHide">&uarr; hide note and comments &uarr;</div>
  <div class="existingNote">
    <h5><a href="#"></a></h5>
      <div class="content"></div>
      <div class="absentContent">[no note]</div>
      <h4>comments</h4>
        <div id="comments"></div>
  </div>
</div>

<div id="resourceView">
  <div id="initialBacking">---</div>
</div>

!StyleSheet
#overlay { background: black; font-family: sans-serif; overflow: hidden; }
.pseudoLink, a, a:visited { text-decoration: none; color: #00b; cursor: pointer; }
li { list-style-type: none; }

#topBar { position: absolute; top: 0; left: 0; width: 100%; height: 46px;
          z-index: 90000;
          border-bottom: 2px solid #666;
          line-height: 1; overflow: hidden;
          font-family: sans-serif;
          background-color: #a8dae5;
          background-image: -webkit-gradient(linear, left top, left bottom, from(#d3ffff), to(#58dae5));
          background-image: -moz-linear-gradient(top, #d3ffff, #58dae5);
          filter:progid:DXImageTransform.Microsoft.Gradient (GradientType=0, StartColorStr='#d3ffff', EndColorStr='#58dae5'); }

#infoLink { margin-left: 5px; }
#infoLink { background-image: url(images/info16.png); background-position: 5px 0; background-repeat: no-repeat; width:25px; float: left; height: 36px; margin-top: 2px; cursor: pointer; }

.modal { font-family: Gill Sans, sans-serif; }
#info button {
  cursor: pointer;
  border: 1px solid black;
  background: #ff9; 
  margin: 5px 0 10px; -moz-border-radius: 5px; -webkit-border-radius: 5px;
}
#info button:hover { background: #dd7; }
#info .selected { background: #fed; }
#info #options { margin: 10px 10px 0 0; font-size: x-small; font-family: serif; text-align: right; }
#info .note { background: #000; color: #fff; padding: 10px; font-size: small;
                 -moz-border-radius: 5px; -webkit-border-radius: 5px;
                 margin: 5px 10px 10px; }
#info li { padding: 5px; cursor: pointer; }
#info li:hover { background: #e9e9ff; }
.infoURL { font-size: small; color: #00b; }

#playControls { margin: 12px 0 0 20px; float: left; }

#nav { float: left; margin: -3px 10px 0 50px; }
#nav span { float: left; cursor: pointer; width: 38px; height: 30px; background-position: 0 0; background-repeat: no-repeat; }
#next { background-image: url("images/next.png"); }
#next:hover { background-image: url("images/next-hovered.png"); }
#prev { background-image: url("images/prev.png"); }
#prev:hover { background-image: url("images/prev-hovered.png"); }
#end { background-image: url("images/end.png"); }
#end:hover { background-image: url("images/end-hovered.png"); }
#start { background-image: url("images/start.png"); }
#start:hover { background-image: url("images/start-hovered.png"); }

select { width: 100px; float: left; text-align: center; }
select#bookmark { width: 200px; }

// #progress { float: left; width: 16px; height: 16px; padding-left: 10px; visibility: hidden; }
#progressHolder { float: left; width: 16px; height: 16px; padding-left: 10px; cursor: pointer; }

#noteExpand { position: absolute; top: 28px; height: 16px; opacity: 0; }
#noteHide { text-align: center; width: 100%; color: #06b; cursor: pointer; }
#note {  background: #000; }
#note { position: absolute; top: 48px; right: 5px; width: 200px; 
        border: 1px solid #444; border-top-width: 0;
        opacity: 0.9; filter:alpha(opacity=90);
        -moz-border-radius: 0 0 5px 5px; -webkit-border-radius: 0 0 5px 5px;
        padding: 2px 10px 10px; z-index: 999992; color: #fff; font-size: 12px; }
#note h4 { margin: 5px 0; text-align: right; font-style: italic; color: #333; cursor: pointer; }
#note h5 a, #note h5 a:visited { color: #fff; margin: 10px 0; font-weight: bold; }
#note h5 a:hover { text-decoration: underline; }
.absentContent { opacity: 0.2; }

#noteControl .icon { background-image: url("images/note.png"); background-repeat: no-repeat; background-position: 9px 0; }
* html #noteControl .icon { background-image: url("images/note.gif"); }
#noteControl.showing, #noteControl.showing div { background-color: #5bbac7; color: #333; }
.stat { color: #777; text-align: right; padding-right: 5px; }

#miniBar { position: absolute; top: 0; right: 0;
           text-align: right; z-index: 1; }
#miniBar #restore { font-size: small; }
#miniBar #controls { background: #a8dae5; opacity: 0.9; padding: 4px;
                     border: 2px solid #38626b; border-top-width: 0; border-right-width: 0; }
#miniBar #controls, #miniBar a { color: #000; }
#miniBar #controls span:hover { color: #0000dd; }
#miniBar #controls span { margin: 0 4px; cursor: pointer; }

.clickster { width: 40px; height: 100%; float: right; text-align: center; }
.clickster { font-size: 14px; float: right; padding: 2px 1px; cursor: pointer; width: 44px; height: 46px; text-align: center; float: right; }
.clickster:hover,a.clickster:hover { background: #5081b2; }
.clickster div, .clickster a { text-align: center; font-size: small; color: #000; }
.clickster div.icon { font-size: 20px; margin: 5px 0 2px; }

* html #resourceView { top: 48px; }
body { overflow: hidden; }
#resourceView { position: absolute; width: 100%; height: 100%; top: 0; left: 0; margin-top: 48px; }
#resourceView iframe { position: relative; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; }

!InfoTemplate
<div id="info">
  <h3><%= trail.name %></h3>
  <p><%= trail.description %></p>
  <ol id="bookmarks" class="xoxo">
    <% jQuery.each(trail.bookmarks, function(i, bookmark) { %>
      <% var selectedString = (i==trail.selectedIndex ? " selected" : ""); %>
      <li class="bookmarkItem<%= selectedString %>">
          <a class="bookmark" href="<%= bookmark.url %>" target="bookmarkView" title="<%= bookmark.name %>"><%= bookmark.name %></a>
          <div class="infoURL"><%= bookmark.url %></div>
        <% if (jQuery.trim(bookmark.note).length) { %>
          <div class="note"><%= bookmark.note %></div>
        <% } %>
      </li>
    <% }); %>
  </ol>
</div>
!Javascript
{{{
***/

(function($) {

  var player = version.extensions.TrailPlayer = {installed:true};

  config.TrailPlayer = {
    onLoad: function() {
      $.each(store.getTaggedTiddlers("trail"), function(i,trailTiddler) {
        $("<option>"+trailTiddler.title+"</option>")
        .val(trailTiddler.title)
        .appendTo($("#trail"));
      });
      $("#trail").change(function() {
        switchTrail();
      });
      $("#noteHide,#noteControl").click(toggleNote);
      $("#bookmark").change(switchBookmark);
      wireNavButtons();

      $("#progressHolder").click(function() { loadIframe(); });

      $("#infoLink").click(showInfo);
      $("#hide").click(function() { toggleTopBar(false); });
      $("#restore").click(function() { toggleTopBar(true); });

      $("#close").click(version.extensions.overlay.toggle);
      // if (!store.getTaggedTiddlers("trail").length) return false;
      // player.syncFromFragmentID();
      // return $("#trail option").length;
    },
    onOpen: function() {
      player.syncToFragmentID();
    },
    onClose: function() {
      if (!this.closedBefore) {
        this.closedBefore = true;
        story.closeAllTiddlers();
      }
      story.displayTiddler("top", getCurrentTrail().name);
      story.displayTiddler("top", getCurrentBookmark().name);
      player.clearFragmentID();
    },
  };

  version.extensions.TrailPlayer.syncFromFragmentID = function() {
    var matches = document.location.href.match(/#\[trail\[(.*?)(\/(.*)\])?\]$/);
    if (matches) {
      var trailTitle=decodeURI(matches[1]), bookmarkTitle = decodeURI(matches[3]);
      $("#trail option[value="+trailTitle+"]").attr("selected", true);
      var bookmarkIndex = _.pluck(getCurrentTrail().bookmarks, "name").indexOf(bookmarkTitle);
      switchTrail(bookmarkIndex==-1 ? 0 : bookmarkIndex);
      return true;
    } else {
      switchTrail();
      return false;
    }
  };

  version.extensions.TrailPlayer.syncToFragmentID = function() {
    document.location.hash = "#[trail[" + encodeURI(getCurrentTrail().name) + "/" + encodeURI(getCurrentBookmark().name)+"]]";
  };

  version.extensions.TrailPlayer.clearFragmentID = function() {
    document.location.hash = "";
  }

  var navButtonCalculators = {
    next:  function(siteIndex) { return siteIndex+1; },
    prev:  function(siteIndex) { return siteIndex-1; },
    start: function(siteIndex) { return 0; },
    end:   function(siteIndex) { return $("#bookmark option").length-1; }
  };
  navButtonCalculators.miniNext = navButtonCalculators.next;
  navButtonCalculators.miniPrev = navButtonCalculators.prev;

  function wireNavButtons() {
    $(".navigator").click(function() {
      // var bookmarkIndex = $("#bookmark option:selected").prevAll().length;
      var bookmarkIndex = getCurrentBookmarkIndex();
      var newIndex = navButtonCalculators[this.id](parseInt(bookmarkIndex, 10));
      if (newIndex!=bookmarkIndex && newIndex>=0 && newIndex<$("#bookmark option").length) {
        $("#bookmark option").get(newIndex).selected = true;
        switchBookmark();
      }
    });
  }

  function showInfo() {
    var modalOptions = {
      dialogWidth: 600,
      dialogHeight: 600
    };
    var trail = getCurrentTrail();
    trail.selectedIndex = getCurrentBookmarkIndex();
    var infoMessage = version.extensions.microtemplate("TrailPlayer##InfoTemplate", {
      trail: trail
    });
    $.modal.show($("<div/>").html(infoMessage), modalOptions);
    $("#info ol").click(function(ev) {
      var firstButton = (ev.which===1 || ev.button===0);
      if (!firstButton) return;
      var $target = $(ev.target).closest("li");
      if ($target.length) {
        $(".modal").data("close", null);
        $.modal.close();
        $("#bookmark option").get($target.prevAll().length).selected = true;
        switchBookmark();
      }
    });
  }

  function toggleNote() {
    var willBeHidden = $("#note").isDisplayed();
    if (willBeHidden) {
      $("#noteControl").removeClass("showing");
    } else {
      $("#noteControl").addClass("showing");
      $("#noteHide").css("opacity", 1);
    }
    $("#note").slideToggle();
  }

  function toggleTopBar(shouldShow) {
    var DELAY=300;
    if (shouldShow) {
        $("#note").css("opacity",0).animate({opacity:1}, DELAY);
        $("#topBar").slideDown(DELAY);
        $("#resourceView").animate({"marginTop": 48}, DELAY, function() {
          // $("#miniBar").removeClass("available");
          $("#miniBar").css({zIndex: -1, opacity: 0});
        });
    } else {
        $("#note").css("opacity",1).animate({opacity:0}, DELAY);
        $("#topBar").slideUp(DELAY);
        $("#resourceView").animate({"marginTop": 0}, DELAY, function() {
          $("#miniBar").addClass("available").css("zIndex", 999999).blink(). hover(function() {
            $(this).css("opacity", 1);
          }, function() {
            $(this).css("opacity", 0.05);
          });
        });
    }
  }

  function switchTrail(bookmarkIndex) {
    if (!$("#trail option").length) return;
    $("#bookmark").empty();
    var trailTiddler = store.getTiddler($("#trail").val());
    var trail = version.extensions.TrailPlugin.extractTrail(trailTiddler);
    $.each(trail.bookmarks, function(i,bookmark) {
      $("<option/>").html(bookmark.name).val(bookmark.name).appendTo($("#bookmark"));
    });
    if (trail.bookmarks.length) $("#bookmark option").get(bookmarkIndex||0).selected = true;
    switchBookmark();
  }

  function switchBookmark() {
    // $('#resourceView').empty().create("<iframe/>").src(url, function() { $("#progress").visible(false); });
    // var bookmark = $("#bookmark").val();
    // $("#progress").visible();
    // $('#resourceView').empty().attach("<iframe/>").src(getCurrentBookmark().url,
    var bookmark = getCurrentBookmark();
    $("#note .content").showIf(!isWhitespace(bookmark.note));
    $("#note .absentContent").showIf(isWhitespace(bookmark.note));
    $("#note .content").html(bookmark.note);
    // $.trim(bookmark.note).length
    // $("#resourceView iframe").src(bookmark.url, function() { $("#progress").hidden(); });
    loadIframe();
    if ($("#overlay").isDisplayed()) player.syncToFragmentID();
  }

  function loadIframe(url) {
    // if (!url) url = $("#bookmark
    var url = getCurrentBookmark().url;
    showProgress();
    $("#resourceView").html($("<iframe/>"));
    $("#resourceView iframe").src(url, function() { hideProgress(); });
  }

  function getCurrentTrail() {
    var trailTiddler = store.getTiddler($("#trail").val());
    return version.extensions.TrailPlugin.extractTrail(trailTiddler);
  }

  function getCurrentBookmark() {
    // var bookmarkIndex = $("#bookmark").val();
    return getCurrentTrail().bookmarks[getCurrentBookmarkIndex()];
  }

  function getCurrentBookmarkIndex() { // TODO inline
    // return $("#bookmark").val();
    return $("#bookmark option:selected").prevAll().length;
  }

  function log() {
    if (console && console.log) console.log.apply(console, arguments);
  }

  $.fn.attach  = function(html) { return this.append(html).children(":last"); };
  $.fn.visible = function() { return this.css("visibility", "visible"); };
  $.fn.hidden  = function() { return this.css("visibility", "hidden"); };
  function showProgress() { $("#progress").show(); $("#reload").hide(); }
  function hideProgress() { $("#progress").hide(); $("#reload").show(); }
  $.fn.showIf = function(shouldShow, options) {
    var settings = $.extend({
      showEffect: function() { $(this).show(); },
      hideEffect: function() { $(this).hide(); }
    }, options);
    shouldShow ? settings.showEffect.apply(this) : settings.hideEffect.apply(this);
    return $(this);
  };
  $.fn.isDisplayed = function() { return $(this).css("display")!="none"; };
  $.fn.slideToggle = function() { return $(this)[$(this).isDisplayed() ? "slideUp":"slideDown"](200); };
  $.fn.toggleClass = function(test, klass) { test ? this.addClass(klass):this.removeClass(klass); };
  $.fn.blink = function() {
    for (var i=0; i<2; i++) $(this).fadeTo(200, 1).fadeTo(i==2?1000:200, 0.05);
    return $(this);
  };
  function isWhitespace(s) { return (/^[ \t\n]*$/).test(s); }

})(jQuery);

/*}}}*/

