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
	jw.log('all tiddlers:', t);

	t = jw.store.fetch({modifier: 'PhilHawksworth'});
	jw.log('all tiddlers modified by PhilHawksworth:', t);
	
	t = jw.store.fetch('PhilHawksworth');
	jw.log('The PhilHawksworth tiddler:', t);

	t = jw.store.fetch('PhilHawksworth', {modifier: 'PhilHawksworth'});
	jw.log('the tiddlers of a set of one, modified by PhilHawksworth:', t);
	
	t = jw.store.fetch('PhilHawksworth','JigglyWiki','NotARealTiddler');
	jw.log('2 valid tiddlers (from 3 requested):', t);
		
	t = jw.store.fetch('PhilHawksworth','JigglyWiki','NotARealTiddler', {modifier: 'PhilHawksworth'});
	jw.log('the tiddlers of a set of 3, modified by PhilHawksworth:', t);

	


	
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
