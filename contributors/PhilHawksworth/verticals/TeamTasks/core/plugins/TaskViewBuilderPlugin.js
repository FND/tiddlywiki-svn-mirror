/***
|''Name:''|TaskViewBuilderPlugin |
|''Description:''|Allow a user to generate a custom aggregate view of tasks based on extended fields |
|''Version:''|0.0.2 |
|''Date:''|Sep 25, 2007 |
|''Source:''|http://www.hawksworx.com/playground/TeamTasks/#ValueTogglerPlugin |
|''Author:''|PhilHawksworth (phawksworth (at) gmail (dot) com) |
|''License:''|[[BSD open source license]] |
|''CoreVersion:''|2.2|
***/

//{{{
// Ensure that this Plugin is only installed once.
if(!version.extensions.TaskViewBuilder) 
{
	version.extensions.TaskViewBuilder = {installed:true};
	config.macros.TaskViewBuilder = {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			var tiddlers = store.getTaggedTiddlers('task');		
			var tasks = [];
			var excludedTasks = [];
			
			if(params.length == 0) {
				tasks = tiddlers;
			}
			else {
				var tag;
				for (var i=0; i < params.length; i++) {
					tag = params[i];
					if(tag[0] == '!') {
						tag = tag.substr(1);
						excludedTasks = this.findFlaggedTiddlers(tiddlers, tag);
						if(params.length == 1) {
							tasks = tiddlers;
						}
					}
					else {
						if(i==0) {
							tasks = this.findFlaggedTiddlers(tiddlers, tag);
						}
						else {
							tasks = this.findFlaggedTiddlers(tasks, tag);
						}
					}
				}
			}

			for (var i=0; i < tasks.length; i++) {
				if(excludedTasks.find(tasks[i]) === null) {			
					createTiddlyLink(place,tasks[i].title,true);
					createTiddlyElement(place,'br',null,null, null);	
				}		
			}
		},
		
		findFlaggedTiddlers : function(tiddlers, flag) {
			var flagElements = flag.split('=');
			var attr = flagElements[0];
			var val = flagElements[1];
			var flaggedTiddlers = [];
			for (var i=0; i < tiddlers.length; i++) {			
				if(store.getValue(tiddlers[i], attr) == val) {
					flaggedTiddlers.push(tiddlers[i]);
				}
			}
			return flaggedTiddlers;
		}
	};
}
//}}}