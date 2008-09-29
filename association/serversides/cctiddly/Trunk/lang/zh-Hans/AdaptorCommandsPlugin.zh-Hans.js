/***
|''Name:''|AdaptorCommandsPlugin.zh-Hans|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.1|
|''Date:''|Sep 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/

//{{{
merge(config.commands.revisions,{
	text: "修订版本",
	tooltip: "检视此文之其他修订版本",
	loading: "载入中...",
	done: "已取得修订版本",
	revisionTooltip: "检视此修订版",
	popupNone: "无修订版本",
	revisionTemplate: "%0 - 版本:%1，修订者:%2",
	dateFormat:"YYYY年0mmm月0DD日 0hh:0mm"
	});

merge(config.commands.deleteTiddlerHosted,{
	text: "删除",
	tooltip: "删除文章",
	warning: "确定删除 '%0'?",
	hideReadOnly: true,
	done: "完成"
	});

/*
merge(config.commands.getTiddler,{
	text: "载入",
	tooltip:"载入此 tiddler",
	readOnlyText: "载入",
	readOnlyTooltip: "载入此 tiddler",
	done: "载入完成"
	});


//# putTiddler command definition

merge(config.commands.putTiddler,{
	text: "传送",
	tooltip: "传送此 tiddler",
	hideReadOnly: true,
	done: "传送完成"
	});

merge(config.commands.saveTiddlerAndPut,{
	text: "储存",
	tooltip: "储存并传送此 tiddler",
	hideReadOnly: true,
	done: "完成"
	});

merge(config.commands.saveTiddlerHosted,{
	text: "完成",
	tooltip: "储存此 tiddler 的异动",
	hideReadOnly: true,
	done: "完成"
	});
*/
//}}}
