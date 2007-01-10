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
	txtUserName: "SuNombre"});

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
	unsavedChangesWarning: "¡ATENCIÓN! Hay cambios sin guardar en este TiddlyWiki\n\nElija OK para guardar\nElija CANCEL para descartar",
	confirmExit: "--------------------------------\n\nHay cambios sin guardar en este TiddlyWiki. Si continua perderá los cambios\n\n--------------------------------",
	saveInstructions: "GuardarCambios",
	unsupportedTWFormat: "Formato de TiddlyWiki no soportado '%0'",
	tiddlerSaveError: "Error al guardar el tiddler '%0'",
	tiddlerLoadError: "Error al cargar el tiddler '%0'",
	wrongSaveFormat: "No se puede guardar con el formato '%0'. Se usará el formato estándar para guardar.",
	invalidFieldName: "Nombre de campo incorrecto %0",
	fieldCannotBeChanged: "No se puede cambiar el campo '%0'"});

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
	skippedText: "(Este plugin no se ha ejecutado porque se ha añadido después de la carga inicial)",
	noPluginText: "No hay plugins instalados",
	confirmDeleteText: "¿Está seguro que quiere borrar estos tiddlers:\n\n%0",
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
			],
		actions: [
			{caption: "Más acciones...", name: ''},
			{caption: "Borrar la etiqueta systemConfig", name: 'remove'},
			{caption: "Borrar estos tiddlers para siempre", name: 'delete'}
			]}
	});

merge(config.macros.refreshDisplay,{
	label: "refrescar",
	prompt: "Redibuja el TiddlyWiki entero"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "No se pueden importar tiddlers en un TiddlyWiki de sólo lectura. Intente abrir el archivo TiddlyWiki desde una URL file://",
	defaultPath: "http://www.tiddlywiki.com/index.html",
	fetchLabel: "obtener",
	fetchPrompt: "Obtener el archivo tiddlywiki ",
	fetchError: "Hubo problemas obteniendo el archivo tiddlywiki",
	confirmOverwriteText: "¿Está seguro de que quiere sobreescribir estos tiddlers:\n\n%0",
	wizardTitle: "Importa tiddlers desde otro TiddlyWiki",
	step1: "Paso 1: Localizar el fichero TiddlyWiki",
	step1prompt: "Introduzca el URL o ruta al archivo aquí: ",
	step1promptFile: "...o busque el archivo: ",
	step1promptFeeds: "...o seleccione uno de los fuentes predefinidos: ",
	step1feedPrompt: "Elija...",
	step2: "Paso 2: Cargar el archivo TiddlyWiki",
	step2Text: "Por favor, espere mientras se carga el archivo desde: %0",
	step3: "Paso 3: Elegir los tiddlers a importar",
	step4: "%0 tiddler(s) importados",
	step5: "Hecho",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', title: "Nombre", type: 'String'},
			{name: 'Snippet', field: 'text', title: "Recorte", type: 'String'},
			{name: 'Tags', field: 'tags', title: "Etiquetas", type: 'Tags'}
			],
		rowClasses: [
			],
		actions: [
			{caption: "Más acciones...", name: ''},
			{caption: "Importar estos tiddlers", name: 'import'}
			]}
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
	OpcionesDeLaInterfaz: "Las OpcionesDeLaInterfaz estan mostrados cuando tu haces 'clic' las boton 'opciones' al lado derecha. Se guarden en un cookie de tu browser de web, entonces ellos regressan cada visita:\n<<<\n<<tiddler OptionsPanel>>\n<<<\n* El nombre usario por cambios debe estar fija //antes de// empezar haciendo cambios al texto (si. otra bug)\n* GuardarRespaldos da la opcion a guardar respaldos\n* AutoGuardar da la opcion a guardar cada vez hay un cambio\n* BuscarRegExp permite búsquedas complejas\n* BusquedaSensibleMayus enforza que the busqueda respecta mayusculas\n",
	DefaultTiddlers: "EmpieceAquí [[Ayuda]]",
	MainMenu: "EmpieceAquí [[Ayuda]]",
	SiteTitle: "Mi TiddlyWiki",
	SiteSubtitle: "un bloc de notas reusable personal no-lineal sobre web",
	SiteUrl: "http://www.tiddlywiki.com/",
	EmpieceAquí: "Para empezar con este TiddlyWiki vacío, necesita modificar los siguientes tiddlers:\n* SiteTitle & SiteSubtitle: El título y subtítulo del sitio, mostrados arriba (después de guardar, también aparecerán en la barra de título del navegador)\n* MainMenu: El menú (habitualmente a la izquierda)\n* DefaultTiddlers: Contiene los nombres de los tiddlers que quiere que aparezcan cuando el TiddlyWiki se abre\nIntroduzca su nombre para firmar las modificaciones que haga: <<option txtUserName>>",
	SideBarOptions: "<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal 'DD MMM YYYY'>><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel 'opciones »' 'Cambiar opciones avanzadas de TiddlyWiki'>>",
	OptionsPanel: "Estas opciones para personalizar TiddlyWiki están guardadas en su navegador\n\nSu nombre, para firmar sus textos. Escríbalo como una PalabraWiki (eg FulanoDeTal)\n\n<<option txtUserName>>\n<<option chkSaveBackups>> GuardarRespaldos\n<<option chkAutoSave>> AutoGuardar\n<<option chkRegExpSearch>> BuscarExpReg\n<<option chkCaseSensitiveSearch>> BuscarDiferMays\n<<option chkAnimate>> ActivarAnimaciones\n\n----\nOpcionesAvanzadas\nAdministrarPlugins\nImportarTiddlers",
	OpcionesAvanzadas: "<<option chkGenerateAnRssFeed>> GenerarUnRssFeed\n<<option chkOpenInNewWindow>> AbrirEnlacesEnVentanaNueva\n<<option chkSaveEmptyTemplate>> GuardarPlantillaVacía\n<<option chkToggleLinks>> Al pulsar en un enlace a un tiddler ya abierto, se cierra.\n^^(desactivar con Control u otra tecla modificadora)^^\n<<option chkHttpReadOnly>> OcultarPosibilidadDeEdición cuando se abra por HTTP\n<<option chkForceMinorUpdate>> Tratar ediciones como CambiosMenores guardando día y hora\n^^(desactivar con Mays al pulsar en 'hecho' o pulsando Ctrl-Mays-Enter^^\n<<option chkConfirmDelete>> ConfirmarAntesDeBorrar\nNúmero máximo de líneas en la caja de edición de los tiddlers: <<option txtMaxEditRows>>\nDirectorio para copias de respaldo: <<option txtBackupFolder>>\n<<option chkInsertTabs>> La tecla 'tab' inserta un tabulador en lugar de saltar el siguiente campo",
	SideBarTabs: "<<tabs txtMainTab Fecha 'Tiddlers cronológicamente' TabTimeline Título 'Tiddlers por título' TabAll Etiquetas 'Todas las etiquetas' TabTags Más 'Más listas' TabMore>>",
	TabTimeline: "<<timeline>>",
	TabAll: "<<list all>>",
	TabTags: "<<allTags>>",
	TabMore: "<<tabs txtMoreTab perdidos 'Tiddlers que no existen' TabMoreMissing huérfanos 'Tiddlers no enlazados por ningún otro' TabMoreOrphans ocultos 'Tiddlers ocultos' TabMoreShadowed>>",
	TabMoreMissing: "<<list missing>>",
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	PluginManager: '<<plugins>>',
	ImportTiddlers: '<<importTiddlers>>'});

/*}}}*/
