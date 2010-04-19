/***
|Name|BinaryUploadPlugin||
|Version|0.1|
|Author|Ben Gillies|
|Type|plugin|
|Description|Upload a binary file to TiddlyWeb|
!Usage
To use:

&lt;&lt;binaryUpload bag_name&gt;&gt;

bag_name is optional - The file will be saved to the current workspace if bag_name is left out

!Requires 
TiddlyWeb
tiddlywebplugins.form

!Code
***/
//{{{
if(!version.extensions.BinaryUploadPlugin)
{ //# ensure that the plugin is only installed once
    version.extensions.BinaryUploadPlugin = { installed: true }
};

config.macros.binaryUpload ={
    fullURL: '',
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        var uploadTo = params.length ? 'bags/' + params[0] : config.defaultCustomFields['server.workspace'];
        var baseURL = config.defaultCustomFields['server.host'];
        baseURL += (baseURL[baseURL.length - 1] !== '/') ? '/' : '';
        this.fullURL = baseURL + uploadTo + '/tiddlers';
        
        //create the upload form, complete with invisible iframe
        var iframeName = 'binaryUploadiframe' + Math.random().toString();
        jQuery('<form action="' + this.fullURL + '" method="POST" enctype="multipart/form-data" target="' + iframeName + '" />')
            .append(jQuery('<input type="file" name="file" />'))
            .append(jQuery('<input type="submit" value="Upload" />'))
            .append(jQuery('<iframe name="' + iframeName + '" id="' + iframeName + '"/>').css('display','none'))
            .submit(function() {
                var fileName = jQuery('input:file', this).val();
                this.action += '?redirect=/bags/common/tiddlers/'+fileName + '.txt'; //check it exists
                config.macros.binaryUpload.iFrameLoader(iframeName, fileName, place);
                return true;
            }).appendTo(place);
        
    },
    iFrameLoader: function(iframeName, fileName, place) {
        var iframe = document.getElementById(iframeName); //jQuery doesn't seem to want to do this!?
        
        var finishedLoading = function() {
            displayMessage('File "' + fileName + '" successfully uploaded');
            jQuery.getJSON(config.macros.binaryUpload.fullURL + '/' + fileName + '.json', function(file) {
                config.macros.binaryUpload.displayFile(place, fileName, file);
            });
        }
        var iFrameLoadHandler = function() {
            finishedLoading.apply();
            return;
        }
        
        iframe.onload = iFrameLoadHandler;
        //IE
        completeReadyStateChanges = 0;
        iframe.onreadystatechange = function() {
            if (++(completeReadyStateChanges) == 3) {
                iFrameLoadHandler();
            }
        }
    },
    displayFile: function(place, fileName, file) {
        var tiddler = store.getTiddler(fileName);
        if (!tiddler) {
            tiddler = new Tiddler(fileName);
        }
        
        var mimeType = file.type;
        
        if (/^image\//.test(mimeType)) {
            tiddler.text = '[img[' + config.macros.binaryUpload.fullURL + '/' + fileName + ']]';
        } else {
            tiddler.text = '[[' + fileName + '|' + config.macros.binaryUpload.fullURL + '/' + fileName + ']]';
        }
        
        if (store.getTiddler(fileName)) {
            tiddler.modifier = config.options.txtUserName;
            tiddler.fields['server.page.revision'] = parseInt(tiddler.fields['server.page.revision']) + 1;
            tiddler.fields['server.permissions'] = 'read, delete';
        } else {
            tiddler.creator = config.options.txtUserName;
            tiddler.modifier = config.options.txtUserName;
            tiddler.fields = merge({}, config.defaultCustomFields);
            tiddler.fields.doNotSave = true;
            tiddler.fields['server.page.revision'] = 1;
            tiddler.fields['server.bag'] = file.bag;
            tiddler.fields['server.workspace'] = 'bags/' + file.bag;
            if (file.recipe) tiddler.fields['server.recipe'] = file.recipe;
            tiddler.fields['server.title'] = file.title;
            tiddler.fields['server.permissions'] = 'read, delete';
            store.addTiddler(tiddler);
            store.saveTiddler(tiddler.title);
        }
        saveChanges();
        story.displayTiddler(place, fileName);
    }
}
//}}}
