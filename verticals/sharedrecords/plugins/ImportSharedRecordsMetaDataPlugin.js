/***
|''Name:''|ImportSharedRecordsMetaDataPlugin|
|''Description:''|Allows metadata to be synchronised with a Shared Records server|
|''Source:''|http://sharedrecords.tiddlywiki.com/#ImportSharedRecordsMetaDataPlugin|
|''Author:''|JeremyRuston, JonathanJackson and EricShulman|
|''Version:''|1.1.3|
|''Date:''|Jan 17, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.2.0|

This plugin allows metadata to be synchronised with a Shared Records (SR) server (see
http://www.sharedrecords.org/).

In SR terminology, a record on a particular server is addressed as a record UID (a
40-digit hex string). The items of metadata associated with a record are a sequence
of named blobs of text.

Mapping these terms to TWs synchronisation framework, a SR record UID corresponds to
a workspace within a server. The individual metadata items correspond to tiddlers within
that workspace.

This plugin performs the following actions:
* Installs the {{{<<importSharedRecordsMetaData>>}}} macro
* Installs the {{{recordUID}}} paramifier
* A hack to associate created and modified tiddlers with the default shared records server
* Automatically loads the recordUIDs in the tiddler "SharedRecordsAutoSyncRecordUIDs"
** the recordUIDs should be separated with newlines

The default content of "SharedRecordsAutoSyncRecordUIDs" is "[% recordUIDsList %]" which can
be used by serverside scripts to substitute the default recordUID(s)

The macro has the following syntax:

|Source|Output|
|{{{<<importSharedRecordsMetaData>>}}}|Creates a wizard to specify record UID|
|{{{<<importSharedRecordsMetaData recordUID>>}}}|imports the meta data of the specified recordUID|
|{{{<<importSharedRecordsMetaData recordUID quiet>>}}}|imports the meta data of the specified recordUID and does not display the wizard|

The paramifier has the following syntax:

http://example.com/#recordUID:e1277abf727b36e55f8ef53bcfab16a8a2259e48 recordUID:238324762372374782364823872348234768234a

***/

//{{{

// Ensure that the ImportSharedRecordsMetaDataPlugin is only installed once.
if(!version.extensions.ImportSharedRecordsMetaDataPlugin) {
version.extensions.ImportSharedRecordsMetaDataPlugin = {installed:true};
// Check version number of core code
if(version.major < 2 || (version.major == 2 && version.minor < 2))
	{alertAndThrow("ImportSharedRecordsMetaDataPlugin requires TiddlyWiki 2.2 or later.");}

// String constants
config.macros.importSharedRecordsMetaData = {
	defaultURL: "http://sra.sharedrecords.org:8080/SRCDataStore/RESTServlet/",
	defaultRecordUID: "37105c154dd4956cc4e278a5b867a435b5250d19",
	autoSyncTiddler: "SharedRecordsAutoSyncRecordUIDs",
	templateToken: "\x5B% recordUIDsList %\x5D",
	servletName: "RESTServlet",
	wizardTitle: "Import Shared Records Meta Data",
	step1: "Select a record UID",
	http1prompt: "Enter a http url to retrieve the meta data from",
	record1prompt: "Enter a recordUID to retrieve the Meta Data For:",
	step1promptFile: "... or select a file whose name is a recordUID:",
	fetchLabel: "Get Meta Data Entries",
	importSuccessful: "Import of Meta Data Entries Successful",
	step2Text: "Meta data imported for record: %0",
	reportTiddler: "ImportedMetaDataReport",
	collisionMsg: "The tiddler '%0' already exists.\n\nPlease enter a new title for the imported tiddler...\nOR, keep the same title to replace the existing tiddler...\nOR,press CANCEL to skip this tiddler.",
	quiet: false
};

// Hack to make newTiddler add the sharedRecords attributes
config.commands.saveTiddler.handler = function(event,src,title)
{
	var newTitle = story.saveTiddler(title,event.shiftKey);
	if(newTitle)
	   story.displayTiddler(null,newTitle);
	var theTitle = newTitle ? newTitle : title;
	var records = store.getTiddlerText(config.macros.importSharedRecordsMetaData.autoSyncTiddler,"").split("\n");
	var r = records ? records[0] : "";
	if(r == config.macros.importSharedRecordsMetaData.templateToken)
		r = config.macros.importSharedRecordsMetaData.defaultRecordUID;	
	store.setValue(theTitle, "sharedRecords.recordUID", r);
	store.setValue(theTitle, "sharedRecords.url", config.macros.importSharedRecordsMetaData.defaultURL);
	
	//store.setValue(theTitle, "sharedRecords.sequenceNumber", "0");
		if(config.options.chkAutoSave)
			saveChanges();
	return false;
}

// ELS: parameter passing in URL via: #recordUID:e1277abf727b36e55f8ef53bcfab16a8a2259e48
// immediately executes 
config.paramifiers.recordUID = {
	onstart: function(id) {
		var e = document.createElement('span');
		config.macros.importSharedRecordsMetaData.performImport(e,id,true);
	}
};

// Slight hack to automatically load initial recordUIDs
config.macros.importSharedRecordsMetaData.init = function()
{
	var records = store.getTiddlerText(config.macros.importSharedRecordsMetaData.autoSyncTiddler,"").split("\n");
	for(var t=0; t<records.length; t++)
		config.macros.importSharedRecordsMetaData.performImport(null,records[t],true);
}

//Core plugin definition.  Creates a wizard interfaces similiar to that of importTiddlers.  
//Allows the user to specify the target URL and record UID to import the meta data of.
//USAGE:  
//<<importSharedRecordsMetaData>>, loads the wizard and allows the user to select the recordUID to import
//<<importSharedRecordsMetaData recordUID >>, loads the wizard and imports the given recordUID.
//<<importSharedRecordsMetaData recordUID quiet:yes>>, loads the wizard and imports the given recordUID quietly
config.macros.importSharedRecordsMetaData.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("record",null,true,false,false);
	var record = getParam(params,"record",null);
	var recordTiddler = getParam(params,"recordTiddler",null);
	var quiet = getParam(params,"quiet","no");
	var records = [];
	if(record)
		records = [record];
	else
		records = store.getTiddlerText(recordTiddler,"").split("\n");
	for(var t=0; t<records.length; t++)
		config.macros.importSharedRecordsMetaData.performImport(place,records[t],quiet.toLowerCase() == "yes");
}

config.macros.importSharedRecordsMetaData.performImport = function(place,UID,quiet)
{
	if(UID == config.macros.importSharedRecordsMetaData.templateToken)
		UID = config.macros.importSharedRecordsMetaData.defaultRecordUID;
	config.macros.importSharedRecordsMetaData.quiet = quiet;
		//Because this includes the "wizard" key word, it can use the default wizard CSS that makes it look nice
		var importer = createTiddlyElement(null,"div",null,"importSharedRecordsMetaData wizard");
		createTiddlyElement(importer,"h1",null,null,this.wizardTitle);
		createTiddlyElement(importer,"h2",null,"step1",this.step1);
		var step = createTiddlyElement(importer,"div",null,"wizardStep");
		
		if(!readOnly)
		{
			createTiddlyElement(step,"br");
			createTiddlyText(step,this.http1prompt);
			var inputHttp = createTiddlyElement(null,"input",null,"txtOptionInput");
			inputHttp.type = "text";
			inputHttp.size = 100;
			inputHttp.value = this.defaultURL;
			step.appendChild(inputHttp);
			importer.httpBox = inputHttp;
		}
		else
		{
			//determines the target url based on parsing cutting off everything after the last /.
			config.macros.importSharedRecordsMetaData.targetPath = 
				config.macros.importSharedRecordsMetaData.createTargetPath();
		
			createTiddlyElement(step,"br");
			createTiddlyText(step, "Host: " + window.location.host) 
			createTiddlyElement(step,"br");
			createTiddlyText(step, "Target Path: " + config.macros.importSharedRecordsMetaData.targetPath) 
		}
	
		createTiddlyElement(step,"br");
		createTiddlyText(step,this.record1prompt);
		var input = createTiddlyElement(null,"input",null,"txtOptionInput");
		input.type = "text";
		input.size = 100;
		input.value = this.defaultRecordUID;
		step.appendChild(input);
		importer.recordIDBox = input;
	
		createTiddlyElement(step,"br");
		createTiddlyText(step,this.step1promptFile);
		var fileInput = createTiddlyElement(null,"input",null,"txtOptionInput");
		fileInput.type = "file";
		fileInput.size = 50;
		fileInput.onchange = this.onBrowseChange;
		fileInput.onkeyup = this.onBrowseChange;
		step.appendChild(fileInput);
		createTiddlyElement(step,"br");
		createTiddlyButton(step,this.fetchLabel,this.fetchPrompt,this.onFetch,null,null,null);
		if (!quiet) place.appendChild(importer);
    
  	  	if(UID)
  		{
  		  	importer.recordIDBox.value = UID;
   		 	config.macros.importSharedRecordsMetaData.startHttpGet(importer);
   		}
};

//}}}

/***
Additional intermediate handlers and call backs that handle event routing until the 
Meta Data JSON has been retreived from the server
***/

//{{{
//The handler for the Fetch button press
config.macros.importSharedRecordsMetaData.onFetch = function(e)
{
		var importer = findRelated(this,"importSharedRecordsMetaData","className","parentNode");
		config.macros.importSharedRecordsMetaData.startHttpGet(importer);
};

//Creates a URL string ot request the JSON meta data string.
//
//importer:  the tiddler element that contains the wizard elements to retrieve the parameters from.
config.macros.importSharedRecordsMetaData.startHttpGet = function(importer)
{
		var recordUID = importer.recordIDBox.value;
		var urlPrefix
		if(importer.httpBox)
		{
			urlPrefix = importer.httpBox.value;
		}
		else
		{
			urlPrefix = config.macros.importSharedRecordsMetaData.targetPath;
		}
		
		
		var url = urlPrefix + recordUID + "_log.json";	
		displayMessage("Retrieving Meta Data from: " + url);
		var r = loadRemoteFile(url,config.macros.importSharedRecordsMetaData.onLoad,importer);
		if(typeof r == "string")
			displayMessage("Problem with loadRemoteFile: " + r);
}

//The call back when the retrieval of the MetaData has completed.  
//method signature defined by loadRemoteFile function.  
config.macros.importSharedRecordsMetaData.onLoad = function(status,params,responseText,url,xhr)
{
		var importer = params;
		if(!status)
		{
			displayMessage(this.fetchError);
			return;
		}
	displayMessage("Retrieved " + responseText);
		//we know the text coming back from the server *should* be eval safe.  however, a malicious server
		//could cause some damage here.  there is a safe implemention from json.org we may want to consider
		//using over eval
		// DEBUG: alert(responseText);
		var json_obj = eval("(" + responseText + ")");
		
		config.macros.importSharedRecordsMetaData.doImport(importer, json_obj, url);
};
//}}}

/***
Code to do the import into tiddlers once the JSON has been retrieved and eval'd into a 
variable
***/

//{{{
//imports the meta data entries into the tiddler document
//
//importer: be the tiddler that is running the macro, 
//metaDataEntries: an array of metaDataEntry objects.  
config.macros.importSharedRecordsMetaData.doImport = function(importer, metaDataEntriesObject, url)
{
var t;
for(t=0; t<metaDataEntriesObject.tiddlers.length; t++)
{
var mde = metaDataEntriesObject.tiddlers[t];
config.macros.importSharedRecordsMetaData.saveMetaDataAsTiddler(store, 
mde,
url);
}

createTiddlyElement(importer,"h2",null,"step2",config.macros.importSharedRecordsMetaData.importSuccessful);
var step = createTiddlyElement(importer,"div",null,"wizardStep",config.macros.importSharedRecordsMetaData.step2Text.format([importer.recordIDBox.value]));
createTiddlyElement(step,"br");
createTiddlyText(step,"Import report logged to: [["+this.reportTiddler+"]]");
this.generateReportTiddler(step,metaDataEntriesObject,url);

store.notifyAll();
store.setDirty(true);

}

config.macros.importSharedRecordsMetaData.generateReportTiddler = function(place, metaDataEntriesObject, url)
{
// get/create the report tiddler
var theReport = store.getTiddler(this.reportTiddler);
if (!theReport) { theReport= new Tiddler(); theReport.title = this.reportTiddler; theReport.text = ""; }
// format the report content
var count = metaDataEntriesObject.tiddlers.length;
var now = new Date();
var newText = "On " + now.toLocaleString() + ", " + config.options.txtUserName
newText +=" imported " + count + " meta data tiddler" + (count == 1 ? "" : "s") + "\n";
newText += " from: " + url + "\n";
newText += "<<<\n";
for (var t=0; t<count; t++) {
	var mde=metaDataEntriesObject.tiddlers[t];
	if (mde.status) newText += "#[["+mde.Title+"]] " + "(" + mde.creator + ") - "+mde.status+"\n";
	}
newText += "<<<\n";
theReport.text = newText + ((theReport.text != "") ? '\n----\n' : "") + theReport.text;
theReport.modifier = config.options.txtUserName;
theReport.modified = new Date();
store.saveTiddler(theReport.title, theReport.title, theReport.text, theReport.modifier, theReport.modified, theReport.tags);
story.displayTiddler(null,theReport.title, 1, null, null, false);
story.refreshTiddler(theReport.title, 1, true);
}

//Adds a meta data entry to the tiddly store as a tiddler
//
//store: the tiddly store
//metaDataEntry: a meta data entry object, TODO: add link to definition
//title: the title of the meta data entry tiddler
config.macros.importSharedRecordsMetaData.saveMetaDataAsTiddler = function(store, metaDataEntry, url)
{ 
//TODO: evaluate content type and signature, if desired

var timeStamp = config.macros.importSharedRecordsMetaData.displayMyError.convertFromFullUTCISO1806(metaDataEntry.modified);

var modifier = metaDataEntry.modifier;
if(!modifier)
{
//there was no user for this entry
modifier = 'Anonymous';
}
var title = metaDataEntry.title;
if(!title)
{
title = 'No Title';
}

// DEBUG: displayMessage(metaDataEntry.RecordUID);

// ELS
// check for collision
metaDataEntry.status="not processed";
if (!store.tiddlerExists(title))
metaDataEntry.status="added";
else {
if (!config.macros.importSharedRecordsMetaData.quiet) 
var newtitle=prompt(this.collisionMsg.format([title]),title);
else
var newtitle=title; // QUIET=DON'T ASK... ALWAYS REPLACE COLLISIONS
if (!newtitle || !newtitle.length) status="skipped"
else if (newtitle==title) metaDataEntry.status="replaced"
else {
metaDataEntry.status="renamed from "+title;
title=newtitle;
}
}
if (metaDataEntry.status=="skipped") return;
metaDataEntry.Title=title; // update title
// ELS

store.saveTiddler(title, 
title,
metaDataEntry.text,
modifier,
timeStamp,
metaDataEntry.tags);
store.fetchTiddler(title).created = timeStamp;

//the sharedrecords.url will equal something like:
//http://sra.sharedrecords.org:8080/SRCDataStore/GetJsonMetaDataEntriesServlet
store.setValue(title, 
"sharedrecords.url", 
metaDataEntry['sharedRecords.url']);

store.setValue(title, 
"sharedrecords.recordUID", 
metaDataEntry['sharedRecords.recordUID']);

store.setValue(title, 
"sharedrecords.sequenceNumber", 
metaDataEntry['sharedRecords.sequenceNumber']);

store.setValue(title, 
"sharedRecords.contentType", 
metaDataEntry['contentType']);

store.notify(title,false);
}
//}}}

/***
Additional helper functions
***/
//{{{
//Creates the target URL when operating on a web server. 
//This assumes that the location of this html file is in the root path of some directory,
//and the target url is that director + the servlet name.
config.macros.importSharedRecordsMetaData.createTargetPath = function()
{
	var protocol = window.location.protocol;
	var path = window.location.pathname;
	// this is required because IE loading files locally uses "\s" and not "/"
	var separator = (protocol == "file:" && path.indexOf("/", 1) == -1 ? "\\" : "/");
	var path = window.location.pathname;
	var subPath = path.substring(0, path.lastIndexOf(separator) + 1);
	subPath = subPath + config.macros.importSharedRecordsMetaData.servletName;
	
	return(subPath);
};

//{{{
//Gets the server url for the location that a meta data integration was 
//pulled from
config.macros.importSharedRecordsMetaData.getServletURL = function(fullURL)
{
		var path = fullURL.substring(0, fullURL.indexOf('?'));
		return(path);	
};

//{{{
//Handle when the text for the file browser text box changes.  
//this simply parses the string, assuming the input is file name, and places the 
//filename into the recordUID box.  The value in this textbox is not used for anything
//but to generate the value in the recordUID box
config.macros.importSharedRecordsMetaData.onBrowseChange = function(e)
{
		var importer = findRelated(this,"importSharedRecordsMetaData","className","parentNode");
		var filename = this.value;
		var parts;
		var recordID;
		if(filename.indexOf('/') > 0)
		{
			parts = filename.split('/');
		}
		else
		{
			parts = filename.split('\\');
		}
		var lastpart = parts[parts.length - 1];
		if(lastpart.indexOf(".") > 0)
		{
			recordID = lastpart.substring(0, lastpart.indexOf("."));
		}
		importer.recordIDBox.value = recordID;
};

//A simple function to display an error message when generated
//
//myError:  the error object
//errorPrefix: any message to prepend with the generic error message
config.macros.importSharedRecordsMetaData.displayMyError = function(myError, errorPrefix)
{
	var displayString = myError.name + ': ' + myError.message + '( line: ' + myError.lineNumber +' )';
	if(errorPrefix)
	{
		displayString = errorPrefix + ' ' + displayString;
	}
	displayMessage( displayString );
}

// Static method to create a date from a UTC spit out by the shared record server
// the format is yyyy-MM-ddTHH:mm:ss.SSSz where z is the locale.  
// I am ingoring this here for now and the locae is assumed to be UTC
//
// dateString: the UTC date as string in the above format
config.macros.importSharedRecordsMetaData.displayMyError.convertFromFullUTCISO1806 = function(dateString)
{
	var theDate = new Date(Date.UTC(parseInt(dateString.substr(0,4),10),
							parseInt(dateString.substr(5,2),10)-1,
							parseInt(dateString.substr(8,2),10),
							parseInt(dateString.substr(11,2),10),
							parseInt(dateString.substr(14,2),10),
							parseInt(dateString.substr(17,2), 10)));
	return(theDate);
}

} // end of "install only once"
//}}}
