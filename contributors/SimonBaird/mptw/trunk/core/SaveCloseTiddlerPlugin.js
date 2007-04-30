/***
| Name|SaveCloseTiddlerPlugin|
| Description|Provides two extra toolbar commands, saveCloseTiddler and cancelCloseTiddler|
| Version|3.0 ($Rev$)|
| Date|$Date$|
| Source|http://mptw.tiddlyspot.com/#SaveCloseTiddlerPlugin|
| Author|Simon Baird <simon.baird@gmail.com>|
| License|http://mptw.tiddlyspot.com/#TheBSDLicense|
To use these you must add them to the tool bar in your EditTemplate
***/
//{{{
merge(config.commands,{

	saveCloseTiddler: {
		text: 'done/close',
		tooltip: 'Save changes to this tiddler and close it',
		handler: function(e,src,title) {
			config.commands.saveTiddler.handler(e,src,title);
			config.commands.closeTiddler.handler(e,src,title);
			return false;
		}
	},

	cancelCloseTiddler: {
		text: 'cancel/close',
		tooltip: 'Undo changes to this tiddler and close it',
		handler: function(e,src,title) {
			config.commands.cancelTiddler.handler(e,src,title);
			config.commands.closeTiddler.handler(e,src,title);
			return false;
		}
	}

});

//}}}

