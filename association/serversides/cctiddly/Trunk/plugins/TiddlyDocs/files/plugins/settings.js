//{{{

//config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;

//config.options.txtTheme = "TreeTheme";

if(isLoggedIn())
	config.options.txtTheme = "mpTheme";
else
	config.options.txtTheme = "AnonMpTheme";

config.options.chkBackstage = false;

//}}}
