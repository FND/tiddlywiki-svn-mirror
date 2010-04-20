module("CompareWithPlugin");

var compareWithAjaxReq = ajaxReq;
test("setup",function(){  
  config.macros.comparewith.ajaxReq = function(options){

    if(options.url == 'host/bags/foo/tiddlers/comparewith.test/revisions/11.json'){
      options.success({text:"changed text",fields:{"food":"kebab","foo":"test","meal":"lunch"}}) //restaurant not present, text and food changed.
      
    }
    else{
      throw "unknown url passed to ajaxReq ("+options.url+")"
    }
  };
  
  config.extensions.testUtils.addTiddlers([
    {title:"comparewith.test",tags:[],text:"old text",fields:{'server.host':'host/', 'server.bag':'foo','server.page.revision':"12","food":"burger","foo":"test","meal":"lunch","restaurant":"tiddlyfood"}}
  ]);
});

test("comparewith",function(){
  var actual =config.macros.comparewith.compareTiddlers({text:"different",fields:{"food":"pizza","foo":"test","empty":"","restaurant":"bar","meal":"lunch"}},{text:"changed text",fields:{"food":"kebab","foo":"test","meal":"lunch"}});
  //a list of changed fields has been returned
  same(actual.contains("food"),true,"should be in there");
  same(actual.contains("restaurant"),true,"should be in there");
  same(actual.contains("text"),true,"text should be in there");
  same(actual.contains("foo"),false,"should not be in there");
  same(actual.contains("meal"),false,"should not be in there");
  same(actual.contains("empty"),false,"the empty field is present in the first as an empty string but not present in the second");
})
test("macro",function(){
  config.defaultCustomFields['server.host'] = "host/";
  var place = document.createElement("div");
  
  var setupPlace = function(place){
    jQuery(place).html("<div class='level.1'><textarea edit='text'/><input edit='foo'/><div class='level.2'><input edit='food'/><input name='meal'/><div class='level.3'><input edit='restaurant'/></div></div><div class='level.1'></div></div>")
  }
  jQuery("body").append(place);

  var tiddler = store.getTiddler("comparewith.test");
  //check default behaviour
  setupPlace(place);
  config.macros.comparewith.handler(place,null,[],null,null,tiddler);
  same(jQuery(".comparewithmacro-highlighted",place).length,3,"food and text changed, restaurant field is not in old version");
  
});

test("teardown",function(){
  ajaxReq =compareWithAjaxReq;
  
});