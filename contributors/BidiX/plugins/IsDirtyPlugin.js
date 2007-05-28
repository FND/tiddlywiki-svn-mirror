/***
|''Name:''|IsDirtyPlugin|
|''Description:''|When the TiddlyWiki needs to be saved the tiddler named IsDirty contains ' * ' else it is empty. IsDirty tiddler is also appended in front of the browser page title.<br>Hint: Put it in front of your SiteTitle in your PageTemplate or in your MainMenu as an indicator.<br>For now IsDirty: <<tiddler IsDirty>>|
|''Version:''|1.0.2|
|''Date:''|Apr 30, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#IsDirtyPlugin|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0|
***/
//{{{
version.extensions.IsDirtyPlugin = {
	major: 1, minor: 0, revision: 2, 
	date: new Date("Apr 30, 2007"),
	source: 'http://tiddlywiki.bidix.info/#IsDirtyPlugin',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	coreVersion: '2.2.0'
};

if (!window.bidix) window.bidix = {}; // bidix namespace
if (!bidix.core) bidix.core = {};
bidix.setDirty = TiddlyWiki.prototype.setDirty;
bidix.initIsDirty = function()
{
	var tags = "excludeLists excludeSearch";
	var tiddler = store.getTiddler("IsDirty");
	if (!tiddler) {
		tiddler = new Tiddler("IsDirty");
		//tiddler.set(title,text,modifier,modified,tags,created,fields)
		tiddler.set(null,null,null,null,tags,null,null);
		store.addTiddler(tiddler);
	}
	tiddler.set(null,"",null,null,null,null,null);
	return tiddler;
};

TiddlyWiki.prototype.setDirty = function(dirty)
{
	var indic = " * ";
	var oldDirty = this.isDirty ();
	bidix.setDirty.apply(this,arguments);
	var tiddler = bidix.initIsDirty();
	if (dirty)
		tiddler.set(null,indic,null,null,null,null,null);
	else
		tiddler.set(null," ",null,null,null,null,null);
	story.refreshTiddler(tiddler.title);
	store.notify(tiddler.title, true);	
	refreshPageTitle();
};

bidix.refreshPageTitle = function()
{
	document.title = wikifyPlain("IsDirty") + getPageTitle();
};

bidix.core.refreshPageTitle = refreshPageTitle ;
refreshPageTitle  = bidix.refreshPageTitle;
bidix.initIsDirty();
//}}}