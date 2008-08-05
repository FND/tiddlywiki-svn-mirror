/***
|''Name:''|MediaWikiTemplatePlugin|
|''Description:''|Development plugin for MediaWiki Template expansion|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Version:''|0.1.4|
|''Date:''|Feb 27, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.1|

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
//	if(window.console) console.log(text); else displayMessage(text.substr(0,100));
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
//#fnLog('getTemplateContent:'+name);
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
//#console.log('ret getTemplateContent:'+text);
//#console.log(text);
	return text;
};

MediaWikiTemplate.prototype.substituteParameters = function(text,params)
{
//#console.log('substituteParameters:'+text,params);
//#console.log(params);
	var t = '';
	var pi = 0;
	var bp = MediaWikiTemplate.findTBP(text,pi);
	var paramIndex = 1;
	while(bp.start!=-1) {
//#console.log('bps:'+bp.start);
		var name = text.substring(bp.start+3,bp.end);
		var d = MediaWikiTemplate.findRawDelimiter('|',name,0);
//#console.log(d);
		if(d!=-1) {
			var def = name.substr(d+1);
			name = name.substr(0,d);
//#console.log('name:'+name);
			var np = MediaWikiTemplate.findDBP(name,0);
			while(np.start!=-1) {
				var nx = this._expandTemplateNTag(this.substituteParameters(name.substring(np.start+2,np.end),params));
				name = name.substr(0,np.start) + nx + name.substr(np.end+2);
				np = MediaWikiTemplate.findDBP(name,0);
//#console.log('name2	:'+name);
			}
		}
		//params is [undefined,"param1=aaa"]
		var val = params[name];
		if(val===undefined) {
			//# get parameter by position
			val = params[paramIndex];
		}
		if(val===undefined) {
			//# use default
			val = def;
		}
		if(val===undefined) {
			//# if no value or default, parameter evaluates to name
			val = '{{{'+name+'}}}';
		} else {
			// remove numbered parameters before substitute nested parameters
			var p2 = {};
			for(var i in params) {
				if(isNaN(parseInt(i,10)))
					p2[i] = params[i];
			}
			val = this.substituteParameters(val,p2);
		}
//#console.log('val:'+val);
//#console.log('s:'+text.substring(pi,bp.start));
		t += text.substring(pi,bp.start) + this._transcludeTemplates(val);
		pi = bp.end+3;
		bp = MediaWikiTemplate.findTBP(text,pi);
		paramIndex++;
	}
	t += text.substring(pi);
//#console.log('ret substituteParameters:'+t);
	return t;
};

MediaWikiTemplate.prototype.expandTemplateContent = function(templateName,params)
//# Expand the template by dealing with <noinclude>, <includeonly> and substituting parameters with their values
//# see http://meta.wikimedia.org/wiki/Help:Template
{
//#console.log('expandTemplateContent:'+templateName);
	if(this.stack.indexOf(templateName)!=-1) {
		this.error = true;
		//return 'ERROR: template recursion detected';
		return 'Template loop detected: '+templateName;
	}
	this.stack.push(templateName);

	var text = MediaWikiTemplate.getTemplateContent(templateName);
//#console.log('tcontent:'+text);
//#console.log(params);
	text = this.substituteParameters(text,params);
//fnLog('ret expandTemplateContent'+text);
	return text;
};

MediaWikiTemplate.prototype._expandVariable = function(text)
{
	if(text.length>16)// optimization to avoid switch statement
		return false;
	var ret = false;
	switch(text) {
	case 'BASEPAGENAME':
		ret = this.tiddler.title;
		var i = ret.indexOf(':');
		if(i!=-1)
			ret = ret.substr(i+1);
		break;
	case 'NAMESPACE':
		ret = this.tiddler.title;
		i = ret.indexOf(':');
		ret = i==-1 ? '' : ret.substr(0,i);
		break;
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
		break;
	}
	return ret;
};

MediaWikiTemplate.prototype._expandParserFunction = function(text)
{
	var fnRegExp = /\s*(#?[a-z]+):/mg;
	fnRegExp.lastIndex = 0;
	var match = fnRegExp.exec(text);
	if(!match) {
		return false;
	}
	//# it's a parser function
//#console.log('_expandParserFunction:'+text);
//#console.log(match);
	var ret = false;
	var len = match[0].length;
	var fn = match[1];
//#console.log('fn:'+fn);
	switch(fn.toLowerCase()) {
	case '#if':
		var e = MediaWikiTemplate.findRawDelimiter('|',text,0);
		var p = text.substring(len,e).trim();
//#console.log('e:'+e);
//#console.log('p:'+p+':');
		var lhs = text.substr(e+1);
//#console.log('lhs0:'+lhs+':');
		e = MediaWikiTemplate.findRawDelimiter('|',lhs,0);
//#console.log('e2:'+e);
		if(e==-1) {
			ret = p=='' ? '' : lhs;
		} else {
			var rhs = lhs.substr(e+1);
			lhs = lhs.substr(0,e);
//#console.log('lhs:'+lhs+':');
//#console.log('rhs:'+rhs+':');
			ret = p=='' ? rhs : lhs;
		}
		break;
	default:
		break;
	}
//#console.log('_expandParserFunction ret:'+ret);
	return ret;
};

MediaWikiTemplate.prototype._splitTemplateNTag = function(ntag)
// split naked template tag (ie without {{ and }}) at raw pipes into name and parameter definitions
{
//#fnLog('_splitTemplateNTag:'+ntag);
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
//#console.log('_expandTemplateNTag:'+ntag);
	var ret = this._expandVariable(ntag);
	if(ret!==false) {
		return ret;
	}
	ret = this._expandParserFunction(ntag);
	if(ret!==false) {
		return ret;
	}
	var pd = this._splitTemplateNTag(ntag);
	var templateName = pd[0];
//#console.log('tn:'+templateName);
//#console.log(pd);
	var s = 1;

	var params = {};
	var n = 1;
//#console.log('len:'+pd.length);
//#console.log(pd);
	for(var i = s;i<pd.length;i++) {
		var t = pd[i];
//#console.log('i:'+i);
//#console.log('t:'+t);
		var p = MediaWikiTemplate.findRawDelimiter('=',t,0);
		if(p!=-1) {
			var pnRegExp = /\s*([A-Za-z0-9\-]*)\s*=(.*)/mg;
			pnRegExp.lastIndex = 0;
			match = pnRegExp.exec(t);
//#console.log(match);
			if(match) {
				var name = match[1];
//#console.log('name:'+name);
				var x = parseInt(name,10);
				if(!isNaN(x)) {
//#console.log('x:'+x);
					n = x;
					//t = t.substr(p+1);
					t = match[2];
//#console.log('t2:'+t);
					p = -2;// do not increment parameter number
				}
			} else {
				p = -1;
			}
		}
		if(p==-2) {
			//# numbered parameter
			params[String(n)] = t;
//#console.log('params['+n+']:'+params[n]);
		}else if(p==-1) {
			//# numbered parameter
			params[String(n)] = t;
//#console.log('params['+n+']:'+params[n]);
			n++;
		} else if(name!='0') {//0 sets null parameter
			//# named parameter
			name = this._transcludeTemplates(name);
			var val = t.substr(p+1).trim();// trim named parameter values
			if(val) {
				params[name] = val;
//#console.log('paramsN['+name+']:'+params[name]);
			}
		}
	}
	ret = this.expandTemplateContent(templateName.trim(),params);
	//#var eret = this._expandParserFunction(ret);
	//#if(eret!==false) {
	//#	ret = eret;;
	//#}
//#fnLog('ret _expandTemplateNTag:'+ret);
	return ret;
};

MediaWikiTemplate.prototype._transcludeTemplates = function(text)
{
//#fnLog('_transcludeTemplates:'+text);
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
//#fnLog('_transcludeTemplates ret:'+text);
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

} //# end of 'install only once'