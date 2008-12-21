/***
|''Name:''|WikifiedMessagesPlugin|
|''Description:''|Wikify displayMessage text  |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/WikifiedMessagesPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/WikifiedMessagesPlugin/ |
|''Version:''|0.4|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
A plugin to replace the core displayMessage function with a version which wikifies the message text.
The construction of the [close] single message and [close all] buttons has been seperated to be overrideable and the created message div is returned by displayMessage, for extensibility by other plugins.
!!Code
***/
//{{{
if(!version.extensions.WikifiedMessagesPlugin) {
version.extensions.WikifiedMessagesPlugin = {installed:true};

	if(!config.extensions){
		config.extensions = {};
	}

	config.extensions.WikifiedMessages = {

		createClearAllButton: function(msgArea)
		{
			return (msgArea.hasChildNodes())? null :
				createTiddlyButton(createTiddlyElement(msgArea,"div",null,"messageToolbar"),
					config.messages.messageClose.text,
					config.messages.messageClose.tooltip,
					clearMessage);
		},
		createClearMessageButton: function(e)
		{
			return null;
		},
		getMessageDiv: function()
		{
			var msgArea = document.getElementById("messageArea");
			var me = config.extensions.WikifiedMessages;
			if(!msgArea){
				return null;
			}
			msgArea.style.display = "block";
			me.createClearAllButton(msgArea);
			e = createTiddlyElement(msgArea,"div",null,"messageBox");
			me.createClearMessageButton(e);
			return e;
		},
		displayMessage: function(text,linkText)
		{
			var e = getMessageDiv();
			if(!e) {
				alert(wikifyPlain(text));
				return null;
			}
			if(linkText) {
				text = "[["+text+"|"+linkText+"]]";
			}
			t = createTiddlyElement(e,"span",null,"messageText");
			t.innerHTML = wikifyStatic(text);
			return e;
		}
	};

	displayMessage = config.extensions.WikifiedMessages.displayMessage;
	getMessageDiv = config.extensions.WikifiedMessages.getMessageDiv;

        // macro, useful for testing
        config.macros.DisplayMessage = {
                handler: function(place,macroName,params,wikifier,paramString,tiddler){
                        displayMessage(paramString);
                }
        };
}
//}}}
