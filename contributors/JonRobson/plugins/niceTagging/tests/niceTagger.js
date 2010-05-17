module("NICETAGGER");
//saving "   " works when it shouldn't..
test("setup",function(){
  config.extensions.testUtils.addTiddlers([
    {title:"nicetagger.1",tags:['foo','bar','baz'],fields:{"nicetagger.field":"z","nicetagger.field2":"e [[c d]]"}},
    {title:"nicetagger.2","tags":['baz','dum'],fields:{"nicetagger.field":"z","nicetagger.field2":"a b [[c d]]"}},
    {title:"nicetagger.3","tags":['mad hatter','alice','lewis'],fields:{"nicetagger.field":"d"}},
    {title:"nicetagger.4","tags":['ben','colin'],fields:{}},
    {title:"nicetagger.suggestions","text":"andrew\nbob\ncaro\ndavid\nerin\nDAVID\ndavid"} ,
    {title:"nicetagger.suggestions.w","text":"<<message messages.nicetaggerfoo>>\n<<message messages.nicetaggerbar>>\n<<message messages.nicetaggerbaz>>"} 
  ]);
});
test("refreshFieldDisplay",function(){
  var place = document.createElement("div");
  jQuery(place).html("<div class='niceTagger'></div>");
  config.macros.niceTagger.refreshFieldDisplay(place,store.getTiddler("nicetagger.1"),"tags");
  var tags = jQuery(".tag",place);
  var deleters = jQuery(".deleter",place);
  same(tags.length,3);
  same(deleters.length,3);
})



test("save",function(){
  var tid;
  var place = document.createElement("div");
  config.macros.niceTagger.save('nicetagger.2','x',['a','b to the d','c'],place);
  tid = store.getTiddler("nicetagger.2");
  same(tid.fields['x'],"a [[b to the d]] c","the values saved to the field correct in wiki format")
  
  config.macros.niceTagger.save('nicetagger.2','tags',['z','x','d'],place);
  tid = store.getTiddler("nicetagger.2");
  same(tid.tags,['z','x','d'],"the values saved to the tags as a list")
});


test("saveNewTag",function(){
  var place = document.createElement("div");
  jQuery(place).html("<div class='niceTagger'></div>");
  config.macros.niceTagger.saveNewTag(store.getTiddler("nicetagger.3"),"tags","doormouse",place,",");
  tid = store.getTiddler("nicetagger.3");
  same(tid.tags,['mad hatter','alice','lewis','doormouse'],"now 4 tags on the tiddler")
  var tags = jQuery(".tag",place);
  same(tags.length,4,"4 tags visible in display");
  
  config.macros.niceTagger.saveNewTag(store.getTiddler("nicetagger.3"),"tags","doormouse",place,",");
  same(tid.tags.length,4,"should still be 4 tags (duplicate tag should be ignored)")

  config.macros.niceTagger.saveNewTag(store.getTiddler("nicetagger.3"),"tags","cat,mouse",place,",");
  same(tid.tags.length,6,"the separator should split the cat and mouse tags");
  
  config.macros.niceTagger.saveNewTag(store.getTiddler("nicetagger.3"),"tags","   ",place,",");
  same(tid.tags.length,6,"adding whitespace doesn't add a tag");
  
  
});
test("getSuggestionsFromTiddler",function(){
  var suggestions;
  suggestions = config.macros.niceTagger.getSuggestionsFromTiddler("nicetagger.suggestions",false);
  same(suggestions.length,6,"there should only be 6 UNIQUE tags");
  suggestions = config.macros.niceTagger.getSuggestionsFromTiddler("nicetagger.suggestions","lower");
  same(suggestions.length,5,"there should only be 5 UNIQUE LOWERCASE tags (davids merge into one)");

  config.messages.nicetaggerfoo = "hello";
  config.messages.nicetaggerbaz = "hello";
  config.messages.nicetaggerbar = "world";
  wikifiedSuggestions = config.macros.niceTagger.getSuggestionsFromTiddler("nicetagger.suggestions.w",false);
  same(wikifiedSuggestions.length,2,"only 2 suggestions should make it out of wikification");
  var present = eval(wikifiedSuggestions.indexOf("world") !=-1);
  same(present,true," the word world should be present in the suggestions as the tiddler is wikified")
});

test("check initialisation of niceTagger",function(){
  config.macros.niceTagger.init("tags");
  config.macros.niceTagger.init("nicetagger.field");
  config.macros.niceTagger.init("nicetagger.field2");
  var suggestedTags = config.macros.niceTagger.twtags["tags"];
  var fieldSuggestions = config.macros.niceTagger.twtags["nicetagger.field"];
  var fieldSuggestions2 = config.macros.niceTagger.twtags["nicetagger.field2"];
  var present = eval(suggestedTags.indexOf("mad hatter") != -1);
  same(present,true," the tag mad hatter should be present");
  same(fieldSuggestions.length,2,"only 2 field values should exist z and d");
  same(fieldSuggestions2.length,4,"only 4 field values should be interpreted here");
});


test("remove from list",function(){
  var newlist = config.macros.niceTagger.removeFromList(['jon', 'barry','frank','aly','ben','colin'],['colin','barry']);
  same(newlist.length,4);
  same(newlist,['jon','frank','aly','ben'],"correct contents");
  
})

test("macro",function(){
  var tid,tags;
  var place = document.createElement("div");
  //run
  config.macros.niceTagger.handler(place,null,null,null,"field:tags",store.getTiddler("nicetagger.4"));
  //test
  var input =jQuery("input[type=text]",place);
  var button =jQuery("input[type=button]",place);
  activeTags = jQuery(".tag",place);
  same(input.length,1,"macro has created one input box")
  same(button.length,1,"macro has created one button");
  same(activeTags.length,2,"only 2 tags should be active");
  
  //prep
  input.val("");
  
  //run
  button.click();  
  activeTags = jQuery(".tag",place);
  tid = store.getTiddler("nicetagger.4");
  same(tid.tags.length,2,"still 2 tags no input put in..");
  same(activeTags.length,2,"only 2 tags should be active");
  //test saving
  input.val("jon");
  button.click();
  tid = store.getTiddler("nicetagger.4");
  activeTags = jQuery(".tag",place);
  same(tid.tags.length,3,"3 tags now after pressing button with input");
  same(activeTags.length,3,"3 tags should now be visible");
  input =jQuery("input[type=text]",place);
  same(input.length,1,"still one input box to be seen");
})


