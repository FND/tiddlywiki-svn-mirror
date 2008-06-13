/***
<<PopulateNotes>>  <<PutNotes>>  <<GetNotes>>

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

}
//}}}
