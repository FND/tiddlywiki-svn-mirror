/***
|''Name:''|LogMessagePlugin|
|''Description:''|Browser independent message logging|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/LogMessagePlugin.js |
|''Version:''|0.2|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4.1|
!!Documentation
This plugin provides a log() function with the same semantics as the [[Firebug|http://getfirebug.com/]] [[console.log|http://getfirebug.com/console.html]] function. Calling console.log() is likely to fail in browsers without Firebug installed. 

Depending upon the Options, the message will be sent to the Firebug console, as well as to an external popup window, and TiddlyWiki display message. As of TiddlyWiki release 2.4.1, the core provides a <[[default log() function|http://trac.tiddlywiki.org/ticket/674]], so code containing log() calls will continue to function without generating errors, even without this plugin installed.

TiddlyWiki initializes plugin tiddlers in collation sequence order, so in order to make the log() function available for use in other plugins during initialization, the tiddler has been named _LogMessagePlugin.

An example TiddlyWiki containing the latest released version with a simple example is available from from http://whatfettle.com/2008/07/LogMessagePlugin/

!!Options
|<<option chkLogMessageEnabled>>|<<message config.optionsDesc.chkLogMessageEnabled>>|
|<<option chkLogMessageConsole>>|<<message config.optionsDesc.chkLogMessageConsole>>|
|<<option chkLogMessageWindow>>|<<message config.optionsDesc.chkLogMessageWindow>>|
|<<option chkLogMessageDisplayMessage>>|<<message config.optionsDesc.chkLogMessageDisplayMessage>>|

!!Code:
***/

//{{{
if(!version.extensions.LogMessagePlugin){
version.extensions.LogMessagePlugin = {installed:true};

	config.optionsDesc.chkLogMessageEnabled = "logging of messages enabled";
	config.options.chkLogMessageEnabled = false;

	config.optionsDesc.chkLogMessageConsole = "log messages to the console, when available";
	config.options.chkLogMessageConsole = false;

	config.optionsDesc.chkLogMessageWindow = "log messages to an external window";
	config.options.chkLogMessageWindow = false;

	config.optionsDesc.chkLogMessageDisplayMessage = "log messages using displayMessage";
	config.options.chkLogMessageDisplayMessage = false;
	
	config.macros.LogMessage = { 

		log: function(){
			if(!config.options.chkLogMessageEnabled){
				return;
			}
			if(config.options.chkLogMessageConsole){
				if (window.console){
					console.log(arguments);
				}
			}
			if(!(config.options.chkLogMessageWindow||config.options.chkLogMessageDisplayMessage)){
				return;
			}
			var message = (function(a){var x=[]; for(var i=0; i<a.length; i++)
				x.push(a[i]); return x.join(', ');})(arguments);
			if(config.options.chkLogMessageWindow){
				var me = config.macros.LogMessage;
				me.logWindow(message);
			}
			if(config.options.chkLogMessageDisplayMessage){
				displayMessage(message);
			}
		},

		logWindow: function(message){
			var me = config.macros.LogMessage;
			if(!me.window_ || me.window_.closed){
				var win = window.open("", null, "width=400,height=200,scrollbars=yes,"+
					"resizable=yes,status=no,location=no,menubar=no,toolbar=no");
				if(!win) 
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
			me.log(params);
		}
	};

	log = config.macros.LogMessage.log;

} //# end of 'install only once'
//}}}
