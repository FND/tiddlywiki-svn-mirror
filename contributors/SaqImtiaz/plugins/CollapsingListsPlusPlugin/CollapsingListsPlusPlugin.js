/***
|''Name:''|CollapsingListsPlusPlugin|
|''Description:''|Collapse/expand unordered lists (power user version)|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#CollapsingListsPlusPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|

!!Usage
* Put {{{<<collapseplus>>}}} right after the list that you wish to collapse.
*Control click, to expand/collapse all.

!!Example:
* item1
* item 2
*item 3
**subitem3a
*item 4
** subitem 4a
### number 1
### number 2
** subitem4b
*** sub subitem4b
**subitem4c
***sub subitem4c
**** sub sub subitem 4c
**subitem 4d
<<collapseplus>>

!!Extra Features
(compared to non-plus version)
* Control click to expand/contract all
* entire LI is clickable to expand/contract, not only the +/- buttons.
* limited support for nested numbered lists.
***/
// /%
//!BEGIN-PLUGIN-CODE
config.macros.collapseplus = { };
config.macros.collapseplus.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var container = params[0]? eval(params[0]):place.lastChild; 
	addClass(container,"collapse");
	var lists =this.getLists(container);
	for (var i=0; i<lists.length; i++){
		if (lists[i].parentNode.nodeName.toLowerCase()=="li"){
			var link = createTiddlyElement(null,"a",null,"dynlistlink","[+]");
			link.href = "javascript:;";
			lists[i].parentNode.insertBefore(link,lists[i].parentNode.firstChild);
			addClass(lists[i].parentNode,"listparent");
			addClass(lists[i].parentNode,"dynlistlink");
		}
	}
	container.onclick = this.onclick;
};

config.macros.collapseplus.getLists = function(container)
{
	var lis = container.getElementsByTagName("ul");
	var ols = container.getElementsByTagName("ol");
	var lists =[];
	for (var j=0;j<ols.length;j++){
		lists.push(ols[j]);
	}
	for (var k=0;k<lis.length;k++){
		lists.push(lis[k]);
	}
	return lists;	
};

config.macros.collapseplus.onclick = function(e){
	if (!e) var e = window.event;
	theTarget = resolveTarget(e);
	var container = theTarget.tagName.toLowerCase()=="li" ? theTarget : theTarget.parentNode;
	var link = theTarget.firstChild.tagName && theTarget.firstChild.tagName.toLowerCase() =='a'? theTarget.firstChild.firstChild:theTarget.firstChild;
	if (hasClass(theTarget,"dynlistlink")){	
		if (e.metaKey || e.ctrlKey){
			var collapse = link.data == "[-]"? true: false;
			container= findRelated(container,"collapse","className");
			var lists =config.macros.collapseplus.getLists(container);
			for (var i=0;i<lists.length;i++){
				lists[i].style.display = collapse? "none" : "block";
				lists[i].parentNode.firstChild.firstChild.data = collapse? "[+]" : "[-]";
			}	
		}
		else{
			var sublist = container.getElementsByTagName("ul")[0];
			if (!sublist)
				sublist = container.getElementsByTagName("ol")[0];
			if (sublist){
				sublist.style.display = sublist.style.display == 'block' ? 'none' : 'block';
				link.data = sublist.style.display == 'block' ? "[-]" : "[+]";		
			}
		}
	}
	return false;	
};

setStylesheet(
	".viewer .collapse ul, .viewer .collapse ol{display:none;}\n"+
	".viewer ul.collapse {margin-left:0em;}\n"+
	".collapse li {margin-left:0.8em;}\n"+
	//".collapse li {list-style:none;}\n"+ //hide all list styling 
	"li.listparent {list-style:none}\n"+
	"li.listparent {margin-left:-0.6em;}\n"+
	"a.dynlistlink:hover{background:#DDFFFF none repeat scroll 0%;color:#000;}\n"+
	"li.dynlistlink li{cursor:auto}\n"+
	"a.dynlistlink, li.dynlistlink, li.dynlistlink li.dynlistlink{cursor:pointer;cursor:hand;}\n"+
	"a.dynlistlink{color:#000000;font-family:'Courier New',Courier,monospace;font-size:75%;font-weight:bold;text-decoration:none;margin-right:0.2em;}\n","DynamicListStyles");
//!END-PLUGIN-CODE
// %/