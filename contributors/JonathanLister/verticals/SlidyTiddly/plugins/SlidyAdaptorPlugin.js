/***
|''Name:''|SlidyAdaptor|
|''Description:''|Adaptor for converting Slidy files into tiddlers (http://www.w3.org/Talks/Tools/Slidy)|
|''Author''|Jon Lister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/verticals/SlidyTiddly |
|''Version:''|0.1|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|
***/

//{{{
if(!version.extensions.SlidyAdaptor) {
version.extensions.SlidyAdaptor = {installed:true};

function SlidyAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

SlidyAdaptor.NotLoadedError = "Slidy file has not been loaded";
SlidyAdaptor.serverType = 'Slidy';

SlidyAdaptor.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = SlidyAdaptor.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

SlidyAdaptor.fullHostName = function(host)
{
	if(!host)
		return '';
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	//if(host.substr(-1) != '/')
	//	host = host + '/';
	return host;
};

SlidyAdaptor.prototype.openHost = function(host,context,userParams,callback)
{
//#displayMessage("openHost");
	this.host = SlidyAdaptor.fullHostName(host);
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

SlidyAdaptor.loadSlidyCallback = function(status,context,responseText,url,xhr)
{
//#displayMessage("loadSlidyCallback:"+status);
	context.status = status;
	if(!status) {
		context.statusText = "Error reading Slidy file:" + context.host;// + xhr.statusText;
	} else {
		try {
			context.tiddlers = SlidyAdaptor.slidyToTiddlers(responseText,context.SlidyUseRawDescription);
			/*if(context.filter) {
				var tw = new TiddlyWiki();
				tw.tiddlers = tiddlers;
				tiddlers = tw.filterTiddlers(filter);
			}*/
		} catch (ex) {
			displayMessage("Error parsing Slidy:"+context.host);
		}
	}
	context.complete(context,context.userParams);
};

// Gets the list of workspaces on a given server
//# Sets context.workspaces, which contains a single default workspace, since Slidy files do not have workspaces
//# Returns true if successful, error string if not
SlidyAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.workspaces = [{title:"(default)"}];
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Open the specified workspace
//# Returns true if successful, error string if not (or it should)
//# Trivial in the case of Slidy file where we don't have a workspace
SlidyAdaptor.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Gets the list of tiddlers within a given workspace
//# Returns true if successful, error string if not
//# Sets context.tiddlers, which is an array of tiddlers. Each tiddler corresponds to an Slidy item
//# Set these variables if possible:
//# title: tiddler.title, modified: tiddler.modified, modifier: tiddler.modifier, text: tiddler.text, tags: tiddler.tags, size: tiddler.text
SlidyAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
//#displayMessage("Slidy getTiddlerList");
	context = this.setContext(context,userParams,callback);
//#displayMessage("h:"+context.host);
	if(!context.filter)
		context.filter = filter;
	context.complete = SlidyAdaptor.getTiddlerListComplete;
	if(context.tiddlers) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = loadRemoteFile(context.host,SlidyAdaptor.loadSlidyCallback,context);
		if(typeof ret != "string")
			ret = true;
	}
	return ret;
};

SlidyAdaptor.getTiddlerListComplete = function(context,userParams)
{
//#displayMessage("Slidy getTiddlerListComplete");
	context.status = true;
	if(context.callback)
		window.setTimeout(function() {context.callback(context,userParams);},10);
	return true;
};

SlidyAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

SlidyAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
//#displayMessage("getTiddler:"+title);
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = SlidyAdaptor.getTiddlerComplete;
	return context.tiddlers ? 
		context.complete(context,context.userParams) :
		loadRemoteFile(context.host,SlidyAdaptor.loadSlidyCallback,context);
};

SlidyAdaptor.getTiddlerComplete = function(context,userParams)
{
	//# Retrieve the tiddler from the this.context.tiddlers array
	for(var i=0; i<context.tiddlers.length; i++) {
		if(context.tiddlers[i].title == context.title) {
			context.tiddler = context.tiddlers[i];
			break;
		}
	}
	if(context.tiddler) {
		context.status = true;
	} else {
		context.status = false;
		context.statusText = "error retrieving tiddler: " + title;
		return context.statusText;
	}
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		context.callback(context,userParams);
	} else {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

SlidyAdaptor.prototype.close = function()
{
};

SlidyAdaptor.slidyToTiddlers = function(slidy,useRawDescription)
{
	var tiddlers = [];
	if(slidy) {
		slidy = slidy.replace(/\r+/mg,"");
		
		// convert slide div's to tiddlers
		var e = createTiddlyElement(null,"div");
		e.innerHTML = slidy;
		var divs = e.getElementsByTagName("div");
		var div;
		for(var i=0;i<divs.length;i++) {
			div = divs[i];
			if(div.className.indexOf("slide")!=-1) {
				var title = div.getElementsByTagName("h1")[0];
				title = title.textContent || title.innerText; // FF | IE
				var text = div.innerHTML.substring(div.innerHTML.indexOf("</h1>")+5);
				var t = new Tiddler(title);
				t.text = text;
				t.tags = ["slide"];
				if(div.className.indexOf("cover")!=-1) {
					t.tags.push("cover");
				}
				tiddlers.push(t);
			}
		}
		
		// add contents tiddler
		t = new Tiddler("SlidyContents");
		text = [];
		for(i=0;i<tiddlers.length;i++) {
			 text.push("[["+tiddlers[i].title+"]]");
		}
		t.text = text.join("\n");
		tiddlers.push(t);
		
		// convert meta tags to tiddlers
		var metas = e.getElementsByTagName("meta");
		var meta_names = [
			"copyright",
			"font-size-adjustment"
		];
		var meta;
		for(i=0;i<metas.length;i++) {
			meta = metas[i];
			if(meta_names.contains(meta.getAttribute("name"))) {
				t = new Tiddler(meta.getAttribute("name"));
				text = meta["content"];
				t.text = text ? text : "";
				t.tags = ["meta"];
				tiddlers.push(t);
			}
		}
		
		// convert link tags to tiddlers
		var links = e.getElementsByTagName("link");
		var link_rel = "stylesheet";
		var link_not_href = "slidy.css";
		var link;
		for(i=0;i<links.length;i++) {
			link = links[i];
			if(link.getAttribute("rel")==link_rel && link.getAttribute("href")!=link_not_href) {
				t = new Tiddler(link_rel);
				text = link.getAttribute("href");
				t.text = text ? text : "";
				t.tags = ["stylesheet"];
				tiddlers.push(t);
			}
		}
	}
	return tiddlers;
};

SlidyAdaptor.slideDivToTiddler = function(div) {
	var h1_regex = new RegExp("<h1>([\\S| ]*)<\/h1>","g");
	var match = h1_regex.exec(div);
	if(match) {
		var heading = match[1];
		var body = div.substring(h1_regex.lastIndex,div.indexOf("</div>"));
		var t = new Tiddler(heading);
		t.text = body;
		return t;
	} else {
		displayMessage("error converting div to tiddler - no h1: "+div);
		return false;
	}
};

config.adaptors[SlidyAdaptor.serverType] = SlidyAdaptor;

// renderHtmlText puts a string through the browser render process and then extracts the text
// useful to turn HTML entities into literals such as &apos; to '
// this method has two passes at the string - the first to convert it to html and the second
// to selectively catch the ASCII-encoded characters without losing the rest of the html
String.prototype.renderHtmlText = function() {
	//displayMessage("in renderHtmlText");
	var text = this.toString();
	var regex_cdata = /<!\[CDATA\[((?:.|\n)*?)\]\]>/mg;
	//console.log(regex_cdata.lastIndex);
	//regex_cdata.lastIndex = 0;
	//console.log(text);
	var match = regex_cdata.exec(text);
	if(match) {
		text = match[1];
		//console.log("match: ",match);
		//displayMessage("removed cdata!");
		//console.log(text);
	} else {
		//#console.log("no cdata to remove");
	}
	var e = createTiddlyElement(document.body,"div");
	e.innerHTML = text;
	text = getPlainText(e);
	text = text.replace(/&#[\w]+?;/g,function(word) {
		var ee = createTiddlyElement(e,"div");
		ee.innerHTML = word;
		return getPlainText(ee);
	});
	removeNode(e);
	//displayMessage("leaving renderHtmlText");
	return text;
};

} //# end of 'install only once'
//}}}
