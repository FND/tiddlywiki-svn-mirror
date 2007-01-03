/***
|''Name:''|SpanishTranslationPlugin|
|''Description:''|Translation of TiddlyWiki into Spanish|
|''Source:''|www.checkettsweb.com|
|''Author:''|ClintChecketts (http://blog.checkettsweb.com/contact/)|
|''Version:''|1.0.0|
|''Date:''|Jan 02, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''Credit:''|This translation is thanks to the work of real Spanish speakers like sb56637 and Dave Gifford and Kendersec|
|''~CoreVersion:''|2.1.0|
***/

/*{{{*/
// Translateable strings
// ---------------------

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

merge(config.options,{
	txtUserName: "TuNombre"});

merge(config.messages,{
	customConfigError: "Habia problemas cargando plugins. Vea el PluginManager por detalles",
	pluginError: "Error: %0",
	pluginDisabled: "No executado porque esta apagado via la marca 'systemConfigDisable'",
	pluginForced: "Executado porque forzado por la marca 'systemConfigForce'",
//	pluginVersionError: "Not executed because this plugin needs a newer version of TiddlyWiki",
//	nothingSelected: "Nothing is selected. You must select one or more items first",
//	savedSnapshotError: "It appears that this TiddlyWiki has been incorrectly saved. Please see http://www.tiddlywiki.com/#DownloadSoftware for details",
//	subtitleUnknown: "(unknown)",
//	undefinedTiddlerToolTip: "The tiddler '%0' doesn't yet exist",
//	shadowedTiddlerToolTip: "The tiddler '%0' doesn't yet exist, but has a pre-defined shadow value",
//	tiddlerLinkTooltip: "%0 - %1, %2",
//	externalLinkTooltip: "External link to %0",
//	noTags: "There are no tagged tiddlers",
//	notFileUrlError: "You need to save this TiddlyWiki to a file before you can save changes",
//	cantSaveError: "It's not possible to save changes. This could be because your browser doesn't support saving (instead, use FireFox if you can), or because the pathname to your TiddlyWiki file contains illegal characters",
//	invalidFileError: "The original file '%0' does not appear to be a valid TiddlyWiki",
//	backupSaved: "Backup saved",
//	backupFailed: "Failed to save backup file",
//	rssSaved: "RSS feed saved",
//	rssFailed: "Failed to save RSS feed file",
//	emptySaved: "Empty template saved",
//	emptyFailed: "Failed to save empty template file",
//	mainSaved: "Main TiddlyWiki file saved",
//	mainFailed: "Failed to save main TiddlyWiki file. Your changes have not been saved",
//	macroError: "Error in macro <<%0>>",
//	macroErrorDetails: "Error while executing macro <<%0>>:\n%1",
//	missingMacro: "No such macro",
//	overwriteWarning: "A tiddler named '%0' already exists. Choose OK to overwrite it",
//	unsavedChangesWarning: "WARNING! There are unsaved changes in TiddlyWiki\n\nChoose OK to save\nChoose CANCEL to discard",
//	confirmExit: "--------------------------------\n\nThere are unsaved changes in TiddlyWiki. If you continue you will lose those changes\n\n--------------------------------",
//	saveInstructions: "SaveChanges",
//	unsupportedTWFormat: "Unsupported TiddlyWiki format '%0'",
//	tiddlerSaveError: "Error when saving tiddler '%0'",
//	tiddlerLoadError: "Error when loading tiddler '%0'",
//	wrongSaveFormat: "Cannot save with storage format '%0'. Using standard format for save.",
//	invalidFieldName: "Invalid field name %0",
	fieldCannotBeChanged: "Area '%0' no puede ser cambiado"});

merge(config.messages.messageClose,{
	text: "cerrar",
	tooltip: "cerrar este mensaje"});

config.messages.dates.months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Augusto", "Septiembre", "Octubre", "Noviembre","Diciembre"];

config.messages.dates.days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
config.messages.dates.shortMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
config.messages.dates.shortDays = ["Dom", "Lun", "Mar", "Mier", "Jue", "Vie", "Sab"];
// suffixes for dates, eg "1st","2nd","3rd"..."30th","31st"
config.messages.dates.daySuffixes = ["o","o","o","o","o","o","o","o","o","o",
		"o","o","o","o","o","o","o","o","o","o",
		"o","o","o","o","o","o","o","o","o","o",
		"o"];
config.messages.dates.am = "am";
config.messages.dates.pm = "pm";
/*
merge(config.views.wikified.tag,{
	labelNoTags: "no tags",
	labelTags: "tags: ",
	openTag: "Open tag '%0'",
	tooltip: "Show tiddlers tagged with '%0'",
	openAllText: "Open all",
	openAllTooltip: "Open all of these tiddlers",
	popupNone: "No other tiddlers tagged with '%0'"});

merge(config.views.wikified,{
	defaultText: "The tiddler '%0' doesn't yet exist. Double-click to create it",
	defaultModifier: "(missing)",
	shadowModifier: "(built-in shadow tiddler)",
	dateFormat: "DD MMM YYYY",
	createdPrompt: "created"});

merge(config.views.editor,{
	tagPrompt: "Type tags separated with spaces, [[use double square brackets]] if necessary, or add existing",
	defaultText: "Type the text for '%0'"});

merge(config.views.editor.tagChooser,{
	text: "tags",
	tooltip: "Choose existing tags to add to this tiddler",
	popupNone: "There are no tags defined",
	tagTooltip: "Add the tag '%0'"});

merge(config.macros.search,{
	label: "search",
	prompt: "Search this TiddlyWiki",
	accessKey: "F",
	successMsg: "%0 tiddlers found matching %1",
	failureMsg: "No tiddlers found matching %0"});

merge(config.macros.tagging,{
	label: "tagging: ",
	labelNotTag: "not tagging",
	tooltip: "List of tiddlers tagged with '%0'"});

merge(config.macros.timeline,{
	dateFormat: "DD MMM YYYY"});

merge(config.macros.allTags,{
	tooltip: "Show tiddlers tagged with '%0'",
	noTags: "There are no tagged tiddlers"});

config.macros.list.all.prompt = "All tiddlers in alphabetical order";
config.macros.list.missing.prompt = "Tiddlers that have links to them but are not defined";
config.macros.list.orphans.prompt = "Tiddlers that are not linked to from any other tiddlers";
config.macros.list.shadowed.prompt = "Tiddlers shadowed with default contents";

merge(config.macros.closeAll,{
	label: "close all",
	prompt: "Close all displayed tiddlers (except any that are being edited)"});

merge(config.macros.permaview,{
	label: "permaview",
	prompt: "Link to an URL that retrieves all the currently displayed tiddlers"});

merge(config.macros.saveChanges,{
	label: "save changes",
	prompt: "Save all tiddlers to create a new TiddlyWiki",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "new tiddler",
	prompt: "Create a new tiddler",
	title: "New Tiddler",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "new journal",
	prompt: "Create a new tiddler from the current date and time",
	accessKey: "J"});

merge(config.macros.plugins,{
	skippedText: "(This plugin has not been executed because it was added since startup)",
	noPluginText: "There are no plugins installed",
	confirmDeleteText: "Are you sure you want to delete these tiddlers:\n\n%0",
	listViewTemplate : {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', tiddlerLink: 'title', title: "Title", type: 'TiddlerLink'},
			{name: 'Forced', field: 'forced', title: "Forced", tag: 'systemConfigForce', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "Disabled", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "Loaded", type: 'Boolean', trueText: "Yes", falseText: "No"},
			{name: 'Error', field: 'error', title: "Status", type: 'Boolean', trueText: "Error", falseText: "OK"},
			{name: 'Log', field: 'log', title: "Log", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			],
		actions: [
			{caption: "More actions...", name: ''},
			{caption: "Remove systemConfig tag", name: 'remove'},
			{caption: "Delete these tiddlers forever", name: 'delete'}
			]}
	});

merge(config.macros.refreshDisplay,{
	label: "refresh",
	prompt: "Redraw the entire TiddlyWiki display"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "You cannot import tiddlers into a read-only TiddlyWiki. Try opening the TiddlyWiki file from a file:// URL",
	defaultPath: "http://www.tiddlywiki.com/index.html",
	fetchLabel: "fetch",
	fetchPrompt: "Fetch the tiddlywiki file",
	fetchError: "There were problems fetching the tiddlywiki file",
	confirmOverwriteText: "Are you sure you want to overwrite these tiddlers:\n\n%0",
	wizardTitle: "Import tiddlers from another TiddlyWiki file",
	step1: "Step 1: Locate the TiddlyWiki file",
	step1prompt: "Enter the URL or pathname here: ",
	step1promptFile: "...or browse for a file: ",
	step1promptFeeds: "...or select a pre-defined feed: ",
	step1feedPrompt: "Choose...",
	step2: "Step 2: Loading TiddlyWiki file",
	step2Text: "Please wait while the file is loaded from: %0",
	step3: "Step 3: Choose the tiddlers to import",
	step4: "%0 tiddler(s) imported",
	step5: "Done",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', title: "Title", type: 'String'},
			{name: 'Snippet', field: 'text', title: "Snippet", type: 'String'},
			{name: 'Tags', field: 'tags', title: "Tags", type: 'Tags'}
			],
		rowClasses: [
			],
		actions: [
			{caption: "More actions...", name: ''},
			{caption: "Import these tiddlers", name: 'import'}
			]}
	});
*/
merge(config.commands.closeTiddler,{
	text: "cerrar",
	tooltip: "Cerrar este tiddler"});

merge(config.commands.closeOthers,{
	text: "cerrar otros",
	tooltip: "Cerrar todos los demás tiddlers"});

merge(config.commands.editTiddler,{
	text: "editar",
	tooltip: "Editar este tiddler",
	readOnlyText: "ver",
	readOnlyTooltip: "Ver el código de este tiddler"});

merge(config.commands.saveTiddler,{
	text: "guardar",
	tooltip: "Guardar los cambios realizados en este tiddler"});

merge(config.commands.cancelTiddler,{
	text: "cancelar",
	tooltip: "Deshacer los cambios de este tiddler",
	warning: "Estas seguro que quieres abandonar to cambios a '%0'?",
	readOnlyText: "hecho",
	readOnlyTooltip: "Ver este tiddler"});

merge(config.commands.deleteTiddler,{
	text: "borrar",
	tooltip: "Borrar este tiddler",
	warning: "Estas seguro de que quieres borrar '%0'?"});

merge(config.commands.permalink,{
	text: "permaenlace",
	tooltip: "Permaenlace para este tiddler"});

merge(config.commands.references,{
	text: "referencias",
	tooltip: "Ver los tiddlers que hacen referencia a este tiddler",
	popupNone: "No hay referencias"});

merge(config.commands.jump,{
	text: "saltar",
	tooltip: "Saltar a otro tiddler abierto"});

merge(config.shadowTiddlers,{
	OpcionesDeLaInterfaz: "Las OpcionesDeLaInterfaz estan mostrados cuando tu haces 'clic' las boton 'opciones' al lado derecha. Se guarden en un cookie de tu browser de web, entonces ellos regressan cada visita:\n<<<\n<<tiddler OptionsPanel>>\n<<<\n* El nombre usario por cambios debe estar fija //antes de// empezar haciendo cambios al texto (si. otra bug)\n* GuardarRespaldos da la opcion a guardar respaldos\n* AutoGuardar da la opcion a guardar cada vez hay un cambio\n* BuscarRegExp permite búsquedas complejas\n* BusquedaSensibleMayus enforza que the busqueda respecta mayusculas\n",
	DefaultTiddlers: "ComoEmpezar",
	MainMenu: "ComoEmpezar",
	SiteTitle: "Mi TiddlyWiki",
	SiteSubtitle: "un cuaderno personal de web que se recicla",
	SiteUrl: "http://www.tiddlywiki.com/",
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal "DD MMM YYYY">><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel "opciones »" "Modificar las opciones avanzadas de TiddlyWiki">>',
	SideBarTabs: '<<tabs txtMainTab Fecha "Tiddlers cronológicamente" TabTimeline "Título" "Tiddlers por título" TabAll "Etiquetas" "Tiddlers que estén etiquetados" TabTags "Más" "Más listas" TabMore>>',
	TabTimeline: '<<timeline>>',
	TabAll: '<<list all>>',
	TabTags: '<<allTags excludeLists>>',
	TabMore: '<<tabs txtMoreTab "Perdido" "Tiddlers que no existen" TabMoreMissing "Huérfanos" "Tiddlers que no han sido enlazados por ningún otro tiddler" TabMoreOrphans "Ocultos" "Tiddlers ocultados" TabMoreShadowed>>',
	TabMoreMissing: '<<list missing>>',
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	PluginManager: '<<plugins>>',
	ImportTiddlers: '<<importTiddlers>>'});

/*}}}*/
