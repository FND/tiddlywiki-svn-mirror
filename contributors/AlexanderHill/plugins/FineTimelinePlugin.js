/***
|''Name''|FineTimelinePlugin|
|''Description''|Displays a list of tiddlers as a timeline|
|''Authors''|Alexander Hill|
|''Attributions''|TagCloud code originally from [[Clint Checketts|http://checkettsweb.com/styles/themes.htm#TagCloud]]|
|''Version''|0.0.5|
|''Status''|experimental|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Keywords''|timeline|

!Documentation
{{{
<<timeline {tag} {maxLength} {dateFormat} {reverseOrder} {filterTags}>>
}}}

* ''tag'': Tag identifying the tiddlers to display in the timeline (defaults to "timeline")
* ''maxLength'': Maximum number of tiddlers to include (there is no limit by default)
* ''dateFormat'': Date format string (standard TiddlyWiki format, defaults to "DD MMM YYYY")
* ''reverseOrder'': yes or no (defaults to no)
* ''filterTags'': Enter a tag to filter the results to, (no tag by default)

!ToDo
* Start using key:value named parameter format
* Possibly add parameters to control other options
** Explore options for: filtering data
** Possibly explore option for displaying timeline horizontally

!Revision History
!!v0.0.1 (2009-08-10)
* initial release

!!v0.0.2 (2009-08-10)
* reversed the order

!!v0.0.3
* sorted by the ReverseDate slice in the tiddler
* added wrapper element around each date

!!v0.0.4
* Moved the StyleSheet into the plugin to make it self contained
* Formatted the dates properly (according to the dateFormat parameter (see http://tiddlywiki.org/wiki/Date_Formats))
* Added a tooltip -that is displayed on mouseover with a simple (and slightly glitchy) jQuery animation.
* Added a parameter to reverse the order
* Added a tag filtering parameter

!!v0.0.5
* Added a tagCloud to filter 

!Code
***/
//{{{
(function($) {

config.macros.fineTimeline = {
 noTags: "No tag cloud created because there are no tags.",
 tooltip: "%1 tiddlers tagged with '%0'"
};

config.macros.fineTimeline.dateFormat = "DD MMM YYYY";

config.macros.fineTimeline.handler = function(place,macroName,params)
{
    // create container wrapping around tag cloud and timeline if not already present
    var containerClass = "timelineContainer";
    if(!hasClass(place, containerClass )) {
        place = createTiddlyElement(place,"div",null,containerClass);
    }
    config.macros.fineTimeline.argBuffer = params; // XXX: really hacky
    var tagCloudWrapper = createTiddlyElement(place,"div",null,"tagCloud",null);
    var tags = store.getTags();
    if(tags.length == 0)
    createTiddlyElement(tagCloudWrapper,"span",null,null,this.noTags);
    //Findout the maximum number of tags
    var mostTags = 0;
    for (var t=0; t<tags.length; t++) if (tags[t][0].length > 0){
        if (tags[t][1] > mostTags) mostTags = tags[t][1];
    }
    //divide the mostTags into 4 segments for the 4 different tagCloud sizes
    var tagSegment = mostTags / 4;

    for (var t=0; t<tags.length; t++) if (tags[t][0].length > 0){
	var currentTag = tags[t][0];
	if(currentTag != "systemConfig") {
	        var tagCloudElement = createTiddlyElement(tagCloudWrapper,"span",null,null,null);
	        tagCloudWrapper.appendChild(document.createTextNode(" "));
	        var theTag = createTiddlyButton(tagCloudElement,tags[t][0],this.tooltip.format(tags[t]),onClickTag,"tagCloudtag tagCloud" + (Math.round(tags[t][1]/tagSegment)+1));
	        theTag.setAttribute("tag",currentTag);
	        theTag.onclick = function(ev) {
	            config.macros.fineTimeline.onTagClick(this, ev); // XXX: use ev.target?
	            return false; // stop event propagation -- XXX: ?
		}
	}
    }
    // Get the tag, defaulting to "timeline"
    var tag = params[0] || "timeline";
    // Get the list of tiddlers with that tag
    var tiddlers = store.reverseLookup("tags",tag,true,"modified");
    var filterTags = params[4];
    if(filterTags) {
    var filtered = [];
        for(var t=0; t<tiddlers.length; t++) {
            var tiddler = tiddlers[t];
            if(tiddler.tags.contains(filterTags)) {
                filtered.push(tiddler);
            }
        }
        tiddlers = filtered;
    }
    // Get the ReleaseDate of each tiddler
    var timelineEntries = [];
    for(t=0; t<tiddlers.length; t++) {
        var title = tiddlers[t].title;
        var date = store.getTiddlerSlice(title,"ReleaseDate");
        date = new Date(date);
        var tooltip = store.getTiddlerSlice(title,"Tooltip");
        timelineEntries.push({title: title, date: date, tooltip: tooltip});
    }
    timelineEntries.sort(function(a,b) {return a.date < b.date ? -1 : (a.date == b.date ? 0 : +1);});
    if(params[3]=="yes") {
        timelineEntries.reverse();
    }
    // Keep track of the last day
    var lastDay = "";
    var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
    var dateFormat = params[2] || this.dateFormat;
    var timeline = createTiddlyElement(place, "div", null, "timeline");
    for (t=last; t<tiddlers.length; t++) {
        var tiddler = store.getTiddler(timelineEntries[t].title);
        var theDay = timelineEntries[t].date;
        if(theDay.toString() != lastDay.toString()) { // XXX: using toString is hacky!?
            var ul = document.createElement("ul");
            timeline.appendChild(ul);
            var title = createTiddlyElement(ul,"li",null,"listTitle");
            createTiddlyElement(title,"span",null,"listDate",timelineEntries[t].date.formatString(dateFormat));
            lastDay = theDay;
        }
        var listEntry = createTiddlyElement(ul,"li",null,"listLink");
        var link = createTiddlyLink(listEntry, tiddler.title);
        createTiddlyElement(link,"span",null,"listEntryTitle",tiddler.title);
        createTiddlyElement(link,"span",null,"tooltip",timelineEntries[t].tooltip);
    }
    var styles = store.getTiddlerText("FineTimelinePlugin##StyleSheet");
    setStylesheet(styles, "timeline");
    $(".listLink a").hover(function(){
        $(".tooltip").hide();
        $(".tooltip", this).show('slide', {direction: "left"}, 600);
    });
};

config.macros.fineTimeline.onTagClick = function(el, ev) {
    var tagName = $(el).attr("tag");
    var container = $(el).closest(".timelineContainer").empty().get(0); 
    var params = config.macros.fineTimeline.argBuffer; // XXX: really hacky (see above)
    params[4] = tagName;
    config.macros.fineTimeline.handler(container,"fineTimeline",params); // XXX: use invokeMacro
};

})(jQuery);

/*
version.extensions.tagCloud = {major: 1, minor: 0 , revision: 0, date: new Date(2006,2,04)};
//Created by Clint Checketts, contributions by Jonny Leroy and Eric Shulman

config.macros.tagCloud = {
 noTags: "No tag cloud created because there are no tags.",
 tooltip: "%1 tiddlers tagged with '%0'"
};

config.macros.tagCloud.handler = function(place,macroName,params) {

var tagCloudWrapper = createTiddlyElement(place,"div",null,"tagCloud",null);

var tags = store.getTags();
for (var t=0; t<tags.length; t++) {
  for (var p=0;p<params.length; p++) if (tags[t][0] == params[p]) tags[t][0] = "";
}

 if(tags.length == 0)
   createTiddlyElement(tagCloudWrapper,"span",null,null,this.noTags);
 //Findout the maximum number of tags
 var mostTags = 0;
 for (var t=0; t<tags.length; t++) if (tags[t][0].length > 0){
  if (tags[t][1] > mostTags) mostTags = tags[t][1];
 }
 //divide the mostTags into 4 segments for the 4 different tagCloud sizes
 var tagSegment = mostTags / 4;

  for (var t=0; t<tags.length; t++) if (tags[t][0].length > 0){
  var currentTag = tag[t][0];
  if(currentTag != "systemConfig"){
 	var tagCloudElement = createTiddlyElement(tagCloudWrapper,"span",null,null,null);
 	tagCloudWrapper.appendChild(document.createTextNode(" "));
 	var theTag = createTiddlyButton(tagCloudElement,tags[t][0],this.tooltip.format(tags[t]),onClickTag,"tagCloudtag tagCloud" + (Math.round(tags[t][1]/tagSegment)+1));
  	theTag.setAttribute("tag",currentTag);
 }
}
};*/
//}}}
/***
!StyleSheet
.timeline {
background:url('timelinefull.png') no-repeat;
background-position: 185px 0px;
padding-top: 1px

}

.timeline ul {
list-style-type: disc;
color: purple;
outline-color: purple;
list-style-position:inside;
margin:5px 0;
}

.timeline li.listTitle {
color: white;
font-family: "Myriad Pro", helvetica, arial;
font-size: 15px;
padding-left: -50px;
background-color: black;
width: 204px;
height: 15px;
}

.timeline .listTitle .listDate {
display: inline-block;
color: black;
background-color: white;
}

.timeline li.listLink {
font-family: "Myriad Pro", helvetica, arial;
font-size: 18px;
list-style-image: url(bullet2.png);
padding-left: 170px;
}

.timeline li.listLink a {
color:black;
padding: 8px;
border: 2px solid #d900e0;
display: inline-block;
background-color: white;
-moz-border-radius: 5px;
-webkit-border-radius: 5px;
-webkit-box-shadow:  5px 5px 5px rgba(0, 0, 0, 0.5);
-moz-box-shadow:  3px 3px 5px rgba(0, 0, 0, 0.5);
}


.timeline li.listLink a .listEntryTitle {
float: left;
}


.timeline li.listLink a .tooltip {
color: grey;
margin-left: 5px;
font-size: 14px;
font-weight: normal;
float: left;
display: none;
}

.timeline li.listLink a:hover .tooltip {
}

.tagCloud span {
height: 1.8em;
margin: 3px;
}

.tagCloud1 {
font-size: 1.2em;
}

.tagCloud2 {
font-size: 1.4em;
}

.tagCloud3 {
font-size: 1.6em;
}

.tagCloud4 {
font-size: 1.8em;
}

.tagCloud5 {
font-size: 1.8em;
font-weight: bold;
}

! /StyleSheet
***/
