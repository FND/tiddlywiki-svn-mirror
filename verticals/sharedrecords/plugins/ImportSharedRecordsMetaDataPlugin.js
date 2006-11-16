/***
!importSharedRecordsMetaData Plugin
|Author: Jonathan Jackson|
|Source: TODO|
|Version: 1.1.2|

!Revisions
*2006-11-14 Revised by Eric to help launch automatically and create an import record
*2006-11-07 Initial draft

!Example
|Source|Output|
|{{{<<importSharedRecordsMetaData>>}}}|Creates a wizard to specify record UID|
|{{{<<importSharedRecordsMetaData recordUID>>}}}|imports the meta data of the specified recordUID|
|{{{<<importSharedRecordsMetaData recordUID quiet>>}}}|imports the meta data of the specified recordUID and does not display the wizard|

!Javascript code
Main macro handler and text variables
***/
//{{{

// Version
version.extensions.importSharedRecordsMetaData = {major: 1, minor: 1, revision: 2, date: new Date(2006,11,06)};

//Define string variables used by the plugin
config.macros.importSharedRecordsMetaData = {};
config.macros.importSharedRecordsMetaData = {
	defaultURL: "http://sra.sharedrecords.org:8080/SRCDataStore/GetJsonMetaDataEntriesServlet", //"http://sra.sharedrecords.org:8080/SRCDataStore/GetJsonMetaDataEntriesServlet",
	servletName: "GetJsonMetaDataEntriesServlet",
	wizardTitle: "Import Shared Records Meta Data",
	step1: "Select a record UID",
	http1prompt: "Enter a http url to retrieve the meta data from",
	record1prompt: "Enter a recordUID to retrieve the Meta Data For:",
	step1promptFile: "... or select a file whose name is a recordUID:",
	fetchLabel: "Get Meta Data Entries",
	importSuccessful: "Import of Meta Data Entries Successful",
	defaultRecordUID: "d19905e85b097d18f9984dd6a651ebfce22c65e0", //"e1277abf727b36e55f8ef53bcfab16a8a2259e48",
	step2Text: "Meta data imported for record: %0",
	targetURL: "",
	reportTiddler: "ImportedMetaDataReport",
	collisionMsg: "The tiddler '%0' already exists.\n\nPlease enter a new title for the imported tiddler...\nOR, keep the same title to replace the existing tiddler...\nOR,press CANCEL to skip this tiddler.",
	quiet: false
};

// ELS: parameter passing in URL via: #recordUID:e1277abf727b36e55f8ef53bcfab16a8a2259e48
// immediately executes 
config.paramifiers.recordUID = {
	onstart: function(id) {
		var t="<<importSharedRecordsMetaData "+id+" quiet>>";
		var e=document.createElement('span'); wikify(t,e); e.parentNode.removeChild(e);
	}
};

// Slight hack to automatically load initial recordUIDs
config.macros.importSharedRecordsMetaData.init = function()
{
	var records = store.getTiddlerText("SharedRecordsAutoSyncRecordUIDs","").split("\n");
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
		
		
		var url = urlPrefix + "?recordUID=" + recordUID;	
		displayMessage("Retrieving Meta Data...");
		loadRemoteFile(url,config.macros.importSharedRecordsMetaData.onLoad,importer);
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
// ELS 
config.macros.importSharedRecordsMetaData.generateReportTiddler = function(place, metaDataEntriesObject, url)
{
// get/create the report tiddler
var theReport = store.getTiddler(this.reportTiddler);
if (!theReport) { theReport= new Tiddler(); theReport.title = this.reportTiddler; theReport.text = ""; }
// format the report content
var shortURL=url.substr(0,url.lastIndexOf("&"));
var UIDparam=shortURL.substr(shortURL.lastIndexOf("?")+1);
var shortURL=shortURL.substr(0,shortURL.lastIndexOf("?"));
var count=metaDataEntriesObject.tiddlers.length;
var now = new Date();
var newText = "On "+now.toLocaleString()+", "+config.options.txtUserName
newText +=" imported "+count+" meta data tiddler"+(count==1?"":"s");
newText += " from\n[["+shortURL+"|"+shortURL+"]]\n";
newText += "using: "+UIDparam+"\n";
newText += "<<<\n";
for (var t=0; t<count; t++) {
var mde=metaDataEntriesObject.tiddlers[t];
if (mde.status) newText += "#[["+mde.Title+"]] " + "(" + mde.creator + ") - "+mde.status+"\n";
}
newText += "<<<\n";
// update the ImportedTiddlers content and show the tiddler
theReport.text = newText+((theReport.text!="")?'\n----\n':"")+theReport.text;
theReport.modifier = config.options.txtUserName;
theReport.modified = new Date();
store.saveTiddler(theReport.title, theReport.title, theReport.text, theReport.modifier, theReport.modified, theReport.tags);
story.displayTiddler(null,theReport.title,1,null,null,false);
story.refreshTiddler(theReport.title,1,true);
}
// ELS

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

//}}}
