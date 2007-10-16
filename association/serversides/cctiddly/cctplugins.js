//This file contains all ccTiddly's plugins that would not exist in standalone version
//The plugins were moved from inside the code to an extra js file is because:
//	1/ allow for caching 
//	2/ ease in reading the code and updating
//	3/ load quicker?
//	4/ avoid overwriting functions that are also used by other plugins (such as saveTiddler)

/////////////////////////////////////////////////////////misc config/////////////////////////////////////////////////
/***
!!!Changing the default options
***/
/*config.options.chkHttpReadOnly = false;    //make it HTTP writable by default
config.options.chkSaveBackups = false;    //disable save backup
config.options.chkAutoSave = false;    //disable autosave
config.options.chkUploadStoreArea = false;    //use to define whether to upload storeArea when saveChanges is pressed*/


/////////////////////////////////////////////////////////layout/////////////////////////////////////////////////
//add new option to options panel
//config.shadowTiddlers.OptionsPanel = "<<cctUploadStoreArea>>\n<<cctUploadRSS>>\n<<option chkAutoSave>> "+cctPlugin.lingo.autoUpload+"\n<<option chkRegExpSearch>>"+config.shadowTiddlers.OptionsPanel.substring(config.shadowTiddlers.OptionsPanel.search(/<<option chkRegExpSearch>>/)+26);
//config.shadowTiddlers.OptionsPanel = "<<cctUploadStoreArea>>\n<<cctUploadRSS>>\n<<option chkAutoSave>> "+cctPlugin.lingo.autoUpload+"\n<<option chkRegExpSearch>> RegExpSearch\n<<option chkCaseSensitiveSearch>> CaseSensitiveSearch\n<<option chkAnimate>> EnableAnimations\n\nSee AdvancedOptions";

//add copyright tiddler
//config.shadowTiddlers.PageTemplate = config.shadowTiddlers.PageTemplate.replace(/<div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'><\/div>\n/,"<div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'></div>\n<div id='sidebarCopyright' refresh='content' tiddler='Copyright'></div>\n");
//config.shadowTiddlers.PageTemplate = "<div class='header' macro='gradient vert #18f #04b'>\n<div class='headerShadow'>\n<span class='siteTitle' refresh='content' tiddler='SiteTitle'></span>&nbsp;\n<span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'></span>\n</div>\n<div class='headerForeground'>\n<span class='siteTitle' refresh='content' tiddler='SiteTitle'></span>&nbsp;\n<span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'></span>\n</div>\n</div>\n<div id='mainMenu' refresh='content' tiddler='MainMenu'></div>\n<div id='sidebar'>\n<div id='sidebarOptions' refresh='content' tiddler='SideBarOptions'></div>\n<div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'></div>\n<div id='sidebarCopyright' refresh='content' tiddler='Copyright'></div>\n</div>\n<div id='displayArea'>\n<div id='messageArea'></div>\n<div id='tiddlerDisplay'></div>\n</div>";

//enable privilege to fetch remote file
/*if(window.netscape && window.netscape.security)
		window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");*/
/////////////////////////////////////////////////////////remove isDirty popup dialog/////////////////////////////////////////////////

window.checkUnsavedChanges = function()	{};//ccT save on the fly

window.confirmExit = function()
{
	hadConfirmExit = true;		//assume confirm exit since ccT save "on the fly"
}

/////////////////////////////////////////////////////////change title/////////////////////////////////////////////////
window.cct_main = window.main
window.main = function()
{
	window.cct_main();
	window.cct_tweak();
	refreshPageTemplate('PageTemplate');
	story.forEachTiddler(function(title){story.refreshTiddler(title,DEFAULT_VIEW_TEMPLATE,true);});
	//document.title=(wikifyPlain("SiteTitle") + " - " + wikifyPlain("SiteSubtitle")).htmlEncode();
	document.title=(wikifyPlain("SiteTitle") + " - " + wikifyPlain("SiteSubtitle"));
}

/////////////////////////////////////////////////////////saveChanegs/////////////////////////////////////////////////
window.saveChanges = function ()
{
	clearMessage();
	//var cct_msg = "";
	
	//set delay in saveChanges to allow auto generating RSS/upload store area
	//otherwise it skips generating RSS, possibly because iframe is not ready
	serverside.fn.uploadRSS();
	// Save Rss
	/*if(config.options.chkGenerateAnRssFeed)
	{
		//setTimeout("window.cct_genRss ()",cctPlugin.timeDelay);
		serverside.fn.uploadRSS();
		//cct_msg = cct_msg+config.cctPlugin.lingo.generateRSS+"\n";
	}

	//if( config.options.chkGenerateAnRssFeed===false && config.options.chkUploadStoreArea===false )
	if( config.options.chkGenerateAnRssFeed===false )
	{
		displayMessage(cctPlugin.lingo.checkOption);
	}*/
}

//////////////////////////////////////////////////Reload config file
/***
!!!Reload config file
uncomment it to enable
require variables defined by this time
***/
//window.loadOptionsCookie();
