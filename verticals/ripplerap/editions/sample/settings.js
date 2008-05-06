//{{{

config.options.txtMainTab = "AgendaDay1";
config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;

config.options.txtTheme = "RippleRapSkin";

// Setup the session notes display groupings.
var session_notes_groups = new TiddlerDisplayGroup();
var session_notes_pattern = [
	{label:'header', tag:'session', count:1, require:null, openAt:null},
	{label:'mynote', tag:'notes', count:1, require:'header', openAt:null},
	{label:'notes', tag:'discovered_notes', count:0, require:'header', openAt:'bottom'}];
session_notes_groups.setPattern(session_notes_pattern); 
session_notes_groups.setGroupField('rr_session_id');

//}}}
