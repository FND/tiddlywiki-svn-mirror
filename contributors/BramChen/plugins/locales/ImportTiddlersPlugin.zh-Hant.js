/***
|''Name:''|ImportTiddlersPlugin.zh-Hant|
|''Source:''|http://tiddlywiki-zh.googlecode.com/svn/trunk/contributors/BramChen/plugins/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.0.10|
|''Required:''|ImportTiddlersPlugin 3.0.4+|
!!!!!Code
***/
//{{{

if (config.macros.importTiddlers){
	config.macros.importTiddlers.label= "匯入文章";
	config.macros.importTiddlers.prompt= "自其他文件匯入文章";
	config.macros.importTiddlers.foundMsg= "文件 %1 總計有 %0 篇文章";
	config.macros.importTiddlers.countMsg= "已選擇 %0 篇文章匯入";
	config.macros.importTiddlers.importedMsg= "自 %2 匯入 %0 / %1 篇文章";
	config.macros.loadTiddlers.label = "";
	config.macros.loadTiddlers.prompt= "自 '%0' 加入或更新文章";
	config.macros.loadTiddlers.askMsg= "請輸入本機文件路徑/檔名或遠端文件 URL";
	config.macros.loadTiddlers.openMsg= "文件 %0 開啟中....";
	config.macros.loadTiddlers.openErrMsg= "無法開啟文件：%0 (發生錯誤原因：%1)";
	config.macros.loadTiddlers.readMsg= "自 %1 讀取 %0 bytes";
	config.macros.loadTiddlers.foundMsg= "文件 %1 總計有 %0 篇文章";
	config.macros.loadTiddlers.loadedMsg= "自 %2 匯入 %0 / %1 篇文章";

	config.macros.importTiddlers.rp={};
	config.macros.importTiddlers.rp.title="匯入文章";
	config.macros.importTiddlers.rp.header = "%1 於 %0，自 \n[[%2|%2]] 匯入文章：\n";
	config.macros.importTiddlers.rp.summary = {};
	config.macros.importTiddlers.rp.summary.added = "新增";
	config.macros.importTiddlers.rp.summary.renamed = "更改文章標題 - "; 
	config.macros.importTiddlers.rp.summary.merged = "合併文章 - "; 
	config.macros.importTiddlers.rp.summary.replaces = "文章被取代 - "; 
	config.macros.importTiddlers.rp.summary.skipped = "確認後忽略跳過"; 
	config.macros.importTiddlers.rp.summary.tagged = "加設標籤 - ";
	config.macros.importTiddlers.rp.discardReport = "放棄報表";

	var IPTPlingo = [
		{en_US:'import from', zh_Hant:'匯入來源：'},
		{en_US:'local file', zh_Hant:'本機文件'},
		{en_US:'web server', zh_Hant:'網頁伺服器'},
		{en_US:'create a report', zh_Hant:'產生匯入報表'},
		{en_US:'local document path/filename:', zh_Hant:'本機文件路徑/檔名:'},
		{en_US:'remote document URL:', zh_Hant:'遠端文件 URL:'},
		{en_US:'use a proxy script', zh_Hant:'使用代理程式'},
		{en_US:'select:', zh_Hant:'選項:'},
		{en_US:'&nbsp;all&nbsp;', zh_Hant: ' 全選 '},
		{en_US:'&nbsp;added&nbsp;',zh_Hant: ' 新增 '},
		{en_US:'&nbsp;changes&nbsp;',zh_Hant: ' 修改 '},
		{en_US:'&nbsp;differences&nbsp;',zh_Hant: ' 差異 '},
		{en_US:'&nbsp;filter&nbsp;',zh_Hant: '篩選'},
		{en_US:'select all tiddlers', zh_Hant:'選擇所有文章'},
		{en_US:'select tiddlers not already in destination document', zh_Hant:'選擇目前文件中未存在之文章'},
		{en_US:'select tiddlers that have been updated in source document', zh_Hant:'選擇來源文件中已更新之文章'},
		{en_US:'select tiddlers that have been added or are different from existing tiddlers', zh_Hant:'選擇新增或與現有文件不同之文章'},
		{en_US:'show/hide selection filter', zh_Hant:'顯示/ 隱藏 所篩選'},
		{en_US:'reduce list size', zh_Hant:'減少列表長度'},
		{en_US:'increase list size', zh_Hant:'增加列表長度'},
		{en_US:'maximize/restore list size', zh_Hant:'最大化/還原列表長度'},
		{en_US:'add new tags &nbsp;', zh_Hant:'新增標籤 &nbsp;'},
		{en_US:'import source tags &nbsp;', zh_Hant:'匯入來源文件之標籤 &nbsp;'},
		{en_US:'keep existing tags', zh_Hant:'保留現有標籤'},
		{en_US:'value="open"',zh_Hant:'value="開啟"'},
		{en_US:'value="import"', zh_Hant:'value="匯入"'},
		{en_US:'value="close"', zh_Hant:'value="關閉"'},
		{en_US:'tiddler already exists:', zh_Hant:'文章已存在:'},
		{en_US:'value="skip"', zh_Hant:'value="忽略"'},
		{en_US:'value="rename"', zh_Hant:'value="改名"'},
		{en_US:'value="merge"', zh_Hant:'value="合併"'},
		{en_US:'value="replace"', zh_Hant:'value="取代"'}
	];
	
	for (var i=0; i<IPTPlingo.length; i++){
		config.macros.importTiddlers.html = config.macros.importTiddlers.html.replace(IPTPlingo[i].en_US, IPTPlingo[i].zh_Hant);
	}
	IPTPlingo=[];
}
//}}}
/***
!Tweaks for importReport
***/
// // ''REPORT GENERATOR''
//{{{
function importReport(quiet)
{
	if (!config.macros.importTiddlers.inbound) return;
	// DEBUG alert('importReport: start');

	// if import was not completed, the collision panel will still be open... close it now.
	var panel=document.getElementById('importCollisionPanel'); if (panel) panel.style.display='none';

	// get the alphasorted list of tiddlers
	var tiddlers = config.macros.importTiddlers.inbound;
	// gather the statistics
	var count=0;
	for (var t=0; t<tiddlers.length; t++)
		if (tiddlers[t].status && tiddlers[t].status.trim().length && tiddlers[t].status.substr(0,7)!="skipped") count++;

	// generate a report
	if (count && config.options.chkImportReport) {
		// get/create the report tiddler
		var rp = config.macros.importTiddlers.rp;
		var theReport = store.getTiddler(rp.title);

		if (!theReport) { theReport= new Tiddler(); theReport.title = rp.title; theReport.text  = ""; }
		// format the report content
		var now = new Date();
		var newText = rp.header.format([now.toLocaleString(),config.options.txtUserName,config.macros.importTiddlers.src])
		if (config.macros.importTiddlers.addTags && config.macros.importTiddlers.newTags.trim().length)
			newText += rp.summary.tagged + config.macros.importTiddlers.newTags + "\n";
		newText += "<<<\n";
//		for (var t=0; t<tiddlers.length; t++) if (tiddlers[t].status) newText += "#[["+tiddlers[t].title+"]] - "+tiddlers[t].status+"\n";
		rp.status = [];
		for (var t=0; t<tiddlers.length; t++) 
			if (tiddlers[t].status) {
				rp.status = tiddlers[t].status.split(" ");
				newText += "#[["+tiddlers[t].title+"]] - " + rp.summary[rp.status[0]] + ((rp.status[0] == "skipped")?"":tiddlers[t].status.replace(rp.status [0],""))+"\n";
			}
		newText += "<<<\n";
// 20060918 ELS: DON'T ADD "discard" BUTTON TO REPORT
//		newText += "<html><input type=\"button\" href=\"javascript:;\" ";
//		newText += "onclick=\"story.closeTiddler('"+theReport.title+"'); store.deleteTiddler('"+theReport.title+"');\" ";
//		newText += "value=\"discard report\"></html>";
		// update the ImportedTiddlers content and show the tiddler
		theReport.text	 = newText+((theReport.text!="")?'\n----\n':"")+theReport.text;
		theReport.modifier = config.options.txtUserName;
		theReport.modified = new Date();
		// OLD: store.addTiddler(theReport);

                store.saveTiddler(theReport.title, theReport.title, theReport.text, theReport.modifier, theReport.modified, theReport.tags);
		if (!quiet) { story.displayTiddler(null,theReport.title,1,null,null,false); story.refreshTiddler(theReport.title,1,true); }
	}

	// reset status flags
	for (var t=0; t<config.macros.importTiddlers.inbound.length; t++) config.macros.importTiddlers.inbound[t].status="";

	// refresh display if tiddlers have been loaded
	if (count) { store.setDirty(true);  store.notifyAll(); }

	// always show final message when tiddlers were actually loaded
	if (count) displayMessage(config.macros.importTiddlers.importedMsg.format([count,tiddlers.length,config.macros.importTiddlers.src]));
}
//}}}