/***
|''Name:''|zh-HansTranslationPlugin|
|''Description:''|Translation of TiddlyWiki into Simply Chinese|
|''Source:''|http://tiddlywiki-zh.googlecode.com/svn/trunk/|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/association/locales/core/zh-Hans/locale.zh-Hans.js|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''Version:''|1.1.0.2|
|''Date:''|Jan 13, 2007|
|''Comments:''|Please make comments at http://groups-beta.google.com/group/TiddlyWiki-zh/|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2.0|
***/

/*{{{*/
// Translateable strings
// ---------------------

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

config.locale = "zh-Hans"; // W3C language tag
merge(config.options,{
	txtUserName: "YourName"});

config.tasks = {
		save: {text: "保存", tooltip: "保存变更至此 TiddlyWiki", action: saveChanges},
		tidy: {text: "整理", tooltip: "对群组文章作大量更新"},
		sync: {text: "同步", tooltip: "将你的资料内容与外部服务器与文件同步", content: '<<sync>>'},
		importTask: {text: "导入", tooltip: "自其他文件或服务器导入文章或插件", content: '<<importTiddlers>>'},
		copy: {text: "复制", tooltip: "复制文章至别的 TiddlyWiki 文件及服务器"},
		tweak: {text: "选项", tooltip: "改变此 TiddlyWiki 显示与行为设置", content: '<<options>>'},
		plugins: {text: "套件管理", tooltip: "管理已安装的套件", content: '<<plugins>>'}
};

config.optionsDesc = {
	txtUserName: "编辑文章所使用之作者署名",
	chkRegExpSearch: "启用正规式查找",
	chkCaseSensitiveSearch: "查找时，区分大小写",
	chkAnimate: "使用动画显示",
	chkSaveBackups: "保存变更前，保留备份文件",
	chkAutoSave: "自动保存变更",
	chkGenerateAnRssFeed: "保存变更时，也保存 RSS feed",
	chkSaveEmptyTemplate: "保存变更时，也保存空白范本",
	chkOpenInNewWindow: "于新视窗开启连结",
	chkToggleLinks: "点击已开启文章将其关闭",
	chkHttpReadOnly: "非本机浏览文件时，隐藏编辑功能",
	chkForceMinorUpdate: "修改文章时，不变更作者名称与日期时间",
	chkConfirmDelete: "删除文章前须确认",
	chkInsertTabs: "使用 tab 键插入定位字符，而非跳至下一个栏位",
	chkShowTiddlerDetails: "显示文章详细资讯",
	txtBackupFolder: "存放备份文件的资料夹",
	txtMaxEditRows: "编辑模式中显示列数",
	txtFileSystemCharSet: "指定保存文件所在之档案系统之字符集"
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
	cantSaveError: "无法保存变更。可能的原因有：\n- 你的浏览器不支援此保存功能（Firefox, Internet Explorer, Safari and Opera 经适当设定后可保存变更）\n- 也可能是你的 TiddlyWiki 文件名称包含不合法的字符所致。\n- 或是 TiddlyWiki 文件被改名或搬移。",
	invalidFileError: " '%0' 非有效之 TiddlyWiki 文件",
	backupSaved: "已保存备份",
	backupFailed: "无法保存备份",
	rssSaved: "RSS feed 已保存",
	rssFailed: "无法保存 RSS feed ",
	emptySaved: "已保存范本",
	emptyFailed: "无法保存范本",
	mainSaved: "主要的TiddlyWiki已保存",
	mainFailed: "无法保存主要 TiddlyWiki，所作的改变未保存",
	macroError: "宏 <<\%0>> 执行错误",
	macroErrorDetails: "执行宏 <<\%0>> 时，发生错误 :\n%1",
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
	fieldCannotBeChanged: "无法变更栏位：'%0'"});

merge(config.messages.messageClose,{
	text: "关闭",
	tooltip: "关闭此讯息"});

config.messages.backstage = {
	open: {text: "控制台", icon: "↩", iconIE: "←", tooltip: "开启控制台执行编写工作"},
	close: {text: "关闭", icon: "↪", iconIE: "→", tooltip: "关闭控制台"},
	prompt: "控制台："
}

config.messages.listView = {
	tiddlerTooltip: "查看全文",
	previewUnavailable: "(无法预览)"
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
	dateFormat: "YYYY年0MM月0DD日",
	createdPrompt: "创建于"});

merge(config.views.editor,{
	tagPrompt: "设置标签之间以空白区隔，[[标签含空白时请使用双中括弧]]，或点选现有之标签加入",
	defaultText: ""});

merge(config.views.editor.tagChooser,{
	text: "标签",
	tooltip: "点选现有之标签加至本文章",
	popupNone: "未设置标签",
	tagTooltip: "加入标签 '%0'"});

	merge(config.messages,{
	sizeTemplates:
		[
		{unit: 1024*1024*1024, template: "%0\u00a0GB"},
		{unit: 1024*1024, template: "%0\u00a0MB"},
		{unit: 1024, template: "%0\u00a0KB"},
		{unit: 1, template: "%0\u00a0B"}
		]});

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
	dateFormat: "YYYY年0MM月0DD日"});

merge(config.macros.allTags,{
	tooltip: "显示文章- 标签为'%0'",
	noTags: "没有标签"});

config.macros.list.all.prompt = "依字母排序";
config.macros.list.missing.prompt = "被引用且内容空白的文章";
config.macros.list.orphans.prompt = "未被引用的文章";
config.macros.list.shadowed.prompt = "这些隐藏的文章已定义默认内容";
config.macros.list.touched.prompt = "自下载或添加后被修改过的文章"; 

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

merge(config.macros.options,{
	listViewTemplate: {
		columns: [
			{name: 'Option', field: 'option', title: "选项", type: 'String'},
			{name: 'Description', field: 'description', title: "说明", type: 'WikiText'},
			{name: 'Name', field: 'name', title: "名称", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'} 
			]}
	});

merge(config.macros.plugins,{
	wizardTitle: "插件管理",
	step1Title: "- 已载入之插件",
	step1Html: "<input type='hidden' name='markList'></input>",
	skippedText: "(此插件因刚加入，故尚未执行)",
	noPluginText: "未安装插件",
	confirmDeleteText: "确认是否删除此文章:\n\n%0",
	removeLabel: "移除 'systemConfig' 标签",
	removePrompt: "移除 'systemConfig' 标签",
	deleteLabel: "删除",
	deletePrompt: "永远删除所选插件",
	listViewTemplate : {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "套件", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "大小", type: 'Size'},
			{name: 'Forced', field: 'forced', title: "强制执行", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "停用", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "已载入", type: 'Boolean', trueText: "是", falseText: "否"},
			{name: 'Startup Time', field: 'startupTime', title: "载入时间", type: 'String'},
			{name: 'Error', field: 'error', title: "载入状态", type: 'Boolean', trueText: "错误", falseText: "正常"},
			{name: 'Log', field: 'log', title: "记录", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			]}
	});

	merge(config.macros.toolbar,{
	moreLabel: "其他",
	morePrompt: "显示更多工具命令"});

merge(config.macros.refreshDisplay,{
	label: "刷新",
	prompt: "刷新此 TiddlyWiki 显示"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "TiddlyWiki 于唯读模式下，不支援导入文章。请由本机（file://）开启 TiddlyWiki 文件",
	wizardTitle: "自其他文件服务器导入文章",
	wizardTitle: "自其他档案或服务器汇入文章",
	step1Title: "步骤一：指定服务器或来源文件",
	step1Html: "指定服务器类型：<select name='selTypes'><option value=''>选取...</option></select><br>请输入网址或路径：<input type='text' size=50 name='txtPath'><br>...或选择来源文件：<input type='file' size=50 name='txtBrowse'><br><hr>...或选择指定的馈入来源：<select name='selFeeds'><option value=''>选取...</option></select>",
	openLabel: "开启",
	openPrompt: "开启文件或",
	openError: "读取来源文件时发生错误",
	statusOpenHost: "正与服务器建立连线",
	statusGetWorkspaceList: "正在取得可用之文章清单",
	step2Title: "步骤二：选择工作区",
	step2Html: "输入工作区名称：<input type='text' size=50 name='txtWorkspace'><br>...或选择工作区：<select name='selWorkspace'><option value=''>选取...</option></select>",
	cancelLabel: "取消",
	cancelPrompt: "取消本次导入动作",
	statusOpenWorkspace: "正在开启工作区",
	statusGetTiddlerList: "正在取得可用之文章清单",
	step3Title: "步骤三：选择欲导入之文章",
	step3Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='true' name='chkSync'>保持这些文章与伺服器连线，让变更持续同步。</input>",
	importLabel: "导入",
	importPrompt: "导入所选文章",
	confirmOverwriteText: "确定要覆写这些文章：\n\n%0",
	step4Title: "步骤四：正在导入%0 篇文章",
	step4Html: "<input type='hidden' name='markReport'></input>",
	step5Title: "步骤五：导入完成",
	step5Html: "所选文章已导入",
	doneLabel: "完成",
	donePrompt: "关闭",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "文章", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "大小", type: 'Size'},
			{name: 'Tags', field: 'tags', title: "标签", type: 'Tags'}
			],
		rowClasses: [
			]}
	});

merge(config.macros.sync,{
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "文章", type: 'Tiddler'},
			{name: 'Server Type', field: 'serverType', title: "服务器类型", type: 'String'},
			{name: 'Server Host', field: 'serverHost', title: "服务器主机", type: 'String'},
			{name: 'Server Workspace', field: 'serverWorkspace', title: "服务器工作区", type: 'String'},
			{name: 'Status', field: 'status', title: "同步情形", type: 'String'},
			{name: 'Server URL', field: 'serverUrl', title: "服务器网址", text: "View", type: 'Link'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "同步更新这些文章", name: 'sync'}
			]},
	wizardTitle: "将你的资料内容与外部服务器与文件同步",
	step1Title: "选择欲同步的文章",
	step1Html: '<input type="hidden" name="markList"></input>',
	syncLabel: "同步",
	syncPrompt: "同步更新这些文章",
	hasChanged: "已更动",
	hasNotChanged: "未更动",
	syncStatusList: {
		none: {text: "...", color: "none"},
		changedServer: {text: "已更新服务器上资料", color: "#80ff80"},
		changedLocally: {text: "本机资料已更动", color: "#80ff80"},
		changedBoth: {text: "已同时更新本机与服务器上的资料", color: "#ff8080"},
		notFound: {text: "服务器无此资料", color: "#ffff80"},
		putToServer: {text: "已储存更新资料至服务器", color: "#ff80ff"},
		gotFromServer: {text: "已从服务器撷取更新资料", color: "#80ffff"}
		}
	});

merge(config.macros.viewDetails,{
	label: "...",
	prompt: "显示此文章之详细资讯",
	hideLabel: "(隐藏详细资讯)",
	hidePrompt: "隐藏此详细资讯面板",
	emptyDetailsText: "此文章没有扩充栏位",
	listViewTemplate: {
		columns: [
			{name: 'Field', field: 'field', title: "栏位", type: 'String'},
			{name: 'Value', field: 'value', title: "内容", type: 'String'}
			],
		rowClasses: [
			],
		buttons: [
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
	MainMenu: "[[使用说明|GettingStarted]]",
	SiteTitle: "我的 TiddlyWiki",
	SiteSubtitle: "一个可重复使用的个人网页式笔记本",
	SiteUrl: 'http://www.tiddlywiki.com/',
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal " YYYY年0MM月0DD日">><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel  "偏好设置 »" "变更 TiddlyWiki 选项">>',
	SideBarTabs: '<<tabs txtMainTab "最近更新" "依更新日期排序" TabTimeline "全部" "所有文章" TabAll "分类" "所有标签" TabTags "更多" "其他" TabMore>>',
	TabTimeline: '<<timeline>>',
	TabAll: '<<list all>>',
	TabTags: '<<allTags excludeLists>>',
	TabMore: '<<tabs txtMoreTab "未完成" "内容空白的文章" TabMoreMissing "未引用" "未被引用的文章" TabMoreOrphans "默认文章" "默认的影子文章" TabMoreShadowed>>',
	TabMoreMissing: '<<list missing>>',
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	PluginManager: '<<plugins>>',
	ImportTiddlers: '<<importTiddlers>>'});
/*}}}*/
