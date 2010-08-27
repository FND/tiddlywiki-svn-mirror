/***
|''Name''|ImageMacroPlugin|
|''Version''|0.7.0|
|''Description''|Allows the rendering of svg images in a TiddlyWiki|
|''Author''|Osmosoft|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Notes''|Currently only works in modern browsers (not IE)|
|''Usage''|{{{<<image SVG>>}}} will render the text of the tiddler with title SVG as an SVG image (but not in ie where it will fail silently)|
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
which case it will render that tiddler as an image.

!Code
***/
//{{{
(function($) {

var macro = config.macros.image = {
	svgns: "http://www.w3.org/2000/svg",
	xlinkns: "http://www.w3.org/1999/xlink", 
	svgAvailable: document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"),
	_fixPrefix: 1,
	_external_cache: {},
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
	generateIdPrefix: function(){
		return "tw_svgfix_" + (this._fixPrefix++).toString() + "_";
	},
	fixSVG: function(childNodes,idPrefix) {
		if(!idPrefix) {
			idPrefix = this.generateIdPrefix();
		}
		var urlPattern = /^\s*url\(\#([^\)]*)\)\s*$/ig;
		var fixes = [
		{ attr: "id", namespace: "", pattern: /^(.*)$/ig },
		{ attr: "filter", namespace: "", pattern: urlPattern },
		{ attr: "fill", namespace: "", pattern: urlPattern },
		{ attr: "stroke", namespace: "", pattern: urlPattern },
		{ attr: "href", namespace: macro.xlinkns, pattern: /^#(.*)$/ig }
		];
		for(var t = 0; t < childNodes.length; t++) {
			var node = childNodes[t];
			for(var a = 0; a < fixes.length; a++) {
				var fix = fixes[a];
				if(node.hasAttributeNS && node.hasAttributeNS(fix.namespace, fix.attr)) {
					var v = node.getAttributeNS(fix.namespace, fix.attr);
					fix.pattern.lastIndex = 0;
					var match = fix.pattern.exec(v);
					if(match) {
						// Make sure replacement string doesn't contain any single dollar signs
						var replacement = (idPrefix + match[1]).replace("$", "$$$$"); 
						v = v.replace(match[1], replacement);
						node.setAttributeNS(fix.namespace, fix.attr,v);
					}
				}
			}
			var children = node.childNodes;
			if(children.length > 0) {
				this.fixSVG(children, idPrefix);
			}
		}
	},
	importSVGfallback: function(place,options){
		// no fallback yet for browsers such as IE
	},
	importSVG: function(place,options){
		if(!options) {
			options = {};
		}
		var tiddlerText = options.tiddler.text;
		var svgDoc;
		if (window.DOMParser) {
			svgDoc = new DOMParser().parseFromString(tiddlerText, "application/xml").documentElement;
			var idPrefix = options.idPrefix || this.generateIdPrefix();
			this.fixSVG([svgDoc], idPrefix);
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
					this.fixSVG([def], idPrefix);
					elDef.appendChild(document.importNode(def, true));
				}
			}
			el.insertBefore(elDef, el.firstChild);
			var svgHolder = document.createElementNS(macro.svgns,"svg");
			var width = options.width;
			var height = options.height;
			// what if width and height exist in css?
			if(width || height) {
				if(width && height) {
					// set view box of containing svg element based on the svg viewbox and width and height.
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
				el.setAttribute("class","svgImage svgIcon");
				place.appendChild(el);
			}
			// if a tiddler attribute is set this is read as a link
			jQuery("[tiddler]", place).click(function(ev) {
				var tiddler = $(ev.target).attr("tiddler");
				if(tiddler) {
					story.displayTiddler(ev.target, tiddler);
				}
			});
		}
		else{ 
			this.importSVGfallback(place,options);		
		}
	},
	supportsDataUris: false,
	renderBinaryImageTiddler: function(place, tiddler, options) {
		var ctype = tiddler.fields["server.content-type"] || tiddler.type;
		if(macro.supportsDataUris && ctype) {
			var uri = "data:%0;base64,%1".format([ctype, tiddler.text]); // TODO: fallback for legacy browsers
			return macro.renderBinaryImageUrl(place, uri, options);
		} else if(options.src) {
			return macro.renderBinaryImageUrl(place, options.src, options);
		} else {
			var src;
			var fields = tiddler.fields;
			if(fields["server.type"] == 'tiddlyweb') { // construct an accurate url for the resource  
				src = "%0%1/tiddlers/%2".format([fields['server.host'],
					fields['server.workspace'],fields['server.title']]);
			} else { // guess the url for the resource
				src = tiddler.title;
			}
			return macro.renderBinaryImageUrl(place, src, options);
		}
	},
	renderImage: function(place, imageSource, options) {
		var imageTiddler = store.getTiddler(imageSource);
		if(imageTiddler && macro.isBinaryImageTiddler(imageTiddler)) { // handle the case where we have an image url
			return macro.renderBinaryImageTiddler(place, imageTiddler, options);
		} else if(imageTiddler){ // handle the case where we have a tiddler
			return macro.renderSVGTiddler(place, imageTiddler, options);
		} else { // we have a string representing a url
			// check if we can access the json format of this url
			var newplace = $('<div class="externalImage"/>').appendTo(place)[0];
			try{
				var img = new Image();
				img.onload = function(ev) { 
					return macro.renderBinaryImageUrl(newplace, imageSource, options);
				}; 
				img.onerror = function(ev) {
					var renderTiddler = function(tiddler, contentType) {
						macro._external_cache[imageSource] = {tiddler: tiddler, contentType: contentType};
						if(contentType == 'application/json') { // assume tiddlyweb server
							contentType = tiddler.type;
						} else { // try and use the response as tiddler text
							tiddler = {text: tiddler};
						}
						if(macro.isBinaryImageType(contentType)) {
							options.src = imageSource;
							return macro.renderBinaryImageTiddler(newplace, tiddler, options);
						} else {
							return macro.renderSVGTiddler(newplace, tiddler, options);
						}
					};

					var cached = macro._external_cache[imageSource];
					if(cached) { // use cache where possible
						renderTiddler(cached.tiddler, cached.contentType)
					} else {
						ajaxReq({ // deal with tiddlyweb binary images
							url: imageSource,
							beforeSend: function(xhr) {
								xhr.setRequestHeader("Accept", "application/json,*/*");
								xhr.setRequestHeader("X-ControlView", "false"); // for tiddlyspace usage
							},
							success: function(tiddler, status, xhr) {
								if(!tiddler) {
									return macro.renderBinaryImageUrl(newplace, imageSource, options);
								}
								var header = xhr.getResponseHeader("content-type");
								var contentType;
								if(header) {
									header = header ? header.split(";") : [];
									contentType = header[0] || false;
								}
								renderTiddler(tiddler, contentType);
							},
							error: function() {
								return macro.renderBinaryImageUrl(newplace, imageSource, options);
							}
						});
					}
				};
				img.src = imageSource;
			} catch(e) { // the url is external thus our ajax request failed. we could try proxying..
				return macro.renderBinaryImageUrl(newplace, imageSource, options); // attempt to render as image
			}
		}
	},
	handler: function(place, macroName, params, wikifier, paramString, tiddler){
		var imageSource = params[0];
		// collect named arguments
		var args = macro.getArguments(paramString, params);
		this.renderImage(place, imageSource, args);		
	},
	renderAlternateText: function(place, options) {
		if(options.alt) {
			$("<div class='svgImageTest svgIconText' />").text(options.alt).appendTo(place);
		}
	},
	renderSVGTiddler: function(place, tiddler, options) {
		if(!options) {
			options = {};
		}
		options.tiddler = tiddler;
		options.fix = true;
		
		if(macro.svgAvailable) {
			this.importSVG(place, options); // display the svg
		} else {
			// instead of showing the image show the alternate text.
			this.renderAlternateText(place, options);
		}
	},
	renderBinaryImageUrl: function(place, src, options) {
		var container = $('<div class="image" />').appendTo(place)[0];
		var image = new Image(); // due to weird scaling issues where you use just a width or just a height
		var createImageTag = function(userW, userH) {
			var img = $("<img />");
			img.attr("src", src);
			img.appendTo(container);
			if(userH) {
				img.attr("height", userH);
			}
			if(userW) {
				img.attr("width", userW);
			}
			img.addClass(options.imageClass);
		};
		
		image.onload = function() {
			var w = image.width;
			var h = image.height;
			var userH = options.height;
			var userW = options.width;
			var ratio;
			if(userH && !userW) {
				ratio = userH / h;
				userW = ratio * w;
			} else if (userW && !userH) {
				ratio = userW / w;
				userH = ratio * h;
			}
			createImageTag(userW, userH);
		};
		image.onerror = function() {
			createImageTag(options.width, options.height);
		};
		image.src = src;
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
		var width = params[1] || false;
		var height = params[2] || false;
		if(width && width.indexOf(":") > -1) {
			width = false;
		}
		if(height && height.indexOf(":") > -1) {
			height = false;
		}
		options.width = macro.lookupArgument(options, "width", width);
		options.height = macro.lookupArgument(options, "height", height);
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
		var newplace = $('<div class="wikifiedImage" />').appendTo(place)[0];
		macro.renderImage(newplace, tiddler.title, {});
	} else {
		_oldwikifiedview(value, place, params, wikifier, paramString, tiddler);
	}
};
config.macros.view.views.image = function(value, place, params, wikifier, paramString, tiddler) {
	invokeMacro(place, "image", "%0 %1".format([value, params.splice(2).join(" ")]), null, tiddler);
};

config.shadowTiddlers.StyleSheetImageMacro = ".wikifiedImage svg, .wikifiedImage .image { width: 80%; }";
store.addNotification("StyleSheetImageMacro", refreshStyles);

})(jQuery);
//}}}
