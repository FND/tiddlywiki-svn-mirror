﻿/*********************************************************************************************************/
/**
 *  tw_uploader plugin for CKEditor 3.x (Author: Lajox ; Email: mcmanus.simon@gmail.com)
 * version:	 1.0
 * Released: On 2010-04-10
 */
/*********************************************************************************************************/


CKEDITOR.dialog.add('tw_uploader',
function(a) {
    page1 = {
        type: 'html',
		html: "<div id='browser-div' class='tw_uplaoder_container'></div>"
    };
    page2 = {
        type: 'html',
		html: "<div id='upload-div' class='tw_uplaoder_container'></div>"
    };
	page3 = {
		type: 'html',
		html: "URL<br/><input id='urlInsert' class='cke_dialog_ui_input_text' type='text' />"
	}
    return {
        title: "Insert New Image",
		minWidth : 200,   
       minHeight : 100,
		onShow: function() {
			jQuery('#browser-div').children().remove();
            wikify('<<imageSelector>>', jQuery('#browser-div')[0]);
			jQuery('#upload-div').children().remove();
            wikify('<<binaryUpload edit:"tags" tags:"image">>', jQuery('#upload-div')[0]);

		},
        onLoad: function() {
            wikify('<<imageSelector>>', jQuery('#browser-div')[0]);
            wikify('<<binaryUpload edit:"tags" tags:"image">>', jQuery('#upload-div')[0]);
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
        },
	    {
            id: 'insertTab',
            label: 'URL',
            elements: [page3]
        }
        ],
        buttons: [
		{
			type:'button',
			id:'insertButton',
			label:'Insert',
			title:'Insert the current image.',
			onClick: function() {
				var dialog = this.getDialog(); 
				if(jQuery("#urlInsert")[0].value!='')
					dialog.getParentEditor().insertHtml("<img  src='"+jQuery("#urlInsert")[0].value+"'/>");
				if(jQuery('.binaryUploadFile > input').get(0).value != ""){
					console.log('do upload');
					jQuery('#upload-div').children('form').submit();	
					jQuery(".binaryUploadFile").html('uploading...');					
				}else {
					var html = config.macros.imageSelector.builtSelectedImgHtml();
					if(html!="")
						dialog.getParentEditor().insertHtml(html);
					jQuery('.selectedImage').removeClass('selectedImage');
					dialog.hide();
				}
			}
		}, CKEDITOR.dialog.cancelButton
	    ]
    };
});

config.macros.binaryUpload.displayFile = function(place, fileName, file) {
	console.log('dislay file', place, fileName, file);
	config.macros.binaryUpload.createMockTiddler(place, fileName, file);
	dialog = CKEDITOR.dialog.getCurrent();
	dialog.getParentEditor().insertHtml("<img  src='"+config.defaultCustomFields['server.host']+"/bags/"+file.bag+"/tiddlers/"+file.title);
	dialog.hide();
}
