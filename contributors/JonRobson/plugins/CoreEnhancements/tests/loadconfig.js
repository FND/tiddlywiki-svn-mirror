jQuery(document).ready(function() {	
  module("CORE ENHANCEMENTS: loadConfig");
	test("startup", function(){
	  var tiddlers = [
    {title:"enhancedcore_tiddler_a",tags:[]},
    {title:"Config",tags:[],"text":"messages.txtUserName: bob\nmacros.dontexist.foo:xyz\nmessages.url:{{ window.location }}\nmessages.sum: {{parseInt(config.numberone) + parseInt(config.numbertwo)}}"}
    ];

    config.extensions.testUtils.addTiddlers(tiddlers);
	});
	
	
	test("test loadConfig",function(){
	  config.numberone = "5";
	  config.numbertwo = "20";
	  loadConfig();
	  same(config.messages.txtUserName,"bob");
	  same(config.messages.url,window.location);
	  same(config.messages.sum,25);
    
	})
	
});