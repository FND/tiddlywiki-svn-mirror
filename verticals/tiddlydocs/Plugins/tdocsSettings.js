//{{{

//config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;

if(isLoggedIn())
	config.options.txtTheme = "myPageTheme";
else
	config.options.txtTheme = "loginTheme";

//config.options.chkBackstage = false;


config.commands.editHtml={
	text: "edit",
	tooltip: "Edit this section"
}

config.views.wikified.defaultText= "The section has not been edited yet.";

// FCKEditor textarea height
 config.options.txtFCKheight = "250px";

config.options.txtFCKeditorPath = 'plugins/FCKEditor/files/fckeditor/';


// set the document from the hash
var hash =  window.location.hash.substring(1);
if(hash!="")
	window.activeDocument = window.location.hash.substring(1);
else
	window.activeDocument = 'The Internet';	
	


//config.macros.ccLogin.defaults.username = 'username';	
//config.macros.ccLogin.defaults.password = 'password';

//if(window.workspace=="")
//	config.options.txtTheme = 'sandboxTheme';



//}}}


