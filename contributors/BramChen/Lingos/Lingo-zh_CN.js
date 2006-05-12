// ---------------------------------------------------------------------------------
// Translateable strings
// ---------------------------------------------------------------------------------

// Messages
merge(config.messages,{
	customConfigError: "customConfig 错误 - '%1' - %0",
	savedSnapshotError: "此 TiddlyWiki 未正确保存，详见 http://www.tiddlywiki.com/#DownloadSoftware",
	subtitleUnknown: "(未知)",
	undefinedTiddlerToolTip: "'%0' 尚无内容",
	shadowedTiddlerToolTip: "'%0' 尚无内容, 但已定义隐藏的缺省值",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "外部链接至 %0",
	noTags: "未设置标签的文章",
	notFileUrlError: "须先将此 TiddlyWiki 存至本机文件，才可保存变更",
	cantSaveError: "此浏览器无法保存变更，建议使用FireFox；也可能是你的 TiddlyWiki 档名包含不合法的字元所致。",
	invalidFileError: " '%0' 非有效之 TiddlyWiki",
	backupSaved: "已保存备份",
	backupFailed: "无法保存备份",
	rssSaved: "RSS feed 已保存",
	rssFailed: "无法保存 RSS feed ",
	emptySaved: "已保存范本",
	emptyFailed: "无法保存范本",
	mainSaved: "主要的TiddlyWiki已保存",
	mainFailed: "无法保存主要 TiddlyWiki. 所作的改变未保存",
	macroError: "宏 <<%0>> 执行错误",
	macroErrorDetails: "执行宏 <<%0>> 时，发生错误 :\n%1",
	missingMacro: "无此宏",
	overwriteWarning: "'%0' 已存在，[确定]覆盖之",
	unsavedChangesWarning: "注意！ 尚未保存变更\n\n[确定]保存，或[取消]放弃保存？",
	confirmExit: "--------------------------------\n\nTiddlyWiki 以更改内容尚未保存，继续的话将遗失这些更动\n\n--------------------------------",
	saveInstructions: "SaveChanges"});

merge(config.messages.messageClose,{
	text: "关闭",
	tooltip: "关闭此讯息"});

config.messages.dates.months = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
config.messages.dates.days = ["日", "一","二", "三", "四", "五", "六"];

merge(config.views.wikified.tag,{
	labelNoTags: "未设标签",
	labelTags: "标签: ",
	openTag: "开启标签 '%0'",
	tooltip: "显示标签为 '%0' 的文章",
	openAllText: "开启以下所有文章",
	openAllTooltip: "开启以下所有文章",
	popupNone: "仅此文标签为 '%0'"});

merge(config.views.wikified,{
	defaultText: "",
	defaultModifier: "(missing)",
	shadowModifier: "(shadow)"});

merge(config.views.editor,{
	tagPrompt: "设置标签之间以空白区隔，[[标签含空白时请使用双中括弧]]，或点选现有之标签加入",
	defaultText: ""});

merge(config.views.editor.tagChooser,{
	text: "标签",
	tooltip: "点选现有之标签加至本文章",
	popupNone: "未设置标签",
	tagTooltip: "加入标签 '%0'"});

merge(config.macros.search,{
	label: " 寻找",
	prompt: "搜寻本 Wiki",
	accessKey: "F",
	successMsg: " %0 篇符合条件: %1",
	failureMsg: " 无符合条件: %0"});

merge(config.macros.tagging,{
	label: "引用标签:",
	labelNotTag: "无引用标签",
	tooltip: "列出标签为 '%0' 的文章"});

merge(config.macros.timeline,{
	dateFormat: "YYYY0MM0DD"});

merge(config.macros.allTags,{
	tooltip: "显示文章- 标签为'%0'",
	noTags: "没有标签"});

config.macros.list.all.prompt = "依字母排序";
config.macros.list.missing.prompt = "被引用且内容空白的文章";
config.macros.list.orphans.prompt = "未被引用的文章";
config.macros.list.shadowed.prompt = "这些隐藏的文章已定义缺省内容";

merge(config.macros.closeAll,{
	label: "全部关闭",
	prompt: "关闭所有开启中的 tiddler (编辑中除外)"});

merge(config.macros.permaview,{
	label: "引用链接",
	prompt: "可存取现有开启之文章的链接位址"});

merge(config.macros.saveChanges,{
	label: "保存变更",
	prompt: "保存所有文章，产生新的版本",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "添加文章",
	prompt: "添加 tiddler",
	title: "添加文章",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "添加日志",
	prompt: "添加 jounal",
	accessKey: "J"});

merge(config.commands.closeTiddler,{
	text: "关闭",
	tooltip: "关闭本文"});

merge(config.commands.closeOthers,{
	text: "关闭其他",
	tooltip: "关闭其他文章"});

merge(config.commands.editTiddler,{
	text: "编辑",
	tooltip: "编辑本文",
	readOnlyText: "检视",
	readOnlyTooltip: "检视本文之原始内容"});

merge(config.commands.saveTiddler,{
	text: "完成",
	tooltip: "确定修改"});

merge(config.commands.cancelTiddler,{
	text: "取消",
	tooltip: "取消修改",
	warning: "确定取消对 '%0' 的修改吗?",
	readOnlyText: "完成",
	readOnlyTooltip: "返回正常显示模式"});

merge(config.commands.deleteTiddler,{
	text: "删除",
	tooltip: "删除文章",
	warning: "确定删除 '%0'?"});

merge(config.commands.permalink,{
	text: "引用链接",
	tooltip: "本文引用链接"});

merge(config.commands.references,{
	text: "引用",
	tooltip: "引用本文的文章",
	popupNone: "本文未被引用"});

merge(config.commands.jump,{
	text: "卷页",
	tooltip: "卷页至其他已开启的文章"});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "GettingStarted",
	MainMenu: "GettingStarted",
	SiteTitle: "My TiddlyWiki",
	SiteSubtitle: "a reusable non-linear personal web notebook",
	SiteUrl: "http://www.tiddlywiki.com/",
	GettingStarted: "To get started with this blank TiddlyWiki, you'll need to modify the following tiddlers:\n* SiteTitle & SiteSubtitle: The title and subtitle of the site, as shown above (after saving, they will also appear in the browser title bar)\n* MainMenu: The menu (usually on the left)\n* DefaultTiddlers: Contains the names of the tiddlers that you want to appear when the TiddlyWiki is opened\nYou'll also need to enter your username for signing your edits: <<option txtUserName>>",
	SideBarOptions: "<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal ' YYYY0MM0DD'>><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel  '偏好设置' '变更 TiddlyWiki 选项'>>",
	OptionsPanel: "这些设置将暂存于浏览器中，\n请签名<<option txtUserName>>\n (范例：WikiWord)\n\n<<option txtUserName>>\n<<option chkSaveBackups>> [[保存备份]]\n<<option chkAutoSave>> [[自动保存]]\n<<option chkRegExpSearch>> [[正规式搜寻]]\n<<option chkCaseSensitiveSearch>> [[区分大小写搜寻]]\n<<option chkAnimate>> [[使用动画显示]]\n\n[[进阶选项]]",
	进阶选项: "<<option chkGenerateAnRssFeed>> [[产生 RssFeed]]\n<<option chkOpenInNewWindow>> [[链接开启于新视窗]]\n<<option chkSaveEmptyTemplate>> [[保存范本]]\n<<option chkToggleLinks>> 点击文章使已开启者关闭\n\n<<option chkHttpReadOnly>> [[隐藏编辑功能]] ({{{http:}}})\n<<option chkForceMinorUpdate>> 修改文章不变更日期时间\n(确认修改同时按 Shift 键，或只按 Ctrl-Shift-Enter)\n<<option chkConfirmDelete>> 删除文章前确认\n\n编辑模式中显示列数: <<option txtMaxEditRows>>\n存放备份文件的资料夹: <<option txtBackupFolder>>\n",
	SideBarTabs: "<<tabs txtMainTab 最近更新 '依更新日期排序' TabTimeline 全部 '所有文章' TabAll 分类 '所有标签' TabTags 更多 '其他' TabMore>>",
	TabTimeline: "<<timeline>>",
	TabAll: "<<list all>>",
	TabTags: "<<allTags>>",
	TabMore: "<<tabs txtMoreTab 未完成 '内容空白的文章' TabMoreMissing 未引用 '未被引用的文章' TabMoreOrphans 缺省文章 '缺省的影子文章' TabMoreShadowed>>",
	TabMoreMissing: "<<list missing>>",
	TabMoreOrphans: "<<list orphans>>",
	TabMoreShadowed: "<<list shadowed>>"});