/***
|''Name:''|WikifiedMessagesPlugin|
|''Description:''|Wikify displayMessage text  |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/WikifiedMessagesPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/WikifiedMessagesPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
A plugin to replace the core displayMessage function with a version which wikifies the message text.
The created message div is returned for extensibility by other plugins.
TiddlyWiki initializes plugin tiddlers in collation sequence order, so in order to make the displayMessage() function available for use in other plugins during initialization, the tiddler has been named _WikifiedMessagesPlugin.
!!Code
***/
//{{{
if(!version.extensions.WikifiedMessagesPlugin) {
version.extensions.WikifiedMessagesPlugin = {installed:true};

	config.extensions.WikifiedMessages = {
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
			e.innerHTML = wikifyStatic(text);
			return e;
		}
	};

	displayMessage = config.extensions.WikifiedMessages.displayMessage;

        // macro, useful for testing
        config.macros.DisplayMessage = {
                handler: function(place,macroName,params,wikifier,paramString,tiddler){
                        displayMessage(paramString);
                }
        };
};

//}}}
