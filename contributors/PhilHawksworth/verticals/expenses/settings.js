//{{{

config.options.chkAutoSave = true;
config.options.chkAnimate = true;
config.options.chkSaveBackups = false;
config.options.txtTheme = "EasyExpensesSkin";

var claim_group = new TiddlerDisplayGroup();
var claim_group_pattern = [
	{label:'claimHeader', tag:'claimHeader', count:1, require:null, openAt:null},
	{label:'claimItems', tag:'claimItem', count:0, require:'claimHeader', openAt:'top'}];
claim_group.setPattern(claim_group_pattern); 
claim_group.setGroupField('claim_id');

//}}}