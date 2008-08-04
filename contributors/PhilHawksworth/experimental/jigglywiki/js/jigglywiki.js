
var jigglywiki = {};

// We don't include the jQuery library when we server the page.
// If it isn't here, we should get it from Google and then save 
// it as part of the page or future sessions.
if(typeof jQuery != 'function') {
	var head = document.getElementsByTagName("head")[0];
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js";
	head.appendChild(script);
	jQueryReady();
} else {
	jQueryReady();
}

function jQueryReady() {
	if(typeof jQuery != 'function') {
		setTimeout(function() {jQueryReady();},100);
	} else {
		loadJQueryExtensions();
		$(document).ready(function(){
			initJigglyWiki(); 
		});
	}
}

function initJigglyWiki() {
	$('div.tiddler').hide();
	showDefaultTiddlers();
	addEventHandlers();
}

// Show the default tiddlers
function showDefaultTiddlers(container) {
	var container = container ? container : "story1";
	var links = getTiddlerData('DefaultTiddlers', 'store').tiddlerLinks;	
	links.each(function(){
		var tiddlerName = $(this).attr('href');
		displayTiddler(tiddlerName, null, null, container, 'ViewTemplate', true);
	});
}

function containingTiddler(ele) {
	var tiddler = $(ele).parents('div.tiddler');
	if(tiddler.length == 1) {
		return tiddler;
	} else {
		return null;
	}
}

// return a tiddler object.
function getTiddler(name, container) {
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
}

function getTiddlerNameFromStory(tiddler) {
	return $(tiddler).find('a.tiddlerName').attr('name');
}

// return an object containing jQuery objects for each piece of tiddler data.
function getTiddlerData(name, container) {
	var t = getTiddler(name, 'store');
	var data = null;
	if(t) {
		data = {};
		data['title'] = t.find('h1.tiddlerName');
		data['tiddlerName'] = data['title'].text().replace(/ /g,'_');
		data['text'] = t.find('div.text').get(0);
		data['tiddlerLinks'] = t.find('div.text a.tiddlerLink');
		data['tags'] = t.find('ul.tags li');
		t.find('ul.meta li').each(function(i,m){
			data[$(m).find('i').text()] = $(m).find('a');
		});
	}
	return data;
}

// jiggle the tiddlers in the store to echo the order in which they are displayed in the story(ies).
function jiggleStore() {
	$('div.story > div.tiddler').reverse().each(function(t){
		n = getTiddlerNameFromStory(this);
		t = getTiddler(n,"store");
		t.remove();
		t.prependTo($('#store'));
	});
	console.log("jiggled!");
}
