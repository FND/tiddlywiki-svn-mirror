

function createWiki(form) {
    
    if ( isAdmin == false ) {
        alert("You must be an administrator to access this function ");
        return;
    }
    
    var wrapperpath = form.wrapperpath.value;
    var sourcepath = form.sourcepath.value;
    var template = form.template.value;
    
    if ( wrapperpath.indexOf(".php") < 0 ) 
        alert("The wrapper must be a new php file");
    else if ( sourcepath.indexOf(".htm") < 0 )
        alert("The source must be a new html file");
    else {
        
        singleMessage("Creating Wiki ... ");
        
        var ret = function (response) {
            if ( !response.error )
                displayMessage("Wiki Created Successfully: " + wrapperpath,wrapperpath);
        }
        
        var params = {
            newWrapper: wrapperpath,
            newSource: sourcepath,
            template: template
        }
        
        ajaxModuleEvent("CreateWikiEvent",ret,params);
    }
}