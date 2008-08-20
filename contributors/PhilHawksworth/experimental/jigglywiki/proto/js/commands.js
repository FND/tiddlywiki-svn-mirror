jigglywiki.controls = {
	'edit': {
		handler: function(tiddler) { editTiddler(tiddler); }
	},
	'save': {
		handler: function(tiddler) { saveChanges(); }
	},
	'save tiddler': {
		handler: function(tiddler) { saveTiddler(tiddler); }
	},
	'cancel': {
		handler: function(tiddler) { cancelEditTiddler(tiddler); }
	},
	'close': {
		handler: function(tiddler) { closeTiddler(tiddler); }
	},
	'close all': {
		handler: function() { closeAllTiddlers(); }
	},
	'jiggle': {
		handler: function() { jiggleStore(); }
	}
};


function editTiddler(tiddler) {
	var container = $(tiddler).parents('div.story')[0].id;
	var name = getTiddlerNameFromStory(tiddler);
	displayTiddler(name, tiddler, 'replace', container, 'EditTemplate', true);
	// getTiddler(name,container).find('div.text textarea').wysiwyg();
}

function cancelEditTiddler(tiddler) {
	var container = $(tiddler).parents('div.story')[0].id;
	var name = getTiddlerNameFromStory(tiddler);
	displayTiddler(name, tiddler, 'replace', container, 'ViewTemplate', true);
}

function saveTiddler(tiddler) {
	
	var n = getTiddlerNameFromStory(tiddler);
	
	// name
	
	// text
	var text = tiddler.find("textarea[macro='view property:text']")[0].value;
	var t = getTiddler(n,'store');
	storedTextDiv = t.find('div.text');
	storedTextDiv.html(text);

	// tags
	
	// meta
	
	// Reflect the changes in the UI.
	cancelEditTiddler(tiddler);
}

function closeTiddler(tiddler) {
	tiddler.slideUp( function(){
	 	tiddler.remove();
	});
}

function closeAllTiddlers() {
	$('div.tiddler').each(function(){
		closeTiddler($(this));
	});
}