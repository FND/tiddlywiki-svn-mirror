/***
|''Name''|AETImage|
|''Requires''|BinaryUploadPlugin|
|''Version''|0.1.5|
!Usage
{{{<<binaryEdit field>>}}}
***/
//{{{
(function($) {
var binary = config.macros.binaryUpload;
var macro = config.macros.binaryEdit = {
	handler: function(place, macroName, params, wikifier, paramString, c) {
		var args = paramString.parseParams("anon")[0];
		var bag = args.bag ? args.bag[0] : false;
		macro.createForm(place, args.anon[0], tiddler, { maxwidth: 200, maxheight: 200, bag: bag });
	},
	createForm: function(place, field, tiddler, options) {
		var preview = $("<div />").addClass("preview").appendTo(place)[0];
		var value = tiddler ? tiddler.fields[field] : "";
		macro.showImage(preview, value);
		var input = $("<input />").attr("type", "text").attr("edit", field).val(value).appendTo(place)[0];
		binary.createUploadForm(place, {
			bag: options.bag,
			tags: ["excludeLists image"],
			callback: function(place, fileName, workspace, baseurl) {
				var url = "%0/%1".format([baseurl, fileName]);
				$(input).val(url);
				macro.showImage(preview, url);
			}
		});
	},
	showImage: function(container, imageUrl, options) {
		$(container).empty();
		var image = new Image();
		image.onload = function() {
			$("<img />").attr("src", imageUrl).appendTo(container);
		};
		image.src = imageUrl;
	}
};
})(jQuery);
//}}}
