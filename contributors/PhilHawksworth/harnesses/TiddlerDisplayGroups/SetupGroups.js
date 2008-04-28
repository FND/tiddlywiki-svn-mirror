
var test_group = new TiddlerDisplayGroup();
		
var test_pattern = [
	{label:'header', tag:'session', count:1, require:null, openAt:null},
	{label:'mynote', tag:'note', count:1, require:'header', openAt:null},
	{label:'notes', tag:'contributed_note', count:0, require:'header', openAt:'bottom'}];

test_group.setPattern(test_pattern); 
test_group.setGroupField('rr_session_id');
