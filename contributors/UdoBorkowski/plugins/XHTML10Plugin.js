/***
|''Name:''|XHTML10Plugin|
|''Version:''|1.0.1 (2006-09-16)|
|''Source:''|http://tiddlywiki.abego-software.de/#XHTML10Plugin|
|''Author:''|UdoBorkowski (ub [at] abego-software [dot] de)|
|''Licence:''|[[BSD open source license (abego Software)|http://www.abego-software.de/legal/apl-v10.html]]|
|''Copyright:''|&copy; 2005-2006 [[abego Software|http://www.abego-software.de]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.5.0.2 or better; Internet Explorer 6.0|

Make your ~TiddlyWiki XHTML 1.0 compliant format.

Once the plugin is installed the existing tiddlers of that TiddlyWiki are automatically converted to the new (XHTML 1.0 compliant) format on the first save. After that all changes are stored in the XHTML format.

!Source Code
***/
//{{{
// Ensure the Plugin is only installed once.
//
if (!version.extensions.XHTML10Plugin) {

if (version.major < 2 || (version.major == 2 && version.minor < 1)) {
	(function() {
		var s = "Use TiddlyWiki 2.1 or better to run the XHTML10Plugin.";
		alert(s);
		throw s;
	})();
}

version.extensions.XHTML10Plugin = {
	major: 1, minor: 0, revision: 1,
	date: new Date(2006, 8, 16),
	source: "http://tiddlywiki.abego-software.de/#XHTML10Plugin",
	licence: "[[BSD open source license (abego Software)|http://www.abego-software.de/legal/apl-v10.html]]",
	copyright: "Copyright (c) abego Software GmbH, 2005-2006 (www.abego-software.de)",
};

// Ensure the global abego namespace is set up.
if (!window.abego) window.abego = {};


//--------------------------------
// XHTML10Saver (inherits from SaverBase)

abego.XHTML10Saver = function() {};

abego.XHTML10Saver.prototype = new SaverBase();

abego.XHTML10Saver.prototype.externalizeTiddler = function(store, tiddler) {
	try {
		var s = '';
		store.forEachField(tiddler, 
			function(tiddler, fieldName, value) {
				// don't store stuff from the temp namespace
				if (!fieldName.match(/^temp\s./)) {
					if (value)
						value = value.htmlEncode();
					s += ['<pre title="',fieldName,'">',value,'</pre>'].join("");
				}
			});
		return ['<div title="',tiddler.title.htmlEncode(),'">',s,'</div>'].join("");

	} catch (e) {
		showException(e, config.messages.tiddlerSaveError.format([tiddler.title]));
		return '';
	}
};

abego.XHTML10Saver.prototype.externalize = function(store) {
	return ["<div class='twXHTML10'>\sn",SaverBase.prototype.externalize.apply(this, arguments),"\sn</div>"].join("");
};


//--------------------------------
// Overwrite TiddlyWiki.prototype.getSaver to use the XHTML10 format on save

TiddlyWiki.prototype.getSaver = function() {
	if (!this.saver) 
		this.saver = new abego.XHTML10Saver();
	return this.saver;
};

//======================================
// Install the Loader into the HTML page

(function() {
	// The loader code will be inserted into the PostHead markup block,
	// so it can be executed before tiddlers are loaded. We cannot just put this
	// code into a normal plugin since this "load" code is required to load
	// tiddlers. I.e. this code must be executed before any tiddlers/plugins
	// can be loaded.

	var getXHTML10LoaderBlock = function() {
		// The loader code in a big JavaScript string.
		// You may get a non-stringified version of the XHTML10Loader source code at
		// http://tiddlywiki.abego-software.de/archive/XHTML10Plugin/XHTML10Loader.1.0.1.js

		XHTML10LoaderCode = 
			"if (!window.abego) window.abego = {};\snif (!abego.XHTML10Loader) {\sn\st//-"+
			"-------------------------------\sn\st// abego.XHTML10Loader (inherits from"+
			" LoaderBase)\sn\st\sn\stabego.XHTML10Loader = function() {};\sn\stabego.XHTML10Loa"+
			"der.prototype = new LoaderBase();\sn\st\sn\stabego.XHTML10Loader.prototype.lin"+
			"go = {\sn\st\stunnamedValue: \s"Unnamed value\s",\sn\st\stredefining: \s"Redefining valu"+
			"e of %0\s",\sn\st\stnoXHTML10Format: \s"Storage not in XHTML 1.0 format\s"\sn\st}\sn\st\sn\sta"+
			"bego.XHTML10Loader.prototype.getTitle = function(store, e) {\sn\st\stvar tit"+
			"le = null;\sn\st\stif(e.getAttribute)\sn\st\st\sttitle = e.getAttribute('title');\sn\st\st"+
			"if(!title && e.id) {\st\sn\st\st\stvar lenPrefix = store.idPrefix.length;\sn\st\st\stif "+
			"(e.id.substr(0,lenPrefix) == store.idPrefix)\sn\st\st\st\sttitle = e.id.substr(l"+
			"enPrefix);\sn\st\st}\sn\st\streturn title;\sn\st};\sn\st\sn\stabego.XHTML10Loader.prototype.in"+
			"ternalizeTiddler = function(store, tiddler, title, data) {\sn\st\stvar field"+
			"s = {};\sn\st\stvar elems = data.childNodes;\sn\st\stfor(var i = 0; i < elems.leng"+
			"th; i++) {\sn\st\st\stvar e = elems[i];\sn\st\st\stvar name = e.getAttribute('title');"+
			"\sn\st\st\stif (!name) \sn\st\st\st\stthrow this.lingo.unnamedValue;\sn\st\st\stif (fields[name]"+
			" !== undefined) \sn\st\st\st\stthrow this.lingo.redefining.format([name]);\sn\st\st\stfi"+
			"elds[name] = getNodeText(e.firstChild); \sn\st\st}\sn\st\sn\st\st// Extract (and remov"+
			"e) the standard fields from the extended fields\sn\st\stvar text = fields.te"+
			"xt;\sn\st\stvar modifier = fields.modifier;\sn\st\stvar modified = Date.convertFro"+
			"mYYYYMMDDHHMM(fields.modified);\sn\st\stvar c = fields.created;\sn\st\stvar create"+
			"d = c ? Date.convertFromYYYYMMDDHHMM(c) : modified;\sn\st\stvar tags = field"+
			"s.tags;\sn\st\stdelete fields.modifier;\sn\st\stdelete fields.modified;\sn\st\stdelete f"+
			"ields.created;\sn\st\stdelete fields.tags;\sn\st\stdelete fields.text;\sn\st\stdelete fi"+
			"elds.title;\sn\st\sn\st\sttiddler.assign(title,text,modifier,modified,tags,creat"+
			"ed,fields);\sn\st\st\sn\st\streturn tiddler;\sn\st};\sn\st\sn\stvar findRootNode = function(no"+
			"des) {\sn\st\stif (nodes) {\sn\st\st\st// skip leading text nodes\sn\st\st\stfor (var i = 0;"+
			" i < nodes.length; i++)\sn\st\st\st\stif (nodes[i].nodeType != 3)\sn\st\st\st\st\stbreak;\sn\st\st"+
			"\st\st\st\sn\st\st\stif (i < nodes.length && nodes[i].className == 'twXHTML10')\sn\st\st\st\st"+
			"return nodes[i];\sn\st\st}\sn\st};\sn\st\sn\stabego.XHTML10Loader.prototype.loadTiddlers"+
			" = function(store,nodes) {\sn\st\st// in the twXHMTL10 format all tiddler el"+
			"ements are contained in one enclosing DIV\sn\st\st// that contains the forma"+
			"t information\sn\st\stvar root = findRootNode(nodes)\sn\st\stif (!root) \sn\st\st\stthrow "+
			"this.lingo.noXHTML10Format;\sn\st\streturn LoaderBase.prototype.loadTiddlers"+
			".apply(this, [store, root.childNodes]);\sn\st};\sn\st\sn\st\sn\st//-------------------"+
			"-------------\sn\st// Hijack the loadFromDiv\sn\st(function() {\sn\st\stvar origTidd"+
			"lyWikiLoadFromDiv = TiddlyWiki.prototype.loadFromDiv;\sn\st\stTiddlyWiki.pro"+
			"totype.loadFromDiv = function(srcID,idPrefix) {\sn\st\st\st// use the XHTML 1."+
			"0 loader when the storearea is in 'twXHTML10' format,\sn\st\st\st// otherwise "+
			"use the default loader\sn\st\st\stvar e = document.getElementById(srcID);\sn\st\st\sti"+
			"f (e && findRootNode(e.childNodes))\sn\st\st\st\stthis.loader = new abego.XHTML1"+
			"0Loader();\sn\st\st\streturn origTiddlyWikiLoadFromDiv.apply(this, arguments);"+
			"\sn\st\st};\sn\st})();\sn}\sn\sn";
		return '<'+'script type="text/javascript">\sn//<![CDATA[\sn'+XHTML10LoaderCode+'\sn//]]>\sn</script'+'>\sn';
	};

	var insertLoaderBlock = function() {
		if (!store)
			throw "XHTML10LoaderInstaller must run as a plugin";
			
		var START = "<!--XHMTL10Loader-START-->";
		var END = "<!--XHMTL10Loader-END-->";
		
		var postHeadText = store.getTiddlerText("MarkupPostHead");
		if (postHeadText.getChunk(START, END)) 
			return; // already installed

		postHeadText += "\sn"+START+getXHTML10LoaderBlock()+END+"\sn";
		var tiddler = store.getTiddler("MarkupPostHead");
		var tags = tiddler ? tiddler.tags : [];
		store.saveTiddler("MarkupPostHead","MarkupPostHead",postHeadText,config.options.txtUserName,new Date(),tags);
		alert("XHTML10Loader installed.\snPlease save and reload your TiddlyWiki to complete the installation. After that your TiddlyWiki will be stored in an XHTML 1.0 compliant format.");
	};
	
	insertLoaderBlock();														
})();

} // of single install

//}}}
