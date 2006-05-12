// ---------------------------------------------------------------------------------
// Translateable strings
// ---------------------------------------------------------------------------------

// Messages
merge(config.messages,{
	customConfigError: "customConfig 錯誤 - '%1' - %0",
	savedSnapshotError: "此 TiddlyWiki 未正確存檔，詳見 http://www.tiddlywiki.com/#DownloadSoftware",
	subtitleUnknown: "(未知)",
	undefinedTiddlerToolTip: "'%0' 尚無內容",
	shadowedTiddlerToolTip: "'%0' 尚無內容, 但已定義隱藏的預設值",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "外部連結至 %0",
	noTags: "未設定標籤的文章",
	notFileUrlError: "須先將此 TiddlyWiki 存至檔案，才可儲存變更",
	cantSaveError: "此瀏覽器無法儲存變更，建議使用FireFox；也可能是你的 TiddlyWiki 檔名包含不合法的字元所致。",
	invalidFileError: " '%0' 非有效之 TiddlyWiki",
	backupSaved: "已儲存備份",
	backupFailed: "無法儲存備份",
	rssSaved: "RSS feed 已儲存",
	rssFailed: "無法儲存 RSS feed ",
	emptySaved: "已儲存範本",
	emptyFailed: "無法儲存範本",
	mainSaved: "主要的TiddlyWiki已儲存",
	mainFailed: "無法儲存主要 TiddlyWiki. 所作的改變未儲存",
	macroError: "巨集 <<%0>> 執行錯誤",
	macroErrorDetails: "執行巨集 <<%0>> 時，發生錯誤 :\n%1",
	missingMacro: "無此巨集",
	overwriteWarning: "'%0' 已存在，[確定]覆寫之",
	unsavedChangesWarning: "注意！ 尚未儲存變更\n\n[確定]存檔，或[取消]放棄存檔？",
	confirmExit: "--------------------------------\n\nTiddlyWiki 以更改內容尚未儲存，繼續的話將遺失這些更動\n\n--------------------------------",
	saveInstructions: "SaveChanges"});

merge(config.messages.messageClose,{
	text: "關閉",
	tooltip: "關閉此訊息"});

config.messages.dates.months = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
config.messages.dates.days = ["日", "一","二", "三", "四", "五", "六"];

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
	defaultModifier: "(missing)",
	shadowModifier: "(shadow)"});

merge(config.views.editor,{
	tagPrompt: "設定標籤之間以空白區隔，[[標籤含空白時請使用雙中括弧]]，或點選現有之標籤加入",
	defaultText: ""});

merge(config.views.editor.tagChooser,{
	text: "標籤",
	tooltip: "點選現有之標籤加至本文章",
	popupNone: "未設定標籤",
	tagTooltip: "加入標籤 '%0'"});

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
	dateFormat: "YYYY0MM0DD"});

merge(config.macros.allTags,{
	tooltip: "顯示文章- 標籤為'%0'",
	noTags: "沒有標籤"});

config.macros.list.all.prompt = "依字母排序";
config.macros.list.missing.prompt = "被引用且內容空白的文章";
config.macros.list.orphans.prompt = "未被引用的文章";
config.macros.list.shadowed.prompt = "這些隱藏的文章已定義預設內容";

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
	MainMenu: "GettingStarted",
	SiteTitle: "My TiddlyWiki",
	SiteSubtitle: "a reusable non-linear personal web notebook",
	SiteUrl: "http://www.tiddlywiki.com/",
	GettingStarted: "To get started with this blank TiddlyWiki, you'll need to modify the following tiddlers:\n* SiteTitle & SiteSubtitle: The title and subtitle of the site, as shown above (after saving, they will also appear in the browser title bar)\n* MainMenu: The menu (usually on the left)\n* DefaultTiddlers: Contains the names of the tiddlers that you want to appear when the TiddlyWiki is opened\nYou'll also need to enter your username for signing your edits: <<option txtUserName>>",
	SideBarOptions: "<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal ' YYYY0MM0DD'>><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel  '偏好設定' '變更 TiddlyWiki 選項'>>",
	OptionsPanel: "這些設定將暫存於瀏覽器中，\n請簽名<<option txtUserName>>\n (範例：WikiWord)\n\n<<option txtUserName>>\n<<option chkSaveBackups>> [[儲存備份]]\n<<option chkAutoSave>> [[自動儲存]]\n<<option chkRegExpSearch>> [[正規式搜尋]]\n<<option chkCaseSensitiveSearch>> [[區分大小寫搜尋]]\n<<option chkAnimate>> [[使用動畫顯示]]\n\n[[進階選項]]",
	進階選項: "<<option chkGenerateAnRssFeed>> [[產生 RssFeed]]\n<<option chkOpenInNewWindow>> [[連結開啟於新視窗]]\n<<option chkSaveEmptyTemplate>> [[儲存範本]]\n<<option chkToggleLinks>> 點擊文章使已開啟者關閉\n\n<<option chkHttpReadOnly>> [[隱藏編輯功能]] ({{{http:}}})\n<<option chkForceMinorUpdate>> 修改文章不變更日期時間\n(確認修改同時按 Shift 鍵，或只按 Ctrl-Shift-Enter)\n<<option chkConfirmDelete>> 刪除文章前確認\n\n編輯模式中顯示列數: <<option txtMaxEditRows>>\n存放備份檔案的資料夾: <<option txtBackupFolder>>\n",
	SideBarTabs: "<<tabs txtMainTab 最近更新 '依更新日期排序' TabTimeline 全部 '所有文章' TabAll 分類 '所有標籤' TabTags 更多 '其他' TabMore>>",
	TabTimeline: "<<timeline>>",
	TabAll: "<<list all>>",
	TabTags: "<<allTags>>",
	TabMore: "<<tabs txtMoreTab 未完成 '內容空白的文章' TabMoreMissing 未引用 '未被引用的文章' TabMoreOrphans 預設文章 '預設的影子文章' TabMoreShadowed>>",
	TabMoreMissing: "<<list missing>>",
	TabMoreOrphans: "<<list orphans>>",
	TabMoreShadowed: "<<list shadowed>>"});

