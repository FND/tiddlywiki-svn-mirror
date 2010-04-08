module("ENHANCEDVIEWSPLUGIN");
test("setup tiddlers for tests", function(){
  config.extensions.testUtils.addTiddlers([{title:"enhancedviews.foo"},{title:'view.EmptyTiddler',text:'<<view title text>> does not exist'},{title:"enhancedviews.baz",fields:{"score":"23"}}]);
});
test("toJSON", function(){
  var json ="x:foo y:z z:'a b c'".toJSON();
  same(json,{x:"foo",y:"z",z:"a b c"},"toJSON working as exected");
  
});

test("new ifEmptyString and ifEmpty parameters", function(){
  var place,tiddler;
  place= document.createElement("div");
  tiddler = store.getTiddler("enhancedviews.foo")
  config.macros.view.handler(place,null,['score','text'],null,"score text ifEmptyString:'not scored'",tiddler)
  same(jQuery(place).text(),'not scored','the field did not exist in the tiddler so ifEmptyString should take over');
  jQuery(place).html("");
  
  tiddler = store.getTiddler("enhancedviews.baz")
  config.macros.view.handler(place,null,['score','text'],null,"score text ifEmptyString:'<not scored>'",tiddler)
  same(jQuery(place).text(),'23','the value exists so is printed');  
  
  jQuery(place).html("");
  var tid = store.getTiddler("view.EmptyTiddler");
  same(tid.title,"view.EmptyTiddler","empty tiddler is in place")
  config.macros.view.handler(place,null,['sz','text'],null,"sz text ifEmpty:view.EmptyTiddler",tiddler)
  var firstChild = jQuery(place).children()[0];
  same(jQuery(firstChild).attr("tiddler"),"view.EmptyTiddler","tiddler is placed in absence of field");
});

test("test link external view", function(){
  var place,tiddler;
  place= document.createElement("div");
  tiddler = store.getTiddler("enhancedviews.foo")
  config.macros.view.handler(place,null,['title', 'linkexternal'],null,"title linkexternal prefix:/x/ suffix:/bar.html",tiddler)
  same(jQuery("a",place).attr("href"),'/x/enhancedviews.foo/bar.html',"there should be a link element with the correctly formed url");
  jQuery(place).html("");  
});