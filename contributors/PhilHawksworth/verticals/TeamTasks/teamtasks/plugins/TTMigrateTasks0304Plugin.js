/***
|''Name:''|TTMigrateTasks0304Plugin|
|''Description:''|Migrate task tiddler from TeamTasks v0.3 to TeamTasks v0.4 format|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/Verticals/TeamTasks/teamtasks/plugins/TTMigrateTasks0304Plugin.js |
|''Version:''|0.1|
|''Date:''|Mar 13, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

''About this tool''
The migration tool is designed to be run once in order to update the metadata on older TeamTasks task tiddler.

After running the migration tool, the TiddlyWiki document should be saved in order to retain the modified tiddlers.

After going through this process, this migration tool need not be used again and the call to the macro should then be removed.

''Usage:''
Migrate all v0.3 tasks to the v0.4 format
{{{
<<TTMigrateTasks0304>>
}}}

***/

//{{{
if(!version.extensions.TTMigrateTasks0304Plugin) {
version.extensions.TTMigrateTasks0304Plugin = {installed:true};
	
	config.macros.TTMigrateTasks0304 = {};
	config.macros.TTMigrateTasks0304.converted = 0;
	config.macros.TTMigrateTasks0304.problemTiddlers = 0;
	config.macros.TTMigrateTasks0304.place;
	config.macros.TTMigrateTasks0304.targetMetaVersion = 0.4;
	

	config.macros.TTMigrateTasks0304.log = function(str) {
		createTiddlyElement(config.macros.TTMigrateTasks0304.place,"div",null,null,str);
	};


	config.macros.TTMigrateTasks0304.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

		config.macros.TTMigrateTasks0304.place = place;
		config.macros.TTMigrateTasks0304.log("Converting tasks tiddlers...");		

		var taskTiddlers = store.getTaggedTiddlers("task");					
		for(var t=0; t<taskTiddlers.length; t++) {

			// Find the extended fields to convert.
			store.forEachField(taskTiddlers[t], config.macros.TTMigrateTasks0304.convert, true);

			// Test the result for quality assurance.
			var tt_meta_version = store.getValue(taskTiddlers[t],"tt_tasks_metadata_format_version");
			if(tt_meta_version == config.macros.TTMigrateTasks0304.targetMetaVersion) {
				config.macros.TTMigrateTasks0304.log("Converted to TeamTask v"+ config.macros.TTMigrateTasks0304.targetMetaVersion +" task format: " + taskTiddlers[t].title);
				config.macros.TTMigrateTasks0304.converted++;
			}
			else {
				config.macros.TTMigrateTasks0304.log("... Error. There was a problem converting " + taskTiddlers[t].title + " to TeamTask v"+ config.macros.TTMigrateTasks0304.targetMetaVersion +" task format.");
				config.macros.TTMigrateTasks0304.problemTiddlers++;
			}
		}

		// Brag about the success / apologise for the failure.
		config.macros.TTMigrateTasks0304.log(config.macros.TTMigrateTasks0304.converted + " task tiddlers successfully converted to TeamTask v"+ config.macros.TTMigrateTasks0304.targetMetaVersion +" task format.");	
		if(config.macros.TTMigrateTasks0304.problemTiddlers != 0) {
			config.macros.TTMigrateTasks0304.log("Uh-oh! We had a poblem converting " + config.macros.TTMigrateTasks0304.problemTiddlers + " naughty tiddlers.");
		}
		else
			config.macros.TTMigrateTasks0304.log("No problems. Everything is tickertyboo.");
	};


	config.macros.TTMigrateTasks0304.convert = function(tiddler,fieldName,value){
		// Convert the task metadatafields from the form 'fielddefinitions' to 'tt_field'
		// and add a "tt_tasks_metadata_format_version" field for easier future migrations.
		if(fieldName.substring(fieldName.length-11) == 'definitions'){
		 	var newFieldName = "tt_" + fieldName.substring(0, fieldName.length-11);
			store.setValue(tiddler,newFieldName,value);
			store.setValue(tiddler,fieldName,null);
			store.setValue(tiddler,"tt_tasks_metadata_format_version",config.macros.TTMigrateTasks0304.targetMetaVersion);
		}
	};

} //# end of 'install only once'
//}}}