/***
|''Name:''|MediaWikiTableFormatterPlugin|
|''Description:''|Allows Tiddlers to use [[MediaWiki|http://meta.wikimedia.org/wiki/Help:Wikitext]] ([[WikiPedia|http://meta.wikipedia.org/]]) text formatting|
|''Author:''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/MediaWikiTableFormatterPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Jul 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.1.0|

***/

//{{{
// Ensure that the MediaWikiTableFormatter Plugin is only installed once.
if(!version.extensions.MediaWikiTableFormatterPlugin) {
version.extensions.MediaWikiTableFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1))
	{alertAndThrow('MediaWikiTableFormatterPlugin requires TiddlyWiki 2.1 or later.');}

if(config.options.chkDisplayInstrumentation == undefined)
	{config.options.chkDisplayInstrumentation = false;}

function createTiddlyElement2(parent,element)
{
	return parent.appendChild(document.createElement(element));
}


var tableEntry = {
	name: 'enhancedTable',
	match: '^\\{\\|',
	handler: function(w)
	{
		var pair = MediaWikiTemplate.findTableBracePair(w.source,w.matchStart);
		if(pair.start==w.matchStart) {
			w.nextMatch = w.matchStart;
			var table = createTiddlyElement2(w.output,'table');
			var tbody = createTiddlyElement2(table,'tbody');// needed for IE
			var mwt = new MediaWikiTemplate();
			mwt.wikifyTable(tbody,w,pair);
		}
	}
}
config.formatters.push(tableEntry);

MediaWikiTemplate = function()
{
	this.stack = [];
	this.error = false;
	this.tiddler = null;
};

MediaWikiTemplate.setAttributesFromParams = function(e,p)
{
	var re = /\s*(.*?)=(?:(?:"(.*?)")|(?:'(.*?)')|((?:\w|%|#)*))/mg;
	var match = re.exec(p);
	while(match) {
		var s = match[1].unDash();
		if(s == 'bgcolor') {
			s = 'backgroundColor';
		}
		try {
			if(match[2]) {
				e.setAttribute(s,match[2]);
			} else if(match[3]) {
				e.setAttribute(s,match[3]);
			} else {
				e.setAttribute(s,match[4]);
			}
		}
		catch(ex) {}
		match = re.exec(p);
	}
};


MediaWikiTemplate.findRawDelimiter = function(delimiter,text,start)
{
//# {{!}} {{|}}
//#fnLog('findRawDelimiter:'+text.substr(start,50));
	var d = text.indexOf(delimiter,start);
	if(d==-1)
		return -1;
	var b = {start:-1,end:-1};
	var bs = text.indexOf('[[',start);
	var bi = text.indexOf('{{',start);
	if((bi==-1 || bi > d) && (bs==-1 || bs >d))
		return d;
	var s1 = -1;
	if(bs!=-1 && bs <d) {
		var be = text.indexOf(']]',bs);
		if(be!=-1) {
			b.start = bs;
			b.end = be;
		}
	}
//#console.log('frd('+d+','+bs+','+be+')');
	if(b.start!=-1 && d>b.start)
		s1 = b.end+2;
	var db = MediaWikiTemplate.findDBP(text,start);
//#console.log('frd('+d+','+db.start+','+db.end+')');
	if(db.end!=-1 && d>db.start) {
		if(db.end+2>s1)
			s1 = db.end+2;
	}
	var tb = MediaWikiTemplate.findTBP(text,start);
	if(tb.end!=-1 && d>tb.start) {
		if(tb.end+3>s1)
			s1 = tb.end+3;
	}
	return s1==-1 ? d : MediaWikiTemplate.findRawDelimiter(delimiter,text,s1);
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
MediaWikiTemplate.findDBP = function(text,start,end)
// findDoubleBracePair
{
//#console.log('findDBP:'+start+' t:'+text);
	var ret = {start:-1,end:-1};
	var s = text.indexOf('{{',start);
	if(s==-1) {
		return ret;
	}
	if(end && s>end)
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
		var si = s+2;
		var db = MediaWikiTemplate.findDBP(text,si,e);
		var tb = MediaWikiTemplate.findTBP(text,si,e);
		while((db.end!=-1 && e>db.start && e<=db.end) || (tb.end!=-1 && e>tb.start && e<=tb.end)) {
			//# intervening double or triple brace pair, so skip over
			if(db.end!=-1 && e>db.start && e<=db.end) {
				var si = db.end+2;
				if(tb.end!=-1 && e>tb.start && e<=tb.end) {
					if(tb.end>db.end)
						si = tb.end+3;
				}
			} else {
				si = tb.end+3;
			}			
			e = text.indexOf('}}',si);
			db = MediaWikiTemplate.findDBP(text,si,e);
			tb = MediaWikiTemplate.findTBP(text,si,e);
			if(e==-1) {
				return ret;
			}
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
		//tb = MediaWikiTemplate.findTBP(text,s);
//#console.log('s:'+s+' t:'+text);
//#console.log('tb:'+tb.start+' ,'+tb.end);
		//return tb.end==-1 ? ret : MediaWikiTemplate.findDBP(text,tb.end+3);
		return MediaWikiTemplate.findDBP(text,s+3)
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

MediaWikiTemplate.findTBP = function(text,start,end)
// findTripleBracePair
{
//#fnLog('findTBP:'+start+' t:'+text);
	var ret = {start:-1,end:-1};
	var s = text.indexOf('{{{',start);
	if(s==-1)
		return ret;
	if(end && s>end)
		return ret;
	if(text.substr(s+3,1)!='{' || text.substr(s+3,3)=='{{{') {
		//# only three braces, or 6 braces
		var si = s+3;
		var e = text.indexOf('}}}',si);
		if(e==-1)
			return ret;
		var s2 = text.indexOf('{{',si);
		if(s2==-1 || s2 > e)
			return {start:s,end:e};
		var db = MediaWikiTemplate.findDBP(text,si,e);
		var tb = MediaWikiTemplate.findTBP(text,si,e);
//	console.log('t:'+text.substr(s,100));
		while((db.end!=-1 && e>=db.end) || (tb.end!=-1 && e>=tb.end)) {
			//# intervening double or triple brace pair, so skip over
			if(db.end!=-1 && e>=db.end) {
				si = db.end+2;
				if(tb.end!=-1 && e>=tb.end) {
					if(tb.end>=db.end)
						si = tb.end+3;
				}
			} else {
				si = tb.end+3;
			}
			db = MediaWikiTemplate.findDBP(text,si,e);
			tb = MediaWikiTemplate.findTBP(text,si,e);
			e = text.indexOf('}}}',si);
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
//#fnLog('findTableBracePair:'+start+' t:'+text);
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
//#console.log('wikifyTable');
//#console.log(w);
//#console.log(w.source);
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
		MediaWikiTemplate.setAttributesFromParams(table,w.source.substring(w.nextMatch,i));
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
			MediaWikiTemplate.setAttributesFromParams(caption,w.source.substring(w.nextMatch,d));
			w.nextMatch = d+1;
		}
		w.subWikifyTerm(caption,/(\n)/mg);
	}
	var tr = createTiddlyElement2(table,'tr');
//#console.log('x1:'+w.source.substr(w.nextMatch,10));
	if(w.source.substr(w.nextMatch,2)=='|-') {
		w.nextMatch += 2;
		i = lineEnd(w);
		//if(i==-1)
		//	break;
		if(i>w.nextMatch) {
			MediaWikiTemplate.setAttributesFromParams(table,w.source.substring(w.nextMatch,i));
			w.nextMatch = i;
		}
		w.nextMatch++;
	}
//#console.log('x2:'+w.source.substr(w.nextMatch,10));
	var x = w.source.substr(w.nextMatch,2);
//#console.log('xw:'+x);
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
				MediaWikiTemplate.setAttributesFromParams(table,w.source.substring(w.nextMatch,i));
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
					MediaWikiTemplate.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
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
				MediaWikiTemplate.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
				w.nextMatch = d+1;
			}
//#console.log('xk:'+w.source.substr(w.nextMatch,i));
			while(w.source.substr(w.nextMatch,1)==' ') {
				w.nextMatch++;
			}
			subWikifyText(cell,w,w.source.substring(w.nextMatch,i));
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
					MediaWikiTemplate.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
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
				MediaWikiTemplate.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
				w.nextMatch = d+1;
			}
			while(w.source.substr(w.nextMatch,1)==' ') {
				w.nextMatch++;
			}
			subWikifyText(cell,w,w.source.substring(w.nextMatch,i));
			w.nextMatch = i+1;
			//w.subWikifyTerm(cell,/(\n)/mg);
		} else {
		}
		x = w.source.substr(w.nextMatch,2);
//#console.log('xw2:'+x);
	}
	w.nextMatch = pair.end + 3;
	return;
	
};

} //# end of 'install only once'
//}}}
