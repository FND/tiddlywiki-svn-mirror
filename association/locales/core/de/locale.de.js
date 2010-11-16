/***
|''Name:''|GermanTranslationPlugin|
|''Description:''|German Translation for TiddlyWiki|
|''Author:''|BesimKaradeniz (besim (at) karadeniz (dot) de)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/association/locales/core/de/locale.de.js |
|''Version:''|0.1.0|
|''Date:''|Nov 11, 2010|
|''Comments:''|Visit the home of this translation on [[TiddlyWikiDeutsch|http://www.karadeniz.de/tiddlywiki/]] |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.6.1|
***/

//{{{
//-- TiddlyWiki German Translation - r12497
//-- Maintainer: Besim Karadeniz <besim(-at-)karadeniz(-dot-)de>
//-- Web: www.karadeniz.de/tiddlywiki/
//--

config.locale = "de"; // W3C language tag

if (config.options.txtUserName == "YourName")
	merge(config.options,{txtUserName: "IhrName"});

merge(config.tasks,{
	save: {text: "speichern", tooltip: "�nderungen in dieses TiddlyWiki speichern", action: saveChanges},
	sync: {text: "synchronisieren", tooltip: "�nderungen mit anderen TiddlyWiki-Dateien und Servern synchronisieren", content: '<<sync>>'},
	importTask: {text: "importieren", tooltip: "Tiddler und Plugins aus anderen TiddlyWiki-Dateien und Servern importieren", content: '<<importTiddlers>>'},
	tweak: {text: "optimieren", tooltip: "Erscheinungsbild und Reaktion des TiddlyWiki optimieren", content: '<<options>>'},
	upgrade: {text: "upgraden", tooltip: "Upgraden des Kerncodes von TiddlyWiki", content: '<<upgrade>>'},
	plugins: {text: "Plugins", tooltip: "Installierte Plugins verwalten", content: '<<plugins>>'}
});

// Optionen, die im Options-Panel oder/in Cookies eingestellt werden koennen
merge(config.optionsDesc,{
	txtUserName: "Ihr Benutzername zum Unterzeichnen Ihrer Eintr�ge",
	chkRegExpSearch: "Regul�re Ausdr�cke in der Suche aktivieren",
	chkCaseSensitiveSearch: "Gro�-/Kleinschreibung in der Suche aktivieren",
	chkIncrementalSearch: "Inkrementelle Zeichen-f�r-Zeichen-Suche",
	chkAnimate: "Animationen aktivieren",
	chkSaveBackups: "Beim Speichern ein Backup erstellen",
	chkAutoSave: "Automatisch speichern",
	chkGenerateAnRssFeed: "RSS-Feed beim Speichern generieren",
	chkSaveEmptyTemplate: "Leere Vorlage beim Speichern generieren",
	chkOpenInNewWindow: "Externe Links in einem neuen Fenster �ffnen",
	chkToggleLinks: "Klick auf ge�ffnete Tiddler l�sst diese schlie�en",
	chkHttpReadOnly: "Bearbeitungsfunktionen ausblenden, wenn Zugriff via HTTP",
	chkForceMinorUpdate: "Bearbeitungen als kleine �nderungen mit Beibehaltung von Datum und Zeit behandeln",
	chkConfirmDelete: "L�schbest�tigung vor dem L�schen von Tiddlern",
	chkInsertTabs: "Benutzen Sie die Tabulatortaste um Tabulatorzeichen einzuf�gen anstelle jeweils zum n�chsten Feld zu springen",
	txtBackupFolder: "Verzeichnisname f�r Backup Dateien:",
	txtMaxEditRows: "Maximale Zahl von Zeilen in einer Textbox eines Tiddlers:",
	txtTheme: "Name des zu verwendenden Themes",
	txtFileSystemCharSet: "Standard-Zeichensatz beim Speichern von �nderungen (nur Firefox/Mozilla)"});

merge(config.messages,{
	customConfigError: "Beim Laden von Plugins sind Fehler aufgetreten. Siehe PluginManager f�r Details",
	pluginError: "Fehler: %0",
	pluginDisabled: "Nicht ausgef�hrt, da durch 'systemConfigDisable'-Tag deaktiviert",
	pluginForced: "Ausgef�hrt, da durch 'systemConfigForce'-Tag erzwungen",
	pluginVersionError: "Nicht ausgef�hrt, da dieses Plugin eine neuere Version von TiddlyWiki erfordert",
	nothingSelected: "Nichts ausgew�hlt. Sie m�ssen zuerst ein oder mehrere Elemente ausw�hlen",
	savedSnapshotError: "Es scheint, dass dieses TiddlyWiki inkorrekt gespeichert wurde. Bitte besuchen Sie http://www.tiddlywiki.com/#Download f�r Details",
	subtitleUnknown: "(unbekannt)",
	undefinedTiddlerToolTip: "Der Tiddler '%0' existiert noch nicht",
	shadowedTiddlerToolTip: "Der Tiddler '%0' existiert noch nicht, hat aber einen vordefinierten Schatteneintrag",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "Externer Link zu %0",
	noTags: "Es gibt keine getaggten Tiddler",
	notFileUrlError: "Sie m�ssen zun�chst dieses TiddlyWiki in eine Datei speichern, bevor �nderungen gespeichert werden k�nnen",
	cantSaveError: "�nderungen k�nnen nicht gespeichert werden. M�gliche Gr�nde:\n- Ihr Browser unterst�tzt das Abspeichern nicht (Firefox, Internet Explorer, Safari und Opera k�nnen dies mit richtiger Konfiguration)\n- Der Pfadname zu Ihrem TiddlyWiki enth�lt ung�ltige Zeichen\n- Die TiddlyWiki-HTML-Datei wurde verschoben oder umbenannt",
	invalidFileError: "Die originale Datei '%0' scheint kein g�ltiges TiddlyWiki zu sein",
	backupSaved: "Backup gespeichert",
	backupFailed: "Fehler beim Speichern des Backup",
	rssSaved: "RSS-Feed gespeichert",
	rssFailed: "Fehler beim Speichern des RSS-Feed",
	emptySaved: "Leere Vorlage gespeichert",
	emptyFailed: "Fehler beim Speichern der leeren Vorlage",
	mainSaved: "TiddlyWiki-Datei gespeichert",
	mainFailed: "Fehler beim Speichern der TiddlyWiki-Datei. Ihre �nderungen wurden nicht gespeichert",
	macroError: "Fehler im Makro <<\%0>>",
	macroErrorDetails: "Fehler beim Ausf�hren von Makro <<\%0>>:\n%1",
	missingMacro: "Kein entsprechendes Makro vorhanden",
	overwriteWarning: "Ein Tiddler namens '%0' existiert bereits. W�hlen Sie OK zum �berschreiben",
	unsavedChangesWarning: "WARNUNG! Ungespeicherte �nderungen im TiddlyWiki vorhanden\n\nW�hlen Sie OK zum Speichern\nW�hlen Sie ABBRECHEN/CANCEL zum Verwerfen",
	confirmExit: "--------------------------------\n\nUngespeicherte �nderungen im TiddlyWiki vorhanden. Wenn Sie fortfahren, werden Sie diese �nderungen verlieren\n\n--------------------------------",
	saveInstructions: "SaveChanges",
	unsupportedTWFormat: "Nicht unterst�tztes TiddlyWiki-Format '%0'",
	tiddlerSaveError: "Fehler beim Speichern von Tiddler '%0'",
	tiddlerLoadError: "Fehler beim Laden von Tiddler '%0'",
	wrongSaveFormat: "Speichern im Speicherformat '%0' nicht m�glich. Standardformat zum Speichern wird verwendet.",
	invalidFieldName: "Ung�ltiger Dateiname %0",
	fieldCannotBeChanged: "Feld '%0' kann nicht ge�ndert werden",
	loadingMissingTiddler: "Es wird versucht, den Tiddler '%0' vom Server '%1' bei\n\n'%2' im Workspace '%3' abzurufen",
	upgradeDone: "Das Upgrade auf Version %0 ist komplett\n\nKlicken Sie auf 'OK' zum Neuladen des aktualisierten TiddlyWiki",
	invalidCookie: "Ung�ltiger Cookie '%0'"});

merge(config.messages.messageClose,{
	text: "schlie�en",
	tooltip: "diesen Textbereich schlie�en"});

config.messages.backstage = {
	open: {text: "Backstage", tooltip: "�ffnen Sie den Backstage-Bereich f�r Arbeiten an Entwicklungs- und Bearbeitungsaufgaben"},
	close: {text: "schlie�en", tooltip: "Backstage-Bereich schlie�en"},
	prompt: "Backstage: ",
	decal: {
		edit: {text: "bearbeiten", tooltip: "Den Tiddler '%0' bearbeiten"}
	}
};

config.messages.listView = {
	tiddlerTooltip: "Klick f�r den vollen Text dieses Tiddlers",
	previewUnavailable: "(Vorschau nicht vorhanden)"
};

config.messages.dates.months = ["Januar", "Februar", "M�rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November","Dezember"];
config.messages.dates.days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
config.messages.dates.shortMonths = ["Jan", "Feb", "M�r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
config.messages.dates.shortDays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
// Suffixe f�r Datum (englischsprachig), z.B. "1st","2nd","3rd"..."30th","31st"
config.messages.dates.daySuffixes = ["st","nd","rd","th","th","th","th","th","th","th",
	"th","th","th","th","th","th","th","th","th","th",
	"st","nd","rd","th","th","th","th","th","th","th",
	"st"];
config.messages.dates.am = "am";
config.messages.dates.pm = "pm";

merge(config.messages.tiddlerPopup,{
	});

merge(config.views.wikified.tag,{
	labelNoTags: "keine Tags",
	labelTags: "Tags: ",
	openTag: "�ffne Tag '%0'",
	tooltip: "Zeige Tiddlers mit Tags '%0'",
	openAllText: "�ffne alle",
	openAllTooltip: "Alle diese Tiddler �ffnen",
	popupNone: "Keine anderen Tiddler mit '%0' getaggt"});

merge(config.views.wikified,{
	defaultText: "Der Tiddler '%0' existiert noch nicht. Doppelklicken zum Erstellen",
	defaultModifier: "(fehlt)",
	shadowModifier: "(vordefinierter Schatten-Tiddler)",
	dateFormat: "DD. MMM YYYY",
	createdPrompt: "erstellt"});

merge(config.views.editor,{
	tagPrompt: "Geben Sie die Tags durch Leerstellen getrennt ein, [[benutzen Sie doppelte eckige Klammern]] falls n�tig, oder w�hlen Sie vorhandene",
	defaultText: "Geben Sie den Text f�r '%0' ein"});

merge(config.views.editor.tagChooser,{
	text: "Tags",
	tooltip: "W�hlen Sie vorhandene Tags zum Hinzuf�gen zu diesem Tiddler aus",
	popupNone: "Es sind keine Tags definiert",
	tagTooltip: "Tag '%0' hinzuf�gen"});

merge(config.messages,{
	sizeTemplates:
		[
		{unit: 1024*1024*1024, template: "%0\u00a0GB"},
		{unit: 1024*1024, template: "%0\u00a0MB"},
		{unit: 1024, template: "%0\u00a0KB"},
		{unit: 1, template: "%0\u00a0B"}
		]});

merge(config.macros.search,{
	label: "suchen",
	prompt: "Dieses TiddlyWiki durchsuchen",
	accessKey: "F",
	successMsg: "%0 Tiddler gefunden, die %1 enthalten",
	failureMsg: "Keine Tiddler gefunden, die %0 enthalten"});

merge(config.macros.tagging,{
	label: "Tagging: ",
	labelNotTag: "kein Tagging",
	tooltip: "Liste der Tiddler, die mit '%0' getaggt sind"});

merge(config.macros.timeline,{
	dateFormat: "DD. MMM YYYY"});

merge(config.macros.allTags,{
	tooltip: "Tiddler, die mit '%0' getagged sind, anzeigen",
	noTags: "Keine getaggten Tiddler vorhanden"});

config.macros.list.all.prompt = "Alle Tiddler in alphabetischer Reihenfolge";
config.macros.list.missing.prompt = "Tiddler, auf die verwiesen wird, die aber nicht existieren";
config.macros.list.orphans.prompt = "Tiddler, auf die nicht von anderen Tiddlern verwiesen wird";
config.macros.list.shadowed.prompt = "Tiddler, f�r die Standardeintr�ge existieren";
config.macros.list.touched.prompt = "Tiddlers, die lokal ver�ndert wurden";

merge(config.macros.closeAll,{
	label: "alle schlie�en",
	prompt: "Alle angezeigten Tiddler schlie�en (au�er denen, die gerade bearbeitet werden)"});

merge(config.macros.permaview,{
	label: "Permaview",
	prompt: "Erzeugt einen URL, mit dem auf alle gerade ge�ffneten Tiddler verwiesen werden kann"});

merge(config.macros.saveChanges,{
	label: "�nderungen speichern",
	prompt: "Alle �nderungen speichern",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "Neuer Tiddler",
	prompt: "Neuen Tiddler erstellen",
	title: "Neuer Tiddler",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "Neues Journal",
	prompt: "Neuen Tiddler mit aktuellem Datum und aktueller Zeit erstellen",
	accessKey: "J"});

merge(config.macros.options,{
	wizardTitle: "Erweiterte Optionen ver�ndern",
	step1Title: "Diese Optionen werden mit Cookies in Ihrem Browser gespeichert",
	step1Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='false' name='chkUnknown'>Unbekannte Optionen anzeigen</input>",
	unknownDescription: "//(unbekannt)//",
	listViewTemplate: {
		columns: [
			{name: 'Option', field: 'option', title: "Option", type: 'String'},
			{name: 'Description', field: 'description', title: "Beschreibung", type: 'WikiText'},
			{name: 'Name', field: 'name', title: "Name", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'}
			]}
	});

merge(config.macros.plugins,{
	wizardTitle: "Plugins verwalten",
	step1Title: "Aktuell geladene Plugins",
	step1Html: "<input type='hidden' name='markList'></input>",
	skippedText: "(Dieses Plugin wurde nicht ausgef�hrt, da es nach dem Start hinzugef�gt wurde)",
	noPluginText: "Es sind keine Plugins installiert",
	confirmDeleteText: "Wollen Sie wirklich folgende Plugins l�schen:\n\n%0",
	removeLabel: "systemConfig-Tag entfernen",
	removePrompt: "systemConfig-Tag entfernen",
	deleteLabel: "l�schen",
	deletePrompt: "Diese Tiddler endg�ltig l�schen",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Description', field: 'Description', title: "Beschreibung", type: 'String'},
			{name: 'Version', field: 'Version', title: "Version", type: 'String'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "Gr��e", type: 'Size'},
			{name: 'Forced', field: 'forced', title: "Erzwungen", tag: 'systemConfigForce', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "Deaktiviert", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "Geladen", type: 'Boolean', trueText: "Ja", falseText: "Nein"},
			{name: 'Startup Time', field: 'startupTime', title: "Startzeit", type: 'String'},
			{name: 'Error', field: 'error', title: "Status", type: 'Boolean', trueText: "Fehler", falseText: "OK"},
			{name: 'Log', field: 'log', title: "Log", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			]},
	listViewTemplateReadOnly: {
		columns: [
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Description', field: 'Description', title: "Beschreibung", type: 'String'},
			{name: 'Version', field: 'Version', title: "Version", type: 'String'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "Gr��e", type: 'Size'},
			{name: 'Executed', field: 'executed', title: "Geladen", type: 'Boolean', trueText: "Ja", falseText: "Nein"},
			{name: 'Startup Time', field: 'startupTime', title: "Startzeit", type: 'String'},
			{name: 'Error', field: 'error', title: "Status", type: 'Boolean', trueText: "Fehler", falseText: "OK"},
			{name: 'Log', field: 'log', title: "Log", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			]}
	});

merge(config.macros.toolbar,{
	moreLabel: "mehr",
	morePrompt: "Weitere Funktionen anzeigen",
	lessLabel: "weniger",
	lessPrompt: "Zus�tzliche Befehle verstecken",
	separator: "|"
	});

merge(config.macros.refreshDisplay,{
	label: "aktualisieren",
	prompt: "Gesamte TiddlyWiki-Ansicht aktualisieren"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "Sie k�nnen nicht in eine schreibgesch�tzte TiddlyWiki-Datei importieren. Versuchen Sie diese �ber eine file:// URL zu �ffnen",
	wizardTitle: "Tiddler aus anderer Datei oder anderem Server importieren",
	step1Title: "Schritt 1: Server oder TiddlyWiki-Datei ausfindig machen",
	step1Html: "Typ des Servers ausw�hlen: <select name='selTypes'><option value=''>W�hlen...</option></select><br>URL oder Pfadnamen eingeben: <input type='text' size=50 name='txtPath'><br>...oder nach einer Datei browsen: <input type='file' size=50 name='txtBrowse'><br><hr>...oder einen vordefinierten Feed ausw�hlen: <select name='selFeeds'><option value=''>W�hlen...</option></select>",
	openLabel: "�ffnen",
	openPrompt: "Verbindung zu dieser Datei oder Server starten",
	statusOpenHost: "Verbindung zum Host starten",
	statusGetWorkspaceList: "Liste von vorhandenen Workspaces abrufen",
	step2Title: "Schritt 2: Workspace ausw�hlen",
	step2Html: "Einen Workspace-Namen eingeben: <input type='text' size=50 name='txtWorkspace'><br>...oder ein Workspace ausw�hlen: <select name='selWorkspace'><option value=''>W�hlen...</option></select>",
	cancelLabel: "abbrechen",
	cancelPrompt: "Diesen Import abbrechen",
	statusOpenWorkspace: "Workspace wird ge�ffnet",
	statusGetTiddlerList: "Abrufen der Liste von vorhandenen Workspaces",
	errorGettingTiddlerList: "Fehler beim Abrufen der Liste der Tiddler, klicken Sie auf ABBRECHEN/CANCEL, um es nochmal zu probieren",
	step3Title: "Schritt 3: Zu importierende Tiddler ausw�hlen",
	step3Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='true' name='chkSync'>Links dieser Tiddler zum Server erhalten, um nachfolgende �nderungen synchronisieren zu k�nnen</input><br><input type='checkbox' checked='false' name='chkSave'>Speichern der Details dieses Servers in einem 'systemServer'Tiddler namens:</input> <input type='text' size=25 name='txtSaveTiddler'>",
	importLabel: "importieren",
	importPrompt: "Diese Tiddler importieren",
	confirmOverwriteText: "Wollen Sie wirklich folgende Tiddler �berschreiben:\n\n%0",
	step4Title: "Schritt 4: Importieren von %0 Tiddler",
	step4Html: "<input type='hidden' name='markReport'></input>",
	doneLabel: "Erledigt",
	donePrompt: "Diesen Assistenten schlie�en",
	statusDoingImport: "Tiddler werden importiert",
	statusDoneImport: "Alle Tiddler importiert",
	systemServerNamePattern: "%2 auf %1",
	systemServerNamePatternNoWorkspace: "%1",
	confirmOverwriteSaveTiddler: "Der Tiddler '%0' existiert bereits. Klicken Sie auf 'OK' um ihn mit den Details dieses Servers zu �berschreiben, oder 'Abbrechen', um ihn unver�ndert zu lassen",
	serverSaveTemplate: "|''Eingabe:''|%0|\n|''URL:''|%1|\n|''Workspace:''|%2|\n\nDieser Tiddler wurde automatisch erstellt, um Details dieses Servers aufzuzeichnen",
	serverSaveModifier: "(System)",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "Gr��e", type: 'Size'},
			{name: 'Tags', field: 'tags', title: "Tags", type: 'Tags'}
			],
		rowClasses: [
			]}
	});

merge(config.macros.upgrade,{
	wizardTitle: "Upgraden des Kerncodes von TiddlyWiki",
	step1Title: "Update oder Reparatur dieses TiddlyWiki auf die aktuellste Version",
	step1Html: "Sie sind dabei, auf die aktuellste Version des TiddlyWiki-Kerncodes upzugraden (von <a href='%0' class='externalLink' target='_blank'>%1</a>). Ihre Inhalte werden w�hrend dem Upgrade erhalten bleiben.<br><br>Bitte beachten Sie, dass Kerncode-Updates mit �lteren Plugins kollidieren k�nnen. Wenn Sie Probleme mit der aktualisierten Datei beobachten, besuchen Sie bitte <a href='http://www.tiddlywiki.org/wiki/CoreUpgrades' class='externalLink' target='_blank'>http://www.tiddlywiki.org/wiki/CoreUpgrades</a>",
	errorCantUpgrade: "Upgrade dieses TiddlyWiki nicht m�glich. Sie k�nnen nur lokal abgespeicherte TiddlyWiki-Dateien upgraden",
	errorNotSaved: "Sie m�ssen zun�chst �nderungen speichern, bevor Sie ein Upgrade starten k�nnen",
	step2Title: "Upgrade-Details best�tigen",
	step2Html_downgrade: "Sie sind dabei, von der TiddlyWiki-Version %1 auf die Version %0 downzugraden.<br><br>Der Downgrade auf eine fr�here Version von TiddlyWiki wird nicht empfohlen",
	step2Html_restore: "Dieses TiddlyWiki scheint bereits die aktuellste Version des Kerncodes (%0) einzusetzen.<br><br>Sie k�nnen mit dem Upgrade fortsetzen, um sicherzustellen, dass der Kerncode nicht korrumpiert oder besch�digt wurde",
	step2Html_upgrade: "Sie sind dabei, von der TiddlyWiki-Version %1 auf die Version %0 upzugraden",
	upgradeLabel: "upgraden",
	upgradePrompt: "Vorbereiten des Upgrade-Prozesses",
	statusPreparingBackup: "Backup vorbereiten",
	statusSavingBackup: "Backup-Datei speichern",
	errorSavingBackup: "Ein Problem mit dem Speichern der Backup-Datei ist aufgetreten",
	statusLoadingCore: "Kerncode laden",
	errorLoadingCore: "Fehler beim Laden des Kerncodes",
	errorCoreFormat: "Fehler im neuen Kerncode",
	statusSavingCore: "Neuen Kerncode speichern",
	statusReloadingCore: "Neuen Kerncode neu laden",
	startLabel: "starten",
	startPrompt: "Upgrade-Prozess starten",
	cancelLabel: "abbrechen",
	cancelPrompt: "Upgrade-Prozess abbrechen",
	step3Title: "Upgrade abgebrochen",
	step3Html: "Sie haben den Upgrade-Prozess abgebrochen"
	});

merge(config.macros.sync,{
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Server Type', field: 'serverType', title: "Server-Typ", type: 'String'},
			{name: 'Server Host', field: 'serverHost', title: "Server-Host", type: 'String'},
			{name: 'Server Workspace', field: 'serverWorkspace', title: "Server-Workspace", type: 'String'},
			{name: 'Status', field: 'status', title: "Status der Synchronisation", type: 'String'},
			{name: 'Server URL', field: 'serverUrl', title: "Server-URL", text: "View", type: 'Link'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "Diese Tiddler synchronisieren", name: 'sync'}
			]},
	wizardTitle: "Mit externen Servern oder Dateien synchronisieren",
	step1Title: "W�hlen Sie die Tiddler aus, die Sie synchronisieren m�chten",
	step1Html: '<input type="hidden" name="markList"></input>',
	syncLabel: "synchronisieren",
	syncPrompt: "Diese Tiddler synchronisieren",
	hasChanged: "Ver�ndert w�hrend Trennung",
	hasNotChanged: "Unver�ndert w�hrend Trennung",
	syncStatusList: {
		none: {text: "...", display:null, className:'notChanged'},
		changedServer: {text: "Auf dem Server ge�ndert", display:null, className:'changedServer'},
		changedLocally: {text: "Im ausgesteckten Zustand ge�ndert", display:null, className:'changedLocally'},
		changedBoth: {text: "Im ausgesteckten Zustand und auf dem Server ge�ndert", display:null, className:'changedBoth'},
		notFound: {text: "Auf dem Server nicht gefunden", display:null, className:'notFound'},
		putToServer: {text: "Aktualisierung auf dem Server gespeichert", display:null, className:'putToServer'},
		gotFromServer: {text: "Aktualisierung vom Server abgerufen", display:null, className:'gotFromServer'}
		}
	});

merge(config.macros.annotations,{
	});

merge(config.commands.closeTiddler,{
	text: "schlie�en",
	tooltip: "Diesen Tiddler schlie�en"});

merge(config.commands.closeOthers,{
	text: "andere schlie�en",
	tooltip: "Alle anderen Tiddler schlie�en"});

merge(config.commands.editTiddler,{
	text: "bearbeiten",
	tooltip: "Diesen Tiddler bearbeiten",
	readOnlyText: "betrachten",
	readOnlyTooltip: "Quellcode dieses Tiddlers betrachten"});

merge(config.commands.saveTiddler,{
	text: "fertig",
	tooltip: "�nderungen an diesem Tiddler speichern"});

merge(config.commands.cancelTiddler,{
	text: "abbrechen",
	tooltip: "�nderungen an diesem Tiddler verwerfen",
	warning: "Wollen Sie wirklich �nderungen in '%0' verwerfen?",
	readOnlyText: "fertig",
	readOnlyTooltip: "Diesen Tiddler normal anzeigen"});

merge(config.commands.deleteTiddler,{
	text: "l�schen",
	tooltip: "Diesen Tiddler l�schen",
	warning: "Wollen Sie '%0' wirklich l�schen?"});

merge(config.commands.permalink,{
	text: "Permalink",
	tooltip: "Permalink f�r diesen Tiddler"});

merge(config.commands.references,{
	text: "Referenzen",
	tooltip: "Alle Tiddler zeigen, die auf diesen verweisen",
	popupNone: "Keine Referenzen"});

merge(config.commands.jump,{
	text: "springen",
	tooltip: "Zu anderem, ge�ffneten Tiddler springen"});

merge(config.commands.syncing,{
	text: "Synchronisierung l�uft",
	tooltip: "Synchronisation dieses Tiddlers mit einem Server oder einer externen Datei kontrollieren",
	currentlySyncing: "<div>Aktuell am Synchronisieren mit <span class='popupHighlight'>'%0'</span> zu:</"+"div><div>Host: <span class='popupHighlight'>%1</span></"+"div><div>Workspace: <span class='popupHighlight'>%2</span></"+"div>", // Hinweis - Das Schlie�en des <div>-Tag verlassen
	notCurrentlySyncing: "Derzeit keine Synchronisierung",
	captionUnSync: "Synchronisierung dieses Tiddlers stoppen",
	chooseServer: "Diesen Tiddler mit anderem Server synchronisieren:",
	currServerMarker: "\u25cf ",
	notCurrServerMarker: "  "});

merge(config.commands.fields,{
	text: "Felder",
	tooltip: "Erweiterte Felder dieses Tiddlers anzeigen",
	emptyText: "Keine erweiterten Felder f�r diesen Tiddler vorhanden",
	listViewTemplate: {
		columns: [
			{name: 'Field', field: 'field', title: "Feld", type: 'String'},
			{name: 'Value', field: 'value', title: "Wert", type: 'String'}
			],
		rowClasses: [
			],
		buttons: [
			]}});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "[[GettingStarted]]",
	MainMenu: "[[GettingStarted]]",
	SiteTitle: "Mein TiddlyWiki",
	SiteSubtitle: "ein wiederverwendbares nichtlineares, pers�nliches ~Web-Notizbuch",
	SiteUrl: "",
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal "DD. MMM YYYY" "Journal">><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel "Optionen \u00bb" "Optionen von TiddlyWiki �ndern">>',
	SideBarTabs: '<<tabs txtMainTab "Zeitachse" "Zeitachse" TabTimeline "Alles" "Alle Tiddler" TabAll "Tags" "Alle Tags" TabTags "Mehr" "Weitere Listen" TabMore>>',
	TabMore: '<<tabs txtMoreTab "Fehlend" "Fehlende Tiddler" TabMoreMissing "Waisen" "Verwaiste Tiddler" TabMoreOrphans "Schatten" "Tiddler mit Schatteneintr�gen" TabMoreShadowed>>'
	});

merge(config.annotations,{
	AdvancedOptions: "Dieser Schatten-Tiddler bietet Zugang zu diversen erweiterten Optionen",
	ColorPalette: "Diese Werte in diesem Schatten-Tiddler legen das Farbschema der Benutzerschnittstelle des TiddlyWiki fest",
	DefaultTiddlers: "Die in diesem Schatten-Tiddler aufgelisteten Tiddler werden automatisch beim Start des TiddlyWiki angezeigt",
	EditTemplate: "Die HTML-Vorlage in diesem Schatten-Tiddler legt das Aussehen von Tiddler w�hrend ihrer Bearbeitung fest",
	GettingStarted: "Dieser Schatten-Tiddler bietet eine einfache Bedienungsanleitung",
	ImportTiddlers: "Dieser Schatten-Tiddler bietet Zugang zum Import von Tiddler",
	MainMenu: "Dieser Schatten-Tiddler dient als Container f�r das Hauptmen� in der linksseitigen Spalte des Bildschirms",
	MarkupPreHead: "Dieser Tiddler wird an der Spitze der <head>-Sektion der HTML-Datei des TiddlyWiki eingef�gt",
	MarkupPostHead: "Dieser Tiddler wird am Ende der <head>-Sektion der HTML-Datei des TiddlyWiki eingef�gt",
	MarkupPreBody: "Dieser Tiddler wird an der Spitze der <body>-Sektion der HTML-Datei des TiddlyWiki eingef�gt",
	MarkupPostBody: "Dieser Tiddler wird am Ende der <body>-Sektion der HTML-Datei des TiddlyWiki unmittelbar nach dem Scriptblock eingef�gt",
	OptionsPanel: "Dieser Schatten-Tiddler dient als Container f�r das einblendbare Optionsfeld in der rechtsseitigen Seitenleiste",
	PageTemplate: "Die HTML-Vorlage in diesem Schatten-Tiddler legt das allgemeine Aussehen des TiddlyWiki fest",
	PluginManager: "Dieser Schatten-Tiddler bietet Zugang zum Plugin-Manager",
	SideBarOptions: "Dieser Schatten-Tiddler dient als Container f�r das Optionsfeld in der rechtsseitigen Seitenleiste",
	SideBarTabs: "Dieser Schatten-Tiddler dient als Container f�r das Tab-Panel in der rechtsseitigen Seitenleiste",
	SiteSubtitle: "Dieser Schatten-Tiddler enth�lt den zweiten Teil der Seiten�berschrift",
	SiteTitle: "Dieser Schatten-Tiddler enth�lt den ersten Teil der Seiten�berschrift",
	SiteUrl: "Dieser Schatten-Tiddler sollte den vollst�ndigen Ziel-URL der Ver�ffentlichung enthalten",
	StyleSheetColors: "Dieser Schatten-Tiddler enth�lt CSS-Definitionen bez�glich der Farbe von Seitenelementen. ''DIESEN TIDDLER NICHT BEARBEITEN'', f�gen Sie Ihre �nderungen stattdessen in den StyleSheet-Schatten-Tiddler ein",
	StyleSheet: "Dieser Tiddler kann benutzerspezifische CSS-Definitionen enthalten",
	StyleSheetLayout: "Dieser Schatten-Tiddler enth�lt CSS-Definitionen bez�glich dem Aussehen von Seitenelementen. ''DIESEN TIDDLER NICHT BEARBEITEN'', f�gen Sie Ihre �nderungen stattdessen in den StyleSheet-Schatten-Tiddler ein",
	StyleSheetLocale: "Dieser Schatten-Tiddler enth�lt CSS-Definitionen bez�glich lokale �bersetzungen",
	StyleSheetPrint: "Dieser Schatten-Tiddler enth�lt CSS-Definitionen zum Drucken",
	SystemSettings: "Dieser Tiddler wird zum Speichern von Konfigurationsoptionen f�r dieses TiddlyWiki-Dokument genutzt",
	TabAll: "Dieser Schatten-Tiddler enth�lt den Inhalt des 'Alles'-Tab in der rechtsseitigen Seitenleiste",
	TabMore: "Dieser Schatten-Tiddler enth�lt den Inhalt des 'Mehr'-Tab in der rechtsseitigen Seitenleiste",
	TabMoreMissing: "Dieser Schatten-Tiddler enth�lt den Inhalt des 'Fehlend'-Tab in der rechtsseitigen Seitenleiste",
	TabMoreOrphans: "Dieser Schatten-Tiddler enth�lt den Inhalt des 'Waisen'-Tab in der rechtsseitigen Seitenleiste",
	TabMoreShadowed: "Dieser Schatten-Tiddler enth�lt den Inhalt des 'Schatten'-Tab in der rechtsseitigen Seitenleiste",
	TabTags: "Dieser Schatten-Tiddler enth�lt den Inhalt des 'Tags'-Tab in der rechtsseitigen Seitenleiste",
	TabTimeline: "Dieser Schatten-Tiddler enth�lt den Inhalt des 'Zeitachse'-Tab in der rechtsseitigen Seitenleiste",
	ToolbarCommands: "Dieser Schatten-Tiddler legt fest, welche Befehle in Tiddler-Toolbars angezeigt werden",
	ViewTemplate: "Die HTML-Vorlage in diesem Schatten-Tiddler legt das Aussehen der Tiddler fest"
	});

// Uebersetzungen von Schatten-Tiddlern ausserhalb der offiziellen lingo.js
merge(config.shadowTiddlers,{
	OptionsPanel: "Diese [[Interface-Einstellungen|InterfaceOptions]] zur Anpassung von TiddlyWiki werden in Ihrem Browser gespeichert\n\nIhr Benutzername zum Unterzeichnen Ihrer Eintr�ge. Bitte als WikiWord (z.B. KlausBrandm�ller) schreiben\n\n<<option txtUserName>>\n<<option chkSaveBackups>> [[Backups speichern|SaveBackups]]\n<<option chkAutoSave>> [[Automatisch speichern|AutoSave]]\n<<option chkRegExpSearch>> [[RegExp Suche|RegExpSearch]]\n<<option chkCaseSensitiveSearch>> [[Gro�-/Kleinschreibung in Suche|CaseSensitiveSearch]]\n<<option chkAnimate>> [[Animationen aktivieren|EnableAnimations]]\n\n----\[[Erweiterte Optionen|AdvancedOptions]]\nPluginManager\nImportTiddlers",
	GettingStarted: "Um mit diesem TiddlyWiki zu starten, sollten Sie folgende Tiddler modifizieren:\n* SiteTitle & SiteSubtitle: Den [[Titel|SiteTitle]] und [[Untertitel|SiteSubtitle]] der Site, wie oben angezeigt (nach dem Speichern werden diese auch in der Titelzeile des Browsers angezeigt)\n* MainMenu: Ihr Inhaltsverzeichnis (f�r gew�hnlich Links)\n* DefaultTiddlers: Beinhaltet die Namen der Tiddler, die Sie angezeigt haben m�chten, wenn das TiddlyWiki ge�ffnet wird.\nSie sollten zudem Ihren Benutzernamen zum Unterzeichnen Ihrer Bearbeitungen eingeben: <<option txtUserName>>",
	ViewTemplate: "<div class='toolbar' macro='toolbar -closeTiddler closeOthers +editTiddler permalink references jump'></div>\n<div class='title' macro='view title'></div>\n<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date'></span> (erstellt am <span macro='view created date'></span>)</div>\n<div class='tagging' macro='tagging'></div>\n<div class='tagged' macro='tags'></div>\n<div class='viewer' macro='view text wikified'></div>\n<div class='tagClear'></div>",
	InterfaceOptions: "Die [[Interface-Einstellungen|InterfaceOptions]] werden angezeigt, wenn Sie rechts auf 'Optionen' klicken. Sie werden mit einem Cookie in Ihrem Browser gespeichert, um sie zwischen den Aufrufen zu sichern. N�here Informationen zu den einzelnen Funktionen finden Sie, wenn Sie die Funktion selbst anklicken.",
	WikiWord: "Ein WikiWord ist ein Wort, das aus mehreren einzelnen W�rtern zusammengesetzt ist, in dem jedes Wort mit einem Gro�buchstaben beginnt und eine individuelle Seite bezeichnet.",
	SaveBackups: "[[Backups speichern|SaveBackups]] ist eine Funktion, mit der automatisch bei jedem Abspeichern ein Backup erstellt wird.",
	AutoSave: "[[Automatisches Speichern|AutoSave]] speichert automatisch �nderungen jedes Mal, wenn Sie einen Tiddler bearbeiten. Damit sinken die Chancen, dass Sie Daten verlieren. Beachten Sie jedoch, dass bei aktivierter [[Backup-Funktion|SaveBackups]] nat�rlich auch eine Menge Backup-Dateien erstellt werden. Entscheiden Sie sich deshalb f�r die eine oder andere Funktion.",
	RegExpSearch: "Mit der [[RegExp Suche|RegExpSearch]] k�nnen Sie mit regul�ren Suchausdr�cken flexible Suchanfragen vornehmen.",
	CaseSensitiveSearch: "Die Unterscheidung der [[Gro�-/Kleinschreibung in Suche|CaseSensitiveSearch]] tut genau dies.",
	EnableAnimations: "Diese Funktion aktiviert Animationen, wenn Sie einen Tiddler �ffnen oder schlie�en.",
	GenerateAnRssFeed: "Wenn Sie [[RSS-Feed generieren|GenerateAnRssFeed]] aktivieren, speichert TiddlyWiki automatisch einen RSS-2.0-g�ltigen Feed, so bald Ihr TiddlyWiki gespeichert wird. Der Feed hat den gleichen Dateinamen wie das TiddlyWiki, lediglich jedoch mit der Endung '.xml'.",
	OpenLinksInNewWindow: "Diese Funktion �ffnet externe Links in einem neuen ~Browser-Fenster.",
	SaveEmptyTemplate: "Diese Funktion erwirkt, dass beim Abspeichern von �nderungen eine leere Vorlage von TiddlyWiki erzeugt wird. Dies ist als Hilfe gedacht f�r Entwickler, die Adaptionen von TiddlyWiki bereitstellen. Die Funktion ist nicht erforderlich, wenn Sie ein normaler Benutzer sind.",
	HideEditingFeatures: "Ist diese Funktion aktiviert, werden die Bearbeitungsfunktionen ausgeblendet, wenn das TiddlyWiki �ber HTTP aufgerufen wird. Der Benutzer hat dann die M�glichkeit, den Tiddler zwar betrachten zu k�nnen, aber nicht zu bearbeiten.",
	MinorChanged: "Manchmal ist es sinnvoll, dass bei kleinen �nderungen der Tiddler in der Zeitachse nicht automatisch an den Anfang gesetzt wird. Mit Aktivierung dieser Funktion werden alle Bearbeitungen von Tiddlern als kleine �nderungen betrachtet und das �nderungsdatum nicht ge�ndert.",
	ConfirmBeforeDeleting: "Bei Aktivierung dieser Funktion fordert TiddlyWiki eine Best�tigung des Benutzers an, wenn ein Tiddler gel�scht werden soll."});