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
		
		init: function() {			
			jQuery(document).bind('keypress', function(ev){				
				if(config.macros.keybindings.keyCodes[ev.which] && config.macros.keybindings.keyCodes[ev.which] !== undefined) {
					config.macros.keybindings.keyCodes[ev.which].call();
				}
			});
		},
		
		// Add a handler function to be invoked by <<keybindings>> 
		// handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		// 	
		// 	// to do: display the options panel for customisation.
		// 	
		// },
		
		
		// some sample functions to invoke.
		forward: function() {
			alert('forward');
		},
		
		back: function() {
			alert('back');
		}
		
	};
	
	// key mappings
	config.macros.keybindings.keyCodes = {
		32: config.macros.keybindings.forward, 	//space
		46: config.macros.keybindings.forward, 	// .
		44: config.macros.keybindings.back		// ,
	};
	
	
//}}}
