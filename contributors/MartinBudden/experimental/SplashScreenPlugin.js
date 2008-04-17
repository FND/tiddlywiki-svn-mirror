/***
|''Name:''|SplashScreenPlugin|
|''Description:''|Provides a splash screen that consists of the rendered default tiddlers|
|''Author:''|Martin Budden|
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/SplashScreenPlugin.js |
|''Version:''|0.0.2|
|''Date:''|April 17, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4|

To make this example into a real TiddlyWiki plugin, you need to:

# Do the actions indicated by the !!TODO comments, namely:
## Write the documentation for the plugin

!!Description
Provides a splash screen that consists of the default tiddlers while TiddlyWiki is loading

!!Usage
!!TODO describe how to use the plugin - how a user should include it in their TiddlyWiki, parameters to the plugin etc

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SplashScreenPlugin) {
version.extensions.SplashScreenPlugin = {installed:true};

//config.macros.splashScreen = {};
//config.macros.splashScreen.init = function()
version.extensions.SplashScreenPlugin.setup = function()
{
	if(store.tiddlerExists("MarkupPostHead"))
		return;

	//# put the splash screen display and color styles in the MarkupPostHead tiddler
	var text = "<!--{{{-->\n\n";
	text += "<style type=\"text/css\">\n";
	text += "#contentWrapper {display:none;}\n";
	text += "#splashScreen {display:block;}\n";

/*
	text += ".title {color:#841;}\n";
	text += ".subtitle {color:#666;}\n";
	text += ".header {background:#04b;}\n";
	text += ".headerShadow {color:#000;}\n";
	text += ".headerShadow a {font-weight:normal; color:#000;}\n";
	text += ".headerForeground {color:#fff;}\n";
	text += ".headerForeground a {font-weight:normal; color:#8cf;}\n";
	text += ".shadow .title {color:#666;}\n";
*/
	text += "body {background:"+store.getTiddlerSlice("ColorPalette","Background")+"; color:"+store.getTiddlerSlice("ColorPalette","Foreground")+";}\n";
	text += "a {color:"+store.getTiddlerSlice("ColorPalette","PrimaryMid")+";}";
	text += "a:hover {background-color:"+store.getTiddlerSlice("ColorPalette","PrimaryMid")+"; color:"+store.getTiddlerSlice("ColorPalette","Background")+";}";

	text += ".title {color:"+store.getTiddlerSlice("ColorPalette","SecondaryDark")+";}\n";
	text += ".subtitle {color:"+store.getTiddlerSlice("ColorPalette","TertiaryDark")+";}\n";
	text += ".header {background:"+store.getTiddlerSlice("ColorPalette","PrimaryMid")+";}\n";
	text += ".headerShadow {color:"+store.getTiddlerSlice("ColorPalette","Foreground")+";}\n";
	text += ".headerShadow a {font-weight:normal; color:"+store.getTiddlerSlice("ColorPalette","Foreground")+";}\n";
	text += ".headerForeground {color:"+store.getTiddlerSlice("ColorPalette","Background")+";}\n";
	text += ".headerForeground a {font-weight:normal; color:"+store.getTiddlerSlice("ColorPalette","PrimaryPale")+";}\n";
	text += ".shadow .title {color:"+store.getTiddlerSlice("ColorPalette","TertiaryDark")+";}\n";

	text += "</style>\n";
	text += "<!--}}}-->\n\n";
	var tiddler = store.createTiddler("MarkupPostHead");
	tiddler.set(tiddler.title,text,config.options.txtUserName);

	//# convert the DefaultTiddlers into HTML and put them in the MarkupPreBody tiddler
	var sitetitle = store.getTiddlerText("SiteTitle");
	var sitesubtitle = store.getTiddlerText("SiteSubtitle");
	var pt = store.getTiddlerText("PageTemplate");
	pt = pt.replace(/<span class='siteTitle' refresh='content' tiddler='SiteTitle'><\/span>/mg,"<span class=\"siteTitle\">"+sitetitle+"</span>");
	pt = pt.replace(/<span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'><\/span>/mg,"<span class=\"siteSubtitle\">"+sitesubtitle+"</span>");
	pt = pt.replace(/<!--\{\{\{-->/mg,"").replace(/<!--\}\}\}-->/mg,"");
	text = "";
	var tiddlers = store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));
	for(var i=0;i<tiddlers.length;i++) {
		tiddler = tiddlers[i];
		var title = tiddler.title;
		var tiddlerElem = createTiddlyElement(null,"div","tempId"+tiddler.title,"tiddler");
		tiddlerElem.style.display = "none";
		tiddlerElem.setAttribute("refresh","tiddler");
		var template = story.chooseTemplateForTiddler(title);
		//#tiddlerElem.setAttribute("tags",tiddler.tags.join(" "));
		tiddlerElem.setAttribute("tiddler",title);
		tiddlerElem.setAttribute("template",template);
		var t = story.getTemplateForTiddler(title,template,tiddler);
		t = t.replace(/<div class=['"]toolbar[^<]*<\/div>/mg,"<div class=\"toolbar\"><br /></div>");
		console.log(t);
		t = t.replace(/<div class=['"]tagging['"][^>]*><\/div>\n/mg,"");
		t = t.replace(/<div class=['"]tagged['"][^>]*><\/div>\n/mg,"");
		console.log(t);
		tiddlerElem.innerHTML = t;
		applyHtmlMacros(tiddlerElem,tiddler);
		text += tiddlerElem.innerHTML;
	}
	text = text.replace(/<!--\{\{\{-->/mg,"").replace(/<!--\}\}\}-->/mg,"");

	var splash = "<!--{{{-->\n\n";
	splash += "<div id=\"splashScreen\">\n";
	splash += pt;
	splash = splash.replace(/<div id='tiddlerDisplay'><\/div>/mg,"<div id=\"s_tiddlerDisplay\">"+text+"</div>");

	splash += "</div>\n";
	splash += "<!--}}}-->\n\n";

	tiddler = store.createTiddler("MarkupPreBody");
	tiddler.set(tiddler.title,splash,config.options.txtUserName);

	store.setDirty(true);
};

version.extensions.SplashScreenPlugin.saveChanges = saveChanges
function saveChanges()
{
	version.extensions.SplashScreenPlugin.setup();
	version.extensions.SplashScreenPlugin.saveChanges();
}

} //# end of 'install only once'
//}}}
