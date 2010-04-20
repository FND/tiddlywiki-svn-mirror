module("BEEFCAKE config.extensions.beefcake");

var oldAjaxReq = ajaxReq;
test("setup",function(){
  ajaxReq = function(options){
    var url = options.url;
    if(url == 'recipes/success/tiddlers.json'){
        return options.success([{title:"beefcake.1",tags:['foo','bar','baz'],fields:{}},{title:"beefcake.2","tags":['baz','dum']}]);
    }
    else if(url.indexOf("recipes/beefcake/tiddlers.json") == 0){
      return options.success([{title:'beefcake-macro-1',tags:['book']}])
    }
    else if(url.indexOf("recipes/beefcake/tiddlers/beefcake-macro-1.json") == 0){
      return options.success({title:"beefcake-macro-1",tags:['book'],text:"charles dickens"});
    }
    else if(url.indexOf("recipes/beefcake/tiddlers/beefcake-come-get_me.json") == 0){
      return options.success({title:"beefcake-macro-1",tags:['book'],text:"this test is awesome"});
    }
    options.error();
  }
});
test("lazyloadtiddler",function(){
  config.extensions.beefcake.lazyloadtiddler({title:"beefcake.z",tags:["foo","jon"],fields:{"x":"2"}});
  var tid = store.getTiddler("beefcake.z");
  same(tid.no_beefcake_needed,false,"the flag must be set to show that the tiddler has not been fully loaded");
  same(tid.tags,["foo","jon"]);
  same(tid.fields["x"],"2");
});


test("lazyloadtiddler store.getTiddler",function(){
  //would be nice to have a solution for something like this..
  jQuery("body").append("<div id='beefcake-test-code' tiddler='beefcake-come-get-me' refresh='content'></div>");
  var tid = store.getTiddler("beefcake-come-get-me");
  
  same(jQuery("#beefcake-test-code").text(),"this test is awesome","check getTiddlers are propagated from the server to tiddler elements");
 
});


test("fullyloadtiddler",function(){
  config.extensions.beefcake.fullyloadtiddler({title:"beefcake.z",tags:["foo"],fields:{"x":"2"},text:"signed delivered sealed"});
  var tid = store.getTiddler("beefcake.z");
  same(tid.no_beefcake_needed,true,"the flag now signals it has been fully loaded");
  same(tid.text,"signed delivered sealed");
})

test("lazyload",function(){
  config.extensions.beefcake.lazyload("recipes/success/tiddlers.json");
  var tid =store.getTiddler("beefcake.1");
  same(tid.no_beefcake_needed,false,"the flag must be set to show that the tiddler has not been fully loaded");
});

module("BEEFCAKE config.macros.beefcake");
test("macro and displayTiddler",function(){
  config.macros.beefcake.handler(null,null,["recipes/beefcake/"]);
  
  //check all the expected tiddlers are loaded
  var tid = store.getTiddler("beefcake-macro-1");
  same(tid.text,"","lazy loaded so no text yet");
  same(tid.no_beefcake_needed,false,"the flag must be set to show that the tiddler has not been fully loaded");
  story.displayTiddler(null,"beefcake-macro-1")
  //check the tiddler is now fully loaded and in the dom
  same(tid.no_beefcake_needed,true,"has now been fully loaded");
  same(jQuery(".viewer","#tiddlerbeefcake-macro-1").text(),"charles dickens");
  
  
  /*
  story.displayTiddler(null,"beefcake-dontexist");
  same(jQuery(".viewer","#tiddlerbeefcake-dontexist").text(),config.messages.undefinedTiddlerToolTip);
  */
});
//test to check loading in right order?
test("burn down",function(){
  ajaxReq = oldAjaxReq;
});
