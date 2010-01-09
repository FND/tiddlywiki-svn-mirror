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

  <a id="close" class="clickster">
    <div class="icon">X</div>
    <div class="prompt">close</div>
  </a>

  <div id="stretchy">
    <select id="trail"></select>
    <select id="bookmark"></select>
    <div id="progress">&nbsp;</div>
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

#stretchy { margin-right: 50px; padding: 10px; }
select { width: 100px; }

.clickster { width: 40px; height: 100%; float: right; text-align: center; padding-top: 5px; }
.clickster { font-size: 14px; float: right; padding: 2px 1px; cursor: pointer; width: 44px; height: 46px; text-align: center; float: right; }
.clickster:hover,a.clickster:hover { background: #5081b2; }
.clickster div, .clickster a { text-align: center; font-size: small; color: #000; }
.clickster div.icon { font-size: 20px; margin-bottom: 5px; }

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
      $("#bookmark").change(switchBookmark);
      $("#close").click(version.extensions.overlay.toggle);
      switchTrail();
    },
    onOpen: function() {
    },
    onClose: function() {
    }
  };

  function switchTrail() {
    $("#bookmark").empty();
    var trailTiddler = store.getTiddler($("#trail").val());
    var trail = version.extensions.TrailPlugin.extractTrail(trailTiddler);
    $.each(trail.bookmarks, function(i,bookmark) {
      $("<option/>").html(bookmark.name).val(i).appendTo($("#bookmark"));
    });
    switchBookmark();
  }

  function switchBookmark() {
    // $('#resourceView').empty().create("<iframe/>").src(url, function() { $("#progress").visible(false); });
    var bookmark = $("#bookmark").val();
    $('#resourceView').empty().attach("<iframe/>").attr("src", getCurrentBookmark().url);
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

  $.fn.attach = function(html) { return this.append(html).children(":last"); };

})(jQuery);

/*}}}*/
