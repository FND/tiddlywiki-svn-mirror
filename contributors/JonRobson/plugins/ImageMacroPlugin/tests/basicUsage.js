jQuery(document).ready(function() {
	module("ImageMacroPlugin: basic usage");
	test("startup", function(){
	  var tiddlers = [
	   {title:"SVGExample.svg",tags:[],"text":'<svg><rect x = "10" y = "10" rx = "20" ry = "10" width = "200" height = "80" fill = "#d7d0b9" stroke = "#333" stroke-width = "1"/></svg>'},
	   { title: "foo", fields: {image: "SVGExample.svg"}, tags: []}
		];

	   config.extensions.testUtils.addTiddlers(tiddlers);
	});

	test("&lt;&lt;image SVGExample.svg&gt;&gt;",function(){
	  var place = document.createElement("div");
		wikify("<<image SVGExample.svg>>",place);
		var tid = store.getTiddler("SVGExample.svg");
		same(tid.title,"SVGExample.svg");
		same($("svg",place).length,1);
	});

	test("&lt;&lt;image SVGExample.svg 20 20&gt;&gt;",function(){
	  var place = document.createElement("div");
		wikify("<<image SVGExample.svg 20 20>>",place);
		var rootSVG = $("svg",place)[0];
		same(rootSVG.getAttribute("width"),"20");
		same(rootSVG.getAttribute("height"),"20");
	});

	test("&lt;&lt;image SVGExample.svg 20 20 alt:'alternate text'&gt;&gt;",function(){
	  var place = document.createElement("div");

		wikify("<<image SVGExample.svg 20 20 alt:'alternate text'>>",place);
		var rootSVG = $("svg",place)[0];
		same(rootSVG.getAttribute("width"),"20");
		same(rootSVG.getAttribute("height"),"20");
	
		//disable svg
		$(place).empty();
		config.macros.image.svgAvailable = false;
		wikify("<<image SVGExample.svg 20 20 alt:'alternate text'>>",place);
		same($("img", place).attr("alt"), "alternate text", "alt text when svg unavailable");
	
		$(place).empty();
		wikify("<<image SVGExample.svg alt:'alternate text'>>",place);
		same($("span", place).text(), "alternate text", "alt text when svg unavailable (no width/height passed)");
	});

	test("view image2 image alt:broken", function() {
		var place = $("<div />")[0];
		config.macros.image.svgAvailable = false;
		wikify("<<view image image alt:brokenx>>", place, null, store.getTiddler("foo"));
		same($("span", place).text(), "brokenx");
	});
});
