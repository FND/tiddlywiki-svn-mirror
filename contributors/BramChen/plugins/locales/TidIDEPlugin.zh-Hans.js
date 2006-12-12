/***
!Metadata:
|''Name:''|TidIDEPlugin.zh-Hans|
|''Date:''|Nov 28, 2006|
|''Source:''|http://tiddlywiki-zh.googlecode.com/svn/trunk/contributors/BramChen/plugins/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.0.11|
|''Required:''|[[TidIDEPlugin|http://www.TiddlyTools.com/#TidIDEPlugin]]|
|''Browser:''|Firefox 1.5+; InternetExplorer 6.0|

!Revision History:
|''Version''|''Date''|''Note''|
|1.6.0|Nov 28, 2006|Initial release|

!Code section:
***/
//{{{

if (typeof config.macros.tidIDE != "undefined"){
	merge(config.macros.tidIDE, {
		versionMsg: "TidIDE v%0.%1.%2: ",
		datetimefmt: "MMM DD, YYYY, hh:mm",
		titleMsg: "请输入创建文章的标题",
		isShadowMsg: "'%0' 是预设的隐藏文章，不能被删除。",
		renderMsg: "预览...",
		timeoutMsg: " (> %0ms)",
		freezeMsg: " - preview is frozen.  Press [refresh] to re-display.",
		evalMsg: "警示!!\n\n此动作会将 '%0' 当作 systemConfig (plugin) tiddler, 可能导致无法预期的结果！\n\n是不确认继续？",
		toolsDef: "<html><a href='javascript:config.macros.tidIDE.set(\"%0\",\"%1\");'>编辑 %1...</a></html>",
		editorLabel: "进阶文章编辑器",
		systemLabel: "系统资讯"
	});
	var TIDEPsyslingo = [
		{en_US:"config.options.*", zh_Hans:"config.options.*"},
		{en_US:"value='set option' title='save this TiddlyWiki option value'", zh_Hans:"value='设定选项' title='保存此 TiddlyWiki 的选项设定值'"},
		{en_US:"value='refresh' title='retrieve current options and system values'", zh_Hans:"value='刷新' title='读取现行及系统预设选项设定'"},
		{en_US:"stylesheets...", zh_Hans:"样式..."},
		{en_US:"shadows...", zh_Hans:"预设文章..."},
		{en_US:"notifications...", zh_Hans:"notifications..."},
		{en_US:"globals...", zh_Hans:"全域函数/变数..."},
		{en_US:"macros...", zh_Hans:"宏..."},
		{en_US:"toolbars...", zh_Hans:"工具列..."},
		{en_US:"wikifiers...", zh_Hans:"标记功能函数..."},
		{en_US:"paramifiers...", zh_Hans:"paramifiers..."}
	];
	var TIDEPlingo = [
		{en_US:"select a tiddler...", zh_Hans:"选择文章..."},
		{en_US:"value='new' title='create a new tiddler'", zh_Hans:"value='创建' title='创建文章'"},
		{en_US:"value='remove' title='delete this tiddler'", zh_Hans:"value='删除' title='删除文章'"},
		{en_US:"value='save' title='save changes to this tiddler'", zh_Hans:"value='保存' title='保存文章'"},
		{en_US:"value='save as' title='save changes to a new tiddler'", zh_Hans:"value='另存' title='存成另一篇新文章'"},
		{en_US:"value='open' title='open this tiddler for regular viewing'", zh_Hans:"value='开启' title='以一般检视模式开启本文章'"},
		{en_US:"value='run' title='evaluate this tiddler as a javascript \"systemConfig\" plugin'", zh_Hans:"value='执行' title='将本文内容当作 javascript 指令码执行 \"systemConfig\" plugin'"},
		{en_US:"value='preview' title='show \"live\" preview display'", zh_Hans:"value='预览' title='\"即时\" 预览显示文章'"},
		{en_US:"hidden field for preview show/hide state: ", zh_Hans:"隐藏预览栏位 显示/隐藏 状态:"},
		{en_US:"select tags...", zh_Hans:"选择标签..."},
		{en_US:"created <input", zh_Hans:"建立日期 <input"},
		{en_US:"modified <input", zh_Hans:"修改日期 <input"},
		{en_US:"by <input", zh_Hans:"作者 <input"},
		{en_US:"do not allow tiddler changes to be saved", zh_Hans:"不允许修改被保存"},
		{en_US:">readonly ", zh_Hans:">唯读模式 "},
		{en_US:"check: save datestamps/author as entered, uncheck: auto-update modified/author", zh_Hans:"勾选：照所输入的内容保存 时间（(例：Nov 28, 2006, 12:00)）/作者，不勾选：自动更新 修改日期/作者 "},
		{en_US:">minor edits ", zh_Hans:">细部修改 "}
	];

	for (var i=0; i<TIDEPsyslingo.length; i++){
		config.macros.tidIDE.html.systempanel = config.macros.tidIDE.html.systempanel.replace(TIDEPsyslingo[i].en_US, TIDEPsyslingo[i].zh_Hans);
	}
	for (var i=0; i<TIDEPlingo.length; i++){
		config.macros.tidIDE.html.editorpanel = config.macros.tidIDE.html.editorpanel.replace(TIDEPlingo[i].en_US, TIDEPlingo[i].zh_Hans);
	}
	TIDEPlingo=[]; TIDEPsyslingo=[];
};
//}}}