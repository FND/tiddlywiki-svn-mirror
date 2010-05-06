/*********************************************************************************************************/
/**
 * fileicon plugin for CKEditor 3.x (Author: Lajox ; Email: lajox@19www.com)
 * version:	 1.0
 * Released: On 2009-12-11
 * Download: http://code.google.com/p/lajox
 */
/*********************************************************************************************************/

CKEDITOR.dialog.uiElementDefinition = function()
 {
    alert('opng');
}
CKEDITOR.dialog.add('tw_uploader',
function(a) {
    page1 = {
        type: 'html'
    };
    page1.html = "<div id='browser-div' class='tw_uplaoder_container'>browse me </div>";
    page2 = {
        type: 'html'
    };
    page2.html = "<div id='upload-div' class='tw_uplaoder_container'>upload </div>";
    return {
        title: "Image Upload",
        onLoad: function() {
            wikify('<<imageSelector>>', jQuery('#browser-div')[0]);
            wikify('<<timeline>>', jQuery('#insert-div')[0]);
            wikify('<<binaryUpload>>', jQuery('#upload-div')[0]);

        },
        onOk: function() {
				var html = [];
				jQuery('.selectedImage').each(function() {
					html.push("<img src='"+this.src+"' />");
				});
				jQuery('.selectedImage').removeClass('selectedImage');
				 this.getParentEditor().insertHtml(html.join(' '));
        },
        contents: [
        {
            id: 'browseTab',
            label: 'Browse',
            expand: true,
            elements: [page1]
        },
        {
            id: 'uploadTab',
            label: 'Upload',
            elements: [page2]
        }
        ],
        buttons: [{
            type: 'button',
            id: 'binaryUpload',
            label: 'Upload',
            onClick: function(click) {
                jQuery('#container-div').children('form').submit();
            }
        },
        CKEDITOR.dialog.okButton, CKEDITOR.dialog.cancelButton
        ]
    };
});


