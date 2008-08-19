/***
|Name|AutoRefresh|
|Source|http://www.TiddlyTools.com/#AutoRefresh|
|Version|0.6.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|script|
|Requires|InlineJavascriptPlugin|
|Overrides||
|Description|enable/disable auto-refresh of selected content to force/prevent re-rendering when tiddler changes occur|

usage:
	<<autoRefresh [on|off]>>
	<<tiddler AutoRefresh with: mode id>> - OLD

where:
	mode - (optional) is one of:
		off (or disable) - prevent refresh of rendered content (except when PageTemplate is changed!)
		on (or enable)- re-render content whenever corresponding tiddler source is changed
		force - re-render content whenever ANY tiddler content is changes (or refreshDisplay() is triggered)
	id - (optional)
		is a unique DOM element identifier on which to operate.
		If not specified, the current tiddler (or containing parent if not in a tiddler) is used.

***/

config.macros.autoRefresh = {};

config.macros.autoRefresh.handler = function(place) {

	var here=story.findContainingTiddler(place);
	if (here) { // in a tiddler, get containing viewer element
		var here=place; while (here && here.className!='viewer') here=here.parentNode;
		if (!here) return; // no 'viewer' element (perhaps a custom template?)
	}
	else here=place.parentNode; // not in a tiddler, use immediate parent container
	
	// if DOM id param, get element by ID instead of using container
	//if ("$2"!="$"+"2") var here=document.getElementById("$2");
	
	//if (!here) return; // safety check
	
	var mode= params ? params[0] : "on";
	//if (mode=="$"+"1") mode="on";
	
	switch (mode.toLowerCase()) {
		case 'on':
		case 'enable':
		case 'force':
			var title=here.getAttribute("tiddler");
			if (!title) { // find source tiddler title
				var tid=story.findContainingTiddler(place);
				if (!tid) return; // can't determine source tiddler
				title=tid.getAttribute("tiddler");
			}
			here.setAttribute("tiddler",title);
			here.setAttribute("refresh","content");
			here.setAttribute("force",(mode=='force')?"true":"");
			break;
		case 'off':
		case 'disable':
			here.setAttribute("refresh","");
			here.setAttribute("force","");
			break;
	}
};