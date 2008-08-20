//{{{

/***
|''Name''|ccLogin|
|''Description''|Allows users to login to ccTiddly, In future, this will include the ccRegister and  ccLoginStatus Status Macro|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|1.0.1|
|''Date''|12/05/2008|
|''Status''|@@alpha@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccLogin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccLogin.js|
|''License''|BSD|
|''Requires''|ccVariables|
|''Overrides''|restart|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Keywords''|ccTiddly ccLogin|

!Description

To display a login prompt for your user simple type the following text into a tiddler function tiddler :

!Usage
{{{
<<ccLogin>>
}}}

!Code

***/
//{{{

if (isLoggedIn()){
	config.backstageTasks.push("logout");
	merge(config.tasks,{logout:{text: "logout",tooltip: "Logout from ccTiddly",content: '<<ccLogin>>'}});
}else{
	config.backstageTasks.push("login");
	merge(config.tasks,{login:{text: "login",tooltip: "Login to ccTiddly",content: '<<ccLogin>>'}});	
}
config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){};
var loginState=null;
var registerState=null;

config.macros.ccLogin={};	
merge(config.macros.ccLogin,{
	WizardTitleText:"Please Login",
	usernameRequest:"Username",
	passwordRequest:"Password",
	stepLoginTitle:null,
	stepLoginIntroTextHtml:"<table border=0px><tr><td>username</td><td><input name=username id=username tabindex='1'></td></tr><tr><td>password</td><td><input type=password id='password' tabindex='2' name=password></td></tr></table>",
	stepDoLoginTitle:"Logging you in",
	stepDoLoginIntroText:"we are currently trying to log you in.... ",
	stepForgotPasswordTitle:"Password Request",
	stepForgotPasswordIntroText:"please email admin@admin.com  <br /><input id='forgottenPassword' name='forgottenPassword'/>",
	stepLogoutTitle:"Logout",
	stepLogoutText:"You are currently logged in as ",
	buttonLogout:"Logout",
	buttonLogoutToolTip:"Click here to logout",
	buttonLogin:"Login",
	buttonLoginToolTip:"click to login ",	
	buttonCancel:"Cancel",
	buttonCancelToolTip:"Cancel transaction ",
	buttonForgottenPassword:"Forgotten Password",	
	buttonSendForgottenPassword:"Mail me a new password",
	buttonSendForgottenPasswordToolTip:"clicking here will have a new password mailed to you.",
	buttonForgottenPasswordToolTip:"Click to be reminded of your password",
	configURL:url+"/handle/login.php", 
	configUsernameInputName:"cctuser",
	configPasswordInputName:"cctpass",
	configPasswordCookieName:"cctPass",
	sha1:true
});
	
config.macros.ccLogin.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	config.macros.ccLogin.refresh(place);
};
 
config.macros.ccLogin.refresh=function(place, error){
	removeChildren(place);
	var w = new Wizard();

	if (isLoggedIn())	{
		w.createWizard(place,this.stepLogoutTitle);
		w.addStep(null, this.stepLogoutText+cookieString(document.cookie).txtUserName+"<br /><br />");
		w.setButtons([
			{caption: this.buttonLogout, tooltip: this.buttonLogoutToolTip, onClick: function() {window.location=fullUrl+"?&logout=1"}
		}]);
		return true;
	}

	w.createWizard(place,this.WizardTitleText);
	var me=config.macros.ccLogin;
	var oldForm = w.formElem.innerHTML;
	var form = w.formElem;
	if (error!==undefined)
		this.stepLoginTitle=error;	
	w.addStep(this.stepLoginTitle,me.stepLoginIntroTextHtml);
	var cookieValues=findToken(document.cookie);
	if (cookieValues.txtUserName!==undefined){
		w.formElem["username"].value=cookieValues.txtUserName ;
	}
	var footer = findRelated(form,"wizardFooter","className");
	createTiddlyButton(w.footer,this.buttonLogin,this.buttonLoginToolTip,function() {
		if (w.formElem["username"].value==""){
			displayMessage("No username was entered");
			return false;
		}
		if (w.formElem["password"].value==""){
			displayMessage("No password was entered");
			return false;
		}
		config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place);
	});

	createTiddlyButton(w.footElem,this.buttonLogin,this.buttonLoginToolTip,function() {
		config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place);
	},null, null, null,  {tabindex:'3'});
	if(config.macros.register!==undefined){		
		createTiddlyButton(w.footElem,config.macros.register.buttonRegister,config.macros.register.buttonRegisterToolTip,function() {
				config.macros.register.displayRegister(place, w, this);
		},null, null, null,  {tabindex:4});
	}
	createTiddlyButton(w.footElem,this.buttonForgottenPassword,this.buttonForgottenPasswordToolTip,function() {
		config.macros.ccLogin.displayForgottenPassword(this, place);
	},null, null, null,  {tabindex:5});
};

config.macros.ccLogin.doLogin=function(username, password, item, place){
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	var userParams = {};
	userParams.place = place;
	var adaptor = new config.adaptors[config.defaultCustomFields['server.type']];
	var context = {};
	context.host = window.url;
	context.username = username;
	if(me.sha1 == true)
		context.password = Crypto.hexSha1Str(password);
	else
		context.password = password;
	adaptor.login(context,userParams,config.macros.ccLogin.loginCallback)
	var html = me.stepDoLoginIntroText; 
	w.addStep(me.stepDoLoginTitle,html);
	w.setButtons([
		{caption: this.buttonCancel, tooltip: this.buttonCancelToolTip, onClick: function() {config.macros.ccLogin.refresh(place);}
	}]);
}

config.macros.ccLogin.loginCallback=function(context,userParams){	
	if(context.status){
		window.location=window.fullUrl;
	}else{
		config.macros.ccLogin.refresh(userParams.place, 'Login Failed. Please try again');
	} 
};

config.macros.ccLogin.displayForgottenPassword=function(item, place){	
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	w.addStep(me.stepForgotPasswordTitle,me.stepForgotPasswordIntroText);
	w.setButtons([
		{caption: this.buttonCancel, tooltip: this.buttonCancelToolTip, onClick: function() {me.refresh(place);}},
		{caption: this.buttonSendForgottenPassword, tooltip: this.buttonSendForgottenPasswordToolTip, onClick: function() {me.sendForgottenPassword(item, place);}}
		]);
};

config.macros.ccLogin.sendForgottenPassword=function(item, place){	
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	console.log(w.formElem["forgottenPassword"].value);
}


config.macros.toolbar.isCommandEnabled=function(command,tiddler){	
	var title=tiddler.title;
	if (workspace_delete=="D"){
		// REMOVE OPTION TO DELETE TIDDLERS 
		if (command.text=='delete'){
			return false;
		}
	}
	if (workspace_udate=="D"){
		// REMOVE EDIT LINK FROM TIDDLERS 
		if (command.text=='edit'){
			return false;
		}
	}
	var ro=tiddler.isReadOnly();
	var shadow=store.isShadowTiddler(title) && !store.tiddlerExists(title);
	return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);
};

config.macros.ccOptions={};	
config.macros.ccOptions.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	if(workspacePermission.owner==1)
		wikify("[[manage|Manage Users]]<br />", place);
	if (isLoggedIn())
		wikify("[[upload|Upload]]<br />", place);
	if (workspacePermission.create==1)
		wikify("[[create|CreateWorkspace]]<br />", place);
		if (isLoggedIn())
		{
			// append url function required 
			if (window.fullUrl.indexOf("?") >0)
				wikify("[[offline|"+fullUrl+"&standalone=1]]<br />", place);
			else 
				wikify("[[offline|"+fullUrl+"?standalone=1]]<br />", place);
			
		}
};

// Returns output var with output.txtUsername and output.sessionToken
function findToken(cookieStash){
	var output={};
	if (!cookieStash){
		return false;
	}	
	//  THIS IS VERY HACKY AND SHOULD BE REFACTORED WHEN TESTS ARE IN PLACE
	var cookies=cookieStash.split('path=/');
	for(var c=0; c < cookies.length ; c++){
		var cl =cookies[c].split(";");
		for(var e=0; e < cl.length; e++){ 
			var p=cl[e].indexOf("=");
			if(p!=-1){
				var name=cl[e].substr(0,p).trim();
				var value=cl[e].substr(p+1).trim();       
				if (name=='txtUserName'){
					output.txtUserName=value;
				}
				if (name=='sessionToken'){
					output.sessionToken=value;
				}
			}
		}
	}	
	return output;
};



function cookieString(str){	

	var cookies = str.split(";");
	var output = {};
	for(var c=0; c < cookies.length; c++){
		var p = cookies[c].indexOf("=");
		if(p != -1) {
			var name = cookies[c].substr(0,p).trim();
			var value = cookies[c].substr(p+1).trim();
			if (name=='txtUserName'){
				output.txtUserName=value;
			}
			if (name=='sessionToken'){
				output.sessionToken=value;
			}
		}
	}
	return output;
}

Story.prototype.displayDefaultTiddlers = function()
{
    var tiddlers="";
    if (isLoggedIn()) {        
		var url = window.location;        
		url = url.toString();        
		var bits = url.split('#');        
		if (bits.length == 1) {            
			tiddlers = store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));            
			story.displayTiddlers(null, tiddlers);
		}
	} else {        
		tiddlers=store.filterTiddlers(store.getTiddlerText("AnonDefaultTiddlers"));        
		story.displayTiddlers(null, tiddlers);   
	}    
};

window.restart = function (){
		story.displayDefaultTiddlers();
		invokeParamifier(params,"onstart");
		window.scrollTo(0,0); 
};


//}}}