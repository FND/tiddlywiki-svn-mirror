/***
|''Name:''|LinkMakerPlugin|
|''Description:''|Create a link from a Template, accessing a tiddlers properties|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/LinkMakerPlugin.js |
|''Version:''|0.1|
|''Date:''|Feb 29, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|

Usage:

<<LinkMaker type:'text|image|img' display:'tiddler field|image path' linkto:'href|TiddlerTitle' [classname:'classname'] [tooltip:'tooltip'] [rel:'relvalue']>>

***/

//{{{
if(!version.extensions.LinkMakerPlugin) {
version.extensions.LinkMakerPlugin = {installed:true};
	
	config.macros.LinkMaker = {};
	config.macros.LinkMaker.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		
		params = paramString.parseParams("anon",null,true,false,false);
		var linktype = getParam(params,"type",'text');
		var display =  store.getValue(tiddler,getParam(params,"display",""));
		var classname = getParam(params,'classname',null);
		var dateformat = getParam(params,'dateformat',null);
		var rel = getParam(params,'rel',null);
		var linkto = getParam(params,"linkto",null);
		linkto = linkto ? store.getValue(tiddler, linkto) : null;
		var tip = getParam(params,'tooltip',null);
		var tooltip = tip ? store.getValue(tiddler, tip) : null;

		if(dateformat) {
			var handler = config.macros.view.views['date'];
			var fakeParams = [null,null,dateformat];
		}

		function createAnchor() {
			var a = createTiddlyElement(place,'a',null,null);
			a.setAttribute('href',linkto);
			a.setAttribute('target',"_blank");
			if(classname){
				a.setAttribute('class',classname);
			}
			if(tooltip){
				a.setAttribute('title',tooltip);				
			}
			if(rel){
				a.setAttribute('rel',rel);				
			}
			return a;
		}
		
		if(linktype == 'image' || linktype == 'img') {
			var a = place;
			if(linkto) {
				a = createAnchor();
			}
			var i = createTiddlyElement(a,'img');
			i.setAttribute('src',display);
			if(classname){
				i.setAttribute('class',classname);
			}
		}
		
		else if (linkto && config.formatterHelpers.isExternalLink(linkto)) {
			var a = createAnchor();
			if (handler)
				handler(display,a,fakeParams);
			else 
				createTiddlyText(a,display);
		}
		else if (linkto) {			
			var e = createTiddlyLink(place,linkto,false,classname);
			if (handler)
				handler(display,e,fakeParams);
			else 
				createTiddlyText(e,display);
		}
		else {
			createTiddlyText(place,display);
		}
	};

} //# end of 'install only once'
//}}}
