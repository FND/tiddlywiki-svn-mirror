jQuery(document).ready(function() {	
  module("CORE ENHANCEMENTS: gatherFields");
	test("gather fields - can i", function(){
	  var story= new Story();
	  config.defaultCustomFields['x'] = 'hello';
	  var fields = {};
	  jQuery("body").append("<div id='CoreEnhancements-overridecustom'><input type='text' value='foo' edit='x'></div>")

	  story.gatherSaveFields(jQuery("#CoreEnhancements-overridecustom")[0],fields);
    
    same(fields['x'],'foo');
	  
	});
});