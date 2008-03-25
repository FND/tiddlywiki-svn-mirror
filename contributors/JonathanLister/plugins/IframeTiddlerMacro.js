/***

|''Name:''|IframeTiddlerMacro |
|''Description:'' |adds an iframe in place and sets the content to the HTML content of a tiddler - TO BE MERGED WITH THE CROSS-BROWSER COMPATIBLE HTMLTemplatePreview |
|Author: |JonLister |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/IframeTiddlerMacro.js |
|Dependencies: |Iframe |
|''Version:''|0.2|
|''Date:''|25/3/08|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Usage:
<<IframeTiddler tiddler:tiddlerName [width:iframeWidth] [height:iframeHeight]>>

where "tiddlerName" is a string and "iframeWidth" and "iframeHeight" are both valid CSS size strings. iframeWidth defaults to "100%"; iframeHeight defaults to the height of the content

!Developments: the content could be set by setting the iframe's "href" property to a remote URL, although this neccessitates allowing the browser to retrieve the page and load the DOM. See this discussion for a suggested approach: http://groups.google.com/group/TiddlyWikiDev/browse_thread/thread/597728cad3d46d76/e5bc32e236c914c7?lnk=gst&q=iframe#e5bc32e236c914c7

|''Name:'' |Iframe |
|''Description:'' |adds an iframe to the page body and sets its doc property to allow appendChild operations |
|''Author:'' |JonLister |
|''Version:''|0.2|
|''Date:''|25/3/08|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Usage:
new Iframe([parentElem]);

where "parentElem" is an optional DOM element to add the iframe as a child to; parentElem defaults to document.body

NB: appending the iframe to document.body leaves the iframe without a provided way to close it

|''Name:''|HTMLTemplatePreview |
|''Description:'' |adds an iframe in place and renders a template into the iframe |
|Author: |JonLister |
|Dependencies: |Iframe |
|''Version:''|0.2|
|''Date:''|25/3/08|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Usage:
<<HTMLTemplatePreview templateName>>

where "templateName" is the name of a tiddler containing the template to be rendered

***/

function Iframe(parentElem,name) {

	var f = document.createElement("iframe");
	f.style.border = "0px";
	f.style.width = "0px";
	f.style.height = "0px";
	// have to append the iframe before the content document gets loaded
	if(parentElem)
		parentElem.appendChild(f);
	else
		document.body.appendChild(f);
	Iframe.addDoc(f);
	// opening and closing the document allows appendChild operations
	f.doc.open();
	f.doc.close();
	if(name)
		f.name = name;
	return f;
}

Iframe.addDoc = function(f) {
	if (f.contentDocument)
		f.doc = f.contentDocument; // For NS6
	else if (f.contentWindow)
		f.doc = f.contentWindow.document; // For IE5.5 and IE6
};

config.macros.IframeTiddler = {
	containerId: "TiddlyIframe",
	idPrefix: "iframe",
	tiddlerError: "error in iframeTiddler macro: please supply a tiddler argument"
};

/*** TO BE MERGED WITH THE CROSS-BROWSER COMPATIBLE HTMLTemplatePreview ***/
config.macros.IframeTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	params = paramString.parseParams("anon",null,true,false,false);
	var t = getParam(params,"tiddler",null);
	if(t) {
		t = store.getTiddler(t);
		if(!t instanceof Tiddler) {
			displayMessage(this.tiddlerError);
			return false;
		}
	}
	var width = getParam(params,"width",null);
	width = width ? width : "100%";
	var height = getParam(params,"height",null);
	// open up the tiddler in a brand new Story
	var tempStory = createTiddlyElement(null,"div",this.containerId);
	var tempStoryElem = document.body.appendChild(tempStory);
	var st = new Story(this.containerId,this.idPrefix);
	var container = st.getContainer();
	var tiddlerElem = st.createTiddler(container,null,t.title);
	// grab the innerHTML
	var divs = tiddlerElem.getElementsByTagName("div");
	var html = "";
	for(var i=0; i<divs.length; i++) {
		if(hasClass(divs[i],"viewer"))
			html = divs[i].innerHTML;
	}
	// remove the new Story
	removeNode(tempStory);
	// get an iframe
	var ifr = new Iframe(place);
	ifr.doc.open();
	ifr.writeln(html);
	ifr.close();
	ifr.style.width = width;
	ifr.style.height = height ? height : ifr.doc.body.offsetHeight+"px";
	return ifr;
};

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
	var html = expandTemplate(template,null,null,tiddler);
	html = html.replace(/'/g,"\"");
	var ifr = new Iframe(place,"iFrameElem");

	var htmlHead = html.substring(0,html.indexOf("</head>"));
	var htmlBody = html.substring(html.indexOf("<body"),html.indexOf("</body>"));
	if(config.browser.isIE) {
		ifr.doc.open();
		// NOTE: Windows incorrectly renders the page if you don't include the DOCTYPE tag; e.g. in one case, the omission of this tag caused the content to be aligned left instead of center:
		// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		// NOTE: Windows won't let you modify the innerHTML property of the iFrame head
		// NOTE: Windows crashes if you write to the iframe more than once
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