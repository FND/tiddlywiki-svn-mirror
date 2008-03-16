/***
|''Name:''|testMacro|
|''Description:''|macro to use for general testing|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals\testGeneral/testMacro.js |
|''Version:''|0.0.4|
|''Date:''|July 31, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

***/

/*{{{*/

testLog = function(text)
{
	if(window.console) {
		console.log(text);
	} else {
		displayMessage(text);
	}
};

config.macros.testMacro = {
	label: "test macro",
	prompt: "test macro",
	title: "Test Macro"
};

config.macros.testMacro.test = function(title,params)
{
	clearMessage();
	displayMessage("Testing");
	config.options.chkMediaWikiDisplayEmptyTemplateLinks = true;
	//tpTest('Dummy','','{{#if: {{{built|}}} |\n!     colspan="2" {{!}} Built\n{{!}} colspan="2" {{!}} {{{built}}}\n}}');
	//tpTest('Dummy','','{{Infobox Airport}}');
	config.macros.testMacro.testRawPipes(title,params);
	config.macros.testMacro.testDoubleBraces(title,params);
	config.macros.testMacro.testTripleBraces(title,params);
	config.macros.testMacro.testRawPipes(title,params);
	config.macros.testMacro.testVariables(title,params);
	config.macros.testMacro.testParserFunctions(title,params);
	config.macros.testMacro.testBasic(title,params);
	config.macros.testMacro.testExamples(title,params);
	config.macros.testMacro.testTableBraces(title,params);
	displayMessage("Testing complete");
};

tpTest = function(templateName,content,tag,expected)
{
//testLog('content:'+content);
testLog('tpTest:'+tag);
	var tiddler = store.fetchTiddler('Test');
	var namespace = 'Template:';
	var mwt = new MediaWikiTemplate();
	var template = new Tiddler(namespace+MediaWikiTemplate.normalizeTitle(templateName));
	template.text = content;
	store.addTiddler(template);
	text = mwt.transcludeTemplates(tag,tiddler);
	testLog('transcluded:'+text);
	if(expected && text!=expected) {
		displayMessage('Error:'+tag);
	}
	testLog('RET:'+text);
	testLog('');
};

tp2Test = function(tag,expected)
{
//testLog('content:'+content);
testLog('tp2Tsest:'+tag);
	var tiddler = store.fetchTiddler('Test');
	var mwt = new MediaWikiTemplate();
	text = mwt.transcludeTemplates(tag,tiddler);
	if(expected && text!=expected) {
		displayMessage('Error:'+tag);
	}
	testLog('RET:'+text);
	testLog('');
};

dbrTest = function(text,start,es,ee)
{
//testLog('content:'+content);
testLog('dprTest:'+text+'    ('+es+','+ee+')');
	var ret = MediaWikiTemplate.findDBP(text,start);
	if((es && ret.start!=es)||(ee && ret.end!=ee)) {
		displayMessage('Error:'+'('+es+','+ee+') '+text);
	}
	testLog('RET:'+ret.start+','+ret.end);
	testLog('');
};

tbrTest = function(text,start,es,ee)
{
testLog('tbrTest:'+text+'    ('+es+','+ee+')');
	var ret = MediaWikiTemplate.findTBP(text,start);
	if((es && ret.start!=es)||(ee && ret.end!=ee)) {
		displayMessage('Error:'+'('+es+','+ee+') '+text);
	}
	testLog('RET:'+ret.start+','+ret.end);
	testLog('');
};

taTest = function(text,start,es,ee)
{
testLog('taTest:'+text+'    ('+es+','+ee+')');
	var ret = MediaWikiTemplate.findTableBracePair(text,start);
	if((es && ret.start!=es)||(ee && ret.end!=ee)) {
		displayMessage('Error:'+'('+es+','+ee+') '+text);
	}
	testLog('RET:'+ret.start+','+ret.end);
	testLog('');
};

rpTest = function(text,start,expected)
{
testLog('rpTest:'+text+'    ('+expected+')');
	var ret = MediaWikiTemplate.findRawDelimiter('|',text,start);
	if(expected && ret!=expected) {
		displayMessage('ErrorT:'+text);
	}
	testLog('RET:'+ret);
	testLog('');
};

config.macros.testMacro.testRawPipes = function(title,params)
{
	rpTest('abcdefgh',0,-1);
	rpTest('abcd|efgh',0,4);
	rpTest('abc[[d|e]]f|gh',0,11);
	rpTest('abc{{d|e}}f|gh',0,11);
	rpTest('abc[[{{d|e}}]]f|gh',0,15);
	rpTest('abc[[{{d|e}}]]{{{|}}}f|gh',0,22);
	rpTest('abc[[{{d|e}}{{{|}}}]]f|gh',0,22);
	rpTest('abc[[{{d{{|}}e}}{{{|}}}]]f|gh',0,26);
	rpTest('abc{{d|[[e]]}}{{{|}}}f|gh',0,22);
	rpTest('[[Semimajor axis|Avg. distance from Sun]]',0,-1);
	rpTest('aa[[Semimajor axis|Avg. distance from Sun]]bb',0,-1);
	rpTest('aa[[Semimajor axis|Avg. distance from Sun]]bb',2,-1);
	rpTest('\n! colspan="2" {{!}} Elevation&nbsp;[[Above mean sea level|AMSL]]\n{{!}} colspan="2" {{!}} {{#if:\n| 56 [[metre|m]] / 184 [[foot (unit of length)|ft]]\n| 184 [[foot (unit of length)|ft]] / 56 [[metre|m]] }}\n',0,-1);
	rpTest('{{!}} {{|}}',0,-1);
	rpTest('! colspan="2" {{!}} Elevation&nbsp;[[Above mean sea level|AMSL]]\n{{!}} colspan="2" {{!}} {{#if:\n| 56 [[metre|m]] / 184 [[foot (unit of length)|ft]]\n| 184 [[foot (unit of length)|ft]] / 56 [[metre|m]] }}\n',0,-1);
	rpTest('Elevation&nbsp;[[Above mean sea level|AMSL]]\n{{!}} colspan="2" {{!}} {{#if:\n| 56 [[metre|m]] / 184 [[foot (unit of length)|ft]]\n| 184 [[foot (unit of length)|ft]] / 56 [[metre|m]] }}\n',0,-1);
	rpTest('Elevation&nbsp;[[Above mean sea level|AMSL]]\n{{!}} colspan="2" {{!}} {{#if:\n| 56 }}\n',0,-1);
	rpTest('E[[Above mean sea level|AMSL]]\n{{!}} colspan="2" {{!}} {{#if:\n| 56 }}\n',0,-1);
	rpTest('{{!}} colspan="2" {{!}} {{#if:\n| 56 }}\n',0,-1);
	rpTest('{{!}}  {{!}} {{#if:\n| 56 }}\n',0,-1);
	rpTest('{{!}} {{|}}',0,-1);
	rpTest('E[[Above mean sea level|AMSL]]\n {{#if:\n| 56 }}\n',0,-1);
	rpTest('[[Above mean sea level|AMSL]] {{#if:| 56 }}\n',0,-1);
	rpTest('{{#if:\n| 56 [[metre|m]] / 184 [[foot (unit of length)|ft]]\n| 184 [[foot (unit of length)|ft]] / 56 [[metre|m]] }}\n',0,-1);
};

config.macros.testMacro.testDoubleBraces = function(title,params)
{
	dbrTest('{{a}}',0,0,3);
	dbrTest('{{}}',0,0,2);
	dbrTest('a{{n}}c',0,1,4);
	dbrTest('abcd',0,-1,-1);

	dbrTest('a{{ {{abc}} }}',0,1,12);
	dbrTest('a{{ {{abc}} }}',2,4,9);
	dbrTest('a{{ {{a{{b}}c}} }}',0,1,16);

	dbrTest('a{{{x}}} {{a}}',0,9,12);
//	{{{{foo}}}} is equivalent to { {{{foo}}} }
	dbrTest('{{{{x}}}}',0,-1,-1);
//	{{{{foo}} }} is equivalent to {{ {{foo}} }}
	dbrTest('{{{{x}} }}',0,0,8);
//	{{{{{foo}}}}} is equivalent to {{ {{{foo}}} }}
	dbrTest('{{{{{x}}}}}',0,0,9);
	dbrTest('{{{{{x}} }}}',0,3,6);
	dbrTest('{{{{{x}}} }}',0,0,10);
	dbrTest('{{{{{{x}}}}}}',0,-1,-1);

	dbrTest('{{ {{{wid|}}}|w|200 }}',0,0,20);
	dbrTest('{{ {{ {{{wid|}}}|w|200 }} }}',0,0,26);
	dbrTest('{{ {{ b }} {{c}} }}',0,0,17);
	dbrTest('{{ {{{a}}} b {{c}} }}',0,0,19);
	dbrTest('{{ {{{a}}} b }}',0,0,13);
	dbrTest('{{ {{{a}}} b }} {{c}}',0,0,13);
	dbrTest('{{ {{ {{{a}}} b }} {{c}} }}',0,0,25);
	dbrTest('{{ {{ {{{wid|}}}|w|200 }} {{c}} }}',0,0,32);
	dbrTest('{{ i | [[img|{{ {{{wid|}}}|w|200 }}px]] {{ c |c }} }}',0,0,51	);

	dbrTest('{{{1|pqr}}} {{TEx1}} {{{2|stu}}}',3,12,18);
	var t= '{{#if: {{{image<includeonly>|</includeonly>}}} | {{!}} colspan="4" {{!}} [[Image:{{{image}}}|{{#if:{{{image-width|}}}|{{{image-width}}}|200}}px]]{{#if: {{{caption}}} |{{{caption}}}}}</p>}}';
	dbrTest(t,3,49,52);
};

config.macros.testMacro.testTripleBraces = function(title,params)
{
	tbrTest('{{{a}}}',0,0,4);
	tbrTest('{{{}}}',0,0,3);
	tbrTest('a{{{n}}}c',0,1,5);
	tbrTest('abcd',0,-1,-1);

	tbrTest('a{{{x}}} {{a}}',1,1,5);
	tbrTest('{{{x|{{{y|s}}}}}}',5,5,11);
	tbrTest('{{{x|{{{y|s}}}}}}',0,0,14);
	tbrTest('{{{x{{a}}}}}}',0,0,9);
	
	tbrTest('{{{1|pqr}}} {{{2|stu}}}',0,0,8);
	tbrTest('{{{1|pqr}}} {{TEx1}} {{{2|stu}}}',0,0,8);
	tbrTest('{{{1|pqr}}} {{TEx1}} {{{2|stu}}}',4,21,29);
	tbrTest('{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})',0,0,6);
	tbrTest('{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})',9,9,15);
	tbrTest('{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})',18,18,24);
	tbrTest('{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})',29,29,43);
	tbrTest('{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})',32,34,40);
	tbrTest('{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})',34,34,40);

//	{{{{foo}}}} is equivalent to { {{{foo}}} }
	tbrTest('{{{{x}}}}',0,1,5);
//	{{{{foo}} }} is equivalent to {{ {{foo}} }}
	tbrTest('{{{{x}} }}',0,-1,-1);
//	{{{{{foo}}}}} is equivalent to {{ {{{foo}}} }}
	//tbrTest('{{{{{x}}}}}',0,2,6);

//	{{{{{foo}}}}} is equivalent to {{ {{{foo}}} }}
	tbrTest('{{{{{x}}}}}',0,2,6);
	tbrTest('{{{{{x}} }}}',0,0,9);
	tbrTest('{{{{{x}}} }}',0,2,6);
	
	tbrTest('{{{{{{x}}}}}}',0,0,10);


	//tbrTest('',0,1,4);
	//tbrTest('',0,1,4);
};

config.macros.testMacro.testTableBraces = function(title,params)
{
	taTest('{|a\n|}',0,0,4);
	taTest('{|\n|}',0,0,3);
	taTest('a{|b\n|}c',0,1,5);
	taTest('abcd',0,-1,-1);

	taTest('a{|nm{|xy\n|}z\n|}c',0,1,14);
	taTest('a{|nm{|xy\n|}z\n|}c',3,5,10);
};

config.macros.testMacro.testVariables = function(title,params)
{
	tpTest('Dummy','','{{PAGENAME}}','Test');
};

config.macros.testMacro.testParserFunctions = function(title,params)
{
	tpTest('Dummy','','{{#if: 0 | a |b }}',' a ');
	tpTest('Dummy','','{{#if: 0 | a }}',' a ');
	tpTest('Dummy','','{{#if:  | a |b }}','b ');
	tpTest('Dummy','','{{#if:  | a }}','');

	tpTest('TFn1','{{#if: {{{type|}}} | Airport type {{{type}}} }}','{{TFn1}}','');
	tpTest('TFn1','{{#if: {{{type<includeonly>|</includeonly>}}} | Airport type {{{type}}} }}','{{TFn1}}','');
	tpTest('TFn1','{{#if: {{{type|}}} | Airport type {{{type}}} }}','{{TFn1|type=public}}',' Airport type public ');
	tpTest('TFn1','{{#if: {{{type<includeonly>|</includeonly>}}} | Airport type {{{type}}} }}','{{TFn1|type=public}}',' Airport type public ');
	
	tpTest('Dummy','{{#if: {{{built|}}} |\n!     colspan="2" {{!}} Built\n{{!}} colspan="2" {{!}} {{{built}}}\n}}');

};

config.macros.testMacro.testBasic = function(title,params)
{
	tpTest('test','hello','{{test}}','hello');
	tpTest('test','hello','{{Test}}','hello');
	tpTest('test','hello','{{test#extra}}','hello');
	tpTest('test','hello','{{Test#extra}}','hello');
	tpTest('test','hello','{{TEST}}','[[Template:TEST]]');

	tpTest('test','hello {{{1}}}','ABC{{test|world}}XYZ','ABChello worldXYZ');
	tpTest('test','hello {{{1}}}','{{test}}','hello {{{1}}}');
	tpTest('test','hello {{{param1|nobody}}}','{{test|param1=world}}','hello world');
	tpTest('test','hello {{{param1|nobody}}}','{{test|param2=world}}','hello nobody');
	tpTest('test','{{tc}} {{tc}}','{{test}}','in in');

	tpTest('Tc','in','{{tc}}','in');
	tpTest('Tc','in','{{tc}}X{{tc}}','inXin');
	tpTest('Tc','in','{{{{tc}}}}','{{{{tc}}}}');
	tpTest('Tc','in','{{ {{tc}}}}','[[Template:in]]');

	tpTest('t1demo','start-{{{1}}}-end','{{t1demo|a}}','start-a-end');
	tpTest('t1demo','start-{{{1}}}-end','{{t1demo| }}','start- -end');
	tpTest('t1demo','start-{{{1}}}-end','{{t1demo|}}','start--end');
	tpTest('t1demo','start-{{{1}}}-end','{{t1demo}}','start-{{{1}}}-end');
	
	tpTest('t','start-{{{1|pqr}}}-end','{{t|a}}','start-a-end');
	tpTest('t','start-{{{1|pqr}}}-end','{{t| }}','start- -end');
	tpTest('t','start-{{{1|pqr}}}-end','{{t|}}','start--end');
	tpTest('t','start-{{{1|pqr}}}-end','{{t|1=no surprise}}','start-no surprise-end');
	tpTest('t','start-{{{1|pqr}}}-end','{{t|no|1=surprise}}','start-surprise-end');
	tpTest('t','start-{{{1|pqr}}}-end','{{t|1=no|surprise}}','start-surprise-end');
	tpTest('t','start-{{{1|pqr}}}-end','{{t}}','start-pqr-end');
	tpTest('t','start-{{{1|pqr}}}-end','{{t|2=two}}','start-pqr-end');
	
	var c = 'start-{{{1}}}-middle-{{{2}}}-end<noinclude>[[Category:Demo template]]</noinclude>';
	tpTest('t2demo',c,'{{t2demo}}','start-{{{1}}}-middle-{{{2}}}-end');
	tpTest('t2demo',c,'{{t2demo||a}}','start--middle-a-end');
	tpTest('t2demo',c,'{{t2demo|2=a}}','start-{{{1}}}-middle-a-end');
};

config.macros.testMacro.testExamples = function(title,params)
{
	tpTest('TEx1','Hello world!','[[Template:TEx1]]','[[Template:TEx1]]');
	tpTest('TEx1','Hello world!','{{TEx1}}','Hello world!');
	tpTest('TEx1','Hello world!','{{Template:TEx1}}','Hello world!');
	tpTest('TEx1','Hello world!','abc{{TEx1}}def','abcHello world!def');

	tpTest('TEx2','abc{{{1}}}def','{{TEx2|1=Hello World!}}','abcHello World!def');
	tpTest('TEx2','abc{{{1}}}def','{{TEx2|Hello World!}}','abcHello World!def');
	tpTest('TEx2','abc{{{1}}}def','{{TEx2|2=Hello World!}}','abc{{{1}}}def');
	tpTest('TEx2','abc{{{1}}}def','{{TEx2||Hello World!}}','abcdef');

	tpTest('TEx3','{{{1}}}{{{2}}}{{{3}}} ({{{x}}})','{{TEx3|A|B|C}}','ABC ({{{x}}})');
	tpTest('TEx3','{{{1}}}{{{2}}}{{{3}}} ({{{x}}})','{{TEx3|A| B |x=C}}','A B {{{3}}} (C)');
	tpTest('TEx3','{{{1}}}{{{2}}}{{{3}}} ({{{x}}})','{{TEx3|A|x =B |C }}','AC {{{3}}} (B)');
	tpTest('TEx3','{{{1}}}{{{2}}}{{{3}}} ({{{x}}})','{{TEx3|A|x=B|x=C}}','A{{{2}}}{{{3}}} (C)');
	tpTest('TEx3','{{{1}}}{{{2}}}{{{3}}} ({{{x}}})','{{TEx3|1=A|2=B|=C}}','AB{{{3}}} ({{{x}}})');
	tpTest('TEx3','{{{1}}}{{{2}}}{{{3}}} ({{{x}}})','{{TEx3|1=A|=B|C}}','C{{{2}}}{{{3}}} ({{{x}}})');

	tpTest('TEx5','[1]','{{TEx5|ABC|DEF}}','[1]');
	tpTest('TEx5','[1]','{{TEx5|GHI|JKL}}','[1]');

	tpTest('TEx6','{{{1|p}}}','{{TEx6|A}}','A');
	tpTest('TEx6','{{{1|p}}}','{{TEx6}}','p');
	tpTest('TEx6','{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})','{{TEx6|A|B|C}}','ABC (s)');
	tpTest('TEx6','{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})','{{TEx6|A|B|x=C}}','ABr (C)');
	tpTest('TEx6','{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})','{{TEx6|A|x=B|y=C}}','Aqr (B)');
	tpTest('TEx6','{{{1|p}}}{{{2|q}}}{{{3|r}}} ({{{x|{{{y|s}}}}}})','{{TEx6|A|B|y=C}}','ABr (C)');

	tpTest('TEx7','abc<noinclude>def</noinclude>ghi','{{TEx7}}','abcghi');
	tpTest('TEx8','abc<includeonly>def</includeonly>ghi','{{TEx8}}','abcdefghi');
	tpTest('TEx9','abc<onlyinclude>def</onlyinclude>ghi','{{TEx9}}','def');

	tpTest('TEx10','{{{1|pqr}}} {{TEx1}} {{{2|stu}}}','{{TEx10|abc|def}}','abc Hello world! def');

	tpTest('TEx11','pqr {{TEx3|{{{1}}}|x={{{x}}} }} stu','{{TEx11|ABC|x=DEF}}','pqr ABC{{{2}}}{{{3}}} (DEF) stu');

	//tpTest('TEx12','{{{1}}} {{TEx12}} {{{2}}}','{{TEx12|abc|def}}','abc Template loop detected: Template:Tex12 def');

	//tpTest('TEx','','{{TEx}}','');
	tpTest('Dummy','','{{Infobox Airport}}');

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
