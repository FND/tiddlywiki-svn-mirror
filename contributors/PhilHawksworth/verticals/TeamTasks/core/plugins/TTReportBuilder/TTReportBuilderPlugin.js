/***
|''Name:''|TTReportBuilderPlugin|
|''Description:''|Provide a view of the ColorPalette that allows the user to see the color that they are specifying|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/Plugins/LiveColorPalettePlugin.js |
|''Version:''|0.1|
|''Date:''|Mar 11, 2008|
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
	var params = [];
	switch(action) {
		case "add":
			params = paramString.parseParams("anon",null,false);
			param = getParam(params,name,"");
			if(param) {
				if(param === value) {
					return paramString;
				}
				
			}
		break;
		case "amend":
		break;
		case "delete":
		break;
		default:
	}
};

	
} //# end of 'install only once'
//}}}