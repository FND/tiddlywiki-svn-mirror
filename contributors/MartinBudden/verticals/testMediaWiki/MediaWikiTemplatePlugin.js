/***
|''Name:''|MediaWikiTemplatePlugin|
|''Description:''|Development plugin for MediaWiki Template expansion|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.0.2|
|''Date:''|Feb 27, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.1.0|

http://meta.wikimedia.org/wiki/Help:Template
http://meta.wikimedia.org/wiki/User:Happy-melon/Templates

http://meta.wikimedia.org/wiki/Help:Parser_function
http://meta.wikimedia.org/wiki/Help:ParserFunctions (extensions)
http://www.mediawiki.org/wiki/Help:Magic_words
http://meta.wikimedia.org/wiki/Help:Variable

==Parsing templates==

When the MediaWiki [[mw:Manual:Parser.php|parser]] encounters a template (defined as a matched pair of braces not inside <nowiki><nowiki></nowiki> tags), the template is expanded using the following algorithm:

#The template call is divided into the template name and parameter expressions, by looking for pipe characters.  Pipes contained within matched double braces or square brackets are ignored.  
#*This division is performed purely based on pipe characters ''currently'' present in the template call, ignoring those potentially contained within templates.  This is what permits the use of [[Template:!]].
#*A potentially interesting feature is that characters including and following a hash <code>#</code> are stripped from the template name after this division.  So <code><nowiki>{{TEx4#def|ABC}}</nowiki></code> will be parsed in exactly the same way as <code><nowiki>{{TEx4|ABC}}</nowiki></code>.
#The wikicode for the template name is evaluated, calling the template parser [[w:Recursion (computer science)|recursively]] if necessary.  
#The wikicode for each parameter expression is evaluated, again using recursion if the wikicode contains another template. 
#Any parameter expression now containing a raw equals sign is split around that equals sign into a parameter ''name'' and parameter ''value''.  If a parameter expression contains more than one equals sign, the division is done around the ''first'' (working left to right).  
#Any remaining parameter expressions which do not contain equals signs are assigned as values to the implicit parameters, working left to right.  So the first parameter expression which does not contain an equals sign is assigned as the value of parameter <code>1</code>, the next parameter expression is assigned as the value of parameter <code>2</code>, etc.  
#The wikicode of the template page is analysed and stripped around <code><nowiki><noinclude></nowiki></code>, <code><nowiki><includeonly></nowiki></code> or <code><nowiki><onlyinclude></nowiki></code> tags, if present.
#The template call is replaced by the analysed wikicode, replacing parameters by their values if possible.  
#*Any parameters that do not appear in the analysed wikicode are discarded, and any parameters appearing in the wikicode which have not been assigned a value are replaced by their defaults (if defined) or left as they are.

***/

//{{{
// Ensure that the MediaWikiTemplate Plugin is only installed once.
if(!version.extensions.MediaWikiTemplatePlugin) {
version.extensions.MediaWikiTemplatePlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('MediaWikiTemplatePlugin requires TiddlyWiki 2.1 or later.');}


fnLog = function(text)
{
//	console.log(text.substr(0,60));
};

MediaWikiTemplate = function()
{
	this.stack = [];
	this.error = false;
	this.tiddler = null;
};

MediaWikiTemplate.subWikify = Wikifier.prototype.subWikify;
Wikifier.prototype.subWikify = function(output,terminator)
{
//console.log('aaa');
//console.log
	if(this.formatter.format=='mediawiki') {
		var mwt = new MediaWikiTemplate();
		this.source = mwt.transcludeTemplates(this.source,this.tiddler);
	}
	MediaWikiTemplate.subWikify.apply(this,arguments);
};

MediaWikiTemplate.prototype.normalizeTitle = function(title)
{
	title = title.trim();
	title = title.replace(/_/mg,' ');
	title = title.substr(0,1).toUpperCase() + title.substring(1);
	return title;
};

MediaWikiTemplate.prototype.getTemplateContent = function(name)
{
fnLog('getTemplateContent:'+name);
	name = name.replace(/_/mg,' ');
	name = 'Template:' + name.substr(0,1).toUpperCase() + name.substring(1);
	var tiddler = store.fetchTiddler(name);
	var text = '';
	if(tiddler) {
		text = tiddler.text;
	} else {
		if(config.options.chkMediaWikiDisplayEmptyTemplateLinks) {
			//# for conveniece, output the name of the template so user can click on it and create tiddler
			text = '[['+name+']]';
		}	
	}
	return text;
};

MediaWikiTemplate.prototype.findTemplateTag = function(text,start)
// template tag is openingbrace templatename followed by optional parameter definitions separated by raw pipes closing brace
// !!does not yet handle nested templates, by properly matching {{ and }}
{
fnLog('findTemplateTag:'+text);
	var ret = {start:-1,end:0};
	var tsRe = /\{\{/mg;
	tsRe.lastIndex = start;
	var matchS = tsRe.exec(text);
	if(matchS) {
		var teRe = /\}\}/mg;
		teRe.lastIndex = matchS.index;
		var matchE = teRe.exec(text);
		if(matchE) {
			ret.start = matchS.index;
			ret.end = matchE.index+2;
		}
	}
	return ret;
};

MediaWikiTemplate.prototype.splitTemplateTag = function(tag)
// split template tag at raw pipes into name and parameter definitions
//!! does not yet do raw pipes
{
fnLog('splitTemplateTag:'+tag);
	var pd = []; // parameters definitions array, p[0] contains template name
	tag += '|';
	var i = 0;
	var pRegExp = /([^\|]*)\|/mg;
	pRegExp.lastIndex = 0;
	var match = pRegExp.exec(tag);
	while(match) {
		pd[i] = match[1];
		i++;
		match = pRegExp.exec(tag);
	}
	return pd;
};

MediaWikiTemplate.prototype.expandTemplateContent = function(templateName,params)
//# Expand the template by dealing with <noinclude>, <includeonly> and substituting parameters with their values
//# see http://meta.wikimedia.org/wiki/Help:Template
{
fnLog('expandTemplateContent:'+templateName);
	if(this.stack.indexOf(templateName)!=-1) {
		this.error = true;
		//return 'ERROR: template recursion detected';
		return 'Template loop detected: '+templateName;
	}
	this.stack.push(templateName);

	//# deal with <noinclude>, <includeonly> and <onlyinlcude>
	var text = this.getTemplateContent(templateName);
	text = text.replace(/<noinclude>((?:.|\n)*?)<\/noinclude>/mg,'');// remove text between noinclude tags
	text = text.replace(/<includeonly>/mg,'');
	text = text.replace(/<\/includeonly>/mg,'');
	var onlyIncludeRegExp = /<onlyinclude>((?:.|\n)*?)<\/onlyinclude>/mg;
	var t = '';
	onlyIncludeRegExp.lastIndex = 0;
	var match = onlyIncludeRegExp.exec(text);
	while(match) {
		t += match[1];
		match = onlyIncludeRegExp.exec(text);
	}
	text = t == '' ? text : t;

	//# substitute the parameters
	var paramsRegExp = /\{\{\{(.*?)(?:\|(.*?))?\}\}\}/mg;
	t = '';
	var pi = 0;
	match = paramsRegExp.exec(text);
	while(match) {
//console.log('match');
//console.log(match);
		var name = match[1];
		var val = params[name];
		if(val===undefined) {
			//# use default
			val = match[2];
		}
		if(val===undefined) {
			//# if no value or default, parameter evaluates to name
			//val = '';
			val = '{.{.{'+name+'}}}';
		}
		t += text.substring(pi,match.index) + val;
		pi = paramsRegExp.lastIndex;
		match = paramsRegExp.exec(text);
	}
	t += text.substring(pi);
	return t;
};

MediaWikiTemplate.prototype.expandVariable = function(tag)
{
	var ret = false;
	switch(tag) {
	case 'PAGENAME':
		ret = this.tiddler.title;
		break;
	case 'PAGENAMEE':
		ret = MediaWikiTemplate.normalizedTitle(this.tiddler.title);
		break;
	case 'REVISIONID':
		ret  = this.tiddler.fields['server.revision'];
		break;
	default:
		return ret;
	}
	return ret;
};

//#The #if function is an if-then-else construct. The syntax is:
//#	{{#if: <condition> | <then text> | <else text> }}
//#	{{#if: <condition> | <then text> }}

//#If the condition is an empty string or consists only of whitespace, then it is considered false, and the ''else text'' is returned. Otherwise, the ''then text'' is returned. The ''else text'' may be omitted, in which case the result will be blank if the condition is false.

//#An example:
//#	{{#if| {{{parameter|}}} | Parameter is defined. | Parameter is undefined, or empty}}

//#Note that the {{#if}} function does '''not''' support "=" signs or mathematical expressions.
//#	{{#if|1 = 2 | yes | no}} will return "yes", because the string "1 = 2" is not blank.
//#	It is intended as an ''"if not empty"'' structure.

//# {{#if:{{{param1|}}} | param1value:{{{param1}}} }}
//# include {{testTpf|param1=hello}}
//# becomes:
//# {{#if:hello | param1value:hello }}
//# becomes:
//# param1value:hello

//# include {{testTpf}}
//# becomes:
//# {{#if: | param1value: }}
//# becomes:
//# <nothing>
MediaWikiTemplate.prototype.expandParserFunction = function(fn,params)
{
fnLog('expandParserFunction'+fn);
//#console.log(params);
	var ret = '';
	switch(fn) {
	case '#if':
		ret = params[1].trim()=='' ? params[3] : params[2];
		break;
	default:
		break;
	}
	return ret;
};

MediaWikiTemplate.prototype.expandTemplateTag = function(tag)
{
//console.log('expandTemplateTag'+tag);
	tag = tag.substring(2,tag.length-2);
	var v = this.expandVariable(tag);
	if(v!==false) {
		return v;
	}
	var pd = this.splitTemplateTag(tag);
	var templateName = this.normalizeTitle(pd[0]);
	var s = 1;
	var fnRegExp = /([#a-z]*): +([^\|]*)/mg;
	fnRegExp.lastIndex = 0;
	var match = fnRegExp.exec(templateName);
//#console.log('templateName:'+templateName);
//#console.log(match);
	if(match) {
		// it's a parser function
		s = 0;
		var fnLog = match[1];
		pd[0] = match[2];
	}
	
	var params = [];
	var pRegExp = /(?:([^=]*)=)?([^=]*)/mg;
	var j = 1;
	for(var i = s;i<pd.length;i++) {
		pRegExp.lastIndex = 0;
		match = pRegExp.exec(pd[i]);
		if(match) {
			if(match[1]) {
				var m = match[1].trim();
				//var m = this.transcludeTemplates(match[1]);
				params[m] = match[2].trim();// trim named parameter values
			} else {
				params[j] = match[2];
				j++;
			}
		}
	}
	return fnLog ? this.expandParserFunction(fnLog,params) : this.expandTemplateContent(templateName,params);
};

MediaWikiTemplate.prototype.transcludeTemplates = function(text,tiddler)
{
	this.stack = [];
	this.error = false;
	this.tiddler = tiddler;
	return this.transcludeTemplates2(text);
};

MediaWikiTemplate.prototype.transcludeTemplates2 = function(text)
{
fnLog('transcludeTemplates2:'+text);
	var c = this.findTemplateTag(text,0);
	while(c.start!=-1) {
		var t = this.expandTemplateTag(text.substring(c.start,c.end));
		if(this.error) {
			text = text.substring(0,c.start) + t + text.substring(c.end);
			return text;
		}
		t = this.transcludeTemplates2(t);
		text = text.substring(0,c.start) + t + text.substring(c.end);
		if(this.error)
			return text;
		c = this.findTemplateTag(text,c.start+t.length);
		this.stack = [];
		this.error = false;
	}
	return text;
};

} //# end of 'install only once'
//}}}
