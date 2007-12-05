/***
|''Name:''|TiddlerDisplayDependenciesPlugin|
|''Description:''|Extends the opening and closing of tiddler in the story to ensure that associated tiddlers are correctly displayed|
|''Dependencies|http://www.osmosoft.com/#ListRelatedPlugin |
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/TiddlerDisplayDependenciesPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Nov 29, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|


Usage:

Including this plugin will simply extend the existing Story.displayTiddler and Story.closeTiddler functions
***/

//{{{
if(!version.extensions.TiddlerDisplayDependenciesPlugin) {
version.extensions.TiddlerDisplayDependenciesPlugin = {installed:true};

	config.macros.TiddlerDisplayDependencies = {};
	config.macros.TiddlerDisplayDependencies.sharingTag = "shared";
	config.macros.TiddlerDisplayDependencies.discoveredNoteTag = "DiscoveredNotes";
	config.macros.TiddlerDisplayDependencies.myNoteTag = "note";
	config.macros.TiddlerDisplayDependencies.sessionTag = "session";
	
	//store the existing displayTiddler function for use later.
	config.macros.TiddlerDisplayDependencies.displayTiddler = story.displayTiddler;
	
	//replace the displayTiddler function.
	story.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle){
		
		var t = typeof(tiddler) == 'string' ? store.getTiddler(tiddler) : tiddler;

		//displayMessage('template: ' + template);

		var editmode = false;
		if(template){ 

			displayMessage('..template: ' + template);

			displayMessage(typeof(template) +" : "+ template);
			if(template == 2) {editmode = true;}
			else if((typeof(template) == 'string') && (template.indexOf("Edit") != -1)) {editmode = true;}
			displayMessage("edit mode: "+ editmode);
		}
		
		//displayMessage('survived the template check');
				
		if( !editmode && t && (t.isTagged(config.macros.TiddlerDisplayDependencies.myNoteTag) || t.isTagged(config.macros.TiddlerDisplayDependencies.discoveredNoteTag))) {
			var s = config.relationships['rapped'].getRelatedTiddlers(store,t.title);
			
			/*
			if(!s) 
				displayMessage("no session tiddlers realted to " +t.title+ " found in the store");
			else 
				displayMessage(s.length + " session tiddlers realted to " +t.title+ " found in the store");

			*/
			
			// display the appropriate session tiddler.
			var s = config.relationships['rapped'].getRelatedTiddlers(store,t.title);
			if(s.length < 1) { 
				displayMessage("No related session tiddler found");
				return;
			}
			var sessionTiddler = store.getTiddler(s[0]);
			if(!sessionTiddler)	{
				displayMessage("No session tiddler found in the store");
				return;
			}
			
			// display the session tiddler
			tiddler = sessionTiddler;
			config.macros.TiddlerDisplayDependencies.displayTiddler.apply(this,arguments);
			
			// examine the displayed tiddlers that rap this session tiddler
			var r = config.relationships['raps'].getRelatedTiddlers(story,sessionTiddler.title);
			var topRelated = store.getTiddler(r[0]);
			if(topRelated && topRelated.isTagged(config.macros.TiddlerDisplayDependencies.myNoteTag)) {
				//display after topRelated
				srcElement = document.getElementById(story.idPrefix + topRelated.title);
				tiddler = t;
				animate = false;
			}
			else {
				//display after sessionTiddler
				srcElement = document.getElementById(story.idPrefix + sessionTiddler.title);
				tiddler = t;
				animate = false;
			}
			config.macros.TiddlerDisplayDependencies.displayTiddler.apply(this,arguments);
		}
		else {
			//TODO: remove logging
			displayMessage("displaying without doing anything special");
			config.macros.TiddlerDisplayDependencies.displayTiddler.apply(this,arguments);
		}
	};
	
	
	//store the existing closeTiddler function for use later.
	config.macros.TiddlerDisplayDependencies.closeTiddler = story.closeTiddler;

	//replace the displayTiddler function.
	story.closeTiddler = function(title,animate,unused){
		var intentedTitle = title;
		var t = store.getTiddler(title);
		if(t && t.isTagged(config.macros.TiddlerDisplayDependencies.sessionTag)) {
			//close all the tiddlers that rap about this session tiddler.
			var r = config.relationships['raps'].getRelatedTiddlers(store,title);
			for (var i=0; i < r.length; i++) {
				title = r[i];
				config.macros.TiddlerDisplayDependencies.closeTiddler.apply(this,arguments);
			};
		}
		//close the tiddler
		title = intentedTitle;
		config.macros.TiddlerDisplayDependencies.closeTiddler.apply(this,arguments);
	};

} //# end of 'install only once'
//}}}