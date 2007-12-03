/***
|''Name:''|MakeNotesControlPlugin|
|''Description:''|RippleRap control for creating a new note|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/MakeNotesControlPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Nov 30, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.MakeNotesControlPlugin) {
version.extensions.MakeNotesControlPlugin = {installed:true};

	config.macros.MakeNotesControl = {};
	config.macros.MakeNotesControl.handler = function(place,macroName,params,wikifier,paramString,tiddler)
	{
		createTiddlyButton(place,"make notes","Make notes on this session",config.macros.MakeNotesControl.onClick);
		createTiddlyCheckbox(place,'private',false,config.macros.MakeNotesControl.togglePrivate);
		
	};

	config.macros.MakeNotesControl.onClick = function()
	{
		var after =  story.findContainingTiddler(this);
		var sessionTitle = after.id.substr(8);
		var title = sessionTitle + " from " + config.options.txtUserName;
		var template = "NotesEditTemplate";
		story.displayTiddler(after,title,template,false,null,null);
	
		var text = "your notes... " + title;
		story.getTiddlerField(title,"text").value = text.format([title]);
			
		story.setTiddlerTag(title,'notes',+1);
		story.setTiddlerTag(title,'shared',+1);
		story.focusTiddler(title,focus);
		
		return false;
	};
	
	config.macros.MakeNotesControl.togglePrivate = function()
	{
		var after =  story.findContainingTiddler(this);
		var sessionTitle = after.id.substr(8);
		var title = sessionTitle + " from " + config.options.txtUserName;
		var template = "NotesEditTemplate";
		story.displayTiddler(after,title,template,false,null,null);
	
		var text = "your notes... " + title;
		story.getTiddlerField(title,"text").value = text.format([title]);
			
		story.setTiddlerTag(title,'notes',+1);
		story.setTiddlerTag(title,'shared',+1);
		story.focusTiddler(title,focus);
		
		return false;
	};



	/*
	Ripplerap account creation helpers
	*/
	config.macros.ripplerapLoginButton = {};
	config.macros.ripplerapLoginButton.eventName = "Le Web 3";
	config.macros.ripplerapLoginButton.serverURL = "";
	
	config.macros.ripplerapLoginButton.handler = function(place,macroName,params,wikifier,paramString,tiddler)
	{
		var btnCase = createTiddlyElement(place,'span',null,'chunkyButton');
		createTiddlyButton(btnCase,"setup my ripplerap account for "+ config.macros.ripplerapLoginButton.eventName,null,config.macros.ripplerapLoginButton.onClick);
	};

	config.macros.ripplerapLoginButton.onClick = function()
	{
		//send the user details to the server to create their account.
		var un = config.options.txtUserName;
		var pw = config.options.txtRipplerapAccountPassword;
		
		console.log('Loggin in with username: '+ un +' and password: ' + pw);
		
		return false;
	};

} //# end of 'install only once'
//}}}
