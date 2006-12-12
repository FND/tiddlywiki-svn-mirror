/***
|''Name:''|ImportTiddlersPlugin.zh-Hans|
|''Source:''|http://tiddlywiki-zh.googlecode.com/svn/trunk/contributors/BramChen/plugins/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.0.10|
|''Required:''|ImportTiddlersPlugin 3.0.4+|
!!!!!Code
***/
//{{{
if (config.macros.importTiddlers){
	config.macros.importTiddlers.label= "导入文章";
	config.macros.importTiddlers.prompt= "自其他文件导入文章";
	config.macros.importTiddlers.foundMsg= "文件 %1 总计有 %0 篇文章";
	config.macros.importTiddlers.countMsg= "已选择 %0 篇文章导入";
	config.macros.importTiddlers.importedMsg= "自 %2 导入 %0 / %1 篇文章";
	config.macros.loadTiddlers.label = "";
	config.macros.loadTiddlers.prompt= "自 '%0' 加入或更新文章";
	config.macros.loadTiddlers.askMsg= "请输入本机文件路径/档名或远端文件 URL";
	config.macros.loadTiddlers.openMsg= "文件 %0 开启中....";
	config.macros.loadTiddlers.openErrMsg= "无法开启文件：%0 (发生错误原因：%1)";
	config.macros.loadTiddlers.readMsg= "自 %1 读取 %0 bytes";
	config.macros.loadTiddlers.foundMsg= "文件 %1 总计有 %0 篇文章";
	config.macros.loadTiddlers.loadedMsg= "自 %2 导入 %0 / %1 篇文章";

	config.macros.importTiddlers.rp={};
	config.macros.importTiddlers.rp.title="导入文章";
	config.macros.importTiddlers.rp.header = "%1 于 %0，自 \n[[%2|%2]] 导入文章：\n";
	config.macros.importTiddlers.rp.summary = {};
	config.macros.importTiddlers.rp.summary.added = "创建";
	config.macros.importTiddlers.rp.summary.renamed = "更改文章标题 - "; 
	config.macros.importTiddlers.rp.summary.merged = "合并文章 - "; 
	config.macros.importTiddlers.rp.summary.replaces = "文章被取代 - "; 
	config.macros.importTiddlers.rp.summary.skipped = "确认后忽略跳过"; 
	config.macros.importTiddlers.rp.summary.tagged = "加设标签 - ";
	config.macros.importTiddlers.rp.discardReport = "放弃报表";

	var IPTPlingo = [
		{en_US:'import from', zh_Hans:'导入来源：'},
		{en_US:'local file', zh_Hans:'本机文件'},
		{en_US:'web server', zh_Hans:'网页伺服器'},
		{en_US:'create a report', zh_Hans:'产生导入报表'},
		{en_US:'local document path/filename:', zh_Hans:'本机文件路径/档名:'},
		{en_US:'remote document URL:', zh_Hans:'远端文件 URL:'},
		{en_US:'use a proxy script', zh_Hans:'使用代理程式'},
		{en_US:'select:', zh_Hans:'选项:'},
		{en_US:'&nbsp;all&nbsp;', zh_Hans: ' 全选 '},
		{en_US:'&nbsp;added&nbsp;',zh_Hans: ' 新增 '},
		{en_US:'&nbsp;changes&nbsp;',zh_Hans: ' 修改 '},
		{en_US:'&nbsp;differences&nbsp;',zh_Hans: ' 差异 '},
		{en_US:'&nbsp;filter&nbsp;',zh_Hans: '筛选'},
		{en_US:'select all tiddlers', zh_Hans:'选择所有文章'},
		{en_US:'select tiddlers not already in destination document', zh_Hans:'选择目前文件中未存在之文章'},
		{en_US:'select tiddlers that have been updated in source document', zh_Hans:'选择来源文件中已更新之文章'},
		{en_US:'select tiddlers that have been added or are different from existing tiddlers', zh_Hans:'选择新增或与现有文件不同之文章'},
		{en_US:'show/hide selection filter', zh_Hans:'显示/ 隐藏 所筛选'},
		{en_US:'reduce list size', zh_Hans:'减少列表长度'},
		{en_US:'increase list size', zh_Hans:'增加列表长度'},
		{en_US:'maximize/restore list size', zh_Hans:'最大化/还原列表长度'},
		{en_US:'add new tags &nbsp;', zh_Hans:'新增标签 &nbsp;'},
		{en_US:'import source tags &nbsp;', zh_Hans:'导入来源文件之标签 &nbsp;'},
		{en_US:'keep existing tags', zh_Hans:'保留现有标签'},
		{en_US:'value="open"',zh_Hans:'value="开启"'},
		{en_US:'value="import"', zh_Hans:'value="导入"'},
		{en_US:'value="close"', zh_Hans:'value="关闭"'},
		{en_US:'tiddler already exists:', zh_Hans:'文章已存在:'},
		{en_US:'value="skip"', zh_Hans:'value="忽略"'},
		{en_US:'value="rename"', zh_Hans:'value="改名"'},
		{en_US:'value="merge"', zh_Hans:'value="合并"'},
		{en_US:'value="replace"', zh_Hans:'value="取代"'}
	];
	
	for (var i=0; i<IPTPlingo.length; i++){
		config.macros.importTiddlers.html = config.macros.importTiddlers.html.replace(IPTPlingo[i].en_US, IPTPlingo[i].zh_Hans);
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
		rp.status = [];rp.statusText=""
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