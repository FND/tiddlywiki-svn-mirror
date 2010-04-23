/*********************************************************************************************************/
/**
 * fileicon plugin for CKEditor 3.x (Author: Lajox ; Email: lajox@19www.com)
 * version:	 1.0
 * Released: On 2009-12-11
 * Download: http://code.google.com/p/lajox
 */
/*********************************************************************************************************/

CKEDITOR.dialog.add('tw_uploader',function(a){
 j={type:'html'};
 j.html = wikifyStatic(store.getTiddlerText('MainMenu'));
return {title:"title",minWidth:280,minHeight:150,contents:[{id:'tab1',label:'',title:'',expand:true,padding:0,elements:[j]}],buttons:[CKEDITOR.dialog.cancelButton]};

});
