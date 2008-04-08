/***
!IFrame library

|''Summary:'' |Provides cross-browser methods for working with iframes |
|''Author:'' |JonLister |

!Usage:
var ifr = new IFrame(parentElem);

where "parentElem" is an optional DOM element to add the iframe as a child to; parentElem defaults to document.body.

This adds an iframe to the page body and sets a doc property to allow DOM operations such as:
ifr.doc.documentElement.innerHTML = "...";
ifr.doc.documentElement.getElementsByTagName("body")[0].appendChild(textNode);

NB: appending the iframe to document.body leaves the iframe without a provided way to close it

***/

//{{{

function IFrame(parentElem,name) {

	addDoc = function(f) {
		if (f.contentDocument)
			f.doc = f.contentDocument; // For NS6
		else if (f.contentWindow)
			f.doc = f.contentWindow.document; // For IE5.5 and IE6
		return f.doc;
	};
	var f = document.createElement("iframe");
	this.f = f;
	this.style = f.style;
	f.style.border = "0px";
	f.style.width = "0px";
	f.style.height = "0px";
	// have to append the iframe before the content document gets loaded
	if(parentElem)
		parentElem.appendChild(f);
	else
		document.body.appendChild(f);
	this.doc = addDoc(f);
	// opening and closing the document allows appendChild operations
	this.doc.open();
	this.doc.close();
	if(name)
		f.name = name;
}

IFrame.prototype.modify = function(html)
{
	var htmlHead = html.substring(0,html.indexOf("</head>"));
	var htmlBody = html.substring(html.indexOf("<body"),html.indexOf("</body>"));
	if(config.browser.isIE) {
		this.doc.open();
		// NOTE: Windows incorrectly renders the page if you don't include the DOCTYPE tag; e.g. in one case, the omission of this tag caused the content to be aligned left instead of center:
		// <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		// NOTE: Windows won't let you modify the innerHTML property of the iFrame head
		// NOTE: Windows crashes if you write to the iframe more than once
		// NOTE: Windows doesn't run external scripts, which causes errors if scripts in the page refer to externally defined objects
		// TO-DO: sort this out, maybe by removing any external script calls. Worth looking into
		// NOTE: Firefox runs all scripts, so any calls in those scripts to document.write cancel this one
		htmlHead += "</head>";
		htmlBody += "</body>";
		this.doc.write(htmlHead+htmlBody+"</html>");
		this.doc.close();
	} else {
		htmlHead = htmlHead.substring(htmlHead.indexOf("<head"));
		htmlHead = htmlHead.replace(/<head[^>]*?>/,"");
                // whilst the base tag only affects relative links, it's worth setting?
                // BUG: any attributes on the head element e.g. xmlns get lost
		this.doc.documentElement.getElementsByTagName("head")[0].innerHTML = htmlHead;
		htmlBody = htmlBody.replace(/<body[^>]*?>/,"");
                // BUG: any attributes on the body element e.g. onload get lost
		this.doc.documentElement.getElementsByTagName("body")[0].innerHTML = htmlBody;
	}
	this.style.width = "100%";
	this.style.height = "800px";
	//ifr.doc.body.offsetHeight+"px";
};

//}}}