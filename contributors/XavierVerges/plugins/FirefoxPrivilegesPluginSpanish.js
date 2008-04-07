/***
|''Name''|FirefoxPrivilegesPluginSpanish|
|''Description''|FirefoxPrivilegesPlugin, en castellano |
|''Author''|Xavier Vergés (xverges at gmail dot com)|
|''Version''|0.0.2 ($Rev: 4266 $)|
|''Date''|$Date: 2008-04-06 09:04:49 +0200 (dom, 06 abr 2008) $|
|''Source''|http://firefoxprivileges.tiddlyspot.com/|
|''CodeRepository''|http://trac.tiddlywiki.org/browser/Trunk/contributors/XavierVerges/plugins/FirefoxPrivilegesPluginSpanish.js|
|''License''|BSD tbd|
|''CoreVersion''|2.2.4 (maybe 2.2+?)|
|''Documentation''|http://firefoxprivileges.tiddlyspot.com/#HowTo|
!Notas
No es una versión utilizable: tiene lo mínimo para verificar que el FirefoxPrivilegesPlugin puede ser traducido. Se agradecen colaboraciones para rellenarlo de verdad :-)
!Código
***/
//{{{
if(window.Components) {
merge(config.macros.firefoxPrivileges.lingo ,{
	wizardTitle: "Gestionar los privilegios en Firefox",
	learnStepTitle: "(pendiente)1. Learn about the risks of giving privileges to file: urls",
	learnStepHtml: "(pendiente)<h3>Local files</h3><p>Firefox can be configured to grant the same security privileges to every html document loaded from disk (those <i>file:</i> urls), or to grant different privileges on a per file basis. Local TiddyWikis need some high security privileges in order to let you save changes to disk, or to import tiddlers from remote servers. Unfortunately, these same privileges can potentially be used by the bad guys to launch programs, get files from your disk and upload them somewhere, access your browsing history...</p><p>While it is more convenient to let Firefox give all your local files the same security privileges, and I'm not aware of any malware attack that tries to take advantage of privileged <i>file:</i> urls, an ounce of prevention is worth a pound of cure.</p><p>You can learn more about this by reading <a href='http://www.mozilla.org/projects/security/components/per-file.html' class='externalLink'>Per-File Permissions</a> and <a href='http://www.mozilla.org/projects/security/components/signed-scripts.html#privs-list' class='externalLink'>JavaScript Security: Signed Script</a> at mozilla.org.</p><h3>Remote files</h3><p>When a remote document (<i>http:</i> urls) requests especial privileges, Firefox <ul><li>checks the value of <code>signed.applets.codebase_principal_support</code>, a preference that can be configured from the page that is loaded when you type <code>about:config</code> in the address bar</li><li>if the previous value is set to false, Firefox denies silently the request</li><li>if the previous value is set to true, Firefox looks for the document's domain in the list of privileges urls that can be configured from this wizard, and, if not there, asks the user to grant the privilege</li></ul><p>Note that, in this case, and unlike when dealing with local files, Firefox will only take into account the document's domain instead of performing an exact match of the url.</p><p>Take a look at <a href='http://messfromabove.tiddlyspot.com' class='externalLink'>http://messfromabove.tiddlyspot.com</a> to learn more about the nice and nasty possibilities that this setting provides.</p><h3>This Wizard</h3><p>This wizard will help you to grant the required privileges to your TiddlyWikis, local or remote, and warn you if you have enabled a dangerous default. To do so, Firefox will probably prompt you to grant it some special privileges in order to list and modify the list of privileged urls.</p><p>Please note that changing the privileges for an url may not have effect until you reload it in the browser.</p><input type='hidden' name='mark'></input>",
	learnStepButton: "1. Saber más sobre los riesgos",
	learnStepButtonTooltip: "(pendiente)Learn why 'Remember this' is an unsafe choice in security prompts",
	grantStepTitle: "(pendiente)2. Grant privileges to individual local documents or remote domains",
	grantStepHtml: "(pendiente)Url: <input type='text' size=80 name='txtUrl'><br/><br/><input type='checkbox' checked='true' name='chkUniversalXPConnect'>Grant rights required to save to disk (Run or install software on your machine - UniversalXPConnect)</input><br/><input type='checkbox' checked='true' name='chkUniversalBrowserRead'>Grant rights required to import tiddlers from servers or access TiddlySpot (Read and upload local files - UniversalBrowserRead)</input><br/><input type='checkbox' name='chkUniversalBrowserWrite'>Modify any open window - UniversalBrowserWrite</input><br/><input type='checkbox' name='chkUniversalFileRead'>Read and upload local files - UniversalFileRead</input><br/><input type='checkbox' name='chkCapabilityPreferencesAccess'>By-pass core security settings - CapabilityPreferencesAccess</input><br/><input type='checkbox' name='chkUniversalPreferencesRead'>Read program settings - UniversalPreferencesRead</input><br/><input type='checkbox' name='chkUniversalPreferencesWrite'>Modify program settings - UniversalPreferencesWrite</input><br/><input type='button' class='button' name='btnGrant' value='(pendiente)Set privileges'/>",
	grantStepButton: "2. Establecer privilegios",
	grantStepButtonTooltip: "(pendiente)Manage privileges for this or other docs",
	viewStepTitle: "(pendiente)3. Granted privileges",
	viewStepHtml: "<input type='hidden' name='mark'></input>",
	viewStepButton: "3. Ver los privilegios",
	viewStepButtonTooltip: "(pendiente)List granted privileges, and optionally reset them",
	viewStepEmptyMsg: "(pendiente)Asking for temporary privileges to list permanent privileges...",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'url', type: 'Selector'},
			{name: 'Url', field: 'url', title: "Url", type: 'LongLink'},
			{name: 'Granted', field: 'granted', title: "Concedido", type: 'StringList'},
			{name: 'Denied', field: 'denied', title: "Denegado", type: 'StringList'},
			{name: 'Handle', field: 'handle', title: "ID interno", type: 'String'},
            {name: 'Notes', field: 'notes', title: "Notas", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'highlight'},
			{className: 'error', field: 'warning'}
			]
		},
	listResetButton: "(pendiente)Reset the privileges of the selected urls",
	noteDangerous: "Esto es peligroso",
	noteNoEffect: "Esto no tiene efecto",
	noteThisUrl: "La url de este documento",
	noteTheUrlYouUpdated: "La url que acaba de actualizar",
	errNoUrl: "Rellene el campo 'url'",
	errNotAuthorized: "(pendiente)Not enough privileges. Maybe you are trying this from a tiddlywiki loaded from a server?",
	msgUpdating: "Se están actualizando los privilegios para %0",
	msgSetting: "Se están estableciendo los privilegios para %0",
	msgResetting: "Se están borrando los privilegios para %0"
});
merge(config.optionsDesc,{
	txtPrivWizardDefaultStep: "Paso a mostrar al abrir el panel 'Gestionar los privilegios en Firefox'"
});
merge(config.tasks,{
	firefoxPrivileges: {text: "seguridad", tooltip: "Trabajar con los privilegios de distintas urls en Firefox", content: '<<firefoxPrivileges>>'}
});
} // endif(window.Components)
//}}}