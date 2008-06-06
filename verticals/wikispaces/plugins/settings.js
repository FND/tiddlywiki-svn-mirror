/***
|''Name:''|settings|
|''Description:''|Set preferences|
|''~CoreVersion:''|2.1.0|
***/

/*{{{*/
config.views.editor.defaultText = '';
config.options.chkAnimate = false;
config.options.chkDisableWikiLinks = true;
config.options.txtMaxEditRows = 20;

config.options.chkImportWorkspaceOnStartup = true;
config.options.chkBackstage = true;

//config.macros.sync.syncStatusList.none.display = 'none';
//config.macros.sync.syncStatusList.changedServer.display = 'none';
//config.macros.sync.syncStatusList.changedLocally.display = 'none';

// Initialise the session display groupings
var wikispacesTopicGroup = new TiddlerDisplayGroup();

var wikispacesTopicPattern = [
	{label:'topic', tag:'topic', count:1, require:null, openAt:null},
	{label:'message', tag:'message', count:0, require:'topic', openAt:'bottom'}];

wikispacesTopicGroup.setPattern(wikispacesTopicPattern); 
wikispacesTopicGroup.setGroupField('server.topic_id');

getTopicList = function(context,userParams)
{
	return config.macros.importWikispacesMessages.getTopicList(context.tiddler.title,context);
};

config.macros.importWorkspace.onClick = function(e)
{
	clearMessage();
displayMessage("Starting import...");
	var customFields = this.getAttribute('customFields');
	var fields = customFields ? customFields.decodeHashMap() : config.defaultCustomFields;
	var userCallback = fields['server.workspace'] == 'tw-test' ? getTopicList : null;
	var userCallbackParams = null;
	config.macros.importWorkspace.getTiddlersForContext(config.macros.importWorkspace.createContext(fields,null,userCallback,userCallbackParams));
};


/*}}}*/
