/***
|''Name:''|HTMLTemplatePreviewMacro |
|''Description:'' |Adds an IFrame in place and renders a template into the IFrame |
|''Author:'' |JonLister |
|''Dependencies:'' |IFramePlugin, TemplatePlugin |
|''Version:''|0.2 |
|''Date:''|25/3/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3 |

!Usage:
{{{
<<HTMLTemplatePreview templateName tab>>
}}}

where "templateName" is the name of a tiddler containing the template to be rendered
if "tab" is set, the preview will be in a new browser tab; if not, the preview will be in an iframe in the tiddler

***/

config.macros.HTMLTemplatePreview = {
	label: "Click to open preview in a new window",
	syntaxError: "error in HTMLTemplatePreview macro: usage: <<HTMLTemplatePreview template [true]>>"
};

config.macros.HTMLTemplatePreview.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(params[0]) {
		var template = params[0];
	} else {
		displayMessage(this.syntaxError);
		return false;
	}
	var tab = params[1]=="tab" ? true : false;
	var html = expandTemplate(template);
	html = IFrame.localizeLinks(html);
	if(tab) {
		createTiddlyButton(place, this.label, null, function() {config.macros.HTMLTemplatePreview.tabPreview(html);});
	} else {
		var ifr = new IFrame(place,"IFrameElem");
		ifr.modify(html);
	}
};

config.macros.HTMLTemplatePreview.tabPreview = function(html) {
		var w = window.open();
		w.document.write(html);
		w.document.close();
};