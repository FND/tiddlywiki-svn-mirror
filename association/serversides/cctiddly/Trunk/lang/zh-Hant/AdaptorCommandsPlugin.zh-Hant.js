/***
|''Name:''|AdaptorCommandsPlugin.zh-Hant|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.1|
|''Date:''|Oct 2, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/

//{{{
merge(config.commands.revisions,{
	text: "修訂版本",
	tooltip: "檢視此文之其他修訂版本",
	loading: "載入中...",
	done: "已取得修訂版本",
	revisionTooltip: "檢視此修訂版",
	popupNone: "無修訂版本",
	revisionTemplate: "%0 - 版本:%1，修訂者:%2",
	dateFormat:"YYYY年0mm月0DD日 0hh:0mm"
	});

merge(config.commands.deleteTiddlerHosted,{
	text: "刪除",
	tooltip: "刪除文章",
	warning: "確定刪除 '%0'?",
	hideReadOnly: true,
	done: "已刪除： "
	});

/*
merge(config.commands.getTiddler,{
	text: "載入",
	tooltip:"載入此 tiddler",
	readOnlyText: "載入",
	readOnlyTooltip: "載入此 tiddler",
	done: "載入完成"
	});


//# putTiddler command definition

merge(config.commands.putTiddler,{
	text: "傳送",
	tooltip: "傳送此 tiddler",
	hideReadOnly: true,
	done: "傳送完成"
	});

merge(config.commands.saveTiddlerAndPut,{
	text: "儲存",
	tooltip: "儲存並傳送此 tiddler",
	hideReadOnly: true,
	done: "完成"
	});

merge(config.commands.saveTiddlerHosted,{
	text: "完成",
	tooltip: "儲存此 tiddler 的異動",
	hideReadOnly: true,
	done: "完成"
	});
*/
//}}}
