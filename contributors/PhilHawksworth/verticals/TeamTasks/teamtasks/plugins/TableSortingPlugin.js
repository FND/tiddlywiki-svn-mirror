/***
|''Name:''|TableSortingPlugin|
|''Description:''|Dynamically sort tables by clicking on column headers|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#TableSortingPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.02|
|''Date:''|25-01-2008|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|
!!Usage:
* Make sure your table has a header row
** {{{|Name|Phone Number|Address|h}}}<br> Note the /h/ that denote a header row 
* Give the table a class of 'sortable'
** {{{
|sortable|k
|Name|Phone Number|Address|h
}}}<br>Note the /k/ that denotes a class name being assigned to the table.
* To disallow sorting by a column, place {{{<<nosort>>}}} in it's header
* To automatically sort a table by a column, place {{{<<autosort>>}}} in the header for that column
** Or to sort automatically but in reverse order, use {{{<<autosort reverse>>}}}

!!Example:
|sortable|k
|Name |Salary |Extension |Performance |File Size |Start date |h
|ZBloggs, Fred |$12000.00 |1353 |+1.2 |74.2Kb |Aug 19, 2003 21:34:00 |
|ABloggs, Fred |$12000.00 |1353 |1.2 |3350b |09/18/2003 |
|CBloggs, Fred |$12000 |1353 |1.200 |55.2Kb |August 18, 2003 |
|DBloggs, Fred |$12000.00 |1353 |1.2 |2100b |07/18/2003 |
|Bloggs, Fred |$12000.00 |1353 |01.20 |6.156Mb |08/17/2003 05:43 |
|Turvey, Kevin |$191200.00 |2342 |-33 |1b |02/05/1979 |
|Mbogo, Arnold |$32010.12 |2755 |-21.673 |1.2Gb |09/08/1998 |
|Shakespeare, Bill |£122000.00|3211 |6 |33.22Gb |12/11/1961 |
|Shakespeare, Hamlet |£9000 |9005 |-8 |3Gb |01/01/2002 |
|Fitz, Marvin |€3300.30 |5554 |+5 |4Kb |05/22/1995 |

***/
// /%
//!BEGIN-PLUGIN-CODE
config.tableSorting = {
	
	darrow: "\u2193",
	
	uarrow: "\u2191",
	
	getText : function (o) {
		var p = o.cells[SORT_INDEX];
		return p.innerText || p.textContent || '';
	},
	
	sortTable : function (o,rev) {
		SORT_INDEX = o.getAttribute("index");
		var c = config.tableSorting;
		var T = findRelated(o.parentNode,"TABLE");
		if(T.tBodies[0].rows.length<=1) 
			return;
		var itm = "";
		var i = 0;
		while (itm == "" && i < T.tBodies[0].rows.length) {
			itm = c.getText(T.tBodies[0].rows[i]).trim();
			i++;
		}
		if (itm == "") 
			return; 	
		var r = [];
		var S = o.getElementsByTagName("span")[0];		
		c.fn = c.sortAlpha; 
		if(!isNaN(Date.parse(itm)))
			c.fn = c.sortDate; 
		else if(itm.match(/^[$|£|€|\+|\-]{0,1}\d*\.{0,1}\d+$/)) 
			c.fn = c.sortNumber; 
		else if(itm.match(/^\d*\.{0,1}\d+[K|M|G]{0,1}b$/)) 
			c.fn = c.sortFile; 
		for(i=0; i<T.tBodies[0].rows.length; i++) {
			 r[i]=T.tBodies[0].rows[i]; 
		} 
		r.sort(c.reSort);
		if(S.firstChild.nodeValue==c.darrow || rev) {
			r.reverse();
			S.firstChild.nodeValue=c.uarrow;
		} 
		else 
			S.firstChild.nodeValue=c.darrow;
		var thead = T.getElementsByTagName('thead')[0]; 
		var headers = thead.rows[thead.rows.length-1].cells;
		for(var k=0; k<headers.length; k++) {
			if(!hasClass(headers[k],"nosort"))
				addClass(headers[k].getElementsByTagName("span")[0],"hidden");
		}
		removeClass(S,"hidden");
		for(i=0; i<r.length; i++) { 
			T.tBodies[0].appendChild(r[i]);
			c.stripe(r[i],i);
			for(var j=0; j<r[i].cells.length;j++){
				removeClass(r[i].cells[j],"sortedCol");
			}
			addClass(r[i].cells[SORT_INDEX],"sortedCol");
		}
	},
	
	stripe : function (e,i){
		var cl = ["oddRow","evenRow"];
		i&1? cl.reverse() : cl;
		removeClass(e,cl[1]);
		addClass(e,cl[0]);
	},
	
	sortNumber : function(v) {
		var x = parseFloat(this.getText(v).replace(/[^0-9.-]/g,''));
		return isNaN(x)? 0: x;
	},
	
	sortDate : function(v) {
		return Date.parse(this.getText(v));
	},

	sortAlpha : function(v) {
		return this.getText(v).toLowerCase();
	},
	
	sortFile : function(v) { 		
		var j, q = config.messages.sizeTemplates, s = this.getText(v);
		for (var i=0; i<q.length; i++) {
			if ((j = s.toLowerCase().indexOf(q[i].template.replace("%0\u00a0","").toLowerCase())) != -1)
				return q[i].unit * s.substr(0,j);
		}
		return parseFloat(s);
	},
	
	reSort : function(a,b){
		var c = config.tableSorting;
		var aa = c.fn(a);
		var bb = c.fn(b);
		return ((aa==bb)? 0 : ((aa<bb)? -1:1));
	}
};

Story.prototype.tSort_refreshTiddler = Story.prototype.refreshTiddler;
Story.prototype.refreshTiddler = function(title,template,force,customFields,defaultText){
	var elem = this.tSort_refreshTiddler.apply(this,arguments);
	if(elem){
		var tables = elem.getElementsByTagName("TABLE");
		var c = config.tableSorting;
		for(var i=0; i<tables.length; i++){
			if(hasClass(tables[i],"sortable")){
				var x = null, rev, table = tables[i], thead = table.getElementsByTagName('thead')[0], headers = thead.rows[thead.rows.length-1].cells;
				for (var j=0; j<headers.length; j++){
					var h = headers[j];
					if (hasClass(h,"nosort"))
						continue;
					h.setAttribute("index",j);
					h.onclick = function(){c.sortTable(this); return false;};
					h.ondblclick = stopEvent;
					if(h.getElementsByTagName("span").length == 0)
						createTiddlyElement(h,"span",null,"hidden",c.uarrow); 
					if(!x && hasClass(h,"autosort")) {
						x = j;
						rev = hasClass(h,"reverse");
					}
				}
				if(x)
					c.sortTable(headers[x],rev);		
			}
		}
	}
	return elem; 
};

setStylesheet("table.sortable span.hidden {visibility:hidden;}\n"+
	"table.sortable thead {cursor:pointer;}\n"+
	"table.sortable .nosort {cursor:default;}\n"+
	"table.sortable td.sortedCol {background:#ffc;}","TableSortingPluginStyles");

function stopEvent(e){
	var ev = e? e : window.event;
	ev.cancelBubble = true;
	if (ev.stopPropagation) ev.stopPropagation();
	return false;	
}	

config.macros.nosort={
	handler : function(place){
		addClass(place,"nosort");
	}	
};

config.macros.autosort={
	handler : function(place,m,p,w,pS){
		addClass(place,"autosort"+" "+pS);		
	}	
};
//!END-PLUGIN-CODE
// %/