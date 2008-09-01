//{{{

config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;
config.options.txtTheme = "EasyExpensesSkin";

// Setup the session notes display groupings.
var claim_report_group = new TiddlerDisplayGroup();
var claim_report_pattern = [
	{label:'header', tag:'claim_header', count:1, require:'add', openAt:null},
	{label:'forms', tag:'claim_item', count:0, require:'header', openAt:null},
	{label:'add', tag:'add_form', count:1, require:'header', openAt:'bottom'}];
claim_report_group.setPattern(claim_report_pattern); 
claim_report_group.setGroupField('claim_id');

//}}}