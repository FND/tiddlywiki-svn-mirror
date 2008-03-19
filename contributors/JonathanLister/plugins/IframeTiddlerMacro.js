/***
!Iframe class

|Summary: |adds an iframe to the page body and sets its doc property to allow appendChild operations |
|Author: |JonLister |

!Usage:
new Iframe([parentElem]);

where "parentElem" is an optional DOM element to add the iframe as a child to; parentElem defaults to document.body

NB: appending the iframe to document.body leaves the iframe without a provided way to close it

***/
function Iframe(parentElem) {

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
	return f;
};

Iframe.addDoc = function(f) {
	if (f.contentDocument)
		f.doc = f.contentDocument; // For NS6
	else if (f.contentWindow)
		f.doc = f.contentWindow.document; // For IE5.5 and IE6
};

/***
!IframeTiddler macro

|Summary: |adds an iframe to the page and sets the content to the HTML content of a tiddler |
|Author: |JonLister |
|Dependencies: |Iframe class |

!Usage:
<<IframeTiddler tiddler:tiddlerName [width:iframeWidth] [height:iframeHeight]>>

where "tiddlerName" is a string and "iframeWidth" and "iframeHeight" are both valid CSS size strings. iframeWidth defaults to "100%"; iframeHeight defaults to the height of the content

!Developments: the content could be set by setting the iframe's "href" property to a remote URL, although this neccessitates allowing the browser to retrieve the page and load the DOM. See this discussion for a suggested approach: http://groups.google.com/group/TiddlyWikiDev/browse_thread/thread/597728cad3d46d76/e5bc32e236c914c7?lnk=gst&q=iframe#e5bc32e236c914c7

!

***/

config.macros.IframeTiddler = {
	containerId: "TiddlyIframe",
	idPrefix: "iframe",
	tiddlerError: "error in iframeTiddler macro: please supply a tiddler argument",
};

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
	ifr.doc.body.innerHTML = html;
	ifr.style.width = width;
	ifr.style.height = height ? height : ifr.doc.body.offsetHeight+"px";
	return ifr;
};