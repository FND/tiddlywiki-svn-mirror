//{{{

/***
|''Name''|ccRegister|
|''Description''|Allows users to register for ccTiddly, reqired ccLogin|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|1.0.1|
|''Date''|12/05/2008|
|''Status''|@@alpha@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccRegister.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccRegister.js|
|''License''|BSD|
|''Requires''|ccVariables|
|''Overrides''|restart|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Keywords''|ccTiddly ccLogin|

!Description
Allows users to register for ccTiddly, reqired ccLogin
!Usage
{{{
<<ccLogin>>
}}}

!Code

***/
//{{{

config.macros.register={};	
merge(config.macros.register,{
	usernameRequest:"username",
	passwordRequest:"password",
	passwordConfirmationRequest:"confirm password",
	emailRequest:"email",
	stepRegisterTitle:"Register for an account.",
	stepRegisterIntroText:"Hi, please register below.... ",
	stepRegisterHtml:"<table><tr><td style='text-align: right;'>username</td><td><input class='input' id='reg_username' name='reg_username' tabindex='1'/></td><td><span></span><input type='hidden' name='username_error'></input></td></tr><tr><td style='text-align: right;'>email</td><td><input class='input' name=reg_mail id='reg_mail' tabindex='2'/></td><td><span> </span><input type='hidden' name='mail_error'></input></td></tr><tr><td style='text-align: right;'>password</td><td><input type='password' class='input' id='password1' name='reg_password1' tabindex='3'/></td><td><span> </span><input type='hidden' name='pass1_error'></input></td></tr><tr><td style='text-align: right;'>confirm password</td><td><input type='password' class='input' id='password2' name='reg_password2' tabindex='4'/></td><td><span> </span><input type='hidden' name='pass2_error'></input></td></tr></table>",
	buttonCancel:"Cancel",
	buttonCancelToolTip:"Cancel transaction ",
	buttonRegister:"Register",	
	buttonRegisterToolTip:"click to register",
	msgCreatingAccount:"Attempting to create the account for you.", 
	msgNoUsername:"No username entered", 
	msgEmailOk:"Email address is OK.",
	msgNoPassword:"no password entered.",
	msgDifferentPasswords:"Your Passwords do not match.",
	msgUsernameTaken:"The username requested has been taken.",
	msgUsernameAvailable:"The username is available.",
	step2Title:"",
	step2Html:"Please wait while we create you an account...",
	errorRegisterTitle:"Error",
	errorRegister:"User not created, please try again with a different username."
});

config.macros.register.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	//config.macros.login.refresh(place);
};

config.macros.register.displayRegister=function(place, w, item){
	var me = config.macros.register;
	var w = new Wizard(item);
	w.addStep(me.stepRegisterTitle, me.stepRegisterHtml);
	w.formElem["reg_username"].onkeyup=function() {me.isUsernameAvailable(w);};
	w.setButtons([
		{caption: me.buttonRegister, tooltip: me.buttonRegisterToolTip, onClick:function() { me.doRegister(place, w)}},
		{caption: me.buttonCancel, tooltip: me.buttonCancelToolTip, onClick: function() { config.macros.ccLogin.refresh(place)}}
	]);
}

config.macros.register.setStatus=function(w, element, text){
	var label_var = w.getElement(element);
	removeChildren(label_var.previousSibling);
	var label = document.createTextNode(text);
	label_var.previousSibling.insertBefore(label,null);
}

config.macros.register.doRegister=function(place, w){
	var me = config.macros.register;
	if(w.formElem["reg_username"].value==''){
		me.setStatus(w, "username_error", me.msgNoUsername);
	}else {
		me.setStatus(w, "username_error", "");
	}
	if(me.emailValid(w.formElem["reg_mail"].value)){
		me.setStatus(w, "mail_error", me.msgEmailOk);
	}else{
		me.setStatus(w, "mail_error", "invalid email address");
		return false;
	}
	if(w.formElem["reg_password1"].value==''){
		me.setStatus(w, "pass1_error", me.msgNoPassword);
		return false;
	}else{
		me.setStatus(w, "pass1_error", "");
	}
	if(w.formElem["reg_password2"].value==''){
		me.setStatus(w, "pass2_error", me.msgNoPassword);
		return false;
	}
	if(w.formElem["reg_password1"].value != w.formElem["reg_password2"].value ){
		me.setStatus(w, "pass1_error", me.msgDifferentPasswords);
		me.setStatus(w, "pass2_error", me.msgDifferentPasswords);
		return false;
	}
 	var params ={};
	params.p = Crypto.hexSha1Str(w.formElem['reg_password1'].value);
	params.u = w.formElem['reg_username'].value;
	params.place = place;
	params.w = w;
	var loginResp=doHttp('POST',url+'/handle/register.php',"username="+w.formElem['reg_username'].value+"&reg_mail="+w.formElem['reg_mail'].value+"&password="+Crypto.hexSha1Str(w.formElem['reg_password1'].value)+"&password2="+Crypto.hexSha1Str(w.formElem['reg_password2'].value),null,null,null,config.macros.register.registerCallback,params);
	w.addStep(me.step2Title, me.msgCreatingAccount);
	w.setButtons([
		{caption: me.buttonCancel, tooltip: me.buttonCancelToolTip, onClick: function() {config.macros.ccLogin.refresh(place);}
	}]);
}

config.macros.register.emailValid=function(str){
	if((str.indexOf(".") > 0) && (str.indexOf("@") > 0))
		return true;
	else
		return false;
};

config.macros.register.usernameValid=function(str){
	if((str.indexOf("_") > 0) && (str.indexOf("@") > 0))
		return false;
	else
		return true;
};

config.macros.register.registerCallback=function(status,params,responseText,uri,xhr){
	var userParams = {};
	userParams.place = params.place;
	if (xhr.status==304){
		params.w.addStep(config.macros.register.errorRegisterTitle, config.macros.register.errorRegister);
		return false;
	}	
	var adaptor = new config.adaptors[config.defaultCustomFields['server.type']];
	var context = {};
	context.host = window.url;
	context.username = params.u;
	context.password = params.p;
	adaptor.login(context,userParams,config.macros.ccLogin.loginCallback);
	return true;
}

config.macros.register.isUsernameAvailable=function(w){
	var params = {};
	params.w = w;
	doHttp('POST',url+'/handle/register.php',"username="+w.formElem["reg_username"].value+"&free=1",null,null,null,config.macros.register.isUsernameAvailabeCallback,params);
	return false;
};

config.macros.register.isUsernameAvailabeCallback=function(status,params,responseText,uri,xhr){
	var me = config.macros.register;
	var resp = (responseText > 0) ? me.msgUsernameTaken : me.msgUsernameAvailable;
	config.macros.register.setStatus(params.w, "username_error", resp);
};
//}}}