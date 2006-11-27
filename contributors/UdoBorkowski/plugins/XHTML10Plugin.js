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
				if (!fieldName.match(/^temp\./)) {
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
	return ["<div class='twXHTML10'>\n",SaverBase.prototype.externalize.apply(this, arguments),"\n</div>"].join("");
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
			"if (!window.abego) window.abego = {};\nif (!abego.XHTML10Loader) {\n\t//-"+
			"-------------------------------\n\t// abego.XHTML10Loader (inherits from"+
			" LoaderBase)\n\t\n\tabego.XHTML10Loader = function() {};\n\tabego.XHTML10Loa"+
			"der.prototype = new LoaderBase();\n\t\n\tabego.XHTML10Loader.prototype.lin"+
			"go = {\n\t\tunnamedValue: \"Unnamed value\",\n\t\tredefining: \"Redefining valu"+
			"e of %0\",\n\t\tnoXHTML10Format: \"Storage not in XHTML 1.0 format\"\n\t}\n\t\n\ta"+
			"bego.XHTML10Loader.prototype.getTitle = function(store, e) {\n\t\tvar tit"+
			"le = null;\n\t\tif(e.getAttribute)\n\t\t\ttitle = e.getAttribute('title');\n\t\t"+
			"if(!title && e.id) {\t\n\t\t\tvar lenPrefix = store.idPrefix.length;\n\t\t\tif "+
			"(e.id.substr(0,lenPrefix) == store.idPrefix)\n\t\t\t\ttitle = e.id.substr(l"+
			"enPrefix);\n\t\t}\n\t\treturn title;\n\t};\n\t\n\tabego.XHTML10Loader.prototype.in"+
			"ternalizeTiddler = function(store, tiddler, title, data) {\n\t\tvar field"+
			"s = {};\n\t\tvar elems = data.childNodes;\n\t\tfor(var i = 0; i < elems.leng"+
			"th; i++) {\n\t\t\tvar e = elems[i];\n\t\t\tvar name = e.getAttribute('title');"+
			"\n\t\t\tif (!name) \n\t\t\t\tthrow this.lingo.unnamedValue;\n\t\t\tif (fields[name]"+
			" !== undefined) \n\t\t\t\tthrow this.lingo.redefining.format([name]);\n\t\t\tfi"+
			"elds[name] = getNodeText(e.firstChild); \n\t\t}\n\t\n\t\t// Extract (and remov"+
			"e) the standard fields from the extended fields\n\t\tvar text = fields.te"+
			"xt;\n\t\tvar modifier = fields.modifier;\n\t\tvar modified = Date.convertFro"+
			"mYYYYMMDDHHMM(fields.modified);\n\t\tvar c = fields.created;\n\t\tvar create"+
			"d = c ? Date.convertFromYYYYMMDDHHMM(c) : modified;\n\t\tvar tags = field"+
			"s.tags;\n\t\tdelete fields.modifier;\n\t\tdelete fields.modified;\n\t\tdelete f"+
			"ields.created;\n\t\tdelete fields.tags;\n\t\tdelete fields.text;\n\t\tdelete fi"+
			"elds.title;\n\t\n\t\ttiddler.assign(title,text,modifier,modified,tags,creat"+
			"ed,fields);\n\t\t\n\t\treturn tiddler;\n\t};\n\t\n\tvar findRootNode = function(no"+
			"des) {\n\t\tif (nodes) {\n\t\t\t// skip leading text nodes\n\t\t\tfor (var i = 0;"+
			" i < nodes.length; i++)\n\t\t\t\tif (nodes[i].nodeType != 3)\n\t\t\t\t\tbreak;\n\t\t"+
			"\t\t\t\n\t\t\tif (i < nodes.length && nodes[i].className == 'twXHTML10')\n\t\t\t\t"+
			"return nodes[i];\n\t\t}\n\t};\n\t\n\tabego.XHTML10Loader.prototype.loadTiddlers"+
			" = function(store,nodes) {\n\t\t// in the twXHMTL10 format all tiddler el"+
			"ements are contained in one enclosing DIV\n\t\t// that contains the forma"+
			"t information\n\t\tvar root = findRootNode(nodes)\n\t\tif (!root) \n\t\t\tthrow "+
			"this.lingo.noXHTML10Format;\n\t\treturn LoaderBase.prototype.loadTiddlers"+
			".apply(this, [store, root.childNodes]);\n\t};\n\t\n\t\n\t//-------------------"+
			"-------------\n\t// Hijack the loadFromDiv\n\t(function() {\n\t\tvar origTidd"+
			"lyWikiLoadFromDiv = TiddlyWiki.prototype.loadFromDiv;\n\t\tTiddlyWiki.pro"+
			"totype.loadFromDiv = function(srcID,idPrefix) {\n\t\t\t// use the XHTML 1."+
			"0 loader when the storearea is in 'twXHTML10' format,\n\t\t\t// otherwise "+
			"use the default loader\n\t\t\tvar e = document.getElementById(srcID);\n\t\t\ti"+
			"f (e && findRootNode(e.childNodes))\n\t\t\t\tthis.loader = new abego.XHTML1"+
			"0Loader();\n\t\t\treturn origTiddlyWikiLoadFromDiv.apply(this, arguments);"+
			"\n\t\t};\n\t})();\n}\n\n";
		return '<'+'script type="text/javascript">\n//<![CDATA[\n'+XHTML10LoaderCode+'\n//]]>\n</script'+'>\n';
	};

	var insertLoaderBlock = function() {
		if (!store)
			throw "XHTML10LoaderInstaller must run as a plugin";
			
		var START = "<!--XHMTL10Loader-START-->";
		var END = "<!--XHMTL10Loader-END-->";
		
		var postHeadText = store.getTiddlerText("MarkupPostHead");
		if (postHeadText.getChunk(START, END)) 
			return; // already installed

		postHeadText += "\n"+START+getXHTML10LoaderBlock()+END+"\n";
		var tiddler = store.getTiddler("MarkupPostHead");
		var tags = tiddler ? tiddler.tags : [];
		store.saveTiddler("MarkupPostHead","MarkupPostHead",postHeadText,config.options.txtUserName,new Date(),tags);
		alert("XHTML10Loader installed.\nPlease save and reload your TiddlyWiki to complete the installation. After that your TiddlyWiki will be stored in an XHTML 1.0 compliant format.");
	};
	
	insertLoaderBlock();														
})();

} // of single install

//}}}
