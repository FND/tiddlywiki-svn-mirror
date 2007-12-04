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
	config.macros.MakeNotesControl.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		if(params[0] == "create") createTiddlyButton(place,"make notes","Make notes on this session",config.macros.MakeNotesControl.onClick);
		else if(params[0] == "sharethis") createTiddlyCheckbox(place,'private',false,config.macros.MakeNotesControl.togglePrivate);
		else if(params[0] == "sharing") createTiddlyCheckbox(place,"share my notes",config.options.chkRipplerapShare,config.macros.MakeNotesControl.globalSharing);
	};

	config.macros.MakeNotesControl.onClick = function(ev) {
		var e = ev ? ev : window.event;
		var target = resolveTarget(e);
		var after =  story.findContainingTiddler(target);
		var sessionTitle = after.id.substr(7);
		
		console.log("Make notes on: " + sessionTitle);
		
		var title = sessionTitle + " from " + config.options.txtUserName;
		var template = "NoteEditTemplate";
		
		story.displayTiddler(after,title,template,false,null,null);
		
		var text = "your notes... " + title;
		story.getTiddlerField(title,"text").value = text.format([title]);
		story.setTiddlerTag(title,config.macros.TiddlerDisplayDependencies.myNoteTag,+1);
		story.setTiddlerTag(title,config.macros.TiddlerDisplayDependencies.sharingTag,+1);
		return false;
	};
	
	config.macros.MakeNotesControl.togglePrivate = function(ev) {
		alert("toggle private");
		var e = ev ? ev : window.event;
		var target = resolveTarget(e);
	};
	
	config.macros.MakeNotesControl.globalSharing = function(ev) {
		var e = ev ? ev : window.event;
		var target = resolveTarget(e);
		config.options.chkRipplerapShare = target.checked;
		if(rssSynchronizer && config.options.chkRipplerapShare)
			rssSynchronizer.makeRequest();
	};


	/*
	Ripplerap account creation helpers
	*/
	config.macros.ripplerapLoginButton = {};
	config.macros.ripplerapLoginButton.eventName = "Le Web 3";
	config.macros.ripplerapLoginButton.serverBaseURL = "https://www.ripplerap.com/LeWeb/";
	
	config.macros.ripplerapLoginButton.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		var btnCase = createTiddlyElement(place,'span',null,'chunkyButton');
		createTiddlyButton(btnCase,"Set up my Ripplerap account for "+ config.macros.ripplerapLoginButton.eventName,null,config.macros.ripplerapLoginButton.onClick);
		var msg = createTiddlyElement(place,'span','ripplerapAccountMessage');
		msg.style.display = "none";
	};

	config.macros.ripplerapLoginButton.onClick = function()	{
		//send the user details to the server to create their account.
		var params = {};
		params.url = config.macros.ripplerapLoginButton.serverBaseURL + "reg/";;
		params.username = config.options.txtUserName;
		var data = "username=" + params.username + "&password=" + config.options.txtRipplerapAccountPassword;
		doHttp("POST",params.url,data,null,'leweb','88!p29X',config.macros.ripplerapLoginButton.handleUserCreation,params,null);
		return false;
	};
	
	config.macros.ripplerapLoginButton.handleUserCreation = function(status,params,responseText,xhr) {
		if(!status) {
			console.log("request to " + params.url + " Failed");
			console.log(xhr);
		}
		else {
			console.log("request to " + params.url + ", status: " + status);
			console.log("   attempting to create " + params.username );
			if(responseText == "created user"){
				console.log(params.username + " created and ready to use.");	
				config.macros.ripplerapLoginButton.showFeedback(params.username + " created and ready to use.");
				if(rssSynchronizer && config.options.chkRipplerapShare)
					rssSynchronizer.makeRequest();
			}
		}
	};

	config.macros.ripplerapLoginButton.showFeedback = function(str) {
		var msg = document.getElementById('ripplerapAccountMessage');
		removeChildren(msg);
		document.createElement("div");
		msg.appendChild(document.createTextNode(str));
		msg.style.display = "block";
	};
}

//# end of 'install only once'
//}}}
