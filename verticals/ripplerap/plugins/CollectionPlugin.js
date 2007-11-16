/******************
 * CollectionPlugin *
 *******************/

/***
|''Name''|CollectionPlugin|
|''Author''|JayFresh|
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]]|
|''Version''|1|
|''~CoreVersion''|2.2.5|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/CollectionPlugin.js|
|''Description''|Provides an abstraction for flagging tiddlers as belonging to a "bucket"; overrides the tiddler's saveTiddler command to set the flag|
|''Syntax''|see below|
|''Status''|@@experimental@@|
|''Contributors''||
|''Contact''|jon at osmosoft dot com|
|''Comments''|please post to http://groups.google.com/TiddlyWikiDev|
|''Dependencies''||
|''Browser''||
|''ReleaseDate''||
|''Icon''||
|''Screenshot''||
|''Tags''||
|''CodeRepository''|see Source above|
! Example use
var t = Collection.getNext();
Collection.pop(t);

! Background

The CollectionPlugin was created for the "RippleRap" project so that tiddlers could be flagged for posting to a server by another method. We did this because RippleRap is designed to be used in conferences, where the wi-fi is notoriously flakey; therefore, we wanted to independently keep track of which files were due for upload and that this status would persist even if the wi-fi dropped out before or during the transfer. The use of the term Collection is to suggest a rough grouping of objects with a shared property.

! Re-use guidelines

The CollectionPlugin overrides the saveTidder command on the EditTemplate ("done"), so can be installed into any TiddlyWiki and used to flag any tiddlers as belonging to a group after they have been edited. The Collection class provides methods for getting at and managing these tiddlers.

***/
//{{{ 
/************
 * Collection *
 ************/
Collection = function() {};

// pushItem works with tiddlers in the story as it assumes that you are hooking into a save event
// can always extend it later to work with store tiddlers if needs be
Collection.push = function(tiddlerElem) {
	var customFields = "inCollection:true";
	story.addCustomFields(tiddlerElem,customFields);
};

// popItem is designed to be called after a successful PUT of a tiddler in the store,
// by the object that pushed the tiddler
Collection.pop = function(tiddler) {
	if(tiddler.fields && tiddler.fields.inCollection && tiddler.fields.inCollection == "true") {
		tiddler.fields.inCollection = "false";
		store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields)
	}
};

Collection.getNext = function() {
	var t = Collection.getAll();
	return (t.length > 0 ? t[0] : false);
};

Collection.getAll = function() {
	var items = [];
	store.forEachTiddler(function(title,t) {
		if (t.fields && t.fields.inCollection && t.fields.inCollection == "true") {
			items.push(t);
		}
	});
	return (items.length > 0 ? items : false);
}

Collection.clear = function() {
	store.forEachTiddler(function(title,t) {
		if (t.fields && t.fields.inCollection && t.fields.inCollection == "true") {
			t.fields.inCollection = "false";
		}
	});
};

// override saveTiddler function to add tiddler to Collection
// TO-DO: tailor this to work for session notes tiddlers only (presumably)
// issue with the above: how to examine tags before new tiddler is saved
Collection.old_saveTiddler = config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler = function(event,src,title) {
	var tiddlerElem = document.getElementById(story.idPrefix + title);
	Collection.push(tiddlerElem);
	Collection.old_saveTiddler.call(this,event,src,title);
}

/*********************
 * showCollectionMacro *
 *********************/
config.macros.showCollection = {};

config.macros.showCollection.handler = function(place) {
	// create a popup of all tiddlers in the Collection
	var tiddlers = Collection.getAll();
	if (tiddlers.length !== 0) {
		var tooltip = "click to show Collection";
		var btn = createTiddlyButton(place,"show Collection " + glyph("downArrow"),tooltip,config.macros.showCollection.onClick,"showCollectionButton");
		btn.tiddlers = tiddlers;
		btn.place = place;
	} else {
		wikify("nothing in Collection",place);
	}
};

config.macros.showCollection.onClick = function(ev) {
	var e = ev ? ev : window.event;
	var tiddlerList = "";
	var tiddlers = this.tiddlers;
	for (var i=0;i<tiddlers.length;i++) {
		tiddlerList += "[[" + tiddlers[i].title + "]]";
	}
	var popup = Popup.create(this,"div","popupTiddler");
	wikify(tiddlerList,popup);
	Popup.show();
	if(e) e.cancelBubble = true;
	if(e && e.stopPropagation) e.stopPropagation();
	return false;
};
//}}}