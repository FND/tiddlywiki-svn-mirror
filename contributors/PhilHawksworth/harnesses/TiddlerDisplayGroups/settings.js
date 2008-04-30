//{{{

config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;
config.options.txtTheme = "RippleRapSkin";

// Initialise the session display groupings
var test_group = new TiddlerDisplayGroup();

var test_pattern = [
	{label:'header', tag:'session', count:1, require:null, openAt:null},
	{label:'mynote', tag:'notes', count:1, require:'header', openAt:null},
	{label:'notes', tag:'discovered_notes', count:0, require:'header', openAt:'bottom'}];

test_group.setPattern(test_pattern); 
test_group.setGroupField('rr_session_id');

//}}}
