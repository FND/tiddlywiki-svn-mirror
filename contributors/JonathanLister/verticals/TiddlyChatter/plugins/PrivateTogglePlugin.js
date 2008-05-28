config.macros.privateToggle = {
	caption:"Private",
	checked:false,
};

config.macros.privateToggle.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var private = tiddler.isTagged("private");
	var theBox = createTiddlyCheckbox(place,this.caption,private);
	var on = function() {
		config.macros.privateToggle.toggle.call(this,true,"private");
		return true;
	};
	var off = function() {
		config.macros.privateToggle.toggle.call(this,false,"private");
		return true;
	};
	theBox.onclick = private ? off : on;
	theBox.tiddler = tiddler;
};

// onclick for private checkbox; 'this' refers to the checkbox
config.macros.privateToggle.toggle = function(status,tag) {

	var tiddler = this.tiddler;
	if (tag) {
		tiddler.tags.splice(tiddler.tags.indexOf(tag),1);
	}
	store.setTiddlerTag(tiddler.title,status,tag);
};