/***
|''Name:''|TTReportViewPlugin|
|''Description:''|Add a messaging console with acticity monitor to a Tiddlywiki|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/Verticals/TeamTasks/teamtasks/plugins/TTReportView.js |
|''Version:''|0.0.1|
|''Date:''|Jan 23, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

''Usage:''

Create a view of the task list showing default values.
{{{
<<TTReportViewPlugin >>
}}}

Create a view of the task list showing specified fields in a given order and filtering the results.
{{{
<<TTReportView DisplayFields:"field1,field2,field3" OrderBy:"field1,asc" fieldName:"filterValue" fieldName:"!filterValue">>
}}}

for example
{{{
<<TTReportView DisplayFields:"TaskName,AssignedTo,TargetDate" OrderBy:"TargetDate,asc" Status:"!closed" Project:"BigProject">>	
}}}



***/

//{{{
if(!version.extensions.TTReportViePlugin) {
version.extensions.TTReportViewPlugin = {installed:true};
	
	config.macros.TTReportView = {};
	config.macros.TTReportView.log = function(str) {
		if(window.console) {
			console.log(str);
			return;
		}
	};
	
	config.macros.TTReportView.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
				
		fieldPrefix = "tt_";		
				
		//gather all of the parameters.
		var params = paramString.parseParams("anon",null,true,false,false);
		var fieldString = getParam(params,"DisplayFields",'title,'+fieldPrefix+'status');
		var displayFields = fieldString.split(",");
		var orderString = getParam(params,"OrderBy",null);
		var orderField =  fieldPrefix + orderString.split(",")[0];
		var order =  orderString.split(",")[1];				
		var expectedParams = ['DisplayFields','OrderBy'];
		var filters = [];
		for(var p in params) {
			var name = params[p].name;
			var value = params[p].value;
			
			//interpret and store the filter values.				
			if((name && name != 'undefined') &!expectedParams.contains(name)) {
				var testResult = true;
				if(value.substring(0,1) == "!") {
					testResult = false;
					var str = value.substring(1);
				}
				else {
					var str = value;	
				}
				filters.push({'field':fieldPrefix + name, 'value':str, 'testResult':testResult});		
			}
		}
					
		//collect the pertinent tiddlers.
		var taskTiddlers = store.getTaggedTiddlers("task");
		var toConsider = [];
		var toDisplay = [];		
		var toExclude = [];
	
		// first get all the tiddlers we might wnat to include.
		for(var t=0; t<taskTiddlers.length; t++) {
			for(var f=0; f<filters.length; f++) {
				if(filters[f].testResult == true) {
					if(store.getValue(taskTiddlers[t], filters[f].field).toLowerCase() == filters[f].value)
						toConsider.push(taskTiddlers[t]);
				}
			}
		}
		this.log('toConsider :' + toConsider.length);
	
		// now find which of our tiddlers we need to exclude
		for(var d=0; d<toConsider.length; d++) {
			for(var f=0; f<filters.length; f++) {
				if(filters[f].testResult == false) {
					if(store.getValue(toConsider[d], filters[f].field).toLowerCase() == filters[f].value.toLowerCase())
						toExclude.push(toConsider[d]);						
				}
			}
		}
		this.log('toExclude :' + toExclude.length);

		// remove the excluded tiddlers.
		for (var i=0; i < toConsider.length; i++) {
			if(toConsider.contains(toExclude[i]) === false)
				toDisplay.push(toConsider[i]);
		}
		this.log('toDisplay :' + toDisplay.length);

		// Build a template dynamically to include the specified fields.
		var template = "|";
		for(var f=0; f<displayFields.length; f++) {
			if(TiddlyWiki.isStandardField(displayFields[f]))
				var fieldName = displayFields[f];
			else
				var fieldName = fieldPrefix + displayFields[f];
			template += "<<view "+ fieldName +">> |";
		}
		
		// Output the results.
		// var out = "";
		for(var d=0; d<toDisplay.length; d++) {
			new Wikifier(template,formatter,null,toDisplay[d]).subWikify(place);
			// out += wikifyStatic(template,null,toDisplay[d],formatter);

		}		
		// this.log(out);
		// wikify(out,place);
		
	};


} //# end of 'install only once'
//}}}