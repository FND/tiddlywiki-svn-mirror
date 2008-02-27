/***
|''Name:''|testMacro|
|''Description:''|macro to use for general testing|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals\testGeneral/testMacro.js |
|''Version:''|0.0.2|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

***/

/*{{{*/
config.macros.testMacro = {
	label: "test macro",
	prompt: "test macro",
	title: "Test Macro"
};

tpTest = function(content,tag,expected)
{
console.log('content:'+content);
console.log('tag:'+tag);
	var mwt = new MediaWikiTemplate();
	var tiddler = store.fetchTiddler('Test');
	var template = new Tiddler('Template:Test');
	template.text = content;
	store.addTiddler(template);
	text = mwt.transcludeTemplates(tag,tiddler);
	if(expected && text!=expected) {
		displayMessage('Error:'+content);
	}
	console.log('RET:'+text+'\n');
};

config.macros.testMacro.test = function(title,params)
{
	tpTest('{{test}}','{{test}}');
	tpTest('hello','{{test}}');
	tpTest('hello {{{1}}}','ABC{{test|world}}XYZ','ABChello worldXYZ');
	tpTest('hello {{{1}}}','{{test}}');
	tpTest('hello {{{param1|nobody}}}','{{test|param1=world}}');
	tpTest('hello {{{param1|nobody}}}','{{test|param2=world}}');
	tpTest('{{tc}} {{tc}}','{{test}}','in in');
	tpTest('','{{PAGENAME}}');
	tpTest('','{{#if: 0 | a |b }}');
};

config.macros.testMacro.test1 = function(title,params)
{
// http://meta.wikimedia.org/wiki/Template
	clearMessage();
	displayMessage("Testing");
	// tc is "in"
	var mwt = new MediaWikiTemplate();
	var tiddler = store.fetchTiddler('Test');
	var text;
	text = mwt.transcludeTemplates('{{tc}}',tiddler);
	console.log('RET:'+text);
	text = mwt.transcludeTemplates('{{tc}}X{{tc}}',tiddler);
	console.log('RET:'+text);
	text = mwt.transcludeTemplates('{{PAGENAME}}',tiddler);
	console.log('RET:'+text);
	text = mwt.transcludeTemplates('{{#if: 0 | a |b }}',tiddler);
	console.log('RET:'+text);
};

config.macros.testMacro.test2 = function(title,params)
{
// http://meta.wikimedia.org/wiki/Template
	clearMessage();
	displayMessage("Testing");
	var tiddlers = store.getTaggedTiddlers("test");
	for(var i=0;i<tiddlers.length;i++) {
		var t = tiddlers[i];
		var r = store.fetchTiddler(t.title+" Result");
		displayMessage(t.title+":");
		displayMessage(":"+wikifyStatic(t.text,null,t));
		displayMessage(":"+r.text);
	}
};

config.macros.testMacro.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = params[0] ? params[0] : config.macros.testMacro.title;
	//#var title = config.macros.testMacro.title;
	//#var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick,null,null,this.accessKey);
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick);
	btn.setAttribute("title",title);
	btn.setAttribute("params",params.join("|"));
};

config.macros.testMacro.onClick = function(e)
{
	var title = this.getAttribute("title");
	var params = this.getAttribute("params").split("|");
	config.macros.testMacro.test(title,params);
	return false;
};
/*}}}*/
