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
<<HTMLTemplatePreview templateName>>
}}}

where "templateName" is the name of a tiddler containing the template to be rendered

***/

config.macros.HTMLTemplatePreview = {
	syntaxError: "error in HTMLTemplatePreview macro: usage: <<HTMLTemplatePreview template>>"
};

config.macros.HTMLTemplatePreview.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(params[0])
		var template = params[0];
	else {
		displayMessage(this.syntaxError);
		return false;
	}
	var html = expandTemplate(template);
	html = IFrame.localizeLinks(html);
	var ifr = new IFrame(place,"IFrameElem");
	ifr.modify(html);
};