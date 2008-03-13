/***
!TiddleShop plugins

Summary: template-based creation of blogs for dummies

User journey:
1. click on blog icon
2. new page: choose template
2a. onclick: save a new tiddlywiki with all the necessary tiddlers in the template (it's a pack)
3. test post (?)
4. on template click: preview result of implementing template with template selector menu bar on top

Dependencies: SinglePagePlugin(?), ListRelatedPlugin

Tiddler Structure to support user journey:
1. TopPage - to present the icons for clicking on to select blog journey
2. BlogTemplateChooser - to present all available templates and any necessary "chrome"
2a. SamplePost(1|2|3|...) - sample posts for preview
3. PreviewPage - to show preview of applying template and menu bar at the top

Functional journey:


***/

merge(config.relationships,{
	none: {
		text: "a null relationship to hack the plugin to allow listing of any tiddlers",
		prompt: "Tiddlers that are ",
		getRelatedTiddlers: function(store,title) {
			var tiddlers = [];
			return tiddlers;
		}
	}
});

/***
!iframe macro

|Summary: |adds an iframe to the page and sets the content to an HTML string |
|Author: |JonLister (based on code from Eric Shulman's ImportTiddlersPlugin which features in the TW core) |

!Usage:
<<iframe HTML>>

where "HTML" is an HTML string

!Developments: the content could be set by setting the iframe's "href" property to a remote URL, although this neccessitates allowing the browser to retrieve the page and load the DOM. See this discussion for a suggested approach: http://groups.google.com/group/TiddlyWikiDev/browse_thread/thread/597728cad3d46d76/e5bc32e236c914c7?lnk=gst&q=iframe#e5bc32e236c914c7
***/
config.macros.iframe = {};

config.macros.iframe.addDoc = function(iframe) {
	iframe.doc = iframe.document;
	if (iframe.contentDocument)
		iframe.doc = iframe.contentDocument; // For NS6
	else if (iframe.contentWindow)
		iframe.doc = iframe.contentWindow.document; // For IE5.5 and IE6
};

config.macros.iframe.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	f = document.createElement("iframe");
	f.style.border = "0px";
	f.style.width = "0px";
	f.style.height = "0px";
	// have to append the iframe before the content document gets loaded
	document.body.appendChild(f);
	this.addDoc(f);
	f.doc.open();
	f.doc.close();
	return f;
};

/***
!iframe macro

|Summary: |adds an iframe to the page and sets the content to an HTML string |
|Author: |JonLister |
|Dependencies: |iframe macro |

!Usage:
<<iframe tiddler:tiddlerName [width:iframeWidth] [height:iframeHeight]>>

where "tiddlerName" is a string and "iframeWidth" and "iframeHeight" are both valid CSS size strings

***/

config.macros.iframeTiddler = {
	containerId: "TiddlyIframe",
	idPrefix: "iframe",
	tiddlerError: "error in iframeTiddler macro: please supply a tiddler argument"
};

config.macros.iframeTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

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
	var html = tiddlerElem.childNodes[8].innerHTML;
	// remove the new Story
	removeNode(tempStory);
	// get an iframe
	var ifr = config.macros.iframe.handler();
	ifr.doc.body.innerHTML = html;
	console.log(html);
	ifr.style.width = width;
	console.log(ifr.doc.body);
	console.log(ifr.doc.body.offsetHeight);
	console.log(height);
	// ifr.style.height = height ? height : ifr.doc.body.offsetHeight;
	ifr.style.height = ifr.doc.body.offsetHeight+"px";
	console.log(ifr);
	return ifr;
};