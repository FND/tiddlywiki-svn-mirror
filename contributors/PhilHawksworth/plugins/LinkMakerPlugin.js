/***
|''Name:''|LinkMakerPlugin|
|''Description:''|Create a link from a Template, accessing a tiddlers properties|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/LinkMakerPlugin.js |
|''Version:''|0.0.3|
|''Date:''|Feb 29, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.3|


Usage:

<<LinkMaker type:'text|image|img' display:'tiddler field|image path' linkto:'href|TiddlerTitle' [classname:'classname'] [tooltip:'tooltip']>>

***/

//{{{
if(!version.extensions.LinkMakerPlugin) {
version.extensions.LinkMakerPlugin = {installed:true};
	
	config.macros.LinkMaker = {};
	config.macros.LinkMaker.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		
		params = paramString.parseParams("anon",null,true,false,false);
		var linktype = getParam(params,"type",'text');
		var linkto = store.getValue(tiddler,getParam(params,"linkto",null));
		var display =  store.getValue(tiddler,getParam(params,"display",""));
		var classname = getParam(params,"classname",null);
		var dateformat = getParam(params,'dateformat',null);
		var tip = getParam(params,'tooltip',null);
		var tooltip = tip ? store.getValue(tiddler, tip) : null;

		if(dateformat) {
			var handler = config.macros.view.views['date'];
			var fakeParams = [null,null,dateformat];
		}
		
		if(linktype == 'image' || linktype ==  'img') {
			
			if(linkto) {
				var a = createTiddlyElement(place,'a',null,null);
				a.setAttribute('href',linkto);
				a.setAttribute('target',"_blank");
				var i = createTiddlyElement(a,'img');
				i.setAttribute('src',display);
			}
		}
		
		else if (linkto && config.formatterHelpers.isExternalLink(linkto)) {
			var a = createTiddlyElement(place,'a',null,classname,null);
			if (handler)
				handler(display,a,fakeParams);
			else 
				createTiddlyText(a,display);
			a.setAttribute('href',linkto);
			a.setAttribute('target',"_blank");
			if(tooltip){
				a.setAttribute('title', tooltip);				
			}
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