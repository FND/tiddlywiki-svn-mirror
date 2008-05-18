/***
|''Name:''|AccordionMenuPlugin|
|''Description:''|Turn an unordered list into an accordion style menu|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#AccordionMenuPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.1|
|''Date:''|11/29/2007|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.5|
!!Usage:
* put {{{<<accordion>>}}} immediately after your unordered list

!!Examples:
*[[http://tw.lewcid.org/#AccordionMenuPluginDemo]]

***/
// /%
//!BEGIN-PLUGIN-CODE
config.macros.accordion={
	dropchar : " \u00BB",
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		list = findRelated(place.lastChild,"UL","tagName","previousSibling");
		if (!list)
			return;
		addClass(list,"accordion");
		if (params.length){
			addClass(list,paramString);
		}
		this.fixLinks(list.childNodes);		
	},

	fixLinks : function(els){
		for (var i=0; i<els.length; i++){
			if(els[i].tagName.toLowerCase()=="li"){
				var link = findRelated(els[i].firstChild,"A","tagName","nextSibling");
				if(!link){
					var ih = els[i].firstChild.data;
					els[i].removeChild(els[i].firstChild);
					link = createTiddlyElement(null,"a",null,null,ih+this.dropchar,{href:"javascript:;"});
					els[i].insertBefore(link,els[i].firstChild);
				}
				else{
					link.firstChild.data = link.firstChild.data + this.dropchar;
					removeClass(link,"tiddlyLinkNonExisting");
				}
				link.onclick = this.show;
			}
		}
	},
	
	show : function(e){
		var list = this.parentNode.parentNode;
		var els = list.childNodes;
		var open = hasClass(this.parentNode,"accordion-active");
		for (var i=0; i<els.length; i++){
			removeClass(els[i],"accordion-active");
		}
		if(!open)
			addClass(this.parentNode,"accordion-active");
	}	
};

config.shadowTiddlers["StyleSheetAccordionMenuPlugin"] = "/*{{{*/\n"+
	 "ul.accordion, ul.accordion li, ul.accordion li ul  {margin:0; padding:0; list-style-type:none;text-align:left;}\n"+
	 "ul.accordion li ul {display:none;}\n"+
	 "ul.accordion li.accordion-active ul {display:block;}\n"+
	 "\n"+
	 "ul.accordion a {display:block; padding:0.5em;}\n"+
	 "ul.accordion li a.tiddlyLink, ul.accordion li a.tiddlyLinkNonExisting, ul.accordion li a {font-weight:bold;}\n"+
	 "ul.accordion li a {background:#0066aa; color:#FFF; border-bottom:1px solid #fff;}\n"+
	 "ul.accordion li.accordion-active a, ul.accordion li a:hover {background:#00558F;color:#FFF;}\n"+
	 "\n"+
	 "ul.accordion li ul li{display:inline-block;overflow:hidden;}\n"+
	 "ul.accordion li.accordion-active ul li {background:#eff3fa; color:#000; padding:0em;}\n"+
	 "ul.accordion li.accordion-active ul li div {padding:1em 1.5em; background:#eff3fa;}\n"+
	 "ul.accordion li.accordion-active ul a{background:#eff3fa; color:#000; padding:0.5em 0.5em 0.5em 1.0em;border:none;}\n"+
	 "ul.accordion li.accordion-active ul a:hover {background:#e0e8f5; color:#000;}\n" +
	 "/*}}}*/";
 
 store.addNotification("StyleSheetAccordionMenuPlugin",refreshStyles);
 //!END-PLUGIN-CODE
// %/