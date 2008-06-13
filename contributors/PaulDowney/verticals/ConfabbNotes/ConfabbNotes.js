/***
<<PopulateNotes>> <<NextFeed>> <<GetNotes>> <<PutNotes>> <<KillMyNotes>>

|<<option txtSharedNotesUserName>>|<<message config.optionsDesc.txtSharedNotesUserName>>|
|<<option chkSharedNotesPutEnabled>>|<<message config.optionsDesc.chkSharedNotesPutEnabled>>|
|<<option chkSharedNotesGetEnabled>>|<<message config.optionsDesc.chkSharedNotesGetEnabled>>|
|<<option txtRippleRapConferenceURI>>|<<message config.optionsDesc.txtRippleRapConferenceURI>>|
***/


//{{{
	
if(!version.extensions.ConfabbNotes) {
version.extensions.ConfabbNotes = {installed:true};

config.macros.ConfabbNotes = {};

config.macros.ConfabbNotes.init = function(){
	config.macros.SharedNotes.install();
	var baseUri = config.options.txtRippleRapConferenceURI;
        baseUri += ((baseUri.slice(-1)!='/')?"/":"");
	config.macros.RippleRapEdition.installSharedNotes(baseUri);
	config.macros.RippleRapEdition.installEnjoyedNotes(baseUri);
};

config.macros.ConfabbNotes.nextFeed= function(){
	var feed = config.macros.SharedNotes.feedListManager.nextUriObj();
	if (feed){
		displayMessage("skipped to: "+feed.name + " " + feed.uri);
	}
	return false;
};

config.macros.NextFeed = {};
config.macros.NextFeed.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var button = createTiddlyButton(place,'NEXT FEED','Click here to skip to next FeedListManager item',config.macros.ConfabbNotes.nextFeed);
};


}
//}}}
