// create a jigglwiki namsespace.
var jw = jq.fn.jw = {};


// DOM ready. Let's go!
jq(document).ready(function() {
	
	loadJQueryExtensions();
	jw.init();
	
});


jw.log = function() {
	if(window.console && window.console.log) {
		console.log(arguments);
	} else {
		alert(arguments);
	}
};



jw.init = function() {
	
	jq('div.tiddler').hide();
	// jw.showDefaultTiddlers();
	// jw.addEventHandlers();
	// jw.pagemap.render();
};


// Show the default tiddlers
jw.showDefaultTiddlers = function(container) {
	var container = container ? container : "story1";
	var links = jw.getTiddlerData('DefaultTiddlers', 'store').tiddlerLinks;	
	links.each(function(){	
		jw.displayTiddler( jq(this).attr('href'), { 
			container: container,
			template: 'ViewTemplate',
			overflow: true,
			animate: false
		});	
	});	
};
