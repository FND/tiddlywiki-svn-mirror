/***
|''Name:''|MediaWikiTemplatePlugin|
|''Description:''|Development plugin for MediaWiki Template expansion|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.0.6|
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
	if(this.formatter.format=='mediawiki') {
		var mwt = new MediaWikiTemplate();
		this.source = mwt.transcludeTemplates(this.source,this.tiddler);
	}
	MediaWikiTemplate.subWikify.apply(this,arguments);
};

MediaWikiTemplate.prototype.normalizeTitle = function(title)
{
	title = title.replace(/_/mg,' ');
	title = title.substr(0,1).toUpperCase() + title.substring(1);
	return title;
};

MediaWikiTemplate.prototype.getTemplateContent = function(name)
{
fnLog('getTemplateContent:'+name);
	var i = name.indexOf(':');
	var namespace = 'Template:';
	if(i==0) {
		name = name.substr(1);
		namespace = '';
	} else if(i!=-1) {
		namespace = '';
	}
	i = name.indexOf('#');
	if(i!=-1) {
		name = name.substr(0,i);
	}
	
	name = this.normalizeTitle(name);
	var tiddler = store.fetchTiddler(namespace+name);
	var text = '';
	if(tiddler) {
		text = tiddler.text;
		//# deal with <noinclude>, <includeonly> and <onlyinlcude>
		if(text.indexOf('<')==-1)
			return text; // optimization to avoid regular expression matching
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
	} else {
		text = namespace + name;
		if(config.options.chkMediaWikiDisplayEmptyTemplateLinks) {
			//# for conveniece, output the name of the template so user can click on it and create tiddler
			text = '[['+text+']]';
		}
	}
fnLog('ret getTemplateContent:'+text);
	return text;
};

/*
* Matched sets of four consecutive braces are interpreted as a parameter surrounded by single braces:
	{{{{foo}}}} is equivalent to { {{{foo}}} }.
* Unmatched sets of four braces are interpreted as nested template calls:
	{{{{TEx1}} }} is parsed as a call to a template, the name of which is dependent on the output of TEx1.
In this example, {{{{TEx1}} }} results in Template:Hello world!, as the Hello world! template does not exist.
* Matched sets of five consecutive braces are interpreted as a template call surrounding a parameter:
	{{{{{foo}}}}} is equivalent to {{ {{{foo}}} }}.
* Unmatched sets of five braces are interpreted using the standard rules:
	{{{{{TEx1}} }}} is interpreted as a named parameter with the name dependent on the result of Template:TEx1,
	which in this case is equivalent to {{{Hello world!}}}.
*/
MediaWikiTemplate.prototype.findTripleBracePair = function(text,start)
{
fnLog('findTripleBracePair:'+text+' s:'+start);
//console.log('text:'+text);
//console.log('start:'+start);
	var ret = {start:-1,end:0};
	var s = text.indexOf('{{{',start);
//console.log('s:'+s);
	if(s!=-1) {
		var s2 = text.indexOf('{{{',s+3);
		var e = text.indexOf('}}}',s+3);
//console.log('e:'+e);
		var innerD = this.findDoubleBracePair(text,s+3);
		while(innerD.start!=-1 && innerD.end!=-1 && innerD.start<e && innerD.end<=e) {
			e = text.indexOf('}}}',innerD.end+2);
//console.log('eX:'+e);
			innerD = this.findDoubleBracePair(text,innerD.end+2);
		}
//console.log('s2:'+s2);
//console.log('e:'+e);
		if(e==-1)
			return ret;
		if(s2==-1 || e<s2)
			return {start:s,end:e};
		var innerT = this.findTripleBracePair(text,s+3);
		if(innerT.start==-1)
			return ret;
//console.log('inT:'+innerT.start+','+innerT.end);
		var e2 = text.indexOf('}}}',innerT.end+3);
//console.log('e2:'+e2);
		innerD = this.findDoubleBracePair(text,s+3);
		while(innerD.start!=-1 && innerD.end!=-1 && innerD.start<e2 && innerD.end<=e2) {
			e2 = text.indexOf('}}}',innerD.end+2);
			innerD = this.findDoubleBracePair(text,innerD.end+2);
		}
		/*if(text.substr(s2,6)=='{{{{{{') {
			var inner = this.findTripleBracePair(text,s+3);
			if(inner.start==-1)
				return ret;
			var e2 = text.indexOf('}}}',inner.end+3);
		} else {
			inner = this.findDoubleBracePair(text,s+2);
			if(inner.start==-1)
				return ret;
			e2 = text.indexOf('}}',inner.end+2);
		}*/
		if(e2!=-1)
			return {start:s,end:e2};
	}
	return ret;
};

MediaWikiTemplate.prototype.findDoubleBracePair = function(text,start)
// {{{{x}}}} is interpreted as { {{{x}}}}
{
fnLog('findDoubleBracePair:'+text+' s:'+start);
	var ret = {start:-1,end:0};
	var s = text.indexOf('{{',start);
//console.log('s:'+s);
	while(s!=-1 && text.substr(s+2,1)=='{') { // && text.substr(s+3,1)!='{') {// if tripe brace and not quadrupal brace
		var tb = this.findTripleBracePair(text,s);
		if(tb.start==-1 || tb.end==-1)
			return ret;
		s = text.indexOf('{{',tb.end);
	}
//console.log('s:'+s);
	if(s!=-1) {
		var s2 = text.indexOf('{{',s+2);
		while(s2!=-1 && text.substr(s2+2,1)=='{') {// && text.substr(s+3,1)!='{') {
			tb = this.findTripleBracePair(text,s+2);
			if(tb.start==-1 || tb.end==-1)
				return ret;
			s2 = text.indexOf('{{',tb.end);
		}
//console.log('s2:'+s2);
		var e = text.indexOf('}}',s+2);
//console.log('e:'+e);
		if(e==-1)
			return ret;
		if(s2==-1 || e<s2)
			return {start:s,end:e};
		
		var inner = this.findDoubleBracePair(text,s2);
//console.log('is:'+inner.start+'ie:'+inner.end);
		if(inner.start==-1)
			return ret;
		var e2 = text.indexOf('}}',inner.end+2);
//console.log('e2:'+e2);
		if(e2==-1)
			return ret;
		return {start:s,end:e2};
	}
	return ret;
};

MediaWikiTemplate.prototype.findRawDelimiter = function(delimiter,text,start)
{
//fnLog('findRawDelimiter:'+text);
	var s = text.indexOf(delimiter,start);
	if(s==-1)
		return -1;
	var s2 = text.indexOf('[[',start);
	if(s2!=-1 && s2 <s) {
		var be = text.indexOf(']]',s2);
		if(be!=-1)
			return this.findRawDelimiter(delimiter,text,be);
	}
	var bp = this.findDoubleBracePair(text,start);
	if(bp.start!=-1 && bp.start <s) {
		if(bp.end!=-1)
			return this.findRawDelimiter(delimiter,text,bp.end);
	}
	return s;
};

MediaWikiTemplate.prototype.splitTemplateNTag = function(ntag)
// split template tag at raw pipes into name and parameter definitions
{
fnLog('splitTemplateNTag:'+ntag);
	var pd = []; // parameters definitions array, p[0] contains template name
	var i = 0;
	var s = 0;
	var e = this.findRawDelimiter('|',ntag,s);
	while(e!=-1) {
		pd[i] = ntag.substring(s,e);
		i++;
		s = e+1;
		e = this.findRawDelimiter('|',ntag,s);
	}
	pd[i] = ntag.substring(s);
	return pd;
};

MediaWikiTemplate.prototype.substituteParameters = function(text,params)
{
fnLog('substituteParameters:'+text);
	var t = '';
	var pi = 0;
	var bp = this.findTripleBracePair(text,pi);
	while(bp.start!=-1) {
//#console.log('bps:'+bp.start);
		var name = text.substring(bp.start+3,bp.end);
		var d = this.findRawDelimiter('|',name,0);
//#console.log('name:'+name);
//#console.log(d);
		if(d!=-1) {
			var def = name.substr(d+1);
			name = name.substr(0,d);
		}
		var val = params[name];
		if(val===undefined) {
			//# use default
			val = def;
		}
		if(val===undefined) {
			//# if no value or default, parameter evaluates to name
			val = '{{{'+name+'}}}';
		} else {
			val = this.substituteParameters(val,params);
		}
		t += text.substring(pi,bp.start) + this.transcludeTemplates2(val);
		pi = bp.end+3;
		bp = this.findTripleBracePair(text,pi);
	}
	t += text.substring(pi);
fnLog('ret substituteParameters:'+t);
	return t;
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

	var text = this.getTemplateContent(templateName);
	text = this.substituteParameters(text,params);
fnLog('ret expandTemplateContent'+text);
	return text;
};

MediaWikiTemplate.prototype.expandVariable = function(text)
{
	if(text.length>16)// optimization to avoid switch statement
		return false;
	var ret = false;
	switch(text) {
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

MediaWikiTemplate.prototype.expandParserFunction = function(fn,params)
{
fnLog('expandParserFunction'+fn);
//console.log(params);
	var ret = '';
	switch(fn.toLowerCase()) {
	case '#if':
		ret = params[1].trim()=='' ? params[3] : params[2];
		if(!ret) ret = '';
		break;
	default:
		break;
	}
	return ret;
};

MediaWikiTemplate.prototype.expandTemplateNTag = function(ntag)
{
fnLog('expandTemplateNTag:'+ntag);
	var v = this.expandVariable(ntag);
	if(v!==false) {
		return v;
	}
	var pd = this.splitTemplateNTag(ntag);
	var templateName = pd[0];
	var s = 1;
	var fnRegExp = /([#a-z]*): +([^\|]*)/mg;
	fnRegExp.lastIndex = 0;
	var match = fnRegExp.exec(templateName);
	if(match) {
		// it's a parser function
		s = 0;
		var fn = match[1];
		pd[0] = match[2];
	}

	var params = [];
	var n = 1;
	for(var i = s;i<pd.length;i++) {
		var t = pd[i];
		var p = this.findRawDelimiter('=',t,0);
		if(p==-1) {
			// numbered parameter
			params[n] = t;
			n++;
		} else if(p!=0) {//p==0 sets null parameter
			// named parameter
			var name = t.substr(0,p).trim();
			name = this.transcludeTemplates2(name);
			params[name] = t.substr(p+1).trim();// trim named parameter values
		}
	}
	var ret = fn ? this.expandParserFunction(fn,params) : this.expandTemplateContent(templateName.trim(),params);
fnLog('ret expandTemplateNTag:'+ret);
	return ret;
};

MediaWikiTemplate.prototype.transcludeTemplates = function(text,tiddler)
{
	this.stack = [];
	this.error = false;
	this.tiddler = tiddler;
	if(tiddler.title.indexOf('Template:')==0)
		return text;
	return this.transcludeTemplates2(text);
};

MediaWikiTemplate.prototype.transcludeTemplates2 = function(text)
{
fnLog('transcludeTemplates2:'+text);
	if(!text)
		return text;
	var c = this.findDoubleBracePair(text,0);
	while(c.start!=-1) {
		var t = this.expandTemplateNTag(text.substring(c.start+2,c.end));
		if(this.error) {
			text = text.substring(0,c.start) + t + text.substring(c.end+2);
			return text;
		}
		t = this.transcludeTemplates2(t);
		text = text.substring(0,c.start) + t + text.substring(c.end+2);
		if(this.error)
			return text;
		c = this.findDoubleBracePair(text,c.start+t.length);
		this.stack = [];
		this.error = false;
	}
fnLog('ret:'+text);
	return text;
};

} //# end of 'install only once'
//}}}
