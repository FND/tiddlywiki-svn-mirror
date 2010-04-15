module("AET Core");
test("setup",function(){
  config.extensions.testUtils.addTiddlers([
    {title:"aet.jp",tags:['foo','bar','baz'],fields:{"reports":""}},
    {title:"aet.jon",tags:['foo','bar','baz'],fields:{"reports":"aet.jeremy"}},
    {title:"aet.jeremy","tags":['baz','dum'],fields:{"reports":"aet.jp"}},
    {title:"aet.martin","tags":['baz','dum'],fields:{"reports":""}},
    {title:"aet.suggestions",text:"rabbit\ncat\nmonkey"},
    {title:"aet.suggestions.complex",text:"mammals>\ncat\nmonkey<\nreptiles>\nsnake\nlizard<\namphibians>\nfrog<"}
  ]);
});
test("testing lingo",function(){
  config.macros.AdvancedEditTemplate.lingo.foo = "testing foo";
  same("testing foo",config.macros.AdvancedEditTemplate.translate("foo"),"Translation working as expected?");
})
test("getMetaData / setMetaData", function(){
  var expected,actual
  expected = config.macros.aet.getMetaData("aet.jon","reports");
  same(expected,"aet.jeremy","testing getMetaData");

  expected =config.macros.aet.getMetaData("aet.jon","likes");
  same(expected,false,"testing missing field value");
  
  config.macros.aet.setMetaData("aet.jon","likes","cheese");
  expected =config.macros.aet.getMetaData("aet.jon","likes");
  same(expected,"cheese","testing setting then getting a value");
  
  config.macros.aet.setMetaData("aet.jon","likes",false);
  expected =config.macros.aet.getMetaData("aet.jon","likes");
  same(expected,false,"testing setting a field to false");
  
  config.macros.aet.setMetaData("aet.dontexist","likes","everything");
  expected =config.macros.aet.getMetaData("aet.dontexist","likes");
  same(expected,"everything","checking the save to a non-existing tiddler worked ok");
  
  config.macros.aet.setMetaData("aet.jon","likes","");
  same(config.macros.aet.getMetaData("aet.jon","likes"),false,"checking empty string was saved");
  
});


module("AET Dropdowns (core)");
test("macro: create simple dropdown in new tiddler (Doesn't exist in store)", function(){
  var expected,actual,place,tid;
  place = document.createElement("place");
  
  config.macros.aet.handler(place,null,null,null,"type:dropdown field:animal values:aet.suggestions",tid);
  
  var selects = jQuery("select",place);
  var options = jQuery("option",place);
  same(selects.length,1);
  same(options.length,4); //3 animals + the header
  jQuery(place).html("");
  
  config.macros.aet.handler(place,null,null,null,"type:dropdown field:animal valuesSource:aet.suggestions",tid);
  
  var selects = jQuery("select",place);
  var options = jQuery("option",place);
  same(selects.length,1,"checking the deprecated valuesSource parameter");
  same(options.length,4,"checking the deprecated valuesSource parameter"); //3 animals + the header
  
});


test("macro: complex dropdown", function(){
  var expected,actual,place,tid,option;
  place = document.createElement("place");
  tid = store.getTiddler("aet.jp");
  config.macros.aet.handler(place,null,null,null,"type:dropdown field:animal values:aet.suggestions.complex",tid);
  
  var selects = jQuery("select",place);
  same(selects.length,4,"should be the main menu plus 3 sub menus")
  var select = selects[0];
  option = jQuery("option",select)[2];
  
  same(jQuery(option).text(),"reptiles","we will use the reptiles option for this test.");
  select.selectedIndex =2;
  jQuery(select).change() //choose 1st option in the 2nd dropdown (reptiles)
  
  //now snake should be visible
  same(selects[1].style.display,"none","1st sub menu is hidden");
  same(selects[2].style.display,"","2nd sub menu is visible");
  same(selects[3].style.display,"none","3rd sub menu is hidden");
  
  expected = config.macros.aet.getMetaData("aet.jp","animal");
  same(expected,"reptiles","choosing option propagated to the field")
  
});

test("macro: complex dropdown saving to multiple fields", function(){
  var expected,actual,place,tid,option;
  place = document.createElement("place");
  tid = store.getTiddler("aet.jp");
  config.macros.aet.handler(place,null,null,null,"type:dropdown field:family,species values:aet.suggestions.complex",tid);
  
  var selects = jQuery("select",place);
  same(selects.length,4,"should be the main menu plus 3 sub menus")
  var select = selects[0];
  option = jQuery("option",select)[2];
  
  same(jQuery(option).text(),"reptiles","we will use the reptiles option for this test.");
  select.selectedIndex =2;
  jQuery(select).change()
  
  //now snake should be visible
  same(selects[1].style.display,"none","1st sub menu is hidden");
  same(selects[2].style.display,"","2nd sub menu is visible");
  same(selects[3].style.display,"none","3rd sub menu is hidden");
  
  selects[2].selectedIndex = 2; //set to lizard
  jQuery(selects[2]).change();
  
  expected = config.macros.aet.getMetaData("aet.jp","family");
  same(expected,"reptiles","choosing option propagated to the field")
  
  expected = config.macros.aet.getMetaData("aet.jp","species");
  same(expected,"lizard","choosing option propagated to the field")
  
});

test("macro: preloading existing values", function(){
  var expected,actual,place,tid,option;
  place = document.createElement("place");
  tid = store.getTiddler("aet.jp");
  config.macros.aet.setMetaData("aet.jp","family","amphibians");
  config.macros.aet.setMetaData("aet.jp","species","frog");
  config.macros.aet.handler(place,null,null,null,"type:dropdown field:family,species values:aet.suggestions.complex",tid);
  
  var selects = jQuery("select",place);
  var selected_option = jQuery("option:selected",selects[0]);
  
  same(selected_option.val(),"amphibians","amphibians is preselected");
  
  same(selects[3].style.display,"","amphibians sub menu is visible");
  same(jQuery("option:selected",selects[3]).val(),"frog","other option is set as frog");
  
});

module("AET Text (core)");
test("macro: text",function(){
    var   place = document.createElement("place");
    var tid = store.getTiddler("aet.jp");
    config.macros.aet.handler(place,null,null,null,"type:text field:foo maxlength:5 rows:2",tid);
    same(jQuery("textarea",place).length,1,"checking the text area was created")
    
    config.macros.aet.handler(place,null,null,null,"type:text field:foo maxlength:5",tid);
    var inputs = jQuery("input",place);
    same(inputs.length,1,"checking the  input was created")
    same(jQuery(inputs[0]).attr("maxlength"),5,"max length attribute set");
});

