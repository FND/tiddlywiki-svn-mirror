/***
|Name:|NewMeansNewPlugin|
|Description:|If 'New Tiddler' already exists then create 'New Tiddler (1)' and so on|
|Version:|1.1 ($Rev: 2263 $)|
|Date:|$Date: 2007-06-13 04:22:32 +1000 (Wed, 13 Jun 2007) $|
|Source:|http://mptw.tiddlyspot.com/empty.html#NewMeansNewPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License|http://mptw.tiddlyspot.com/#TheBSDLicense|
!!Note: I think this should be in the core
***/
//{{{

String.prototype.getNextFreeName = function() {
       var numberRegExp = / \(([0-9]+)\)$/;
       var match = numberRegExp.exec(this);
       if (match) {
               var num = parseInt(match[1]) + 1;
               return this.replace(numberRegExp," ("+num+")");
       }
       else {
               return this + " (1)";
       }
}

config.macros.newTiddler.checkForUnsaved = function(newName) {
	var r = false;
	story.forEachTiddler(function(title,element) {
		if (title == newName)
			r = true;
	});
	return r;
}

config.macros.newTiddler.getName = function(newName) {
       while (store.getTiddler(newName) || config.macros.newTiddler.checkForUnsaved(newName))
               newName = newName.getNextFreeName();
       return newName;
}


config.macros.newTiddler.onClickNewTiddler = function()
{
	var title = this.getAttribute("newTitle");
	if(this.getAttribute("isJournal") == "true") {
		var now = new Date();
		title = now.formatString(title.trim());
	}

	title = config.macros.newTiddler.getName(title); // <--- only changed bit

	var params = this.getAttribute("params");
	var tags = params ? params.split("|") : [];
	var focus = this.getAttribute("newFocus");
	var template = this.getAttribute("newTemplate");
	var customFields = this.getAttribute("customFields");
	story.displayTiddler(null,title,template,false,null,null);
	var tiddlerElem = document.getElementById(story.idPrefix + title);
	if(customFields)
		story.addCustomFields(tiddlerElem,customFields);
	var text = this.getAttribute("newText");
	if(typeof text == "string")
		story.getTiddlerField(title,"text").value = text.format([title]);
	for(var t=0;t<tags.length;t++)
		story.setTiddlerTag(title,tags[t],+1);
	story.focusTiddler(title,focus);
	return false;
};

//}}}

