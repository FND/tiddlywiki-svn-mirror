/***
|''Name:''|FCKeditorPlugin|
|''Description:''|Wysiwyg editor for TiddlyWiki using FCKeditor.|
|''Version:''|1.1.1|
|''Date:''|Dec 21,2007|
|''Source:''|adapted from : http://visualtw.ouvaton.org/VisualTW.html|
|''Author:''|Pascal Collin|
|''License:''|[[BSD open source license|License]]|
|''~CoreVersion:''|2.2.0|
|''Browser:''|Firefox 2.0; InternetExplorer 6.0, others|
!Code
***/
//{{{

config.macros.ckeditor = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		if (typeof CKEDITOR=="undefined"){
			displayMessage("CKEditor is not avalible");
			config.macros.edit.handler(place,macroName,params,wikifier,paramString,tiddler);
		} else {

			createTiddlyElement(place, 'textarea', 'textarea');
			CKEDITOR.replace('textarea');
		
		}
	},
        gather : function(e) {
            var name = e.getAttribute("fckName");
            var oEditor = window.FCKeditorAPI ? FCKeditorAPI.GetInstance(name) : null;
            if (oEditor) {
                        var html = oEditor.GetHTML();
			if (html!=null) 
                                    return "<html>"+html.replace(/<a href="#([^>]*)">([^<]*)<\/a>/gi,"[[$2|$1]]")+"</html>"; 
            }	
        },
	FCKvalues : {},
	FCKeditorUnavailable : "FCKeditor was unavailable. Check plugin configuration and reload."
}


window.FCKeditor_OnComplete= function( editorInstance ) {
        var name=editorInstance.Name;
	var value = config.macros.editHtml.FCKvalues[name];
	delete config.macros.editHtml.FCKvalues[name];
	oEditor = FCKeditorAPI.GetInstance(name);
	if (value) oEditor.SetHTML(value);
}

Story.prototype.previousGatherSaveEditHtml = Story.prototype.previousGatherSaveEditHtml ? Story.prototype.previousGatherSaveEditHtml : Story.prototype.gatherSaveFields; // to avoid looping if this line is called several times
Story.prototype.gatherSaveFields = function(e,fields){
	if(e && e.getAttribute) {
		var f = e.getAttribute("editHtml");
		if(f){
			var newVal = config.macros.editHtml.gather(e);
			if (newVal) fields[f] = newVal;
		}
		this.previousGatherSaveEditHtml(e, fields);
	}
};

//}}}
