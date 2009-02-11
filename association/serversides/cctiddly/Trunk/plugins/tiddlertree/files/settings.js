//{{{

//config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;
//config.options.txtTheme = "TreeTheme";

if(isLoggedIn())
	config.options.txtTheme = "SplitTreeTheme";
else
	config.options.txtTheme = "SplitTreeThemeAnon";


config.options.txtTheme = "TreeTheme";
config.options.chkSinglePageMode = true;
config.options.chkBackstage = false;

//}}}
