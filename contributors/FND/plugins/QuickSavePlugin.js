/***
|''Name''|QuickSavePlugin|
|''Description''|provides command for staying in edit mode when saving|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://devpad.tiddlyspot.com/#QuickSavePlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Keywords''|editing saving|
!Usage
Add {{{quickSaveTiddler}}} [[command|http://www.tiddlywiki.org/wiki/Tiddler_Toolbar]] to [[ToolbarCommands]].
!Revision History
!!v0.1 (2009-01-09)
* initial release
!Code
***/
//{{{
(function() { //# set up local scope

if(!version.extensions.QuickSavePlugin) { //# ensure that the plugin is only installed once
version.extensions.QuickSavePlugin = { installed: true };

config.messages.draftSaved = "Draft saved: %0";

config.commands.quickSaveTiddler = {
	text: "save",
	tooltip: "Save changes to this tiddler",

	handler: function(event,src,title) {
		var newTitle = story.saveTiddler(title,event.shiftKey,true);
		return false;
	}
};

// override saveTiddler to make template-switching optional
Story.prototype.saveTiddler = function(title,minorUpdate,keepView) // TODO: rename template/view argument
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem) {
		var fields = {};
		this.gatherSaveFields(tiddlerElem,fields);
		var newTitle = fields.title || title;
		if(!store.tiddlerExists(newTitle)) {
			newTitle = newTitle.trim();
		}
		if(store.tiddlerExists(newTitle) && newTitle != title) {
			if(!confirm(config.messages.overwriteWarning.format([newTitle.toString()]))) {
				return null;
			}
		}
		if(newTitle != title) {
			this.closeTiddler(newTitle,false);
		}
		tiddlerElem.id = this.tiddlerId(newTitle);
		tiddlerElem.setAttribute("tiddler",newTitle);
		if(!keepView) {
			tiddlerElem.setAttribute("template",DEFAULT_VIEW_TEMPLATE);
		}
		tiddlerElem.setAttribute("dirty","false");
		if(config.options.chkForceMinorUpdate) {
			minorUpdate = !minorUpdate;
		}
		if(!store.tiddlerExists(newTitle)) {
			minorUpdate = false;
		}
		var newDate = new Date();
		var extendedFields = store.tiddlerExists(newTitle) ? store.fetchTiddler(newTitle).fields : (newTitle!=title && store.tiddlerExists(title) ? store.fetchTiddler(title).fields : merge({},config.defaultCustomFields));
		for(var n in fields) {
			if(!TiddlyWiki.isStandardField(n)) {
				extendedFields[n] = fields[n];
			}
		}
		var tiddler = store.saveTiddler(title,newTitle,fields.text,minorUpdate ? undefined : config.options.txtUserName,minorUpdate ? undefined : newDate,fields.tags,extendedFields);
		if(keepView && tiddler && !config.options.chkAutoSave) { // XXX: hacky!?
			displayMessage(config.messages.draftSaved.format([tiddler.title])); // XXX: "saved" confusing; displayMessage unsuitable for feedback?
		}
		autoSaveChanges(null,[tiddler]);
		return newTitle;
	}
	return null;
};

} //# end of "install only once"

})(); //# end of local scope
//}}}
