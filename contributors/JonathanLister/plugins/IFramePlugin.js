/***
!IFrame library

|''Name:'' |IFrame |
|''Summary:'' |Provides cross-browser methods for working with iframes |
|''Author:'' |JonLister |

!Usage:
var ifr = new IFrame(parentElem);

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
* IE doesn't run external scripts, which causes errors if scripts in the page refer to externally defined objects
** TO-DO: sort this out, maybe by removing any external script calls. Worth looking into
* Firefox runs all scripts, so any calls in those scripts to document.write cancel this one

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
	// htmlHead includes any <!DOCTYPE> tag so that IE can utilize it - it is removed if the browser is not IE
	var htmlHead = html.substring(0,html.indexOf("</head>"));
	var htmlBody = html.substring(html.indexOf("<body"),html.indexOf("</body>"));
	if(!htmlHead)
		htmlHead = "<head>";
	if(!htmlBody)
		htmlBody = "<body>"+html;
	if(config.browser.isIE) {
		this.doc.open();
		htmlHead += "</head>";
		htmlBody += "</body>";
		this.doc.write(htmlHead+htmlBody+"</html>");
		this.doc.close();
	} else {
		htmlHead = htmlHead.substring(htmlHead.indexOf("<head"));
		htmlHead = htmlHead.replace(/<head[^>]*?>/,"");
                // BUG: any attributes on the head element e.g. xmlns get lost
		this.doc.documentElement.getElementsByTagName("head")[0].innerHTML = htmlHead;
		htmlBody = htmlBody.replace(/<body[^>]*?>/,"");
                // BUG: any attributes on the body element e.g. onload get lost
		this.doc.documentElement.getElementsByTagName("body")[0].innerHTML = htmlBody;
	}
	this.style.width = "100%";
	this.style.height = ifr.doc.body.offsetHeight+"px";
};

//}}}