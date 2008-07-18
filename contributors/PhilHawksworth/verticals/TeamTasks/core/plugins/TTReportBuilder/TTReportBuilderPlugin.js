/***
|''Name:''|TTReportBuilderPlugin|
|''Description:''|Provide a view of the ColorPalette that allows the user to see the color that they are specifying|
|''Author:''|PhilHawksworth, Jon Lister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/verticals/TeamTasks/cores/plugins/TTReportBuilder/TTReportBuilderPlugin.js |
|''Version:''|0.1|
|''Date:''|July 18, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|


''Usage examples:''

Create the UI to build a teamtask report
{{{
<<TTReportBuilder>>
}}}

***/

//{{{
if(!version.extensions.TTReportBuilderPlugin) {
version.extensions.TTReportBuilderPlugin = {installed:true};
		
config.macros.TTReportBuilder = {};
config.macros.TTReportBuilder.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

};

// limit the number of results displayed.
// limitResults(array, [integer])
config.macros.TTReportBuilder.limitResults = function(results,limit) {
	if(!limit && limit !== 0) return results;
	return results.slice(0,limit);
};

config.macros.TTReportBuilder.paramStringBuilder = function(paramString,name,value,action) {
	var params = paramString.parseParams("anon",null,false);
	var param = [];
	switch(action) {
		case "add":
			param = params[0][name];
			params[0][name] = param ? param : [];
			params[0][name].pushUnique(value);
			break;
		case "replace":
			params[0][name] = [];
			params[0][name].push(value);
			break;
		case "delete":
			param = params[0][name];
			if(param) {
				param.remove(value);
			}
			break;
		default:
			break;
	}
	var str = "";
	for(var i in params[0]) {
		param = params[0][i];
		for (var j=0; j < param.length; j++) {
			str += i+":"+param[j]+" ";
		};
	}
	str = str.trim();
	return str;
};

	
} //# end of 'install only once'
//}}}