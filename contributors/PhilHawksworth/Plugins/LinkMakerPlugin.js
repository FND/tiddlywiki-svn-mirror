/***
|''Name:''|LinkMakerPlugin|
|''Description:''|Create a tiddlylink pragramtically|
|''Author:''|PhilHawksworth|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PhilHawksworth/plugins/LinkMakerPlugin.js |
|''Version:''|0.0.1|
|''Date:''|Dec 03, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|


Usage:
<<LinkMaker DisplayedText TargetTiddler [className]>>

<<LinkMaker type:'text|image|img' display:'tiddler field|image path' linkto:'href|TiddlerTitle' [title:'title'] [alt:'alt'] [classname:'classname'] >>

***/

//{{{
if(!version.extensions.LinkMakerPlugin) {
version.extensions.LinkMakerPlugin = {installed:true};
	
	config.macros.LinkMaker = {};
	config.macros.LinkMaker.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		
		params = paramString.parseParams("anon",null,true,false,false);
		var linktype = getParam(params,"type",'text');
		var linkto = store.getValue(tiddler,getParam(params,"linkto",""));
		// var title = getParam(params,"title","");
		// var alt = getParam(params,"alt","");
		var display =  store.getValue(tiddler,getParam(params,"display",""));
		var classname = getParam(params,"classname",null);
		var dateformat = getParam(params,'dateformat',null);

		if(dateformat) {
			var handler = config.macros.view.views['date'];
			var fakeParams = [null,null,dateformat];
		}
		
		
		
		if(linktype == 'image' || linktype ==  'img') {
			var a = createTiddlyElement(place,'a',null,classname);
			// a.setAttribute('title',title);
			// a.setAttribute('alt',alt);
			a.setAttribute('href',linkto);
			var i = createTiddlyElement(a,'img');
			i.setAttribute('src',display);
		}
		else if (config.formatterHelpers.isExternalLink(linkto)) {
			var a = createTiddlyElement(place,'a',null,classname,null);
			if (handler)
				handler(display,a,fakeParams);
			else 
				createTiddlyText(a,display);
			// a.setAttribute('title',title);
			// a.setAttribute('alt',alt);
			a.setAttribute('href',linkto);
		}
		else {			
			var e = createTiddlyLink(place,linkto,false,classname);
			if (handler)
				handler(display,e,fakeParams);
			else 
				createTiddlyText(e,display);
		}





	};

} //# end of 'install only once'
//}}}