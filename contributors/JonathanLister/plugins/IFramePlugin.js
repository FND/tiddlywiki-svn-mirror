/***
|''Name:''|IFramePlugin |
|''Description:'' |Provides cross-browser methods for working with iframes | |
|''Author:'' |JonLister |
|''Status:'' |Experimental |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/IFramePlugin.js |
|''Version:''|1 |
|''Date:''|10/4/08 |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3 |

!Usage:
{{{
var ifr = new IFrame(parentElem,name);
}}}

where "parentElem" is an optional DOM element to add the iframe as a child to; parentElem defaults to document.body.

This adds an iframe to the page body and sets a doc property to allow DOM operations such as:
ifr.doc.documentElement.innerHTML = "...";
ifr.doc.documentElement.getElementsByTagName("body")[0].appendChild(textNode);

NB: appending the iframe to document.body leaves the iframe without a provided way to close it

!IFrame Properties
* f - the iframe element in the DOM
* style - the style element of the iframe
* doc - the document object of the iframe

!IFrame Methods
!!modify
Usage:
 ifr.modify(html);

modify sets the content of the IFrame object's document to the html parameter provided. It expects both HEAD and BODY elements. If either of these are absent, the cotent is assumed to be BODY content. The width of the IFrame is then set to 100% and the height is set to the height of the content.

!Why this library is helpful
IFrames are handled differently by different browsers. Problems that this library helps you avoid include:
* IE incorrectly renders the page if you don't include the DOCTYPE tag; e.g. in one case, the omission of this tag caused a particular document to be aligned left instead of center:
** <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
* IE won't let you modify the innerHTML property of the iFrame head
* IE crashes if you write to the iframe more than once
* Not sure about these, they are speculative:
** IE doesn't run external scripts, which causes errors if scripts in the page refer to externally defined objects
*** TO-DO: sort this out, maybe by removing any external script calls. Worth looking into
** Firefox runs all scripts, so any calls in those scripts to document.write occur after this page has been created, which ends up writing over this one
** Firefox doesn't write to the head reliably

***/

//{{{

function IFrame(parentElem,name) {

	var addDoc = function() {
		if (f.contentDocument)
			doc = f.contentDocument; // For NS6
		else if (f.contentWindow)
			doc = f.contentWindow.document; // For IE5.5 and IE6
		return doc;
	};
	var f = document.createElement("iframe");
	this.f = f;
	this.style = f.style;
	this.style.border = "0px";
	this.style.width = "0px";
	this.style.height = "0px";
	if(name)
		f.name = name;
	// have to append the iframe before the content document gets loaded
	if(!parentElem)
		document.body.appendChild(f);
	else if(parentElem.nodeType && parentElem.nodeType == 1)
		parentElem.appendChild(f);
	else
		// don't append f to anything and don't set the doc element up
		return this;
	this.doc = addDoc();
	// opening and closing the document allows appendChild operations
	this.doc.open();
	this.doc.close();
}

IFrame.prototype.modify = function(html)
{
	// check for the existence of the doc element
	if(!this.doc)
		return false;
	// htmlHead includes any <!DOCTYPE> tag
	var docType = html.substring(0,html.indexOf("<html"));
	var htmlHead = html.substring(html.indexOf("<head"),html.indexOf("</head>")+7);
	var htmlBody = html.substring(html.indexOf("<body"),html.indexOf("</body>")+7);
	// if no head or body tags provided, assume this is all body code
	if(!htmlHead)
		htmlHead = "<head></head>";
	if(!htmlBody)
		htmlBody = "<body>"+html+"</body>";
	this.doc.open();
	//console.log("docType: ",docType);
	//console.log("htmlHead: ",htmlHead);
	//console.log("<body></body></html>");
	//this.doc.write(docType+htmlHead+"<body>hello</body></html>");
	this.doc.write(docType+"<html>"+htmlHead+htmlBody+"</html>");
	this.doc.close();
	console.log(docType+"<html>"+htmlHead+htmlBody+"</html>");
	// take the <body ...> tag off the front of htmlBody
	//htmlBody = htmlBody.replace(/<body[^>]*?>/,"");
	// BUG: any attributes on the body element e.g. onload get lost
	//console.log(this.doc.documentElement.innerHTML);
	//this.doc.documentElement.childNodes[1].innerHTML = htmlBody;

	this.style.width = "100%";
	// BUG: this height setting sometimes causes perculiar very tall iframes; no idea why yet
	//this.style.height = this.doc.body.offsetHeight+"px";
	this.style.height = "600px"; // stop-gap till auto-height is fixed
};

IFrame.localizeLinks = function(html,baseURI) {
	if(!baseURI)
		baseURI = document.location.toString();
	// ensure baseURI always has a trailing slash
	var baseURISeparator;
	var p;
	if((p = baseURI.lastIndexOf("/"))!=-1) // Unix local path
		baseURISeparator = "/";
	else if((p = baseURI.lastIndexOf("\\"))!=-1) // Windows local path
		baseURISeparator = "\\";

	baseURI = baseURI.substr(0,p) + baseURISeparator;
	// have a go at fixing relative links
	var linkRegex = new RegExp("(href|src|action)(=['\"])(?!http:\/\/)(\/)*","img");
	html = html.replace(linkRegex,function(match,m1,m2) {
	  return m1+m2+baseURI;
	});
	var importRegex = new RegExp("(@import ['\"])(\/)*","img");
	// supplement this with support for @import "/blah"
	html = html.replace(importRegex,function(match,m1) {
	  return m1+baseURI;
	});
	var baseRegex = new RegExp("<head[^>]*?>","img");
	// add a BASE tag to the HEAD to help with relative linking - perhaps not necessary...
	html = html.replace(baseRegex,function(match) {
	  return match+"<"+"base href=\""+baseURI+"\" />";
	});
	return html;
}
//}}}