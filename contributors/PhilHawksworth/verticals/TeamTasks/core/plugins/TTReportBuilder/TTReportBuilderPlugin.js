/***
|''Name:''|TTReportBuilderPlugin|
|''Description:''|Provide a view of the ColorPalette that allows the user to see the color that they are specifying|
|''Author:''|PhilHawksworth, Jon Lister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/verticals/TeamTasks/core/plugins/TTReportBuilder/TTReportBuilderPlugin.js |
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
// config.macros.TTReportBuilder.limitResults = function(results,limit) {
// 	if(!limit && limit !== 0) return results;
// 	return results.slice(0,limit);
// 	
// };

// limit the number of results displayed.
// limitResults(array, [integer])
config.macros.TTReportBuilder.limitResults = function(tiddler,limit) {
	if(!limit) return;
	
	//find the targetted tiddler
	// var tiddlerTitle = story.getContainingTiddler(this);

	// modify the macro call param string.
	var paramsString = config.macros.TTReportBuilder.paramStringGetter(tiddlerTitle,'TTReportBuilder');
	var newParamsString = config.macros.TTReportBuilder.paramStringBuilder(paramsString,'limit',limit,'replace');
	
	// refresh the display of this macro.
	
};



// handle the add column button click event to add a column to this report.
config.macros.TTReportBuilder.doAddColumn = function (ev) {
	
};

// return the paramString for a given macro in tiddler
config.macros.TTReportBuilder.paramStringGetter = function(title,macroName) {
	if(typeof title === 'string' && macroName) {
		var toMatch = '<<'+macroName;
		var text = store.getTiddlerText(title);
		var subtext = text.substr(text.indexOf(toMatch));
		// we just use the first suitable macro matched
		var i = subtext.indexOf('>>');
		var j = subtext.indexOf('\n');
		if(i!==-1 && j<i) {
			return subtext.substring(toMatch.length,i).trim();
		} else {
			return "";
		}
	} else {
		return false;
	}
};


// replace the paramString for a given macro in tiddler
config.macros.TTReportBuilder.macroCallSetter = function(title,macroName,newParamStrings) {
		
	console.log("Set args: ", arguments);

	if(title && macroName && newParamStrings !== null) {
		var text = store.getTiddlerText(title);
		if(text == "") return;
		
		
		// var paramString = config.macros.TTReportBuilder.paramStringGetter(title,macroName);
		
		// console.log("paramString: ", paramString);
		// console.log("newParamStrings: ", newParamStrings);

		var re = /(<<	 (.*)>>)/;
		var text = text.replace(re, "$2");
		
		
		
		// text.replace(paramString,newParamStrings);
		
		console.log("New text: ", text);

		store.saveTiddler(title,title,text);
	}		


	// var text = store.getTiddlerText(title);	
	// console.log("text ", text);
	// 
	// var paramString = config.macros.TTReportBuilder.paramStringGetter(title,macroName);
	// text.replace(paramString,newParamStrings);
	// store.saveTiddler(title,title,text);
};

// Manipulate a paramString.
// paramStringBuilder(string,name,value,"add"|"replace"|"delete")
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