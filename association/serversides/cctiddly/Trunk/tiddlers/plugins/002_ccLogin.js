// ccLogin //

//{{{

config.macros.ccLogin={sha1:false};
	
function isLoggedIn() {
	if(window.loggedIn)
	 	return true;
	else 
		return false;
}

config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	if(isLoggedIn()){
		createTiddlyButton(place, config.macros.ccLogin.buttonLogout, config.macros.ccLogin.buttonLogoutToolTip, function(){
				if (window.fullUrl.indexOf("?") >0)
					window.location = window.fullUrl+"&logout=1";
				else
					window.location = window.fullUrl+"?logout=1";
			return false;
		},null,null,this.accessKey);
	}else{
		createTiddlyButton(place,config.macros.ccLogin.buttonlogin, config.macros.ccLogin.buttonLoginToolTip, function() {
			story.displayTiddler(null, "Login");
		},null,null,this.accessKey);
	}
};

var loginState=null;
var registerState=null;

config.macros.ccLogin.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var params = paramString.parseParams('reload',null,true);
	config.macros.ccLogin.refresh(place, params[0].reload);
};
 
config.macros.ccLogin.refresh=function(place, reload, error){
	removeChildren(place);
	var w = new Wizard();
	if (isLoggedIn()){
		w.createWizard(place,this.stepLogoutTitle);
		w.addStep(null, this.stepLogoutText+decodeURIComponent(cookieString(document.cookie).txtUserName)+"<br /><br />");
		w.setButtons([
			{caption: this.buttonLogout, tooltip: this.buttonLogoutToolTip, onClick: function() {window.location=fullUrl+"?&logout=1"}
		}]);
		return true;
	}
	w.createWizard(place,this.WizardTitleText);
	w.setValue('reload', reload);


	var me=config.macros.ccLogin;
	var oldForm = w.formElem.innerHTML;
	var form = w.formElem;
	if (error!==undefined)
		this.stepLoginTitle=error;	
	w.addStep(this.stepLoginTitle,me.stepLoginIntroTextHtml);
	txtPassword = w.formElem.txtPassword;
	w.formElem.password.style.display="none";
	txtPassword.onkeyup = function() {
		if(me.sha1 == true){
			w.formElem.password.value = Crypto.hexSha1Str(w.formElem.txtPassword.value);
		} else { 
			w.formElem.password.value = w.formElem.txtPassword.value;
		}
	};
	txtPassword.onchange = txtPassword.onkeyup;
	w.formElem.method ="POST";
	w.formElem.onsubmit = function() {config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place); return false;};
	var submit = createTiddlyElement(null, "input");
	submit.type="submit";
	submit.style.display="none";
	w.formElem.appendChild(submit);
	var cookieValues=findToken(document.cookie);
	if (cookieValues.txtUserName!==undefined){
		w.formElem["username"].value=decodeURIComponent(cookieValues.txtUserName) ;
	}
	var footer = findRelated(form,"wizardFooter","className");
	createTiddlyButton(w.footer,this.buttonLogin,this.buttonLoginToolTip,function() {
		if (w.formElem["username"].value==""){
			displayMessage(me.msgNoUsername);
			return false;
		}
		if (w.formElem["password"].value==""){
			displayMessage(me.msgNoPassword);
			return false;
		}
		config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place);
	});
	
	
	createTiddlyButton(w.footElem,this.buttonLogin,this.buttonLoginToolTip,function() {
		config.macros.ccLogin.doLogin(w.formElem["username"].value, w.formElem["password"].value, this, place);
	},null, null, null,  {tabindex:'3'});
/*	
	if(config.macros.register!==undefined){		
		var li_register = createTiddlyElement(w.footElem, "li");
		createTiddlyButton(li_register,config.macros.register.buttonRegister,config.macros.register.buttonRegisterToolTip,function() {
				config.macros.register.displayRegister(place, w, this);
		},"nobox", null, null,  {tabindex:4});
	}
	var li_forgotten = createTiddlyElement(w.footElem, "li");
	createTiddlyButton(li_forgotten,this.buttonForgottenPassword,this.buttonForgottenPasswordToolTip,function() {
		config.macros.ccLogin.displayForgottenPassword(this, place);
	},"nobox", null, null,  {tabindex:5});
*/
};

config.macros.ccLogin.doLogin=function(username, password, item, place){
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	var userParams = {};
	userParams.place = place;
	var adaptor = new config.adaptors[config.defaultCustomFields['server.type']];
	var context = {};
	context.reload = w.getValue("reload");
	context.host = window.url;
	context.username = username;
	context.password = password;
	adaptor.login(context,userParams,config.macros.ccLogin.loginCallback)
	var html = me.stepDoLoginIntroText; 
	w.addStep(me.stepDoLoginTitle,html);
	w.setButtons([
		{caption: this.buttonCancel, tooltip: this.buttonCancelToolTip, onClick: function() {config.macros.ccLogin.refresh(place);}
	}]);
}

config.macros.ccLogin.loginCallback=function(context,userParams){

	if(!context.status)
	{
		config.macros.ccLogin.refresh(userParams.place, config.macros.ccLogin.msgLoginFailed);
	}else{
		if(context.reload=="false"){
				window.loggedIn = true;
				var $ = jQuery;
				story.refreshTiddler(story.findContainingTiddler(userParams.place).id.replace("tiddler", ""), null, true);			
		}else{
							window.location.reload();	
		}
	}	 
};

config.macros.ccLogin.displayForgottenPassword=function(item, place){	
	var w = new Wizard(item);
	var me = config.macros.ccLogin;
	w.addStep(me.stepForgotPasswordTitle,me.stepForgotPasswordIntroText);
	w.setButtons([
		{caption: this.buttonCancel, tooltip: this.buttonCancelToolTip, onClick: function() {me.refresh(place);}}
	]);
};

//config.macros.ccLogin.sendForgottenPassword=function(item, place){	
//	var w = new Wizard(item);
//	var me = config.macros.ccLogin;
//}

config.macros.toolbar.isCommandEnabled=function(command,tiddler){	
	var title=tiddler.title;
	if (workspace_delete=="D"){
		// REMOVE OPTION TO DELETE TIDDLERS 
		if (command.text=='delete')
			return false;
	}
	if (workspace_udate=="D"){
		// REMOVE EDIT LINK FROM TIDDLERS 
		if (command.text=='edit')
			return false;
	}
	var ro=tiddler.isReadOnly();
	var shadow=store.isShadowTiddler(title) && !store.tiddlerExists(title);
	return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);
};

// Returns output var with output.txtUsername and output.sessionToken
function findToken(cookieStash){
	var output={};
	if (!cookieStash)
		return false;	
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


//}}}