
// to use these you must add them to the tool bar in EditTemplate

merge(config.commands,{

	saveCloseTiddler: {
		text: 'done/close',
		tooltip: 'Undo changes to this tiddler and close it',
		handler: function(e,src,title) {
			config.commands.saveTiddler.handler(e,src,title);
			config.commands.closeTiddler.handler(e,src,title);
			return false;
		}
	},

	cancelCloseTiddler: {
		text: 'cancel/close',
		tooltip: 'Save changes to this tiddler and close it',
		handler: function(e,src,title) {
			config.commands.cancelTiddler.handler(e,src,title);
			config.commands.closeTiddler.handler(e,src,title);
			return false;
		}
	}

});

