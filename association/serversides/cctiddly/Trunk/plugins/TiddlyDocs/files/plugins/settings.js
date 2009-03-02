//{{{

//config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;

//config.options.txtTheme = "TreeTheme";

if(isLoggedIn())
	config.options.txtTheme = "SplitTreeTheme";
else
	config.options.txtTheme = "SplitTreeThemeAnon";


config.options.txtTheme = "mpBarTheme";
config.options.chkBackstage = false;

//}}}
