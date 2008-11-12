config.macros.ccChangePassword={};
merge(config.macros.ccChangePassword,{
	title:"Change Password", 
	subTitle : "for user ", 
	step1Html: " <label for='old'>Old Password </label><input name='old' type='password'/><br/> <label for='new1'>New Password </label> <input  name='new1' type='password' /><br /><label for='new2'>Repeat Password</label> <input  name='new2' type='password' /> ",   
	buttonChangeText:"Change Password",
	buttonChangeToolTip:"Click to change your password", 
	buttonCancelText:"Cancel",
	buttonCancelToolTip:"Click to cancel",
	noticePasswordsNoMatch : "Your new passwords do not match", 
	noticePasswordWrong : "Your password is incorrect.",
	noticePasswordUpdated : "Your Password has been updated", 
	noticePasswordUpdateFailed : "Your Password was NOT updated." 
});

config.macros.ccChangePassword.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var w = new Wizard();
	var me = config.macros.ccChangePassword;
	w.createWizard(place,me.title);
	w.addStep(me.subTitle+cookieString(document.cookie).txtUserName,me.step1Html);
	w.setButtons([
		{caption: me.buttonChangeText, tooltip: me.buttonChangeToolTip, onClick: function(){config.macros.ccChangePassword.doPost(w);  } }
	]);
};

config.macros.ccChangePassword.doPost = function (w) {
	me = config.macros.ccChangePassword;
	if(!w.formElem.new1.value || !w.formElem.new2.value || !w.formElem.old.value) {
		displayMessage(me.noticePasswordUpdateFailed);
		return false;
	}
	if(w.formElem.new1.value != w.formElem.new2.value){
		displayMessage(me.noticePasswordsNoMatch);
		return false;
	}
	doHttp("POST", url+"handle/changePassword.php", "&new1="+Crypto.hexSha1Str(w.formElem.new1.value)+"&new2="+Crypto.hexSha1Str(w.formElem.new2.value)+"&old1="+Crypto.hexSha1Str(w.formElem.old.value),null,null,null,config.macros.ccChangePassword.callback);	
}

config.macros.ccChangePassword.callback = function(status,context,responseText,uri,xhr) {
	if(xhr.status == 304)
		displayMessage(me.noticePasswordUpdateFailed);
	else
		displayMessage(me.noticePasswordUpdated);
}

//}}}
