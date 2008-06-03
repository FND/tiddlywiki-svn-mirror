/***
|''Name:''|SingleMessagePlugin|
|''Description:''|displayMessage first clears any existing messages, then disappears after an interval|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SingleMessagePlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|

Options:
|<<option txtSingleMessageTimeout>>|<<message config.optionsDesc.txtSingleMessageTimeout>>|

***/

//{{{
if(!version.extensions.SingleMessage) {
version.extensions.SingleMessage = {installed:true};

	config.options.txtSingleMessageTimeout = 5;
	config.optionsDesc.txtSingleMessageTimeout = "seconds before displayed messages clear themselves";
	
	config.macros.SingleMessage = { 
		clearMessage: clearMessage,
		displayMessage: displayMessage,

		displaySingleMessage: function(text,linkText){
			var me = config.macros.SingleMessage;
			me.clearMessage();
			me.displayMessage(text,linkText);
		},

		handler: function(place,macroName,params,wikifier,paramString,tiddler){
			var me = config.macros.SingleMessage;
			me.displaySingleMessage(params);
		}
	};

	displayMessage = config.macros.SingleMessage.displaySingleMessage;

} //# end of 'install only once'
//}}}
