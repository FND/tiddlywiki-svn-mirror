jQuery(document).ready(function() {	
  module("ImageMacroPlugin: external uris");
	
	
	test("&lt;&lt;image /foo/bar/x.jpg&gt;&gt;",function(){
		var madeExpectedAjaxReq;
		var _ajaxReq = ajaxReq;
		ajaxReq = function(options) {
			if(options.url == "/foo/bar/x.jpg") {
				madeExpectedAjaxReq = true;
				options.error(); // signal it is not an svg file by running error
			}
		}
	  var place = document.createElement("div");
		wikify("<<image /foo/bar/x.jpg>>",place);
		same($(".externalImage", place).length, 1);
		same(madeExpectedAjaxReq, true);
		ajaxReq = _ajaxReq;
	});
	
	test("&lt;&lt;image /foo/bar/x.svg&gt;&gt;",function(){
		var madeExpectedAjaxReq;
		var _ajaxReq = ajaxReq;
		ajaxReq = function(options) {
			if(options.url == "/foo/bar/x.svg") {
				madeExpectedAjaxReq = true;
				options.success({type: "image/svg+xml", text: "<svg></svg>"}); // the type will be useful here
			}
		}
	  var place = document.createElement("div");
		wikify("<<image /foo/bar/x.svg>>",place);
		same($("svg", place).length, 1);
		same(madeExpectedAjaxReq, true);
		ajaxReq = _ajaxReq;
	});
	
	test("&lt;&lt;image /foo/bar/x&gt;&gt;",function(){
		var madeExpectedAjaxReq;
		var _ajaxReq = ajaxReq;
		ajaxReq = function(options) {
			if(options.url == "/foo/bar/x") {
				madeExpectedAjaxReq = true;
				options.success({type: "image/png"}); // the type will be useful here
			}
		}
	  var place = document.createElement("div");
		wikify("<<image /foo/bar/x>>",place);
		same(madeExpectedAjaxReq, true);
		same($(".image", place).length, 1);
		ajaxReq = _ajaxReq;
	});

	
});