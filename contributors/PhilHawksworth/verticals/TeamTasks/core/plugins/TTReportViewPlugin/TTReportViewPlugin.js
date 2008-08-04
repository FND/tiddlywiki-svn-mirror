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
<<TTReportView>>
}}}

Create a view of the task list showing specified fields in a given order and filtering the results.
{{{
<<TTReportView DisplayFields:"field1,field2,field3" OrderBy:"field1,[asc|desc]" fieldName:"filterValue" fieldName:"!filterValue" recent:"items">>
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
				
		var container = story.findContainingTiddler(place);
		var wrapper = createTiddlyElement(place,"span");
		wrapper.setAttribute('refresh','content');
		wrapper.setAttribute('tiddler',tiddler.title);
		wrapper.setAttribute('force', 'true');
		
		var fieldPrefix = "tt_";
				
		//gather all of the parameters.
		var params = paramString.parseParams("anon",null,true,false,false);
		var fieldsString = getParam(params,"DisplayFields",'title');
		var displayFields = fieldsString.split(",");
		for(var i=0;i<displayFields.length;i++){
			displayFields[i] = displayFields[i].trim();
		}
		var orderString = getParam(params,"OrderBy",'title,asc');
		var orderField =  fieldPrefix + orderString.split(",")[0];
		var order =  orderString.split(",")[1];				
		var recentItems = getParam(params,"recent");
		var expectedParams = ['DisplayFields','OrderBy'];
	
		//interpret and store the filter values.	
		var filters = [];
		for(var p in params) {
			var name = params[p].name;
			var value = params[p].value;
			if((name && name != 'undefined') &!expectedParams.contains(name)) {
				var match = true;
				if(value.substring(0,1) == "!") {
					match = false;
					var str = value.substring(1);
				}
				else {
					var str = value;	
				}
				if(name != "recent") { // exclude "recent" parameter
					filters.push({'field':fieldPrefix + name, 'value':str, 'match':match});
				}
			}
		}
					
		//collect the pertinent tiddlers.
		var taskTiddlers = store.getTaggedTiddlers("task");
		var toConsider = [];
		var toDisplay = [];		
		var toExclude = [];

		// limit to recently modified tiddlers
		if(recentItems) {
			taskTiddlers.sort(function(a,b) {
				return b.modified - a.modified;
			});
			taskTiddlers = taskTiddlers.slice(0, recentItems);
		}

		// first get all the tiddlers we might want to include.
		for(var t=0; t<taskTiddlers.length; t++) {
			var consider = true;
			for(var f=0; f<filters.length; f++) {
				if(filters[f].match == true) {
					if(store.getValue(taskTiddlers[t], filters[f].field).toLowerCase() != filters[f].value.toLowerCase()){
						consider = false;
						break;
					}
				}
			}
			if(consider)
				toConsider.push(taskTiddlers[t]);
		}
		

		// now find which of our selected tiddlers we need to exclude
		for(var d=0; d<toConsider.length; d++) {
			for(var f=0; f<filters.length; f++) {
				if(filters[f].match == false) {
					if(store.getValue(toConsider[d], filters[f].field).toLowerCase() == filters[f].value.toLowerCase()) {
						toExclude.push(toConsider[d]);
					}	
				}
			}
		}
		
		// remove the excluded tiddlers.
		for (var i=0; i < toConsider.length; i++) {
			if(toExclude.contains(toConsider[i]) === false)
				toDisplay.push(toConsider[i]);
		}

		// Build a sortable table of the results.
		var tbl = createTiddlyElement(wrapper,'table',null,'sortable');
		var thead = createTiddlyElement(tbl,'thead');
		var theadr = createTiddlyElement(thead,'tr');
		for(var f=0; f<displayFields.length; f++) {
			//specifiy the sorting column if required.
			var c = null;
			if(fieldPrefix + displayFields[f].toLowerCase() == orderField.toLowerCase()) {
				var c = "autosort";
				if(order != 'asc') c += " reverse";
			}
			createTiddlyElement(theadr,'td',null,c,displayFields[f]);
		}
		var tbody = createTiddlyElement(tbl,'tbody');
		for(var d=0; d<toDisplay.length; d++) {
			var tr = createTiddlyElement(tbody,'tr');
			for(var f=0; f<displayFields.length; f++) {
				var df = displayFields[f].toLowerCase();
				if(TiddlyWiki.isStandardField(df))
					var fieldName = df;
				else
					var fieldName = fieldPrefix + df;	
				var td  = createTiddlyElement(tr,'td',null,null,null);
				var v = store.getValue(toDisplay[d], fieldName);
				if(fieldName == 'title')
					createTiddlyLink(td,v,true,null,false,false);
				else
					createTiddlyText(td,v);
			}
		}		
	};
} //# end of 'install only once'
//}}}
