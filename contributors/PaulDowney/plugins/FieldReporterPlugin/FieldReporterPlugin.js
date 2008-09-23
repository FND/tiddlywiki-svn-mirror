/***
|''Name:''|FieldReporterPlugin|
|''Description:''|optionally log TiddlyWiki usage information to a central server|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FieldReporterPlugin |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|
!!Documentation
This plugin may be used to record the usage of a TiddlyWiki application out in the field, enabling a TiddlyWiki to post version and usually anonymized values to a central server. 

An example service is included, implemented in PHP. 
!!Test
<<FieldReporter>>

!!Options
|<<option chkFieldReporterEnabled>>|<<message config.optionsDesc.chkFieldReporterEnabled>>|

***/

//{{{
if(!version.extensions.FieldReporter){
version.extensions.FieldReporterPlugin = {installed:true};

	config.optionsDesc.chkFieldReporterEnabled = "post anonymized usage data";
	config.options.chkFieldReporterEnabled = false;

config.macros.FieldReporter = {
	uri: "http://localhost/src/tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FieldReporterPlugin/log/",
	product: "TiddlyWiki",
	version: formatVersion(),
	displayResponse: false,

	log: function (action,description) {
		var macro = config.macros.FieldReporter;

		var body = '&product=' + encodeURIComponent(macro.product)
				+ '&version=' + encodeURIComponent(macro.version)
				+ '&action=' + encodeURIComponent(action)
				+ '&description=' + encodeURIComponent(description);

                var callback = function(status,params,responseText,url,xhr) {
                        if(status&&config.macros.FieldReporter.displayResponse){
                                displayMessage(responseText);
			}
                };

		if(config.options.chkFieldReporterEnabled) {
			var req = doHttp('POST', macro.uri, body, null, null, null, callback, true);
		}
	},
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var action = "test";
		var click = function(){	
			config.macros.FieldReporter.log(action,"from the test button");
		};
		createTiddlyButton(place,action,"send a test request!",click);
	},

};

} //# end of 'install only once'

//}}}
