/***
|''Name''|DeleteZonePlugin|
|''Description''|create the deleteZone macro which allows provides a draggable area for deleting sections from documents|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/DeleteZonePlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/DeleteZonePlugin.js |
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||
!Description

create the deleteZone macro which allows provides a draggable area for deleting sections from documents

!Usage
{{{

To create a draggable delete zone call the macro <<deleteZone>>

}}}

!Code
***/

//{{{
	
config.macros.deleteZone = {};
config.macros.deleteZone.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var div = createTiddlyElement(place, "div","deleteZone", "deleteZoneClass");
	var binContents = store.getTiddlerText(window.activeDocument+"Bin");
	if(binContents)
		wikify("Bin \n"+binContents, div);
	else
		div.innerHTML = "<b>Bin</b><br /><br /> <span id='bin'><li class='toc-item'>&nbsp;</li></span>";
	div.style.height = "auto";
	jQuery("#bin").NestedSortable({
		accept: 'toc-item',
		noNestingClass: "no-nesting",
		onStop : function() {
		},
		helperclass: 'helper',
		autoScroll: true,
		handle: '.toc-sort-handle'
	});
};

config.macros.deleteZone.find = function(wantedTitle, spec) {
	var wantedSpec;
	var count=0;
	jQuery.each(spec, function() {
		if(this.title == wantedTitle)
		  wantedSpec = { found: this, containerSpec: spec, index: count };
		else
		  wantedSpec = config.macros.deleteZone.find(wantedTitle, this.children);
		log("wanted", wantedSpec)
		if (wantedSpec) return false; // break
		count++;
	})
	return wantedSpec;
}


config.shadowTiddlers["DeleteZonePluginStyles"] = store.getTiddlerText("DeleteZonePlugin##StyleSheet");
store.addNotification("DeleteZonePluginStyles", refreshStyles);

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################
	
/***
!StyleSheet

html body .deleteZoneClass{
	background:#eee;
	border:1px solid black;
}


html body .deleteZoneClass b {
	color:#333;
}
!(end of StyleSheet)
***/


//}}}
