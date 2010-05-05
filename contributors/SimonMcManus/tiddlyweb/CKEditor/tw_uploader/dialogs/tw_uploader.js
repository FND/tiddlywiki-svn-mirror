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
	j.html = "<div id='container-div'></div>";
	return {
		title:"Image Upload",
		minWidth:180,
		minHeight:150,
		onShow: function() {
		    jQuery("#container-div").children().remove();
			wikify('<<binaryUpload edit:"tags" tags:"image">>', jQuery('#container-div'));
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
		buttons:[    {
                type:'button',
                id:'binaryUpload', /* note: this is not the CSS ID attribute! */
                label: 'Upload',
                onClick: function(click){
                    console.log(click.data.dialog);
                    jQuery('#container-div').children('form').submit();
                   //action on clicking the button
                }
            },CKEDITOR.dialog.cancelButton]
	};
});
