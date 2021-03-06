/***
|''Name''|ImageMacroPlugin|
|''Version''|0.8.9|
|''Description''|Allows the rendering of svg images in a TiddlyWiki|
|''Author''|Osmosoft|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Notes''|Currently only works in modern browsers (not IE)|
|''Requires''|BinaryTiddlersPlugin|
!Usage
{{{<<image SVG>>}}} will render the text of the tiddler with title SVG as an SVG image (but not in ie where it will fail silently)
!!Parameters
width/height: specify width/height parameters
link: make the image link to a given location
tiddlyLink: link to a tiddler

!Notes
Binary tiddlers in TiddlyWeb when passed through the wikifier will be shown as images.
eg. {{{<<view text wikified>>}}} on a binary tiddler will show the image.
{{{<<view fieldname image>>}}}
will render the value of the tiddler field 'fieldname' as an image. This field can contain a tid
{{{<<image SiteIcon>>}}}
will create an image tag where the tiddler has content type beginning image and not ending +xml
will attempt to create svg object in other scenarios
{{{<<image /photos/x.jpg>>}}}
will create an image tag with src /photos/x.jpg as long as there is not a tiddler called /photos/x.jpg in 
which case it will render that tiddler as an image. Note for the case of svg files it will attempt to render as an svg if possible via the image
tag. It doesn't embed the svg in the dom for security reasons as svg code can contain javascript.
!Code
***/
//{{{
(function($) {

var macro = config.macros.image = {
	shim: "/bags/common/tiddlers/shim",
	ieVersion: config.browser.isIE ? parseInt(config.browser.ieVersion[1]) : false,
	svgns: "http://www.w3.org/2000/svg",
	xlinkns: "http://www.w3.org/1999/xlink", 
	svgAvailable: document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"),
	_fixPrefix: 1,
	_external_cache: {},
	_image_tag_cache: {},
	_image_dimensions: {},
	locale: {
		badImage: "This image cannot be displayed."
	},
	handler: function(place, macroName, params, wikifier, paramString, tiddler){
		var imageSource = params[0];
		// collect named arguments
		var args = macro.getArguments(paramString, params);
		this.renderImage(place, imageSource, args);
	},

	refreshImage: function(src) {
		var elements = macro._image_tag_cache[src] ? macro._image_tag_cache[src] : [];
		if(macro._image_dimensions[src]) {
			macro._image_dimensions[src] = false;
		}
		for(var i = 0; i < elements.length; i++) {
			var el = $(elements[i]);
			var newSrc = "%0?nocache=%1".format([src, Math.random()]);
			el.attr("src", newSrc); // force reload
		}
	},
	isBinaryImageType: function(contentType) {
		if(contentType && contentType.indexOf("image") === 0 &&
			contentType.indexOf("+xml") != contentType.length - 4) {
			return true;
		} else {
			return false;
		}
	},
	isImageTiddler: function(tiddler) {
		return macro.isSVGTiddler(tiddler) || macro.isBinaryImageTiddler(tiddler);
	},
	isSVGTiddler: function(tiddler) {
		var type;
		type = tiddler ? tiddler.fields['server.content-type'] : false;
		return type == "image/svg+xml";
	},
	isBinaryImageTiddler: function(tiddler) {
		return macro.isBinaryImageType(tiddler.fields['server.content-type']);
	},
	supportsDataUris: false,
	renderImage: function(place, imageSource, options) {
		var imageTiddler = store.getTiddler(imageSource);
		var container;
		if(options.link) {
			container = $("<a />").attr("href", options.link).appendTo(place)[0];
		} else if(options.tiddlyLink) {
			container = createTiddlyLink(place, options.tiddlyLink, false);
		} else {
			container = $("<span />").appendTo(place)[0];
		}
		$(container).addClass("image");

		options = options ? options : {};
		if(imageTiddler && macro.isBinaryImageTiddler(imageTiddler)) { // handle the case where we have an image url
			return macro._renderBinaryImageTiddler(container, imageTiddler, options);
		} else if(imageTiddler){ // handle the case where we have a tiddler
			return macro._renderSVGTiddler(container, imageTiddler, options);
		} else { // we have a string representing a url
			return macro._renderBinaryImageUrl(container, imageSource, options);
		}
	},
	_renderAlternateText: function(container, options) {
		var img;
		var src = options.src || "";
		if(options.width && options.height) {
			img = $("<img />").attr("src", src).addClass("svgImageText").attr("width", options.width).
				attr("height", options.height).appendTo(container);
		}
		var alt = options.alt;
		if(img && alt) {
			img.attr("alt", alt).attr("title", alt);
		} else if(alt) {
			$(container).addClass("svgImageText").text(alt);
		}
		macro._image_tag_cache[src] = img;
	},
	_renderSVGTiddler: function(place, tiddler, options) {
		if(!options) {
			options = {};
		}
		merge(options, { tiddler: tiddler, fix: true});

		if(macro.svgAvailable) {
			this._importSVG(place, options); // display the svg
		} else if(options.altImage) {
			var image = options.altImage;
			delete options.altImage;
			this._renderBinaryImageUrl(place, image, options);
		} else {
			this._renderAlternateText(place, options); // instead of showing the image show the alternate text.
		}
	},
	_renderBinaryImageTiddler: function(place, tiddler, options) {
		var resourceURI;
		var fields = tiddler.fields;
		if(fields["server.type"] == "tiddlyweb") { // construct an accurate url for the resource	
			resourceURI = "%0/%1/tiddlers/%2".format([config.defaultCustomFields["server.host"],
				fields["server.workspace"], fields["server.title"]]);
		} else { // guess the url for the resource
			resourceURI = tiddler.title;
		}
		var ctype = fields["server.content-type"] || tiddler.type;
		var text = tiddler.text;
		if(macro.supportsDataUris && ctype && text.indexOf("<html") == -1) {
			var uri = "data:%0;base64,%1".format([ctype, text]);
			options.src = resourceURI;
			return macro._renderBinaryImageUrl(place, uri, options);
		} else if(options.src) {
			return macro._renderBinaryImageUrl(place, options.src, options);
		} else {
			return macro._renderBinaryImageUrl(place, resourceURI, options);
		}
	},
	_renderBinaryImageUrl: function(container, src, options) {
		var srcUrl = options.src ? options.src : src;
		srcUrl = srcUrl.indexOf("/") === -1 ? "/%0".format([srcUrl]) : srcUrl; // for IE. 
		var image_dimensions = macro._image_dimensions[srcUrl];
		var image = new Image(); // due to weird scaling issues where you use just a width or just a height
		var createImageTag = function(dimensions, error) {
			if(error) {
				var altImage = options.altImage;
				if(altImage) {
					delete options.altImage;
					macro._renderBinaryImageUrl(container, altImage, options);
				} else {
					options.src = src;
					macro._renderAlternateText(container, options);
				}
			} else {
				var preserve = options.preserveAspectRatio;
				var w = dimensions.width;
				var h = dimensions.height;
				var userH = preserve && h < options.height ? h : options.height;
				var userW = preserve && w < options.width ? w : options.height;
				if(w && h) {
					var preserveWidth = preserve && w > h;
					var preserveHeight = preserve && h > w;
					var ratio;
					if(userH && !userW || preserveHeight) {
						ratio = userH / h;
						userW = parseInt(ratio * w, 10);
					} else if (userW && !userH || preserveWidth) {
						ratio = userW / w;
						userH = parseInt(ratio * h, 10);
					}
					userW = userW ? userW : w;
					userH = userH ? userH : h;
				}
				var img = $("<img />").addClass(options.imageClass).appendTo(container);
				if(userH) {
					img.attr("height", userH);
				}
				if(userW) {
					img.attr("width", userW);
				}
				if(macro.ieVersion && macro.ieVersion < 7 && macro.shim) {
					$(img).css({width: userW, height: userH,
							filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='%0', sizingMethod='scale')".format([src])
						}).attr("src", macro.shim);
				} else {
					img.attr("src", src);
				}
				if(!macro._image_tag_cache[srcUrl]) {
					macro._image_tag_cache[srcUrl] = [];
				}
				macro._image_tag_cache[srcUrl].push(img);
			}
		};

		if(!image_dimensions) {
			image.onload = function() {
				var dimensions = { width: image.width, height: image.height};
				macro._image_dimensions[srcUrl] = dimensions;
				createImageTag(dimensions);
			};
			image.onerror = function() {
				createImageTag(null, true);
			};
			image.src = src;
		} else {
			createImageTag(image_dimensions);
		}
	},
	_generateIdPrefix: function(){
		return "tw_svgfix_" + (this._fixPrefix++).toString() + "_";
	},
	_fixSVG: function(childNodes, idPrefix) {
		if(!idPrefix) {
			idPrefix = this._generateIdPrefix();
		}
		var urlPattern = /^\s*url\(\#([^\)]*)\)\s*$/ig;
		var fixes = [
		{ attr: "id", pattern: /^(.*)$/ig },
		{ attr: "filter", pattern: urlPattern },
		{ attr: "fill", pattern: urlPattern },
		{ attr: "stroke", pattern: urlPattern },
		{ attr: "href", namespace: macro.xlinkns, pattern: /^#(.*)$/ig }
		];
		for(var t = 0; t < childNodes.length; t++) {
			var node = childNodes[t];
			for(var a = 0; a < fixes.length; a++) {
				var fix = fixes[a];
				var attr = fix.attr;
				var ns = fix.namespace || "";
				if(node.hasAttributeNS && node.hasAttributeNS(ns, attr)) {
					var v = node.getAttributeNS(ns, attr);
					fix.pattern.lastIndex = 0;
					var match = fix.pattern.exec(v);
					if(match) {
						// Make sure replacement string doesn't contain any single dollar signs
						var replacement = (idPrefix + match[1]).replace("$", "$$$$"); 
						v = v.replace(match[1], replacement);
						node.setAttributeNS(ns, attr,v);
					}
				}
			}
			var children = node.childNodes;
			if(children.length > 0) {
				this._fixSVG(children, idPrefix);
			}
		}
	},
	_importSVG: function(place, options){
		options = options ? options : {};
		var svgDoc, tiddlerText = options.tiddler.text;
		if (window.DOMParser) {
			svgDoc = new DOMParser().parseFromString(tiddlerText, "application/xml").documentElement;
			var idPrefix = options.idPrefix || this._generateIdPrefix();
			this._fixSVG([svgDoc], idPrefix);
			var el = document.importNode(svgDoc, true);

			var existingDefs = el.getElementsByTagNameNS(macro.svgns, "defs");
			var elDef;
			if(existingDefs.length === 0) {
				elDef = document.createElementNS(macro.svgns, "defs");
			} else {
				elDef = existingDefs[0];
			}
			if(options.def) {
				for(var i = 0; i < options.def.length; i++) {
					var text = store.getTiddlerText(options.def[i]);
					var def = new DOMParser().parseFromString(text, "application/xml").documentElement;
					this._fixSVG([def], idPrefix);
					elDef.appendChild(document.importNode(def, true));
				}
			}
			el.insertBefore(elDef, el.firstChild);
			var svgHolder = document.createElementNS(macro.svgns,"svg");
			var width = options.width;
			var height = options.height;
			if(width || height) {
				if(width && height) { // set view box of containing svg element based on the svg viewbox and width and height.
					var viewBox = el.getAttribute("viewBox");
					var topLeft = "0 0";
					if(viewBox) {
						topLeft = viewBox.replace(/([0-9]*) +([0-9]*) +([0-9]*) +([0-9]*) */gi,"$1 $2");
					}
					svgHolder.setAttributeNS(macro.svgns, "viewBox", "0 0 %0 %1".format([width, height]));
				} else {
					if(!width) {
						width = el.getAttribute("width");
					}
					if(!height) {
						height = el.getAttribute("height");
					}
				}
				svgHolder.setAttribute("width", width);
				svgHolder.setAttribute("height", height);

				el.setAttribute("width", "100%");
				el.setAttribute("height", "100%");
				svgHolder.setAttribute("class", "svgImage svgIcon %0".format([options.imageClass || ""]));
				svgHolder.appendChild(el);
				place.appendChild(svgHolder);
			}
			else {
				el.setAttribute("class","svgImage");
				place.appendChild(el);
			}
			// if a tiddler attribute is set this is read as a link
			$("[tiddler], [tiddlyLink]", place).attr("refresh", "link").click(function(ev) {
				var tiddler = $(ev.target).attr("tiddlyLink");
				if(!tiddler) { // backwards compatibility
					tiddler = $(ev.target).attr("tiddler");
				}
				if(tiddler) {
					story.displayTiddler(ev.target, tiddler);
				}
			});
		}
	},
	getArguments: function(paramString, params) {
		var args = paramString.parseParams("name", null, true, false, true)[0];
		var options = {};
		for(var id in args) {
			if(true) {
				var p = args[id];
				if(id == "def") {
					options[id] = p;
				} else {
					options[id] = p[0];
				}
			}
		}
		var width = isNaN(params[1]) ? false : parseInt(params[1], 10);
		var height = isNaN(params[2]) ? false : parseInt(params[2], 10);

		options.width = macro.lookupArgument(options, "width", width);
		options.height = macro.lookupArgument(options, "height", height);
		options.preserveAspectRatio = args.preserveAspectRatio && 
			args.preserveAspectRatio[0] == "yes" ? true : false;
		options.tiddlyLink = macro.lookupArgument(options, "tiddlyLink", false);
		options.link = macro.lookupArgument(options, "link", false);
		return options;
	},
	lookupArgument: function(args, id, ifEmpty) {
		if(args[id]) {
			return args[id];
		} else {
			return ifEmpty;
		}
	}
};

var datauriTest = function() {
	var data = new Image();
	data.onload = function() {
		if(this.width != 1 || this.height != 1) {
			macro.supportsDataUris = false;
		} else {
			macro.supportsDataUris = true;
		}
	};
	data.onerror = data.onload;
	data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
};
datauriTest();

// update views
var _oldwikifiedview = config.macros.view.views.wikified;
// update wikifier to check tiddler type before rendering
config.macros.view.views.wikified = function(value, place, params, wikifier, paramString, tiddler) {
	if(macro.isImageTiddler(tiddler) && params[0] == "text") {
		var newplace = $("<div />").addClass("wikifiedImage").appendTo(place)[0];
		macro.renderImage(newplace, tiddler.title, { alt: macro.locale.badImage });
	} else {
		_oldwikifiedview.apply(this, arguments);
	}
};
config.macros.view.views.image = function(value, place, params, wikifier, paramString, tiddler) {
	// a field can point to another tiddler whereas text is the current tiddler.
	var title = params[0] == "text" ? tiddler.title : value;
	invokeMacro(place, "image", "\"%0\" %1".format([title, params.splice(2).join(" ")]), null, tiddler);
};

config.shadowTiddlers.StyleSheetImageMacro = [".wikifiedImage svg, .wikifiedImage .image { width: 80%; }",
	".svgImageText { background-color:[[ColorPalette::Error]]; color:#ddd; display: inline-block; }",
	"span.svgImageText { display: inline-block; overflow-hidden; }"
].join("");
store.addNotification("StyleSheetImageMacro", refreshStyles);

})(jQuery);
//}}}