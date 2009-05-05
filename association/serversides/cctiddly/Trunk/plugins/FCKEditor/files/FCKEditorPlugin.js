/***
|''Name:''|FCKeditorPlugin|
|''Description:''|Wysiwyg editor for TiddlyWiki using FCKeditor.|
|''Version:''|1.1.1|
|''Date:''|Dec 21,2007|
|''Source:''|http://visualtw.ouvaton.org/VisualTW.html|
|''Author:''|Pascal Collin|
|''License:''|[[BSD open source license|License]]|
|''~CoreVersion:''|2.2.0|
|''Browser:''|Firefox 2.0; InternetExplorer 6.0, others|
!Demo:
On the plugin [[homepage|http://visualtw.ouvaton.org/VisualTW.html]], see and edit [[WysiwygDemo]].
!Installation:
#download and unzip [[FCKeditor|http://www.fckeditor.net/download]] (by default, in a wiki subfolder, such that the relative path "fckeditor/fckeditor.js" is right).
#import [[FCKeditorPlugin]] (systemConfig tagged)
#add the following text to MarkupPreHead : {{{<script type="text/javascript" src="fckeditor/fckeditor.js"></script>}}}
#customize FCKeditorPath if needed (in MarkupPreHead and in options below)
#save and reload
#use the <<toolbar editHtml>> button in the tiddler's toolbar (in default ViewTemplate) or add {{{editHtml}}} command in your own toolbar.
! Useful Addons
*[[HTMLFormattingPlugin|http://www.tiddlytools.com/#HTMLFormattingPlugin]] to embed wiki syntax in html tiddlers.<<br>>//__Tips__ : When this plugin is installed, you can use anchor syntax to link tiddlers in wysiwyg mode (example : #example). Anchors are converted back and from wiki syntax when editing.//
*[[TaggedTemplateTweak|http://www.TiddlyTools.com/#TaggedTemplateTweak]] to use alternative ViewTemplate/EditTemplate for tiddler's tagged with specific tag values.
!Configuration options :
|FCKeditor folder (absolute or relative)|<<option txtFCKeditorPath>> |
|FCKeditor custom configuration script path (relative or absolute)<<br>>[[Example|fckeditor/editor/custom_config.js]] : {{{ fckeditor/editor/custom_config.js}}}|<<option txtFCKCustomConfigScript>>|
|Toolbar name ("Default", "Basic" or custom)<<br>>See [[FCKeditor documentation|http://wiki.fckeditor.net/Developer%27s_Guide/Configuration/Toolbar]] for more information on custom toolbars|<<option txtFCKToolbar>>|
|FCKeditor default height (if blank = 500px)|<<option txtFCKheight>>|
|Template called by the {{{wysiwyg}}} button|EditHtmlTemplate|
!Code
***/
//{{{
config.options.txtFCKeditorPath = config.options.txtFCKeditorPath ? config.options.txtFCKeditorPath : "fckeditor/";
config.options.txtFCKCustomConfigScript = config.options.txtFCKCustomConfigScript ? config.options.txtFCKCustomConfigScript : "";
config.options.txtFCKToolbar = config.options.txtFCKToolbar ? config.options.txtFCKToolbar : "";
config.options.txtFCKheight = config.options.txtFCKheight ? config.options.txtFCKheight : "500px";

config.macros.editHtml = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		var field = params[0];
		var height = params[1] ? params[1] : config.options.txtFCKheight;
		if (typeof FCKeditor=="undefined"){
			displayMessage(config.macros.editHtml.FCKeditorUnavailable);
			config.macros.edit.handler(place,macroName,params,wikifier,paramString,tiddler);

		}
		else if (field) {
			var e = createTiddlyElement(null,"div");
			var fckName = "FCKeditor"+ Math.random();
			if(tiddler.isReadOnly())
				e.setAttribute("readOnly","readOnly");
			e.setAttribute("editHtml",field);
			if (height) e.setAttribute("height",height);
			e.setAttribute("fckName",fckName);
			place.appendChild(e);
			var fck = new FCKeditor(fckName);
			fck.BasePath = config.options.txtFCKeditorPath;
			if (config.options.txtFCKCustomConfigScript) fck.Config["CustomConfigurationsPath"] = config.options.txtFCKCustomConfigScript ;
			if (config.options.txtFCKToolbar) fck.ToolbarSet = config.options.txtFCKToolbar;
			fck.Height=height;
			var re = /^<html>(.*)<\/html>$/m;
			var fieldValue=store.getValue(tiddler,field);
			var htmlValue = re.exec(fieldValue);
			var value = (htmlValue && (htmlValue.length>0)) ? htmlValue[1] : fieldValue;
			value=value.replace(/\[\[([^|\]]*)\|([^\]]*)]]/g,'<a href="#$2">$1</a>');
			config.macros.editHtml.FCKvalues[fckName]=value;
			e.innerHTML = fck.CreateHtml();
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

config.shadowTiddlers.EditHtmlTemplate = config.shadowTiddlers.EditTemplate.replace(/macro='edit text'/,"macro='editHtml text'");

config.commands.editHtml={
	text: "wysiwyg",
	tooltip: "Edit this tiddler with a rich text editor",
	readOnlyText: "",
	handler : function(event,src,title) {
		clearMessage();
		var tiddlerElem = document.getElementById(story.idPrefix + title);
		var fields = tiddlerElem.getAttribute("tiddlyFields");
		story.displayTiddler(null,title,"EditHtmlTemplate",false,null,fields);
		return false;
	}
}

config.shadowTiddlers.ViewTemplate = config.shadowTiddlers.ViewTemplate.replace(/\+editTiddler/,"+editTiddler editHtml");

//}}}