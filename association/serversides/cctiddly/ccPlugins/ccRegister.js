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
	frm.setAttribute("onsubmit",this.registerOnSubmit);
	createTiddlyElement(frm,"h1",null,null,"Register");
	createTiddlyElement(frm,"h2",null,null,"Sign up for an account");
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
	step.appendChild(password1);
	
	createTiddlyElement(step,"span",'mail_error','inlineError','');
	
	createTiddlyElement(step,"span",'pass1_error','inlineError');
	createTiddlyElement(step,"br");
	
	var pw2_label = createTiddlyElement(step,"label",null,"label","Password Confirmation");
	pw2_label.setAttribute("for","password2");
	var password2 = createTiddlyElement(null,"input","password2","input");
	password2.setAttribute("type","password");
	step.appendChild(password2);
	
	createTiddlyElement(step,"span",'pass2_error','inlineError');
	createTiddlyElement(step,"br");

	var a = createTiddlyElement(step,"div",null,"submit");
	var btn = createTiddlyElement(null,"input",this.prompt,"button");
	btn.setAttribute("type","submit");
	btn.setAttribute("value","Register Account"); 
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
		displayMessage('no username entered');
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
		return false;z
	}
	var submit=document.getElementById('registerAccountSubmit');
	submit.disabled=true;
	submit.setAttribute("class","buttonDisabled");
	document.getElementById('submitStatus').innerHTML='Please wait, your account is being created.';
	
	setTimeout(config.macros.ccRegister.registerCheckResp,3000);
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
		error.innerHTML='The username has already been taken. ';
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