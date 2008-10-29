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
	
	jw.store = jq('#store').tiddlerStore();
	
	var t;
	t = jw.store.fetch();
	jw.log('all tiddlers: ', t);
	
	t = jw.store.fetch('PhilHawksworth');
	jw.log('one tiddler: ', t);
	
	t = jw.store.fetch(['PhilHawksworth','JigglyWiki','NotARealTiddler']);
	jw.log('some tiddlers: ', t);
	
	t = jw.store.fetch({
		modifier: 'PhilHawksworth'
	});
	jw.log('filtered tiddlers: ', t);	
	
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
