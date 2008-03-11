/***
|''Name:''|MediaWikiTemplatePlugin|
|''Description:''|Development plugin for MediaWiki Template expansion|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.0.10|
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
//	console.log(text.substr(0,80));
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

MediaWikiTemplate.normalizeTitle = function(title)
{
	title = title.replace(/_/mg,' ');
	title = title.substr(0,1).toUpperCase() + title.substring(1);
	return title;
};

MediaWikiTemplate.getTemplateContent = function(name)
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
	
	name = MediaWikiTemplate.normalizeTitle(name);
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

MediaWikiTemplate.prototype.substituteParameters = function(text,params)
{
fnLog('substituteParameters:'+text);
	var t = '';
	var pi = 0;
	var bp = MediaWikiTemplate.findTBP(text,pi);
	while(bp.start!=-1) {
//#console.log('bps:'+bp.start);
		var name = text.substring(bp.start+3,bp.end);
		var d = MediaWikiTemplate.findRawDelimiter('|',name,0);
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
		t += text.substring(pi,bp.start) + this._transcludeTemplates(val);
		pi = bp.end+3;
		bp = MediaWikiTemplate.findTBP(text,pi);
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

	var text = MediaWikiTemplate.getTemplateContent(templateName);
	text = this.substituteParameters(text,params);
fnLog('ret expandTemplateContent'+text);
	return text;
};

MediaWikiTemplate.prototype._expandVariable = function(text)
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

MediaWikiTemplate.prototype._expandParserFunction = function(fn,params)
{
fnLog('_expandParserFunction:'+fn);
//#console.log(params);
	var ret = '';
	switch(fn.toLowerCase()) {
	case '#if':
		var p = params[1];
		if(p) p = p.trim();
		ret = p=='' ? params[3] : params[2];
		if(!ret) ret = '';
		break;
	default:
		break;
	}
	return ret;
};

MediaWikiTemplate.prototype._splitTemplateNTag = function(ntag)
// split naked template tag (ie without {{ and }}) at raw pipes into name and parameter definitions
{
fnLog('_splitTemplateNTag:'+ntag);
	var pd = []; // parameters definitions array, p[0] contains template name
	var i = 0;
	var s = 0;
	var e = MediaWikiTemplate.findRawDelimiter('|',ntag,s);
	while(e!=-1) {
		pd[i] = ntag.substring(s,e);
		i++;
		s = e+1;
		e = MediaWikiTemplate.findRawDelimiter('|',ntag,s);
	}
	pd[i] = ntag.substring(s);
	return pd;
};

MediaWikiTemplate.prototype._expandTemplateNTag = function(ntag)
{
fnLog('_expandTemplateNTag:'+ntag);
	var v = this._expandVariable(ntag);
	if(v!==false) {
		return v;
	}
	var pd = this._splitTemplateNTag(ntag);
	var templateName = pd[0];
//#console.log('tn'+templateName);
	var s = 1;
	var fnRegExp = /\s*(#?[a-z]+):/mg;
	fnRegExp.lastIndex = 0;
	var match = fnRegExp.exec(templateName);
	if(match) {
//#console.log('fn');
//#console.log(match);
		//# it's a parser function
		var fn = match[1];
		s = MediaWikiTemplate.findRawDelimiter('|',ntag,match.index);
		pd[0] = ntag.substr(s+1);
//#console.log('params:'+pd[0]);
		s = 0;
	}

	var params = [];
	var n = 1;
//#console.log('len:'+pd.length);
	for(var i = s;i<pd.length;i++) {
		var t = pd[i];
//#console.log('i:'+i);
//#console.log('t:'+t);
		var p = MediaWikiTemplate.findRawDelimiter('=',t,0);
		if(p!=-1) {
			var pnRegExp = /[A-Za-z]+[A-Za-z0-9]*=/mg;
			pnRegExp.lastIndex = 0;
			match = pnRegExp.exec(t);
			if(match)
				p = -1;
		}
		if(p==-1) {
			//# numbered parameter
			params[n] = t;
//#console.log('params['+n+']:'+params[n]);
			n++;
		} else if(p!=0) {//p==0 sets null parameter
			//# named parameter
			var name = t.substr(0,p).trim();
			name = this._transcludeTemplates(name);
			params[name] = t.substr(p+1).trim();// trim named parameter values
//#console.log('paramsN['+name+']:'+params[name]);
		}
	}
	var ret = fn ? this._expandParserFunction(fn,params) : this.expandTemplateContent(templateName.trim(),params);
fnLog('ret _expandTemplateNTag:'+ret);
	return ret;
};

MediaWikiTemplate.prototype._transcludeTemplates = function(text)
{
fnLog('_transcludeTemplates:'+text);
	if(!text)
		return text;
	var c = MediaWikiTemplate.findDBP(text,0);
	while(c.start!=-1) {
		var t = this._expandTemplateNTag(text.substring(c.start+2,c.end));
		if(this.error) {
			text = text.substring(0,c.start) + t + text.substring(c.end+2);
			return text;
		}
		t = this._transcludeTemplates(t);
		text = text.substring(0,c.start) + t + text.substring(c.end+2);
		if(this.error)
			return text;
		c = MediaWikiTemplate.findDBP(text,c.start+t.length);
		this.stack = [];
		this.error = false;
	}
fnLog('ret:'+text);
	return text;
};

MediaWikiTemplate.prototype.transcludeTemplates = function(text,tiddler)
{
	this.stack = [];
	this.error = false;
	this.tiddler = tiddler;
	if(tiddler.title.indexOf('Template:')==0)
		return text;
	return this._transcludeTemplates(text);
};

MediaWikiTemplate.findRawDelimiter = function(delimiter,text,start)
{
fnLog('findRawDelimiter:'+text.substr(start,50));
	var e = text.indexOf(delimiter,start);
	if(e==-1)
		return -1;
	var b = {start:-1,end:-1};
	var bs = text.indexOf('[[',start);
	var bi = text.indexOf('{{',start);
	if((bi==-1 || bi > e) && (bs==-1 || bs >e))
		return e;
	var s1 = -1;
	if(bs!=-1 && bs <e) {
		var be = text.indexOf(']]',bs);
		if(be!=-1) {
			b.start = bs;
			b.end = be;
		}
	}
//#console.log('frd('+e+','+bs+','+be+')');
	if(b.end!=-1 && e>b.start && e<=b.end)
		s1 = b.end+2;
	var db = MediaWikiTemplate.findDBP(text,start);
	if(db.end!=-1 && e>db.start && e<=db.end) {
		if(db.end+2>s1)
			s1 = db.end+2;
	}
	var tb = MediaWikiTemplate.findTBP(text,start);
	if(tb.end!=-1 && e>tb.start && e<=tb.end) {
		if(tb.end+3>s1)
			s1 = tb.end+3;
	}
	return s1==-1 ? e : MediaWikiTemplate.findRawDelimiter(delimiter,text,s1);
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
//	dbrTest('{{ {{{a}}} b }} {{c}}',0,0,13);
MediaWikiTemplate.findDBP = function(text,start)
// findDoubleBracePair
{
fnLog('findDBP:'+start+' t:'+text);
	var ret = {start:-1,end:-1};
	var s = text.indexOf('{{',start);
	if(s==-1)
		return ret;
	if(text.substr(s+2,1)!='{') {
		//# only two braces
		var e = text.indexOf('}}',s+2);
//#console.log('db:'+db.start+' ,'+db.end);
//#console.log('tb:'+tb.start+' ,'+tb.end);
//#console.log('e:'+e);
		if(e==-1)
			return ret;
		var s2 = text.indexOf('{{',s+2);
		if(s2==-1 || s2 > e)
			return {start:s,end:e};
		var db = MediaWikiTemplate.findDBP(text,s+2);
		var tb = MediaWikiTemplate.findTBP(text,s+2);
		while((db.end!=-1 && e>db.start && e<=db.end) || (tb.end!=-1 && e>tb.start && e<=tb.end)) {
			//# intervening double or triple brace pair, so skip over
			if(db.end!=-1 && e>db.start && e<=db.end) {
				var e2 = db.end+2;
				if(tb.end!=-1 && e>tb.start && e<=tb.end) {
					if(tb.end>db.end)
						e2 = tb.end+3;
				}
				e = e2;
			} else {
				e = tb.end+3;
			}
			db = MediaWikiTemplate.findDBP(text,e);
			tb = MediaWikiTemplate.findTBP(text,e);
			e = text.indexOf('}}',e);
//#console.log('db:'+db.start+' ,'+db.end);
//#console.log('tb:'+tb.start+' ,'+tb.end);
//#console.log('e:'+e);
			if(e==-1)
				return ret;
		}
		return {start:s,end:e};
	}
	//# more than two braces, so count them
	var c = 2;
	while(text.substr(s+c,1)=='{') {
		c++;
	}
	if(c==3) {
		//# it's a triple brace, so skip over it
		tb = MediaWikiTemplate.findTBP(text,s);
//#console.log('s:'+s+' t:'+text);
//#console.log('tb:'+tb.start+' ,'+tb.end);
		return tb.end==-1 ? ret : MediaWikiTemplate.findDBP(text,tb.end+3);
	} else if(c==4) {
		//# it's a quadrupal brace, so see if it is matched (eg {{{{x}}}} ) or not (eg {{{{x}} }} )
		db = MediaWikiTemplate.findDBP(text,s+2);
		if(db.end==-1)
			return ret;
		if(text.substr(db.end+2,2)=='}}') {
			//# it's matched, so skip over 
			//# {{{{foo}}}} is equivalent to { {{{foo}}} }
			return MediaWikiTemplate.findDBP(text,db.end+4);
		} else {
			//# it's not matched
			//# {{{{foo}} }} is equivalent to {{ {{foo}} }}
			e = text.indexOf('}}',db.end+2);
			return e==-1 ? ret : {start:s,end:e};
		}
	} else if(c==5) {
		//# it's a quintupal brace, so see if it is matched (eg {{{{{x}}}}} ) or not (eg {{{{{x}} }}} or {{{{{x}}} }})
		//# {{{{{foo}}}}} is equivalent to {{ {{{foo}}} }}.
		db = MediaWikiTemplate.findDBP(text,s+3);
		if(db.end==-1)
			return ret;
		if(text.substr(db.end+2,3)=='}}}') {
			// it's matched
			return {start:s,end:db.end+3};
		} else if(text.substr(db.end+2,1)!='}') {
			// it's not matched
			// {{{{{x}} }}}
			return {start:s+3,end:db.end};
		} else {
			// }}} }}
			e = text.indexOf('}}',db.end+3);
			return e==-1 ? ret : {start:s,end:e};
		}
	} else {
		//# presume treat six braces as two sets of {{{, so skip
		return MediaWikiTemplate.findDBP(text,s+6);
	}
};

MediaWikiTemplate.findTBP = function(text,start)
// findTripleBracePair
{
fnLog('findTBP:'+start+' t:'+text);
	var ret = {start:-1,end:-1};
	var s = text.indexOf('{{{',start);
	if(s==-1)
		return ret;
	if(text.substr(s+3,1)!='{' || text.substr(s+3,3)=='{{{') {
		//# only three braces, or 6 braces
		var e = text.indexOf('}}}',s+3);
		if(e==-1)
			return ret;
		var s2 = text.indexOf('{{',s+2);
		if(s2==-1 || s2 > e)
			return {start:s,end:e};
		var db = MediaWikiTemplate.findDBP(text,s+3);
		var tb = MediaWikiTemplate.findTBP(text,s+3);
		while((db.end!=-1 && e>db.start && e<=db.end) || (tb.end!=-1 && e>tb.start && e<=tb.end)) {
			//# intervening double or triple brace pair, so skip over
			if(db.end!=-1 && e>db.start && e<=db.end) {
				var e2 = db.end+2;
				if(tb.end!=-1 && e>tb.start && e<=tb.end) {
					if(tb.end>db.end)
						e2 = tb.end+3;
				}
				e = e2;
			} else {
				e = tb.end+3;
			}
			db = MediaWikiTemplate.findDBP(text,e);
			tb = MediaWikiTemplate.findTBP(text,e);
			e = text.indexOf('}}}',e);
			if(e==-1)
				return ret;
		}
		return {start:s,end:e};
	}
	//# more than three braces, so count them
	var c = 3;
	while(text.substr(s+c,1)=='{') {
		c++;
	}
	if(c==4) {
		//# it's a quadrupal brace, so see if it is matched (eg {{{{x}}}} ) or not (eg {{{{x}} }} )
		tb = MediaWikiTemplate.findTBP(text,s+1);
		if(tb.end==-1)
			return ret;
		if(text.substr(tb.end+1,1)=='}') {
			//# it's matched 
			//# {{{{foo}}}} is equivalent to { {{{foo}}} }
			return {start:s+1,end:tb.end};
		} else {
			//# it's not matched, so skip
			//# {{{{foo}} }} is equivalent to {{ {{foo}} }}
			return MediaWikiTemplate.findTBP(text,tb.end+4);
		}
	} else if(c==5) {
		//# it's a quintupal brace, so see if it is matched (eg {{{{{x}}}}} ) or not (eg {{{{{x}} }}} or {{{{{x}}} }})
		//# {{{{{foo}}}}} is equivalent to {{ {{{foo}}} }}.
		db = MediaWikiTemplate.findDBP(text,s+3);
		if(db.end==-1)
			return ret;
		if(text.substr(db.end+2,3)=='}}}') {
			//# it's matched
			return {start:s+2,end:db.end};
		} else if(text.substr(db.end+2,1)!='}') {
			//# it's not matched
			//# {{{{{x}} }}}
			e = text.indexOf('}}}',db.end+2);
			return e==-1 ? ret : {start:s,end:e};
		} else {
			//# {{{{{{x}}} }}
			return {start:s+2,end:db.end};
		}
	}
};

MediaWikiTemplate.findTableBracePair = function(text,start)
{
fnLog('findTableBracePair:'+start+' t:'+text);
	var ret = {start:-1,end:-1};
	var s = text.indexOf('{|',start);
	if(s==-1)
		return ret;
	var e = text.indexOf('\n|}',s+2);
	if(e==-1)
		return ret;
	e++;
	var s2 = text.indexOf('{|',s+2);
	if(s2==-1 || s2 > e)
		return {start:s,end:e};
	var tp = MediaWikiTemplate.findTableBracePair(text,s+2);
	while(tp.end!=-1 && e>tp.start && e<=tp.end) {
		//# intervening table brace pair, so skip over
		e = tp.end+2;
		tp = MediaWikiTemplate.findTableBracePair(text,e);
		e = text.indexOf('\n|}',e);
		if(e==-1)
			return ret;
		e++;
	}
	return {start:s,end:e};
};

MediaWikiTemplate.prototype.wikifyTable = function(table,w,pair)
{
console.log('wikifyTable');
console.log(w);
	function lineEnd(w) {
		var r = w.source.indexOf('\n',w.nextMatch);
		while(r!=-1) {
			var n = w.source.substr(r+1,1);
			if(n=='|' || n=='!' || (n=='{' && w.source.substr(r+2,1)=='|'))
				break;
			r = w.source.indexOf('\n',r+1);
		}
		return r;
	}
	function subWikifyText(e,w,text) {
			var oldSource = w.source; var oldMatch = w.nextMatch;
			w.source = text; w.nextMatch = 0;
			w.subWikifyUnterm(e);
			w.source = oldSource; w.nextMatch = oldMatch;
	}		
	//# skip over {|
	w.nextMatch += 2;
	var i = lineEnd(w);
	if(i>w.nextMatch) {
//#console.log('attribs');
		MediaWikiFormatter.setAttributesFromParams(table,w.source.substring(w.nextMatch,i));
		w.nextMatch = i;
	}
	w.nextMatch++;
	if(w.source.substr(w.nextMatch,2)=='|+') {
//#console.log('caption');
		var caption = createTiddlyElement2(table,'caption');
		w.nextMatch += 2;
		i = lineEnd(w);
		var d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
		if(d!=-1 && d<i) {
			MediaWikiFormatter.setAttributesFromParams(caption,w.source.substring(w.nextMatch,d));
			w.nextMatch = d+1;
		}
		w.subWikifyTerm(caption,/(\n)/mg);
	}
	var tr = createTiddlyElement2(table,'tr');
//#console.log('x1:'+w.source.substr(w.nextMatch,10));
	if(w.source.substr(w.nextMatch,2)=='|-') {
		w.nextMatch += 3;
	}
//#console.log('x2:'+w.source.substr(w.nextMatch,10));
	var x = w.source.substr(w.nextMatch,2);
	while(x!='|}') {
		if(x=='{|') {
			//# nested table
			var pair2 = MediaWikiTemplate.findTableBracePair(w.source,w.nextMatch);
			if(pair2.start==w.nextMatch) {
				var table2 = createTiddlyElement2(cell,'table');
				this.wikifyTable(table2,w,pair2);
			}
		} else if(x=='|-') {
			//# new row
			tr = createTiddlyElement2(table,'tr');
//#console.log('xr:'+w.source.substr(w.nextMatch,40));
			w.nextMatch += 2;
			i = lineEnd(w);
			if(i==-1)
				break;
			if(i>w.nextMatch) {
				MediaWikiFormatter.setAttributesFromParams(table,w.source.substring(w.nextMatch,i));
				w.nextMatch = i;
			}
			w.nextMatch++;
		} else if(x.substr(0,1)=='!') {
			//# header cell
			w.nextMatch++;
//#console.log('xh:'+w.source.substr(w.nextMatch,40));
			i = lineEnd(w);
//#console.log('xi:'+w.source.substring(w.nextMatch,i));
			if(i==-1)
				break;
			var cell = createTiddlyElement2(tr,'th');
			var c = w.source.indexOf('!!',w.nextMatch);
			while(c!=-1 && c<i) {
				d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
				if(d!=-1 && d<c) {
					MediaWikiFormatter.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
					w.nextMatch = d+1;
				}
				while(w.source.substr(w.nextMatch,1)==' ') {
					w.nextMatch++;
				}
				w.subWikifyTerm(cell,/(\!\!)/mg);
				cell = createTiddlyElement2(tr,'th');
				c = w.source.indexOf('!!',w.nextMatch);
			}
			d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
			if(d!=-1 && d<i) {
				MediaWikiFormatter.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
				w.nextMatch = d+1;
			}
//#console.log('xk:'+w.source.substr(w.nextMatch,i));
			while(w.source.substr(w.nextMatch,1)==' ') {
				w.nextMatch++;
			}
			subWikifyText(cell,w,w.source.substring(w.nextMatch,i))
			w.nextMatch = i+1;
			//w.subWikifyTerm(cell,/(\n)/mg);
		} else if(x.substr(0,1)=='|') {
			//# cell
			w.nextMatch++;
//#console.log('xc:'+w.source.substr(w.nextMatch,40));
			i = lineEnd(w);
			if(i==-1)
				break;
			cell = createTiddlyElement2(tr,'td');
			c = w.source.indexOf('||',w.nextMatch);
	//#console.log('i:'+i);
			while(c!=-1 && c<i) {
				d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
	//#console.log('c1:'+c);
	//#console.log('d1:'+d+'('+w.nextMatch+','+i+')');
				if(d!=-1 && d<c) {
					MediaWikiFormatter.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
					w.nextMatch = d+1;
				}
				while(w.source.substr(w.nextMatch,1)==' ') {
					w.nextMatch++;
				}
				w.subWikifyTerm(cell,/(\|\|)/mg);
				cell = createTiddlyElement2(tr,'td');
				c = w.source.indexOf('||',w.nextMatch);
			}
			d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
	//#console.log('d2:'+d+'('+w.nextMatch+','+i+')');
			if(d!=-1 && d<i) {
				MediaWikiFormatter.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
				w.nextMatch = d+1;
			}
			while(w.source.substr(w.nextMatch,1)==' ') {
				w.nextMatch++;
			}
			subWikifyText(cell,w,w.source.substring(w.nextMatch,i))
			w.nextMatch = i+1;
			//w.subWikifyTerm(cell,/(\n)/mg);
		}
		x = w.source.substr(w.nextMatch,2);
	}
	w.nextMatch = pair.end + 3;
	return;
	
};

} //# end of 'install only once'
//}}}
