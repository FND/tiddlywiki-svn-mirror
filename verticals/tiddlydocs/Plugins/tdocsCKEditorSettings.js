/***
|''Name''|tdocsCKEditorSettings|
|''Description''|the default config for CKEditor when used in TiddlyDocs. |
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/tdocsCKEditorSettings.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/tdocsCKEditorSettings.js |
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Requires''||
!Description

the default config for CKEditor when used in TiddlyDocs. 
!Usage
{{{

Just add this tiddler to a tiddlywiki file and make sure it's tagged systemConfig.

}}}

!Code
***/

//{{{
	
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