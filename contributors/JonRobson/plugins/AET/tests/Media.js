//'viewimage field:image maxheight:190 maxwidth:250 class:articleimage
module("AET Media (Files,Images,Video)");
test("setup",function(){
  config.extensions.testUtils.addTiddlers([
    {title:"aet.imagetiddler",tags:['foo','bar','baz'],fields:{"image":"100x100.png","video":"http://youtube.com/video"}}
  ]);
});

test("macro: view image", function(){
  var image = new Image();
  var expected,actual,place,place2,tid;
  place = document.createElement("div");
  tid = store.getTiddler("aet.imagetiddler");
  image.onload = function(){
    
    place = document.createElement("div");
    config.macros.view.handler(place,null,["image","image"],null,"image image maxheight:50 maxheight:20 class:articleimage",tid);
  
    var imgs = jQuery("img",place);
    same(imgs.length,1,"checking image got created in place")
    var img = jQuery(imgs[0]);
    same(img.attr("src"),"100x100.png");
    same(img.hasClass("articleimage"),true,"class added to element");
    same(img.height(),20,"max height has been applied");
    same(img.width(),20,"width proportionate to height");
  }
  image.src = "100x100.png";
  place2 = document.createElement("div");
  config.macros.view.handler(place2,null,["image","image"],null,"image image src:10x10.png class:articleimage",tid);
  same(jQuery(jQuery("img",place2)[0]).attr("src"),"10x10.png","checking can override the src of the image");
  
  jQuery(place2).html("");

  config.macros.aet.setMetaData("aet.imagetiddler",'image','http://t3.gstatic.com/images?q=tbn:cIGPCF08mCk7nM:http://bizbox.slate.com/blog/google.jpg');
  same(config.macros.aet.getMetaData("aet.imagetiddler",'image'),'http://t3.gstatic.com/images?q=tbn:cIGPCF08mCk7nM:http://bizbox.slate.com/blog/google.jpg',"url got set ok")
  config.macros.aet.handler(place2,null,[],null,"type:image field:image nohotlinking:true class:articleimage",tid);
  var imgs = jQuery("img",place2);
  same(imgs.length,0,"no hotlinking set");

});


test("macro: view video", function(){
 
  var expected,actual,place,place2,tid;
  place = document.createElement("div");
  tid = store.getTiddler("aet.imagetiddler");
  config.macros.view.handler(place,null,["video","video"],null,"video video width:200 src:jonsunsupportedwebsite.com/video",tid);
  same("",jQuery(place).text(),"only selected external video websites work.");
  //if(!config.browser.isIE){
    config.macros.aet.setMetaData("aet.imagetiddler",'video','http://www.youtube.com/watch?v=Bxvm0LKbcAI');
    config.macros.view.handler(place,null,["video","video"],null,"video video width:200",tid);
    same(jQuery("object",place).length,1,"object created");
  //}
  config.macros.aet.setMetaData("aet.imagetiddler",'video','');
  
  config.macros.view.handler(place,null,["video","video"],null,"video video width:200",tid);
  same("",jQuery(place).text(),"blank works fine");
});