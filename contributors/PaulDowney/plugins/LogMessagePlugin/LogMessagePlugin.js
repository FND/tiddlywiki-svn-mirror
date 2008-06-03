/***
|''Name:''|LogMessagePlugin|
|''Description:''|Browser independent message logging|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/LogMessagePlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|

Options:
|<<option chkLogMessageEnabled>>|<<message config.optionsDesc.chkLogMessageEnabled>>|

***/

//{{{
if(!version.extensions.LogMessage) {
version.extensions.LogMessage = {installed:true};

	config.options.chkLogMessageEnabled = true;
	config.optionsDesc.chkLogMessageEnabled = "logging of messages enabled";
	config.options.chkLogMessageWindow = false;
	config.optionsDesc.chkLogMessageWindow = "log messages to an external window";
	
	config.macros.LogMessage = { 

		log: function(message){
			if (!config.options.chkLogMessageEnabled) {
				return;
			}
			if (console) {
				console.log(message);
				return;
			}
			if (config.options.chkLogMessageWindow){
				var me = config.macros.LogMessage;
				me.logWindow(message);
				return;
			}
			displayMessage(message);
		},

		logWindow: function(message){
			var me = config.macros.LogMessage;
			if (!me.window_ || me.window_.closed) {
				var win = window.open("", null, "width=400,height=200," +
						  "scrollbars=yes,resizable=yes,status=no," +
						  "location=no,menubar=no,toolbar=no");
				if (!win) 
					return;
				var doc = win.document;
				doc.write("<html><head><title>Log</title></head><body></body></html>");
				doc.close();
				me.window_ = win;
			}
			var line = me.window_.document.createElement("div");
			line.appendChild(me.window_.document.createTextNode(message));
			me.window_.document.body.appendChild(line);
		},

		handler: function(place,macroName,params,wikifier,paramString,tiddler){
			var me = config.macros.LogMessage;
			me.log(params.join(","));
		}
	};

	log = config.macros.LogMessage.log;

} //# end of 'install only once'
//}}}
