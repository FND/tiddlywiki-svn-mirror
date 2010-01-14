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

    <!-- FLOATING LEFT -->

    <div id="nav">
      <span id="start">&nbsp;</span>
      <span id="prev">&nbsp;</span>
      <span id="next">&nbsp;</span>
      <span id="end">&nbsp;</span>
    </div>

    <select id="bookmark"></select>

    <img id="progress" src="images/progress.gif" />

  </div>

  <!-- FLOATING RIGHT -->

  <a id="close" class="clickster">
    <div class="icon">X</div>
    <div class="prompt">close</div>
  </a>

  <div id="noteControl" class="clickster showing">
    <div title="note" class="icon">&nbsp;</div>
    <div class="prompt">note</div>
    <div id="commentStat" class="stat"><span id="commentCount">--</span> comments from users</div>
  </div>

</div>

<div id="note">
  <div class="noteToggle" id="noteHide">&uarr; hide note and comments &uarr;</div>
  <div class="existingNote">
    <h5><a href="#"></a></h5>
      <div class="content"></div>
      <div class="absentContent">[no note]</div>
      <h4>comments</h4>
        <div id="comments"></div>
  </div>
</div>

<div id="resourceView">
  <div id="initialBacking">woop</div>
</div>

!StyleSheet
#overlay { background: black; font-family: gill sans; overflow: hidden; }
.pseudoLink, a, a:visited { text-decoration: none; color: #00b; cursor: pointer; }
li { list-style-type: none; }

#topBar { position: absolute; top: 0; left: 0; width: 100%; height: 46px;
          z-index: 90000;
          border-bottom: 2px solid #666;
          line-height: 1; overflow: hidden;
          background-color: #a8dae5;
          background-image: -webkit-gradient(linear, left top, left bottom, from(#d3ffff), to(#58dae5));
          background-image: -moz-linear-gradient(top, #d3ffff, #58dae5);
          filter:progid:DXImageTransform.Microsoft.Gradient (GradientType=0, StartColorStr='#d3ffff', EndColorStr='#58dae5') }

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

select { width: 100px; float: left; }

#progress { float: left; width: 16px; height: 16px; padding-left: 10px; visibility: hidden; }

#noteExpand { position: absolute; top: 28px; height: 16px; opacity: 0; }
.noteToggle { text-align: center; width: 100%; color: #038; cursor: pointer; }
#note {  background: #000; }
#note { position: absolute; top: 48px; right: 5px; width: 200px; 
        border: 1px solid #444; border-top-width: 0;
        opacity: 0.9; filter:alpha(opacity=90);
        -moz-border-radius: 0 0 5px 5px; -webkit-border-radius: 0 0 5px 5px;
        padding: 2px 10px 10px; z-index: 999992; color: #fff; font-size: 12px; }
#note h4 { margin: 5px 0; text-align: right; font-style: italic; color: #333; cursor: pointer; }
#note h5 a, #note h5 a:visited { color: #fff; margin: 10px 0; font-weight: bold; }
#note h5 a:hover { text-decoration: underline; }

#noteControl .icon { background-image: url("images/note.png"); background-repeat: no-repeat; background-position: 9px 0; }
* html #noteControl .icon { background-image: url("images/note.gif"); }
#noteControl.showing, #noteControl.showing div { background-color: #5bbac7; color: #333; }
.stat { color: #777; text-align: right; padding-right: 5px; }

.clickster { width: 40px; height: 100%; float: right; text-align: center; }
.clickster { font-size: 14px; float: right; padding: 2px 1px; cursor: pointer; width: 44px; height: 46px; text-align: center; float: right; }
.clickster:hover,a.clickster:hover { background: #5081b2; }
.clickster div, .clickster a { text-align: center; font-size: small; color: #000; }
.clickster div.icon { font-size: 20px; margin: 5px 0 2px; }

* html #resourceView { top: 48px; }
body { overflow: hidden; }
#overlay { padding-top: 48px; }
#resourceView { position: absolute; width: 100%; height: 100%; }
#resourceView iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; }

!Javascript
{{{
***/

(function($) {

  version.extensions.TrailPlayer = {installed:true};

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
      $(".noteToggle,#noteControl").click(toggleNote);
      $("#bookmark").change(switchBookmark);
      wireNavButtons();
      $("#close").click(version.extensions.overlay.toggle);
      switchTrail();
    },
    onOpen: function() {
    },
    onClose: function() {
    }
  };

  var navButtonCalculators = {
    next:  function(siteIndex) { return siteIndex+1; },
    prev:  function(siteIndex) { return siteIndex-1; },
    start: function(siteIndex) { return 0; },
    end:   function(siteIndex) { return $("#bookmark option").length-1; }
  }

  function wireNavButtons() {
    $("#nav span").click(function() {
      log(this);
      var bookmarkIndex = $("#bookmark option:selected").prevAll().length;
      log(bookmarkIndex);
      var newIndex = navButtonCalculators[this.id](bookmarkIndex);
      log(newIndex);
      if (newIndex!=bookmarkIndex && newIndex>=0 && newIndex<$("#bookmark option").length) {
        log("switching");
        $("#bookmark option").get(newIndex).selected = true;
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

  function switchTrail() {
    $("#bookmark").empty();
    var trailTiddler = store.getTiddler($("#trail").val());
    var trail = version.extensions.TrailPlugin.extractTrail(trailTiddler);
    $.each(trail.bookmarks, function(i,bookmark) {
      $("<option/>").html(bookmark.name).val(i).appendTo($("#bookmark"));
    });
    $("#bookmark").change();
  }

  function switchBookmark() {
    // $('#resourceView').empty().create("<iframe/>").src(url, function() { $("#progress").visible(false); });
    var bookmark = $("#bookmark").val();
    // $("#progress").visible();
    $("#progress").visible();
    // $('#resourceView').empty().attach("<iframe/>").src(getCurrentBookmark().url,
    $('#resourceView').empty();
    var bookmark = getCurrentBookmark();
    $("#note .content").showIf(!isWhitespace(bookmark.note));
    $("#note .absentContent").showIf(isWhitespace(bookmark.note));
    $("#note .content").html(bookmark.note)
    $.trim(bookmark.note).length
    $("<iframe/>").appendTo($("#resourceView")).src(bookmark.url,
      function() { $("#progress").hidden(); }
    );
  }

  function getCurrentTrail() {
    var trailTiddler = store.getTiddler($("#trail").val());
    return version.extensions.TrailPlugin.extractTrail(trailTiddler);
  }

  function getCurrentBookmark() {
    var bookmarkIndex = $("#bookmark").val();
    return getCurrentTrail().bookmarks[bookmarkIndex];
  }

  function log() {
    if (console && console.log) console.log.apply(console, arguments);
  }

  $.fn.attach  = function(html) { return this.append(html).children(":last"); };
  $.fn.visible = function() { return this.css("visibility", "visible"); };
  $.fn.hidden  = function() { return this.css("visibility", "hidden"); };
  $.fn.showIf = function(shouldShow, options) {
    var settings = $.extend({
      showEffect: function() { $(this).show(); },
      hideEffect: function() { $(this).hide(); }
    }, options);
    shouldShow ? settings.showEffect.apply(this) : settings.hideEffect.apply(this);
    return $(this);
  }
  $.fn.isDisplayed = function() { return $(this).css("display")!="none"; }
  $.fn.slideToggle = function() { return $(this)[$(this).isDisplayed() ? "slideUp":"slideDown"](); }
  $.fn.toggleClass = function(test, klass) { test ? this.addClass(klass):this.removeClass(klass); }
  function isWhitespace(s) { return /^[ \t\n]*$/.test(s); }


})(jQuery);

/*}}}*/
