//{{{

//config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;
config.options.chkInsertTabs = true;
//config.options.chkBackstage = false;


config.commands.editHtml={
	text: "edit",
	tooltip: "Edit this section"
}

config.views.wikified.defaultText= "Enter section text here.";

// FCKEditor textarea height
 config.options.txtFCKheight = "250px";

config.options.txtFCKeditorPath = 'plugins/FCKEditor/files/fckeditor/';


CKEDITOR.config.toolbar_Basic =
[
    ['Cut','Copy','Paste', 'SpellChecker'],
    ['Undo','Redo','-','Find','Replace'],
    ['Bold','Italic','Underline','Strike'],
    ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
    ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
    ['Image', 'Table','HorizontalRule','SpecialChar'],
    ['Styles','Format','Font','FontSize'],
    ['TextColor','BGColor'],
];

CKEDITOR.config.disableNativeSpellChecker = false;



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


