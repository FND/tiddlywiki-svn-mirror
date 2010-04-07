jQuery(document).ready(function() {	
  module("TIDDLERS: Load test data");
	test("startup", function(){
	  var tiddlers = [
    {title:"MyTemplate","text":"hello world <<view title text>> has the id <<view id text>>",fields:{id:"9"}},    
    {title: "Jon Robson", tags:['team'],fields:{id:"5"}},
    {title: "Jeremy Ruston", tags:['team'],fields:{id:"2"}},
    {title: "Fred Dohr", tags:['team']},
    {title: "Jon Lister", tags:['oldteam']},
    {title: "Nick Webb", tags:['oldteam']},
    {title: "Welcome", text:"Welcome to the team wiki"},
    {title: "Address", text:"Our address"},
    ];

    config.extensions.testUtils.addTiddlers(tiddlers);
	})
	

	module("TIDDLERS: macro calls");
	test("macro.tiddler", function() {	
	  var expected,actual;
	  var place = document.createElement("div");
	  config.macros.tiddler.handler(place,null,null,null,"Welcome",store.getTiddler("Address"));
    actual = jQuery(place).text();
    expected = "Welcome to the team wiki";

    same(expected,actual,"checking <<tiddler Welcome>> works as before")
    
    jQuery(place).html("");
    config.macros.tiddler.handler(place,null,null,null,"MyTemplate",store.getTiddler("Address"));
    actual = jQuery(place).text();
    expected = "hello world MyTemplate has the id 9";
    same(expected,actual,"checking <<tiddler MyTemplate>> works as before")
    
	  jQuery(place).html("");
    config.macros.tiddler.handler(place,null,null,null,"MyTemplate data:'Jon Robson'",store.getTiddler("Address"));
    actual = jQuery(place).text();
    expected = "hello world Jon Robson has the id 5";
    same(expected,actual,"checking <<tiddler MyTemplate data:'Jon Robson'>> displays MyTemplate in context of tiddler Jon Robson")
  
    
    jQuery(place).html("");
    config.macros.tiddler.handler(place,null,null,null,"MyTemplate data:[[Jon Robson]]",store.getTiddler("Address"));
    actual = jQuery(place).text();
    expected = "hello world Jon Robson has the id 5";
    same(expected,actual,"checking <<tiddler MyTemplate data:[[Jon Robson]]>> displays MyTemplate in context of tiddler Jon Robson argument given in curly braces")
	  
	});
	
	test("macro.tiddlers", function() {	
	  var expected,actual;
	  var place = document.createElement("div");
	  
	  var tiddlers = store.filterTiddlers("[tag[team]]")
	  same(tiddlers.length,3, "checking filterTiddlers on tag works as expected");
	  
	  var tiddlers = store.filterTiddlers("[tag[teamtagdontexist]]")
	  same(tiddlers.length,0, "checking filterTiddlers on tag works as expected");
	  
	  
    jQuery(place).html("");
    config.macros.tiddlers.handler(place,null,null,null,"MyTemplate filter:'[tag[team]] [sort[+title]]'");
    actual = jQuery(place).text();
    expected = "hello world Fred Dohr has the id hello world Jeremy Ruston has the id 2hello world Jon Robson has the id 5";
    same(expected,actual,"checking <<tiddlers MyTemplate filter:[tag[team]][sort[+title]]>>")
    
    jQuery(place).html("");
    config.macros.tiddlers.handler(place,null,null,null,"MyTemplate filter:'[tag[teamtagdontexist]]'");
    actual = jQuery(place).text();
    expected = "";
    same(expected,actual,"checking what happens when filter doesn't match any tiddlers")
    
    jQuery(place).html("");
    config.macros.tiddlers.handler(place,null,null,null,"MyTemplate filter:[tag[teamtagdontexist]] ifEmptyString:'nowt there'");
    actual = jQuery(place).text();
    expected = "nowt there";
    same(expected,actual,"checking what happens when filter doesn't match any tiddlers and ifEmptyString parameter passed")
    
    
    jQuery(place).html("");
    config.macros.tiddlers.handler(place,null,null,null,"MyTemplate filter:[tag[teamtagdontexist]] ifEmpty:MyTemplate");
    actual = jQuery(place).text();
    expected = "hello world MyTemplate has the id 9";
    same(expected,actual,"checking what happens when filter doesn't match any tiddlers and ifEmpty parameter passed")
    
    
    
    
    
	});
	
});