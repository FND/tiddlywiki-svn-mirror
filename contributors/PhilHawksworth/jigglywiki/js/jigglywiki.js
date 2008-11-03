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
	
	// create a store and hide the html which describes it.
	jw.store = jq('#store').tiddlerStore();
	// jq('#store').hide();
	jw.showDefaultTiddlers();
	// jw.pagemap.render();
};


// Show the default tiddlers
jw.showDefaultTiddlers = function() {
	var tiddler = jw.store.fetch('DefaultTiddlers');
	tiddler.find('div.entry-content a.tiddlerLink').each(function(){
		jw.displayTiddler(jq(this), {
			overflow: true,
			animate: false
		});
	});

};


// Display a tiddler in a story element.
jw.displayTiddler = function(link, options) {
	
	var defaults = {
		container: '#story1',
		theme: 'DefaultTheme',
		template: 'ViewTemplate',
		overflow: false,
		animate: true
	};
	var opts = jq.extend({}, defaults, options);
	
	if(typeof link == 'string') {
		var name = link;
	} else {
		var name = link.text();		
	}
	
	var themeTiddler = jw.store.fetch(opts.theme);
	console.log('displayTiddler', name, opts, themeTiddler);
	
	
	
	var t = jw.store.fetch(name).clone();
	
	// Add a command bar to the tiddler.
	var commandBar = "<div class='commandBar'><a href='#' class='command close'>close tiddler</a><a href='#' class='command edit'>edit tiddler</a></div>";
	t.prepend(commandBar);
	
	jq(t).jw_expandMacros();
	jq('#story1').append(t);

};


