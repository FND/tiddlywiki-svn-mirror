/***
|Name|ImportTiddlersPluginPatch|
|Source|http://www.TiddlyTools.com/#ImportTiddlersPluginPatch|
|Version|3.6.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|ImportTiddlersPlugin|
|Overrides|config.macros.importTiddlers.handler|
|Description|backward-compatible function patches for use with ImportTiddlersPlugin and TW2.1.x or earlier|

!!!!!Usage
<<<
The current version ImportTiddlersPlugin is compatible with the TW2.2.x core functions.  This "patch" plugin provides additional functions needed to enable the current version of ImportTiddlersPlugin to operate correctly under TW2.1.x or earlier.

{{medium{You do not need to install this plugin if you are using TW2.2.0 or above}}}
(though it won't hurt anything if you do... it will just take up more space).
<<<
!!!!!Revisions
<<<
''2008.01.03 [3.6.0]'' added support for passing txtRemoteUsername and txtRemotePassword for accessing password-protected remote servers
''2007.06.27 [3.5.5]'' compatibility functions split from ImportTiddlersPlugin
|please see [[ImportTiddlersPlugin]] for additional revision details|
''2005.07.20 [1.0.0]'' Initial Release
<<<
!!!!!Code
***/
//{{{
// these functions are only defined when installed in TW2.1.x and earlier... 
if (version.major+version.minor/10 <= 2.1) {

// Version
version.extensions.importTiddlersPatch21x = {major: 3, minor: 6, revision: 0, date: new Date(2008,1,3)};

// fixups for TW2.0.x and earlier
if (window.merge==undefined) window.merge=function(dst,src,preserveExisting)
	{ for (p in src) if (!preserveExisting||dst[p]===undefined) dst[p]=src[p]; return dst; }
if (config.macros.importTiddlers==undefined) config.macros.importTiddlers={ };

config.macros.importTiddlers.loadRemoteFile = function(src,callback,quiet) {
	if (src==undefined || !src.length) return null; // filename is required
	if (!quiet) clearMessage();
	if (!quiet) displayMessage(this.openMsg.format([src]));
	if (src.substr(0,5)!="http:" && src.substr(0,5)!="file:") { // if src is relative (i.e., not a URL)
		if (!this.fileExists(src)) { // if file cannot be found, might be relative path.. try fixup
			var pathPrefix=document.location.href;  // get current document path and trim off filename
			var slashpos=pathPrefix.lastIndexOf("/"); if (slashpos==-1) slashpos=pathPrefix.lastIndexOf("\\"); 
			if (slashpos!=-1 && slashpos!=pathPrefix.length-1) pathPrefix=pathPrefix.substr(0,slashpos+1);
			src=pathPrefix+src;
			if (pathPrefix.substr(0,5)!="http:") src=getLocalPath(src);
		}
	}
	if (src.substr(0,4)!="http" && src.substr(0,4)!="file") { // if not a URL, read from local filesystem
		var txt=loadFile(src);
		if ((txt==null)||(txt==false)) // file didn't load
			{ if (!quiet) displayMessage(config.macros.importTiddlers.openErrMsg.format([src,"(unknown)"])); }
		else {
			if (!quiet) displayMessage(config.macros.importTiddlers.readMsg.format([txt.length,src]));
			if (callback) callback(true,quiet,convertUTF8ToUnicode(txt),src,null);
		}
	}
	else {
		var x; // get an request object
		try {x = new XMLHttpRequest()} // moz
		catch(e) {
			try {x = new ActiveXObject("Msxml2.XMLHTTP")} // IE 6
			catch (e) {
				try {x = new ActiveXObject("Microsoft.XMLHTTP")} // IE 5
				catch (e) { return }
			}
		}
		// setup callback function to handle server response(s)
		x.onreadystatechange = function() {
			if (x.readyState == 4) {
				if (x.status==0 || x.status == 200) {
					if (!quiet) displayMessage(config.macros.importTiddlers.readMsg.format([x.responseText.length,src]));
					if (callback) callback(true,quiet,x.responseText,src,x);
				}
				else {
					if (!quiet) displayMessage(config.macros.importTiddlers.openErrMsg.format([src,x.status]));
				}
			}
		}
		// get privileges to read another document's DOM via http:// or file:// (moz-only)
		if (typeof(netscape)!="undefined") {
			try { netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead"); }
			catch (e) { if (!quiet) displayMessage(e.description?e.description:e.toString()); }
		}
		// send the HTTP request
		try {
			var url=src+(src.indexOf('?')<0?'?':'&')+'nocache='+Math.random();
			x.open("GET",src,true,config.options.txtRemoteUsername,config.options.txtRemotePassword);
			if (x.overrideMimeType) x.overrideMimeType('text/html');
			x.send(null);
		}
		catch (e) {
			if (!quiet) {
				displayMessage(config.macros.importTiddlers.openErrMsg.format([src,"(unknown)"]));
				displayMessage(e.description?e.description:e.toString());
			}
		}
	}
}

config.macros.importTiddlers.readTiddlersFromHTML=function(html) {
	// for TW2.1 and earlier
	// extract store area from html 
	var start=html.indexOf('<div id="storeArea">');
	var end=html.indexOf("<!--POST-BODY-START--"+">",start);
	if (end==-1) var end=html.indexOf("</body"+">",start); // backward-compatibility for older documents
	var sa="<html><body>"+html.substring(start,end)+"</body></html>";

	// load html into iframe document
	var f=document.getElementById("loaderFrame"); if (f) document.body.removeChild(f);
	f=document.createElement("iframe"); f.id="loaderFrame";
	f.style.width="0px"; f.style.height="0px"; f.style.border="0px";
	document.body.appendChild(f);
	var d=f.document;
	if (f.contentDocument) d=f.contentDocument; // For NS6
	else if (f.contentWindow) d=f.contentWindow.document; // For IE5.5 and IE6
	d.open(); d.writeln(sa); d.close();

	// read tiddler DIVs from storeArea DOM element	
	var sa = d.getElementById("storeArea");
	if (!sa) return null;
	sa.normalize();
	var nodes = sa.childNodes;
	if (!nodes || !nodes.length) return null;
	var tiddlers = [];
	for(var t = 0; t < nodes.length; t++) {
		var title = null;
		if(nodes[t].getAttribute)
			title = nodes[t].getAttribute("title"); // TW 2.2+
		if(!title && nodes[t].getAttribute)
			title = nodes[t].getAttribute("tiddler"); // TW 2.1.x
		if(!title && nodes[t].id && (nodes[t].id.substr(0,5) == "store"))
			title = nodes[t].id.substr(5); // TW 1.2.x
		if(title && title != "")
			tiddlers.push((new Tiddler()).loadFromDiv(nodes[t],title));
	}
	return tiddlers;
}

// // COPIED FROM TW2.2beta5
// // enables reading tiddler definitions using TW2.2 storeArea format, even when plugin is running under TW2.1.x
// // storeArea format changes include:
// // <pre> nodes
// // attribute(tiddler) renamed to attribute(title)
// // attribute(modified) is omitted if created==modified
TW21Loader.prototype.internalizeTiddler = function(store,tiddler,title,node)
{
	var e = node.firstChild;
	var text = null;
	if(node.getAttribute("tiddler")) {
		text = getNodeText(e).unescapeLineBreaks();
	} else {
		while(e.nodeName!="PRE" && e.nodeName!="pre") {
			e = e.nextSibling;
		}
		text = e.innerHTML.replace(/\r/mg,"").htmlDecode();
	}
	var modifier = node.getAttribute("modifier");
	var c = node.getAttribute("created");
	var m = node.getAttribute("modified");
	var created = c ? Date.convertFromYYYYMMDDHHMM(c) : version.date;
	var modified = m ? Date.convertFromYYYYMMDDHHMM(m) : created;
	var tags = node.getAttribute("tags");
	var fields = {};
	var attrs = node.attributes;
	for(var i = attrs.length-1; i >= 0; i--) {
		var name = attrs[i].name;
		if (attrs[i].specified && !TiddlyWiki.isStandardField(name)) {
			fields[name] = attrs[i].value.unescapeLineBreaks();
		}
	}
	tiddler.assign(title,text,modifier,modified,tags,created,fields);
	return tiddler;
};

} // END OF TW2.1.x backward-compatibility functions
//}}}