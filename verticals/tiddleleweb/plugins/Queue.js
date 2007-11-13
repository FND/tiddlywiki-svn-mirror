Queue = function() {};

// override saveTiddler function to add tiddler to queue
// TO-DO: tailor this to work for session notes tiddlers only (presumably)
// issue with the above: how to examine tags before new tiddler is saved
Queue.old_saveTiddler = config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler = function(event,src,title) {
	var tiddlerElem = document.getElementById(story.idPrefix + title);
	var customFields = "inqueue:true";
	story.addCustomFields(tiddlerElem,customFields);
	Queue.old_saveTiddler.call(this,event,src,title);
}

config.macros.showQueue = {};

config.macros.showQueue.handler = function(place) {
	// create a popup of all tiddlers in the queue
	var tiddlers = [];
	store.forEachTiddler(function(title,t) {
		if (t.fields && t.fields.inqueue && t.fields.inqueue == "true") {
			tiddlers.push(t);
		}
	});
	if (tiddlers.length !== 0) {
		var tooltip = "click to show queue";
		var btn = createTiddlyButton(place,"show queue " + glyph("downArrow"),tooltip,config.macros.showQueue.onClick,"showQueueButton");
		btn.tiddlers = tiddlers;
		btn.place = place;
	} else {
		wikify("nothing in queue",place);
	}
};

config.macros.showQueue.onClick = function(ev) {
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