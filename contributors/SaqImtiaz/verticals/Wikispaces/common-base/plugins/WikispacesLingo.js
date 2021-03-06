//--
//-- Translateable strings
//--

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

merge(config.options,{
	txtUserName: "YourName"});

merge(config.tasks,{
	save: {text: "save", tooltip: "Save your changes to this TiddlyWiki", action: saveChanges},
	sync: {text: "sync", tooltip: "Synchronise changes with other TiddlyWiki files and servers", content: '<<sync>>'},
	importTask: {text: "import", tooltip: "Import pages and plugins from other TiddlyWiki files and servers", content: '<<importTiddlers>>'},
	tweak: {text: "tweak", tooltip: "Tweak the appearance and behaviour of TiddlyWiki", content: '<<options>>'},
	upgrade: {text: "upgrade", tooltip: "Upgrade TiddlyWiki core code", content: '<<upgrade>>'},
	plugins: {text: "plugins", tooltip: "Manage installed plugins", content: '<<plugins>>'}
});

// Options that can be set in the options panel and/or cookies
merge(config.optionsDesc,{
	txtUserName: "Username for signing your edits",
	chkRegExpSearch: "Enable regular expressions for searches",
	chkCaseSensitiveSearch: "Case-sensitive searching",
	chkAnimate: "Enable animations",
	chkSaveBackups: "Keep backup file when saving changes",
	chkAutoSave: "Automatically save changes",
	chkGenerateAnRssFeed: "Generate an RSS feed when saving changes",
	chkSaveEmptyTemplate: "Generate an empty template when saving changes",
	chkOpenInNewWindow: "Open external links in a new window",
	chkToggleLinks: "Clicking on links to open pages causes them to close",
	chkHttpReadOnly: "Hide editing features when viewed over HTTP",
	chkForceMinorUpdate: "Don't update modifier username and date when editing pages",
	chkConfirmDelete: "Require confirmation before deleting pages",
	chkInsertTabs: "Use the tab key to insert tab characters instead of moving between fields",
	txtBackupFolder: "Name of folder to use for backups",
	txtMaxEditRows: "Maximum number of rows in edit boxes",
	txtFileSystemCharSet: "Default character set for saving changes (Firefox/Mozilla only)"});

merge(config.messages,{
	customConfigError: "Problems were encountered loading plugins. See PluginManager for details",
	pluginError: "Error: %0",
	pluginDisabled: "Not executed because disabled via 'systemConfigDisable' tag",
	pluginForced: "Executed because forced via 'systemConfigForce' tag",
	pluginVersionError: "Not executed because this plugin needs a newer version of TiddlyWiki",
	nothingSelected: "Nothing is selected. You must select one or more items first",
	savedSnapshotError: "It appears that this TiddlyWiki has been incorrectly saved. Please see http://www.tiddlywiki.com/#DownloadSoftware for details",
	subtitleUnknown: "(unknown)",
	undefinedTiddlerToolTip: "The page '%0' doesn't yet exist",
	shadowedTiddlerToolTip: "The page '%0' doesn't yet exist, but has a pre-defined shadow value",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "External link to %0",
	noTags: "There are no tagged pages",
	notFileUrlError: "You need to save this TiddlyWiki to a file before you can save changes",
	cantSaveError: "It's not possible to save changes. Possible reasons include:\n- your browser doesn't support saving (Firefox, Internet Explorer, Safari and Opera all work if properly configured)\n- the pathname to your TiddlyWiki file contains illegal characters\n- the TiddlyWiki HTML file has been moved or renamed",
	invalidFileError: "The original file '%0' does not appear to be a valid TiddlyWiki",
	backupSaved: "Backup saved",
	backupFailed: "Failed to save backup file",
	rssSaved: "RSS feed saved",
	rssFailed: "Failed to save RSS feed file",
	emptySaved: "Empty template saved",
	emptyFailed: "Failed to save empty template file",
	mainSaved: "Main notebook file saved",
	mainFailed: "Failed to save main notebook file. Your changes have not been saved",
	macroError: "Error in macro <<\%0>>",
	macroErrorDetails: "Error while executing macro <<\%0>>:\n%1",
	missingMacro: "No such macro",
	overwriteWarning: "A page named '%0' already exists. Choose OK to overwrite it",
	unsavedChangesWarning: "WARNING! There are unsaved changes in your notebook\n\nChoose OK to save\nChoose CANCEL to discard",
	confirmExit: "--------------------------------\n\nThere are unsaved changes in your notebook. If you continue you will lose those changes\n\n--------------------------------",
	saveInstructions: "SaveChanges",
	unsupportedTWFormat: "Unsupported TiddlyWiki format '%0'",
	tiddlerSaveError: "Error when saving page '%0'",
	tiddlerLoadError: "Error when loading page '%0'",
	wrongSaveFormat: "Cannot save with storage format '%0'. Using standard format for save.",
	invalidFieldName: "Invalid field name %0",
	fieldCannotBeChanged: "Field '%0' cannot be changed",
	loadingMissingTiddler: "Attempting to retrieve the page '%0' from the '%1' server at:\n\n'%2' in the workspace '%3'"});

merge(config.messages.messageClose,{
	text: "close",
	tooltip: "close this message area"});

config.messages.backstage = {
	open: {text: "backstage", tooltip: "Open the backstage area to perform authoring and editing tasks"},
	close: {text: "close", tooltip: "Close the backstage area"},
	prompt: "backstage: ",
	decal: {
		edit: {text: "edit", tooltip: "Edit the page '%0'"}
	}
};

config.messages.listView = {
	tiddlerTooltip: "Click for the full text of this page",
	previewUnavailable: "(preview not available)"
};

config.messages.dates.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November","December"];
config.messages.dates.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
config.messages.dates.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
config.messages.dates.shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// suffixes for dates, eg "1st","2nd","3rd"..."30th","31st"
config.messages.dates.daySuffixes = ["st","nd","rd","th","th","th","th","th","th","th",
		"th","th","th","th","th","th","th","th","th","th",
		"st","nd","rd","th","th","th","th","th","th","th",
		"st"];
config.messages.dates.am = "am";
config.messages.dates.pm = "pm";

merge(config.messages.tiddlerPopup,{
	});

merge(config.views.wikified.tag,{
	labelNoTags: "no tags",
	labelTags: "tags: ",
	openTag: "Open tag '%0'",
	tooltip: "Show pages tagged with '%0'",
	openAllText: "Open all",
	openAllTooltip: "Open all of these pages",
	popupNone: "No other pages tagged with '%0'"});

merge(config.views.wikified,{
	defaultText: "The page '%0' doesn't exist.",
	defaultModifier: "(missing)",
	shadowModifier: "(built-in shadow page)",
	dateFormat: "DD MMM YYYY",
	createdPrompt: "created"});

merge(config.views.editor,{
	tagPrompt: "Type tags separated with spaces, [[use double square brackets]] if necessary, or add existing",
	defaultText: "Type the text for '%0'"});

merge(config.views.editor.tagChooser,{
	text: "tags",
	tooltip: "Choose existing tags to add to this page",
	popupNone: "There are no tags defined",
	tagTooltip: "Add the tag '%0'"});

merge(config.messages,{
	sizeTemplates:
		[
		{unit: 1024*1024*1024, template: "%0\u00a0GB"},
		{unit: 1024*1024, template: "%0\u00a0MB"},
		{unit: 1024, template: "%0\u00a0KB"},
		{unit: 1, template: "%0\u00a0B"}
		]});

merge(config.macros.search,{
	label: "search",
	prompt: "Search this notebook",
	accessKey: "F",
	successMsg: "%0 pages found matching %1",
	failureMsg: "No pages found matching %0"});

merge(config.macros.tagging,{
	label: "tagging: ",
	labelNotTag: "not tagging",
	tooltip: "List of pages tagged with '%0'"});

merge(config.macros.timeline,{
	dateFormat: "DD MMM YYYY"});

merge(config.macros.allTags,{
	tooltip: "Show pages tagged with '%0'",
	noTags: "There are no tagged pages"});

config.macros.list.all.prompt = "All pages in alphabetical order";
config.macros.list.missing.prompt = "pages that have links to them but are not defined";
config.macros.list.orphans.prompt = "pages that are not linked to from any other pages";
config.macros.list.shadowed.prompt = "pages shadowed with default contents";
config.macros.list.touched.prompt = "pages that have been modified locally";

merge(config.macros.closeAll,{
	label: "close all",
	prompt: "Close all displayed pages (except any that are being edited)"});

merge(config.macros.permaview,{
	label: "permaview",
	prompt: "Link to an URL that retrieves all the currently displayed pages"});

merge(config.macros.saveChanges,{
	label: "save changes",
	prompt: "Save your notebook",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "new page",
	prompt: "Create a new page",
	title: "New page",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "new journal",
	prompt: "Create a new page from the current date and time",
	accessKey: "J"});

merge(config.macros.options,{
	wizardTitle: "Tweak advanced options",
	step1Title: "These options are saved in cookies in your browser",
	step1Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='false' name='chkUnknown'>Show unknown options</input>",
	unknownDescription: "//(unknown)//",
	listViewTemplate: {
		columns: [
			{name: 'Option', field: 'option', title: "Option", type: 'String'},
			{name: 'Description', field: 'description', title: "Description", type: 'WikiText'},
			{name: 'Name', field: 'name', title: "Name", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'}
			]}
	});

merge(config.macros.plugins,{
	wizardTitle: "Manage plugins",
	step1Title: "Currently loaded plugins",
	step1Html: "<input type='hidden' name='markList'></input>", // DO NOT TRANSLATE
	skippedText: "(This plugin has not been executed because it was added since startup)",
	noPluginText: "There are no plugins installed",
	confirmDeleteText: "Are you sure you want to delete these plugins:\n\n%0",
	removeLabel: "remove systemConfig tag",
	removePrompt: "Remove systemConfig tag",
	deleteLabel: "delete",
	deletePrompt: "Delete these pages forever",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Page", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "Size", type: 'Size'},
			{name: 'Forced', field: 'forced', title: "Forced", tag: 'systemConfigForce', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "Disabled", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "Loaded", type: 'Boolean', trueText: "Yes", falseText: "No"},
			{name: 'Startup Time', field: 'startupTime', title: "Startup Time", type: 'String'},
			{name: 'Error', field: 'error', title: "Status", type: 'Boolean', trueText: "Error", falseText: "OK"},
			{name: 'Log', field: 'log', title: "Log", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			]}
	});

merge(config.macros.toolbar,{
	moreLabel: "more",
	morePrompt: "Reveal further commands"
	});

merge(config.macros.refreshDisplay,{
	label: "refresh",
	prompt: "Redraw the entire TiddlyWiki display"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "You cannot import into a read-only TiddlyWiki file. Try opening it from a file:// URL",
	wizardTitle: "Import pages from another file or server",
	step1Title: "Step 1: Locate the server or TiddlyWiki file",
	step1Html: "Specify the type of the server: <select name='selTypes'><option value=''>Choose...</option></select><br>Enter the URL or pathname here: <input type='text' size=50 name='txtPath'><br>...or browse for a file: <input type='file' size=50 name='txtBrowse'><br><hr>...or select a pre-defined feed: <select name='selFeeds'><option value=''>Choose...</option></select>",
	openLabel: "open",
	openPrompt: "Open the connection to this file or server",
	openError: "There were problems fetching the tiddlywiki file",
	statusOpenHost: "Opening the host",
	statusGetWorkspaceList: "Getting the list of available workspaces",
	step2Title: "Step 2: Choose the workspace",
	step2Html: "Enter a workspace name: <input type='text' size=50 name='txtWorkspace'><br>...or select a workspace: <select name='selWorkspace'><option value=''>Choose...</option></select>",
	cancelLabel: "cancel",
	cancelPrompt: "Cancel this import",
	statusOpenWorkspace: "Opening the workspace",
	statusGetTiddlerList: "Getting the list of available pages",
	step3Title: "Step 3: Choose the pages to import",
	step3Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='true' name='chkSync'>Keep these pages linked to this server so that you can synchronise subsequent changes</input><br><input type='checkbox' name='chkSave'>Save the details of this server in a 'systemServer' page called:</input> <input type='text' size=25 name='txtSaveTiddler'>",
	importLabel: "import",
	importPrompt: "Import these pages",
	confirmOverwriteText: "Are you sure you want to overwrite these pages:\n\n%0",
	step4Title: "Step 4: Importing %0 page(s)",
	step4Html: "<input type='hidden' name='markReport'></input>", // DO NOT TRANSLATE
	doneLabel: "done",
	donePrompt: "Close this wizard",
	statusDoingImport: "Importing pages",
	statusDoneImport: "All pages imported",
	systemServerNamePattern: "%2 on %1",
	systemServerNamePatternNoWorkspace: "%1",
	confirmOverwriteSaveTiddler: "The page '%0' already exists. Click 'OK' to overwrite it with the details of this server, or 'Cancel' to leave it unchanged",
	serverSaveTemplate: "|''Type:''|%0|\n|''URL:''|%1|\n|''Workspace:''|%2|\n\nThis page was automatically created to record the details of this server",
	serverSaveModifier: "(System)",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Page", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "Size", type: 'Size'},
			{name: 'Tags', field: 'tags', title: "Tags", type: 'Tags'}
			],
		rowClasses: [
			]}
	});

merge(config.macros.upgrade,{
	wizardTitle: "Upgrade TiddlyWiki core code",
	step1Title: "Update or repair this TiddlyWiki to the latest release",
	step1Html: "You are about to upgrade to the latest release of the TiddlyWiki core code (from <a href='%0' class='externalLink' target='_blank'>%1</a>). This procedure does not affect the content you have created or imported.<br><br>[explain things a bit more]. ",
	upgradeLabel: "upgrade",
	upgradePrompt: "Start the upgrade process",
	statusPreparingBackup: "Preparing backup",
	statusSavingBackup: "Saving backup file",
	errorSavingBackup: "There was a problem saving the backup file",
	statusLoadingCore: "Loading core code",
	errorLoadingCore: "Error loading the core code",
	errorCoreFormat: "Error with the new core code",
	statusSavingCore: "Saving the new core code",
	statusReloadingCore: "Reloading the new core code"
	});

merge(config.macros.sync,{
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "page", type: 'Tiddler'},
			{name: 'Server Type', field: 'serverType', title: "Server type", type: 'String'},
			{name: 'Server Host', field: 'serverHost', title: "Server host", type: 'String'},
			{name: 'Server Workspace', field: 'serverWorkspace', title: "Server workspace", type: 'String'},
			{name: 'Status', field: 'status', title: "Synchronisation status", type: 'String'},
			{name: 'Server URL', field: 'serverUrl', title: "Server URL", text: "View", type: 'Link'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "Sync these pages", name: 'sync'}
			]},
	wizardTitle: "Synchronize with external servers and files",
	step1Title: "Choose the pages you want to synchronize",
	step1Html: "<input type='hidden' name='markList'></input>", // DO NOT TRANSLATE
	syncLabel: "sync",
	syncPrompt: "Sync these pages",
	hasChanged: "Changed while unplugged",
	hasNotChanged: "Unchanged while unplugged",
	syncStatusList: {
		none: {text: "...", color: "transparent"},
		changedServer: {text: "Changed on server", color: '#80ff80'},
		changedLocally: {text: "Changed while unplugged", color: '#80ff80'},
		changedBoth: {text: "Changed while unplugged and on server", color: '#ff8080'},
		notFound: {text: "Not found on server", color: '#ffff80'},
		putToServer: {text: "Saved update on server", color: '#ff80ff'},
		gotFromServer: {text: "Retrieved update from server", color: '#80ffff'}
		}
	});

merge(config.macros.annotations,{
	});

merge(config.commands.closeTiddler,{
	text: "close",
	tooltip: "Close this page"});

merge(config.commands.closeOthers,{
	text: "close others",
	tooltip: "Close all other pages"});

merge(config.commands.editTiddler,{
	text: "edit",
	tooltip: "Edit this page",
	readOnlyText: "view",
	readOnlyTooltip: "View the source of this page"});

merge(config.commands.saveTiddler,{
	text: "save",
	tooltip: "Save changes to this page"});

merge(config.commands.cancelTiddler,{
	text: "cancel",
	tooltip: "Undo changes to this page",
	warning: "Are you sure you want to abandon your changes to '%0'?",
	readOnlyText: "done",
	readOnlyTooltip: "View this page normally"});

merge(config.commands.deleteTiddler,{
	text: "delete",
	tooltip: "Delete this page",
	warning: "Are you sure you want to delete '%0'?"});

merge(config.commands.permalink,{
	text: "permalink",
	tooltip: "Permalink for this page"});

merge(config.commands.references,{
	text: "references",
	tooltip: "Show pages that link to this one",
	popupNone: "No references"});

merge(config.commands.jump,{
	text: "jump",
	tooltip: "Jump to another open page"});

merge(config.commands.syncing,{
	text: "syncing",
	tooltip: "Control synchronisation of this page with a server or external file",
	currentlySyncing: "<div>Currently syncing via <span class='popupHighlight'>'%0'</span> to:</"+"div><div>host: <span class='popupHighlight'>%1</span></"+"div><div>workspace: <span class='popupHighlight'>%2</span></"+"div>", // Note escaping of closing <div> tag
	notCurrentlySyncing: "Not currently syncing",
	captionUnSync: "Stop synchronising this page",
	chooseServer: "Synchronise this page with another server:",
	currServerMarker: "\u25cf ",
	notCurrServerMarker: "  "});

merge(config.commands.fields,{
	text: "fields",
	tooltip: "Show the extended fields of this page",
	emptyText: "There are no extended fields for this page",
	listViewTemplate: {
		columns: [
			{name: 'Field', field: 'field', title: "Field", type: 'String'},
			{name: 'Value', field: 'value', title: "Value", type: 'String'}
			],
		rowClasses: [
			],
		buttons: [
			]}});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "GettingStarted",
	MainMenu: "GettingStarted",
	SiteTitle: "My Offline Notebook",
	SiteSubtitle: "a reusable non-linear personal web notebook",
	SiteUrl: "http://www.tiddlywiki.com/",
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal "DD MMM YYYY" "journal">><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel "options �" "Change advanced options for your notebook">>',
	SideBarTabs: '<<tabs txtMainTab "Timeline" "Timeline" TabTimeline "All" "All pages" TabAll "Tags" "All tags" TabTags "More" "More lists" TabMore>>',
	TabMore: '<<tabs txtMoreTab "Missing" "Missing pages" TabMoreMissing "Orphans" "Orphaned pages" TabMoreOrphans "Shadowed" "Shadowed pages" TabMoreShadowed>>',
	ToolbarCommands: "|~ViewToolbar|closeTiddler closeOthers +editTiddler > fields syncing permalink references jump|\n|~EditToolbar|+saveTiddler -cancelTiddler deleteTiddler|"});

merge(config.annotations,{
	AdvancedOptions: "This shadow page provides access to several advanced options",
	ColorPalette: "These values in this shadow page determine the colour scheme of the ~TiddlyWiki user interface",
	DefaultTiddlers: "The pages listed in this shadow page will be automatically displayed when ~TiddlyWiki starts up",
	EditTemplate: "The HTML template in this shadow page determines how pages look while they are being edited",
	GettingStarted: "This shadow page provides basic usage instructions",
	ImportTiddlers: "This shadow page provides access to importing pages",
	MainMenu: "This shadow page is used as the contents of the main menu in the left-hand column of the screen",
	MarkupPreHead: "This page is inserted at the top of the <head> section of the TiddlyWiki HTML file",
	MarkupPostHead: "This page is inserted at the bottom of the <head> section of the TiddlyWiki HTML file",
	MarkupPreBody: "This page is inserted at the top of the <body> section of the TiddlyWiki HTML file",
	MarkupPostBody: "This page is inserted at the end of the <body> section of the TiddlyWiki HTML file immediately after the script block",
	OptionsPanel: "This shadow page is used as the contents of the options panel slider in the right-hand sidebar",
	PageTemplate: "The HTML template in this shadow page determines the overall ~TiddlyWiki layout",
	PluginManager: "This shadow page provides access to the plugin manager",
	SideBarOptions: "This shadow page is used as the contents of the option panel in the right-hand sidebar",
	SideBarTabs: "This shadow page is used as the contents of the tabs panel in the right-hand sidebar",
	SiteSubtitle: "This shadow page is used as the second part of the page title",
	SiteTitle: "This shadow page is used as the first part of the page title",
	SiteUrl: "This shadow page should be set to the full target URL for publication",
	StyleSheetColors: "This shadow page contains CSS definitions related to the color of page elements. ''DO NOT EDIT THIS page'', instead make your changes in the StyleSheet shadow page",
	StyleSheet: "This page can contain custom CSS definitions",
	StyleSheetLayout: "This shadow page contains CSS definitions related to the layout of page elements. ''DO NOT EDIT THIS page'', instead make your changes in the StyleSheet shadow page",
	StyleSheetLocale: "This shadow page contains CSS definitions related to the translation locale",
	StyleSheetPrint: "This shadow page contains CSS definitions for printing",
	TabAll: "This shadow page contains the contents of the 'All' tab in the right-hand sidebar",
	TabMore: "This shadow page contains the contents of the 'More' tab in the right-hand sidebar",
	TabMoreMissing: "This shadow page contains the contents of the 'Missing' tab in the right-hand sidebar",
	TabMoreOrphans: "This shadow page contains the contents of the 'Orphans' tab in the right-hand sidebar",
	TabMoreShadowed: "This shadow page contains the contents of the 'Shadowed' tab in the right-hand sidebar",
	TabTags: "This shadow page contains the contents of the 'Tags' tab in the right-hand sidebar",
	TabTimeline: "This shadow page contains the contents of the 'Timeline' tab in the right-hand sidebar",
	ToolbarCommands: "This shadow page determines which commands are shown in page toolbars",
	ViewTemplate: "The HTML template in this shadow page determines how pages look"
	});

