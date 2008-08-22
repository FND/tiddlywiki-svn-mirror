jw.controls = {
	'edit': {
		handler: function(tiddler) { jw.editTiddler(tiddler); }
	},
	'save': {
		handler: function(tiddler) { saveChanges(); }
	},
	'save tiddler': {
		handler: function(tiddler) { jw.saveTiddler(tiddler); }
	},
	'cancel': {
		handler: function(tiddler) { jw.cancelEditTiddler(tiddler); }
	},
	'close': {
		handler: function(tiddler) { jw.closeTiddler(tiddler); }
	},
	'close all': {
		handler: function() { jw.closeAllTiddlers(); }
	},
	'jiggle': {
		handler: function() { jw.jiggleStore(); }
	}
};

jw.editTiddler = function(tiddler) {
	var container = $(tiddler).parents('div.story')[0].id;
	var name = jw.getTiddlerNameFromStory(tiddler);
	// jw.displayTiddler(name, tiddler, 'replace', container, 'EditTemplate', true);
	var options = { 
		name:name, 
		relative:tiddler, 
		position:'replace', 
		container: container,
		template: 'EditTemplate',
		overflow: true
	};
	jw.displayTiddler(options);
	// jw.getTiddler(name,container).find('div.text textarea').wysiwyg();
};

jw.cancelEditTiddler = function(tiddler) {
	var container = $(tiddler).parents('div.story')[0].id;
	var name = jw.getTiddlerNameFromStory(tiddler);
	// jw.displayTiddler(name, tiddler, 'replace', container, 'ViewTemplate', true);
	var options = { 
		name:name, 
		relative:tiddler, 
		position:'replace', 
		container: container,
		overflow: true
	};
	jw.displayTiddler(options);	
};


jw.saveTiddler = function(tiddler) {
	var n = jw.getTiddlerNameFromStory(tiddler);
	
	// name
	
	// text
	var text = tiddler.find("div.text textarea")[0].value;
	var t = jw.getTiddler(n,'store');
	storedTextDiv = t.find('div.text');
	storedTextDiv.html(text);

	// tags
	
	// meta
	
	// Reflect the changes in the UI.
	jw.cancelEditTiddler(tiddler);
	
};

jw.closeTiddler = function(tiddler) {
	tiddler.slideUp( function(){
	 	tiddler.remove();
	});	
};

jw.closeAllTiddlers = function() {
	$('div.story div.tiddler').each(function(){
		jw.closeTiddler($(this));
	});	
};
