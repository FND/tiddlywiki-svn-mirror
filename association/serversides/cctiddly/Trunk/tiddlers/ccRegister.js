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
	step2Title:"",
	step2Html:"Please wait while we create you an account..."
});

config.macros.register.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	//config.macros.login.refresh(place);
};

config.macros.register.displayRegister=function(place, w, item){
	var me = config.macros.register;
	var w = new Wizard(item);
	w.addStep(me.stepRegisterTitle, me.stepRegisterHtml);
	w.formElem["reg_username"].onkeyup=function() {config.macros.register.isUsernameAvailable(w);};
	w.setButtons([
		{caption: me.buttonRegister, tooltip: me.buttonRegisterToolTip, onClick:function() { config.macros.register.doRegister(place, w)}},
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
			config.macros.register.setStatus(w, "username_error", "no username entered");
	}
	if(config.macros.register.emailValid(w.formElem["reg_mail"].value)){
		config.macros.register.setStatus(w, "mail_error", "email address is ok");
	}else{
		config.macros.register.setStatus(w, "mail_error", "invalid email address");
		return false;
	}
	if(w.formElem["reg_password1"].value==''){
		config.macros.register.setStatus(w, "pass1_error", "no password entered");		
		return false;
	}else{
		config.macros.register.setStatus(w, "pass1_error", "");				
	}
	if(w.formElem["reg_password2"].value==''){
		config.macros.register.setStatus(w, "pass2_error", "no password entered");
		return false;
}
	if(w.formElem["reg_password1"].value != w.formElem["reg_password2"].value ){			
		config.macros.register.setStatus(w, "pass1_error", "your passwords do not match");
		config.macros.register.setStatus(w, "pass2_error", "your passwords do not match");

		return false;
	}

	var loginResp=doHttp('POST',url+'/handle/register.php',"username="+w.formElem['reg_username'].value+"&reg_mail="+w.formElem['reg_mail'].value+"&password="+w.formElem['reg_password1'].value+"&password2="+w.formElem['reg_password2'].value,null,null,null,config.macros.register.registerCallback,params);
	w.addStep(me.step2Title,"attempting to register your account.") ;
	w.setButtons([
		{caption: me.buttonCancel, tooltip: me.buttonCancelToolTip, onClick: function() {config.macros.login.refresh(place);}
	}]);
}

config.macros.register.emailValid=function(str){
	if((str.indexOf(".") > 0) && (str.indexOf("@") > 0)){	
		return true;
	}else{
		return false;
	}
};

config.macros.register.usernameValid=function(str){
	if((str.indexOf("_") > 0) && (str.indexOf("@") > 0)){	
		return false;
	}else{
		return true;
	}
};

config.macros.register.registerCallback=function(status,params,responseText,uri,xhr){
	window.location=window.location;
	return true;

}

config.macros.register.isUsernameAvailable=function(w){
	var params = {};
	params.w = w;
	doHttp('POST',url+'/handle/register.php',"username="+w.formElem["reg_username"].value+"&free=1",null,null,null,config.macros.register.isUsernameAvailabeCallback,params);
	return false;
};



config.macros.register.isUsernameAvailabeCallback=function(status,params,responseText,uri,xhr){
	var resp = (responseText > 0) ? 'The username has already been taken' : 'The username is available';
	config.macros.register.setStatus(params.w, "username_error", resp);
};

/***
|''Name''|ccRegister|
|''Description''|Allows users to Register for a user account. If the user is logged in there are informed of their username This Macro will later be added to ccLogin Status|
|''Author''|[[Simon McManus|http://simonmcmanus.com]] |
|''Version''|1.0.1|
|''Date''|12/05/2008|
|''Status''|@@alpha@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccRegister.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/association/serversides/cctiddly/ccPlugins/ccRegister.js|
|''License''|BSD|
|''Requires''|ccLogin, ccLoginStatus|
|''Feedback''|http://groups.google.com/group/ccTiddly|
|''Keywords''|ccTiddly ccRegister|

!Description

Show the current user their login status. 

!Usage
{{{
<<ccRegister>>
}}}

!Code

***/
//{{{
	
config.macros.ccRegister ={};
config.macros.ccRegister.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var registerDiv = createTiddlyElement(place,"div",null,"loginDiv",null);
	this.refresh(registerDiv);
};

config.macros.ccRegister.refresh=function(place,errorMsg){
	var loginDivRef = document.getElementById("LoginDiv");
	removeChildren(loginDivRef);
	var wrapper = createTiddlyElement(place,"div");
	if (can_create_account != 1){
		createTiddlyElement(place,'div',null,"annotation",'You do not have permissions to register for an account ');
		return null;
	}
	if (errorMsg=='201'){
		return false;
	}
	var frm=createTiddlyElement(place,"form",null,"wizard");
	frm.onsubmit= config.macros.ccRegister.registerOnSubmit;
	createTiddlyElement(frm,"br");
	var body=createTiddlyElement(frm,"div",null,"wizardBody");
	var step=createTiddlyElement(body,"div",null,"wizardStep");

	var user_label = createTiddlyElement(step,"label",null,"label","Username");
	user_label.setAttribute("for","username");
	
	
	var username=createTiddlyElement(null,"input","username" ,"input");		
	username.onkeyup=function() {
		config.macros.ccRegister.usernameKeyPress(this.value);
	};
	step.appendChild(username);
	username.setAttribute("tabindex","1");
	createTiddlyElement(step,"span",'username_error','inlineError',null);
	createTiddlyElement(step,"br");	
	var mail_label = createTiddlyElement(step,"label",null,"label","E-Mail Address");
	mail_label.setAttribute("for","username");	
	var mail=createTiddlyElement(null,"input","mail" ,"input");		
	mail.onkeyup=function() {
		config.macros.ccRegister.mailKeyUp(this.value);
	};
	step.appendChild(mail);

	mail.setAttribute("tabindex","2");
	createTiddlyElement(step,"span",'mail_error','inlineError','');
	createTiddlyElement(step,"br");
	
	var pw1_label = createTiddlyElement(step,"label",null,"label","Password");
	pw1_label.setAttribute("for","password1");
	var password1 = createTiddlyElement(null,"input","password1","input");
	password1.setAttribute("type","password");
	password1.setAttribute("tabindex","3");
	step.appendChild(password1);
	
	createTiddlyElement(step,"span",'mail_error','inlineError','');
	
	createTiddlyElement(step,"span",'pass1_error','inlineError');
	createTiddlyElement(step,"br");
	
	var pw2_label = createTiddlyElement(step,"label",null,"label","Password Confirmation");
	pw2_label.setAttribute("for","password2");
	var password2 = createTiddlyElement(null,"input","password2","input");
	password2.setAttribute("type","password");
	password2.setAttribute("tabindex","4");
	step.appendChild(password2);
	
	createTiddlyElement(step,"span",'pass2_error','inlineError');
	createTiddlyElement(step,"br");

	var a = createTiddlyElement(step,"div",null,"submit");
	var btn = createTiddlyElement(null,"input",this.prompt,"button");
	btn.setAttribute("type","submit");
	btn.setAttribute("value","Register Account");	 
	btn.setAttribute("tabindex","5");
	
	btn.setAttribute("id","registerAccountSubmit");
	a.appendChild(btn);
	createTiddlyElement(a,"span","submitStatus",null,"");
};

config.macros.ccRegister.emailValid=function(str){
	if((str.indexOf(".") > 0) && (str.indexOf("@") > 0)){	
		return true;
	}else{
		return false;
	}
}; 

config.macros.ccRegister.mailKeyUp=function(mail){
	if(config.macros.ccRegister.emailValid(mail)){
		var a=document.getElementById('mail_error');
		var field=document.getElementById('mail');
		a.innerHTML='The email address is valid ';
		a.setAttribute("class","inlineOk");
		a.setAttribute("className", "inlineOk");
		field.setAttribute("class","input");
	}
};


config.macros.ccRegister.registerOnSubmit=function(){
	if(this.username.value==''){
		document.getElementById('username_error').innerHTML='Please enter a username';
		this.username.setAttribute("class","inputError");
		return false;
	}else{
		document.getElementById('username_error').innerHTML='Please enter a username';
		this.username.setAttribute("class","input");
	}
	var mail_space="";
	if(this.username.value===''){
			config.macros.register.setStatus(w, "username_error", "no username entered");
	}
	if(config.macros.ccRegister.emailValid(this.mail.value)){
		mail_space=document.getElementById('mail_error');
		mail_space.innerHTML="email ok";
		mail_space.setAttribute("class","inlineOk");
	}else{
		mail_space=document.getElementById('mail_error');
		mail_space.innerHTML='not a valid email address ';
		mail_space.setAttribute("class","inlineError");
		return false;
	}
	if(this.password1.value===''){
		document.getElementById('pass1_error').innerHTML='Please enter a password';
		this.password1.setAttribute("class","inputError");
		return false;
	}else{
			document.getElementById('pass1_error').innerHTML='';
			this.password1.setAttribute("class","input");
	}
	if(this.password2.value===''){
		document.getElementById('pass2_error').innerHTML='Please enter a password';
		this.password2.setAttribute("class","inputError");
		return false;
	}else{
		document.getElementById('pass2_error').innerHTML='';
		this.password2.setAttribute("class","input");
	}
	if(this.password1.value != this.password2.value ){			
		this.password1.setAttribute("class","inputError");
		document.getElementById('pass2_error').innerHTML='Please ensure both passwords match';
		this.password2.setAttribute("class","inputError");
		return false;
	}
	var submit=document.getElementById('registerAccountSubmit');
	submit.disabled=true;
	submit.setAttribute("class","buttonDisabled");
	document.getElementById('submitStatus').innerHTML='Please wait, your account is being created.';
	setTimeout(config.macros.ccRegister.registerCheckResp,3000);
	displayMessage(this.username.value);
	doHttp('POST',url+'/handle/register.php',"username=" + encodeURIComponent(this.username.value)+ "&amp;password="+Crypto.hexSha1Str(this.password1.value).toLowerCase(),null,null,null,config.macros.ccRegister.registerCallback,null);
	return false;
};

config.macros.ccRegister.registerCheckResp=function(){
	if (registerState !="Fail" && registerState !="ok"){
		alert("Your registration has timed out. ");
	}
};

config.macros.ccRegister.registerCallback=function(status,params,responseText,uri,xhr){
	if(xhr.status=='201'){
		registerState="ok";
		var loginDiv=document.getElementById("LoginDiv");
		document.getElementById('submitStatus').innerHTML='Your account has been created ';
		document.getElementById('username').value='';
		document.getElementById('mail').value='';
		document.getElementById('password1').value='';
		document.getElementById('password2').value='';
		document.getElementById('username_error').innerHTML='';
		document.getElementById('mail_error').innerHTML='';
		document.getElementById('pass1_error').innerHTML=''; 	
		document.getElementById('pass2_error').innerHTML=''; 
		var but=document.getElementById('registerAccountSubmit');
		but.disabled=false;
		but.setAttribute("class","button");
		document.getElementById('registerAccountSubmit').setAttribute('class','button');
	}else{
		registerState ="Fail";
	}
};


config.macros.ccRegister.usernameKeyPress=function(){
	doHttp('POST',url+'/handle/register.php',"username="+document.getElementById("username").value+"&amp;free=1",null,null,null,config.macros.ccRegister.usernameCallback,null);
	return false;
};

config.macros.ccRegister.usernameCallback=function(status,params,responseText,uri,xhr){
	var field = "";
	if(responseText > 0){
		var error=document.getElementById('username_error');
		field=document.getElementById('username');
		error.innerHTML='The username has already been taken.';
		error.setAttribute("class","inlineError");
		// For IE 
		error.setAttribute("className", "inlineError");
		field.setAttribute("class","inputError");
	}else{
		var a = document.getElementById('username_error');
		field = document.getElementById('username');
		a.innerHTML='The username is available ';
		// For IE
		a.setAttribute("className", "inlineOk");
		a.setAttribute("class","inlineOk");
		field.setAttribute("class","input");
	}
};


config.macros.ccRegister.workspaceNameKeyPress=function(str){

	doHttp('POST',url+'/handle/lookupWorkspaceName.php',"ccWorkspaceLookup="+str+"&free=1",null,null,null,config.macros.ccRegister.workspaceNameCallback,null);
	return false;
};

config.macros.ccRegister.workspaceNameCallback=function(status,params,responseText,uri,xhr){
	var field = "";
	if(responseText>0){{
		workspaceName_space=document.getElementById('workspaceName_error');
		workspaceName_space.innerHTML='Workspace name has already been taken';
		workspaceName_space.setAttribute("class","inlineError");
	}
	}else{
		workspaceName_space=document.getElementById('workspaceName_error');
		workspaceName_space.innerHTML="Workspace name is available";
		workspaceName_space.setAttribute("class","inlineOk");
	}
};
//}}}