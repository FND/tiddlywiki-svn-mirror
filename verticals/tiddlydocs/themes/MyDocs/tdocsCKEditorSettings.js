
/***
|''Name''|tdocsCKEditorSettings|
|''Description''|the default config for CKEditor when used in TiddlyDocs. |
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/tdocsCKEditorSettings.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/verticals/tiddlydocs/Plugins/tdocsCKEditorSettings.js |
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
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
	    ['Copy','Paste', 'SpellChecker'],
	    ['Undo','Redo','-','Find','Replace'],
	    ['Bold','Italic','Underline','Strike'],
	    ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
	    ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
		'/',    
		['Table','HorizontalRule','SpecialChar'],
	    ['Styles','Format','Font','FontSize'],
	    ['TextColor','BGColor', 'tw_uploader']
	];
	CKEDITOR.config.toolbar = 'Basic';
	CKEDITOR.config.disableNativeSpellChecker = false;
	CKEDITOR.config.extraPlugins = 'tw_uploader,pastefromword';
}; 






//}}}
