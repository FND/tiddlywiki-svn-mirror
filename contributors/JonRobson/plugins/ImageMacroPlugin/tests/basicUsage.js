jQuery(document).ready(function() {	
  module("ImageMacroPlugin: basic usage");
	test("startup", function(){
	  var tiddlers = [
    {title:"SVGExample.svg",tags:[],"text":'<svg><rect x = "10" y = "10" rx = "20" ry = "10" width = "200" height = "80" fill = "#d7d0b9" stroke = "#333" stroke-width = "1"/></svg>'}
    ];

    config.extensions.testUtils.addTiddlers(tiddlers);
	});
	
	
	test("&lt;&lt;image SVGExample.svg&gt;&gt;",function(){
	  var place = document.createElement("div");
		wikify("<<image SVGExample.svg>>",place);
		var tid = store.getTiddler("SVGExample.svg");
		same(tid.title,"SVGExample.svg");
		same(jQuery("svg",place).length,1);
	});
	
	test("&lt;&lt;image SVGExample.svg 20 20&gt;&gt;",function(){
	  var place = document.createElement("div");
		wikify("<<image SVGExample.svg 20 20>>",place);
		var rootSVG = jQuery("svg",place)[0];
		same(rootSVG.getAttribute("width"),"20");
		same(rootSVG.getAttribute("height"),"20");
	});
	
	test("&lt;&lt;image SVGExample.svg 20 20 alt:'alternate text'&gt;&gt;",function(){
	  var place = document.createElement("div");
	
		wikify("<<image SVGExample.svg 20 20 alt:'alternate text'>>",place);
		var rootSVG = jQuery("svg",place)[0];
		same(rootSVG.getAttribute("width"),"20");
		same(rootSVG.getAttribute("height"),"20");
		
		//disable svg
		jQuery(place).empty();
		config.macros.image.svgAvailable = false;
		wikify("<<image SVGExample.svg 20 20 alt:'alternate text'>>",place);
		same(jQuery(place).text(),"alternate text");
		
		jQuery(place).empty();
		wikify("<<image SVGExample.svg alt:'alternate text'>>",place);
		same(jQuery(place).text(),"alternate text");
	
	});
	
});