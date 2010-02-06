/***
|''Name''|DeleteZonePlugin|
|''Description''|create the deleteZone macro which allows provides a draggable area for deleting sections from documents|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/DeleteZonePlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/DeleteZonePlugin.js |
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
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
	
	jQuery("#bin").iNestedSortable({
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

//}}}
