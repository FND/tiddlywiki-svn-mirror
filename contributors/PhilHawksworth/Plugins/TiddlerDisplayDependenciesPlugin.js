/***
|''Name:''|TiddlerDisplayDependenciesPlugin|
|''Description:''|Extends the opening and closing of  tiddler in the story to ensure that associated tiddlers are correctly displayed|
|''Dependencies||
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
	
	// inspect an array of tiddlers and return an array of those whioch are currently present in the story.
	config.macros.TiddlerDisplayDependencies.displayedInStory = function(tiddlers){
		var inStory = [];
		for (var t=0; t < tiddlers.length; t++) {
			var tiddlerElem = document.getElementById(story.idPrefix + tiddlers[t]);
			if(tiddlerElem){
				inStory.push(tiddlers[t]);
			}
		};
		return inStory;
	};
	

	//TODO: Handle edit view.
	
	//store the existing displayTiddler function for use later.
	config.macros.TiddlerDisplayDependencies.displayTiddler = story.displayTiddler;
	
	//replace the displayTiddler function.
	story.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle){
		
		var t = typeof(tiddler) == 'string' ? store.getTiddler(tiddler) : tiddler;

		if( t && (t.isTagged('notes') || t.isTagged('DiscoveredNotes'))) {
		
			// display the appropriate session tiddler.
			var s = config.relationships['rapped'].getRelatedTiddlers(store,t.title);
			if(s.length < 1) { 
				console.log("No related session tiddler found");
				return;
			}
			var sessionTiddler = store.getTiddler(s[0]);
		
		
			//TODO: remove debug logging
			console.log("we must ensure that "+ sessionTiddler.title + " is displayed");
			
			
			// display the session tiddler
			tiddler = sessionTiddler;
			config.macros.TiddlerDisplayDependencies.displayTiddler.apply(this,arguments);
			
			// examine the displayed tiddlers that rap this session tiddler
			var r = config.relationships['raps'].getRelatedTiddlers(store,sessionTiddler.title);
			
			//TODO: remove debug logging
			console.log("related in store "+ r.join(", "));
			
			r = config.macros.TiddlerDisplayDependencies.displayedInStory(r);

			//TODO: remove debug logging
			console.log("related in store "+ r.join(", "));

		
			//TODO: remove debug logging
			console.log("related: " + r.length);
		
		
			topRelated = store.getTiddler(r[0]);
			if(topRelated && topRelated.isTagged('notes')) {
				
				//TODO: remove debug logging
				console.log("Displaying directly after my notes tiddler: "+ topRelated.title + " ("+ topRelated.tags +")");
			
				//display after topRelated
				srcElement = document.getElementById(story.idPrefix + topRelated.title);
				tiddler = t;
				animate = false;
			}
			else{
				
				//TODO: remove debug logging
				console.log("Displaying directly after session tiddler: "+ sessionTiddler.title);
				
				//display after sessionTiddler
				srcElement = document.getElementById(story.idPrefix + sessionTiddler.title);
				tiddler = t;
				animate = false;
			}
			config.macros.TiddlerDisplayDependencies.displayTiddler.apply(this,arguments);
		}
		else {
			config.macros.TiddlerDisplayDependencies.displayTiddler.apply(this,arguments);
		}
	};
	
	
	//store the existing closeTiddler function for use later.
	config.macros.TiddlerDisplayDependencies.closeTiddler = story.closeTiddler;

	//replace the displayTiddler function.
	story.closeTiddler = function(title,animate,unused){
		var intentedTitle = title;
		var t = store.getTiddler(title);
		if(t && t.isTagged('session')) {
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