/***
|Name|ViewingTimesPlugin|
|Description|Time how long user spends viewing each tiddler|
|Source|Subversion|
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

This plugin periodically takes "snapshots" (samples) to record what the user is viewing.
A "durations" map is built up, mapping tiddler title to duration. It was
initially motivated by this thread -
http://groups.google.com/group/tiddlywiki/browse_thread/thread/ea40a6c23ddeddea#

The tiddler looks at the first element in the story, which is not always going to be accurate (e.g. if a tiddler is already further down in the story, and the user clicks on a link to it, it will not be counted). It will work best with a plugin like SinglePageMode.

Many enhancements are possible:
* Only show tiddlers matching a certain tag or filter
* Improve display of times (hours,mins,seconds; not just seconds)
* Group tiddlers together by tag or filter
* Save viewing times
* Record time editing, or "stop the clock" while editing

***/

/*{{{*/
  (function($) {

    var SAMPLE_MILLISECS=1000;
    var macroCounter = 0;
    var times = {};

    var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
    if (stylesheet) { // check necessary because it happens more than once for some reason
      config.shadowTiddlers["StyleSheet"+tiddler.title] = stylesheet;
      store.addNotification("StyleSheet"+tiddler.title, refreshStyles);
    }

    config.macros.viewingTimes = {
      handler: function(place,macroName,params,wikifier,paramString,tiddler) {
        var id = "viewingTimes"+(macroCounter++);
        var viewingTimesEl = $("<table class='viewingTimes'/>").attr("id",id).appendTo(place);
        keepUpdating(id);
      }
    };

    function keepUpdating(viewingTimesElId) {
      var viewingTimesEl = $("#"+viewingTimesElId);
      if (!viewingTimesEl.length) return;
      $.each(times, function(tiddler) {
        var tiddlerDurationElClass = tiddler+"Data";
        if (! $("."+tiddlerDurationElClass, viewingTimesEl).length) {
          $("<tr/>")
            .append("<td class='tiddlerName'>"+tiddler+"</td>")
            .append("<td class='duration'/>")
            .attr("class", tiddlerDurationElClass)
            .appendTo(viewingTimesEl);
        }
        $("."+tiddlerDurationElClass, viewingTimesEl).find(".duration").html(Math.round(Math.round(this/1000))+" secs</td>");
      });
      setTimeout(function() { keepUpdating(viewingTimesElId); }, 1000);
    }

    function sample() {
      var firstTiddler = $(story.getContainer()).children()[0];
      if (firstTiddler) {
        var tiddler = $(firstTiddler).attr("tiddler");
        if (!times[tiddler]) times[tiddler] = 0;
        times[tiddler] += SAMPLE_MILLISECS;
      }
    }
    setInterval(sample, SAMPLE_MILLISECS);

  })(jQuery);

/***
!StyleSheet

table.viewingTimes { border-collapse: collapse; }
.viewingTimes td { padding: 2px; border: 1px solid black; vertical-align: top; }

!endStyleSheet


/*}}}*/
