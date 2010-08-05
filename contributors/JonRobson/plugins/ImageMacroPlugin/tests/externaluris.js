var xhrMock = function(data) {
	this.data = data || {};
};

xhrMock.prototype = {
	getResponseHeader: function(header) {
		return this.data.responseHeader[header];
	},
	setRequestHeader: function(header, value) {
		if(!this.data.requestHeader) {
			this.data.requestHeader = {}
		}
		this.data.requestHeader[header] = value;
	}
}
jQuery(document).ready(function() {	
  module("ImageMacroPlugin: external uris");
	
	
	test("&lt;&lt;image /foo/bar/x.jpg&gt;&gt; doesn't exist",function(){
		var madeExpectedAjaxReq;
		var _ajaxReq = ajaxReq;
		ajaxReq = function(options) {
			if(options.url == "/foo/bar/x.jpg") {
				madeExpectedAjaxReq = true;
				// don't run success
			}
		}
	  var place = document.createElement("div");
		wikify("<<image /foo/bar/x.jpg>>",place);
		same($(".image", place).length, 0);
		same($("svg", place).length, 0);
		same(madeExpectedAjaxReq, true);
		ajaxReq = _ajaxReq;
	});


	test("&lt;&lt;image /foo/bar/SiteIcon where SiteIcon is returned as an image",function(){
		var madeExpectedAjaxReq;
		var _ajaxReq = ajaxReq;
		ajaxReq = function(options) {
			var xhr = new xhrMock({responseHeader: {"content-type": "image/png"}});
			options.success("blhah", {}, xhr); // the type will be useful here
		}
	  var place = document.createElement("div");
		wikify("<<image /foo/bar/SiteIcon>>",place);
		same($(".image", place).length, 1);
		same($(".externalImage", place).length, 1);
		ajaxReq = _ajaxReq;
	});
	
	test("&lt;&lt;image /foo/bar/x.svg&gt;&gt; on TiddlyWebWiki",function(){
		var madeExpectedAjaxReq;
		var _ajaxReq = ajaxReq;
		ajaxReq = function(options) {
			var xhr = new xhrMock({responseHeader: {"content-type":"application/json"}});
			if(options.url == "/foo/bar/x.svg") {
				madeExpectedAjaxReq = true;
				options.success({type: "image/svg+xml", text: "<svg></svg>"}, {}, xhr); // the type will be useful here
			}
		}
		config.macros.image.svgAvailable = true;
	  var place = document.createElement("div");
		wikify("<<image /foo/bar/x.svg>>",place);
		same(madeExpectedAjaxReq, true);
		same($("svg", place).length, 1);
		ajaxReq = _ajaxReq;
	});
	
	test("&lt;&lt;image /foo/bar/x&gt;&gt;  on TiddlyWebWiki",function(){
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