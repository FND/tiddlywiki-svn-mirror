/***
|''Name:''|HTMLTemplatePreviewMacro |
|''Description:'' |adds an IFrame in place and renders a template into the IFrame |
|Author: |JonLister |
|Dependencies: |IFrame |
|''Version:''|0.2|
|''Date:''|25/3/08|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Usage:
<<HTMLTemplatePreview templateName>>

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
	}
	var html = expandTemplate(template);
	html = html.replace(/'/g,"\"");
	var ifr = new IFrame(place,"IFrameElem");

	var htmlHead = html.substring(0,html.indexOf("</head>"));
	var htmlBody = html.substring(html.indexOf("<body"),html.indexOf("</body>"));
	if(config.browser.isIE) {
		ifr.doc.open();
		// NOTE: Windows incorrectly renders the page if you don't include the DOCTYPE tag; e.g. in one case, the omission of this tag caused the content to be aligned left instead of center:
		// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		// NOTE: Windows won't let you modify the innerHTML property of the IFrame head
		// NOTE: Windows crashes if you write to the IFrame more than once
		// NOTE: Windows doesn't run external scripts, which causes errors if scripts in the page refer to externally defined objects
		// TO-DO: sort this out, maybe by removing any external script calls. Worth looking into
		// NOTE: Firefox runs all scripts, so any calls in those scripts to document.write cancel this one
		htmlHead += "</head>";
		htmlBody += "</body>";
		ifr.doc.write(htmlHead+htmlBody+"</html>");
		ifr.doc.close();
	} else {
		htmlHead = html.substring(html.indexOf("<head"));
		htmlHead = htmlHead.replace(/<head[^>]*?>/,"");
		ifr.doc.documentElement.getElementsByTagName("head")[0].innerHTML = htmlHead;
		htmlBody = htmlBody.replace(/<body[^>]*?>/,"");
		ifr.doc.documentElement.getElementsByTagName("body")[0].innerHTML = htmlBody;
	}
	ifr.style.width = "100%";
	ifr.style.height = "800px";
	//ifr.doc.body.offsetHeight+"px";
};