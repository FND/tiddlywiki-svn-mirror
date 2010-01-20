//{{{
	
// FCKEditor textarea height

if(typeof CKEDITOR != "undefined"){

	CKEDITOR.config.toolbar_Basic =
	[
	    ['Cut','Copy','Paste', 'SpellChecker'],
	    ['Undo','Redo','-','Find','Replace'],
	    ['Bold','Italic','Underline','Strike'],
	    ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
	    ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
		'/',    
		['Image', 'Table','HorizontalRule','SpecialChar'],
	    ['Styles','Format','Font','FontSize'],
	    ['TextColor','BGColor'],
	];
	CKEDITOR.config.disableNativeSpellChecker = false;
}
//}}}