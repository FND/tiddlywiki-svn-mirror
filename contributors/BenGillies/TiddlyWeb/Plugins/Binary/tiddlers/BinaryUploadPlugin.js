/***
|Name|BinaryUploadPlugin||
|Version|0.1|
|Author|Ben Gillies|
|Type|plugin|
|Description|Upload a binary file to TiddlyWeb|
!Usage
To use:

&lt;&lt;binaryUpload bag:bag_name edit:tags edit:title tags:default_tags&gt;&gt;

bag:bag_name is optional - The file will be saved to the current workspace if bag_name is left out
edit:tags - specifies that you want to tag the file being uploaded
edit:title - specifies that you want to set the title to something other than the filename
tags:default_tags - specifies a default set of tags to apply to the file. Note - require edit:tags to be set

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
        params = paramString.parseParams();
        var uploadTo = params[0]['bag']? 'bags/' + params[0]['bag'] : config.defaultCustomFields['server.workspace'];
        var includeFields = {
            tags: params[0]['edit'] && params[0]['edit'].contains('tags') ? true : false,
            title: params[0]['edit'] && params[0]['edit'].contains('title') ? true : false,
            defaultTags: params[0]['tags'] ? params[0]['tags'] : ''
        };
        var baseURL = config.defaultCustomFields['server.host'];
        baseURL += (baseURL[baseURL.length - 1] !== '/') ? '/' : '';
        this.fullURL = baseURL + uploadTo + '/tiddlers';
        
        //create the upload form, complete with invisible iframe
        var iframeName = 'binaryUploadiframe' + Math.random().toString();
        jQuery('<form action="' + this.fullURL + '" method="POST" enctype="multipart/form-data" target="' + iframeName + '" />')
            .append(includeFields['title'] ? '<div class="binaryUploadTitle"><input type="text" name="title" value="Enter Title" /></div>' : '')
            .append('<div class="binaryUploadFile"><input type="file" name="file" /></div>')
            .append(includeFields['tags'] ? '<div class="binaryUploadTags">tags: <input type="text" name="tags" value="' + includeFields['defaultTags'] + '" /></div>' : '')
            .append('<div class="binaryUploadSubmit"><input type="submit" value="Upload" /></div>')
            .append(jQuery('<iframe name="' + iframeName + '" id="' + iframeName + '"/>').css('display','none'))
            .submit(function() {
                var fileName = includeFields['title'] ? jQuery('[name=title]input:text', this).val() : jQuery('input:file', this).val();
                if ((!fileName)||(fileName === 'Enter Title')) {
                    fileName = jQuery('input:file', this).val();
                    jQuery('[name=title]input:text', this).val(fileName);
                }
                this.action += '?redirect=/bags/common/tiddlers.txt?select=title:'+fileName; //we need to go somewhere afterwards to ensure the onload event triggers
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
        
        tiddler.tags = file.tags;
        
        if (store.getTiddler(fileName)) {
            tiddler.modifier = config.options.txtUserName;
            tiddler.fields['server.page.revision'] = parseInt(tiddler.fields['server.page.revision']) + 1;
            tiddler.fields['server.permissions'] = 'read, delete';
        } else {
            tiddler.creator = config.options.txtUserName;
            tiddler.modifier = config.options.txtUserName;
            tiddler.fields = merge({}, config.defaultCustomFields);
            tiddler.fields.doNotSave = true;
            tiddler.fields['server.content-type'] = mimeType;
            tiddler.fields['server.page.revision'] = 1;
            tiddler.fields['server.bag'] = file.bag;
            tiddler.fields['server.workspace'] = 'bags/' + file.bag;
            if (file.recipe) tiddler.fields['server.recipe'] = file.recipe;
            tiddler.fields['server.title'] = file.title;
            tiddler.fields['server.permissions'] = 'read, delete';
            var dirty = store.isDirty();
            store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier, null, tiddler.tags, tiddler.fields, true, null, tiddler.creator);
            story.setDirty(tiddler.title, false);
            if (!dirty) store.setDirty(false);
        }
        saveChanges();
        story.displayTiddler(place, fileName);
    }
}
//}}}
