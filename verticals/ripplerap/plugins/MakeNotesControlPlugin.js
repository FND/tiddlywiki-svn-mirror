/***
|''Name:''|MakeNotesControlPlugin|
|''Description:''|RippleRap control for creating a new note|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/MakeNotesControlPlugin.js |
|''Version:''|0.0.2|
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
		else if(params[0] == "sharing") {
			var cb = createTiddlyCheckbox(place,null,config.options.chkRipplerapShare,config.macros.MakeNotesControl.globalSharing);
			cb.setAttribute("option","chkRipplerapShare");
		}
		
		//if(rssSynchronizer && config.options.chkRipplerapShare && config.options.chkRipplerapReadyToUse)
		//	rssSynchronizer.makeRequest();
	};

	config.macros.MakeNotesControl.onClick = function(ev) {
		var e = ev ? ev : window.event;
		var target = resolveTarget(e);
		var after =  story.findContainingTiddler(target);
		var sessionTitle = after.id.substr(7);
		
		displayMessage("Make notes on: " + sessionTitle);
		
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
		var opt = "chkRipplerapShare";
		var optType = opt.substr(0,3);
		var handler = config.macros.option.types[optType];
		if (handler.elementType && handler.valueField)
			config.macros.option.propagateOption(opt,handler.valueField,this[handler.valueField],handler.elementType);
		
		if(rssSynchronizer && config.options.chkRipplerapShare)
			rssSynchronizer.makeRequest();
					
		return true;
	};


	/*
	Ripplerap account creation helpers
	*/
	config.macros.ripplerapAccountButton = {};
	//config.macros.ripplerapAccountButton.eventName = "Le Web 3";
	config.macros.ripplerapAccountButton.eventName = "JPO";
	config.macros.ripplerapAccountButton.btnLabel = "Set up my Ripplerap account for %0";
	config.macros.ripplerapAccountButton.serverBaseURL = "https://www.ripplerap.com/LeWeb/";
	config.macros.ripplerapAccountButton.userNameNotSet = "You have not set your username";

	config.macros.ripplerapAccountButton.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		if(config.options['chkRipplerapReadyToUse'+config.options.txtUserName]) {
			var msg = createTiddlyElement(place,'span','ripplerapAccountMessage');
			config.macros.ripplerapAccountButton.showFeedback("You are setup to use Ripplerap.");
		} else {
			// create a signup button
			var btnCase = createTiddlyElement(place,'span','ripplerapAccountButton','chunkyButton');
			var btnLabel = config.macros.ripplerapAccountButton.btnLabel.format([config.macros.ripplerapAccountButton.eventName]);
			var btnClickHandler = config.macros.ripplerapAccountButton.onClickSignup;
			createTiddlyButton(btnCase,btnLabel,null,config.macros.ripplerapAccountButton.onClick);
			msg = createTiddlyElement(place,'span','ripplerapAccountMessage');
			config.macros.ripplerapAccountButton.clearfeedback();
		}
	};

	config.macros.ripplerapAccountButton.onClick = function(ev) {
		if(config.options.txtUserName=='YourName') {
			displayMessage(config.macros.ripplerapAccountButton.userNameNotSet);
			return false;
		}
		config.macros.ripplerapAccountButton.clearfeedback();
		var url = config.macros.ripplerapAccountButton.serverBaseURL + "reg/";
		var params = {};
		params.username = config.options.txtUserName;
		var data = "username=" + params.username + "&password=" + config.options.txtRipplerapAccountPassword;
		doHttp("POST",url,data,null,'leweb','88!p29X',config.macros.ripplerapAccountButton.accountRequestCallback,params);
		return false;
	};

	config.macros.ripplerapAccountButton.accountRequestCallback = function(status,params,responseText,url,xhr) {
		var responseTypes = {
			400 : {
				signupMessage: "Please check the username that you provided. It cannot comtain any special characters or spaces."
			},
			409 : {
				signupMessage: "This username already exists."
			},
			200 : {
				signupMessage: config.options.txtUserName + " has been created and is ready to use."
			},
			0 : {
				signupMessage: "There was a problem reaching the server to create your username. Please try again shortly."
			}
		};
//#displayMessage("accountRequestCallback:"+status+" r:"+xhr.status);
		config.macros.ripplerapAccountButton.showFeedback(responseTypes[xhr.status].signupMessage);
		if(status) {
			config.options['chkRipplerapReadyToUse'+config.options.txtUserName] = true;
			config.options.chkRipplerapReadyToUse = true;
			saveOptionCookie('chkRipplerapReadyToUse'+config.options.txtUserName);
		}
		if(status && rssSynchronizer && config.options.chkRipplerapShare) {
			rssSynchronizer.makeRequest();
		}
	};

	config.macros.ripplerapAccountButton.showFeedback = function(str) {
		var msg = document.getElementById('ripplerapAccountMessage');
		removeChildren(msg);
		document.createElement("div");
		msg.appendChild(document.createTextNode(str));
		msg.style.display = "block";
		var btn = document.getElementById('ripplerapAccountButton');
		if(btn && config.options['chkRipplerapReadyToUse'+config.options.txtUserName]==true)
			btn.style.display = "none";
	};
	config.macros.ripplerapAccountButton.clearfeedback = function() {
		var msg = document.getElementById('ripplerapAccountMessage');
		if(msg)
			msg.style.display = "none";
	};
}

//# end of 'install only once'
//}}}
