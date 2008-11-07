config.macros.OpenID={};
merge(config.macros.OpenID,{
	buttonBackstageText:"about",
	titleOpenID:"Login with OpenID",
	buttonOpenIDText:"OpenID Login",
	buttonOpenIDToolTip:"Click to use OpenID Login" 
});

config.macros.OpenID.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var w = new Wizard();
	var me = config.macros.OpenID;
	w.createWizard(place,me.titleOpenID);
	w.addStep(null,"<input name='open_id_login' value='http://' size=50 />");
	w.setButtons([
		{caption: me.buttonOpenIDText, tooltip: me.buttonOpenIDToolTip, onClick: function(){config.macros.OpenID.login(w);  } }
	]);
};

config.macros.OpenID.login = function (w) {
window.location = "https://127.0.0.1/plugins/openid/files/openid/try_auth.php?action=verify&openid_identifier="+w.formElem.open_id_login.value;
}

//}}}


