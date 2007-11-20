/***
|''Name:''|SessionPlugin|
|''Description:''|Macros to support session|
|''Author:''|MartinBudden, PhilHawksworth|
|''Source:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/SessionPlugin.js|
|''CodeRepository:''|see Source above|
|''Version:''|0.0.1|
|''Status:''|Not for release - this is a template for creating new plugins|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

To make this example into a real TiddlyWiki adaptor, you need to:

***/

function getElementsByClassName(className, tag, elm){
	var testClass = new RegExp("(^|\\\\s)" + className + "(\\\\s|$)");
	var tag = tag || "*";
	var elm = elm || document;
	var elements = (tag == "*" && elm.all)? elm.all : elm.getElementsByTagName(tag);
	var returnElements = [];
	var current;
	var length = elements.length;
	for(var i=0; i<length; i++){
		current = elements[i];
		if(testClass.test(current.className)){
			returnElements.push(current);
		}
	}
	return returnElements;
}

//# Save any open edit fields of a tiddler and updates the display as necessary
//# title - name of tiddler
//# minorUpdate - true if the modified date shouldn't be updated
//# returns: title of saved tiddler, or null if not saved
Story.prototype.saveTiddler = function(title,minorUpdate)
{
	var tiddlerElem = document.getElementById(this.idPrefix + title);
	if(tiddlerElem != null) {
		var fields = {};
		this.gatherSaveFields(tiddlerElem,fields);
		var newTitle = fields.title ? fields.title : title;
		if(store.tiddlerExists(newTitle) && newTitle != title) {
			if(!confirm(config.messages.overwriteWarning.format([newTitle.toString()])))
				return null;
		}
		if(newTitle != title)
			this.closeTiddler(newTitle,false);
		tiddlerElem.id = this.idPrefix + newTitle;
		tiddlerElem.setAttribute("tiddler",newTitle);
		tiddlerElem.setAttribute("template",DEFAULT_VIEW_TEMPLATE);
		tiddlerElem.setAttribute("dirty","false");
		if(config.options.chkForceMinorUpdate)
			minorUpdate = !minorUpdate;
		if(!store.tiddlerExists(newTitle))
			minorUpdate = false;
		var newDate = new Date();
		var extendedFields = store.tiddlerExists(newTitle) ? store.fetchTiddler(newTitle).fields : (newTitle!=title && store.tiddlerExists(title) ? store.fetchTiddler(title).fields : {});
		for(var n in fields) {
			if(!TiddlyWiki.isStandardField(n))
				extendedFields[n] = fields[n];
		}
		if(global_save_tiddler.notetitle!==null) {
			var tiddler = store.saveTiddler(global_save_tiddler.notetitle,global_save_tiddler.notetitle,fields.text,minorUpdate ? undefined : config.options.txtUserName,minorUpdate ? undefined : newDate,fields.tags,extendedFields);
			global_save_tiddler.notetitle = null;
			var t = store.getTiddler(title);
			t.text = global_save_tiddler.text;
		} else {
			tiddler = store.saveTiddler(title,newTitle,fields.text,minorUpdate ? undefined : config.options.txtUserName,minorUpdate ? undefined : newDate,fields.tags,extendedFields);
		}
		autoSaveChanges(null,[tiddler]);
		return newTitle;
	}
	return null;
};

config.commands.cancelTiddler.handlerOrig = config.commands.cancelTiddler.handler;
config.commands.cancelTiddler.handler = function(event,src,title)
{
	config.commands.cancelTiddler.handlerOrig(event,src,title);
	global_save_tiddler.notetitle = null;
};

//{{{
if(!version.extensions.SessionPlugin) {
version.extensions.SessionPlugin = {installed:true};

config.macros.sessionAnnotation = {};
config.macros.sessionAnnotation.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = tiddler.title;
	createTiddlyElement(place,'span', null, 'time', store.getTiddlerSlice(title,"start") + " - " + store.getTiddlerSlice(title,"end"));
	createTiddlyElement(place,'span', null, 'speaker', store.getTiddlerSlice(title,"speaker"));
	createTiddlyElement(place,'div', null, 'synopsis', store.getTiddlerSlice(title,"synopsis"));	
};

config.macros.sessionNotes = {};
config.macros.sessionNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var whose = params[0];
	var ct = tiddler.title;
		var t, user, datestamp, text = null;
		store.forEachTiddler(function(title,tiddler) {
			
			// cycle through all of the sessions tiddler fo this session 
			if(title.startsWith(ct) && ct!=title) {
		
				//looking for my notes
				if(whose == 'mine'){
					if(tiddler.modifier == config.options.txtUserName) {
						var e = createTiddlyElement(place,'div', null, 'myNote');
						createTiddlyElement(e,'div', null, 'modifier', tiddler.modifier);
						createTiddlyElement(e,'div', null, 'text', tiddler.text);
					}
				}
				//looking for discovered notes
				else if(whose == 'discovered'){
					if(tiddler.modifier != config.options.txtUserName){
						e = createTiddlyElement(place,'div', null, 'discoveredNote');
						createTiddlyElement(e,'div', null, 'modifier', tiddler.modifier);
						createTiddlyElement(e,'div', null, 'text', tiddler.text);
					}	
				}
			}
		});
};

var global_save_tiddler = {notetitle:null,text:null};

config.commands.makeNotes = {text: "make notes", tooltip: "make notes about this session"};
config.commands.makeNotes.handler = function(event,src,title)
{
	var t = title + " from " + config.options.txtUserName;
	var container = story.findContainingTiddler(src);
	
	var tiddlerElem = document.getElementById(story.idPrefix + title);
	var fields = tiddlerElem.getAttribute("tiddlyFields");

	var tiddler = store.getTiddler(title);
	global_save_tiddler.notetitle = t;
	global_save_tiddler.text = tiddler.text;
	tiddler.text = store.getTiddler(t).text;

	story.displayTiddler(null,title,'mySessionNoteEditTemplate',false,null,fields);
	story.focusTiddler(title,"text");
	return false;
	
	
	// 
	// var n = store.getTiddler(t);
	// if(!n) {
	// 	var body = 'double-click to start making notes';
	// 	var container = story.findContainingTiddler(src);
	// 	var mynotes = getElementsByClassName('mySessionNotes', 'div', container);
	// 	store.saveTiddler(t, t, body, config.options.txtUserName, null, 'note', null, true, null);
	// }
	// 
	
	
};



} //# end of 'install only once'
//}}}