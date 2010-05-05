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
	page1.html = "<div id='insert-div' class='tw_uplaoder_container'>insert</div>";
	page2={type:'html'};
	page2.html = "<div id='browser-div' class='tw_uplaoder_container'>browse me </div>";
	page3={type:'html'};
	page3.html = "<div id='upload-div' class='tw_uplaoder_container'>upload </div>";
	return {
		title:"Image Upload",
		minWidth:180,
		minHeight:150,
		onShow: function() {
		    console.log('on show ', arguments);
		    jQuery(".tw_uplaoder_container").children().remove();
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
    			elements:
    			        [
    			            page1  
    			        ]
    			
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
                    jQuery('#container-div').children('form').submit();
                }
            },CKEDITOR.dialog.cancelButton]
	};
});
