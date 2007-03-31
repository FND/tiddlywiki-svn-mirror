function saveChanges(onlyIfDirty,tiddlers)
{
	if(onlyIfDirty && !store.isDirty())
		return;
	
    if (loggedIn != true) {
        alert("Please log in before saving this wiki");
        return false;
    }
    
    singleMessage("Saving...");
    
    // SEND INFO //
        var params = {
            time:               getTime(),
            "wrapperScriptName":wrapperScriptName,
            "sourcePath":       sourcePath,
            data:               (store.uploadError) ? store.allTiddlersAsHtml() : store.updatedTiddlersAsHtml(),
            savetype:           (store.uploadError) ? "full":"partial",
            "deletedTiddlers":  store.deletedTiddlersIndex.join("|||||"),
            rss:                generateRss(),
        }
        
        if ( params.data == "" && params.deletedTiddlers == "") {
            displayMessage("There was nothing to save");
            return;
        }

        //reset tiddlers that were marked for upload
        store.deletedTiddlersIndex = [];
        store.unFlagForUpload(store.updatedTiddlersIndex);
        
        //~ // Must use a post request //
        //~ openAjaxRequestParams(savepath + "&backup=" + config.options.chkSaveBackups, params, saveReturn, true);
        var saveRequest = new AjaxRequest(savepath, saveReturn, {backup:config.options.chkSaveBackups}, params);
        saveRequest.send();
        store.setDirty(false);

}

function generateRss(){};
function getTime(){};



function saveReturn(response) {
        
    if (response.error == true ) {
        store.uploadError = true;
        store.setDirty(true);
    }

    else if ( response.conflict ) {
        displayMessage("Error! A conflict was detected.  Your changes have been routed to the following file.  Please click the following link, refresh this wiki and copy your changes manually.<a href='" + data.path + "' target='_blank'>Rerouted Changes</a>");
        store.uploadError = false;
    }
    
    else if ( response.nothing ) {
        displayMessage("There was nothing to save");
        store.uploadError = false;
    }

    else {
        displayMessage(config.messages.mainSaved,sourcePath);
        store.uploadError = false;
    }

}


TiddlyWiki.prototype.deletedTiddlersIndex = [];
TiddlyWiki.prototype.updatedTiddlersIndex = [];
TiddlyWiki.prototype.uploadError = false;

TiddlyWiki.prototype.flagForUpload = function(title)
{
  store.suspendNotifications();
	this.setValue(title,"temp.flagForUpload",1,true);
	store.resumeNotifications();
}

TiddlyWiki.prototype.unFlagForUpload = function(tiddlers)
{
    store.suspendNotifications();
    for (var i=0; i<tiddlers.length;i++)
         this.setValue(tiddlers[i],"temp.flagForUpload","",true);
    store.resumeNotifications();
}

old_ffu_setTiddlerTag = TiddlyWiki.prototype.setTiddlerTag;
TiddlyWiki.prototype.setTiddlerTag = function(title,status,tag)
{
    old_ffu_setTiddlerTag.apply(this,arguments);
    this.flagForUpload(title);
}

TiddlyWiki.prototype.old_ffu_saveTiddler = TiddlyWiki.prototype.saveTiddler
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields)
{
    var temp = this.old_ffu_saveTiddler(title,newTitle,newBody,modifier,modified,tags,fields);
    this.flagForUpload(temp);
    return temp;
}

old_ffu_setValue = TiddlyWiki.prototype.setValue;
TiddlyWiki.prototype.setValue = function(tiddler, fieldName, value,flag) {
    old_ffu_setValue.apply(this,arguments);
    if (!flag)
        this.flagForUpload(tiddler);
}

old_ffu_removeTiddler = TiddlyWiki.prototype.removeTiddler;
TiddlyWiki.prototype.removeTiddler = function(title)
{
	old_ffu_removeTiddler.apply(this,arguments);
	this.deletedTiddlersIndex.pushUnique(title);
}

TiddlyWiki.prototype.updatedTiddlersAsHtml = function()
{
   return store.getSaver().externalizeUpdated(store);
}

SaverBase.prototype.externalizeUpdated = function(store)
{
	var results = [];
	var tiddlers = store.getTiddlersWithField("temp.flagForUpload",1);
	for (var t = 0; t < tiddlers.length; t++)
		{
    results.push(this.externalizeTiddler(store, tiddlers[t]));
	  store.updatedTiddlersIndex.push(tiddlers[t].title);
    }
  return results.join("\n");
}

TiddlyWiki.prototype.getTiddlersWithField = function (field,fieldValue,resultMatch)
{                
       if (resultMatch==undefined) var resultMatch = true;
       var results= [];
       this.forEachTiddler(function(title,tiddler){
                var f = !resultMatch;
                var fieldResult = store.getValue(tiddler,field);
                if (fieldResult!=undefined)
                  {if(fieldValue == undefined || fieldValue == fieldResult)
                          {f= resultMatch;}
                   if (f) results.push(tiddler);       }

                });
       results.sort(function(a,b) {return a["title"] < b["title"] ? -1 : (a["title"] == b["title"] ? 0 : +1);});
       return results;
}

