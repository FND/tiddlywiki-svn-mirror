/***
|''Name:''|SpanishTranslationPlugin|
|''Description:''|Translation of TiddlyWiki into Spanish|
|''Author:''|ClintChecketts (http://blog.checkettsweb.com/contact/)|
|''Source:''|www.checkettsweb.com|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/association/locales/core/es/locale.es.js|
|''Version:''|1.0.0|
|''Date:''|Jan 12, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''Credit:''|This translation is thanks to the work of real Spanish speakers like jotarp, sb56637 and Dave Gifford and Kendersec|
|''~CoreVersion:''|2.1.0|

Se han traducido todos los textos con posibilidad de traducción, incluidos los 'tiddlers' AdvancedOptions PluginManager e ImportTiddlers, salvo las palabras 'tiddler' y 'plugin'.

Hay algunas palabras y expresiones cuya traducción puede estar sujeta a discusión. Estas son las traducciones por las que he optado:

|!original|!traducción|
|Backup|Respaldo|
|GettingStarted|EmpieceAquí|
|built-in shadow tiddler|tiddler oculto incluido|

***/

/*{{{*/
// Translateable strings
// ---------------------

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

config.locale = "es"; // W3C language tag

merge(config.options,{
	txtUserName: "SuNombre"});

merge(config.tasks,{
    save: {text: "guardar", tooltip: "Guarda los cambios de este TiddlyWiki", action: saveChanges},
    tidy: {text: "manipular", tooltip: "Hacer cambios en masa a grupos de tiddlers", content: 'Pr�ximamente...\n\nEsta pesta�a permitir� hacer varias operaciones sobre tiddlers y etiquetas. Ser� una versi�n generalizada y extensible de la pesta�a plugins'},
    sync: {text: "sinc", tooltip: "Sincronizar cambios con otros archivos y servidores TiddlyWiki", content: '<<sync>>'},
    importTask: {text: "importar", tooltip: "Importar tiddlers y plugins desde otros archivos y servidores TiddlyWiki", content: '<<importTiddlers>>'},
    copy: {text: "copiar", tooltip: "Copiar tiddlers a otros archivos y servidores TiddlyWiki", content: 'Pr�ximamente...\n\nEsta pesta�a permitir� copiar tiddlers a servidores remotos'},
    tweak: {text: "afinar", tooltip: "Afinar la apariencia y el comportamiento de TiddlyWiki", content: '<<options>>'},
    plugins: {text: "plugins", tooltip: "Administrar los plugins instalados", content: '<<plugins>>'}
});

merge(config.messages,{
	customConfigError: "Se han encontrado problemas cargando plugins. Ver detalles en AdministrarPlugins",
	pluginError: "Error: %0",
	pluginDisabled: "No ejecutado por estar desactivado con la etiqueta 'systemConfigDisable'",
	pluginForced: "Ejecución forzada por la etiqueta 'systemConfigForce'",
	pluginVersionError: "No ejecutado porque este plugin necesita una versión más reciente de TiddlyWiki",
	nothingSelected: "Nada seleccionado. Primero debe seleccionar uno o más elementos",
	savedSnapshotError: "Parece que este TiddlyWiki se ha guardado de forma incorrecta. Por favor, ver http://www.tiddlywiki.com/#DownloadSoftware",
	subtitleUnknown: "(sin nombre)",
	undefinedTiddlerToolTip: "El tiddler '%0' no existe todavía",
	shadowedTiddlerToolTip: "El tiddler '%0' no existe todavía, pero tiene un valor predefinido oculto",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "Enlace externo a %0",
	noTags: "No hay tiddlers etiquetados",
	notFileUrlError: "Necesita guardar este TiddlyWiki a un archivo antes de poder guardar los cambios",
	cantSaveError: "No es posible guardar los cambios. Puede deberse a que su navegador no puede (si es el caso, use Firefox si es posible), o porque la ruta al archivo TiddlyWiki contiene algún caracter ilegal",
	invalidFileError: "El archivo original '%0' no parece ser un TiddlyWiki válido",
	backupSaved: "Respaldo guardado",
	backupFailed:  "Falló al guardar el archivo de respaldo",
	rssSaved: "Fuente RSS guardada",
	rssFailed: "Falló al guardar el archivo fuente de RSS",
	emptySaved: "Plantilla vacía guardada",
	emptyFailed: "Falló al guardar el archivo de plantilla vacía",
	mainSaved: "TiddlyWiki guardado",
	mainFailed: "Falló al guardar el archivo TiddlyWiki. Sus cambios no se han guardado",
	macroError: "Error en la macro <<%0>>",
	macroErrorDetails: "Error mientras se ejecutaba la macro <<%0>>:\n%1",
	missingMacro: "No existe la macro",
	overwriteWarning: "Ya existe un tiddler llamado '%0'. Elija OK para sobreescribirlo",
	unsavedChangesWarning: "¡ATENCIN! Hay cambios sin guardar en este TiddlyWiki\n\nElija OK para guardar\nElija CANCEL para descartar",
	confirmExit: "--------------------------------\n\nHay cambios sin guardar en este TiddlyWiki. Si continua perderá los cambios\n\n--------------------------------",
	saveInstructions: "GuardarCambios",
	unsupportedTWFormat: "Formato de TiddlyWiki no soportado '%0'",
	tiddlerSaveError: "Error al guardar el tiddler '%0'",
	tiddlerLoadError: "Error al cargar el tiddler '%0'",
	wrongSaveFormat: "No se puede guardar con el formato '%0'. Se usará el formato estándar para guardar.",
	invalidFieldName: "Nombre de campo incorrecto %0",
	fieldCannotBeChanged: "No se puede cambiar el campo '%0'",
	backstagePrompt: "backstage: "});

merge(config.messages.messageClose,{
	text: "cerrar",
	tooltip: "cerrar este mensaje"});

config.messages.dates.months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre","Diciembre"];
config.messages.dates.days = ["Domingo", "Lunes","Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
config.messages.dates.shortMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
config.messages.dates.shortDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"];
// suffixes for dates, eg "1st","2nd","3rd"..."30th","31st"
config.messages.dates.daySuffixes = ["o","o","o","o","o","o","o","o","o","o",
		"o","o","o","o","o","o","o","o","o","o",
		"o","o","o","o","o","o","o","o","o","o",
		"o"];
config.messages.dates.am = "am";
config.messages.dates.pm = "pm";

merge(config.views.wikified.tag,{
	labelNoTags: "sin etiquetas",
	labelTags: "etiquetas: ",
	openTag: "Abrir etiqueta '%0'",
	tooltip: "Abrir tiddlers etiquetados con '%0'",
	openAllText: "Abrir todos",
	openAllTooltip: "Abrir todos estos tiddlers",
	popupNone: "Ningún otro tiddler etiquetado con '%0'"});

merge(config.views.wikified,{
	defaultText: "El tiddler '%0' no existe. Haga doble clic para crearlo.",
	defaultModifier: "(falta)",
	shadowModifier: "(tiddler oculto incluido)",
	dateFormat: "DD MMM YYYY",
	createdPrompt: "creado"});

merge(config.views.editor,{
	tagPrompt: "Teclee etiquetas separadas por espacios, [[use dobles corchetes si es necesario]], o añada alguna existente",
	defaultText: "Teclee el texto de '%0'"});

merge(config.views.editor.tagChooser,{
	text: "etiquetas",
	tooltip: "Elija qué etiquetas existentes añadir a este tiddler",
	popupNone: "No hay etiquetas definidas",
	tagTooltip: "Añadir la etiqueta '%0'"});

merge(config.macros.search,{
	label: "buscar",
	prompt: "Buscar en este TiddlyWiki",
	accessKey: "F",
	successMsg: "%0 tiddlers encontrados buscando %1",
	failureMsg: "No se encontraron tiddlers buscando %0"});

merge(config.macros.tagging,{
	label: "tagging: ",
	labelNotTag: "not tagging",
	tooltip: "Lista de tiddlers con etiqueta '%0'"});

merge(config.macros.timeline,{
	dateFormat: "DD MMM YYYY"});

merge(config.macros.allTags,{
	tooltip: "Abrir tiddlers etiquetados con '%0'",
	noTags: "No hay tiddlers etiquetados"});

config.macros.list.all.prompt = "Todos los tiddlers en orden alfabético";
config.macros.list.missing.prompt = "Tiddlers que tienen enlaces a ellos pero no existen";
config.macros.list.orphans.prompt = "Tiddlers que no tienen enlaces de ningún otro tiddler";
config.macros.list.shadowed.prompt = "Tiddlers ocultos con contenido por defecto";

merge(config.macros.closeAll,{
	label: "cerrar todos",
	prompt: "Cerrar todos los tiddlers mostrados (excepto los que están siendo editados)"});

merge(config.macros.permaview,{
	label: "permaview",
	prompt: "Enlace a una URL que devuelve todos los tiddlers actualmente mostrados"});

merge(config.macros.saveChanges,{
	label: "guardar cambios",
	prompt: "Guarda todos los tiddlers para crear un nuevo TiddlyWiki",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "nuevo tiddler",
	prompt: "Crear un nuevo tiddler",
	title: "Nuevo Tiddler",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "nuevo diario",
	prompt: "Crear un nuevo tiddler con la fecha y hora actual",
	accessKey: "J"});

merge(config.macros.plugins,{
	wizardTitle: "Manage plugins",
	step1Title: "Currently loaded plugins",
	step1Html: "<input type='hidden' name='markList'></input>",
	skippedText: "(Este plugin no se ha ejecutado porque se ha añadido después de la carga inicial)",
	noPluginText: "No hay plugins instalados",
	confirmDeleteText: "¿Está seguro que quiere borrar estos tiddlers:\n\n%0",
	removeLabel: "borrar la etiqueta systemConfig",
	removePrompt: "Borrar la etiqueta systemConfig",
	deleteLabel: "borrar",
	deletePrompt: "Borrar estos tiddlers para siempre",
	listViewTemplate : {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', tiddlerLink: 'title', title: "Nombre", type: 'TiddlerLink'},
			{name: 'Forced', field: 'forced', title: "Forzado", tag: 'systemConfigForce', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "Deshabilitado", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "Cargado", type: 'Boolean', trueText: "Yes", falseText: "No"},
			{name: 'Error', field: 'error', title: "Estado", type: 'Boolean', trueText: "Error", falseText: "OK"},
			{name: 'Log', field: 'log', title: "Historial", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			]}
	});

merge(config.macros.refreshDisplay,{
	label: "refrescar",
	prompt: "Redibuja el TiddlyWiki entero"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "No se pueden importar tiddlers en un TiddlyWiki de sólo lectura. Intente abrir el archivo TiddlyWiki desde una URL file://",
	wizardTitle: "Importa tiddlers desde otro TiddlyWiki",
	step1Title: "Paso 1: Localizar el fichero TiddlyWiki",
	step1Html: "Introduzca el URL o ruta al archivo aquí: <input type='text' size=50 name='txtPath'><br>...o busque el archivo: <input type='file' size=50 name='txtBrowse'><br>...o seleccione uno de los fuentes predefinidos: <select name='selFeeds'><option value=''>Elija...</option</select>",
	fetchLabel: "obtener",
	fetchPrompt: "Obtener el archivo tiddlywiki ",
	fetchError: "Hubo problemas obteniendo el archivo tiddlywiki",
	step2Title: "Paso 2: Cargar el archivo TiddlyWiki",
	step2Html: "Por favor, espere mientras se carga el archivo desde: <strong><input type='hidden' name='markPath'></input></strong>",
	cancelLabel: "cancel",
	cancelPrompt: "Cancel this import",
	step3Title: "Paso 3: Elegir los tiddlers a importar",
	step3Html: "<input type='hidden' name='markList'></input>",
	importLabel: "import",
	importPrompt: "Import these tiddlers",
	confirmOverwriteText: "¿Está seguro de que quiere sobreescribir estos tiddlers:\n\n%0",
	step4Title: "%0 tiddler(s) importados",
	step4Html: "<input type='hidden' name='markReport'></input>",
	doneLabel: "hecho",
	donePrompt: "Close this wizard",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', title: "Nombre", type: 'String'},
			{name: 'Snippet', field: 'text', title: "Recorte", type: 'String'},
			{name: 'Tags', field: 'tags', title: "Etiquetas", type: 'Tags'}
			],
		rowClasses: [
			]}
	});

merge(config.macros.sync,{
    listViewTemplate: {
        columns: [
            {name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
            {name: 'Title', field: 'title', tiddlerLink: 'title', title: "Nombre", type: 'TiddlerLink'},
            {name: 'Local Status', field: 'localStatus', title: "�Cambiado en su PC?", type: 'String'},
            {name: 'Server Status', field: 'serverStatus', title: "�Cambiado en el servidor?", type: 'String'},
            {name: 'Server URL', field: 'serverUrl', title: "URL servidor", text: "View", type: 'Link'}
            ],
        rowClasses: [
            ],
        buttons: [
            {caption: "Sincronizar estos tiddlers", name: 'sync'}
            ]},
    wizardTitle: "Sincronizar el contenido con servidores y fuentes externos",
    step1Title: "Elija los tiddlers que quiere sincronizar",
    step1Html: '<input type="hidden" name="markList"></input>',
    syncLabel: "sinc",
    syncPrompt: "Sincronizar estos tiddlers"
});

merge(config.commands.closeTiddler,{
	text: "cerrar",
	tooltip: "Cerrar este tiddler"});

merge(config.commands.closeOthers,{
	text: "cerrar otros",
	tooltip: "Cerrar todos los otros tiddlers"});

merge(config.commands.editTiddler,{
	text: "editar",
	tooltip: "Editar este tiddler",
	readOnlyText: "ver",
	readOnlyTooltip: "Ver el fuente de este tiddler"});

merge(config.commands.saveTiddler,{
	text: "hecho",
	tooltip: "Guardar cambios en este tiddler"});

merge(config.commands.cancelTiddler,{
	text: "cancelar",
	tooltip: "Deshacer cambios en este tiddler",
	warning: "¿Está seguro que quiere perder los cambios hechos en '%0'?",
	readOnlyText: "hecho",
	readOnlyTooltip: "Ver este tiddler normalmente"});

merge(config.commands.deleteTiddler,{
	text: "borrar",
	tooltip: "Borrar este tiddler",
	warning: "¿Está seguro que quiere borrar '%0'?"});

merge(config.commands.permalink,{
	text: "permaenlace",
	tooltip: "Enlace permanente a este tiddler"});

merge(config.commands.references,{
	text: "referencias",
	tooltip: "Muestra los tiddlers que enlazan a este",
	popupNone: "No hay referencias"});

merge(config.commands.jump,{
	text: "saltar",
	tooltip: "Salta a otro tiddler abierto"});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "[[EmpieceAquí]]",
	MainMenu: "[[EmpieceAquí]]",
	SiteTitle: "Mi TiddlyWiki",
	SiteSubtitle: "un bloc de notas reusable personal no-lineal sobre web",
	SiteUrl: "http://www.tiddlywiki.com/",
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal "DD MMM YYYY">><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel "opciones »" "Cambiar opciones avanzadas de TiddlyWiki">>',
	SideBarTabs: '<<tabs txtMainTab "Fecha" "Tiddlers cronológicamente" TabTimeline "Título" "Tiddlers por título" TabAll "Etiquetas" "Todas las etiquetas" TabTags "Más" "Más listas" TabMore>>',
	TabTimeline: '<<timeline>>',
	TabAll: '<<list all>>',
	TabTags: '<<allTags excludeLists>>',
	TabMore: '<<tabs txtMoreTab "Perdidos" "Tiddlers que no existen" TabMoreMissing "Huérfanos" "Tiddlers no enlazados por ningún otro" TabMoreOrphans "Ocultos" "Tiddlers ocultos" TabMoreShadowed>>',
	TabMoreMissing: '<<list missing>>',
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	PluginManager: '<<plugins>>',
	ImportTiddlers: '<<importTiddlers>>'});

/*}}}*/
