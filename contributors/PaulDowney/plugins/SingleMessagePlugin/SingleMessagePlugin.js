/***
|''Name:''|SingleMessagePlugin|
|''Description:''|displayMessage first clears any existing messages, then disappears after an interval |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/SingleMessagePlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SingleMessagePlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
Provides a macro which when refreshed displays a message.

&lt;&lt;SingleMessage "hello"&gt;&gt;
<<SingleMessage "hello">>

!!Options:
|<<option txtSingleMessageTimeout>>|<<message config.optionsDesc.txtSingleMessageTimeout>>|

//The automatic clearing requires the [[TickerPlugin|http://whatfettle.com/2008/07/TickerPlugin/]].//

!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global config */
if (!version.extensions.SingleMessagePlugin) {
    version.extensions.SingleMessagePlugin = {installed: true};

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
}
//}}}
