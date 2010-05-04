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
	j.html = "<div id='divdiv'></div>";
	return {
		title:"Image Upload",
		minWidth:180,
		minHeight:150,
		onShow: function() {
			jQuery('#divdiv').children().remove();
			wikify('<<binaryUpload edit:"tags" tags:"image">>', jQuery('#divdiv'));
		}, 
		contents:[
			{id:'tab1',
			label:'as',
			expand:true,
			padding:0,
			elements:[j]
			}],
		buttons:[]
	};
});
