/***
|''Name''|RandomColorPalettePlugin|
|''Description''|<...>|
|''Author''|Jon Robson|
|''Version''|<1.0.0>|
|''Status''|stable|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/plugins/RandomColorPalettePlugin/RandomColorPalettePlugin.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.0|
!Description
Adds a random color palette to TiddlyWiki
!Notes
<...>
!Usage
{{{
<<...>>
}}}
!Code
***/
/*{{{*/
(function($){
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
		r = parseInt(r * 255,10);
		g = parseInt(g * 255,10);
		b = parseInt(b * 255,10);
		return "rgb(" + r + "," + g + "," + b + ")";
	}

	var macro = config.macros.RandomColorPalette = {
		messagesOn: false, 
		changedPaletteText: "We have assigned you a random theme by adjusting the [[ColorPalette]] tiddler.\nDon't like it? Click <<RandomColorPalette>> for another one.", 
		generate_palette: function() {
			if(this.inprogress) { 
				return;
			}
			this.inprogress = true;
			var palette = {
				Background: "#fff",
				Foreground: "#000",
				PrimaryPale: "#8cf",
				PrimaryLight: "#FF7673",
				PrimaryMid: "#A60400",
				PrimaryDark: "#A60400",
				SecondaryPale: "#ffc",
				SecondaryLight: "#fe8",
				SecondaryMid: "#db4",
				SecondaryDark: "#841",
				TertiaryPale: "#eee",
				TertiaryLight: "#ccc",
				TertiaryMid: "#999",
				TertiaryDark: "#666",
				Error: "#f88"
			};
			var hue = Math.floor(Math.random() * 359);
			var saturation = (Math.random() * 1);
			var dark = (Math.random() * 0.5); // this will be the darkest color.
			var pale = 1;
			var lightness_values = {Dark:dark, Mid:(pale - dark) / 2, Light:pale - ((pale - dark) / 4), Pale:pale};

			var opposite_hue = (hue + 180) % 360;
			var seed = Math.floor((85 * Math.random()) + 5); // we want it to be at least 5 degrees
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
			
			// construct new ColorPalette
			var text= "/*{{{*/\n";
			for(var id in palette) {
				if(true) {
					text += id + ": " + palette[id] + "\n";
				}
			}
			text += "/*}}}*/";
			var tid = store.getTiddler('ColorPalette');
			if(!tid) {
				tid = new Tiddler('ColorPalette');
				tid.fields = merge({}, config.defaultCustomFields);
				tid.modifier ='RandomColorPalette Macro';
			}
			tid.text = text;
			this.inprogress = false;
			return tid;
		},
		saveColorPalette: function(tid) {
			// save the color palette in tid
			store.saveTiddler(tid.title, tid.title, tid.text, tid.modifier, tid.modified, tid.tags, tid.fields, false, tid.created, '');
			autoSaveChanges(null, [tid]);
			refreshAll();
			macro.reportChange();
		},
		reportChange: function() {
			var msgPlace = getMessageDiv();
			if(macro.messagesOn && !$(".changedPalette", msgPlace)[0]) { // only display message once..
				var tempPlace = document.createElement("div");
				wikify("{{changedPalette{" + macro.changedPaletteText + "}}}", tempPlace);
				msgPlace.appendChild(tempPlace);
			}
		},
		handler: function(place) {
			var tiddler = macro.generate_palette();
			macro.saveColorPalette(tiddler);
		}

	};

	config.macros.RandomColorPaletteButton = {
			text: "New ColorPalette",
			tooltip: "Generate a random colour scheme for your TiddlyWiki",
			handler: function(place) {
				createTiddlyButton(place, this.text, this.tooltip, config.macros.RandomColorPalette.handler);
			}
	};
})(jQuery);
/*}}}*/