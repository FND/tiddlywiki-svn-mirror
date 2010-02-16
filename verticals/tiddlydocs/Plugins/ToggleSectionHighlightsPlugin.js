config.macros.toggleSectionHighlights = {};
config.macros.toggleSectionHighlights.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	var tiddlerElem = story.findContainingTiddler(place);
 	var containingTiddlerTitle = tiddlerElem.getAttribute("tiddler"); 
	button = createTiddlyElement(place, "div", containingTiddlerTitle+"_div", null, 'highlight');
	jQuery(button).toggle(function() {
		jQuery("."+config.macros.toggleSectionHighlights.strip(this.id)).addClass('highlight');
	}, function() {
	  	jQuery("."+config.macros.toggleSectionHighlights.strip(this.id)).removeClass('highlight');
	});
};

config.commands.highlightSection={
	text: "highlight",
	tooltip: "click to see this section highlighted in the active table of content.",
	handler : function(event,src,title) {
		if(jQuery(src).hasClass('highlight')) {
			jQuery(src).removeClass('highlight');
			jQuery("."+config.macros.toggleSectionHighlights.strip(title)+"_div").removeClass('highlight');
		} else {
			jQuery(src).addClass('highlight');
			jQuery("."+config.macros.toggleSectionHighlights.strip(title)+"_div").addClass('highlight');
		}		
	}
}

config.macros.toggleSectionHighlights.strip=function(s) {
	return s.replace(/ /g,'');
}

