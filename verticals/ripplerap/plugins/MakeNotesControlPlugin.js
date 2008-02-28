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
		//else if(params[0] == "sharethis") createTiddlyCheckbox(place,'private',false,config.macros.MakeNotesControl.togglePrivate);
		else if(params[0] == "sharing") {
			var cb = createTiddlyCheckbox(place,null,config.options.chkRipplerapShare,config.macros.MakeNotesControl.globalSharing);
			cb.setAttribute("option","chkRipplerapShare");
		}
	};

	config.macros.MakeNotesControl.onClick = function(ev) {
		var e = ev ? ev : window.event;
		var target = resolveTarget(e);
		var after =  story.findContainingTiddler(target);
		var sessionTitle = after.id.substr(7);
		var title = sessionTitle + " from " + config.options.txtUserName;
		var template = "NoteEditTemplate";
		if(!store.tiddlerExists(title))
			var text = "Your notes... ";
		else
			var text = store.getTiddler(title).text;
		story.displayTiddler(after,title,template,false,null,null);
		story.getTiddlerField(title,"text").value = text.format([title]);
		story.setTiddlerTag(title,config.macros.TiddlerDisplayDependencies.myNoteTag,+1);
		story.setTiddlerTag(title,config.macros.TiddlerDisplayDependencies.sharingTag,+1);
		return false;
	};
	
	
	/*
	config.macros.MakeNotesControl.togglePrivate = function(ev) {
		var e = ev ? ev : window.event;
		var target = resolveTarget(e);
	};
	*/
	
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
	config.macros.ripplerapAccountButton.eventName = "BlogTalk";
	config.macros.ripplerapAccountButton.serverBaseURL = "https://www.ripplerap.com/BlogTalk/";
	config.macros.ripplerapAccountButton.userNameNotSet = "Please choose another username.";
	config.macros.ripplerapAccountButton.contactingServerMessage = "Contacting the server...";
	
	config.macros.ripplerapAccountButton.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		var buttonType = {
				signup : {
					btnLabel : "Set up my Ripplerap account for %0",
					btnAction : config.macros.ripplerapAccountButton.onSignup
				},
				signin : {
					btnLabel : "Sign in to my Ripplerap account for %0",
					btnAction : config.macros.ripplerapAccountButton.onSignin
				}
			};
		var btnCase = createTiddlyElement(place,'span','ripplerapAccountButton','chunkyButton');
		createTiddlyButton(btnCase,buttonType[params[0]].btnLabel.format([config.macros.ripplerapAccountButton.eventName]),null,buttonType[params[0]].btnAction);
		var msg = createTiddlyElement(place,'span','ripplerapAccountMessage');
		config.macros.ripplerapAccountButton.clearfeedback();
	};

	config.macros.ripplerapAccountButton.onSignup = function(ev) {
		if(config.options.txtUserName=='YourName' || config.options.txtUserName=='') {
			config.macros.ripplerapAccountButton.showFeedback(config.macros.ripplerapAccountButton.userNameNotSet);
			return false;
		}
		config.macros.ripplerapAccountButton.showFeedback(config.macros.ripplerapAccountButton.contactingServerMessage);
		var url = config.macros.ripplerapAccountButton.serverBaseURL + "reg/";
		var params = {};
		params.username = config.options.txtUserName;
		params.purpose = 'signup';
		var data = "username=" + params.username + "&password=" + config.options.txtRipplerapAccountPassword;
		doHttp("POST",url,data,null,'leweb','88!p29X',config.macros.ripplerapAccountButton.accountRequestCallback,params);
		return false;
	};

/*	
	config.macros.ripplerapAccountButton.onSignin = function(ev) {
		config.macros.ripplerapAccountButton.clearfeedback();
		//attempt to put a file.
		var payload = 'test post for signin.';
		var un = config.options.txtUserName; 
		var pw = config.options.txtRipplerapAccountPassword;
		var uri = "http://" + config.macros.ripplerapAccountButton.serverBaseURL + 'users/' + un + '/signup.txt';
		var callback = config.macros.ripplerapAccountButton.accountRequestCallback;
		context = [];
		context.purpose = 'signin';
		displayMessage("signing in.. " + uri);
		DAV.safeput(uri,callback,context,payload,null,un,pw);	
		return false;
	};
*/


	config.macros.ripplerapAccountButton.accountRequestCallback = function(status,params,responseText,url,xhr) {
		var responseTypes = {
			400 : {
				signupMessage: "Please check the username that you provided. It cannot contain any special characters or spaces.",
				signinMessage: "Signin. http 400" 
			},
			409 : {
				signupMessage: "The " + config.options.txtUserName + " account is ready to use.",
				signinMessage: "This username already exists. Either sign in to that account or choose another username."
			},
			200 : {
				signupMessage: "The " + config.options.txtUserName + " account is ready to use.",
				signinMessage: "Thanks for signing in. You can now share yor notes with others."
			},
			0 : {
				signupMessage: "There was a problem reaching the server to create your account. You can still save your changes locally.",
				signinMessage: "There was a problem reaching the server to sign in. Your work will continue to be saved locally ."
			}
		};
		
		try {
			var xhrStatus = xhr.status;
			if(!responseTypes[xhrStatus])
				xhrStatus = 0;
		} catch(ex) {
			xhrStatus = 0;
		}	
		
		config.macros.ripplerapAccountButton.showFeedback(responseTypes[xhrStatus].signupMessage);		
			
		if(status) {
			config.options['chkRipplerapReadyToUse'+config.options.txtUserName] = true;
			saveOptionCookie('chkRipplerapReadyToUse'+config.options.txtUserName);	
			if(status && rssSynchronizer && config.options.chkRipplerapShare) {
				rssSynchronizer.makeRequest();
			}
		}
	};

	config.macros.ripplerapAccountButton.showFeedback = function(str) {
		var msg = document.getElementById('ripplerapAccountMessage');
		removeChildren(msg);
		document.createElement("div");
		msg.appendChild(document.createTextNode(str));
		msg.style.display = "block";
	};
	config.macros.ripplerapAccountButton.clearfeedback = function() {
		var msg = document.getElementById('ripplerapAccountMessage');
		if(msg)
			msg.style.display = "none";
	};
}

//# end of 'install only once'
//}}}
