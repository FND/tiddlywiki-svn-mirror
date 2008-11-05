/***
|''Name''|MediaWikiTableFormatterPlugin|
|''Description''|Allows MediaWiki style tables in TiddlyWiki|
|''Author''|Martin Budden (mjbudden (at) gmail (dot) com)|
|''Contributors''|FND|
|''Version''|0.1.2|
|''Status''|stable|
|''Source''|http://devpad.tiddlyspot.com/#MediaWikiTableFormatterPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/formatters/MediaWikiTableFormatterPlugin.js|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.1.0|
!Description
Enables [[MediaWiki|http://www.mediawiki.org]]'s table markup in TiddlyWiki, allowing for multi-line contents within table cells.
!Usage
Detailed documentation available at [[MediaWiki.org|http://www.mediawiki.org/wiki/Help:Tables]].
!!Examples
{{{
{|
! Heading 1
! Heading 2
! Heading 3
|-
| row 1, column 1
| row 1, column 2
| row 1, column 3
|-
| row 2, column 1
| row 2, column 2
| row 2, column 3
|}
}}}
{|
! Heading 1
! Heading 2
! Heading 3
|-
| row 1, column 1
| row 1, column 2
| row 1, column 3
|-
| row 2, column 1
| row 2, column 2
| row 2, column 3
|}
!Revision History
!!v0.1 (2008-10-31)
* initial release
!!v0.1.2 (2008-11-05)
* removed unnecessary code
!Code
***/
//{{{
if(!version.extensions.MediaWikiTableFormatterPlugin) { //# ensure that the plugin is only installed once
version.extensions.MediaWikiTableFormatterPlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 1)) {
	alertAndThrow('MediaWikiTableFormatterPlugin requires TiddlyWiki 2.1 or later.');
}

config.formatters.push({
	name: 'enhancedTable',
	match: '^\\{\\|',
	handler: function(w) {
		var pair = MediaWikiTemplate.findTableBracePair(w.source,w.matchStart);
		if(pair.start==w.matchStart) {
			w.nextMatch = w.matchStart;
			var table = MediaWikiTemplate.createElement(w.output,'table');
			var tbody = MediaWikiTemplate.createElement(table,'tbody'); // required for IE
			var mwt = new MediaWikiTemplate();
			mwt.wikifyTable(tbody,w,pair);
		}
	}
});


MediaWikiTemplate = function()
{
	this.stack = [];
	this.error = false;
	this.tiddler = null;
};

MediaWikiTemplate.createElement = function(parent,element)
{
	return parent.appendChild(document.createElement(element));
}

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
//# find a delimiter that is not enclosed by [[..]]
{
	var d = text.indexOf(delimiter,start);
	if(d==-1)
		return -1;
	var b = {start:-1,end:-1};
	var bs = text.indexOf('[[',start);
	if(bs==-1 || bs >d)
		return d;
	var s1 = -1;
	if(bs!=-1 && bs <d) {
		var be = text.indexOf(']]',bs);
		if(be!=-1) {
			b.start = bs;
			b.end = be;
		}
	}
	if(b.start!=-1 && d>b.start)
		s1 = b.end+2;
	return s1==-1 ? d : MediaWikiTemplate.findRawDelimiter(delimiter,text,s1);
};

MediaWikiTemplate.findTableBracePair = function(text,start)
{
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
		MediaWikiTemplate.setAttributesFromParams(table.parentNode,w.source.substring(w.nextMatch,i));
		w.nextMatch = i;
	}
	w.nextMatch++;
	if(w.source.substr(w.nextMatch,2)=='|+') {
		var caption = MediaWikiTemplate.createElement(table,'caption');
		w.nextMatch += 2;
		i = lineEnd(w);
		var d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
		if(d!=-1 && d<i) {
			MediaWikiTemplate.setAttributesFromParams(caption,w.source.substring(w.nextMatch,d));
			w.nextMatch = d+1;
		}
		w.subWikifyTerm(caption,/(\n)/mg);
	}
	var tr = MediaWikiTemplate.createElement(table,'tr');
	if(w.source.substr(w.nextMatch,2)=='|-') {
		w.nextMatch += 2;
		i = lineEnd(w);
		if(i>w.nextMatch) {
			MediaWikiTemplate.setAttributesFromParams(tr,w.source.substring(w.nextMatch,i));
			w.nextMatch = i;
		}
		w.nextMatch++;
	}
	var x = w.source.substr(w.nextMatch,2);
	while(x!='|}') {
		if(x=='{|') {
			//# nested table
			var pair2 = MediaWikiTemplate.findTableBracePair(w.source,w.nextMatch);
			if(pair2.start==w.nextMatch) {
				var table2 = MediaWikiTemplate.createElement(cell,'table');
				this.wikifyTable(table2,w,pair2);
			}
		} else if(x=='|-') {
			//# new row
			tr = MediaWikiTemplate.createElement(table,'tr');
			w.nextMatch += 2;
			i = lineEnd(w);
			if(i==-1)
				break;
			if(i>w.nextMatch) {
				MediaWikiTemplate.setAttributesFromParams(tr,w.source.substring(w.nextMatch,i));
				w.nextMatch = i;
			}
			w.nextMatch++;
		} else if(x.substr(0,1)=='!') {
			//# header cell
			w.nextMatch++;
			i = lineEnd(w);
			if(i==-1)
				break;
			var cell = MediaWikiTemplate.createElement(tr,'th');
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
				cell = MediaWikiTemplate.createElement(tr,'th');
				c = w.source.indexOf('!!',w.nextMatch);
			}
			d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
			if(d!=-1 && d<i) {
				MediaWikiTemplate.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
				w.nextMatch = d+1;
			}
			while(w.source.substr(w.nextMatch,1)==' ') {
				w.nextMatch++;
			}
			subWikifyText(cell,w,w.source.substring(w.nextMatch,i));
			w.nextMatch = i+1;
		} else if(x.substr(0,1)=='|') {
			//# cell
			w.nextMatch++;
			i = lineEnd(w);
			if(i==-1)
				break;
			cell = MediaWikiTemplate.createElement(tr,'td');
			c = w.source.indexOf('||',w.nextMatch);
			while(c!=-1 && c<i) {
				d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
				if(d!=-1 && d<c) {
					MediaWikiTemplate.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
					w.nextMatch = d+1;
				}
				while(w.source.substr(w.nextMatch,1)==' ') {
					w.nextMatch++;
				}
				w.subWikifyTerm(cell,/(\|\|)/mg);
				cell = MediaWikiTemplate.createElement(tr,'td');
				c = w.source.indexOf('||',w.nextMatch);
			}
			d = MediaWikiTemplate.findRawDelimiter('|',w.source,w.nextMatch);
			if(d!=-1 && d<i) {
				MediaWikiTemplate.setAttributesFromParams(cell,w.source.substring(w.nextMatch,d));
				w.nextMatch = d+1;
			}
			while(w.source.substr(w.nextMatch,1)==' ') {
				w.nextMatch++;
			}
			subWikifyText(cell,w,w.source.substring(w.nextMatch,i));
			w.nextMatch = i+1;
		}
		x = w.source.substr(w.nextMatch,2);
	}
	w.nextMatch = pair.end + 3;
	return;
};

} //# end of 'install only once'
//}}}
