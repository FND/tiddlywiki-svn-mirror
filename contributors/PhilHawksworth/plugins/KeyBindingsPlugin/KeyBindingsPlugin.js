/***
|''Name:''| keybindings |
|''Description:''|Keybindings|
|''Author:''|Phil Hawksworth|
|''Version:''|0.1|
|''Date:''|201001181709|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4.1|
***/

//{{{

	// create macro object
	config.macros.keybindings = {
		
		enabled: false,
		
		init: function() {	
			config.macros.keybindings.enable();
			jQuery(document).bind('keydown', function(ev){	
				var keyCode = ev.keyCode || ev.which;
				if(config.macros.keybindings.enabled && config.macros.keybindings.keyCodes[keyCode] && config.macros.keybindings.keyCodes[keyCode] !== undefined) {
					config.macros.keybindings.keyCodes[keyCode].call();
				}
			});
		},
		
		// Add a handler function to be invoked by <<keybindings>> 
		// handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		// 	
		// 	// to do: display the options panel for customisation.
		// 	
		// },
		
		// todo: replace this with some namespaced event binding and unbinding.
		enable: function() {
			config.macros.keybindings.enabled = true;
		},
		disable: function() {
			config.macros.keybindings.enabled = false;
		},
		
		
		// some sample functions to invoke.
		forward: function() {
            story.nextTiddler();
		},
		
		back: function() {
            story.prevTiddler();
		}
		
	};
	
	// key mappings
	config.macros.keybindings.keyCodes = {
		32: config.macros.keybindings.forward, 	//space
		46: config.macros.keybindings.forward, 	// .
		44: config.macros.keybindings.back		// ,
	};


//}}}
