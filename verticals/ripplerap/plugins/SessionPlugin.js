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
		
				// Development data. This is placeholder data and should be replaced with values gathered from the downloaded tiddlers.
				user = "from Anne Other";
				datestamp = 200711140000;
				text = "Text from someone else's tiddlywiki	";
		
				//looking for my notes
				if(whose == 'mine'){
					if(tiddler.modifier == config.options.txtUserName) {
						console.log('mine');
						t = story.createTiddler(place,null,title,'mySessionNoteViewTemplate',null);
						t.text = text;
						t.modifier = user;
						t.modified= datestamp;
					}

				}
				//looking for discovered notes
				else if(whose == 'discovered'){
					if(tiddler.modifier != config.options.txtUserName){
						console.log('discovered');
						t = story.createTiddler(place,null,title,'discoveredNoteViewTemplate',null);
						t.text = text;
						t.modifier = user;
						t.modified= datestamp;	
					}	
				}
			}
			
		});
};

config.commands.makeNotes = {text: "make notes", tooltip: "make notes about this session"};
config.commands.makeNotes.handler = function(event,src,title)
{
	var t = title + " from " + config.options.txtUserName;
	var n = store.getTiddler(t);
	if(!n) {
		var body = 'double-click to start making notes';
		var container = story.findContainingTiddler(src);
		var mynotes = getElementsByClassName('mySessionNotes', 'div', container);
		store.saveTiddler(t, t, body, config.options.txtUserName, null, 'note', null, true, null);
	}
	story.displayTiddler(null,t);
	//story.displayTiddler(null,title,DEFAULT_EDIT_TEMPLATE,false,null,null);
	return false;
};



} //# end of 'install only once'
//}}}