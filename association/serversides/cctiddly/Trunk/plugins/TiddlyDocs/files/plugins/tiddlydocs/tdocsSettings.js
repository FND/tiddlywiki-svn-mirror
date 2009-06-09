
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


config.commands.editHtml={
	text: "edit",
	tooltip: "Edit this section"
}

config.views.wikified.defaultText= "The section has not been edited yet.";

//}}}

