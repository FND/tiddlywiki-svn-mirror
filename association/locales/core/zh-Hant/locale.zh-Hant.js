/***
|''Name:''|zh-HantTranslationPlugin|
|''Description:''|Translation of TiddlyWiki into Traditional Chinese|
|''Source:''|http://tiddlywiki-zh.googlecode.com/svn/trunk/|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/association/locales/core/zh-Hant/locale.zh-Hant.js|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''Version:''|1.1.0.2|
|''Date:''|Jan 13, 2007|
|''Comments:''|Please make comments at http://groups-beta.google.com/group/TiddlyWiki-zh/|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

/*{{{*/
// --
// -- Translateable strings
// --

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

config.locale = "zh-Hant"; // W3C language tag
merge(config.options,{
	txtUserName: "YourName"});

config.tasks = {
		save: {text: "儲存", tooltip: "儲存變更至此 TiddlyWiki", action: saveChanges},
		tidy: {text: "整理", tooltip: "對群組文章作大量更新", content: 'Coming soon...\n\nThis tab will allow bulk operations on tiddlers, and tags. It will be a generalised, extensible version of the plugins tab'},
		sync: {text: "同步", tooltip: "將你的資料內容與外部伺服器與檔案同步", content: '<<sync>>'},
		importTask: {text: "導入", tooltip: "自其他檔案或伺服器導入文章或套件", content: '<<importTiddlers>>'},
		copy: {text: "複製", tooltip: "複製文章至別的 TiddlyWiki 文件及伺服器", content: 'Coming soon...\n\nThis tab will allow tiddlers to be copied to remote servers'},
		tweak: {text: "選項", tooltip: "改變此 TiddlyWiki 的顯示與行為的設定", content: '<<options>>'},
		plugins: {text: "套件管理", tooltip: "管理已安裝的套件", content: '<<plugins>>'}
};

config.optionsDesc = {
	txtUserName: "編輯文章所使用之作者署名",
	chkRegExpSearch: "啟用正規式搜尋",
	chkCaseSensitiveSearch: "搜尋時，區分大小寫",
	chkAnimate: "使用動畫顯示",
	chkSaveBackups: "儲存變更前，保留備份檔案",
	chkAutoSave: "自動儲存變更",
	chkGenerateAnRssFeed: "儲存變更時，也儲存 RSS feed",
	chkSaveEmptyTemplate: "儲存變更時，也儲存空白範本",
	chkOpenInNewWindow: "於新視窗開啟連結",
	chkToggleLinks: "點擊已開啟文章將其關閉",
	chkHttpReadOnly: "非本機瀏覽文件時，隱藏編輯功能",
	chkForceMinorUpdate: "修改文章時，不變更作者名稱與日期時間",
	chkConfirmDelete: "刪除文章前須確認",
	chkInsertTabs: "使用 tab 鍵插入定位字元，而非跳至下一個欄位",
	chkShowTiddlerDetails: "顯示文章詳細資訊",
	txtBackupFolder: "存放備份檔案的資料夾",
	txtMaxEditRows: "編輯模式中顯示列數",
	txtFileSystemCharSet: "指定儲存文件所在之檔案系統之字集"
};

// Messages
merge(config.messages,{
	customConfigError: "套件載入發生錯誤，詳細請參考 PluginManager",
	pluginError: "發生錯誤: %0",
	pluginDisabled: "未執行，因標籤設為 'systemConfigDisable'",
	pluginForced: "已執行，因標籤設為 'systemConfigForce'",
	pluginVersionError: "未執行，套件需較新版本的 TiddlyWiki",
	nothingSelected: "尚未作任何選擇，至少需選擇一項",
	savedSnapshotError: "此 TiddlyWiki 未正確存檔，詳見 http://www.tiddlywiki.com/#DownloadSoftware",
	subtitleUnknown: "(未知)",
	undefinedTiddlerToolTip: "'%0' 尚無內容",
	shadowedTiddlerToolTip: "'%0' 尚無內容, 但已定義隱藏的預設值",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "外部連結至 %0",
	noTags: "未設定標籤的文章",
	notFileUrlError: "須先將此 TiddlyWiki 存至檔案，才可儲存變更",
	cantSaveError: "無法儲存變更。可能的原因有：\n- 你的瀏覽器不支援此儲存功能（Firefox, Internet Explorer, Safari and Opera 經適當設定後可儲存變更）\n- 也可能是你的 TiddlyWiki 檔名包含不合法的字元所致。\n- 或是 TiddlyWiki 文件被改名或搬移。",
	invalidFileError: " '%0' 非有效之 TiddlyWiki 文件",
	backupSaved: "已儲存備份",
	backupFailed: "無法儲存備份",
	rssSaved: "RSS feed 已儲存",
	rssFailed: "無法儲存 RSS feed ",
	emptySaved: "已儲存範本",
	emptyFailed: "無法儲存範本",
	mainSaved: "主要的TiddlyWiki已儲存",
	mainFailed: "無法儲存主要 TiddlyWiki，所作的改變未儲存",
	macroError: "巨集 <<\%0>> 執行錯誤",
	macroErrorDetails: "執行巨集 <<\%0>> 時，發生錯誤 :\n%1",
	missingMacro: "無此巨集",
	overwriteWarning: "'%0' 已存在，[確定]覆寫之",
	unsavedChangesWarning: "注意！ 尚未儲存變更\n\n[確定]存檔，或[取消]放棄存檔？",
	confirmExit: "--------------------------------\n\nTiddlyWiki 以更改內容尚未儲存，繼續的話將遺失這些更動\n\n--------------------------------",
	saveInstructions: "SaveChanges",
	unsupportedTWFormat: "未支援此 TiddlyWiki 格式：'%0'",
	tiddlerSaveError: "儲存文章 '%0' 時，發生錯誤。",
	tiddlerLoadError: "載入文章 '%0' 時，發生錯誤。",
	wrongSaveFormat: "無法使用格式 '%0' 儲存，請使用標准格式存放",
	invalidFieldName: "無效的欄位名稱：%0",
	fieldCannotBeChanged: "無法變更欄位：'%0'"});

merge(config.messages.messageClose,{
	text: "關閉",
	tooltip: "關閉此訊息"});

config.messages.backstage = {
	open: {text: "控制台", icon: "↩", iconIE: "←", tooltip: "開啟控制台執行編寫工作"},
	close: {text: "關閉", icon: "↪", iconIE: "→", tooltip: "關閉控制台"},
	prompt: "控制台："
}

config.messages.listView = {
	tiddlerTooltip: "檢視全文",
	previewUnavailable: "(無法預覽)"
}

config.messages.dates.months = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
config.messages.dates.days = ["日", "一","二", "三", "四", "五", "六"];
config.messages.dates.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
config.messages.dates.shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// suffixes for dates, eg "1st","2nd","3rd"..."30th","31st"
config.messages.dates.daySuffixes = ["st","nd","rd","th","th","th","th","th","th","th",
		"th","th","th","th","th","th","th","th","th","th",
		"st","nd","rd","th","th","th","th","th","th","th",
		"st"];
config.messages.dates.am = "上午";
config.messages.dates.pm = "下午";

merge(config.views.wikified.tag,{
	labelNoTags: "未設標籤",
	labelTags: "標籤: ",
	openTag: "開啟標籤 '%0'",
	tooltip: "顯示標籤為 '%0' 的文章",
	openAllText: "開啟以下所有文章",
	openAllTooltip: "開啟以下所有文章",
	popupNone: "僅此文標籤為 '%0'"});

merge(config.views.wikified,{
	defaultText: "",
	defaultModifier: "(未完成)",
	shadowModifier: "(預設)",
	dateFormat: "YYYY年0MM月0DD日",
	createdPrompt: "建立於"});

merge(config.views.editor,{
	tagPrompt: "設定標籤之間以空白區隔，[[標籤含空白時請使用雙中括弧]]，或點選現有之標籤加入",
	defaultText: ""});

merge(config.views.editor.tagChooser,{
	text: "標籤",
	tooltip: "點選現有之標籤加至本文章",
	popupNone: "未設定標籤",
	tagTooltip: "加入標籤 '%0'"});

merge(config.messages,{
	sizeTemplates:
		[
		{unit: 1024*1024*1024, template: "%0\u00a0GB"},
		{unit: 1024*1024, template: "%0\u00a0MB"},
		{unit: 1024, template: "%0\u00a0KB"},
		{unit: 1, template: "%0\u00a0B"}
		]});

merge(config.macros.search,{
	label: " 尋找",
	prompt: "搜尋本 Wiki",
	accessKey: "F",
	successMsg: " %0 篇符合條件: %1",
	failureMsg: " 無符合條件: %0"});

merge(config.macros.tagging,{
	label: "引用標籤:",
	labelNotTag: "無引用標籤",
	tooltip: "列出標籤為 '%0' 的文章"});

merge(config.macros.timeline,{
	dateFormat: "YYYY年0MM月0DD日"});

merge(config.macros.allTags,{
	tooltip: "顯示文章- 標籤為'%0'",
	noTags: "沒有標籤"});

config.macros.list.all.prompt = "依字母排序";
config.macros.list.missing.prompt = "被引用且內容空白的文章";
config.macros.list.orphans.prompt = "未被引用的文章";
config.macros.list.shadowed.prompt = "這些隱藏的文章已預設內容";
config.macros.list.touched.prompt = "自下載或新增後被修改過的文章"; 

merge(config.macros.closeAll,{
	label: "全部關閉",
	prompt: "關閉所有開啟中的 tiddler (編輯中除外)"});

merge(config.macros.permaview,{
	label: "引用連結",
	prompt: "可存取現有開啟之文章的連結位址"});

merge(config.macros.saveChanges,{
	label: "儲存變更",
	prompt: "儲存所有文章，產生新的版本",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "新增文章",
	prompt: "新增 tiddler",
	title: "新增文章",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "新增日誌",
	prompt: "新增 jounal",
	accessKey: "J"});

merge(config.macros.options,{
	listViewTemplate: {
		columns: [
			{name: 'Option', field: 'option', title: "選項", type: 'String'},
			{name: 'Description', field: 'description', title: "說明", type: 'WikiText'},
			{name: 'Name', field: 'name', title: "名稱", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'} 
			]}
	});

merge(config.macros.plugins,{
	wizardTitle: "擴充套件管理",
	step1Title: "- 已載入之套件",
	step1Html: "<input type='hidden' name='markList'></input>",
	skippedText: "(此套件因剛加入，故尚未執行)",
	noPluginText: "未安裝套件",
	confirmDeleteText: "確認是否刪除此文章:\n\n%0",
	removeLabel: "移除 systemConfig 標籤",
	removePrompt: "移除 systemConfig 標籤",
	deleteLabel: "刪除",
	deletePrompt: "永遠刪除所選",

	listViewTemplate : {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "套件", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "大小", type: 'Size'},
			{name: 'Forced', field: 'forced', title: "強制執行", tag: 'systemConfigForce', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "停用", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "已載入", type: "Boolean", trueText: "是", falseText: "否"},
			{name: 'Startup Time', field: 'startupTime', title: "載入時間", type: 'String'},
			{name: 'Error', field: 'error', title: "載入狀態", type: 'Boolean', trueText: "錯誤", falseText: "正常"},
			{name: 'Log', field: 'log', title: "紀錄", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			]}
	});

merge(config.macros.toolbar,{
	moreLabel: "其他",
	morePrompt: "顯示更多工具命令"});
	
merge(config.macros.refreshDisplay,{
	label: "刷新",
	prompt: "刷新此 TiddlyWiki 顯示"
	});
	
merge(config.macros.importTiddlers,{
	readOnlyWarning: "TiddlyWiki 於唯讀模式下，不支援導入文章。請由本機（file://）開啟 TiddlyWiki 文件",
	wizardTitle: "自其他檔案或伺服器導入文章",
	step1Title: "步驟一：指定伺服器或來源文件",
	step1Html: "指定伺服器類型：<select name='selTypes'><option value=''>選取...</option></select><br>請輸入網址或路徑：<input type='text' size=50 name='txtPath'><br>...或選擇來源文件：<input type='file' size=50 name='txtBrowse'><br><hr>...或選擇指定的饋入來源：<select name='selFeeds'><option value=''>選取...</option></select>",
	openLabel: "開啟",
	openPrompt: "開啟檔案或",
	openError: "讀取來源文件時發生錯誤",
	statusOpenHost: "正與伺服器建立連線",
	statusGetWorkspaceList: "正在取得可用之文章清單",
	step2Title: "步驟二：選擇工作區",
	step2Html: "輸入工作區名稱：<input type='text' size=50 name='txtWorkspace'><br>...或選擇工作區：<select name='selWorkspace'><option value=''>選取...</option></select>",
	cancelLabel: "取消",
	cancelPrompt: "取消本次導入動作",
	statusOpenWorkspace: "正在開啟工作區",
	statusGetTiddlerList: "正在取得可用之文章清單",
	step3Title: "步驟三：選擇欲導入之文章",
	step3Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='true' name='chkSync'>保持這些文章與伺服器連線，讓變更持續同步。</input>",
	importLabel: "導入",
	importPrompt: "導入所選文章",
	confirmOverwriteText: "確定要覆寫這些文章：\n\n%0",
	step4Title: "步驟四：正在導入%0 篇文章",
	step4Html: "<input type='hidden' name='markReport'></input>",
	step5Title: "步驟五：導入完成",
	step5Html: "所選文章已導入",
	doneLabel: "完成",
	donePrompt: "關閉",

	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "文章", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "大小", type: 'Size'},
			{name: 'Tags', field: 'tags', title: "標籤", type: 'Tags'}
			],
		rowClasses: [
			]}
	});

merge(config.macros.sync,{
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "文章", type: 'Tiddler'},
			{name: 'Server Type', field: 'serverType', title: "伺服器類型", type: 'String'},
			{name: 'Server Host', field: 'serverHost', title: "伺服器主機", type: 'String'},
			{name: 'Server Workspace', field: 'serverWorkspace', title: "伺服器工作區", type: 'String'},
			{name: 'Status', field: 'status', title: "同步情形", type: 'String'},
			{name: 'Server URL', field: 'serverUrl', title: "伺服器網址", text: "View", type: 'Link'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "同步更新這些文章", name: 'sync'}
			]},
	wizardTitle: "將你的資料內容與外部伺服器與檔案同步",
	step1Title: "選擇欲同步的文章",
	step1Html: '<input type="hidden" name="markList"></input>',
	syncLabel: "同步",
	syncPrompt: "同步更新這些文章",
	hasChanged: "已更動",
	hasNotChanged: "未更動",
	syncStatusList: {
		none: {text: "...", color: "none"},
		changedServer: {text: "已更新伺服器上資料", color: "#80ff80"},
		changedLocally: {text: "本機資料已更動", color: "#80ff80"},
		changedBoth: {text: "已同時更新本機與伺服器上的資料", color: "#ff8080"},
		notFound: {text: "伺服器無此資料", color: "#ffff80"},
		putToServer: {text: "已儲存更新資料至伺服器", color: "#ff80ff"},
		gotFromServer: {text: "已從伺服器擷取更新資料", color: "#80ffff"}
		}
	});

merge(config.macros.viewDetails,{
	label: "...",
	prompt: "顯示此文章之詳細資訊",
	hideLabel: "(隱藏詳細資訊)",
	hidePrompt: "隱藏此詳細資訊面板",
	emptyDetailsText: "此文章沒有擴充欄位",
	listViewTemplate: {
		columns: [
			{name: 'Field', field: 'field', title: "欄位", type: 'String'},
			{name: 'Value', field: 'value', title: "內容", type: 'String'}
			],
		rowClasses: [
			],
		buttons: [
			]}
	});

merge(config.commands.closeTiddler,{
	text: "關閉",
	tooltip: "關閉本文"});

merge(config.commands.closeOthers,{
	text: "關閉其他",
	tooltip: "關閉其他文章"});

merge(config.commands.editTiddler,{
	text: "編輯",
	tooltip: "編輯本文",
	readOnlyText: "檢視",
	readOnlyTooltip: "檢視本文之原始內容"});

merge(config.commands.saveTiddler,{
	text: "完成",
	tooltip: "確定修改"});

merge(config.commands.cancelTiddler,{
	text: "取消",
	tooltip: "取消修改",
	warning: "確定取消對 '%0' 的修改嗎?",
	readOnlyText: "完成",
	readOnlyTooltip: "返回正常顯示模式"});

merge(config.commands.deleteTiddler,{
	text: "刪除",
	tooltip: "刪除文章",
	warning: "確定刪除 '%0'?"});

merge(config.commands.permalink,{
	text: "引用連結",
	tooltip: "本文引用連結"});

merge(config.commands.references,{
	text: "引用",
	tooltip: "引用本文的文章",
	popupNone: "本文未被引用"});

merge(config.commands.jump,{
	text: "捲頁",
	tooltip: "捲頁至其他已開啟的文章"});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "GettingStarted",
	MainMenu: "[[使用說明|GettingStarted]]",
	SiteTitle: "我的 TiddlyWiki",
	SiteSubtitle: "一個可重複使用的個人網頁式筆記本",
	SiteUrl: 'http://www.tiddlywiki.com/',
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal " YYYY年0MM月0DD日">><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel  "偏好設定 »" "變更 TiddlyWiki 選項">>',
	SideBarTabs: '<<tabs txtMainTab "最近更新" "依更新日期排序" TabTimeline "全部" "所有文章" TabAll "分類" "所有標籤" TabTags "更多" "其他" TabMore>>',
	TabTimeline: '<<timeline>>',
	TabAll: '<<list all>>',
	TabTags: '<<allTags excludeLists>>',
	TabMore: '<<tabs txtMoreTab "未完成" "內容空白的文章" TabMoreMissing "未引用" "未被引用的文章" TabMoreOrphans "預設文章" "已預設內容的隱藏文章" TabMoreShadowed>>',
	TabMoreMissing: '<<list missing>>',
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	PluginManager: '<<plugins>>', 
	ImportTiddlers: '<<importTiddlers>>'});
/*}}}*/
