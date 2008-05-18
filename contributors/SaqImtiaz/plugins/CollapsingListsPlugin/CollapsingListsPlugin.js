/***
|''Name:''|CollapsingListsPlugin|
|''Description:''|Collapse/expand unordered lists|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#CollapsingListsPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|

!!Usage
* Put {{{<<collapse>>}}} right after the list that you wish to collapse.

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
<<collapse>>
***/
// /%
//!BEGIN-PLUGIN-CODE
config.macros.collapse = { };
config.macros.collapse.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	addClass(place.lastChild,"collapsedlist");
	place.lastChild.onclick = this.onclick;
	var lists = place.lastChild.getElementsByTagName("ul");
	for (var i=0; i<lists.length; i++){
		if (lists[i].parentNode.nodeName.toLowerCase()=="li"){
			var link = createTiddlyElement(null,"a",null,"dynlistlink","[+]");
			link.href = "javascript:;";
			lists[i].parentNode.insertBefore(link,lists[i].parentNode.firstChild);
			addClass(lists[i].parentNode,"listparent");
		}
	}
};

config.macros.collapse.onclick = function(e){
	if (!e) var e = window.event;
	theTarget = resolveTarget(e);
	if (hasClass(theTarget,"dynlistlink")){	
		var sublist = theTarget.parentNode.getElementsByTagName("ul")[0];
		if (sublist){
			sublist.style.display = sublist.style.display == 'block' ? 'none' : 'block';
			theTarget.firstChild.data = sublist.style.display == 'block' ? "[-]" : "[+]";		
		}
	}
	return false;	
};

setStylesheet(
	".viewer .collapsedlist ul{display:none;}\n"+
	".viewer ul.collapsedlist {margin-left:0em;}\n"+
	".collapsedlist li {margin-left:0.8em;}\n"+
	//".collapsedlist li {list-style:none;}\n"+ //hide all list styling 
	"li.listparent {list-style:none}\n"+
	"li.listparent {margin-left:-0.6em;}\n"+
	"a.dynlistlink:hover {background:#DDFFFF none repeat scroll 0%;color:#000;}\n"+
	"a.dynlistlink {color:#000000;font-family:'Courier New',Courier,monospace;font-size:75%;font-weight:bold;text-decoration:none;margin-right:0.2em;}\n","DynamicListStyles");
//!END-PLUGIN-CODE
// %/