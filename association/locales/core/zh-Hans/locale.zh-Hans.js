/***
|''Name:''|zh-HansTranslationPlugin|
|''Description:''|Translation of TiddlyWiki into Simply Chinese|
|''Source:''|http://tiddlywiki-zh.googlecode.com/svn/trunk/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''Version:''|1.0.0.1|
|''Date:''|Dec 04, 2006|
|''Comments:''|Please make comments at http://groups-beta.google.com/group/TiddlyWiki-zh/|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|
***/

/*{{{*/
// Translateable strings
// ---------------------

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

merge(config.options,{
	txtUserName: "YourName"});
	
config.tasks = {
		tidy: {text: "整理", tooltip: "对群组文章作大量更新"},
		sync: {text: "同步", tooltip: "与别的 TiddlyWiki 文件及服务器同步化", content: '<<sync>>'},
		importTask: {text: "导入", tooltip: "从别的 TiddlyWiki 文件及服务器导入文章与套件", content: '<<importTiddlers>>'},
		copy: {text: "复制", tooltip: "复制文章至别的 TiddlyWiki 文件及服务器"},
		plugins: {text: "套件管理", tooltip: "管理已安装的套件", content: '<<plugins>>'}
};

// Messages
merge(config.messages,{
	customConfigError: "插件载入发生错误，详细请参考 PluginManager",
	pluginError: "发生错误: %0",
	pluginDisabled: "未执行，因标签设为 'systemConfigDisable'",
	pluginForced: "已执行，因标签设为 'systemConfigForce'",
	pluginVersionError: "未执行，插件需较新版本的 TiddlyWiki",
	nothingSelected: "尚未作任何选择，至少需选择一项",
	savedSnapshotError: "此 TiddlyWiki 未正确保存，详见 http://www.tiddlywiki.com/#DownloadSoftware",
	subtitleUnknown: "(未知)",
	undefinedTiddlerToolTip: "'%0' 尚无内容",
	shadowedTiddlerToolTip: "'%0' 尚无内容, 但已定义隐藏的默认值",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "外部链接至 %0",
	noTags: "未设置标签的文章",
	notFileUrlError: "须先将此 TiddlyWiki 存至本机文件，才可保存变更",
	cantSaveError: "此浏览器无法保存变更，建议使用FireFox；也可能是你的 TiddlyWiki 文件名称包含不合法的字符所致。",
	invalidFileError: " '%0' 非有效之 TiddlyWiki 文件",
	backupSaved: "已保存备份",
	backupFailed: "无法保存备份",
	rssSaved: "RSS feed 已保存",
	rssFailed: "无法保存 RSS feed ",
	emptySaved: "已保存范本",
	emptyFailed: "无法保存范本",
	mainSaved: "主要的TiddlyWiki已保存",
	mainFailed: "无法保存主要 TiddlyWiki，所作的改变未保存",
	macroError: "宏 <<%0>> 执行错误",
	macroErrorDetails: "执行宏 <<%0>> 时，发生错误 :\n%1",
	missingMacro: "无此宏",
	overwriteWarning: "'%0' 已存在，[确定]覆盖之",
	unsavedChangesWarning: "注意！ 尚未保存变更\n\n[确定]保存，或[取消]放弃保存？",
	confirmExit: "--------------------------------\n\nTiddlyWiki 以更改内容尚未保存，继续的话将遗失这些更动\n\n--------------------------------",
	saveInstructions: "SaveChanges",
	unsupportedTWFormat: "未支援此 TiddlyWiki 格式：'%0'",
	tiddlerSaveError: "保存文章 '%0' 时，发生错误。",
	tiddlerLoadError: "载入文章 '%0' 时，发生错误。",
	wrongSaveFormat: "无法使用格式 '%0' 保存，请使用标准格式存放",
	invalidFieldName: "无效的栏位名称：%0",
	fieldCannotBeChanged: "无法变更栏位：'%0'",
	backstagePrompt: "后台："});

merge(config.messages.messageClose,{
	text: "关闭",
	tooltip: "关闭此讯息"});

config.messages.dates.months = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
config.messages.dates.days = ["日", "一","二", "三", "四", "五", "六"];
config.messages.dates.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
config.messages.dates.shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
config.messages.dates.am = "上午";
config.messages.dates.pm = "下午";

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
	defaultModifier: "(未完成)",
	shadowModifier: "(默认)",
	createdPrompt: "创建于"});

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
config.macros.list.shadowed.prompt = "这些隐藏的文章已定义默认内容";

merge(config.macros.closeAll,{
	label: "全部关闭",
	prompt: "关闭所有开启中的 tiddler (编辑中除外)"});

merge(config.macros.permaview,{
	label: "永久链接",
	prompt: "可存取现有开启之文章的链接位址"});

merge(config.macros.saveChanges,{
	label: "保存变更",
	prompt: "保存所有文章，产生新的版本",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "创建文章",
	prompt: "创建 tiddler",
	title: "创建文章",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "创建日志",
	prompt: "创建 jounal",
	accessKey: "J"});
	
merge(config.macros.plugins,{
	wizardTitle: "插件管理",
	step1: " - 已载入之插件",
	skippedText: "(此插件因刚加入，故尚未执行)",
	noPluginText: "未安装插件",
	confirmDeleteText: "确认是否删除此文章:\n\n%0",
	listViewTemplate : {
		columns: [
			{name: "Selected", field: "Selected", rowName: "title", type: "Selector"},
			{name: "Title", field: "title", tiddlerLink: "title", title: "标题", type: "TiddlerLink"},
			{name: "Executed", field: "executed", title: "已载入", type: "Boolean", trueText: "是", falseText: "否"},
			{name: "Error", field: "error", title: "载入状态", type: "Boolean", trueText: "错误", falseText: "正常"},
			{name: "Forced", field: "forced", title: "强制执行", tag: "systemConfigDisable", type: "TagCheckbox"},
			{name: "Disabled", field: "disabled", title: "停用", tag: "systemConfigDisable", type: "TagCheckbox"},
			{name: "Log", field: "log", title: "记录", type: "StringList"}
			],
		rowClasses: [
			{className: "error", field: "error"},
			{className: 'warning', field: 'warning'}
			],
		actions: [
			{caption: "执行选项...", name: ""},
			{caption: "移除 'systemConfig' 标签", name: "remove"},
			{caption: "永远删除", name: "delete"}
			]}
	});

merge(config.macros.refreshDisplay,{
	label: "刷新",
	prompt: "刷新此 TiddlyWiki 显示"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "TiddlyWiki 于唯读模式下，不支援导入文章。请由本机（file://）开启 TiddlyWiki 文件",
	defaultPath: "http://www.tiddlywiki.com/index.html",
	fetchLabel: "读取来源文件",
	fetchPrompt: "读取 TiddlyWiki 文件",
	fetchError: "读取来源文件时发生错误",
	confirmOverwriteText: "确定要覆写这些文章:\n\n%0",
	wizardTitle: "自其他 TiddlyWiki 文件导入文章",
	step1: "步骤一：指定来源文件",
	step1prompt: "在此输入 URL 或路径：",
	step1promptFile: "...或选择来源文件：",
	step1promptFeeds: "...或选择指定的 feed：",
	step1feedPrompt: "选择...",
	step2: "步骤二：载入来源文件",
	step2Text: "文件载入中，请稍后：%0",
	step3: "步骤三：选择欲导入之文章",
	step4: "已导入%0 篇文章",
	step5: "导入完成",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', title: "标题", type: 'String'},
			{name: 'Snippet', field: 'text', title: "文章摘要", type: 'String'},
			{name: 'Tags', field: 'tags', title: "标签", type: 'Tags'}
			],
		rowClasses: [
			],
		actions: [
			{caption: "执行选项......", name: ''},
			{caption: "导入所选文章", name: 'import'}
			]}
	});

merge(config.commands.closeTiddler,{
	text: "关闭",
	tooltip: "关闭本文"});

merge(config.commands.closeOthers,{
	text: "关闭其他",
	tooltip: "关闭其他文章"});

merge(config.commands.editTiddler,{
	text: "编辑",
	tooltip: "编辑本文",
	readOnlyText: "查阅",
	readOnlyTooltip: "查阅本文之原始内容"});

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
	text: "永久链接",
	tooltip: "本文永久链接"});

merge(config.commands.references,{
	text: "引用",
	tooltip: "引用本文的文章",
	popupNone: "本文未被引用"});

merge(config.commands.jump,{
	text: "跳转",
	tooltip: "跳转至其他已开启的文章"});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "GettingStarted",
	MainMenu: "GettingStarted",
	SiteTitle: "My TiddlyWiki",
	SiteSubtitle: "a reusable non-linear personal web notebook",
	SiteUrl: "http://www.tiddlywiki.com/",
//	GettingStarted: "使用此 TiddlyWiki 的空白范本之前，请先修改以下默认文章：:\n* SiteTitle 及 SiteSubtitle：网站的标题和副标题，显示于页面上方（在保存变更后，将显示于浏览器视窗的标题列）。\n* MainMenu：主菜单（通常在页面左测）。\n* DefaultTiddlers：包含一些文章的标题，可于进入TiddlyWiki 后开启。\n请输入您的大名，作为所创建/ 编辑文章的署名：<<option txtUserName>>",
//	SideBarOptions: "<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal ' YYYY0MM0DD'>><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel  '偏好设置 »' '变更 TiddlyWiki 选项'>>",
//	OptionsPanel: "这些设置将缓存于浏览器\n请签名<<option txtUserName>>\n (范例：WikiWord)\n\n<<option chkSaveBackups>> 保存备份\n<<option chkAutoSave>> 自动保存\n<<option chkRegExpSearch>> 正规式搜寻\n<<option chkCaseSensitiveSearch>> 区分大小写搜寻\n<<option chkAnimate>> 使用动画显示\n\n[[进阶选项|AdvancedOptions]]\n[[插件管理|PluginManager]]\n[[导入文章|ImportTiddlers]]",
//	AdvancedOptions: "<<option chkGenerateAnRssFeed>> 产生 RssFeed\n<<option chkOpenInNewWindow>> 链接开启于新视窗\n<<option chkSaveEmptyTemplate>> 保存范本\n<<option chkToggleLinks>> 点击文章使已开启者关闭\n\n<<option chkHttpReadOnly>> 隐藏编辑功能 ({{{http:}}})\n<<option chkForceMinorUpdate>> 修改文章不变更日期时间\n(确认修改同时按 Shift 键，或只按 Ctrl-Shift-Enter)\n<<option chkConfirmDelete>> 删除文章前确认\n\n编辑模式中显示列数: <<option txtMaxEditRows>>\n存放备份文件的资料夹: <<option txtBackupFolder>>\n<<option chkInsertTabs>> 使用 tab 键插入定位字符，而非跳至下一个栏位\n",
//	SideBarTabs: "<<tabs txtMainTab 最近更新 '依更新日期排序' TabTimeline 全部 '所有文章' TabAll 分类 '所有标签' TabTags 更多 '其他' TabMore>>",
	TabTimeline: "<<timeline>>",
	TabAll: "<<list all>>",
	TabTags: "<<allTags>>",
//	TabMore: "<<tabs txtMoreTab 未完成 '内容空白的文章' TabMoreMissing 未引用 '未被引用的文章' TabMoreOrphans 默认文章 '默认的影子文章' TabMoreShadowed>>",
	TabMoreMissing: "<<list missing>>",
	TabMoreOrphans: "<<list orphans>>",
	TabMoreShadowed: "<<list shadowed>>",
	PluginManager: "<<plugins>>", 
	ImportTiddlers: "<<importTiddlers>>"});

/*}}}*/
