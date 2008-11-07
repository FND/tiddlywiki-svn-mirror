config.macros.changePassword={};
merge(config.macros.changePassword,{
	title:"Change Password", 
	subTitle : "for user ", 
	step1Html: "Old Password : <input name='old' type='password'/><br/> New Password : <input name='new1' type='password' /><br /> New Password Again : <input name='new2' type='password' /> ",   
	buttonChangeText:"Change Password",
	buttonChangeToolTip:"Click to change your password", 
	buttonCancelText:"Cancel",
	buttonCancelToolTip:"Click to cancel",
	noticePasswordsNoMatch : "Your new passwords do not match", 
	noticePasswordWrong : "Your password is incorrect.",
	noticePasswordUpdated : "Your Password has been updated", 
	noticePasswordUpdateFailed : "Your Password was NOT updated." 
});

config.macros.changePassword.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var w = new Wizard();
	var me = config.macros.changePassword;
	w.createWizard(place,me.title);
	w.addStep(me.subTitle+cookieString(document.cookie).txtUserName,me.step1Html);
	w.setButtons([
		{caption: me.buttonChangeText, tooltip: me.buttonChangeToolTip, onClick: function(){config.macros.changePassword.doPost(w);  } }
	]);
};

config.macros.changePassword.doPost = function (w) {
	me = config.macros.changePassword;
	if(w.formElem.new1.value != w.formElem.new2.value){
		alert(me.noticePasswordsNoMatch);
		return false;
	}
	doHttp("POST", url+"handle/changePassword.php", "&new1="+Crypto.hexSha1Str(w.formElem.new1.value)+"&new2="+Crypto.hexSha1Str(w.formElem.new2.value)+"&old1="+Crypto.hexSha1Str(w.formElem.old.value),null,null,null,config.macros.changePassword.callback);	
}

config.macros.changePassword.callback = function(status,context,responseText,uri,xhr) {
	if(xhr.status == 304)
		displayMessage(me.noticePasswordUpdateFailed);
	else
		displayMessage(me.noticePasswordUpdated);
}

//}}}


