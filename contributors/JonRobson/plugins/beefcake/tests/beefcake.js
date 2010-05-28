module("BEEFCAKE config.extensions.beefcake");

var oldAjaxReq = ajaxReq;

  ajaxReq = function(options){
    var url = options.url;
    console.log("made call to "+url);
    if(url.indexOf('/recipes/success/tiddlers.json') == 0){
        return options.success([{title:"beefcake.1",tags:['foo','bar','baz'],fields:{}},{title:"beefcake.2","tags":['baz','dum']}]);
    }
    else if(url.indexOf("/recipes/beefcake/tiddlers.json") == 0){
        console.log("returning this");
      return options.success([{title:'beefcake-macro-1',tags:['book']}])
    }
    else if(url.indexOf("/recipes/beefcake/tiddlers/beefcake-macro-1.json") == 0){
      return options.success({title:"beefcake-macro-1",tags:['book'],text:"charles dickens"});
    }
    else if(url.indexOf("/recipes/beefcake/tiddlers/beefcake-come-get_me.json") == 0){
      return options.success({title:"beefcake-macro-1",tags:['book'],text:"this test is awesome"});
    }
    else if(url.indexOf("/bags/beefcake.1/tiddlers.json") == 0){
        config.extensions.beefcake.ajaxMultipleBeefcakeCount += 1;
        return options.success([{title:'beefcake-macro-bag-1',tags:['book']}]);
    }
    else if(url.indexOf("/bags/beefcake.2/tiddlers.json") == 0){
        config.extensions.beefcake.ajaxMultipleBeefcakeCount += 1;
        return options.success([{title:'beefcake-macro-bag-2',tags:['book']}]);
    }
    else if(url.indexOf("/bags/beefcake.1/tiddlers/beefcake-macro-bag-1") == 0){
        config.extensions.beefcake.ajaxMultipleBeefcakeCount += 1;
        return options.success({title:'beefcake-macro-bag-1',tags:['book'],text:'text from bag 1'});
    }  
    else if(url.indexOf("/bags/beefcake.2/tiddlers/beefcake-macro-bag-2") == 0){
        config.extensions.beefcake.ajaxMultipleBeefcakeCount += 1;
        return options.success({title:'beefcake-macro-bag-2',tags:['book'],text:'text from bag 2'});
    }
    console.log(options.url+" errored");
    if(options.error)options.error();
    else console.log("nothing done");
  };
test("lazyloadtiddler",function(){

  config.extensions.beefcake.lazyloadtiddler({title:"beefcake.z",tags:["foo","jon"],fields:{"x":"2"}});

  var tid = store.getTiddler("beefcake.z");
  same(tid.no_beefcake_needed,false,"the flag must be set to show that the tiddler has not been fully loaded");
  same(tid.tags,["foo","jon"]);
  same(tid.fields["x"],"2");
});


/*
test("lazyloadtiddler store.getTiddler",function(){
  //would be nice to have a solution for something like this..
  jQuery("body").append("<div id='beefcake-test-code' tiddler='beefcake-come-get-me' refresh='content'></div>");
  var tid = store.getTiddler("beefcake-come-get-me");
  
  same(jQuery("#beefcake-test-code").text(),"this test is awesome","check getTiddlers are propagated from the server to tiddler elements");
 
});
*/

test("fullyloadtiddler",function(){
  config.extensions.beefcake.fullyloadtiddler({title:"beefcake.z",tags:["foo"],fields:{"x":"2"},text:"signed delivered sealed"});
  var tid = store.getTiddler("beefcake.z");
  same(tid.no_beefcake_needed,true,"the flag now signals it has been fully loaded");
  same(tid.text,"signed delivered sealed");
})

test("lazyload",function(){
        console.log("gok");
  config.extensions.beefcake.lazyload("/recipes/success/");
      console.log("gokx");
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
  console.log("display tid");
  story.displayTiddler(null,"beefcake-macro-1")
  //check the tiddler is now fully loaded and in the dom
  console.log("do check");
  same(tid.no_beefcake_needed,true,"has now been fully loaded");
  same(jQuery(".viewer","#tiddlerbeefcake-macro-1").text(),"charles dickens");
  
  
  /*
  story.displayTiddler(null,"beefcake-dontexist");
  same(jQuery(".viewer","#tiddlerbeefcake-dontexist").text(),config.messages.undefinedTiddlerToolTip);
  */
});

test("macro and displayTiddler",function(){
    
    config.extensions.beefcake.ajaxMultipleBeefcakeCount = 0;
    console.log("in here");
  config.macros.beefcake.handler(null,null,["bags/beefcake.1/"]);
  config.macros.beefcake.handler(null,null,["bags/beefcake.2/"]);
  
  story.displayTiddler(null,"beefcake-macro-bag-2");
  same(config.extensions.beefcake.ajaxMultipleBeefcakeCount,3);
  console.log("do next one..");
  story.displayTiddler(null,"beefcake-macro-bag-1");
  same(config.extensions.beefcake.ajaxMultipleBeefcakeCount,4);
  
  /*
  story.displayTiddler(null,"beefcake-dontexist");
  same(jQuery(".viewer","#tiddlerbeefcake-dontexist").text(),config.messages.undefinedTiddlerToolTip);
  */
});

//test to check loading in right order?
test("burn down",function(){
  ajaxReq = oldAjaxReq;
});
