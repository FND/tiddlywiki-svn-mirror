///////////
// original tiddlywiki support
var config = {};
config.options = {};
config.options.txtFileSystemCharSet = 'UTF-8';
///////////


$(document).ready(function(){
	loadJQueryExtensions();
	jw.init();
});	


var jw = {};

jw.log = function(str) {
	if(window.console && window.console.log) {
		console.log(str);
	} else {
		alert(str);
	}
};


// We are ready to prepare the jigglywiki document.
jw.init = function() {
	$('div.tiddler').hide();
	jw.showDefaultTiddlers();
	jw.addEventHandlers();
	// runSpeedTests();
};


// Show the default tiddlers
jw.showDefaultTiddlers = function(container) {
	var container = container ? container : "story1";
	var links = jw.getTiddlerData('DefaultTiddlers', 'store').tiddlerLinks;	
	links.each(function(){
		var tiddlerName = $(this).attr('href');
		jw.displayTiddler(tiddlerName, null, null, container, 'ViewTemplate', true);
	});	
};


jw.makeTiddlerLink = function(title) {
	var safe = title.replace(/ /g,'_');
	return '<a class=\'tiddlerLink\' href=\'#tiddler:'+safe+'\'>'+title+'</a>';
};




// ===================
// = Tiddler queries =
// ===================


// return the tiddler that this element belongs to.
jw.containingTiddler = function(ele) {
	var tiddler = $(ele).parents('div.tiddler');
	if(tiddler.length == 1) {
		return tiddler;
	} else {
		return null;
	}	
};


// return a tiddler object.
jw.getTiddler = function(name, container) {
	if(typeof name == 'string') {
		name = name.replace("#tiddler:","");
		name = name.replace("tiddler:","");		
		var t = $("#"+container+" div.tiddler a.tiddlerName[name='tiddler:"+name+"']").parents('div.tiddler');
		if(t.length > 0) {
			return t;
		} else {
			return null;
		}
	} else {
		t = $("#"+container).find(name)[0];
		return t;
	}	
};


// return all tiddler divs from a container
jw.getAllTiddlers = function(container) {
	var t = $('#'+container+' div.tiddler');
	if(t.length !== 0) {
		return t;
	} else {
		return null;
	}	
};


// return tiddlers which have the specified tag
jw.getTiddlersByTag = function(tag, container) {
	var t = $('#'+container+' ul.tags li a[href=#tiddler:'+ tag +']').parents('div.tiddler');
	if(t.length !== 0) {
		return t;
	} else {
		return null;
	}
};


// return tiddlers which have the pecified modifier
jw.getTiddlersByModifier = function(modifier, container) {
	return jw.getTiddlersByField('modifier', modifier, container);	
};


// return tiddlers with a specified field value
jw.getTiddlersByField = function(field, value, container) {
	var t = $('#'+container+' ul.meta li:contains("'+field+'")').find('span:contains("'+value+'")').parents('div.tiddler');
	if(t.length !== 0) {
		return t;
	} else {
		return null;
	}	
};


// return tiddlers which contain specified text
jw.getTiddlersByText = function(text, container) {
	var t = $("#"+container+" div.tiddler div.text:contains('"+text+"')").parents("div.tiddler");
	if(t.length !== 0) {
		return t;
	} else {
		return null;
	}	
};


jw.getTiddlerNameFromStory = function(tiddler) {
	return $(tiddler).find('a.tiddlerName').attr('name');	
};


// return an object containing jQuery objects for each piece of tiddler data.
jw.getTiddlerData = function(name, container) {
	var t = $(jw.getTiddler(name, 'store'));
	var data = null;
	if(t) {
		data = {};
		data['title'] = t.find('h1.tiddlerName');
		data['tiddlerName'] = data['title'].text().replace(/ /g,'_');
		data['text'] = t.find('div.text').get(0);
		data['tiddlerLinks'] = t.find('div.text a.tiddlerLink');
		data['tags'] = t.find('ul.tags li');
		t.find('ul.meta li').each(function(i,m){
			data[$(m).find('i').text()] = $(m).find('span').text();
		});
	}
	return data;	
};

// jiggle the tiddlers in the store to echo the order in which they are displayed in the story(ies).
jw.jiggleStore = function() {
	$('div.story > div.tiddler').reverse().each(function(t){
		n = jw.getTiddlerNameFromStory(this);
		t = jw.getTiddler(n,"store");
		t.remove();
		t.prependTo($('#store'));
	});
	jw.log('jiggled');
};



