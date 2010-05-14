/*********************************************************************************************************/
/**
 * fileicon plugin for CKEditor 3.x (Author: Lajox ; Email: lajox@19www.com)
 * version:	 1.0
 * Released: On 2009-12-11
 * Download: http://code.google.com/p/lajox
 */
/*********************************************************************************************************/

CKEDITOR.plugins.add('tw_uploader',   
  {    
    requires: ['tw_uploader'],
	lang : ['en'], 
    init:function(a) { 
		var b="tw_uploader";
		var c=a.addCommand(b,new CKEDITOR.dialogCommand(b));
		c.modes={wysiwyg:1,source:0};
		c.canUndo=false;
		a.ui.addButton("tw_uploader",{
			label:a.lang.tw_uploader.title,
			command:b,
			icon:this.path+"pictureicon.jpg"
		});
	CKEDITOR.dialog.add(b,this.path+"dialogs/tw_uploader.js")}
});

