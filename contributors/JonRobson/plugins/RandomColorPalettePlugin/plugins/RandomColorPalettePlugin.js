/***
|''Name''|RandomColorPalettePlugin|
|''Description''|Adds a random color palette to TiddlyWiki|
|''Author''|Jon Robson|
|''Version''|1.2.3|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/plugins/RandomColorPalettePlugin/RandomColorPalettePlugin.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
!Usage
{{{
<<RandomColorPalette>>
Sets and saves a random color palette on execution

<<RandomColorPaletteButton>>
Creates a button, which when clicked will change the color palette
}}}
!Parameters
rgb: yes
By default the ColorPalette is defined in hex. You can output the colours as rgb by simply including this parameter.
hue:[0,360]
Seeds the randomiser with this hue.
saturation:[0,1]
Seeds the randomiser with a given saturation
lightness:[0,1]
Seeds the randomiser with a value for the lightest color tone (0 being darkest, 1 being lightest).

darkest:[0,1]
Seeds the randomiser with a value for the darkest color tone (0 being darkest, 1 being lightest).

huevariance: [0,90]
Given a certain hue, specify the angle from the secondary colour to which the secondary and tertiary colours should be determined.

Note parameters can be discovered by viewing the ColorPaletteParameter slice within the generated ColorPalette.
!Code
***/
//{{{
(function($){
	RGB.prototype.toRGBString = function() {
		return "rgb(%0,%1,%2)".format([parseInt(this.r * 255, 10), 
			parseInt(this.g * 255, 10), parseInt(this.b * 255, 10)])
	}
	function HSL_TO_RGB(h, s, l){ // h (hue) between 0 and 360, s (saturation) & l (lightness) between 0 and 1
		var c;
		if(l <= 0.5) {
			c = 2 * l * s;
		} else {
			c = ( 2 - (2 * l)) * s;
		}
		var h1 = h / 60;
		var x = c * (1 - Math.abs((h1 % 2) - 1)); 
		var r, g, b;
		if(typeof(h) == 'undefined') {
			r = 0;
			g = 0;
			b = 0;
		} else if(0 <= h1 && h1 < 1) {
			r = c;
			g = x;
			b = 0;
		} else if(1 <= h1 && h1 < 2) {
			r = x;
			g = c;
			b = 0;
		} else if(2 <= h1 && h1 < 3) {
			r = 0;
			g = c;
			b = x;
		}
		else if(3 <= h1 && h1 < 4) {
			r = 0;
			g = x;
			b = c;
		} else if(4 <= h1 && h1 < 5) {
			r = x;
			g = 0;
			b = c;
		} else if(5 <= h1 && h1 < 6) {
			r = c;
			g = 0;
			b = x;
		}
		m = l - (0.5 * c);
		r += m;
		g += m;
		b += m;
		return new RGB(r, g, b);
	}

	var macro = config.macros.RandomColorPalette = {
		messagesOn: false, 
		changedPaletteText: "We have assigned you a random theme by adjusting the [[ColorPalette]] tiddler.\nDon't like it? Click <<RandomColorPalette>> for another one.", 
		handler: function(place, macroName, params, wikifier, paramString, tiddler) {
			paramString = paramString || "";
			var options = paramString.parseParams("name", null, true, false, true)[0];
			var tiddler = macro.generatePalette(options, true);
		},
		generateRandomNumber: function(min, max, info) {
			var num = (Math.random() * 1);
			if(!info) {
				info = { attempts:0 };
			}
			info.attempts += 1;
			var good = true;
			if(min == max) return max;
			if(min && num < min) {
				good = false;
			} else if(max && num > max) {
				good = false;
			}
			if(!good) {
				if(info.attempts < 5) {
					return macro.generateRandomNumber(min, max, info);
				} else {
					if(max) {
						return max;
					} else if(min) {
						return min;
					} else {
						return 1;
					}
				}
			}
			return num;
		},
		getExistingPalette: function(asJSON) {
			var title = "ColorPalette";
			var tiddlerText;
			if(store.tiddlerExists(title)) {
				tiddlerText = store.getTiddlerText(title);
			} else if(store.isShadowTiddler(title)){
				tiddlerText = config.shadowTiddlers[title];
			}
			if(asJSON) {
				var json = {};
				if(tiddlerText) {
					var lines = tiddlerText.split("\n");
					for(var i = 0; i < lines.length; i++) {
						var definition = lines[i].split(":");
						if(definition.length == 2) {
							var name = definition[0].trim();
							var value = definition[1].trim();
							json[name] = value;
						}
					}
				}
				return json;
			} else {
				return tiddlerText;
			}
		},
		generatePalette: function(options, save) {
			var outputRGB = options.rgb && options.rgb[0];
			if(this.inprogress) { 
				return;
			}
			this.inprogress = true;
			var palette = macro.getExistingPalette(true);
			var hue = options.hue ? parseInt(options.hue[0]) : Math.floor(Math.random() * 359);
			var saturation = options.saturation ? parseFloat(options.saturation[0]) : macro.generateRandomNumber(0.3, 0.7);
			var dark = options.darkest ? parseFloat(options.darkest[0]) : macro.generateRandomNumber(0, 0.1);
			var pale = options.lightness ? parseFloat(options.lightness[0]) : macro.generateRandomNumber(0.6 + dark, 1);
			var lightness_values = {Dark:dark, Mid:pale - ( ( pale - dark ) / 2 ), 
				Light:pale - ( ( pale - dark ) / 4 ), Pale:pale};

			var opposite_hue = (hue + 180) % 360;
			var seed = options.huevariance ? options.huevariance[0] : Math.floor((85 * Math.random()) + 5); // we want it to be at least 5 degrees
			var huetwo = (opposite_hue + seed) % 360;
			var huethree = (opposite_hue - seed) % 360;
			if(huetwo < 0) {
				huetwo = 360 + huetwo;
			}
			if(huethree < 0) {
				huethree = 360 + huethree;
			}
			for(var j in lightness_values) {
				if(true) {
					palette["Primary" + j] = HSL_TO_RGB(hue, saturation, lightness_values[j]);
					palette["Secondary" + j] = HSL_TO_RGB(huetwo, saturation, lightness_values[j]);
					palette["Tertiary" + j] = HSL_TO_RGB(huethree, saturation, lightness_values[j]);
				}
			}
			palette.Background = HSL_TO_RGB(hue, saturation, 0.92);
			palette.Foreground = HSL_TO_RGB(hue, saturation, 0.08);
			palette.ColorPaletteParameters = ["HSL([", hue, "|", seed, "], [", saturation, "],",
				"[", dark, "|", pale, "])"].join("");
			// construct new ColorPalette
			var text = ["/*{{{*/\n"];
			var colorcode;
			for(var id in palette) {
				if(true) {
					var color = palette[id];
					if(outputRGB) {
						colorcode = color.toRGBString();
					} else {
						colorcode = color.toString();
					}	
					text.push("%0: %1\n".format([id, colorcode]));
				}
			}
			text.push("/*}}}*/");
			
			var tid = store.getTiddler('ColorPalette');
			if(!tid) {
				tid = new Tiddler('ColorPalette');
				tid.fields = merge({}, config.defaultCustomFields);
				tid.modifier ='RandomColorPalette Macro';
			}
			tid.text = text.join("");
			this.inprogress = false;
			if(save) { 
				macro.saveColorPalette(tid);
			}
			return tid;
		},
		saveColorPalette: function(tid) {
			// save the color palette in tid
			tid = store.saveTiddler(tid.title, tid.title, tid.text, tid.modifier, tid.modified, tid.tags, tid.fields, false, tid.created, '');
			// an interval is used to cope with users clicking on the palette button quickly.
			if(macro._nextSave) {
				window.clearTimeout(macro._nextSave);
			}
			macro._nextSave = window.setTimeout(function() {
					autoSaveChanges(null, [tid]);
				}, 2000);
			refreshAll();
			macro.reportChange();
		},
		reportChange: function() {
			if(macro.messagesOn) { // only display message once..
				var msgPlace = getMessageDiv();
				if(!$(".changedPalette", msgPlace)[0]) {
					var tempPlace = document.createElement("div");
					wikify("{{changedPalette{" + macro.changedPaletteText + "}}}", tempPlace);
					msgPlace.appendChild(tempPlace);
				}
			}
		}
	};
	config.macros.RandomColorPaletteButton = {
			text: "New ColorPalette",
			tooltip: "Generate a random colour scheme for your TiddlyWiki",
			handler: function(place, macroName, params, wikifier, paramString, tiddler) {
				var btnHandler = function() {
					config.macros.RandomColorPalette.handler(place, macroName, params, wikifier, paramString, tiddler);
				};
				createTiddlyButton(place, this.text, this.tooltip, btnHandler);
			}
	};
})(jQuery);
//}}}