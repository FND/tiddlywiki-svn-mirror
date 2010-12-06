/***
|''Name''|SiteIconTimeLine|
|''Description''|An extended version of fnd's TiddlySpaceTimeLine which shows the modifier/creator instead.|
|''Requires''|TiddlySpaceConfig NewTimelinePlugin|
!Usage
Edit [[TimelineTemplate]]
See [[NewTimelinePlugin]]
!StyleSheet

#sidebarTabs .tabContents .timeline li a,
.timeline, .siteIcon,
.timeline, .siteIcon a,
.timeline .siteIcon div {
	display: inline;
}
#sidebarTabs .tabContents li {
clear: both;
}

ol.timeline,
.timeline ol {
	margin-left: 0;
	padding-left: 0;
	list-style-type: none;
}

.timeline dd {
	margin-left: 0.5em;
}

#sidebarTabs .tabContents li {
	white-space: nowrap;
}

.timeline li li {
	clear: left;
	margin-top: 2px;
	line-height: 24px;
}

.timeline img,
.timeline a {
	display: block;
}

.timeline img {
	float: left;
	width: 24px;
	height: 24px;
	overflow: hidden;
	margin-right: 0.5em;
	opacity: 0.5;
}
!Code
***/
//{{{
(function($) {

var tiddlyspace = config.extensions.tiddlyspace;
var name = "StyleSheetTimeline";
config.shadowTiddlers[name] = store.getTiddlerText(tiddler.title +
     "##StyleSheet");
store.addNotification(name, refreshStyles);

config.macros.timeline.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	if(!config.macros.newtimeline) {
		throw "This space has been updated. Please include the newtimeline space to fix this error!";
	} else {
		config.macros.newtimeline.handler.apply(this, arguments);
	}
}

if(config.macros.newtimeline) {
config.macros.newtimeline.itemTemplate = store.getTiddlerText("TimelineTemplate");
}
})(jQuery);
//}}}
