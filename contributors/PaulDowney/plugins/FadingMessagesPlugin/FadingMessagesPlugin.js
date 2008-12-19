/***
|''Name:''|FadingMessagesPlugin|
|''Description:''|Automatically clear a displayed message after an interval |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/FadingMessagesPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FadingMessagesPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
|''Overrides:''|displayMessage|
|''Requires:''|WikifiedMessagesPlugin|
!!Documentation
Displayed messages automatically fade away after a short interval.
!!Options
|<<option txtFadingMessagesTimeout>>|<<message config.optionsDesc.txtFadingMessagesTimeout>>|
|<<option chkAnimate>>|<<message config.optionsDesc.chkAnimate>>|
!!Code
***/
//{{{
if(!version.extensions.FadingMessagesPlugin) {
version.extensions.FadingMessagesPlugin = {installed:true};

	config.options.txtFadingMessagesTimeout = 5;
	config.optionsDesc.txtFadingMessagesTimeout = "seconds before a displayed message clears itself";

	config.extensions.FadingMessages = {
		Fader: function(e,done)
		{
			e.style.overflow = 'hidden';
			e.style.display = 'block';
			var p = [];
			p.push({style: 'display', atEnd: 'none'});
			p.push({style: 'opacity', start: 1, end: 0, template: '%0'});
			p.push({style: 'filter', start: 100, end: 0, template: 'alpha(opacity:%0)'});
			return new Morpher(e,config.animDuration,p,done);
		},  
		clearMessageDiv: function(e)
		{
			try { removeNode(e); } catch(ex) {};
			var msgArea = document.getElementById("messageArea");
			var n = msgArea.getElementsByTagName('div');
			if(!(n&&n.length)){
				msgArea.style.display = "none";
			}
		},
		fadeMessageDiv: function(e)
		{
			var me = config.extensions.FadingMessages;
			if(config.options.chkAnimate && anim){
				anim.startAnimating(new me.Fader(e,me.clearMessageDiv));
			}else{
				me.clearMessageDiv(e);
			}
		},
		closeButton: function()
		{
			return null;
		},
		_displayMessage: displayMessage,
		displayMessage: function(text,linkText)
		{
			var me = config.extensions.FadingMessages;
			var e = me._displayMessage(text,linkText);
			if(e){
				window.setTimeout(function(){me.fadeMessageDiv(e);},config.options.txtFadingMessagesTimeout*1000);
			}
			return e;
		}
	};

	displayMessage = config.extensions.FadingMessages.displayMessage;
	config.extensions.WikifiedMessages.closeButton = config.extensions.FadingMessages.closeButton;
}
//}}}
