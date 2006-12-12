/***
!Metadata:
|''Name:''|TidIDEPlugin.zh-Hant|
|''Date:''|Nov 18, 2006|
|''Source:''|http://tiddlywiki-zh.googlecode.com/svn/trunk/contributors/BramChen/plugins/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License]]|
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
		titleMsg: "請輸入新增文章的標題",
		isShadowMsg: "'%0' 是預設的隱藏文章，不能被刪除。",
		renderMsg: "預覽...",
		timeoutMsg: " (> %0ms)",
		freezeMsg: " - preview is frozen.  Press [refresh] to re-display.",
		evalMsg: "警示!!\n\n此動作會將 '%0' 當作 systemConfig (plugin) tiddler, 可能導致無法預期的結果！\n\n是不確認繼續？",
		toolsDef: "<html><a href='javascript:config.macros.tidIDE.set(\"%0\",\"%1\");'>編輯 %1...</a></html>",
		editorLabel: "進階文章編輯器",
		systemLabel: "系統資訊"
	});
	var TIDEPsyslingo = [
		{en_US:"config.options.*", zh_Hant:"config.options.*"},
		{en_US:"value='set option' title='save this TiddlyWiki option value'", zh_Hant:"value='設定選項' title='儲存此 TiddlyWiki 的選項設定值'"},
		{en_US:"value='refresh' title='retrieve current options and system values'", zh_Hant:"value='刷新' title='讀取現行及系統預設選項設定'"},
		{en_US:"stylesheets...", zh_Hant:"樣式..."},
		{en_US:"shadows...", zh_Hant:"預設文章..."},
		{en_US:"notifications...", zh_Hant:"notifications..."},
		{en_US:"globals...", zh_Hant:"全域函數/變數..."},
		{en_US:"macros...", zh_Hant:"巨集..."},
		{en_US:"toolbars...", zh_Hant:"工具列..."},
		{en_US:"wikifiers...", zh_Hant:"標記功能函數..."},
		{en_US:"paramifiers...", zh_Hant:"paramifiers..."}
	];
	var TIDEPlingo = [
		{en_US:"select a tiddler...", zh_Hant:"選擇文章..."},
		{en_US:"value='new' title='create a new tiddler'", zh_Hant:"value='新增' title='新增文章'"},
		{en_US:"value='remove' title='delete this tiddler'", zh_Hant:"value='刪除' title='刪除文章'"},
		{en_US:"value='save' title='save changes to this tiddler'", zh_Hant:"value='儲存' title='儲存文章'"},
		{en_US:"value='save as' title='save changes to a new tiddler'", zh_Hant:"value='另存' title='存成另一篇新文章'"},
		{en_US:"value='open' title='open this tiddler for regular viewing'", zh_Hant:"value='開啟' title='以一般檢視模式開啟本文章'"},
		{en_US:"value='run' title='evaluate this tiddler as a javascript \"systemConfig\" plugin'", zh_Hant:"value='執行' title='將本文內容當作 javascript 指令碼執行 \"systemConfig\" plugin'"},
		{en_US:"value='preview' title='show \"live\" preview display'", zh_Hant:"value='預覽' title='\"即時\" 預覽顯示文章'"},
		{en_US:"hidden field for preview show/hide state: ", zh_Hant:"隱藏預覽欄位 顯示/隱藏 狀態:"},
		{en_US:"select tags...", zh_Hant:"選擇標籤..."},
		{en_US:"created <input", zh_Hant:"建立日期 <input"},
		{en_US:"modified <input", zh_Hant:"修改日期 <input"},
		{en_US:"by <input", zh_Hant:"作者 <input"},
		{en_US:"do not allow tiddler changes to be saved", zh_Hant:"不允許修改被儲存"},
		{en_US:">readonly ", zh_Hant:">唯讀模式 "},
		{en_US:"check: save datestamps/author as entered, uncheck: auto-update modified/author", zh_Hant:"勾選：照所輸入的內容儲存 時間(例：Nov 28, 2006, 12:00)/作者，不勾選：自動更新 修改日期/作者 "},
		{en_US:">minor edits ", zh_Hant:">細部修改 "}
	];

	for (var i=0; i<TIDEPsyslingo.length; i++){
		config.macros.tidIDE.html.systempanel = config.macros.tidIDE.html.systempanel.replace(TIDEPsyslingo[i].en_US, TIDEPsyslingo[i].zh_Hant);
	}
	for (var i=0; i<TIDEPlingo.length; i++){
		config.macros.tidIDE.html.editorpanel = config.macros.tidIDE.html.editorpanel.replace(TIDEPlingo[i].en_US, TIDEPlingo[i].zh_Hant);
	}
	TIDEPlingo=[]; TIDEPsyslingo=[];
};
//}}}