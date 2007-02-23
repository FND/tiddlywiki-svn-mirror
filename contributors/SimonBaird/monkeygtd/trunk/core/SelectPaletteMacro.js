/***
Quick and dirtly palette switcher for 2.1.x
<<selectPalette>>
WARNING this will overwrite your ColorPalette tiddler.
***/

//{{{

merge(config.macros,{

	setPalette: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			var paletteName = params[0] ? params[0] : tiddler.title;
			createTiddlyButton(place,"apply","Apply this palette",function(e) {
				config.macros.selectPalette.updatePalette(tiddler.title);
				return false;
			});
		}
	},

	selectPalette: {

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			createTiddlyDropDown(place,this.onPaletteChange,this.getPalettes());
		},

		getPalettes: function() {
			var result = [
				{caption:"-palette-", name:""},
				{caption:"(Default)", name:"(default)"}
			];
			var tagged = store.getTaggedTiddlers("palette","title");
			for(var t=0; t<tagged.length; t++) {
				var caption = tagged[t].title;
				var sliceTitle = store.getTiddlerSlice(caption,"Name");
				if (sliceTitle)
					caption = sliceTitle;
				result.push({caption:sliceTitle, name:tagged[t].title});
			}
			return result;
		},

		onPaletteChange: function(e) {
			config.macros.selectPalette.updatePalette(this.value);
			return true;
		},

		updatePalette: function(title) {
			if (title != "") {
				store.deleteTiddler("ColorPalette");
				if (title != "(default)")
					store.saveTiddler("ColorPalette","ColorPalette",store.getTiddlerText(title),
								config.options.txtUserName,undefined,"");
				this.refreshPalette();
				if(config.options.chkAutoSave)
					saveChanges(true);
			}
		},

		refreshPalette: function() {
			config.macros.refreshDisplay.onClick();
		}
	}
});

//}}}

