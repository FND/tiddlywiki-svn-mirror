// create a jigglwiki namsespace in jquery land.
var jw = jq.extend({});


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
	
	jw.store = jq('#store').hide().tiddlerStore();
	
	jw.showDefaultTiddlers();
	// jw.addEventHandlers();
	// jw.pagemap.render();
};


// Show the default tiddlers
jw.showDefaultTiddlers = function() {

	var tiddler = jw.store.fetch('DefaultTiddlers');
	tiddler.find('div.entry-content a.tiddlerLink').each(function(){
		jw.displayTiddler(jq(this));
	});
	
	// var links = jw.getTiddlerData('DefaultTiddlers', 'store').tiddlerLinks;	
	// links.each(function(){	
	// 	jw.displayTiddler( jq(this).attr('href'), { 
	// 		container: container,
	// 		template: 'ViewTemplate',
	// 		overflow: true,
	// 		animate: false
	// 	});	
	// });	
};


jw.displayTiddler = function(link, options) {
	
	jw.log('in displayTiddler');

	if(typeof link == 'string') {
		var name = link;
	} else {
		var name = link.text();		
	}
	var t = jw.store.fetch(name).clone();
	jq(t).jw_expandMacros();
	jq('#story1').append(t);
};


