/*********************************************************************************************************/
/**
 * fileicon plugin for CKEditor 3.x (Author: Lajox ; Email: lajox@19www.com)
 * version:	 1.0
 * Released: On 2009-12-11
 * Download: http://code.google.com/p/lajox
 */
/*********************************************************************************************************/

CKEDITOR.dialog.add('tw_uploader',function(a){
	page1={type:'html'};
	page1.html = "<div id='container-div'></div>";
	page2={type:'html'};
	page2.html = "<div id='browser-div'>browse me </div>";
	page3={type:'html'};
	page3.html = "<div id='browser-div'>browse me </div>";
	return {
		title:"Image Upload",
		minWidth:180,
		minHeight:150,
		onShow: function() {
		    console.log('on show ', arguments);
		    jQuery("#container-div").children().remove();
			wikify('<<binaryUpload edit:"tags" tags:"image">>', jQuery('#container-div'));
		},
	    changeFocus  : function() {
	        alert('bb');
	    },
		contents:[
			{   
			    id:'insertTab',
				label:'Insert',
    			expand:true,
                accessKey: 'i',
    			elements:[page1]
			},{
                id:'browseTab',
                label:'Browse', 
                accessKey: 'b',
                elements:[page2]
            },{
                id:'uploadTab',
                label:'Upload', 
                accessKey: 'u',
                elements:[page3]
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
