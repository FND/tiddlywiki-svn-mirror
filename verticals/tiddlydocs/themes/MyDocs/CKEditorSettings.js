CKEDITOR.config.baseHref = '/doccollab/static/ckeditor/';
// making this point to a config file which contains the below may speed up CKEditors performance. 
CKEDITOR.config.customConfig = 'null';


    CKEDITOR.editorConfig = function( config )
    {
    	// Define changes to default configuration here. For example:
    	// config.language = 'fr';
    	 config.uiColor = '#AADC6E';
         config.toolbar = 
         [
             [ 'Source', '-', 'Bold', 'Italic', 'tw_uploader' ]
         ];
         config.extraPlugins='tw_uploader';
    };

